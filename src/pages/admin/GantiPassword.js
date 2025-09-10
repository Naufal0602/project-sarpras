import React, { useState } from "react";
import Sidebar from "../../components/template/AdminSideBar";
import Navbar from "../../components/template/AdminNavBar";
import Loading from "../../components/Loading";
import GantiPassword from "../../components/GantiPassword";

export default function UbahPassword() {
  const [loading, setLoading] = useState(false);
  console.log(setLoading);
  if (loading) {
    return <Loading text="Loading..." />;
  }

  return (
    <div className="flex min-h-screen">
      <div className="fixed">
        <Navbar />
        <Sidebar />
      </div>
      <div className="flex-1 lg:ml-64 pt-16 flex justify-center items-center">
        <GantiPassword />
      </div>
    </div>
  );
}
