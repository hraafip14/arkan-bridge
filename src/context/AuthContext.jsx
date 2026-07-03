import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);

/**
 * AuthProvider membungkus seluruh aplikasi.
 * Menyediakan data currentUser ke semua komponen anak.
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged = "listener" yang otomatis jalan
    // saat user login, logout, atau halaman di-refresh
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Ada user yang login → ambil data lengkapnya dari Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setCurrentUser({ uid: firebaseUser.uid, ...userDoc.data() });
        } else {
          setCurrentUser(null);
        }
      } else {
        // Tidak ada user → clear state
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup listener saat komponen unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook — dipakai di komponen mana saja yang butuh data user.
 * Contoh: const { currentUser } = useAuth();
 */
export const useAuth = () => useContext(AuthContext);