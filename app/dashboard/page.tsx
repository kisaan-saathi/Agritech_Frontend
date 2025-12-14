import MainLayout from "components/layout/main-layout";
import DashboardClient from "./DashboardClient"; // client component (has "use client")

export default function DashboardPage() {
  return (
    <MainLayout>
      <DashboardClient />
    </MainLayout>
  );
}
