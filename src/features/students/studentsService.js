import {
  addDocument,
  updateDocument,
  deleteDocument,
} from '../../firebase/firestoreService';

const COLLECTION = 'students';

export const addStudent = async (data) => {
  return addDocument(COLLECTION, data);
};

export const updateStudent = async (docId, data) => {
  return updateDocument(COLLECTION, docId, data);
};

export const deleteStudent = async (docId) => {
  return deleteDocument(COLLECTION, docId);
};

// Tambahkan di studentsService.js
export const deleteAllStudentsInClass = async (kelasId, allStudents) => {
  const studentsInClass = allStudents.filter((s) => s.kelasId === kelasId);
  for (const student of studentsInClass) {
    await deleteStudent(student.id);
  }
  return studentsInClass.length;
};