import { useState } from 'react';
import useCollection from '../../hooks/useCollection';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatKelasLabel, sortClasses } from '../classes/classesService';
import { addStudent, updateStudent, deleteStudent, deleteAllStudentsInClass } from './studentsService';
import ImportSiswaPage from './ImportSiswaPage';
import styles from './DataSiswaPage.module.css';
import { useMemo, useCallback } from 'react';

const EMPTY_FORM = { nik: '', namaLengkap: '', kelasId: '', kelasNama: '' };

const DataSiswaPage = () => {
  const { data: students, isLoading } = useCollection('students');
  const { data: classes }             = useCollection('classes');

  const sortedClasses = useMemo(() => sortClasses(classes), [classes]);

  const [activeTab,    setActiveTab]    = useState('manual');
  const [formData,     setFormData]     = useState(EMPTY_FORM);
  const [editingId,    setEditingId]    = useState(null);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast,        setToast]        = useState({ message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedKelasManual, setSelectedKelasManual] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'kelasId') {
      const selectedKelas = sortedClasses.find((k) => k.id === value);
      setFormData((prev) => ({
        ...prev,
        kelasId:   value,
        kelasNama: selectedKelas ? formatKelasLabel(selectedKelas) : '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.nik.trim() || !formData.namaLengkap.trim()) {
      showToast('NIK dan nama siswa wajib diisi!', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateStudent(editingId, formData);
        showToast('Data siswa berhasil diperbarui!');
        setEditingId(null);
      } else {
        await addStudent(formData);
        showToast('Data siswa berhasil disimpan!');
      }
      setFormData(EMPTY_FORM);
    } catch {
      showToast('Terjadi kesalahan. Coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (student) => {
    setFormData({
      nik:         student.nik,
      namaLengkap: student.namaLengkap,
      kelasId:     student.kelasId,
      kelasNama:   student.kelasNama,
    });
    setEditingId(student.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id, namaLengkap) => {
    setDeleteTarget({ id, namaLengkap });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteStudent(deleteTarget.id);
      showToast('Data siswa berhasil dihapus.');
    } catch {
      showToast('Gagal menghapus. Coba lagi.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const count = await deleteAllStudentsInClass(
        selectedKelasManual.id,
        students
      );
      showToast(`${count} data siswa berhasil dihapus dari kelas ini.`);
      setShowDeleteAllModal(false);
    } catch {
      showToast('Gagal menghapus data siswa. Coba lagi.', 'error');
      setShowDeleteAllModal(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nik.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Data Siswa</h2>
        <p className={styles.pageSubtitle}>
          Daftarkan siswa secara manual atau import dari file Excel
        </p>
      </div>

      {/* Tabs */}
      <div className={styles.subTabs}>
        <button
          className={`${styles.subTab} ${activeTab === 'manual' ? styles.subTabActive : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          <img src="/src/assets/manual.png" alt="" /> Input Manual
        </button>
        <button
          className={`${styles.subTab} ${activeTab === 'import' ? styles.subTabActive : ''}`}
          onClick={() => setActiveTab('import')}
        >
          <img src="/src/assets/excel.png" alt="" /> Import dari Excel
        </button>
      </div>

      {/* ===== TAB: INPUT MANUAL ===== */}
      {activeTab === 'manual' && (
        <div>
          {!selectedKelasManual ? (
            /* ===== STEP 1: PILIH KELAS ===== */
            <div className={styles.formCard}>
              <div className={styles.formCardTitle}>
                <i className="ti ti-school" aria-hidden="true" />
                Pilih Kelas
              </div>
              <p className={styles.hintText}>
                Pilih kelas untuk melihat dan mengelola data siswa.
              </p>
              {sortedClasses.length === 0 ? (
                <p className={styles.emptyHint}>
                  Belum ada data kelas. Tambahkan kelas di menu Data Kelas terlebih dahulu.
                </p>
              ) : (
                <div className={styles.kelasGrid}>
                  {sortedClasses.map((k) => {
                    const jumlahSiswa = students.filter((s) => s.kelasId === k.id).length;
                    return (
                      <button
                        key={k.id}
                        className={styles.kelasOption}
                        onClick={() => {
                          setSelectedKelasManual(k);
                          setFormData(EMPTY_FORM);
                          setEditingId(null);
                        }}
                      >
                        <div className={styles.kelasOptionNum}>{k.kelasNumber}</div>
                        <div className={styles.kelasOptionName}>{k.namaKelas}</div>
                        <div className={styles.kelasOptionJk}>{k.jenisKelamin}</div>
                        <div className={styles.kelasOptionCount}>
                          {jumlahSiswa} siswa
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ===== STEP 2: KELOLA SISWA KELAS TERPILIH ===== */
            <div>
              {/* Info kelas terpilih + tombol ganti kelas */}
              <div className={styles.selectedKelasBar}>
                <div style={{ display: 'flex', gap: '7px' }}>
                  <button
                    className={styles.btnChangeKelas}
                    onClick={() => {
                      setSelectedKelasManual(null);
                      setFormData(EMPTY_FORM);
                      setEditingId(null);
                    }}
                  >
                    <img src="/src/assets/back2.png" alt="Back" />Back
                  </button>
                </div>
                  <div className={styles.selectedKelasInfo}>
                  <i className="ti ti-school" aria-hidden="true" />
                  <span>
                    <strong>{formatKelasLabel(selectedKelasManual)}</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '7px' }}>
                  <button
                    className={styles.btnDeleteAll}
                    onClick={() => setShowDeleteAllModal(true)}
                    title="Hapus seluruh siswa di kelas ini"
                  >
                    <img src="/src/assets/remove.png" alt="" /> Hapus Semua Siswa
                  </button>
                </div>
              </div>

              {/* Form edit — hanya muncul saat mode edit */}
              {editingId && (
                <div className={styles.formCard}>
                  <div className={styles.formCardTitle}>
                    <i className="ti ti-pencil" aria-hidden="true" />
                    Edit Data Siswa
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formField}>
                      <label className={styles.fieldLabel}>
                        NIK Siswa <span className={styles.required}>*</span>
                      </label>
                      <input
                        name="nik"
                        className={styles.input}
                        placeholder="Nomor Induk Kependudukan"
                        value={formData.nik}
                        onChange={handleInputChange}
                        style={{ width: '170px' }}
                      />
                    </div>
                    <div className={styles.formField} style={{ flex: 1 }}>
                      <label className={styles.fieldLabel}>
                        Nama Lengkap Siswa <span className={styles.required}>*</span>
                      </label>
                      <input
                        name="namaLengkap"
                        className={styles.input}
                        placeholder="Nama lengkap siswa"
                        value={formData.namaLengkap}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className={styles.buttonGroup}>
                      <button
                        className={styles.btnSave}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        <i className="ti ti-device-floppy" aria-hidden="true" />
                        {isSubmitting ? 'Menyimpan...' : 'Update'}
                      </button>
                      <button
                        className={styles.btnCancel}
                        onClick={() => { setFormData(EMPTY_FORM); setEditingId(null); }}
                      >
                        <i className="ti ti-x" aria-hidden="true" /> Batal
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className={styles.searchWrap}>
                <i className="ti ti-search" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Cari nama siswa atau NIK..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Jumlah siswa */}
              {(() => {
                const kelasStudents = students.filter(
                  (s) => s.kelasId === selectedKelasManual.id
                );
                const filtered = kelasStudents.filter(
                  (s) =>
                    s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.nik.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return (
                  <>
                    <p className={styles.dataCount}>
                      Menampilkan <strong>{filtered.length}</strong> dari{' '}
                      <strong>{kelasStudents.length}</strong> siswa di kelas ini
                    </p>
                    <div className={styles.tableCard}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>#</th><th>NIK</th>
                            <th>Nama Lengkap</th><th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoading ? (
                            <tr><td colSpan={4} className={styles.emptyCell}>Memuat data...</td></tr>
                          ) : filtered.length === 0 ? (
                            <tr><td colSpan={4} className={styles.emptyCell}>
                              {searchQuery ? 'Siswa tidak ditemukan.' : 'Belum ada data siswa di kelas ini.'}
                            </td></tr>
                          ) : filtered.map((s, i) => (
                            <tr key={s.id}>
                              <td>{i + 1}</td>
                              <td className={styles.tdMuted}>{s.nik}</td>
                              <td>{s.namaLengkap}</td>
                              <td>
                                <div className={styles.tdActions}>
                                  <button
                                    className={styles.btnEdit}
                                    onClick={() => handleEdit(s)}
                                    title="Edit"
                                  >
                                    <img src="/src/assets/edit.png" alt="Edit" />
                                  </button>
                                  <button
                                    className={styles.btnDelete}
                                    onClick={() => handleDelete(s.id, s.namaLengkap)}
                                    title="Hapus"
                                  >
                                    <img src="/src/assets/hapus.png" alt="" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: IMPORT EXCEL ===== */}
      {activeTab === 'import' && (
        <ImportSiswaPage
          classes={sortedClasses}
          existingStudents={students}
          onImportSuccess={(count) => {
            showToast(`${count} data siswa berhasil diimport!`);
            setActiveTab('manual');
          }}
        />
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        variant="danger"
        title="Hapus Data Siswa?"
        message={`"${deleteTarget?.namaLengkap}" akan dihapus permanen dari daftar siswa.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        isOpen={showDeleteAllModal}
        variant="danger"
        title="Hapus Seluruh Siswa?"
        message={`Semua siswa di kelas ${formatKelasLabel(selectedKelasManual ?? {})} akan dihapus permanen. Tindakan ini tidak bisa dibatalkan!`}
        confirmLabel="Ya, Hapus Semua"
        cancelLabel="Batal"
        onConfirm={handleDeleteAll}
        onCancel={() => setShowDeleteAllModal(false)}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default DataSiswaPage;