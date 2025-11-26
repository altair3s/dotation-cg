// GoogleSheetsIntegration.js
// Version finale - Chargement séquentiel pour éviter l'erreur 400

class GoogleSheetsIntegration {
  constructor() {
    this.spreadsheetId = process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID;
    this.apiKey = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY;
    this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    this.cache = new Map();
    this.cacheTimeout = 2 * 60 * 1000;
  }

  // Ranges alternatifs pour différentes variantes de noms d'onglets
  static RANGES_ALTERNATIVES = {
    STOCK: ['Stock!A:G'],
    DISTRIBUTIONS: ['Distributions!A:K'],
    ENTREES: ['Entrées!A:H', 'Entrees!A:H', 'Entree!A:H', 'Entries!A:H'],
    EMPLOYES: ['Employés!A:K', 'Employes!A:K', 'Employees!A:K', 'Staff!A:K'],
    PRODUITS: ['Produits!A:F', 'Products!A:F', 'Produit!A:F'],
    UTILISATEURS: ['Utilisateurs!A:C', 'Users!A:C', 'Utilisateur!A:C']
  };

  async detectSheetNames() {
    try {
      const metadataUrl = `${this.baseUrl}/${this.spreadsheetId}`;
      const response = await fetch(`${metadataUrl}?key=${this.apiKey}&fields=sheets.properties.title`);
      
      if (!response.ok) {
        throw new Error(`Erreur métadonnées: ${response.status}`);
      }

      const metadata = await response.json();
      const sheetNames = metadata.sheets.map(sheet => sheet.properties.title);
      
      console.log('🔍 Onglets détectés dans votre Google Sheet:', sheetNames);
      return sheetNames;
    } catch (error) {
      console.error('Erreur lors de la détection des onglets:', error);
      return [];
    }
  }

  findBestRange(category, availableSheets) {
    const alternatives = GoogleSheetsIntegration.RANGES_ALTERNATIVES[category];
    
    for (const range of alternatives) {
      const sheetName = range.split('!')[0];
      if (availableSheets.includes(sheetName)) {
        console.log(`✅ Trouvé onglet "${sheetName}" pour ${category}`);
        return range;
      }
    }
    
    console.log(`❌ Aucun onglet trouvé pour ${category}. Onglets disponibles:`, availableSheets);
    return null;
  }

