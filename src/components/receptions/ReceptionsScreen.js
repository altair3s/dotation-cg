import React, { useState } from 'react';
import { Truck, Filter, Search, MapPin, Eye, FileText, X } from 'lucide-react';

const ReceptionsScreen = ({ data }) => {
  const [filtreLocalisation, setFiltreLocalisation] = useState('Toutes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBL, setSelectedBL] = useState(null);

  // Extraire les données des entrées/réceptions depuis l'onglet "BL" de Google Sheets
  const receptions = data?.bl || data?.BL || data?.entrees || [];
  
  // Obtenir la liste des localisations uniques
  const localisations = ['Toutes', ...new Set(receptions.map(r => r.Localisation || r.localisation).filter(Boolean))];

  // Filtrer les réceptions
  const receptionsFiltrees = receptions.filter(reception => {
    const localisation = reception.Localisation || reception.localisation || '';
    const libelle = reception.Libellé || reception.libelle || '';
    const user = reception.User || reception.user || '';
    const bl = reception.BL || reception.bl || '';
    
    const matchLocalisation = filtreLocalisation === 'Toutes' || localisation === filtreLocalisation;
    const matchSearch = !searchTerm || 
                       libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       bl.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchLocalisation && matchSearch;
  });

  const ouvrirPDF = (reception) => {
    const pdfUrl = reception.Pdf || reception.pdf;
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      alert('PDF non disponible pour cette réception');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header avec filtres */}
      <div style={{ 
        background: 'white', borderRadius: '16px', 
        padding: '24px', border: '1px solid #E5E7EB',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', fontWeight: '700', color: '#1F2937', margin: '0 0 4px 0',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                padding: '8px', borderRadius: '12px'
              }}>
                <Truck size={24} style={{ color: 'white' }} />
              </div>
              Suivi des Réceptions
            </h2>
            <p style={{ color: '#6B7280', margin: 0, fontSize: '0.95rem' }}>
              {receptionsFiltrees.length} réceptions trouvées sur {receptions.length} au total
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: '16px', alignItems: 'end' }}>
          {/* Filtre par localisation */}
          <div>
            <label style={{ 
              display: 'block', fontSize: '0.875rem', fontWeight: '600', 
              color: '#374151', marginBottom: '6px'
            }}>
              Localisation
            </label>
            <div style={{ position: 'relative' }}>
              <Filter size={16} style={{ 
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                color: '#9CA3AF' 
              }} />
              <select
                value={filtreLocalisation}
                onChange={(e) => setFiltreLocalisation(e.target.value)}
                style={{
                  width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #D1D5DB',
                  borderRadius: '8px', fontSize: '0.875rem', background: 'white',
                  outline: 'none', transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              >
                {localisations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Recherche */}
          <div>
            <label style={{ 
              display: 'block', fontSize: '0.875rem', fontWeight: '600', 
              color: '#374151', marginBottom: '6px'
            }}>
              Recherche
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ 
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                color: '#9CA3AF' 
              }} />
              <input
                type="text"
                placeholder="Rechercher par libellé, utilisateur ou BL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #D1D5DB',
                  borderRadius: '8px', fontSize: '0.875rem', background: 'white',
                  outline: 'none', transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>
          </div>

          {/* Bouton reset */}
          <button
            onClick={() => {
              setFiltreLocalisation('Toutes');
              setSearchTerm('');
            }}
            style={{
              padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB',
              background: 'white', color: '#374151', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: '500', height: 'fit-content'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Liste des réceptions */}
      <div style={{ 
        background: 'white', borderRadius: '16px', 
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        {receptionsFiltrees.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Truck size={48} style={{ color: '#9CA3AF', marginBottom: '16px' }} />
            <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
              Aucune réception trouvée avec ces critères
            </p>
          </div>
        ) : (
          <div style={{ padding: '0' }}>
            {/* Header du tableau */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '100px 2fr 150px 100px 150px',
              gap: '16px', padding: '20px 24px',
              background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
              borderBottom: '1px solid #E5E7EB',
              fontSize: '0.875rem', fontWeight: '600', color: '#374151'
            }}>
              <div>Date</div>
              <div>Libellé</div>
              <div>Localisation</div>
              <div>Quantité</div>
              <div>Actions</div>
            </div>

            {/* Lignes du tableau */}
            {receptionsFiltrees
              .sort((a, b) => {
                const dateA = new Date(a.Date || a.date || a.Timestamp);
                const dateB = new Date(b.Date || b.date || b.Timestamp);
                return dateB - dateA;
              })
              .map((reception, index) => {
                // Utiliser Timestamp si Date est invalide
                const dateValue = reception.Date || reception.date || reception.Timestamp;
                const date = new Date(dateValue);
                const isValidDate = !isNaN(date.getTime()) && date.getFullYear() > 1970;
                const isRecent = isValidDate && (new Date() - date) < 7 * 24 * 60 * 60 * 1000; // 7 jours
                
                return (
                  <div 
                    key={reception.Id || reception.id || index}
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '100px 2fr 150px 100px 150px',
                      gap: '16px', padding: '16px 24px',
                      borderBottom: '1px solid #F3F4F6',
                      background: isRecent ? 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)' : 'white',
                      borderLeft: isRecent ? '4px solid #10B981' : '4px solid transparent',
                      transition: 'all 0.2s ease',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isRecent ? 
                        'linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%)' : 
                        'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isRecent ? 
                        'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)' : 'white';
                    }}
                  >
                    {/* Colonne 0 - Date */}
                    <div style={{ fontSize: '0.875rem' }}>
                      <div style={{ fontWeight: '600', color: '#1F2937' }}>
                        {isValidDate ? date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '--/--'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {isValidDate ? date.toLocaleDateString('fr-FR', { year: 'numeric' }) : '----'}
                      </div>
                    </div>

                    {/* Colonne 1 - Libellé */}
                    <div>
                      <div style={{ fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>
                        {reception.Libellé || reception.libelle}
                      </div>
                      {isRecent && (
                        <span style={{
                          display: 'inline-block', marginTop: '4px',
                          padding: '2px 8px', borderRadius: '12px',
                          background: '#10B981', color: 'white',
                          fontSize: '0.7rem', fontWeight: '600'
                        }}>
                          RÉCENT
                        </span>
                      )}
                    </div>

                    {/* Colonne 2 - Localisation */}
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '0.875rem', color: '#374151'
                    }}>
                      <MapPin size={14} style={{ color: '#6B7280' }} />
                      {reception.Localisation || reception.localisation}
                    </div>

                    {/* Colonne 3 - Quantité */}
                    <div style={{ 
                      textAlign: 'center', fontWeight: '700', 
                      color: '#1F2937', fontSize: '0.9rem'
                    }}>
                      {(reception.Quantité || reception.quantité || 0).toLocaleString()}
                    </div>

                    {/* Colonne 4 - Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => ouvrirPDF(reception)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '6px 12px', borderRadius: '8px', border: 'none',
                          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                          color: 'white', cursor: 'pointer',
                          fontSize: '0.75rem', fontWeight: '500',
                          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        <Eye size={12} />
                        PDF
                      </button>
                      <button
                        onClick={() => setSelectedBL(reception)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '6px 12px', borderRadius: '8px', 
                          border: '1px solid #D1D5DB',
                          background: 'white', color: '#374151', cursor: 'pointer',
                          fontSize: '0.75rem', fontWeight: '500'
                        }}
                      >
                        <FileText size={12} />
                        Détails
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Modal détails BL */}
      {selectedBL && (
        <div 
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0, 0, 0, 0.6)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            zIndex: 9999, backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSelectedBL(null)}
        >
          <div 
            style={{
              background: 'white', borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '600px', width: '90%', maxHeight: '80%', 
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header modal */}
            <div style={{ 
              padding: '24px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={24} />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                    Bon de Livraison
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBL(null)}
                style={{ 
                  padding: '8px', borderRadius: '8px', border: 'none', 
                  background: 'rgba(255, 255, 255, 0.2)', color: 'white', cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu modal */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>Date</label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '600', color: '#1F2937' }}>
                    {(() => {
                      const date = new Date(selectedBL.Date || selectedBL.date || selectedBL.Timestamp);
                      return !isNaN(date.getTime()) ? date.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Date invalide';
                    })()}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>Utilisateur</label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '600', color: '#1F2937' }}>
                    {selectedBL.User || selectedBL.user}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>Localisation</label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '600', color: '#1F2937' }}>
                    {selectedBL.Localisation || selectedBL.localisation}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>Quantité</label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: '700', color: '#059669' }}>
                    {(selectedBL.Quantité || selectedBL.quantité || 0).toLocaleString()} unités
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>Libellé</label>
                <p style={{ 
                  margin: '4px 0 0 0', fontSize: '1rem', color: '#1F2937',
                  padding: '12px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB'
                }}>
                  {selectedBL.Libellé || selectedBL.libelle}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => ouvrirPDF(selectedBL)}
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: '8px', border: 'none',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                    color: 'white', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  <Eye size={16} />
                  Ouvrir le PDF
                </button>
                <button
                  onClick={() => setSelectedBL(null)}
                  style={{
                    padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB',
                    background: 'white', color: '#374151', cursor: 'pointer',
                    fontSize: '0.9rem', fontWeight: '600'
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionsScreen;