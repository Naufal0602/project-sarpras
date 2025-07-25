import React, { useState } from 'react';
import { 
  Users,  
  Search,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('Campaign Funds');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Perusahaan', icon: Users },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-orange-500 text-white rounded-lg shadow-lg"
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
            <div className={`
        fixed lg:relative lg:translate-x-0 z-40
        w-64 bg-gradient-to-b from-orange-400 to-orange-500 shadow-lg
        h-full transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>

        {/* Header */}
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <span className="text-orange-500 font-bold text-sm">T</span>
            </div>
            <div className="text-white">
              <h1 className="font-bold text-lg">Total People</h1>
              <p className="text-orange-100 text-xs">Admin</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-200 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-orange-300 bg-opacity-30 text-white placeholder-orange-200 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name;
            
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveItem(item.name);
                  // Close sidebar on mobile after selection
                  if (window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                  isActive 
                    ? 'bg-white bg-opacity-20 text-white shadow-lg' 
                    : 'text-orange-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom User Section */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-10 rounded-lg">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">A</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Admin User</p>
              <p className="text-orange-100 text-xs">admin@totalpeople.com</p>
            </div>
            <ChevronDown className="w-4 h-4 text-orange-200" />
          </div>
        </div>
      </div>

     
    </div>
  );
};

export default Sidebar;