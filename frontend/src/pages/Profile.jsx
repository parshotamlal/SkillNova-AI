import { useEffect, useState } from "react";
import { fetchProfile, logoutUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile().then((res) => {
      if (res.user) setUser(res.user);
    });
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative">
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Your Profile</h2>

        {user ? (
          <div className="space-y-4">
            <div className="border border-gray-300 rounded-md p-3">
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-lg font-medium">{user.name}</p>
            </div>
            <div className="border border-gray-300 rounded-md p-3">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-medium">{user.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-600">Loading...</p>
        )}
      </div>
    </div>
  );
}
