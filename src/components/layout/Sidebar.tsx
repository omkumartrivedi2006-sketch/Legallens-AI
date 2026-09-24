import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  GitCompare,
  ListTodo,
  Layers,
  Settings,
  Scale,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Documents', href: '/documents', icon: FileText },
    { label: 'AI Chat', href: '/chat', icon: MessageSquare },
    { label: 'Compare', href: '/compare', icon: GitCompare },
    { label: 'Legal Insights', href: '/insights', icon: ListTodo },
    { label: 'Unified Search', href: '/unified', icon: Layers },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      if (window.innerWidth < 1024) onClose();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || 'Authenticated User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Dashboard Sidebar"
      >
        {/* Brand header */}
        <div className="flex h-14 items-center justify-between px-5 border-b border-neutral-200 dark:border-white/10">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 font-bold text-base text-neutral-900 dark:text-white"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Scale className="h-4 w-4" />
            </div>
            <span>
              LegalLens <span className="text-blue-600 dark:text-blue-500">AI</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:text-[#858585] dark:hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-[#666666]">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-neutral-100 text-neutral-950 font-semibold dark:bg-[#151515] dark:text-white dark:border dark:border-white/10'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 dark:text-[#B8B8B8] dark:hover:text-white dark:hover:bg-white/[0.04]'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0 text-neutral-500 dark:text-[#858585]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Sign Out at bottom */}
        <div className="p-3 border-t border-neutral-200 dark:border-white/10">
          <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-[#101010] border border-neutral-200/80 dark:border-white/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-xs">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-neutral-900 dark:text-white">
                  {displayName}
                </p>
                <p className="truncate text-[10px] text-neutral-500 dark:text-[#858585]">
                  {displayEmail}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1 text-neutral-400 hover:text-rose-600 dark:text-[#858585] dark:hover:text-rose-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
