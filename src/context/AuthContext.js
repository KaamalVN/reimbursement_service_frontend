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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
  
        if (!response.ok) {
          if (response.status === 401) {
            return 'Invalid credentials'; // Return message for invalid credentials
          }
          return 'Server error. Please try again later.'; // General error message for other statuses
        }
  
        const data = await response.json();
        const { token, user: loggedInUser } = data;
  
        localStorage.setItem('token', token); // Store token
        setUser(loggedInUser);
        
  
        // Redirect based on role_id
        if (loggedInUser.role_id === 'productAdmin') {
          router.push('/companies');
        } else if (loggedInUser.role_id === 'companyAdmin') {
          router.push('/mycompany');
        } else {
          router.push('/dashboard');
        }
  
        return;
      }
    } catch (error) {
      console.error('Login error:', error);
      return 'An unexpected error occurred. Please try again.'; // Handle other unexpected errors
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
