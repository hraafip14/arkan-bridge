import {
  addDocument,
  updateDocument,
  deleteDocument,
} from '../../firebase/firestoreService';

const COLLECTION_SIMA    = 'teachers';
const COLLECTION_ENGLISH = 'teachersEnglish';

// ===== GURU SIMA =====

export const addTeacher = async (data) => {
  return addDocument(COLLECTION_SIMA, data);
};

export const updateTeacher = async (docId, data) => {
  return updateDocument(COLLECTION_SIMA, docId, data);
};

export const deleteTeacher = async (docId) => {
  return deleteDocument(COLLECTION_SIMA, docId);
};

// ===== GURU ENGLISH =====

export const addTeacherEnglish = async (data) => {
  return addDocument(COLLECTION_ENGLISH, data);
};

export const updateTeacherEnglish = async (docId, data) => {
  return updateDocument(COLLECTION_ENGLISH, docId, data);
};

export const deleteTeacherEnglish = async (docId) => {
  return deleteDocument(COLLECTION_ENGLISH, docId);
};

/**
 * Filter hanya guru yang ditandai sebagai Guru English
 * untuk ditampilkan di dropdown tab Guru English.
 */
export const filterEnglishTeachers = (teachers) => {
  return teachers.filter((t) => t.isGuruEnglish === true);
};