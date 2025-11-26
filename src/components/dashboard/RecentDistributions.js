import React from 'react';
import { Gift, Eye } from 'lucide-react';

const RecentDistributions = ({ distributions }) => (
  <div style={{ 
    background: 'white', borderRadius: '16px', 
    border: '1px solid #E5E7EB', 
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden'
  }}>
    <div style={{ 
      padding: '20px', 
      borderBottom: '1px solid #E5E7EB',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ 
          fontSize: '1.1rem', fontWeight: '700', color: '#1F2937', margin: 0,
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <Gift size={18} style={{ color: '#667eea' }} />
          Distributions Récentes
        </h3>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '6px 12px', borderRadius: '8px', border: '1px solid #D1D5DB',
          background: 'white', color: '#374151', cursor: 'pointer',
          fontSize: '0.75rem', fontWeight: '500'
        }}>
          <Eye size={12} />
          Voir tout
        </button>
      </div>
    </div>
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {distributions.slice(0, 5).map((dist) => (
          <div key={dist.id} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '0.75rem', fontWeight: '600'
            }}>
              {dist.employe.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ 
                fontSize: '0.875rem', fontWeight: '600', color: '#1F2937', margin: '0 0 2px 0'
              }}>
                {dist.employe}
              </p>
              <p style={{ 
                fontSize: '0.75rem', color: '#6B7280', margin: 0
              }}>
                {dist.site} • {dist.filiale} • {new Date(dist.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div style={{
              padding: '4px 12px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white', fontSize: '0.75rem', fontWeight: '600'
            }}>
              {dist.quantite}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default RecentDistributions;