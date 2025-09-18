import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/template/AdminSideBar";
import AdminNavbar from "../../components/template/AdminNavBar";
import { Users, Clock, CalendarDays, Timer, ShieldUser, BarChart } from "lucide-react";

// Firebase
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";

// Recharts
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const ADMINDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userTotal, setUserTotal] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);

  // state pekerjaan fisik
  const [jobStats, setJobStats] = useState({ monthly: [], yearly: [] });
  const [filterType, setFilterType] = useState("month"); // "month" atau "year"

  useEffect(() => {
    const fetchData = async () => {
      try {
        // total pengguna
        const usersSnap = await getDocs(collection(db, "users"));
        setUserTotal(usersSnap.size);

        // total akun pending
        const pendingSnap = await getDocs(collection(db, "pending_users"));
        setPendingUsers(pendingSnap.size);

        // ambil pekerjaan fisik
        const jobsSnap = await getDocs(collection(db, "pekerjaan_fisik"));
        const jobsDataMonthly = {};
        const jobsDataYearly = {};

        jobsSnap.forEach((doc) => {
          const data = doc.data();
          if (!data.created_at) return;

          const date = data.created_at.toDate();
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          const yearKey = `${date.getFullYear()}`;

          // per bulan
          if (!jobsDataMonthly[monthKey])
            jobsDataMonthly[monthKey] = { month: monthKey, count: 0 };
          jobsDataMonthly[monthKey].count++;

          // per tahun
          if (!jobsDataYearly[yearKey])
            jobsDataYearly[yearKey] = { year: yearKey, count: 0 };
          jobsDataYearly[yearKey].count++;
        });

        setJobStats({
          monthly: Object.values(jobsDataMonthly),
          yearly: Object.values(jobsDataYearly),
        });
      } catch (err) {
        console.error("Gagal ambil data:", err);
      }
    };

    fetchData();

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

  const menuItems = [
    {
      title: "Kelola Pengguna",
      description: `Total Pengguna: ${userTotal}`,
      icon: <Users size={28} className="text-orange-500" />,
      path: "/admin/users",
    },
    {
      title: "Akun Tertunda",
      description: `Total Akun Tertunda: ${pendingUsers}`,
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <div className="fixed md:relative z-10">
        <AdminSidebar />
        <AdminNavbar />
      </div>

      <main className="flex-1 lg:ml-64 md:ml-[250px] px-4 md:px-10 py-20 justify-center bg-gray-100">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 lg:mb-0">
            Dashboard Admin
          </h1>

          {/* Waktu dan Tanggal */}
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

        {/* Statistik Pengguna & Pending */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
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
