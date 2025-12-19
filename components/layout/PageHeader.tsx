"use client";

import { useState } from "react";
import { MenuButton } from "@/components/ui/menu-button";
import { ApplicationDrawer } from "@/components/ui/application-drawer";

export default function PageHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="flex items-center space-x-4">
        <MenuButton onClick={() => setDrawerOpen(true)} />
        {/* Add other header elements if needed */}
      </div>
      <ApplicationDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
