import styles from './ConfirmModal.module.css';

/**
 * Reusable confirmation modal.
 *
 * Props:
 * - isOpen       : boolean
 * - title        : string
 * - message      : string
 * - confirmLabel : string  → teks tombol konfirmasi utama
 * - cancelLabel  : string  → teks tombol sekunder
 * - onConfirm    : func    → aksi tombol konfirmasi
 * - onCancel     : func    → aksi tombol sekunder
 * - variant      : 'warning' | 'danger' | 'info'
 */
const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel  = 'Batal',
  onConfirm,
  onCancel,
  variant = 'warning',
  hideCancelButton = false,
}) => {
  if (!isOpen) return null;

  const iconMap = {
    warning : 'ti-alert-triangle',
    danger  : 'ti-alert-circle',
    info    : 'ti-info-circle',
  };

  return (
    // Overlay — klik di luar modal = cancel
    <div
      className={styles.overlay}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Hentikan propagasi supaya klik di dalam modal tidak trigger onCancel */}
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`${styles.iconWrap} ${styles[variant]}`}>
          <i className={`ti ${iconMap[variant]}`} aria-hidden="true" />
          <img src="/assets/alert.png" alt="Warning" />
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h3 id="modal-title" className={styles.title}>{title}</h3>
          <p className={styles.message}>{message}</p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {!hideCancelButton && (
            <button
              className={styles.btnCancel}
              onClick={onCancel}
            >
              {cancelLabel}
          </button>
          )}
          <button
            className={`${styles.btnConfirm} ${styles[`btnConfirm_${variant}`]}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;