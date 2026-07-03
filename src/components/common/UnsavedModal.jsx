import styles from './UnsavedModal.module.css';

/**
 * Modal konfirmasi khusus untuk unsaved changes dengan 3 pilihan.
 *
 * Props:
 * - isOpen         : boolean
 * - pageName       : string  → nama halaman/tab yang ditinggalkan
 * - onSave         : func    → simpan semua lalu keluar
 * - onLeave        : func    → keluar tanpa simpan
 * - onStay         : func    → edit kembali (tutup modal)
 * - isSaving       : boolean → loading state saat save
 */
const UnsavedModal = ({
  isOpen,
  pageName = 'halaman ini',
  onSave,
  onLeave,
  onStay,
  isSaving = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-title"
    >
      <div className={styles.modal}>
        {/* Icon */}
        <div className={styles.iconWrap}>
          <i className="ti ti-edit-off" aria-hidden="true" />
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h3 id="unsaved-title" className={styles.title}>
            Perubahan Belum Disimpan
          </h3>
          <p className={styles.message}>
            Kamu memiliki perubahan yang belum disimpan di{' '}
            <strong>{pageName}</strong>. Pilih salah satu tindakan di bawah ini.
          </p>
        </div>

        {/* 3 Pilihan */}
        <div className={styles.actions}>
          {/* Pilihan 1: Simpan semua */}
          <button
            className={styles.btnSave}
            onClick={onSave}
            disabled={isSaving}
          >
            <i className="ti ti-device-floppy" aria-hidden="true" />
            {isSaving ? 'Menyimpan...' : 'Simpan Semua Data'}
          </button>

          {/* Pilihan 2: Keluar tanpa simpan */}
          <button
            className={styles.btnLeave}
            onClick={onLeave}
            disabled={isSaving}
          >
            <i className="ti ti-door-exit" aria-hidden="true" />
            Keluar Tanpa Menyimpan
          </button>

          {/* Pilihan 3: Kembali edit */}
          <button
            className={styles.btnStay}
            onClick={onStay}
            disabled={isSaving}
          >
            <i className="ti ti-arrow-back" aria-hidden="true" />
            Edit Kembali
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedModal;