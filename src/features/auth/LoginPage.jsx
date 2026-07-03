import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithUsername } from '../../firebase/authService';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Hapus pesan error saat user mulai mengetik lagi
    if (errorMessage) setErrorMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;

    if (!username.trim() || !password) {
      setErrorMessage('Username and Password is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const userData = await loginWithUsername(username.trim(), password);
      setCurrentUser(userData);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Tangani pesan error yang ramah pengguna
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        setErrorMessage('Username or Password is not match.');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage('Too many attempts. Please try again later.');
      } else {
        setErrorMessage(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      // Selalu jalankan ini — baik berhasil maupun gagal
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Panel Kiri — Branding */}
      <div className={styles.brandPanel}>
        <div className={styles.brandCircle1} />
        <div className={styles.brandCircle2} />
        <div className={styles.brandCircle3} />
        <div className={styles.brandContent}>
          <div className={styles.logoText}>
            <span className={styles.logoWord1}>arkan </span>
            <span className={styles.logoWord2}>bridge</span>
          </div>
          <p className={styles.logoTagline}>
            Bilingual Report & Interactive Digital Guide for Education
          </p>
        </div>
      </div>

      {/* Panel Kanan — Form Login */}
      <div className={styles.formPanel}>
        <div className={styles.formHeader}>
          <div className={styles.formLogo}>
            <span className={styles.logoWord1}>arkan </span>
            <span className={styles.logoWord2}>bridge</span>
          </div>
          <p className={styles.formSubtitle}>Sign In to Your Account</p>
        </div>

        <form className={styles.form} onSubmit={handleLoginSubmit} noValidate>
          <div className={styles.fieldGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          {errorMessage && (
            <p className={styles.errorText} role="alert">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.footerNote}>
          Forgot password? Contact Super Admin.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;