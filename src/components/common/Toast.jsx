import { useEffect } from 'react';
import styles from './Toast.module.css';

/**
 * Komponen Toast untuk notifikasi singkat.
 *
 * Props:
 * - message   : string  → pesan yang ditampilkan
 * - type      : 'success' | 'error'
 * - onDismiss : func    → dipanggil saat toast selesai/ditutup
 */
const Toast = ({ message, type = 'success', onDismiss }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 2800);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <img
        src={type === 'success' ? '/assets/berhasil.png' : '/assets/gagal.png'}
        alt={type === 'success' ? 'Berhasil' : 'Gagal'}
        className={styles.icon}
      />
      <span>{message}</span>
    </div>
  );
};

export default Toast;