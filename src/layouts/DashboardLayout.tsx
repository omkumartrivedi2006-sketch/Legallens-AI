import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Scale, ShieldAlert } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { UserMenu } from '../components/layout/UserMenu';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top App Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 font-semibold text-sm text-slate-700 dark:text-slate-200 lg:hidden">
              <Scale className="h-4 w-4 text-blue-600" />
              <span>LegalLens AI</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Informational disclaimer badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Informational Use Only</span>
            </div>

            <ThemeToggle />

            {/* Authenticated User Menu */}
            <UserMenu />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
