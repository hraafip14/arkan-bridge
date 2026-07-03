import {
  addDocument,
  updateDocument,
  deleteDocument,
} from '../../firebase/firestoreService';

const COLLECTION = 'classes';

// Urutan kelas yang benar untuk sorting
const KELAS_ORDER = [
  '1','2','3',
  '4','5','6',
];

/**
 * Tambah data kelas baru ke Firestore.
 */
export const addClass = async ({ kelasNumber, namaKelas, jenisKelamin }) => {
  return addDocument(COLLECTION, { kelasNumber, namaKelas, jenisKelamin });
};

/**
 * Update data kelas yang sudah ada.
 */
export const updateClass = async (docId, data) => {
  return updateDocument(COLLECTION, docId, data);
};

/**
 * Hapus data kelas dari Firestore.
 */
export const deleteClass = async (docId) => {
  return deleteDocument(COLLECTION, docId);
};

/**
 * Kelompokkan array kelas berdasarkan kelasNumber (Kelas 1, Kelas 2, dst.)
 * dan urutkan nama kelas secara alfabetis di dalam tiap kelompok.
 */
export const groupClassesByNumber = (classes) => {
  const groups = {};

  classes.forEach((kelas) => {
    if (!groups[kelas.kelasNumber]) {
      groups[kelas.kelasNumber] = [];
    }
    groups[kelas.kelasNumber].push(kelas);
  });

  // Urutkan nama kelas secara alfabetis dalam tiap kelompok
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => a.namaKelas.localeCompare(b.namaKelas));
  });

  // Kembalikan dalam urutan Kelas 1 → Kelas 6
  return KELAS_ORDER
    .filter((num) => groups[num])
    .map((num) => ({ kelasNumber: num, items: groups[num] }));
};

export const sortClasses = (classes) => {
  return [...classes].sort((a, b) => {
    const orderA = KELAS_ORDER.indexOf(a.kelasNumber);
    const orderB = KELAS_ORDER.indexOf(b.kelasNumber);

    // Urutkan berdasarkan nomor kelas dulu
    if (orderA !== orderB) return orderA - orderB;

    // Kalau nomor kelas sama, urutkan alfabetis
    return a.namaKelas.localeCompare(b.namaKelas, 'id');
  });
};

/**
 * Format nama kelas untuk ditampilkan di dropdown.
 * Contoh: "Al-Fatihah (Kelas 1)"
 */
export const formatKelasLabel = (kelas) => {
  return `${kelas.kelasNumber} ${kelas.namaKelas}`;
};