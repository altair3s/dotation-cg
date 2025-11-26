import React from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, User, Package, Gift } from 'lucide-react';

const SiteCard = ({ site, onExpand, expanded }) => {
  const getStatusColor = () => {
    switch (site.status) {
      case 'critical': return { bg: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)', border: '#EF4444' };
      case 'warning': return { bg: 'linear-gradient(135deg, #FFFBEB 0%, #FED7AA 100%)', border: '#F59E0B' };
      default: return { bg: 'linear-gradient(135deg, #F0FDF4 0%, #BBF7D0 100%)', border: '#10B981' };
    }
  };

  const statusStyle = getStatusColor();
  const totalEmployes = site.filiales.reduce((acc, f) => acc + f.employes, 0);
  const alertFiliales = site.filiales.filter(f => f.status === 'critical' || f.status === 'warning').length;

  return (
    <div style={{
      background: statusStyle.bg,
      borderRadius: '16px',
      border: `2px solid ${statusStyle.border}30`,
      borderLeft: `6px solid ${statusStyle.border}`,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden', marginBottom: '16px',
      transition: 'all 0.3s ease'
    }}>
      <div 
        style={{ 
          padding: '20px', cursor: 'pointer',
          borderBottom: expanded ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'
        }}
        onClick={() => onExpand(site.site)}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: statusStyle.border,
              boxShadow: `0 0 16px ${statusStyle.border}50`
            }} />
            <div>
              <h3 style={{ 
                fontSize: '1.25rem', fontWeight: '700', color: '#1F2937', margin: '0 0 4px 0'
              }}>
                {site.site}
              </h3>
              <p style={{ 
                fontSize: '0.875rem', color: '#6B7280', margin: 0, fontWeight: '500'
              }}>
                {site.filiales.length} filiales • {totalEmployes.toLocaleString()} employés
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ 
                fontSize: '1.5rem', fontWeight: '700', color: '#1F2937', margin: '0 0 2px 0'
              }}>
                {site.stock.toLocaleString()}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>unités</p>
            </div>
            {alertFiliales > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px', borderRadius: '20px',
                background: '#EF4444', color: 'white',
                fontSize: '0.75rem', fontWeight: '600'
              }}>
                <AlertTriangle size={14} />
                <span>{alertFiliales}</span>
              </div>
            )}
            <div style={{ color: '#6B7280' }}>
              {expanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.5)' }}>
          <h4 style={{ 
            fontSize: '1rem', fontWeight: '600', color: '#1F2937', marginBottom: '16px'
          }}>
            Filiales du site
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '12px' 
          }}>
            {site.filiales.map((filiale, index) => {
              const filialeStatusStyle = getStatusColor();
              return (
                <div 
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '16px', borderRadius: '12px',
                    border: `1px solid ${filialeStatusStyle.border}30`,
                    borderLeft: `4px solid ${filialeStatusStyle.border}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h5 style={{ 
                        fontSize: '0.95rem', fontWeight: '600', color: '#1F2937', margin: '0 0 4px 0'
                      }}>
                        {filiale.code}
                      </h5>
                      <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0 0 8px 0' }}>
                        {filiale.nom}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>
                        {filiale.employes} employés
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ 
                        fontSize: '1.1rem', fontWeight: '700', color: '#1F2937', margin: '0 0 2px 0'
                      }}>
                        {filiale.stock}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0 0 4px 0' }}>
                        {filiale.distributions || 0} dist.
                      </p>
                      {filiale.status !== 'good' && (
                        <div style={{
                          padding: '2px 8px', borderRadius: '12px',
                          background: filiale.status === 'critical' ? '#EF4444' : '#F59E0B',
                          color: 'white', fontSize: '0.7rem', fontWeight: '600'
                        }}>
                          {filiale.status === 'critical' ? 'Critique' : 'Attention'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ 
                    height: '6px', background: '#E5E7EB', borderRadius: '3px', 
                    overflow: 'hidden', marginTop: '12px' 
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min((filiale.stock / (filiale.seuil * 2)) * 100, 100)}%`,
                      background: `linear-gradient(90deg, ${filialeStatusStyle.border} 0%, ${filialeStatusStyle.border}CC 100%)`,
                      borderRadius: '3px', transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteCard;