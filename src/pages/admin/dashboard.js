import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/AdminSideBar";
import AdminNavbar from "../../components/AdminNavBar";
import { Users, Clock, CalendarDays, Timer, ShieldUser } from "lucide-react";

const menuItems = [
  {
    title: "Kelola Pengguna",
    description: "Lihat dan atur data pengguna sistem",
    icon: <Users size={28} className="text-orange-500" />,
    path: "/admin/users",
  },
  {
    title: "Pending Users",
    description: "Proses pendaftaran pengguna baru",
    icon: <Clock size={28} className="text-orange-500" />,
    path: "/admin/pending-users",
  },
  {
    title: "Profile",
    description: "Informasi akun anda",
    icon: <ShieldUser size={28} className="text-orange-500" />,
    path: "/admin/ProfilAdmin",
  },
];

const ADMINDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) =>
    date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (date) =>
    date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <div className="fixed md:relative z-10">
        <AdminNavbar />
        <AdminSidebar />
      </div>

      <main className="flex-1 lg:ml-0 md:ml-[250px] px-4 md:px-10 py-20 justify-center bg-gray-100">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 lg:mb-0">
            Dashboard Admin
          </h1>

          {/* Waktu dan Tanggal dalam kartu */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-white shadow rounded-lg px-4 py-2 flex items-center gap-2">
              <CalendarDays size={20} className="text-orange-500" />
              <span className="text-sm font-medium text-gray-700">
                {formatDate(currentTime)}
              </span>
            </div>
            <div className="bg-white shadow rounded-lg px-4 py-2 flex items-center gap-2">
              <Timer size={20} className="text-orange-500" />
              <span className="text-sm font-mono text-gray-700">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link to={item.path} key={index}>
              <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-transform duration-300">
                <div className="mb-4">{item.icon}</div>
                <h2 className="text-xl font-bold text-gray-700">{item.title}</h2>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ADMINDashboard;
