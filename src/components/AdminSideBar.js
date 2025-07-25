import React, { useState } from "react";
import { Users, Search, ChevronDown, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("Campaign Funds");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Kelola Daftar Pengguna", icon: Users, to: "/admin/users" },
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
        className={`
  fixed md:translate-x-0 lg:relative z-40
  w-64 bg-gradient-to-b from-orange-400 to-orange-500 shadow-lg
  h-full transition-transform duration-300 ease-in-out
  ${isOpen ? "translate-x-0" : "translate-x-[-100%] md:translate-x-0"}
`}
      >
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <span className="text-orange-500 font-bold text-sm">D</span>
            </div>
            <div className="text-white">
              <h1 className="font-bold text-lg">SARPRAS</h1>
              <p className="text-orange-100 text-xs">Admin</p>
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                  isActive
                    ? "bg-white bg-opacity-20 text-white shadow-lg"
                    : "text-orange-100 hover:bg-white hover:bg-opacity-10 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Section */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex  items-center space-x-3 p-3 bg-white bg-opacity-10 rounded-lg">
          <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
