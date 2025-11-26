import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend = null, onClick }) => {
  const colors = {
    blue: { 
      bg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', 
      color: '#1D4ED8', 
      shadow: 'rgba(29, 78, 216, 0.2)',
      glow: 'rgba(29, 78, 216, 0.4)'
    },
    green: { 
      bg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', 
      color: '#059669', 
      shadow: 'rgba(5, 150, 105, 0.2)',
      glow: 'rgba(5, 150, 105, 0.4)'
    },
    purple: { 
      bg: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)', 
      color: '#7C3AED', 
      shadow: 'rgba(124, 58, 237, 0.2)',
      glow: 'rgba(124, 58, 237, 0.4)'
    },
    red: { 
      bg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)', 
      color: '#DC2626', 
      shadow: 'rgba(220, 38, 38, 0.2)',
      glow: 'rgba(220, 38, 38, 0.4)'
    }
  };

  const colorScheme = colors[color];

  return (
    <div 
      style={{
        background: colorScheme.bg,
        padding: '32px', 
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: `0 8px 32px ${colorScheme.shadow}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        e.currentTarget.style.boxShadow = `0 20px 60px ${colorScheme.glow}`;
        
        // Effet de brillance
        const shimmer = e.currentTarget.querySelector('.shimmer-effect');
        if (shimmer) shimmer.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = `0 8px 32px ${colorScheme.shadow}`;
        
        // Retirer effet de brillance
        const shimmer = e.currentTarget.querySelector('.shimmer-effect');
        if (shimmer) shimmer.style.opacity = '0';
      }}
    >
      {/* Effet de brillance au survol */}
      <div 
        className="shimmer-effect"
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
          transform: 'rotate(45deg)',
          opacity: '0',
          transition: 'opacity 0.6s ease',
          pointerEvents: 'none'
        }}
      />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '0.875rem', 
            fontWeight: '700', 
            color: '#6B7280', 
            margin: '0 0 12px 0', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
            opacity: '0.8'
          }}>
            {title}
          </p>
          <p style={{ 
            fontSize: '2.75rem', 
            fontWeight: '900', 
            color: '#1F2937', 
            margin: '0 0 8px 0', 
            lineHeight: 0.9,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ 
              fontSize: '0.9rem', 
              color: '#6B7280', 
              margin: 0, 
              fontWeight: '600'
            }}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              marginTop: '12px', 
              fontSize: '0.85rem', 
              color: colorScheme.color, 
              fontWeight: '700',
              background: 'rgba(255,255,255,0.7)',
              padding: '4px 12px',
              borderRadius: '20px',
              width: 'fit-content'
            }}>
              <TrendingUp size={14} />
              <span>+{trend}% ce mois</span>
            </div>
          )}
        </div>
        
        {/* Icône avec animation */}
        <div style={{ 
          background: `linear-gradient(135deg, ${colorScheme.color} 0%, ${colorScheme.color}dd 100%)`,
          padding: '20px', 
          borderRadius: '20px',
          boxShadow: `0 12px 32px ${colorScheme.shadow}`,
          position: 'relative',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'rotate(5deg) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'rotate(0deg) scale(1)';
        }}>
          <Icon size={36} style={{ 
            color: 'white', 
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;