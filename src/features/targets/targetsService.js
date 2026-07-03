import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';

const COLLECTION = 'targets';

/**
 * Struktur data target per kelas di Firestore:
 *
 * targets/{kelasKey}/
 *   ├── kelasNumber   : "Kelas 1"
 *   ├── fokusUtama    : "..."
 *   ├── outputDiKelas : "..."
 *   ├── outputPembelajaran : "..."
 *   ├── listening     : { description: "..." }
 *   ├── speaking      : { description: "...", categories: [...] }
 *   ├── reading       : { description: "...", categories: [...] }
 *   ├── writing       : { description: "...", stages: [...] }
 *   └── updatedAt     : timestamp
 *
 * Kita pakai kelasNumber sebagai docId (cth: "kelas-1")
 * supaya mudah di-fetch tanpa perlu query.
 */

const buildDocId = (kelasNumber) => {
  return kelasNumber.toLowerCase().replace(' ', '-');
};

/**
 * Ambil data target satu kelas.
 * Return null kalau belum pernah diisi.
 */
export const getTargetByKelas = async (kelasNumber) => {
  const docId  = buildDocId(kelasNumber);
  const docRef = doc(db, COLLECTION, docId);
  const snap   = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

/**
 * Simpan/update data target satu kelas.
 * Menggunakan setDoc dengan merge:true supaya tidak menimpa field lain.
 */
export const saveTargetOverview = async (kelasNumber, data) => {
  const docId  = buildDocId(kelasNumber);
  const docRef = doc(db, COLLECTION, docId);
  await setDoc(
    docRef,
    { kelasNumber, ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

/**
 * Simpan data skill (listening/speaking/reading/writing) satu kelas.
 */
export const saveTargetSkill = async (kelasNumber, skillKey, skillData) => {
  const docId  = buildDocId(kelasNumber);
  const docRef = doc(db, COLLECTION, docId);
  await setDoc(
    docRef,
    {
      kelasNumber,
      [skillKey]: skillData,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const KELAS_LIST = [
  'GRADE 1st', 'GRADE 2nd', 'GRADE 3rd',
  'GRADE 4th', 'GRADE 5th', 'GRADE 6th',
];