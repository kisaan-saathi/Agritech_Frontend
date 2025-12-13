"use client";

import { usePathname } from "next/navigation";
import MainLayout from "../components/layout/main-layout";
import { ToastContainer } from "react-toastify";
import "../../node_modules/react-toastify/dist/ReactToastify.css";

export default function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // No layout pages
  const noLayout = pathname === "/login" || pathname === "/signup";

  if (noLayout) {
    return (
      <div className="h-screen w-screen bg-[#F3F7F6]">
        {children}
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
        />
      </div>
    );
  }

  return <MainLayout>{children}</MainLayout>;
}
