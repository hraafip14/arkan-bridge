import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styles from './AppShell.module.css';

/**
 * AppShell adalah "rangka" tampilan setelah login.
 * Sidebar + Topbar selalu tampil, konten halaman
 * dirender oleh <Outlet /> sesuai route aktif.
 */
const AppShell = () => {
  return (
    <div className={styles.shell}>
      {/* <Sidebar /> */}
      <div className={styles.mainArea}>
        <Topbar />
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;