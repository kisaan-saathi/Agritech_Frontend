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
import { Hand } from "lucide-react";

export default function DashboardClient() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<string>("");
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (!token) {
      router.push("/login");
    } else {
      setAuthChecked(true);
      // safely read userName from localStorage on the client
      const u = localStorage.getItem("userName") || "";
      setUser(u);
    }
  }, [router]);
  // `user` is now read into state in the effect above to avoid accessing
  // localStorage during server-side render.
  const { handleIdentifyDisease } = useDiseaseId();

  if (!authChecked) return null;

  const handleLogout = async () => {
    try {
      const res = await apiCallWithRefresh(async () => {
        const token = localStorage.getItem("accessToken");
        console.log("Logging out with token:", token);
        return await axios.get("http://localhost:4000/api/v1/auth/logout", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      });
      if (res.data.statusCode == 200) {
        toast.success(res.data.message);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userName");
        setShowMenu(false);
        router.push("/login");
      } else {
        toast.error(res.data.message || "Logout failed");
        setShowMenu(false)
        router.push("/login");

      }
    } catch (error: any) {
      console.log("logout error",error)
      // // toast.error(error.res.data.message || "Logout failed");
      // localStorage.removeItem("accessToken");
      // localStorage.removeItem("refreshToken");
      // localStorage.removeItem("userName");
      setShowMenu(false);
    }
  };

  return (
    <div className="bg-gray-50 font-sans antialiased min-h-screen container-fluid mx-auto">
      <div id="app" className="flex flex-col h-screen">
        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {/* Header (Mobile/Desktop) - Used for User and Notifications */}
          <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <div className="flex flex-row items-center space-x-3">
              <img
                className="box shake-after-10s"
                width="70"
                src="/images/kissan_sathi_logo.png"
                alt="Kissan Sathi"
              />
              <span className="text-3xl font-extrabold text-gray-800 mb-0 flex items-center gap-2">
                Welcome, {user}
                <Hand className="w-7 h-7  animate-wave" fill="#f5db75ff" />
              </span>
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
          {/* <SensorMetrics /> */}
          <ApplicationFeatures />
          {/* <CropOverview /> */}
        </main>
      </div>
    </div>
  );
}
