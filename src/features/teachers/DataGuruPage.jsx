import { useState, useCallback, useMemo } from 'react';
import useCollection from '../../hooks/useCollection';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatKelasLabel, sortClasses } from '../classes/classesService';
import {
  addTeacher, updateTeacher, deleteTeacher,
  addTeacherEnglish, updateTeacherEnglish, deleteTeacherEnglish,
  filterEnglishTeachers,
} from './teachersService';
import styles from './DataGuruPage.module.css';

const JABATAN_OPTIONS  = ['Wali Kelas', 'Guru Kelas', 'Others'];
const GENDER_OPTIONS   = [
  { value: 'Man', label: 'Man' },
  { value: 'Woman', label: 'Woman' },
];
const IS_ENGLISH_OPTIONS = [
  { value: true,  label: 'Yes' },
  { value: false, label: 'No' },
];

const EMPTY_SIMA_FORM = {
  guruId: '', namaGuru: '', jabatan: 'Wali Kelas',
  jenisKelamin: 'Man', isGuruEnglish: false,
  kelasId: '', kelasNama: '',
};
const EMPTY_EN_FORM = {
  teacherId: '', namaGuru: '', kelasIds: [], kelasNames: [],
};

const DataGuruPage = () => {
  const { data: teachers,   isLoading: loadingTeachers } = useCollection('teachers');
  const { data: teachersEn, isLoading: loadingEn }       = useCollection('teachersEnglish');
  const { data: classes }                                 = useCollection('classes');
  const sortedClasses = useMemo(() => sortClasses(classes), [classes]);

  const [activeTab,      setActiveTab]      = useState('sima');
  const [simaForm,       setSimaForm]       = useState(EMPTY_SIMA_FORM);
  const [enForm,         setEnForm]         = useState(EMPTY_EN_FORM);
  const [editingSimaId,  setEditingSimaId]  = useState(null);
  const [editingEnId,    setEditingEnId]    = useState(null);
  const [searchSima,     setSearchSima]     = useState('');
  const [searchEn,       setSearchEn]       = useState('');

  // Search query khusus di form Guru English (bukan tabel)
  const [searchEnForm,   setSearchEnForm]   = useState('');
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [toast,          setToast]          = useState({ message: '', type: 'success' });
  const [deleteTarget,    setDeleteTarget]    = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Hanya guru yang isGuruEnglish === true
  const englishEligibleTeachers = useMemo(
    () => filterEnglishTeachers(teachers),
    [teachers]
  );

  // Filter dropdown guru English berdasarkan ketikan di form
  const filteredEnFormOptions = useMemo(() => {
    const query = searchEnForm.toLowerCase();
    if (!query) return englishEligibleTeachers;
    return englishEligibleTeachers.filter((t) =>
      t.namaGuru.toLowerCase().includes(query)
    );
  }, [englishEligibleTeachers, searchEnForm]);

  // ===== GURU SIMA =====

  const handleSimaChange = (e) => {
    const { name, value } = e.target;
    if (name === 'kelasId') {
      const selectedKelas = classes.find((k) => k.id === value);
      setSimaForm((prev) => ({
        ...prev,
        kelasId:   value,
        kelasNama: selectedKelas ? formatKelasLabel(selectedKelas) : '',
      }));
      return;
    }
    setSimaForm((prev) => ({ ...prev, [name]: value }));
  };

  // Khusus radio button yang valuenya boolean
  const handleSimaRadio = (name, value) => {
    setSimaForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSimaSubmit = async () => {
    if (!simaForm.guruId.trim() || !simaForm.namaGuru.trim()) {
      showToast('ID and name are required!', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingSimaId) {
        await updateTeacher(editingSimaId, simaForm);
        showToast('Teacher data updated successfully!');
        setEditingSimaId(null);
      } else {
        await addTeacher(simaForm);
        showToast('Teacher data saved successfully!');
      }
      setSimaForm(EMPTY_SIMA_FORM);
    } catch {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimaEdit = (teacher) => {
    setSimaForm({
      guruId:        teacher.guruId,
      namaGuru:      teacher.namaGuru,
      jabatan:       teacher.jabatan,
      jenisKelamin:  teacher.jenisKelamin  ?? 'Man',
      isGuruEnglish: teacher.isGuruEnglish ?? false,
      kelasId:       teacher.kelasId       ?? '',
      kelasNama:     teacher.kelasNama      ?? '',
    });
    setEditingSimaId(teacher.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSimaDelete = (id, nama) => {
    setDeleteTarget({ id, nama, type: 'sima' });
  }
  // ===== GURU ENGLISH =====

  /**
   * Saat memilih guru dari dropdown/daftar:
   * - Cek apakah guru sudah punya data di teachersEnglish
   * - Kalau sudah → mode edit otomatis
   * - Kalau belum → mode tambah baru
   */
  const handleEnTeacherSelect = (teacher) => {
    const existing = teachersEn.find((te) => te.teacherId === teacher.id);
    if (existing) {
      setEditingEnId(existing.id);
      setEnForm({
        teacherId:  existing.teacherId,
        namaGuru:   existing.namaGuru,
        kelasIds:   existing.kelasIds   ?? [],
        kelasNames: existing.kelasNames ?? [],
      });
    } else {
      setEditingEnId(null);
      setEnForm({
        teacherId:  teacher.id,
        namaGuru:   teacher.namaGuru,
        kelasIds:   [],
        kelasNames: [],
      });
    }
    // Kosongkan search setelah pilih
    setSearchEnForm('');
  };

  const handleKelasCheck = (kelas, isChecked) => {
    setEnForm((prev) => {
      if (isChecked) {
        return {
          ...prev,
          kelasIds:   [...prev.kelasIds, kelas.id],
          kelasNames: [...prev.kelasNames, kelas.namaKelas],
        };
      }
      return {
        ...prev,
        kelasIds:   prev.kelasIds.filter((id) => id !== kelas.id),
        kelasNames: prev.kelasNames.filter((n) => n !== kelas.namaKelas),
      };
    });
  };

  const handleEnSubmit = async () => {
    if (!enForm.teacherId) {
      showToast('Please select a teacher first!', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingEnId) {
        await updateTeacherEnglish(editingEnId, enForm);
        showToast('English teacher data updated successfully!');
        setEditingEnId(null);
      } else {
        await addTeacherEnglish(enForm);
        showToast('English teacher data saved successfully!');
      }
      setEnForm(EMPTY_EN_FORM);
    } catch {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnDelete = (id, nama) => {
    setDeleteTarget({ id, nama, type: 'english' });
  };

  const handleCancelEn = () => {
    setEnForm(EMPTY_EN_FORM);
    setEditingEnId(null);
    setSearchEnForm('');
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteTarget.type === 'sima') {
        await deleteTeacher(deleteTarget.id);
        showToast(`Teacher "${deleteTarget.nama}" deleted successfully.`);
      } else {
        await deleteTeacherEnglish(deleteTarget.id);
        showToast(`English teacher "${deleteTarget.nama}" deleted successfully.`);
      }
    } catch {
      showToast('Failed to delete. Please try again.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Filter tabel
  const filteredTeachers = teachers.filter((t) =>
    t.namaGuru.toLowerCase().includes(searchSima.toLowerCase()) ||
    t.guruId.toLowerCase().includes(searchSima.toLowerCase())
  );
  const filteredTeachersEn = teachersEn.filter((t) =>
    t.namaGuru.toLowerCase().includes(searchEn.toLowerCase())
  );

  const jabatanBadgeClass = (jab) => {
    if (jab === 'Wali Kelas') return styles.badgeWali;
    if (jab === 'Guru Kelas') return styles.badgeGuru;
    return styles.badgeOther;
  };

  // Guru yang sedang dipilih di form English (untuk ditampilkan sebagai selected)
  const selectedEnTeacher = teachers.find((t) => t.id === enForm.teacherId);

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Teacher Data</h2>
        <p className={styles.pageSubtitle}>Manage Teachers and English teacher data</p>
      </div>

      {/* Sub Tabs */}
      <div className={styles.subTabs}>
        <button
          className={`${styles.subTab} ${activeTab === 'sima' ? styles.subTabActive : ''}`}
          onClick={() => setActiveTab('sima')}
        >
          <i className="ti ti-user" aria-hidden="true" /> Teachers
        </button>
        <button
          className={`${styles.subTab} ${activeTab === 'english' ? styles.subTabActive : ''}`}
          onClick={() => setActiveTab('english')}
        >
          <i className="ti ti-language" aria-hidden="true" /> English Teachers
        </button>
      </div>

      {/* ===== PANEL GURU SIMA ===== */}
      {activeTab === 'sima' && (
        <div>
          <div className={styles.formCard}>
            <div className={styles.formCardTitle}>
              <i className={`ti ${editingSimaId ? 'ti-pencil' : 'ti-plus-circle'}`} aria-hidden="true" />
              {editingSimaId ? 'Edit Teacher Data' : 'Add Teacher Data'}
            </div>

            {/* Baris 1: ID, Nama, Jabatan, Kelas */}
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  Teacher's ID <span className={styles.required}>*</span>
                </label>
                <input
                  name="guruId"
                  className={styles.input}
                  placeholder="e.g.: GR001"
                  value={simaForm.guruId}
                  onChange={handleSimaChange}
                  style={{ width: '110px' }}
                />
              </div>

              <div className={styles.formField} style={{ flex: 1 }}>
                <label className={styles.fieldLabel}>
                  Teacher's Name <span className={styles.required}>*</span>
                </label>
                <input
                  name="namaGuru"
                  className={styles.input}
                  placeholder="Full teacher name"
                  value={simaForm.namaGuru}
                  onChange={handleSimaChange}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Position</label>
                <select
                  name="jabatan"
                  className={styles.select}
                  value={simaForm.jabatan}
                  onChange={handleSimaChange}
                  style={{ width: '130px' }}
                >
                  {JABATAN_OPTIONS.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Teacher of</label>
                <select
                  name="kelasId"
                  className={styles.select}
                  value={simaForm.kelasId}
                  onChange={handleSimaChange}
                  style={{ width: '160px' }}
                >
                  <option value="">-- Select Class --</option>
                  {sortedClasses.map((k) => (
                    <option key={k.id} value={k.id}>{formatKelasLabel(k)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Baris 2: Radio Jenis Kelamin + Radio Guru English + Tombol */}
            <div className={styles.formRowSecond}>
              {/* Jenis Kelamin */}
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  Gender <span className={styles.required}>*</span>
                </label>
                <div className={styles.radioGroup}>
                  {GENDER_OPTIONS.map((opt) => (
                    <label key={opt.value} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="jenisKelamin"
                        value={opt.value}
                        checked={simaForm.jenisKelamin === opt.value}
                        onChange={() => handleSimaRadio('jenisKelamin', opt.value)}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioCustom} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Divider vertikal */}
              <div className={styles.fieldDivider} />

              {/* Guru English */}
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  English Teacher?
                </label>
                <div className={styles.radioGroup}>
                  {IS_ENGLISH_OPTIONS.map((opt) => (
                    <label key={String(opt.value)} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="isGuruEnglish"
                        checked={simaForm.isGuruEnglish === opt.value}
                        onChange={() => handleSimaRadio('isGuruEnglish', opt.value)}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioCustom} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Spacer + Buttons */}
              <div style={{ flex: 1 }} />
              <div className={styles.buttonGroup}>
                <button
                  className={styles.btnSave}
                  onClick={handleSimaSubmit}
                  disabled={isSubmitting}
                >
                  <i className="ti ti-device-floppy" aria-hidden="true" />
                  {isSubmitting ? 'Saving...' : editingSimaId ? 'Update' : 'Save'}
                </button>
                {editingSimaId && (
                  <button
                    className={styles.btnCancel}
                    onClick={() => { setSimaForm(EMPTY_SIMA_FORM); setEditingSimaId(null); }}
                  >
                    <i className="ti ti-x" aria-hidden="true" /> Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search & Tabel Guru SIMA */}
          <div className={styles.searchWrap}>
            <i className="ti ti-search" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search teacher by name or ID..."
              value={searchSima}
              onChange={(e) => setSearchSima(e.target.value)}
            />
          </div>

          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Position</th>
                  <th>English Teacher</th>
                  <th>Class</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingTeachers ? (
                  <tr><td colSpan={8} className={styles.emptyCell}>Loading data...</td></tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr><td colSpan={8} className={styles.emptyCell}>
                    {searchSima ? 'Teacher not found.' : 'No teacher data available.'}
                  </td></tr>
                ) : filteredTeachers.map((t, i) => (
                  <tr key={t.id}>
                    <td>{i + 1}</td>
                    <td className={styles.tdMuted}>{t.guruId}</td>
                    <td>{t.namaGuru}</td>
                    <td>
                      <span className={`${styles.badge} ${
                        t.jenisKelamin === 'Man' ? styles.badgeLaki : styles.badgePerempuan
                      }`}>
                        {t.jenisKelamin ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${jabatanBadgeClass(t.jabatan)}`}>
                        {t.jabatan}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${
                        t.isGuruEnglish ? styles.badgeEnglishYes : styles.badgeEnglishNo
                      }`}>
                        {t.isGuruEnglish ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className={styles.tdSmall}>{t.kelasNama || '—'}</td>
                    <td>
                      <div className={styles.tdActions}>
                        <button
                          className={styles.btnEdit}
                          onClick={() => handleSimaEdit(t)}
                          title="Edit"
                        >
                          <img src="/src/assets/edit.png" alt="Edit" />
                        </button>
                        <button
                          className={styles.btnDelete}
                          onClick={() => handleSimaDelete(t.id, t.namaGuru)}
                          title="Delete"
                        >
                          <img src="/src/assets/hapus.png" alt="Delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== PANEL GURU ENGLISH ===== */}
      {activeTab === 'english' && (
        <div>
          <div className={styles.formCard}>
            <div className={styles.formCardTitle}>
              <i className={`ti ${editingEnId ? 'ti-pencil' : 'ti-plus-circle'}`} aria-hidden="true" />
              {editingEnId ? 'Edit classes for English Teacher' : 'Adjusting classes for English Teacher'}
            </div>

            <div className={styles.enFormLayout}>
              {/* Kolom Kiri: Pilih Guru */}
              <div className={styles.enFormLeft}>
                <label className={styles.fieldLabel}>
                  Search & Select English Teacher{' '}
                  <span className={styles.required}>*</span>
                  <span className={styles.fieldHint}>
                    (only teachers marked as "English Teacher: Yes")
                  </span>
                </label>

                {/* Search input di dalam form */}
                <div className={styles.searchWrapInline}>
                  <i className="ti ti-search" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search teacher by name..."
                    value={searchEnForm}
                    onChange={(e) => setSearchEnForm(e.target.value)}
                  />
                  {searchEnForm && (
                    <button
                      className={styles.searchClearBtn}
                      onClick={() => setSearchEnForm('')}
                      title="Clear search"
                    >
                      <i className="ti ti-x" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Daftar guru yang bisa dipilih */}
                <div className={styles.teacherPickList}>
                  {englishEligibleTeachers.length === 0 ? (
                    <div className={styles.pickListEmpty}>
                        No teachers marked as "English Teacher: Yes". Please mark at least one teacher as English Teacher in the Teachers tab.
                    </div>
                  ) : filteredEnFormOptions.length === 0 ? (
                    <div className={styles.pickListEmpty}>
                      Teacher with name "{searchEnForm}" not found.
                    </div>
                  ) : (
                    filteredEnFormOptions.map((t) => {
                      const isSelected = enForm.teacherId === t.id;
                      const isRegistered = teachersEn.some(
                        (te) => te.teacherId === t.id
                      );
                      return (
                        <div
                          key={t.id}
                          className={`${styles.teacherPickItem} ${
                            isSelected ? styles.teacherPickItemActive : ''
                          }`}
                          onClick={() => handleEnTeacherSelect(t)}
                        >
                          <div className={styles.pickItemAvatar}>
                            {t.namaGuru.charAt(0).toUpperCase()}
                          </div>
                          <div className={styles.pickItemInfo}>
                            <span className={styles.pickItemName}>{t.namaGuru}</span>
                            <span className={styles.pickItemMeta}>{t.jabatan}</span>
                          </div>
                          {isRegistered && (
                            <span className={styles.pickItemBadgeRegistered}>
                              Registered
                            </span>
                          )}
                          {isSelected && (
                            <i className="ti ti-check" style={{ color: 'var(--color-primary-600)', fontSize: '16px', marginLeft: 'auto' }} aria-hidden="true" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Pilih Kelas */}
              <div className={styles.enFormRight}>
                <label className={styles.fieldLabel}>
                  Teaching Classes
                  <span className={styles.fieldHint}>(can select more than one)</span>
                </label>

                {/* Info guru yang dipilih */}
                {selectedEnTeacher ? (
                  <div className={styles.selectedTeacherInfo}>
                    <i className="ti ti-user-check" style={{ fontSize: '15px', color: 'var(--color-primary-500)' }} aria-hidden="true" />
                    <span>
                      <strong>{selectedEnTeacher.namaGuru}</strong>
                      {editingEnId && (
                        <span className={styles.editingBadge}>Edit Mode</span>
                      )}
                    </span>
                  </div>
                ) : (
                  <div className={styles.noTeacherSelected}>
                    <i className="ti ti-arrow-left" aria-hidden="true" />
                    Please select a teacher first
                  </div>
                )}

                {/* Checkbox kelas */}
                <div className={styles.kelasChecksWrap}>
                  {classes.length === 0 ? (
                    <p className={styles.hintText}>
                      No class data available. Please add classes first.
                    </p>
                  ) : (
                    <div className={styles.kelasChecksGrid}>
                      {sortedClasses.map((k) => (
                        <label key={k.id} className={styles.kelasPill}>
                          <input
                            type="checkbox"
                            checked={enForm.kelasIds.includes(k.id)}
                            onChange={(e) => handleKelasCheck(k, e.target.checked)}
                            disabled={!enForm.teacherId}
                          />
                          {formatKelasLabel(k)}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tombol aksi */}
                <div className={styles.buttonGroup} style={{ marginTop: '0.75rem' }}>
                  <button
                    className={styles.btnSave}
                    onClick={handleEnSubmit}
                    disabled={isSubmitting || !enForm.teacherId}
                  >
                    <i className="ti ti-device-floppy" aria-hidden="true" />
                    {isSubmitting ? 'Saving...' : editingEnId ? 'Update' : 'Save'}
                  </button>
                  {(editingEnId || enForm.teacherId) && (
                    <button className={styles.btnCancel} onClick={handleCancelEn}>
                      <i className="ti ti-x" aria-hidden="true" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Search & Tabel Guru English */}
          <div className={styles.searchWrap}>
            <i className="ti ti-search" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search English teacher by name..."
              value={searchEn}
              onChange={(e) => setSearchEn(e.target.value)}
            />
          </div>

          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Teacher Name</th>
                  <th>Teaching Classes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingEn ? (
                  <tr><td colSpan={4} className={styles.emptyCell}>Loading data...</td></tr>
                ) : filteredTeachersEn.length === 0 ? (
                  <tr><td colSpan={4} className={styles.emptyCell}>
                    {searchEn ? 'Teacher not found.' : 'No English teacher data yet.'}
                  </td></tr>
                ) : filteredTeachersEn.map((t, i) => (
                  <tr key={t.id}>
                    <td>{i + 1}</td>
                    <td>{t.namaGuru}</td>
                    <td className={styles.tdSmall}>
                      {(t.kelasNames ?? []).join(', ') || '—'}
                    </td>
                    <td>
                      <div className={styles.tdActions}>
                        <button
                          className={styles.btnEdit}
                          onClick={() => {
                            const teacher = teachers.find(
                              (x) => x.id === t.teacherId
                            );
                            if (teacher) handleEnTeacherSelect(teacher);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          title="Edit"
                        >
                          <img src="/src/assets/edit.png" alt="Edit" />
                        </button>
                        <button
                          className={styles.btnDelete}
                          onClick={() => handleEnDelete(t.id, t.namaGuru)}
                          title="Delete"
                        >
                          <img src="/src/assets/hapus.png" alt="Delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        variant="danger"
        title={`${deleteTarget?.type === 'english' ? 'Delete English Teacher Data' : 'Delete Teacher Data'}?`}
        message={`"${deleteTarget?.nama}" will be permanently deleted from the teacher list${deleteTarget?.type === 'english' ? ' English' : ''}. This action cannot be undone.`}
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

export default DataGuruPage;