'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Import the Auth context
import styles from '@/styles/Login.module.css';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri'; // Import icons

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false); // For password visibility toggle
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const { login, user } = useAuth(); // Destructure login and user from Auth context
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role_id === 'productAdmin') {
        router.push('/companies');
      } else if (user.role_id === 'companyAdmin') {
        router.push('/mycompany');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMessage = await login(credentials.email, credentials.password);
    if (errorMessage) {
      alert(errorMessage); // Display specific error message
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1>Welcome Back</h1>
        <p>Please sign in to continue</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              placeholder="Enter your email"
              className={errorMessage.includes('Email') ? styles.errorInput : ''} // Add error class
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'} // Toggle input type
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Enter your password"
                className={`${styles.passwordInput} ${errorMessage.includes('Password') ? styles.errorInput : ''}`} // Add error class
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // Toggle visibility
                className={styles.iconBtn}
              >
                {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
          </div>

          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>} {/* Display error message */}

          <button type="submit" className={styles.loginBtn}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
