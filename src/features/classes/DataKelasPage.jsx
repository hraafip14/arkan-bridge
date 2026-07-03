import { useState, useCallback } from 'react';
import useCollection from '../../hooks/useCollection';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  addClass,
  updateClass,
  deleteClass,
  sortClasses,
  groupClassesByNumber
} from './classesService';
import styles from './DataKelasPage.module.css';

const KELAS_OPTIONS = [
  '1','2','3',
  '4','5','6',
];
const JK_OPTIONS = ['Boys', 'Girls'];

const EMPTY_FORM = {
  kelasNumber: '1',
  namaKelas: '',
  jenisKelamin: 'Boys',
};

const DataKelasPage = () => {
  const { data: classes, isLoading } = useCollection('classes');
  const [formData, setFormData]     = useState(EMPTY_FORM);
  const [editingId, setEditingId]   = useState(null);
  const [toast, setToast]           = useState({ message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.namaKelas.trim()) {
      showToast('Class name is required!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateClass(editingId, formData);
        showToast('Class data updated successfully!');
        setEditingId(null);
      } else {
        await addClass(formData);
        showToast('Class data saved successfully!');
      }
      setFormData(EMPTY_FORM);
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (kelas) => {
    setFormData({
      kelasNumber:  kelas.kelasNumber,
      namaKelas:    kelas.namaKelas,
      jenisKelamin: kelas.jenisKelamin,
    });
    setEditingId(kelas.id);
    // Scroll ke atas supaya user melihat form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
  };

  const handleDelete = (docId, namaKelas) => {
    setDeleteTarget({ id: docId, namaKelas });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteClass(deleteTarget.id);
      showToast('Class data deleted successfully!');
    } catch {
      showToast('Failed to delete class data. Please try again.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const groupedClasses = groupClassesByNumber(classes);

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Class Data</h2>
        <p className={styles.pageSubtitle}>
          Add and manage available class data. It is recommended to fill in the class data first before adding teacher and student data, so that you can easily assign them to the correct classes.
        </p>
      </div>

      {/* Form Card */}
      <div className={styles.formCard}>
        <div className={styles.formCardTitle}>
          <i className={`ti ${editingId ? 'ti-pencil' : 'ti-plus-circle'}`} aria-hidden="true" />
          {editingId ? 'Edit Class' : 'Add New Class'}
        </div>

        <div className={styles.formRow}>
          {/* Nomor Kelas */}
          <div className={styles.formField}>
            <label htmlFor="kelasNumber" className={styles.fieldLabel}>
              Class Number <span className={styles.required}>*</span>
            </label>
            <select
              id="kelasNumber"
              name="kelasNumber"
              className={styles.select}
              value={formData.kelasNumber}
              onChange={handleInputChange}
            >
              {KELAS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Nama Kelas */}
          <div className={styles.formField} style={{ flex: 1 }}>
            <label htmlFor="namaKelas" className={styles.fieldLabel}>
              Class Name <span className={styles.required}>*</span>
            </label>
            <input
              id="namaKelas"
              name="namaKelas"
              type="text"
              className={styles.input}
              placeholder="e.g., Bilal bin Rabah, Anas bin Malik, Ali bin Abi Thalib, etc."
              value={formData.namaKelas}
              onChange={handleInputChange}
            />
          </div>

          {/* Jenis Kelamin */}
          <div className={styles.formField}>
            <label htmlFor="jenisKelamin" className={styles.fieldLabel}>
              Gender <span className={styles.required}>*</span>
            </label>
            <select
              id="jenisKelamin"
              name="jenisKelamin"
              className={styles.select}
              value={formData.jenisKelamin}
              onChange={handleInputChange}
            >
              {JK_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <button
              className={styles.btnSave}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <img src="/src/assets/save.png" alt="Save" />
              {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </button>
            {editingId && (
              <button className={styles.btnCancel} onClick={handleCancelEdit}>
                <i className="ti ti-x" aria-hidden="true" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kelas Grid */}
      {isLoading ? (
        <p className={styles.loadingText}>Loading class data...</p>
      ) : groupedClasses.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="ti ti-school" style={{ fontSize: '2.5rem', opacity: 0.3 }} aria-hidden="true" />
          <p>No class data available. Please add a class above.</p>
        </div>
      ) : (
        <div className={styles.kelasGrid}>
          {groupedClasses.map(({ kelasNumber, items }) => (
            <div key={kelasNumber} className={styles.kelasCard}>
              <div className={styles.kelasCardHeader}>
                <span>Grade {kelasNumber}</span>
                <span className={styles.kelasCount}>{items.length} classes</span>
              </div>
              <div className={styles.kelasCardBody}>
                {items.map((kelas) => (
                  <div key={kelas.id} className={styles.kelasRow}>
                    <span className={styles.kelasName}>{kelas.namaKelas}</span>
                    <span className={`${styles.badge} ${
                      kelas.jenisKelamin === 'Boys'
                        ? styles.badgeIkhwan
                        : styles.badgeAkhwat
                    }`}>
                      {kelas.jenisKelamin}
                    </span>
                    <div className={styles.rowActions}>
                      <button
                        className={styles.btnEdit}
                        onClick={() => handleEdit(kelas)}
                        title="Edit kelas"
                      >
                        <img src="/src/assets/edit.png" alt="Edit" />
                      </button>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleDelete(kelas.id, kelas.namaKelas)}
                        title="Delete Class"
                      >
                        <img src="/src/assets/hapus.png" alt="Delete" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        variant="danger"
        title="Delete Class Data?"
        message={`Class "${deleteTarget?.namaKelas}" will be permanently deleted. Data that has been deleted cannot be recovered.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default DataKelasPage;