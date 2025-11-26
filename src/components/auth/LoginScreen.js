import React, { useState } from 'react';
import { Gift, User, Lock, LogIn, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Erreur de connexion');
        setLoading(false);
      } else {
        // Timeout de sécurité pour éviter le loading infini
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur dans handleSubmit:', error);
      setError('Erreur de connexion');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '420px'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 40px 30px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            backdropFilter: 'blur(10px)'
          }}>
            <Gift size={40} style={{ color: 'white' }} />
          </div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            margin: '0 0 8px 0'
          }}>
            Dashboard Pro
          </h1>
          <p style={{
            fontSize: '0.9rem',
            opacity: 0.9,
            margin: 0
          }}>
            Distribution Management System
          </p>
        </div>

        {/* Formulaire */}
        <div style={{ padding: '40px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF'
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@entreprise.com"
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 50px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: '#F9FAFB'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.background = '#F9FAFB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  style={{
                    width: '100%',
                    padding: '16px 50px 16px 50px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: '#F9FAFB'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.background = '#F9FAFB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
                border: '1px solid #FECACA',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertTriangle size={20} style={{ color: '#DC2626' }} />
                <span style={{ color: '#991B1B', fontSize: '0.875rem', fontWeight: '500' }}>
                  {error}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: loading ? 
                  'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)' :
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Se connecter
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LoginScreen;