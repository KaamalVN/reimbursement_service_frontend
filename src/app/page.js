'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Import the Auth context
import styles from '@/styles/Login.module.css';

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
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
    const success = await login(credentials.email, credentials.password);
    if (!success) {
      alert('Invalid credentials'); // Show alert for invalid credentials
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
            />
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className={styles.loginBtn}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
