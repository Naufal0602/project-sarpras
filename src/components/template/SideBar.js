import React, { useState, useEffect } from "react";
import { Users, Menu, X, Building, BicepsFlexed, House, Image } from "lucide-react";
import { Link } from "react-router-dom";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase"; // pastikan path ini sesuai
import LogoutModal from "../LogoutModal";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("Campaign Funds");
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Dengarkan jumlah pending user real-time
  useEffect(() => {
    const q = query(
      collection(db, "pending_users"),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      icon: House,
      to: "/user/dashboard",
    },
    {
      name: "Profil",
      icon: Users,
      to: "/user/profil",
    },
    {
      name: "Perusahaan",
      icon: Building,
      to: "/user/perusahaan/",
    },
    {
      name: "Pekerjaan Fisik",
      icon: BicepsFlexed,
      to: "/user/pekerjaan-fisik",
    },
    {
      name: "Galeri",
      icon: Image,
      to: "/user/Galeri",
    },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className={`lg:hidden fixed top-4 md:hidden ${
          isOpen ? "right-4" : "left-4"
        } z-50 p-2 bg-orange-500 text-white rounded-lg shadow-lg transition-all duration-300`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:translate-x-0 lg:relative z-40
        w-64 bg-gradient-to-b from-orange-400 to-orange-500 shadow-lg
        h-full transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-[-100%] md:translate-x-0"}`}
      >
        {/* Header */}
        <div className="p-6">
          <div className="flex flex-col items-center text-center space-x-2">
            <div className="p-4 w-40 h-40 bg-white rounded flex rounded-full items-center justify-center">
              <img className="w-full" src="/logo_sarpras1.png" alt=""></img>
              <span className="hidden">{pendingCount} pending</span>
            </div>
            <div className="text-white">
              <h1 className="font-bold text-lg">SARPRAS</h1>
              <p className="text-orange-100 text-xs">User</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name;

            return (
              <Link
                key={item.name}
                to={item.to}
                onClick={() => {
                  setActiveItem(item.name);
                  if (window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                  isActive
                    ? "bg-white bg-opacity-20 text-white shadow-lg"
                    : "text-orange-100 hover:bg-white hover:bg-opacity-10 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-white text-orange-500 text-xs rounded-full px-2 py-0.5">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Section */}
        <div className="absolute bottom-6 left-6 right-6 justify-center">
          <div className="flex z-50 items-center justify-center space-x-3">
            {/* <LogoutButton /> */}
            <LogoutModal />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
