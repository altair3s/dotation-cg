// Utilitaire pour exporter en Excel
export const exportToExcel = (data, filename = 'export') => {
  // Créer les données pour l'export
  const { sites, distributions } = data;
  
  // Feuille 1: État des stocks
  const stockData = [];
  stockData.push(['Site', 'Région', 'Filiales', 'Employés', 'Stock Total', 'Statut', 'Distribués']);
  
  sites.forEach(site => {
    const totalEmployes = site.filiales.reduce((acc, f) => acc + f.employes, 0);
    const totalDistributions = site.filiales.reduce((acc, f) => acc + (f.distributions || 0), 0);
    const region = site.coordinates?.region || 'Non définie';
    
    stockData.push([
      site.site,
      region,
      site.filiales.length,
      totalEmployes,
      site.stock,
      site.status === 'critical' ? 'Critique' : site.status === 'warning' ? 'Attention' : 'OK',
      totalDistributions
    ]);
    
    // Détail des filiales
    site.filiales.forEach(filiale => {
      stockData.push([
        `  └ ${filiale.code}`,
        '',
        '',
        filiale.employes,
        filiale.stock,
        filiale.status === 'critical' ? 'Critique' : filiale.status === 'warning' ? 'Attention' : 'OK',
        filiale.distributions || 0
      ]);
    });
  });
  
  // Feuille 2: Distributions
  const distributionData = [];
  distributionData.push(['Date', 'Site', 'Filiale', 'Employé', 'Quantité', 'Statut']);
  
  if (distributions && distributions.length > 0) {
    distributions.forEach(dist => {
      distributionData.push([
        new Date(dist.date).toLocaleDateString('fr-FR'),
        dist.site || dist.localisation,
        dist.filiale,
        dist.employe,
        dist.quantite,
        'Distribué'
      ]);
    });
  }
  
  // Créer le contenu CSV (simulation Excel)
  const createCSV = (data) => {
    return data.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(',')
    ).join('\n');
  };
  
  // Créer les fichiers
  const stockCSV = createCSV(stockData);
  const distCSV = createCSV(distributionData);
  
  // Télécharger le fichier stocks
  const downloadCSV = (content, name) => {
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${name}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  
  // Télécharger les deux fichiers
  downloadCSV(stockCSV, `${filename}-stocks-${new Date().toISOString().split('T')[0]}`);
  
  // Petit délai pour éviter que les téléchargements se chevauchent
  setTimeout(() => {
    downloadCSV(distCSV, `${filename}-distributions-${new Date().toISOString().split('T')[0]}`);
  }, 100);
};