import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Mail, Lock } from "lucide-react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";

import { signupUser } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await signupUser(name, email, password);

      if (data.message === "Signup successful") {
        // Token is automatically stored in localStorage by signupUser function
        navigate("/");
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to sign up. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">
            Sign up to start analyzing your resumes with AI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full py-3 pl-10 pr-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-3 pl-10 pr-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password */}
         <div>
      <label
        htmlFor="password"
        className="text-sm font-medium text-gray-700 block mb-2"
      >
        Password
      </label>

      <div className="relative">
        {/* Lock Icon */}
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

        {/* Input */}
        <input
          id="password"
          type={showPassword ? "text" : "password"}   // 👈 change here
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full py-3 pl-10 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Create a password"
        />

        {/* Eye Icon */}
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-black"
        >
          {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
        </span>
      </div>

      <p className="text-xs text-gray-500 mt-1">
        Password must be at least 6 characters long
      </p>
    </div>

          {/* Error */}
          {error && (
            <div className="text-red-500 text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Create Account
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

