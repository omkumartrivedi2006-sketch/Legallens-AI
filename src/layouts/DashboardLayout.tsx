import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Scale, ShieldAlert } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { UserMenu } from '../components/layout/UserMenu';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#050505] text-neutral-900 dark:text-white flex transition-colors duration-200 relative overflow-x-hidden">
      {/* Subtle Ambient Background System */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] -right-[10%] w-[700px] h-[500px] rounded-full bg-blue-500/[0.03] dark:bg-blue-600/[0.025] blur-[120px]" />
        <div className="absolute top-[45%] -left-[10%] w-[600px] h-[500px] rounded-full bg-blue-600/[0.02] dark:bg-blue-500/[0.02] blur-[130px]" />
      </div>

      {/* Glass Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 relative z-10">
        {/* Top App Floating Glass Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/60 dark:border-white/10 bg-white/75 dark:bg-[#080808]/75 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-neutral-600 dark:text-[#B8B8B8] hover:bg-neutral-200/50 dark:hover:bg-white/10 lg:hidden transition-colors"
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
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 backdrop-blur-xs">
              <ShieldAlert className="h-3 w-3 text-amber-600 dark:text-amber-400" />
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
