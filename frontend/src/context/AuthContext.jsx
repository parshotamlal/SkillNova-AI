import { createContext, useContext, useEffect, useState } from "react";
import { fetchProfile } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if token exists in localStorage
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetchProfile();
        if (res.user) {
          setUser(res.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Remove invalid token from localStorage
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