  // Nouvelle méthode : charger un range à la fois
  async loadSingleRange(range, category) {
    try {
      console.log(`📥 Chargement ${category} (${range})...`);
      
      const url = `${this.baseUrl}/${this.spreadsheetId}/values/${range}`;
      const params = new URLSearchParams({
        key: this.apiKey,
        majorDimension: 'ROWS',
        valueRenderOption: 'UNFORMATTED_VALUE',
        dateTimeRenderOption: 'FORMATTED_STRING'
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur pour ${category}:`, errorText);
        return null;
      }

      const data = await response.json();
      console.log(`✅ ${category} chargé:`, data.values ? data.values.length + ' lignes' : 'pas de données');
      
      return data.values || [];
    } catch (error) {
      console.error(`❌ Erreur chargement ${category}:`, error);
      return null;
    }
  }

  async getAllData() {
    const cacheKey = 'realData';
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log('📋 Utilisation du cache');
      return cached.data;
    }

    try {
      console.log('🚀 Début du chargement des données...');
      
      // Détecter les onglets disponibles
      const availableSheets = await this.detectSheetNames();
      
      if (availableSheets.length === 0) {
        throw new Error('Impossible de détecter les onglets de votre Google Sheet');
      }

      // Charger chaque onglet individuellement
      const dataByCategory = {};
      
      for (const [category, _] of Object.entries(GoogleSheetsIntegration.RANGES_ALTERNATIVES)) {
        const bestRange = this.findBestRange(category, availableSheets);
        if (bestRange) {
          const values = await this.loadSingleRange(bestRange, category);
          dataByCategory[category] = values;
          
          // Petite pause pour éviter le rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log('⚙️ Traitement des données...');
      const processedData = await this.processRealData(dataByCategory);
      
      // Mise en cache
      this.cache.set(cacheKey, {
        data: processedData,
        timestamp: Date.now()
      });

      console.log('✅ Données Google Sheets chargées avec succès');
      return processedData;
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données Google Sheets:', error);
      throw error;
    }
  }

  async processRealData(dataByCategory) {
    console.log('⚙️ Traitement des données...');

    // Traiter chaque type de données
    const employesData = this.processEmployesData(dataByCategory.EMPLOYES || []);
    const stockData = this.processStockData(dataByCategory.STOCK || []);
    const distributionsData = this.processDistributionsData(dataByCategory.DISTRIBUTIONS || []);
    const entreesData = this.processEntreesData(dataByCategory.ENTREES || []);
    const produitsData = this.processProduitsData(dataByCategory.PRODUITS || []);
    const utilisateursData = this.processUtilisateursData(dataByCategory.UTILISATEURS || []);
    
    // Construire la structure sites avec filiales
    console.log('🏗️ Construction de la structure sites/filiales...');
    const sites = this.buildSitesStructure(stockData, employesData, distributionsData);

    const result = {
      sites,
      distributions: distributionsData,
      entrees: entreesData,
      employes: employesData,
      produits: produitsData,
      utilisateurs: utilisateursData,
      lastUpdate: new Date(),
      summary: {
        totalSites: sites.length,
        totalEmployes: Object.values(employesData).reduce((acc, site) => 
          acc + Object.values(site).reduce((acc2, filiale) => acc2 + filiale.length, 0), 0),
        totalDistributions: distributionsData.length,
        totalStock: stockData.reduce((acc, s) => acc + (s.stockReel || 0), 0)
      }
    };

    console.log('📊 Résumé des données:', result.summary);
    return result;
  }

  processEmployesData(rows) {
    if (!rows || rows.length === 0) {
      console.log('⚠️ Aucune donnée employés');
      return {};
    }
    
    console.log(`👥 Traitement de ${rows.length} employés...`);
    const headers = rows[0];
    console.log('📋 En-têtes employés:', headers);
    
    const employes = rows.slice(1).map((row) => ({
      numeroEmploye: row[0] || '',
      badge: row[1] || '',
      nom: row[2] || '',
      nomNaissance: row[3] || '',
      nomMarital: row[4] || '',
      prenom: row[5] || '',
      contrat: row[6] || '',
      dateAnciennete: this.parseDate(row[7]),
      dateEntree: this.parseDate(row[8]),
      filiale: row[9] || '',
      localisation: row[10] || ''
    })).filter(emp => emp.nom && emp.localisation && emp.filiale);

    // Grouper par site et filiale
    const groupedByFiliale = {};
    
    employes.forEach(emp => {
      const site = emp.localisation;
      const filiale = emp.filiale;
      
      if (!groupedByFiliale[site]) {
        groupedByFiliale[site] = {};
      }
      
      if (!groupedByFiliale[site][filiale]) {
        groupedByFiliale[site][filiale] = [];
      }
      
      groupedByFiliale[site][filiale].push(emp);
    });

    console.log(`✅ Employés traités: ${employes.length}, Sites: ${Object.keys(groupedByFiliale).length}`);
    return groupedByFiliale;
  }

  processStockData(rows) {
    if (!rows || rows.length === 0) {
      console.log('⚠️ Aucune donnée stock');
      return [];
    }
    
    console.log(`📦 Traitement de ${rows.length} lignes de stock...`);
    const headers = rows[0];
    console.log('📋 En-têtes stock:', headers);
    
    const stockData = rows.slice(1).map((row) => ({
      id: row[0] || null,
      user: row[1] || null,
      localisation: row[2] || '',
      produit: row[3] || '',
      stockInitial: parseFloat(row[4]) || 0,
      niveauReapro: parseFloat(row[5]) || 50,
      stockReel: parseFloat(row[6]) || 0
    })).filter(item => item.localisation);

    console.log(`✅ Stock traité: ${stockData.length} sites`);
    return stockData;
  }

  processDistributionsData(rows) {
    if (!rows || rows.length === 0) {
      console.log('⚠️ Aucune donnée distributions');
      return [];
    }
    
    console.log(`🎁 Traitement de ${rows.length} distributions...`);
    const headers = rows[0];
    console.log('📋 En-têtes distributions:', headers);
    
    const distributions = rows.slice(1).map((row, index) => ({
      id: index + 1,
      date: this.parseDate(row[0]) || new Date(),
      localisation: row[1] || '',
      libelle: row[2] || '',
      quantite: parseInt(row[3]) || 0,
      nom: row[4] || '',
      prenom: row[5] || '',
      filiale: row[6] || '',
      contrat: row[7] || '',
      badge: row[8] || '',
      signature: row[9] || '',
      user: row[10] || '',
      employe: `${row[5]} ${row[4]}`.trim() || 'Employé inconnu'
    })).filter(item => item.localisation);

    console.log(`✅ Distributions traitées: ${distributions.length}`);
    return distributions;
  }

  processEntreesData(rows) {
    if (!rows || rows.length === 0) return [];
    
    return rows.slice(1).map((row, index) => ({
      id: index + 1,
      timestamp: this.parseDate(row[0]) || new Date(),
      user: row[1] || '',
      date: this.parseDate(row[2]) || new Date(),
      libelle: row[3] || '',
      localisation: row[4] || '',
      quantite: parseInt(row[5]) || 0,
      bl: row[6] || '',
      signature: row[7] || ''
    })).filter(item => item.localisation);
  }

  processProduitsData(rows) {
    if (!rows || rows.length === 0) return [];
    
    return rows.slice(1).map((row, index) => ({
      id: row[0] || index + 1,
      libelle: row[1] || '',
      image: row[2] || '',
      imageUrl: row[3] || '',
      stockInitial: parseInt(row[4]) || 0,
      niveauReapro: parseInt(row[5]) || 0
    })).filter(item => item.libelle);
  }

  processUtilisateursData(rows) {
    if (!rows || rows.length === 0) return [];
    
    return rows.slice(1).map((row, index) => ({
      id: row[0] || index + 1,
      user: row[1] || '',
      localisation: row[2] || ''
    })).filter(item => item.localisation);
  }

  buildSitesStructure(stockData, employesData, distributionsData) {
    const sites = [];

    // Obtenir tous les sites uniques
    const allSites = [...new Set([
      ...stockData.map(s => s.localisation),
      ...Object.keys(employesData)
    ])].filter(Boolean);

    console.log(`🏢 Sites détectés (${allSites.length}):`, allSites);

    allSites.forEach(siteName => {
      const siteStock = stockData.find(s => s.localisation === siteName);
      const siteEmployes = employesData[siteName] || {};
      const siteDistributions = distributionsData.filter(d => d.localisation === siteName);

      // Construire les filiales pour ce site
      const filiales = [];
      
      Object.keys(siteEmployes).forEach(filialeCode => {
        const employesDeLaFiliale = siteEmployes[filialeCode] || [];
        const distributionsDeLaFiliale = siteDistributions.filter(d => d.filiale === filialeCode);
        
        // Calculer le stock estimé pour cette filiale (proportionnel au nombre d'employés)
        const totalEmployesSite = Object.values(siteEmployes).flat().length;
        const stockProportionnel = siteStock && totalEmployesSite > 0 ? 
          Math.round((employesDeLaFiliale.length / totalEmployesSite) * siteStock.stockReel) : 0;

        const seuil = Math.max(5, Math.round(employesDeLaFiliale.length * 0.5));
        
        let status = 'good';
        if (stockProportionnel <= seuil) {
          status = stockProportionnel < seuil * 0.5 ? 'critical' : 'warning';
        }

        filiales.push({
          code: filialeCode,
          nom: filialeCode,
          employes: employesDeLaFiliale.length,
          stock: stockProportionnel,
          distributions: distributionsDeLaFiliale.length,
          status,
          seuil
        });
      });

      // Statut global du site
      const stockTotal = siteStock ? siteStock.stockReel : 0;
      const seuilSite = siteStock ? siteStock.niveauReapro : 50;
      
      let statusSite = 'good';
      if (stockTotal <= seuilSite) {
        statusSite = stockTotal < seuilSite * 0.5 ? 'critical' : 'warning';
      }

      sites.push({
        site: siteName,
        stock: stockTotal,
        seuil: seuilSite,
        status: statusSite,
        user: siteStock ? siteStock.user : null,
        filiales: filiales.sort((a, b) => b.employes - a.employes)
      });
    });

    const sortedSites = sites.sort((a, b) => b.stock - a.stock);
    console.log(`✅ Structure construite: ${sortedSites.length} sites avec ${sortedSites.reduce((acc, s) => acc + s.filiales.length, 0)} filiales`);
    
    return sortedSites;
  }

  parseDate(dateValue) {
    if (!dateValue) return null;
    
    if (dateValue instanceof Date) return dateValue;
    
    if (typeof dateValue === 'number') {
      if (dateValue > 25569) {
        return new Date((dateValue - 25569) * 86400 * 1000);
      }
      return new Date(dateValue);
    }
    
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    return null;
  }

  async addDistribution(distribution) {
    try {
      const availableSheets = await this.detectSheetNames();
      const distributionsRange = this.findBestRange('DISTRIBUTIONS', availableSheets);
      
      if (!distributionsRange) {
        throw new Error('Onglet Distributions non trouvé');
      }

      const range = distributionsRange.replace('!A:K', '!A:K');
      const values = [[
        new Date().toISOString(),
        distribution.site,
        distribution.libelle || 'Caisse CG 6 bouteilles',
        distribution.quantite,
        distribution.nom || '',
        distribution.prenom || '',
        distribution.filiale || '',
        distribution.contrat || '',
        distribution.badge || '',
        distribution.signature || '',
        distribution.user || ''
      ]];

      const url = `${this.baseUrl}/${this.spreadsheetId}/values/${range}:append`;
      const response = await fetch(`${url}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS'
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'ajout: ${response.status}`);
      }

      this.cache.clear();
      console.log('✅ Distribution ajoutée avec succès');
      
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout de distribution:', error);
      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache vidé');
  }

  async testConnection() {
    try {
      console.log('🔗 Test de connexion à Google Sheets...');
      console.log('📋 Spreadsheet ID:', this.spreadsheetId);
      console.log('🔑 API Key disponible:', !!this.apiKey);
      
      if (!this.spreadsheetId) {
        console.error('❌ Spreadsheet ID manquant');
        return false;
      }
      
      if (!this.apiKey) {
        console.error('❌ API Key manquante');
        return false;
      }
      
      const testUrl = `${this.baseUrl}/${this.spreadsheetId}`;
      const response = await fetch(`${testUrl}?key=${this.apiKey}&fields=properties.title`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Connexion réussie au Sheet:', data.properties?.title);
        return true;
      } else {
        console.error('❌ Échec de la connexion:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      return false;
    }
  }

  async getBLData() {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/BL!A:J?key=${this.apiKey}`
    );
    const data = await response.json();
    
    if (!data.values || data.values.length < 2) return [];
    
    const headers = data.values[0];
    return data.values.slice(1).map(row => {
      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = row[index] || '';
      });
      return entry;
    });
  } catch (error) {
    console.error('Erreur chargement BL:', error);
    return [];
  }
 }

  async getEntreesData() {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Entrées!A:J?key=${this.apiKey}`
    );
    const data = await response.json();
    
    if (!data.values || data.values.length < 2) return [];
    
    const headers = data.values[0];
    return data.values.slice(1).map(row => {
      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = row[index] || '';
      });
      return entry;
    });
  } catch (error) {
    console.error('Erreur chargement entrées:', error);
    return [];
  }
 }
}

export default GoogleSheetsIntegration;