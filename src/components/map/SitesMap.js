import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Building2, AlertTriangle, X } from 'lucide-react';

const SitesMap = ({ sites }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [hoveredSite, setHoveredSite] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Coordonnées complètes avec nouveaux sites
  const SITES_COORDINATES = {
    // Sites français
    'CDG': { name: 'Paris Charles de Gaulle', lat: 49.0097, lng: 2.5479, region: 'Île-de-France' },
    'ORLY': { name: 'Paris Orly', lat: 48.7262, lng: 2.3656, region: 'Île-de-France' },
    'TOULOUSE': { name: 'Toulouse Blagnac', lat: 43.6292, lng: 1.3638, region: 'Occitanie' },
    'LYON': { name: 'Lyon Saint-Exupéry', lat: 45.7256, lng: 5.0811, region: 'Auvergne-Rhône-Alpes' },
    'BORDEAUX': { name: 'Bordeaux Mérignac', lat: 44.8283, lng: -0.7156, region: 'Nouvelle-Aquitaine' },
    'MARSEILLE': { name: 'Marseille Provence', lat: 43.4364, lng: 5.2139, region: 'PACA' },
    'MONTPELLIER': { name: 'Montpellier Méditerranée', lat: 43.5765, lng: 3.9633, region: 'Occitanie' },
    'NANTES': { name: 'Nantes Atlantique', lat: 47.1569, lng: -1.6073, region: 'Pays de la Loire' },
    'NICE': { name: 'Nice Côte d\'Azur', lat: 43.6584, lng: 7.2159, region: 'PACA' },
    'BEAUVAIS': { name: 'Paris Beauvais', lat: 49.4544, lng: 2.1128, region: 'Hauts-de-France' },
    'BREST': { name: 'Brest Bretagne', lat: 48.4478, lng: -4.4186, region: 'Bretagne' },
    'CHATEAUROUX': { name: 'Châteauroux Centre', lat: 46.8622, lng: 1.7186, region: 'Centre-Val de Loire' },
    'LILLE': { name: 'Lille Lesquin', lat: 50.5703, lng: 3.0948, region: 'Hauts-de-France' },
    'RAMONVILLE SAINT AGNE': { name: 'Ramonville Saint-Agne', lat: 43.5458, lng: 1.4736, region: 'Occitanie' },
    
    // Sites européens
    'BRUXELLES': { name: 'Bruxelles-National', lat: 50.9010, lng: 4.4844, region: 'Bruxelles-Capitale, Belgique' },
    'BILBAO': { name: 'Bilbao Airport', lat: 43.3011, lng: -2.9106, region: 'Pays Basque, Espagne' },
    'MALAGA': { name: 'Málaga-Costa del Sol', lat: 36.6749, lng: -4.4991, region: 'Andalousie, Espagne' },
    'SEVILLE': { name: 'Sevilla Airport', lat: 37.4180, lng: -5.8931, region: 'Andalousie, Espagne' }
  };

  // Enrichir les sites avec les coordonnées
  const sitesWithCoordinates = sites.map(site => ({
    ...site,
    coordinates: SITES_COORDINATES[site.site] || {
      name: site.site, lat: 46.603354, lng: 1.888334, region: 'Inconnu'
    }
  })).filter(site => site.coordinates.lat && site.coordinates.lng);

  // Statistiques globales
  const globalStats = {
    totalEmployes: sitesWithCoordinates.reduce((acc, site) => 
      acc + site.filiales.reduce((acc2, f) => acc2 + f.employes, 0), 0),
    totalStock: sitesWithCoordinates.reduce((acc, site) => acc + site.stock, 0),
    totalFiliales: sitesWithCoordinates.reduce((acc, site) => acc + site.filiales.length, 0),
    sitesEnAlerte: sitesWithCoordinates.filter(site => site.status !== 'good').length
  };

  // Chargement de Leaflet
  useEffect(() => {
    const loadLeaflet = () => {
      if (window.L) {
        setLeafletLoaded(true);
        return;
      }

      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      cssLink.crossOrigin = '';
      document.head.appendChild(cssLink);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => setLeafletLoaded(true);
      document.head.appendChild(script);
    };
    loadLeaflet();
  }, []);

  // Initialisation de la carte
  useEffect(() => {
    if (!leafletLoaded || !window.L || mapInstanceRef.current || !sitesWithCoordinates.length) return;

    try {
      const mapElement = document.getElementById('working-map');
      if (!mapElement) return;

      const map = window.L.map('working-map', {
        center: [46.603354, 2.888334],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true
      });

      const tileLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      });

      tileLayer.addTo(map);
      tileLayer.on('load', () => setMapReady(true));

      // Créer les marqueurs avec couleurs améliorées
      sitesWithCoordinates.forEach(site => {
        const totalEmployes = site.filiales.reduce((acc, f) => acc + f.employes, 0);
        const totalDistributions = site.filiales.reduce((acc, f) => acc + (f.distributions || 0), 0);
        const color = site.status === 'critical' ? '#EF4444' : 
                     site.status === 'warning' ? '#F59E0B' : '#10B981';

        const marker = window.L.marker([site.coordinates.lat, site.coordinates.lng], {
          title: site.coordinates.name
        }).addTo(map);

        const popupContent = `
          <div style="min-width: 260px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.15);">
            <!-- Header avec gradient -->
            <div style="padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center;">
              <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">${site.coordinates.name}</h3>
              <p style="margin: 0; font-size: 12px; opacity: 0.9;">${site.coordinates.region}</p>
            </div>
            
            <!-- Contenu avec fond blanc -->
            <div style="padding: 16px; background: white;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                <div style="text-align: center; padding: 12px; background: linear-gradient(135deg, ${color}15 0%, ${color}25 100%); border-radius: 8px; border: 1px solid ${color}30;">
                  <div style="font-weight: 600; color: ${color}; font-size: 16px;">${site.filiales.length}</div>
                  <div style="font-size: 10px; color: #64748B; font-weight: 500; margin-top: 2px;">Filiales</div>
                </div>
                <div style="text-align: center; padding: 12px; background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); border-radius: 8px; border: 1px solid #E2E8F0;">
                  <div style="font-weight: 600; color: #475569; font-size: 16px;">${totalEmployes.toLocaleString()}</div>
                  <div style="font-size: 10px; color: #64748B; font-weight: 500; margin-top: 2px;">Employés</div>
                </div>
                <div style="text-align: center; padding: 12px; background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); border-radius: 8px; border: 1px solid #E2E8F0;">
                  <div style="font-weight: 600; color: #475569; font-size: 16px;">${site.stock.toLocaleString()}</div>
                  <div style="font-size: 10px; color: #64748B; font-weight: 500; margin-top: 2px;">Stock</div>
                </div>
                <div style="text-align: center; padding: 12px; background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border-radius: 8px; border: 1px solid #BBF7D0;">
                  <div style="font-weight: 600; color: #059669; font-size: 16px;">${totalDistributions}</div>
                  <div style="font-size: 10px; color: #065F46; font-weight: 500; margin-top: 2px;">Distribués</div>
                </div>
              </div>

              ${totalDistributions > 0 ? `
              <div style="margin-bottom: 12px; padding: 12px; background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border-radius: 8px; border-left: 3px solid #0EA5E9;">
                <div style="font-size: 11px; color: #0F172A; font-weight: 600; margin-bottom: 4px;">📊 Performance Distribution</div>
                <div style="font-size: 14px; color: #0F172A; font-weight: 700;">
                  ${totalEmployes > 0 ? Math.round((totalDistributions / totalEmployes) * 100) : 0}% 
                  <span style="color: #64748B; font-weight: 400; font-size: 12px;">(${totalDistributions}/${totalEmployes})</span>
                </div>
              </div>
              ` : ''}

              <button 
                onclick="window.openSiteModal && window.openSiteModal('${site.site}')"
                style="
                  width: 100%; 
                  padding: 12px 16px; 
                  background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); 
                  color: white; 
                  border: none; 
                  border-radius: 8px; 
                  font-size: 12px; 
                  cursor: pointer;
                  font-weight: 600;
                  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                  transition: all 0.2s ease;
                "
                onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(59, 130, 246, 0.4)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.3)';"
              >
                📋 Voir les détails complets
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup-premium'
        });
      });

      window.openSiteModal = (siteCode) => {
        const site = sitesWithCoordinates.find(s => s.site === siteCode);
        if (site) setSelectedSite(site);
      };

      mapInstanceRef.current = map;
      setTimeout(() => {
        map.invalidateSize();
        setMapReady(true);
      }, 500);

    } catch (error) {
      console.error('❌ Erreur initialisation carte:', error);
    }
  }, [leafletLoaded, sitesWithCoordinates.length]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', minHeight: '600px' }}>
      {/* En-tête avec gradient et design amélioré */}
      <div style={{ 
        gridColumn: '1 / -1', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: '16px', 
        padding: '24px', 
        color: 'white',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.2)', 
            padding: '8px', 
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <MapPin style={{ color: 'white' }} size={24} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
            Cartographie Internationale
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} />
            <span>{sitesWithCoordinates.length} sites actifs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#F59E0B', borderRadius: '50%', boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)' }} />
            <span>{globalStats.totalFiliales} filiales</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#3B82F6', borderRadius: '50%', boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)' }} />
            <span>{globalStats.totalEmployes.toLocaleString()} employés</span>
          </div>
          {globalStats.sitesEnAlerte > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#FEF2F2' }}>
              <AlertTriangle size={16} />
              <span>{globalStats.sitesEnAlerte} alertes</span>
            </div>
          )}
        </div>
      </div>

      {/* Carte avec design amélioré */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        border: '1px solid #E5E7EB', 
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', 
        overflow: 'hidden', 
        position: 'relative' 
      }}>
        <div 
          id="working-map" 
          style={{ 
            width: '100%', 
            height: '900px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
          }}
        />
        
        {!mapReady && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(255, 255, 255, 0.95)', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              width: '48px', height: '48px',
              border: '4px solid #E5E7EB', borderTop: '4px solid #3B82F6',
              borderRadius: '50%', animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: '16px', color: '#6B7280', fontSize: '14px', fontWeight: '500' }}>
              {leafletLoaded ? 'Initialisation carte...' : 'Chargement Leaflet...'}
            </p>
          </div>
        )}

        {mapReady && (
          <div style={{
            position: 'absolute', bottom: '16px', left: '16px',
            background: 'rgba(255, 255, 255, 0.95)', padding: '16px',
            borderRadius: '12px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            fontSize: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>État des stocks</div>
            {[
              { color: '#10B981', label: 'Stock optimal', shadow: 'rgba(16, 185, 129, 0.3)' },
              { color: '#F59E0B', label: 'Attention requise', shadow: 'rgba(245, 158, 11, 0.3)' },
              { color: '#EF4444', label: 'Stock critique', shadow: 'rgba(239, 68, 68, 0.3)' }
            ].map(({ color, label, shadow }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ 
                  width: '12px', height: '12px', backgroundColor: color, borderRadius: '50%',
                  border: '2px solid white', boxShadow: `0 2px 8px ${shadow}`
                }} />
                <span style={{ color: '#374151', fontWeight: '500' }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        <style jsx>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          .custom-popup-premium .leaflet-popup-content-wrapper {
            border-radius: 12px !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
            border: none !important;
            padding: 0 !important;
          }
          .custom-popup-premium .leaflet-popup-tip {
            border-top-color: white !important;
          }
        `}</style>
      </div>

      {/* Sidebar avec design premium */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        border: '1px solid #E5E7EB', 
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          padding: '20px', 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: '#1F2937', 
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', 
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} style={{ color: '#667eea' }} />
            Sites par Région
          </div>
        </div>
        <div style={{ height: '800px', overflowY: 'auto', padding: '12px' }}>
          {sitesWithCoordinates
            .sort((a, b) => b.filiales.length - a.filiales.length)
            .map((site) => {
              const totalEmployes = site.filiales.reduce((acc, f) => acc + f.employes, 0);
              const totalDistributions = site.filiales.reduce((acc, f) => acc + (f.distributions || 0), 0);
              const isSelected = selectedSite?.site === site.site;
              const statusColor = site.status === 'critical' ? '#EF4444' : 
                                site.status === 'warning' ? '#F59E0B' : '#10B981';
              
              return (
                <div 
                  key={site.site}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    marginBottom: '8px',
                    border: isSelected ? '2px solid #667eea' : '1px solid transparent',
                    background: isSelected ? 
                      'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' : 
                      'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
                    borderLeft: `4px solid ${statusColor}`,
                    boxShadow: isSelected ? '0 8px 24px rgba(102, 126, 234, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                  onClick={() => {
                    setSelectedSite(site);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setView([site.coordinates.lat, site.coordinates.lng], 8);
                    }
                  }}
                  onMouseEnter={() => setHoveredSite(site.site)}
                  onMouseLeave={() => setHoveredSite(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1F2937' }}>
                      {site.coordinates.name}
                    </div>
                    <div style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}50`
                    }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '12px', fontWeight: '500' }}>
                    {site.coordinates.region}
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr 1fr', 
                    gap: '8px', 
                    fontSize: '0.75rem', 
                    marginBottom: '8px'
                  }}>
                    <div style={{ textAlign: 'center', color: '#374151', fontWeight: '600' }}>
                      <div>{site.filiales.length}</div>
                      <div style={{ color: '#9CA3AF', fontSize: '0.7rem' }}>filiales</div>
                    </div>
                    <div style={{ textAlign: 'center', color: '#374151', fontWeight: '600' }}>
                      <div>{totalEmployes}</div>
                      <div style={{ color: '#9CA3AF', fontSize: '0.7rem' }}>employés</div>
                    </div>
                    <div style={{ textAlign: 'center', color: '#374151', fontWeight: '600' }}>
                      <div>{site.stock}</div>
                      <div style={{ color: '#9CA3AF', fontSize: '0.7rem' }}>stock</div>
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#059669',
                    fontWeight: '600',
                    textAlign: 'center',
                    padding: '6px 8px',
                    background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                    borderRadius: '6px',
                    border: '1px solid #BBF7D0'
                  }}>
                    📦 {totalDistributions} distribués
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Modal avec design premium */}
      {selectedSite && (
        <div 
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0, 0, 0, 0.6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSelectedSite(null)}
        >
          <div 
            style={{
              background: 'white', borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '900px', width: '90%', maxHeight: '90%', overflow: 'hidden',
              display: 'flex', flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header modal avec gradient */}
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '8px', borderRadius: '12px' }}>
                  <MapPin style={{ color: 'white' }} size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>
                    {selectedSite.coordinates.name}
                  </h3>
                  <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.9 }}>
                    {selectedSite.coordinates.region}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSite(null)}
                style={{ 
                  padding: '8px', borderRadius: '12px', border: 'none', 
                  background: 'rgba(255, 255, 255, 0.2)', color: 'white', cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu modal */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <p>Contenu détaillé du site ici...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SitesMap;