import { useState, useEffect } from 'react';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import SkillDetailPanel from './SkillDetailPanel';
import {
  KELAS_LIST,
  getTargetByKelas,
  saveTargetOverview,
} from './targetsService';
import styles from './AturTargetPage.module.css';
import ReportModal from './ReportModal';

// ===== Sub-komponen: Overview Row =====
// Diletakkan di sini karena sangat tightly coupled dengan AturTargetPage
// dan tidak dipakai di tempat lain.
const TargetOverviewRow = ({ kelasNumber, onOpenDetail }) => {
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fokusUtama: '', outputDiKelas: '', outputPembelajaran: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    getTargetByKelas(kelasNumber).then((result) => {
      if (result) {
        setData(result);
        setForm({
          fokusUtama: result.fokusUtama ?? '',
          outputDiKelas: result.outputDiKelas ?? '',
          outputPembelajaran: result.outputPembelajaran ?? '',
        });
      }
    });
  }, [kelasNumber]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveTargetOverview(kelasNumber, form);
      setData((prev) => ({ ...prev, ...form }));
      setIsEditing(false);
      setToast({ message: `Target ${kelasNumber} saved successfully!`, type: 'success' });
    } catch {
      setToast({ message: 'Failed to save. Please try again.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className={styles.overviewRow}>
        {/* Kelas box — klik untuk buka detail */}
        <div className={styles.overviewKelasCell}>
          <div
            className={styles.kelasBox}
            onClick={() => onOpenDetail(kelasNumber)}
            title={`Open detail target ${kelasNumber}`}
          >
            <span className={styles.kelasBoxLabel} />
            <span className={styles.kelasBoxNum}>{kelasNumber}</span>
            <span className={styles.kelasBoxHint}>
              <i className="ti ti-chevron-right" aria-hidden="true" /> Menu Detail
            </span>
          </div>
        </div>

        {/* Fields */}
        <div className={styles.overviewFields}>
          {[
            { key: 'fokusUtama', label: 'Main Focus', placeholder: 'e.g: Mastery of basic vocabulary' },
            { key: 'outputDiKelas', label: 'English Classroom', placeholder: 'e.g: Able to communicate simply' },
            { key: 'outputPembelajaran', label: 'Applied in Use', placeholder: 'e.g: Students can greet in English' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className={styles.overviewFieldGroup}>
              <span className={styles.overviewFieldLabel}>{label}</span>
              {isEditing ? (
                <textarea
                  className={styles.overviewTextarea}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  rows={3}
                />
              ) : (
                <p className={styles.overviewFieldValue}>
                  {data?.[key] || (
                    <span className={styles.overviewEmpty}>Not filled yet</span>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Action */}
        <div className={styles.overviewAction}>
          {isEditing ? (
            <>
              <button
                className={styles.btnSave}
                onClick={handleSave}
                disabled={isSaving}
                title="Save"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                className={styles.btnCancel}
                onClick={() => setIsEditing(false)}
                title="Cancel"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className={styles.btnEditOverview}
              onClick={() => setIsEditing(true)}
              title={`Edit target ${kelasNumber}`}
            >
              <img src="/assets/edit.png" alt="Edit" />
            </button>
          )}
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ message: '', type: 'success' })}
      />
    </>
  );
};

// ===== MAIN PAGE =====
const AturTargetPage = () => {
  const [detailKelas, setDetailKelas] = useState(null);
  const [isPanelDirty, setIsPanelDirty] = useState(false);
  const [triggerSaveAll, setTriggerSaveAll] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleOpenDetail = (kelas) => {
    setDetailKelas(kelas);
    setIsPanelDirty(false);
  };

  const handleBackRequest = () => {
    if (isPanelDirty) {
      setPendingNav({ type: 'back' });
      setShowNavModal(true);
    } else {
      setDetailKelas(null);
    }
  };

  // Dipanggil SkillDetailPanel setelah external save selesai
  const handlePanelSaveCompleted = () => {
    setIsPanelDirty(false);
    setTriggerSaveAll(false);
    if (pendingNav?.type === 'back') setDetailKelas(null);
    setPendingNav(null);
    setShowNavModal(false);
  };

  const handleNavModalSave = () => {
    setTriggerSaveAll(true);
  };

  const handleNavModalDiscard = () => {
    setShowNavModal(false);
    setPendingNav(null);
  };

  // ===== Render: Detail Panel =====
  if (detailKelas) {
    return (
      <>
        <ConfirmModal
          isOpen={showNavModal}
          variant="warning"
          title="There are unsaved changes!"
          message="Save all changes before leaving, or stay on this page to continue editing?"
          confirmLabel="Save Changes"
          cancelLabel="Continue Editing"
          onConfirm={handleNavModalSave}
          onCancel={handleNavModalDiscard}
        />

        <SkillDetailPanel
          kelasNumber={detailKelas}
          onBack={handleBackRequest}
          onDirtyChange={setIsPanelDirty}
          externalSaveRequested={triggerSaveAll}
          onExternalSaveCompleted={handlePanelSaveCompleted}
        />
      </>
    );
  }

  // ===== Render: Overview Table =====
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Manage Targets</h2>
          <p className={styles.pageSubtitle}>
            Click the <strong>pencil</strong> icon to edit the focus and output for each class.
            Click the "Menu Detail" button to manage Listening, Speaking, Reading, and Writing content.
          </p>
        </div>
        {/* Tombol Cetak Laporan */}
        <button
          className={styles.btnPrintReport}
          onClick={() => setShowReportModal(true)}
        >
          <img src="/assets/print.png" alt="" />
          Print Report
        </button>
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      <div className={styles.overviewTable}>
        {/* Header kolom */}
        <div className={styles.overviewHeaderRow}>
          <div className={styles.overviewKelasCell} />
          <div className={styles.overviewFields}>
            <div className={styles.overviewColHeader}>Main Focus</div>
            <div className={styles.overviewColHeader}>English Classroom</div>
            <div className={styles.overviewColHeader}>Applied in Use</div>
          </div>
          <div className={styles.overviewAction} />
        </div>

        {KELAS_LIST.map((kelas) => (
          <TargetOverviewRow
            key={kelas}
            kelasNumber={kelas}
            onOpenDetail={handleOpenDetail}
          />
        ))}
      </div>
    </div>
  );
};

export default AturTargetPage;
