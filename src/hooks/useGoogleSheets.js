import { useState, useEffect, useRef } from 'react';
import GoogleSheetsIntegration from '../GoogleSheetsIntegration';

export const useGoogleSheets = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const sheetsService = useRef(new GoogleSheetsIntegration());
  
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const connectionOk = await sheetsService.current.testConnection();
      setConnected(connectionOk);
      
      if (!connectionOk) {
        throw new Error('Impossible de se connecter à vos données. Vérifiez votre configuration.');
      }

      const newData = await sheetsService.current.getAllData();
      const blData = await sheetsService.current.getBLData();
      newData.bl = blData;
      setData(newData);
      
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError(err.message);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const addDistribution = async (distribution) => {
    try {
      await sheetsService.current.addDistribution(distribution);
      await loadData();
      return true;
    } catch (error) {
      console.error('Erreur ajout distribution:', error);
      throw error;
    }
  };

  const addStock = async (entree) => {
    try {
      await sheetsService.current.addStockEntry(entree);
      await loadData();
      return true;
    } catch (error) {
      console.error('Erreur ajout stock:', error);
      throw error;
    }
  };

  const refresh = () => {
    sheetsService.current.clearCache();
    loadData();
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, connected, refresh, addDistribution, addStock };
};