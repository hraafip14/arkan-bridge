import { useState, useEffect } from 'react';
import { subscribeToCollection } from '../firebase/firestoreService';

/**
 * Custom hook untuk subscribe ke koleksi Firestore secara real-time.
 *
 * Cara pakai:
 * const { data, isLoading } = useCollection('classes');
 */
const useCollection = (collectionName) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mulai subscribe saat komponen mount
    const unsubscribe = subscribeToCollection(collectionName, (result) => {
      setData(result);
      setIsLoading(false);
    });

    // Hentikan subscribe saat komponen unmount — WAJIB!
    // Kalau tidak dibersihkan, terjadi memory leak
    return () => unsubscribe();
  }, [collectionName]);

  return { data, isLoading };
};

export default useCollection;