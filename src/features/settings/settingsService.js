import {
  createUserWithEmailAndPassword,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, secondaryAuth, db } from '../../firebase/config';

const buildInternalEmail = (username) =>
  `${username.toLowerCase()}@arkanbridge.app`;

/**
 * Buat akun baru menggunakan secondary auth instance
 * supaya session Super Admin tidak terganggu.
 */
export const createUserAccount = async ({
  username, password, name, role, teacherId,
}) => {
  const internalEmail = buildInternalEmail(username);

  const credential = await createUserWithEmailAndPassword(
    secondaryAuth,   // ← pakai secondary, bukan auth utama
    internalEmail,
    password
  );

  await setDoc(doc(db, 'users', credential.user.uid), {
    username,
    name,
    role,
    password, // simpan untuk ditampilkan di tabel (plain — cukup untuk internal school app)
    teacherId: teacherId ?? null,
    createdAt: serverTimestamp(),
  });

  // Logout dari secondary instance setelah selesai
  await secondaryAuth.signOut();

  return credential.user.uid;
};

/**
 * Update akun user yang sudah ada (username, password, role).
 * Dipanggil oleh Super Admin dari tabel user.
 */
export const updateUserAccount = async (uid, { username, password, name, role, teacherId }) => {
  await updateDoc(doc(db, 'users', uid), {
    username,
    name,
    role,
    password,
    teacherId: teacherId ?? null,
    updatedAt: serverTimestamp(),
  });
  // Catatan: update password di Firebase Auth butuh Admin SDK
  // Untuk sekarang kita simpan di Firestore saja sebagai referensi
};

/**
 * Hapus akun user dari Firestore.
 * (Hapus dari Firebase Auth butuh Admin SDK — skip untuk sekarang)
 */
export const deleteUserAccount = async (uid) => {
  await deleteDoc(doc(db, 'users', uid));
};

/** Update profil sendiri */
export const updateOwnProfile = async (uid, { name, username }) => {
  await updateDoc(doc(db, 'users', uid), {
    name, username, updatedAt: serverTimestamp(),
  });
};

/** Ganti password sendiri dengan re-autentikasi */
export const changeOwnPassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Tidak ada user yang sedang login.');
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};