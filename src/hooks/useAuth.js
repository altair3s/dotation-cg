import { useState, useEffect, useContext, createContext } from 'react';
import { auth, db } from '../config/firebaseConfig';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    console.log('Tentative de connexion Firebase:', { email });
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('Connexion Firebase réussie:', firebaseUser.uid);
      
      // Optionnel: récupérer le profil depuis Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
          console.log('Profil utilisateur chargé:', userDoc.data());
        }
      } catch (profileError) {
        console.log('Pas de profil Firestore, utilisation des données Firebase de base');
      }
      
      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Erreur de connexion Firebase:', error);
      return { 
        success: false, 
        error: error.code === 'auth/user-not-found' ? 'Utilisateur non trouvé' :
               error.code === 'auth/wrong-password' ? 'Mot de passe incorrect' :
               error.code === 'auth/invalid-email' ? 'Email invalide' :
               error.code === 'auth/too-many-requests' ? 'Trop de tentatives, réessayez plus tard' :
               'Erreur de connexion'
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      console.log('Déconnexion effectuée');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('Utilisateur connecté détecté:', firebaseUser.uid);
        setUser(firebaseUser);
        
        // Charger le profil si disponible
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.log('Pas de profil Firestore disponible');
        }
      } else {
        console.log('Aucun utilisateur connecté');
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userProfile,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};