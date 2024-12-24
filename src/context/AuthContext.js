'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Safely access localStorage and validate the token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        // Validate token with backend
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/validate-token`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Token validation failed');
            }
            return response.json();
          })
          .then((data) => {
            setUser(data.user); // Assuming the backend sends user data
            console.log('User details:', data.user); // Debugging

            // Redirect based on user role
            if (data.user.role === 'productAdmin') {
              router.push('/companies'); // Redirect to Companies page
            } else if (data.user.role === 'companyAdmin') {
              router.push('/mycompany'); // Redirect to My Company page
            }
          })
          .catch(() => {
            logout(); // Logout if token validation fails
          });
      } else if (window.location.pathname !== '/') {
        router.push('/'); // Redirect to login if no token
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      if (typeof window !== 'undefined') {
        // Perform login API call
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error('Login failed');
        }

        const data = await response.json();
        const { token, user: loggedInUser } = data;

        localStorage.setItem('token', token); // Store token
        setUser(loggedInUser);
        console.log('User logged in:', loggedInUser); // Debugging

        // Redirect based on role_id
        if (loggedInUser.role_id === 'productAdmin') {
          router.push('/companies');
        } else if (loggedInUser.role_id === 'companyAdmin') {
          router.push('/mycompany');
        } else {
          router.push('/dashboard');
        }

        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      setUser(null);
      localStorage.removeItem('token'); // Remove token
      router.push('/'); // Redirect to login
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
