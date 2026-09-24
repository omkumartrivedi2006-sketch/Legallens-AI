import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] dark:bg-[#050505] text-neutral-900 dark:text-white transition-colors duration-200 relative overflow-x-hidden">
      {/* Subtle Ambient Background System */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[1000px] h-[550px] rounded-full bg-blue-500/[0.035] dark:bg-blue-600/[0.03] blur-[120px]" />
        <div className="absolute top-[40%] -right-[15%] w-[800px] h-[500px] rounded-full bg-blue-600/[0.025] dark:bg-blue-500/[0.02] blur-[140px]" />
        <div className="absolute bottom-[5%] -left-[10%] w-[700px] h-[500px] rounded-full bg-blue-500/[0.02] dark:bg-blue-600/[0.02] blur-[130px]" />
      </div>

      <Navbar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
