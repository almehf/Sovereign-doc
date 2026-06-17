import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { base } from '@/api/baseClient';
import {
  LayoutDashboard, FileText, ShieldCheck, FolderOpen, MessageSquare,
  ScrollText, Settings, Users, LogOut, Menu, X, Globe,
  Building2
} from 'lucide-react';

const navItems = {
  admin: [
    { icon: LayoutDashboard, label: 'لوحة التحكم', labelEn: 'Dashboard', path: '/' },
    { icon: FileText, label: 'المستندات', labelEn: 'Documents', path: '/documents' },
    { icon: FolderOpen, label: 'المجموعات', labelEn: 'Collections', path: '/collections' },
    { icon: ShieldCheck, label: 'مراجعة الخصوصية', labelEn: 'PII Review', path: '/pii-review' },
    { icon: ScrollText, label: 'سجل التدقيق', labelEn: 'Audit Log', path: '/audit-log' },
    { icon: Users, label: 'المستخدمون', labelEn: 'Users', path: '/users' },
    { icon: Settings, label: 'الإعدادات', labelEn: 'Settings', path: '/settings' },
  ],
  compliance_officer: [
    { icon: LayoutDashboard, label: 'لوحة التحكم', labelEn: 'Dashboard', path: '/' },
    { icon: ShieldCheck, label: 'مراجعة الخصوصية', labelEn: 'PII Review', path: '/pii-review' },
    { icon: ScrollText, label: 'سجل التدقيق', labelEn: 'Audit Log', path: '/audit-log' },
    { icon: FileText, label: 'المستندات', labelEn: 'Documents', path: '/documents' },
  ],
  user: [
    { icon: MessageSquare, label: 'المحادثة', labelEn: 'Chat', path: '/chat' },
    { icon: FolderOpen, label: 'المجموعات المتاحة', labelEn: 'Collections', path: '/collections' },
  ],
};

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem('mawthiq-lang') || 'ar');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('mawthiq-lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const role = user?.role || 'user';
  const items = navItems[role] || navItems.user;

  const handleLogout = async () => {
    await base.auth.logout('/login');
  };

  const toggleLang = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Close mobile on navigate
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const roleLabels = {
    admin: { ar: 'مدير النظام', en: 'Admin' },
    compliance_officer: { ar: 'مسؤول الامتثال', en: 'Compliance Officer' },
    user: { ar: 'مستخدم', en: 'User' },
  };

  return (
    <div className="min-h-screen bg-background" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 h-16 bg-sidebar flex items-center justify-between px-4 border-b border-sidebar-border">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -mr-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <span className="font-heading font-bold text-sidebar-foreground text-lg">موثّق</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 z-50 bg-sidebar border-l border-sidebar-border transition-transform duration-300 lg:translate-x-0 ${
          lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'
        } ${mobileOpen ? 'translate-x-0' : lang === 'ar' ? 'translate-x-full' : '-translate-x-full'} w-72 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-sidebar-foreground text-lg leading-tight">موثّق</h1>
            <p className="text-sidebar-foreground/50 text-xs">Mawthiq</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden mr-auto text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{lang === 'ar' ? item.label : item.labelEn}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground text-sm transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* User info */}
          {user && (
            <div className="px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                  <span className="text-sidebar-foreground text-sm font-medium">
                    {user.full_name?.[0] || user.email?.[0] || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sidebar-foreground text-sm font-medium truncate">
                    {user.full_name || user.email}
                  </p>
                  <p className="text-sidebar-foreground/50 text-xs">
                    {roleLabels[role]?.[lang] || role}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:bg-destructive/20 hover:text-red-400 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`lg:mr-72 pt-16 lg:pt-0 min-h-screen`}>
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet context={{ lang, user, role }} />
        </main>
      </div>
    </div>
  );
}