import { useState, useEffect, useCallback } from 'react';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import SkillEditor from './SkillEditor';
import { getTargetByKelas } from './targetsService';
import styles from './AturTargetPage.module.css';

const SKILLS = ['listening', 'speaking', 'reading', 'writing'];

const SkillDetailPanel = ({
  kelasNumber,
  onBack,
  onDirtyChange,
  externalSaveRequested,
  onExternalSaveCompleted,
}) => {
  const [activeSkill,   setActiveSkill]   = useState('listening');
  const [pendingSkill,  setPendingSkill]  = useState(null);
  const [skillData,     setSkillData]     = useState({});
  const [isLoading,     setIsLoading]     = useState(true);
  const [isDirty,       setIsDirty]       = useState(false);
  const [showTabModal,  setShowTabModal]  = useState(false);
  const [saveRequested, setSaveRequested] = useState(false);
  const [toast,         setToast]         = useState({ message: '', type: 'success' });

  useEffect(() => {
    setIsLoading(true);
    getTargetByKelas(kelasNumber).then((result) => {
      if (result) setSkillData(result);
      setIsLoading(false);
    });
  }, [kelasNumber]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Propagate isDirty ke parent (AturTargetPage) untuk blokir navigasi sidebar
  const handleDirtyChange = useCallback((dirty) => {
    setIsDirty(dirty);
    onDirtyChange?.(dirty);
  }, [onDirtyChange]);

  // Saat parent minta save (dari modal navigasi sidebar/back)
  useEffect(() => {
    if (externalSaveRequested) setSaveRequested(true);
  }, [externalSaveRequested]);

  // Dipanggil SkillEditor setelah save selesai
  const handleSkillSaved = (skillKey, newData) => {
    setSkillData((prev) => ({ ...prev, [skillKey]: newData }));
    handleDirtyChange(false);
    setSaveRequested(false);

    // Kalau ada pending tab → pindah tab setelah save
    if (pendingSkill) {
      setActiveSkill(pendingSkill);
      setPendingSkill(null);
      setShowTabModal(false);
    }

    // Beritahu parent bahwa external save sudah selesai
    if (externalSaveRequested) {
      onExternalSaveCompleted?.();
    }
  };

  // ===== Tab click — cek dirty dulu =====
  const handleTabClick = (skill) => {
    if (skill === activeSkill) return;
    if (isDirty) {
      setPendingSkill(skill);
      setShowTabModal(true);
    } else {
      setActiveSkill(skill);
    }
  };

  // Modal tab: "Save Data" → simpan dulu lalu pindah
  const handleTabModalSave = () => {
    setShowTabModal(false);
    setSaveRequested(true);
  };

  // Modal tab: "Continue to ..." → cancel = tetap di tab ini
  const handleTabModalCancel = () => {
    setShowTabModal(false);
    setPendingSkill(null);
  };

  const pendingSkillLabel = pendingSkill
    ? pendingSkill.charAt(0).toUpperCase() + pendingSkill.slice(1)
    : '';

  return (
    <div>
      {/* Modal konfirmasi pindah tab */}
      <ConfirmModal
        isOpen={showTabModal}
        variant="info"
        title="There are unsaved changes!"
        message={`You have unsaved changes in this tab. Save now and proceed to the ${pendingSkillLabel} tab or continue to editing?`}
        confirmLabel="Save Data"
        cancelLabel={`Continue to Editing`}
        onConfirm={handleTabModalSave}
        onCancel={handleTabModalCancel}
      />

      {/* Back button */}
      <div className={styles.detailHeader}>

        <h3 className={styles.detailTitle}>{kelasNumber}</h3>

        <div className={styles.tabsRow}>
          <button className={styles.backBtn} onClick={onBack}>
            <img src="/assets/back.png" alt="Back" />
            Back
          </button>

          <div className={styles.skillTabs}>
            {SKILLS.map((skill) => (
              <button
                key={skill}
                className={`${styles.skillTab} ${
                  activeSkill === skill ? styles.skillTabActive : ''
                }`}
                onClick={() => handleTabClick(skill)}
              >
                {skill.charAt(0).toUpperCase() + skill.slice(1)}
                {/* Titik kuning — indikator perubahan belum disimpan */}
                {isDirty && activeSkill === skill && (
                  <span className={styles.dirtyDot} title="There are unsaved changes" />
                )}
              </button>
            ))}
          </div>

          <button className={styles.saveBtn} onClick={handleTabModalSave}>
            <img src="/assets/save.png" alt="Save" />
            Save
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className={styles.loadingText}>Loading data...</p>
      ) : (
        <SkillEditor
          kelasNumber={kelasNumber}
          skillKey={activeSkill}
          initialData={skillData[activeSkill] ?? {}}
          onSaved={handleSkillSaved}
          onDirtyChange={handleDirtyChange}
          saveRequested={saveRequested}
          showToast={showToast}
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default SkillDetailPanel;
