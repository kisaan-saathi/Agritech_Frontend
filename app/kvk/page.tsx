"use client";

import { useRouter } from "next/navigation";
import KVKDashboard from "@/components/kvk/KVKDashboard";

export default function KVKPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return <KVKDashboard onLogout={handleLogout} />;
}
