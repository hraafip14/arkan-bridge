import { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import useCollection from '../../hooks/useCollection';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  createUserAccount,
  updateUserAccount,
  deleteUserAccount,
  updateOwnProfile,
  changeOwnPassword,
} from './settingsService';
import styles from './SettingsPage.module.css';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'guru_english', label: 'English Teacher' },
];

const EMPTY_ACCOUNT_FORM = {
  name: '', username: '', password: '',
  role: 'guru_english', teacherId: '',
};

const SettingsPage = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const { data: teachersEn } = useCollection('teachersEnglish');
  const { data: allUsers } = useCollection('users');

  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Filter: hanya tampilkan admin & guru_english (bukan super_admin sendiri)
  const managedUsers = allUsers.filter(
    (u) => u.role !== 'super_admin' && u.id !== currentUser?.uid
  );

  // ===== State: Edit Profil =====
  const [isEditProfile, setIsEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name ?? '',
    username: currentUser?.username ?? '',
  });

  // ===== State: Ganti Password =====
  const [isChangePass, setIsChangePass] = useState(false);
  const [passForm, setPassForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  // ===== State: Form Akun (Buat/Edit) =====
  const [accountForm, setAccountForm] = useState(EMPTY_ACCOUNT_FORM);
  const [editingUid, setEditingUid] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ message: msg, type });
  }, []);

  // ===== Handler: Pilih guru english di dropdown =====
  // Cek apakah guru sudah punya akun → mode edit otomatis
  const handleTeacherSelect = (e) => {
    const tid = e.target.value;
    const teacher = teachersEn.find((t) => t.id === tid);
    const existingUser = allUsers.find(
      (u) => u.teacherId === tid && u.role === 'guru_english'
    );
    if (existingUser) {
      // Mode edit
      setEditingUid(existingUser.id);
      setAccountForm({
        name: existingUser.name,
        username: existingUser.username,
        password: existingUser.password ?? '',
        role: existingUser.role,
        teacherId: tid,
      });
    } else {
      setEditingUid(null);
      setAccountForm((prev) => ({
        ...prev,
        teacherId: tid,
        name: teacher?.namaGuru ?? '',
      }));
    }
  };

  // ===== Handler: Klik edit di tabel =====
  const handleEditUser = (user) => {
    setEditingUid(user.id);
    setAccountForm({
      name: user.name,
      username: user.username,
      password: user.password ?? '',
      role: user.role,
      teacherId: user.teacherId ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ===== Handler: Simpan akun (buat/edit) =====
  const handleAccountSave = async () => {
    const { name, username, password, role, teacherId } = accountForm;
    if (!name.trim() || !username.trim() || !password) {
      showToast('Full name, username, and password are required!', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters!', 'error');
      return;
    }
    if (role === 'guru_english' && !teacherId) {
      showToast('Please select an English teacher!', 'error');
      return;
    }
    setIsSaving(true);
    try {
      if (editingUid) {
        await updateUserAccount(editingUid, { name, username, password, role, teacherId });
        showToast('Account successfully updated!');
      } else {
        await createUserAccount({ name, username, password, role, teacherId });
        showToast(`Account "${username}" successfully created!`);
      }
      setAccountForm(EMPTY_ACCOUNT_FORM);
      setEditingUid(null);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showToast('Username already in use!', 'error');
      } else {
        showToast('Failed to save account. Please try again.', 'error');
        console.error(error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ===== Handler: Hapus akun =====
  const handleDeleteUser = (user) => {
    setDeleteTarget({ id: user.id, username: user.username });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUserAccount(deleteTarget.id);
      showToast(`User account "${deleteTarget.username}" successfully deleted.`);
      if (editingUid === deleteTarget.id) {
        setAccountForm(EMPTY_ACCOUNT_FORM);
        setEditingUid(null);
      }
    } catch {
      showToast('Failed to delete account. Please try again.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // ===== Handler: Edit profil sendiri =====
  const handleProfileSave = async () => {
    if (!profileForm.name.trim() || !profileForm.username.trim()) {
      showToast('Full name and username are required!', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await updateOwnProfile(currentUser.uid, profileForm);
      setCurrentUser((prev) => ({ ...prev, ...profileForm }));
      setIsEditProfile(false);
      showToast('Profile successfully updated!');
    } catch {
      showToast('Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ===== Handler: Ganti password =====
  const handlePasswordSave = async () => {
    const { currentPassword, newPassword, confirmPassword } = passForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('All fields are required!', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters!', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Password confirmation does not match!', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await changeOwnPassword(currentPassword, newPassword);
      setIsChangePass(false);
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password successfully changed!');
    } catch (error) {
      if (error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential') {
        showToast('Current password is incorrect!', 'error');
      } else {
        showToast('Failed to change password.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const roleDisplay = {
    super_admin: 'Super Admin', admin: 'Admin', guru_english: 'English Teacher',
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Settings</h2>
        <p className={styles.pageSubtitle}>
          Manage your account settings and user accounts (Admin only). Update your profile information, change password, and for Super Admin: create, edit, or delete user accounts for Admins and English Teacher.
        </p>
      </div>

      <div className={styles.settingsLayout}>

        {/* ===== KOLOM KIRI ===== */}
        <div className={styles.leftCol}>

          {/* Card: Profil */}
          <div className={styles.settingsCard}>
            <div className={styles.cardTitle}>
              <i className="ti ti-user-circle" aria-hidden="true" />
              Personal Setting
            </div>
            {isEditProfile ? (
              <>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Full name"
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    Username <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    value={profileForm.username}
                    onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                    placeholder="New username"
                  />
                </div>
                <div className={styles.btnRow}>
                  <button className={styles.btnSave} onClick={handleProfileSave} disabled={isSaving}>
                    <i className="ti ti-device-floppy" aria-hidden="true" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button className={styles.btnCancel} onClick={() => setIsEditProfile(false)}>
                    <i className="ti ti-x" aria-hidden="true" /> Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.profileField}>
                  <span className={styles.profileLabel}>Nama</span>
                  <span className={styles.profileValue}>{currentUser?.name}</span>
                </div>
                <div className={styles.profileField}>
                  <span className={styles.profileLabel}>Username</span>
                  <span className={styles.profileValue}>{currentUser?.username}</span>
                </div>
                <div className={styles.profileField}>
                  <span className={styles.profileLabel}>Role</span>
                  <span className={`${styles.profileValue} ${styles.roleBadge}`}>
                    {roleDisplay[currentUser?.role]}
                  </span>
                </div>
                <button className={styles.btnEditProfile} onClick={() => {
                  setProfileForm({ name: currentUser?.name ?? '', username: currentUser?.username ?? '' });
                  setIsEditProfile(true);
                }}>
                  <i className="ti ti-pencil" aria-hidden="true" /> Edite Profile
                </button>
              </>
            )}
          </div>

          {/* Card: Ganti Password */}
          <div className={styles.settingsCard}>
            <div className={styles.cardTitle}>
              <i className="ti ti-lock" aria-hidden="true" /> Account Security
            </div>
            {isChangePass ? (
              <>
                {[
                  { key: 'currentPassword', label: 'Current Password', ph: 'Enter your current password' },
                  { key: 'newPassword', label: 'New Password', ph: 'Minimum 8 characters' },
                  { key: 'confirmPassword', label: 'Confirm New Password', ph: 'Re-enter new password' },
                ].map(({ key, label, ph }) => (
                  <div key={key} className={styles.formField}>
                    <label className={styles.fieldLabel}>{label}</label>
                    <input
                      className={styles.input}
                      type="password"
                      placeholder={ph}
                      value={passForm[key]}
                      onChange={(e) => setPassForm((p) => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className={styles.btnRow}>
                  <button className={styles.btnSave} onClick={handlePasswordSave} disabled={isSaving}>
                    <i className="ti ti-device-floppy" aria-hidden="true" />
                    {isSaving ? 'Saving...' : 'Save Password'}
                  </button>
                  <button className={styles.btnCancel} onClick={() => setIsChangePass(false)}>
                    <i className="ti ti-x" aria-hidden="true" /> Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.profileField}>
                  <span className={styles.profileLabel}>Password</span>
                  <span className={styles.profileValueMasked}>••••••••••••</span>
                </div>
                <button className={styles.btnEditProfile} onClick={() => setIsChangePass(true)}>
                  <i className="ti ti-key" aria-hidden="true" /> Change Password
                </button>
              </>
            )}
          </div>
        </div>

        {/*
        ===== KOLOM KANAN: Buat/Edit Akun (Super Admin only) =====
        {isSuperAdmin && (
          <div className={styles.rightCol}>
            <div className={styles.settingsCard}>
              <div className={styles.cardTitle}>
                <i className="ti ti-user-plus" aria-hidden="true" />
                {editingUid ? 'Edit User Account' : 'Add New User Account'}
              </div>

              <div className={styles.infoBox}>
                <i className="ti ti-info-circle" aria-hidden="true" />
                {editingUid
                  ? 'Update user account information below.'
                  : 'Create a login account for Admin or English Teacher.'}
              </div>

              === Role ===
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Role <span className={styles.required}>*</span></label>
                <div className={styles.roleOptions}>
                  {ROLE_OPTIONS.map((opt) => (
                    <label key={opt.value} className={styles.roleOption}>
                      <input
                        type="radio"
                        name="newRole"
                        value={opt.value}
                        checked={accountForm.role === opt.value}
                        onChange={() => setAccountForm((p) => ({
                          ...p, role: opt.value,
                          teacherId: opt.value !== 'guru_english' ? '' : p.teacherId,
                        }))}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioCustom} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              === Dropdown guru english ===
              {accountForm.role === 'guru_english' && (
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    English Teacher <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.select}
                    value={accountForm.teacherId}
                    onChange={handleTeacherSelect}
                  >
                    <option value="">-- Select English Teacher --</option>
                    {teachersEn.map((t) => (
                      <option key={t.id} value={t.id}>{t.namaGuru}</option>
                    ))}
                  </select>
                  {editingUid && (
                    <span className={styles.fieldHint}>
                      This teacher already has an account — edit mode is active.
                    </span>
                  )}
                </div>
              )}

              === Nama ===
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  Full Name <span className={styles.required}>*</span>
                </label>
                <input
                  className={styles.input}
                  placeholder="Full name of the user"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              === Username ===
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  Username <span className={styles.required}>*</span>
                </label>
                <input
                  className={styles.input}
                  placeholder="e.g: AdminArkan"
                  value={accountForm.username}
                  onChange={(e) => setAccountForm((p) => ({ ...p, username: e.target.value }))}
                />
              </div>

              === Password ===
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  Password <span className={styles.required}>*</span>
                </label>
                <input
                  className={styles.input}
                  type="text"   // type text supaya super admin bisa lihat
                  placeholder="Minimum 8 characters"
                  value={accountForm.password}
                  onChange={(e) => setAccountForm((p) => ({ ...p, password: e.target.value }))}
                />
              </div>

              <div className={styles.btnRow}>
                <button
                  className={styles.btnCreateAccount}
                  onClick={handleAccountSave}
                  disabled={isSaving}
                >
                  <i className={`ti ${editingUid ? 'ti-device-floppy' : 'ti-user-plus'}`} aria-hidden="true" />
                  {isSaving ? 'Saving...' : editingUid ? 'Update Account' : 'Create Account'}
                </button>
                {editingUid && (
                  <button
                    className={styles.btnCancel}
                    onClick={() => { setAccountForm(EMPTY_ACCOUNT_FORM); setEditingUid(null); }}
                  >
                    <i className="ti ti-x" aria-hidden="true" /> Batal
                  </button>
                )}
              </div>
            </div>
          </div>
        )} */}
      </div>

      {/*
      ===== TABEL USER =====
      <div className={styles.userTableSection}>
        <div className={styles.userTableHeader}>
          <div className={styles.cardTitle} style={{ marginBottom: 0 }}>
            <i className="ti ti-users" aria-hidden="true" />
            User Accounts
          </div>
        </div>
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>No</th>
                <th>Full Name</th>
                <th>Username</th>
                <th>Role</th>
                {isSuperAdmin && <th>Password</th>}
                {isSuperAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {managedUsers.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 6 : 4} className={styles.emptyCell}>
                    No users found.
                  </td>
                </tr>
              ) : (
                managedUsers.map((user, i) => (
                  <tr key={user.id}>
                    <td>{i + 1}</td>
                    <td>{user.name}</td>
                    <td className={styles.tdMono}>{user.username}</td>
                    <td>
                      <span className={`${styles.badge} ${
                        user.role === 'admin' ? styles.badgeAdmin : styles.badgeGuru
                      }`}>
                        {roleDisplay[user.role] ?? user.role}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td className={styles.tdMono}>
                        {user.password ?? '—'}
                      </td>
                    )}
                    {isSuperAdmin && (
                      <td>
                        <div className={styles.tdActions}>
                          <button
                            className={styles.btnEdit}
                            onClick={() => handleEditUser(user)}
                            title="Edit akun"
                          >
                            <i className="ti ti-pencil" aria-hidden="true" />
                          </button>
                          <button
                            className={styles.btnDelete}
                            onClick={() => handleDeleteUser(user)}
                            title="Hapus akun"
                          >
                            <i className="ti ti-trash" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        variant="danger"
        title="Delete User Account?"
        message={`User account "${deleteTarget?.username}" will be permanently deleted. The user will not be able to log in again after this.`}
        confirmLabel="Yes, Delete Account"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ message: '', type: 'success' })}
      /> */}
    </div>
  );
};

export default SettingsPage;