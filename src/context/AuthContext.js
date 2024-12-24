'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token with backend using fetch
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/validate-token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Token validation failed');
          }
          return response.json();
        })
        .then((data) => {
          setUser(data.user); // Assuming the response contains user data
          console.log('User details:', data.user); // Print user details on console

          // Redirect based on user role
          if (data.user.role === 'productAdmin') {
            router.push('/companies'); // Redirect to Companies page for Product Admin
          } else if (data.user.role === 'companyAdmin') {
            router.push('/mycompany'); // Redirect to Employees page for Company Admin
          }
        })
        .catch(() => {
          logout(); // If validation fails, logout
        });
    } else if (window.location.pathname !== '/') {
      router.push('/');
    }
  }, []);

  const login = async (email, password) => {
    try {
      // Use fetch for login API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      if (!response.ok) {
        throw new Error('Login failed');
      }
  
      const data = await response.json();
      const { token, user: loggedInUser } = data;
      localStorage.setItem('token', token);
      setUser(loggedInUser);
      console.log('User logged in:', loggedInUser); // Log user details
  
      // Debugging role_id
      console.log('Logged-in user role_id:', loggedInUser.role_id);
  
      // Redirect based on role_id
      if (loggedInUser.role_id === 'productAdmin') {
        console.log('Redirecting to /companies');
        router.push('/companies'); // Redirect to Companies page for Product Admin
      } else if (loggedInUser.role_id === 'companyAdmin') {
        console.log('Redirecting to /mycompany');
        router.push('/mycompany'); // Redirect to My Company page for Company Admin
      } else {
        console.log('Redirecting to /dashboard');
        router.push('/dashboard'); // Default redirect for other roles
      }
  
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    router.push('/');
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
