import React, { useState } from 'react';
import { Package, AlertTriangle, Building2, User } from 'lucide-react';

// Hooks
import { useAuth, AuthProvider } from './hooks/useAuth';
import { useGoogleSheets } from './hooks/useGoogleSheets';

// Utils
import { exportToExcel } from './utils/exportToExcel';

// Components Auth
import LoginScreen from './components/auth/LoginScreen';

// Components Layout
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ConnectionStatus from './components/common/ConnectionStatus';

// Components Dashboard
import StatsCard from './components/dashboard/StatsCard';
import SiteCard from './components/dashboard/SiteCard';
import RecentDistributions from './components/dashboard/RecentDistributions';

// Components Métier
import SitesMap from './components/map/SitesMap';
import ReceptionsScreen from './components/receptions/ReceptionsScreen';

// Google Sheets Integration (à garder temporairement)
import GoogleSheetsIntegration from './GoogleSheetsIntegration';
import './App.css';

// Composant principal avec design premium
function App() {
  const { user, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSites, setExpandedSites] = useState(new Set());
  
  const { data, loading, error, connected, refresh, addDistribution, addStock } = useGoogleSheets();

  const toggleSiteExpansion = (siteName) => {
    const newExpanded = new Set(expandedSites);
    if (newExpanded.has(siteName)) {
      newExpanded.delete(siteName);
    } else {
      newExpanded.add(siteName);
    }
    setExpandedSites(newExpanded);
  };

  const handleExport = (data) => {
    if (!data || !data.sites) {
      alert('Aucune donnée à exporter');
      return;
    }
    exportToExcel(data, 'dashboard-cg-export');
  };

  // Vérifications d'authentification
  if (authLoading) {
    return (
      <div style={{ 
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px'
        }}>
          <div style={{
            width: '60px', height: '60px',
            border: '4px solid rgba(255, 255, 255, 0.3)', 
            borderTop: '4px solid white',
            borderRadius: '50%', animation: 'spin 1s linear infinite'
          }} />
          <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>
            Vérification de l'authentification...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Écran de chargement des données
  if (loading) {
    return (
      <div style={{ 
        height: '100vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{
          width: '60px', height: '60px',
          border: '4px solid rgba(255, 255, 255, 0.3)', 
          borderTop: '4px solid white',
          borderRadius: '50%', animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '24px', fontSize: '1.1rem', fontWeight: '600' }}>
          Connexion à la base de données...
        </p>
      </div>
    );
  }
  
  // Écran d'erreur
  if (error || !connected) {
    return (
      <div style={{ 
        height: '100vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <AlertTriangle size={64} style={{ color: '#DC2626', marginBottom: '24px' }} />
          <h2 style={{ 
            fontSize: '2rem', fontWeight: '700', color: '#991B1B', marginBottom: '16px'
          }}>
            Connexion impossible
          </h2>
          <p style={{ color: '#7F1D1D', marginBottom: '32px', fontSize: '1.1rem' }}>
            {error || 'Vérifiez votre configuration'}
          </p>
          <button 
            onClick={refresh}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto',
              padding: '12px 24px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
              color: 'white', cursor: 'pointer', fontSize: '1rem', fontWeight: '600',
              boxShadow: '0 4px 16px rgba(220, 38, 38, 0.3)'
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Vérification des données
  if (!data || !data.sites || data.sites.length === 0) {
    return (
      <div style={{ 
        height: '100vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)'
      }}>
        <Package size={64} style={{ color: '#9CA3AF', marginBottom: '24px' }} />
        <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#374151', marginBottom: '16px' }}>
          Aucune donnée
        </h2>
        <p style={{ color: '#6B7280', marginBottom: '32px', textAlign: 'center', maxWidth: '400px' }}>
          Vérifiez que votre Google Sheet contient des données
        </p>
        <ConnectionStatus connected={connected} error={null} />
        <button 
          onClick={refresh}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', cursor: 'pointer', fontSize: '1rem', fontWeight: '600',
            marginTop: '16px'
          }}
        >
          Recharger
        </button>
      </div>
    );
  }

  // Calcul des statistiques
  const totalStock = data.sites.reduce((acc, site) => acc + (site.stock || 0), 0);
  const totalEmployes = data.sites.reduce((acc, site) => 
    acc + site.filiales.reduce((acc2, f) => acc2 + (f.employes || 0), 0), 0);
  const alertSites = data.sites.filter(site => site.status === 'critical' || site.status === 'warning').length;
  const totalFiliales = data.sites.reduce((acc, site) => acc + site.filiales.length, 0);
  const totalDistributions = data.distributions ? data.distributions.length : 0;

  // Fonction pour obtenir le contenu des pages
  const getPageContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ConnectionStatus connected={connected} error={null} />

            {/* Stats Cards avec animation */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px'
            }}>
              {[
                { title: "Stock Total", value: totalStock.toLocaleString(), subtitle: "Toutes filiales", icon: Package, color: "blue" },
                { title: "Sites Actifs", value: data.sites.length, subtitle: `${totalFiliales} filiales`, icon: Building2, color: "green" },
                { title: "Employés", value: totalEmployes.toLocaleString(), subtitle: "Tous sites", icon: User, color: "purple" },
                { title: "Alertes", value: alertSites, subtitle: "Sites critiques", icon: AlertTriangle, color: "red" }
              ].map((card, index) => (
                <div
                  key={card.title}
                  style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
                >
                  <StatsCard {...card} />
                </div>
              ))}
            </div>

            {/* Vue d'ensemble et distributions */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              {/* Vue d'ensemble des sites */}
              <div style={{ 
                background: 'white', borderRadius: '16px', 
                border: '1px solid #E5E7EB', 
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ 
                  padding: '24px', borderBottom: '1px solid #E5E7EB',
                  background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ 
                      fontSize: '1.25rem', fontWeight: '700', color: '#1F2937', margin: 0,
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      <Building2 size={20} style={{ color: '#667eea' }} />
                      Vue d'ensemble des sites
                    </h3>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px', 
                      fontSize: '0.875rem', color: '#6B7280' 
                    }}>
                      <span>Mis à jour: {data.lastUpdate ? data.lastUpdate.toLocaleTimeString() : '--:--'}</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {data.sites.map((site) => (
                      <SiteCard
                        key={site.site}
                        site={site}
                        onExpand={toggleSiteExpansion}
                        expanded={expandedSites.has(site.site)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar avec distributions et résumé */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <RecentDistributions distributions={data.distributions || []} />
                
                {/* Résumé */}
                <div style={{ 
                  background: 'white', borderRadius: '16px', 
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ 
                    padding: '20px', borderBottom: '1px solid #E5E7EB',
                    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
                  }}>
                    <h3 style={{ 
                      fontSize: '1.1rem', fontWeight: '700', color: '#1F2937', margin: 0
                    }}>
                      Résumé
                    </h3>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#6B7280', fontWeight: '500' }}>Distributions totales:</span>
                        <span style={{ fontWeight: '700', color: '#1F2937' }}>{totalDistributions}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#6B7280', fontWeight: '500' }}>Dernière maj:</span>
                        <span style={{ fontWeight: '700', color: '#1F2937' }}>
                          {data.lastUpdate ? data.lastUpdate.toLocaleDateString() : 'Non disponible'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#6B7280', fontWeight: '500' }}>Source:</span>
                        <span style={{ 
                          fontWeight: '700', color: '#059669',
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} />
                          Base de données
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Animations CSS */}
            <style jsx>{`
              @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes spin { 
                to { transform: rotate(360deg); } 
              }
            `}</style>
          </div>
        );

      case 'stock':
        return (
          <div style={{ 
            background: 'white', borderRadius: '16px', 
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ 
              padding: '24px', borderBottom: '1px solid #E5E7EB',
              background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', fontWeight: '700', color: '#1F2937', margin: 0
                }}>
                  Suivi des Stocks par Site et Filiale
                </h3>
                <ConnectionStatus connected={connected} error={null} />
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {data.sites.map((site) => (
                  <SiteCard
                    key={site.site}
                    site={site}
                    onExpand={toggleSiteExpansion}
                    expanded={expandedSites.has(site.site)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'sites':
        return <SitesMap sites={data.sites || []} />;

      case 'receptions':
        return <ReceptionsScreen data={data} />;

      default:
        return (
          <div style={{ 
            background: 'white', borderRadius: '16px', padding: '60px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
            textAlign: 'center'
          }}>
            <Package size={64} style={{ color: '#9CA3AF', marginBottom: '24px' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1F2937', marginBottom: '12px' }}>
              Section en développement
            </h3>
            <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
              Cette section sera disponible prochainement
            </p>
          </div>
        );
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', 
      overflow: 'hidden' 
    }}>
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        marginLeft: sidebarCollapsed ? '80px' : '280px',
        transition: 'margin-left 0.3s ease'
      }}>
        <div style={{ padding: '24px' }}>
          <Header
            title={
              activeSection === 'dashboard' ? 'Dashboard Principal' :
              activeSection === 'stock' ? 'Suivi des Stocks' :
              activeSection === 'sites' ? 'Sites & Filiales' :
              activeSection === 'receptions' ? 'Réceptions de Livraison' :
              'Dashboard'
            }
            subtitle={`Données temps réel • Dernière synchronisation: ${data?.lastUpdate ? data.lastUpdate.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long',
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
          }) : 'Non disponible'}`}
            onRefresh={refresh}
            loading={loading}
            onExport={handleExport}
            data={data}
          />
        </div>
        
        <div style={{ 
          flex: 1, 
          padding: '0 24px 24px', 
          overflowY: 'auto'
        }}>
          {getPageContent()}
        </div>
      </div>
    </div>
  );
}

// Wrapper avec AuthProvider
function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;