"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useUiStore } from "@/stores";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav, BottomTabBar } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isMobile, sidebarOpen } = useUiStore();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile Navigation Drawer */}
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex md:fixed md:left-0 md:top-0 md:bottom-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          !isMobile && sidebarOpen && "md:ml-[280px]"
        )}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Bottom Tab Bar - Mobile Only */}
      <BottomTabBar />
    </div>
  );
}
