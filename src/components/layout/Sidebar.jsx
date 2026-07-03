import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../firebase/authService';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import ConfirmModal from '../common/ConfirmModal';
import styles from './Sidebar.module.css';

import dashboardIcon from '../../assets/home.png';

const NAV_ITEMS = [
  /* { path: '/dashboard', label: 'Dashboard',    icon: dashboardIcon },
  { path: '/kelas',     label: 'Class Data',   icon: 'ti-school' },
  { path: '/guru',      label: 'Teacher Data', icon: 'ti-users' },
  { path: '/siswa',     label: 'Student Data', icon: 'ti-id-badge-2' }, */
  { path: '/target', label: 'Manage Targets', icon: 'ti-target' },
  { path: '/settings', label: 'Settings', icon: 'ti-settings' },
];

const Sidebar = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
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

  const roleLabel =
    currentUser?.role === 'super_admin' ? 'Super Admin'
      : currentUser?.role === 'admin' ? 'Admin'
        : 'Guru English';

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

      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logoText}>
            <span className={styles.logoWord1}>arkan </span>
            <span className={styles.logoWord2}>bridge</span>
          </div>
          <span className={styles.roleLabel}>{roleLabel}</span>
        </div>

        <nav className={styles.nav}>
          <span className={styles.navSectionLabel}>Main Menu</span>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <i className={`ti ${item.icon} ${styles.navIcon}`} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.bottomArea}>
          <button
            className={styles.logoutButton}
            onClick={() => setShowLogoutModal(true)}
          >
            <i className="ti ti-logout" aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;