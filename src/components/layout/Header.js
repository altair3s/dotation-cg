import React from 'react';
import { RotateCcw, Download } from 'lucide-react';

const Header = ({ title, subtitle, onRefresh, loading, onExport, data }) => (
  <div style={{ 
    background: 'white', 
    borderRadius: '16px',
    padding: '24px 32px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h1 style={{ 
          fontSize: '2rem', fontWeight: '700', color: '#1F2937', margin: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: '#6B7280', margin: '4px 0 0 0', fontSize: '0.95rem', fontWeight: '500' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Bouton Export Excel */}
        <button 
          onClick={() => onExport(data)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 20px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600',
            boxShadow: '0 4px 16px rgba(5, 150, 105, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 6px 20px rgba(5, 150, 105, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 16px rgba(5, 150, 105, 0.3)';
          }}
        >
          <Download size={16} />
          <span>Export Excel</span>
        </button>

        <button 
          onClick={onRefresh} 
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 20px', borderRadius: '12px', border: '1px solid #D1D5DB',
            background: 'white', color: '#374151', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: '600',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#F9FAFB';
            e.target.style.borderColor = '#9CA3AF';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
            e.target.style.borderColor = '#D1D5DB';
          }}
        >
          <RotateCcw size={16} style={{ 
            animation: loading ? 'spin 1s linear infinite' : 'none' 
          }} />
          <span>Actualiser</span>
        </button>
      </div>
    </div>
  </div>
);

export default Header;