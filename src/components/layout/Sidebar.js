import React from 'react';
import { LayoutDashboard, Package, Building2, Truck, Gift, Menu, User } from 'lucide-react';
import LogoutButton from '../auth/LogoutButton';

const Sidebar = ({ activeSection, onSectionChange, isCollapsed, onToggleCollapse }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { id: 'stock', icon: Package, label: 'Gestion Stock', badge: '3' },
    { id: 'sites', icon: Building2, label: 'Sites & Filiales', badge: null },
    { id: 'receptions', icon: Truck, label: 'Réceptions', badge: null },
  ];

  return (
    <div style={{ 
      width: isCollapsed ? '80px' : '280px',
      background: 'linear-gradient(180deg, #1F2937 0%, #111827 100%)',
      transition: 'width 0.3s ease',
      display: 'flex', flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000
    }}>
      {/* Header avec logo premium */}
      <div style={{ 
        padding: '24px 20px',
        borderBottom: '1px solid #374151'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', height: '40px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)'
              }}>
                <Gift style={{ color: 'white' }} size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white' }}>
                  Dashboard
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                  Distribution Caisses CG
                </div>
              </div>
            </div>
          )}
          <button 
            onClick={onToggleCollapse}
            style={{ 
              padding: '8px', borderRadius: '8px', border: 'none',
              background: 'rgba(255, 255, 255, 0.1)', color: '#D1D5DB', cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Navigation avec design moderne */}
      <nav style={{ flex: 1, padding: '20px' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item) => (
            <li key={item.id} style={{ marginBottom: '8px' }}>
              <button
                onClick={() => onSectionChange(item.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', border: 'none', borderRadius: '12px',
                  background: activeSection === item.id ? 
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                    'transparent',
                  color: activeSection === item.id ? 'white' : '#D1D5DB',
                  cursor: 'pointer', transition: 'all 0.3s ease',
                  fontSize: '0.9rem', fontWeight: '600',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  boxShadow: activeSection === item.id ? '0 4px 16px rgba(102, 126, 234, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== item.id) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== item.id) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <item.icon size={20} />
                {!isCollapsed && (
                  <>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        marginLeft: 'auto', padding: '2px 8px', borderRadius: '20px',
                        background: '#EF4444', color: 'white', fontSize: '0.75rem', fontWeight: '600'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer utilisateur avec design premium */}
      <div style={{ padding: '20px', borderTop: '1px solid #374151' }}>
        {!isCollapsed && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', 
            padding: '16px', borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ 
              width: '40px', height: '40px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <User size={16} style={{ color: 'white' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white', margin: 0 }}>
                Admin
              </p>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>
                g3s.data1@gmail.com
              </p>
            </div>
            <LogoutButton />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;