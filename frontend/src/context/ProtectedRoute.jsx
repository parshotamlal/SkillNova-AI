import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchProfile } from "../services/api";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if token exists in localStorage
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        const res = await fetchProfile();
        setIsAuthenticated(!!res.user);
      } catch (error) {
        console.error("Auth check failed:", error);
        // Remove invalid token from localStorage
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-50"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
