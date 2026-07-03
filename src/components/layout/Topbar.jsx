import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../firebase/authService';
import { useState } from 'react';
import ConfirmModal from '../common/ConfirmModal';
import styles from './Topbar.module.css';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/kelas':     'Class Data',
  '/guru':      'Teacher Data',
  '/siswa':     'Student Data',
  '/target':    'Manage Targets',
  '/settings':  'Settings',
};

const Topbar = () => {
  const { currentUser } = useAuth();
  const { pathname } = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutConfirm = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout gagal:', error);
    } finally {
      setShowLogoutModal(false);
    }
  };

  /* const pageTitle = PAGE_TITLES[pathname] ?? 'Arkan Bridge'; */

  // Ambil inisial nama untuk avatar
  const avatarInitials = (currentUser?.name ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
        <ConfirmModal
        isOpen={showLogoutModal}
        variant="warning"
        title="Log Out"
        message="You will be logged out of this session. Make sure all data is saved before logging out"
        confirmLabel="Yes, Logout"
        cancelLabel="No, Back"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    
    <header className={styles.topbar}>
      <div className={styles.logoText}>
        <span className={styles.logoWord1}>arkan </span>
        <span className={styles.logoWord2}>bridge</span>
      </div>
      <div className={styles.rightArea}>
        <button
          className={styles.logoutButton}
          onClick={() => setShowLogoutModal(true)}
        >
          <i className="ti ti-logout" aria-hidden="true" />
          Log out
        </button>
      </div>
      {/*<div className={styles.avatarButton} title={currentUser?.name}>
        {avatarInitials}
      </div>*/}
    </header>
    </>
  );
};

export default Topbar;