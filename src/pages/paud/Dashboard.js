import React, { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import LogoutButton from '../../components/LogoutButton';
import Sidebar from "../../components/SideBar";

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  // Monitor authentication state
  useEffect(() => {
    console.log("Setting up auth state listener...");
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out");
      setAuthUser(user);
      
      if (!user) {
        setLoading(false);
        setError("User not authenticated");
      }
    });

    return () => {
      console.log("Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  // Fetch user data when auth user changes
  useEffect(() => {
    if (!authUser) {
      console.log("No authenticated user, skipping data fetch");
      return;
    }

    console.log("Fetching user data for:", authUser.uid);
    setLoading(true);
    setError(null);

    const fetchUserData = async () => {
      try {
        console.log("Creating document reference...");
        const userRef = doc(db, "users", authUser.uid);
        
        console.log("Fetching document...");
        const userSnap = await getDoc(userRef);

        console.log("Document exists:", userSnap.exists());
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          console.log("User data received:", data);
          setUserData(data);
        } else {
          console.log("User document does not exist in Firestore");
          setError("User profile not found. Please contact administrator.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(`Failed to fetch user data: ${err.message}`);
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser]);

  // Alternative: Use real-time listener for user data
  // useEffect(() => {
  //   if (!authUser) return;

  //   console.log("Setting up real-time listener for user data");
  //   const userRef = doc(db, "users", authUser.uid);
    
  //   const unsubscribe = onSnapshot(userRef, (doc) => {
  //     console.log("Real-time update received");
  //     if (doc.exists()) {
  //       console.log("User data:", doc.data());
  //       setUserData(doc.data());
  //     } else {
  //       console.log("User document does not exist");
  //       setError("User profile not found");
  //     }
  //     setLoading(false);
  //   }, (err) => {
  //     console.error("Real-time listener error:", err);
  //     setError(`Real-time error: ${err.message}`);
  //     setLoading(false);
  //   });

  //   return () => {
  //     console.log("Cleaning up real-time listener");
  //     unsubscribe();
  //   };
  // }, [authUser]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading user data...</p>
          <p className="mt-2 text-gray-400 text-sm">
            Auth User: {authUser ? "✓ Authenticated" : "✗ Not authenticated"}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
              className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Try Again
            </button>
            <LogoutButton />
          </div>
        </div>
      </div>
    );
  }

  // No user data state
  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <p className="text-gray-600 text-xl mb-4">Data pengguna tidak ditemukan</p>
          <LogoutButton />
        </div>
      </div>
    );
  }

  // Main dashboard render
  return (
<div className="flex min-h-screen bg-gray-50">
  <div className="fixed">
  <Sidebar />
  </div>
  <div className="flex-1 ml-5">
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <div className="p-6 lg:p-10">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Selamat datang! 👋
                </h1>
                <p className="text-gray-600 text-lg">{userData.email}</p>
              </div>
              <LogoutButton />
            </div>
            
            {/* User Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-6 rounded-lg text-white">
                <h3 className="text-lg font-semibold mb-2">Role</h3>
                <p className="text-2xl font-bold">{userData.role}</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6 rounded-lg text-white">
                <h3 className="text-lg font-semibold mb-2">Level</h3>
                <p className="text-2xl font-bold">{userData.level}</p>
              </div>
            </div>
          </div>

          {/* Data Management Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Manajemen Data</h2>
            
            {/* Data List */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Data Barang:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-2">
                  <li className="flex items-center p-3 bg-white rounded border">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    Barang 1
                  </li>
                  <li className="flex items-center p-3 bg-white rounded border">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    Barang 2
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons for Level 2 Users */}
            {userData.level === 2 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Actions (Level 2):</h3>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md hover:shadow-lg">
                    ➕ Tambah Barang
                  </button>
                  <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg">
                    ✏️ Edit Barang
                  </button>
                  <button className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium shadow-md hover:shadow-lg">
                    🗑️ Hapus Barang
                  </button>
                </div>
              </div>
            )}

            {userData.level !== 2 && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-700">
                  <span className="font-semibold">Info:</span> Anda perlu level 2 untuk mengakses fitur manajemen data.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default UserDashboard;