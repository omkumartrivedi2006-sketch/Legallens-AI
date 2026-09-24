import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Scale, ShieldAlert } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { UserMenu } from '../components/layout/UserMenu';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-neutral-900 dark:text-white flex transition-colors duration-150">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top App Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200 dark:border-white/10 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-neutral-600 dark:text-[#B8B8B8] hover:bg-neutral-100 dark:hover:bg-white/10 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 font-semibold text-sm text-neutral-800 dark:text-neutral-200 lg:hidden">
              <Scale className="h-4 w-4 text-blue-600 dark:text-blue-500" />
              <span>LegalLens AI</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Informational disclaimer badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/40">
              <ShieldAlert className="h-3 w-3" />
              <span>Informational Use Only</span>
            </div>

            <ThemeToggle />

            {/* Authenticated User Menu */}
            <UserMenu />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
