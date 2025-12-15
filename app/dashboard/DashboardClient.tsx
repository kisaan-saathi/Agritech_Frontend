"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { apiCallWithRefresh } from "../../lib/auth";
import FarmScoreCard from "./components/FarmScoreCard";
import ActionCenter from "./components/ActionCenter";
import SensorMetrics from "./components/SensorMetrics";
import ApplicationFeatures from "./components/ApplicationFeatures";
import CropOverview from "./components/CropOverview";
import { useDiseaseId } from "../../lib/hooks/dashboard";

export default function DashboardClient() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);
  const user = localStorage.getItem("userName") || "";
  const { handleIdentifyDisease } = useDiseaseId();

  if (!authChecked) return null;

  const handleLogout = async () => {
    try {
      const res = await apiCallWithRefresh(async () => {
        const token = localStorage.getItem("accessToken");
        console.log("Logging out with token:", token);
        return await axios.get("http://localhost:4000/api/v1/auth/logout", {
          headers: { Authorization: `Bearer ${token}`,  "Content-Type": "application/json"},
        });
      });
      if (res.data.statusCode == 200) {
        toast.success(res.data.message || "Logged out successfully");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userName");
        setShowMenu(false);
        router.push("/login");
      } else {
        console.log("Logout API error", res.data);
        toast.error(res.data.message || "Logout failed");
      }
    } catch (error: any) {
      console.log("Logout API error", error);
      toast.error(error.message || "Logout failed");
    }
  };

  return (
    <div className="bg-gray-50 font-sans antialiased min-h-screen container-fluid mx-auto">
      <div id="app" className="flex flex-col h-screen">
        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {/* Header (Mobile/Desktop) - Used for User and Notifications */}
          <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold text-gray-800">
                Welcome, {user} to Kisaan Saathi
              </h1>
              <img
                className="box shake-after-10s"
                width="50"
                src="/images/mithu.jpg"
                alt="Mithu"
              />
            </div>
            <div className="flex items-center space-x-4">
              {/* Mock Language Toggle */}
              <select className="p-2 rounded-lg bg-white text-gray-600 shadow-lg border border-gray-200 text-sm hidden sm:block">
                <option>English</option>
                <option>Hindi</option>
                <option>Marathi</option>
              </select>
              <button className="p-3 rounded-full bg-white text-gray-600 shadow-lg hover:bg-gray-100 transition duration-150 hidden sm:block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-3 rounded-full bg-white text-gray-600 shadow-lg hover:bg-gray-100 transition duration-150"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </button>
                {showMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg border z-10">
                    <button
                      onClick={() => setShowMenu(false)}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <FarmScoreCard />
          <ActionCenter onDiseaseClick={handleIdentifyDisease} />
          <SensorMetrics />
          <ApplicationFeatures />
          <CropOverview />
        </main>

        <footer className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-white border-t border-gray-200 shadow-2xl">
          <nav className="flex h-full justify-around items-center max-w-7xl mx-auto px-4">
            <a
              href="#"
              className="flex flex-col items-center justify-center space-y-1 p-2 text-primary-green transition duration-150"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M3 3v18h18" />
                <path d="M18.7 8l-5.1 5.2-2.8-2.7-5.1 5.2" />
              </svg>
              <span className="text-xs font-semibold">Dashboard</span>
            </a>
            <a
              href="#"
              className="flex flex-col items-center justify-center space-y-1 p-2 text-gray-500 hover:text-primary-green transition duration-150"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-xs font-medium">Map</span>
            </a>
            <a
              href="#"
              className="flex flex-col items-center justify-center space-y-1 p-2 text-gray-500 hover:text-primary-green transition duration-150 relative"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="text-xs font-medium">Action</span>
              <span className="absolute top-1 right-2 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
            </a>
            <a
              href="#"
              className="flex flex-col items-center justify-center space-y-1 p-2 text-gray-500 hover:text-primary-green transition duration-150"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18A2 2 0 0 1 9.77 6.2h-1.92A2 2 0 0 0 5.92 8.13l-.15.14A2 2 0 0 1 4 9.77v4.46a2 2 0 0 1 1.77 1.5l.15.14A2 2 0 0 0 7.85 17.8h1.92a2 2 0 0 1 1.45 1.77v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1.45-1.77h1.92a2 2 0 0 0 1.93-1.93l.15-.14A2 2 0 0 1 20 14.23V9.77a2 2 0 0 1-1.77-1.5l-.15-.14A2 2 0 0 0 16.15 6.2h-1.92a2 2 0 0 1-1.45-1.77V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="text-xs font-medium">Profile</span>
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}
