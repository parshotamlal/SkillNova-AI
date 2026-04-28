// const BASE_URL = "https://ai-resumeanalyzer-bgl4.onrender.com/api";
// const BASE_URL = "https://ai-resumeanalyzer.onrender.com/api";
const BASE_URL = import.meta.env.VITE_API_URL || "api";

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await res.json();
  
  // Store token in localStorage for iOS compatibility
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  
  return data;
};

export const signupUser = async (name, email, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  
  const data = await res.json();
  
  // Store token in localStorage for iOS compatibility
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  
  return data;
};

export const logoutUser = async () => {
  const res = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  
  // Remove token from localStorage
  localStorage.removeItem('authToken');
  
  return res.json();
};

export const fetchProfile = async () => {
  const token = localStorage.getItem('authToken');
  
  const res = await fetch(`${BASE_URL}/api/profile`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  return res.json();
};

export const rewriteResume = async (resumeText, jobDescription) => {
  const token = localStorage.getItem('authToken');
  
  const res = await fetch(`${BASE_URL}/api/analyze/rewrite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ resumeText, jobDescription }),
  });
  return res.json();
};
