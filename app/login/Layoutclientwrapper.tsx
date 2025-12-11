"use client";

import { usePathname } from "next/navigation";
import MainLayout from "../components/layout/main-layout";

export default function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // No layout pages
  const noLayout = pathname === "/login" || pathname === "/signup";

  if (noLayout) {
    return <div className="h-screen w-screen bg-[#F3F7F6]">{children}</div>;
  }

  return <MainLayout>{children}</MainLayout>;
}
