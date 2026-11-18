import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  Copy,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  X,
} from 'lucide-react';
import type { AdminSession } from '../../types/api';
import { logoutSession } from '../../lib/api';
import { copyToClipboard } from '../../lib/format';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

interface AdminShellProps {
  session: AdminSession | null;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const TEACHER_NAV = [
  { to: '/oqituvchi', label: 'Boshqaruv paneli', icon: LayoutDashboard, end: true },
  { to: '/oqituvchi/sinflar', label: 'Sinflar va guruhlar', icon: Users },
  { to: '/oqituvchi/testlar', label: 'Testlar', icon: ClipboardList },
  { to: '/oqituvchi/natijalar', label: 'Natijalar', icon: FileCheck2 },
  { to: '/oqituvchi/savollar-bazasi', label: 'Savollar bazasi', icon: BookOpen },
  { to: '/oqituvchi/sozlamalar', label: 'Sozlamalar', icon: Settings },
];

const SUPER_NAV = [
  { to: '/bosh-admin', label: 'Maktablar va nazorat', icon: Building2, end: true },
  { to: '/bosh-admin/umumiy-bank', label: 'Umumiy test banki', icon: ShieldCheck },
];

export function AdminShell({ session, title, subtitle, actions, children }: AdminShellProps) {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSuper = session?.role === 'super_admin';
  const navItems = isSuper ? SUPER_NAV : TEACHER_NAV;

  const handleLogout = async () => {
    try {
      await logoutSession();
      navigate('/oqituvchi/kirish', { replace: true });
    } catch {
      toast('Serverdan chiqish tasdiqlanmadi. Qayta urinib ko\'ring.', true);
    }
  };

  const handleCopySchoolId = async () => {
    if (!session?.public_school_id) return;
    const ok = await copyToClipboard(session.public_school_id);
    toast(
      ok
        ? `Maktab IDsi nusxalandi: ${session.public_school_id}`
        : `Nusxalanmadi: ${session.public_school_id}`,
      !ok
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-5 dark:bg-slate-900">
      <div>
        <div className="flex items-center justify-between px-2 pb-6">
          <Link
            to={isSuper ? '/bosh-admin' : '/oqituvchi'}
            className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Nazorat
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Menyuni yopish"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Kabinet bo'limlari" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
        {session && (
          <div className="px-2 text-xs text-slate-500 dark:text-slate-400">
            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
              {isSuper ? 'Bosh admin' : session.schoolName || 'Maktab kabineti'}
            </p>
            <p className="mt-0.5 truncate">
              {session.login || (session.role === 'legacy_admin' ? 'Umumiy admin' : 'Admin')}
            </p>
            {session.public_school_id && (
              <button
                type="button"
                onClick={handleCopySchoolId}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span>{session.public_school_id}</span>
                <Copy className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            O'quvchi sahifasi
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? "Kunduzgi rejimga o'tish" : "Qorong'i rejimga o'tish"}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-red-950/50 dark:hover:border-red-900 dark:hover:text-red-300"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Chiqish</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 lg:block dark:border-slate-800">
        <div className="sticky top-0 h-screen overflow-y-auto">{sidebarContent}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3.5 backdrop-blur-md sm:px-8 dark:border-slate-800 dark:bg-slate-900/90 no-print">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:text-slate-300"
                aria-label="Menyuni ochish"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 truncate sm:text-2xl dark:text-white">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs text-slate-500 truncate sm:text-sm dark:text-slate-400">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
