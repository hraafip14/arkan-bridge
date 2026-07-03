import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Tambah dokumen baru ke koleksi.
 * createdAt otomatis diisi oleh server Firebase.
 */
export const addDocument = async (collectionName, data) => {
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Update dokumen yang sudah ada berdasarkan ID.
 */
export const updateDocument = async (collectionName, docId, data) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Hapus dokumen berdasarkan ID.
 */
export const deleteDocument = async (collectionName, docId) => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
};

/**
 * Ambil satu dokumen berdasarkan ID.
 */
export const getDocument = async (collectionName, docId) => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

/**
 * Ambil semua dokumen dari koleksi, diurutkan berdasarkan createdAt.
 */
export const getAllDocuments = async (collectionName) => {
  const colRef = collection(db, collectionName);
  const q = query(colRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Subscribe ke koleksi secara real-time.
 * Setiap ada perubahan di Firestore, callback dipanggil otomatis.
 * Mengembalikan fungsi "unsubscribe" untuk membersihkan listener.
 */
export const subscribeToCollection = (collectionName, callback) => {
  const colRef = collection(db, collectionName);
  const q = query(colRef, orderBy('createdAt', 'asc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  });
  return unsubscribe;
};