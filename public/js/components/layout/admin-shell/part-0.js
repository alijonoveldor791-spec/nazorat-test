// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { el } from '../../../core/dom.js';
import { state as useState } from '../../../core/state.js';
import { useNavigate } from '../../../core/navigation.js';
import { logoutSession } from '../../../core/api.js';
import { copyToClipboard } from '../../../core/format.js';
import { useTheme } from '../../theme-context.js';
import { useToast } from '../../toast-context.js';
import { TEACHER_NAV, SUPER_NAV } from './shared.js';
import { view0 } from './view0.js';
import { view2 } from './view2.js';
import { view4 } from './view4.js';
export function part0(scope) {
  ({ theme: scope.theme, toggleTheme: scope.toggleTheme } = useTheme());
  ({ toast: scope.toast } = useToast());
  scope.navigate = useNavigate();
  [scope.mobileOpen, scope.setMobileOpen] = useState(false);
  scope.isSuper = scope.session?.role === 'super_admin';
  scope.navItems = scope.isSuper ? SUPER_NAV : TEACHER_NAV;
  scope.handleLogout = async () => {
    try {
      await logoutSession();
      scope.navigate('/oqituvchi/kirish', { replace: true });
    } catch {
      scope.toast("Serverdan chiqish tasdiqlanmadi. Qayta urinib ko'ring.", true);
    }
  };
  scope.handleCopySchoolId = async () => {
    if (!scope.session?.public_school_id) return;
    const ok = await copyToClipboard(scope.session.public_school_id);
    scope.toast(
      ok
        ? `Maktab IDsi nusxalandi: ${scope.session.public_school_id}`
        : `Nusxalanmadi: ${scope.session.public_school_id}`,
      !ok
    );
  };
  scope.sidebarContent = el(
    'div',
    { className: 'flex h-full flex-col justify-between bg-white px-4 py-5 dark:bg-slate-900' },
    view0(scope),
    view2(scope)
  );
  return { done: true, value: view4(scope) };
}
