import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.nama) {
      setUsername(userData.nama);
    }
  }, []);
  JSON.parse(localStorage.getItem("user"));

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-white shadow z-40 px-4 md:pl-72 flex items-center justify-between">
      <h1 className="text-lg md:text-xl pl-12 sm:pl-0 font-semibold text-gray-800">
        Dashboard Admin
      </h1>

      <div className="flex items-center space-x-2 md:space-x-4">
        <span className="hidden sm:inline text-sm md:text-base text-gray-600 font-medium">
          Hi, {username || "..."}
        </span>

        <button
          onClick={() => navigate("/admin/profilAdmin")}
          className="focus:outline-none"
        >
          <img
            src={`https://ui-avatars.com/api/?name=${username}&background=random`}
            alt="avatar"
            className="w-8 h-8 rounded-full"
          />
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
