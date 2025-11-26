import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const ConnectionStatus = ({ connected, error }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px',
    padding: '12px 16px',
    background: connected ? 
      'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' : 
      'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
    borderRadius: '12px',
    border: `1px solid ${connected ? '#BBF7D0' : '#FECACA'}`,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
  }}>
    {connected ? (
      <>
        <Wifi size={16} style={{ color: '#059669' }} />
        <span style={{ color: '#065F46', fontSize: '0.875rem', fontWeight: '600' }}>
          Connexion active
        </span>
      </>
    ) : (
      <>
        <WifiOff size={16} style={{ color: '#DC2626' }} />
        <span style={{ color: '#991B1B', fontSize: '0.875rem', fontWeight: '600' }}>
          Hors ligne
        </span>
      </>
    )}
    {error && (
      <span style={{ color: '#991B1B', fontSize: '0.75rem', marginLeft: '8px' }}>
        {error}
      </span>
    )}
  </div>
);

export default ConnectionStatus;