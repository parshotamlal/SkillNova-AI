const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "";
  if (!url) return "";
  url = url.trim().replace(/\/+$/, "");
  if (url.endsWith("/api")) {
    url = url.slice(0, -4);
  }
  return url;
};

const BASE_URL = getApiBaseUrl();

export const loginUser = async (email, password) => {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    return data;
  } catch (error) {
    console.error("Login Network Error:", error);
    return { message: "Server connection failed. Please ensure the backend server is running." };
  }
};

export const signupUser = async (name, email, password) => {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    return data;
  } catch (error) {
    console.error("Signup Network Error:", error);
    return { message: "Server connection failed. Please ensure the backend server is running." };
  }
};

export const googleAuth = async (name, email, googleId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, googleId }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    return data;
  } catch (error) {
    console.error("Google Auth Network Error:", error);
    return { message: "Server connection failed. Please ensure the backend server is running." };
  }
};

export const logoutUser = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    localStorage.removeItem('authToken');
    return await res.json();
  } catch (error) {
    console.error("Logout Network Error:", error);
    localStorage.removeItem('authToken');
    return { message: "Logged out locally." };
  }
};

export const fetchProfile = async () => {
  try {
    const token = localStorage.getItem('authToken');

    const res = await fetch(`${BASE_URL}/api/profile`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });
    return await res.json();
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    return { message: "Failed to fetch profile." };
  }
};

export const rewriteResume = async (resumeText, jobDescription) => {
  try {
    const token = localStorage.getItem('authToken');

    const res = await fetch(`${BASE_URL}/api/analyze/rewrite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ resumeText, jobDescription }),
    });
    return await res.json();
  } catch (error) {
    console.error("Rewrite Resume Error:", error);
    return { message: "Failed to rewrite resume." };
  }
};

// Generate Cover Letter
export const generateCoverLetter = async (resumeText, jobDescription) => {
  try {
    const token = localStorage.getItem('authToken');

    const res = await fetch(`${BASE_URL}/api/analyze/cover-letter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ resumeText, jobDescription }),
    });
    return await res.json();
  } catch (error) {
    console.error("Generate Cover Letter Error:", error);
    return { message: "Failed to generate cover letter." };
  }
};

export const getATSScore = async (resumeText) => {
  try {
    const token = localStorage.getItem('authToken');

    const res = await fetch(`${BASE_URL}/api/analyze/ats-score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ resume: resumeText }),
    });
    return await res.json();
  } catch (error) {
    console.error("Get ATS Score Error:", error);
    return { message: "Failed to calculate ATS score." };
  }
};

export const generateAISummary = async (personal, experience) => {
  try {
    const token = localStorage.getItem('authToken');

    const res = await fetch(`${BASE_URL}/api/analyze/summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ personal, experience }),
    });
    return await res.json();
  } catch (error) {
    console.error("Generate AI Summary Error:", error);
    return { message: "Failed to generate AI summary." };
  }
};

export const saveUserResume = async (resumeData) => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${BASE_URL}/api/profile/resumes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(resumeData),
    });
    return await res.json();
  } catch (error) {
    console.error("Save Resume Error:", error);
    return { message: "Failed to save resume." };
  }
};

export const deleteUserResume = async (resumeId) => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${BASE_URL}/api/profile/resumes/${resumeId}`, {
      method: "DELETE",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });
    return await res.json();
  } catch (error) {
    console.error("Delete Resume Error:", error);
    return { message: "Failed to delete resume." };
  }
};

export const deleteUserAtsScore = async (scoreId) => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${BASE_URL}/api/profile/ats-scores/${scoreId}`, {
      method: "DELETE",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });
    return await res.json();
  } catch (error) {
    console.error("Delete ATS Score Error:", error);
    return { message: "Failed to delete ATS score." };
  }
};


