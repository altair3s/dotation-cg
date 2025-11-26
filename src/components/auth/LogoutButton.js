import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LogoutButton = () => {
  const { logout } = useAuth();
  
  return (
    <button
      onClick={logout}
      style={{
        padding: '8px', 
        borderRadius: '8px', 
        border: 'none',
        background: 'rgba(239, 68, 68, 0.2)', 
        color: '#EF4444', 
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      title="Se déconnecter"
      onMouseEnter={(e) => {
        e.target.style.background = 'rgba(239, 68, 68, 0.3)';
        e.target.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'rgba(239, 68, 68, 0.2)';
        e.target.style.transform = 'scale(1)';
      }}
    >
      <LogOut size={16} />
    </button>
  );
};

export default LogoutButton;