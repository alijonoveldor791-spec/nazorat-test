// Sahifaning ko'rinishi va amallarini mahalliy DOM orqali boshqaradi.
import {
  BookOpen,
  Building2,
  ClipboardList,
  FileCheck2,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from '../../icons.js';
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
export { TEACHER_NAV, SUPER_NAV };
