'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchProfile } from "../services/api";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (typeof window === "undefined") return;
        const token = localStorage.getItem("authToken");

        if (!token) {
          setIsAuthenticated(false);
          router.replace("/login");
          return;
        }

        const res = await fetchProfile();
        if (res && res.user) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
          router.replace("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
        }
        setIsAuthenticated(false);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-50"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
