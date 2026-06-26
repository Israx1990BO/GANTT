'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CURRENT_USER } from '@/lib/demo-data';
import { getInitials } from '@/lib/utils';

const NAV_ITEMS = [
  { section: 'Principal', items: [
    { href: '/', icon: '📊', label: 'Dashboard' },
    { href: '/gantt', icon: '📅', label: 'Gantt General' },
    { href: '/projects', icon: '📁', label: 'Proyectos' },
  ]},
  { section: 'Herramientas', items: [
    { href: '/agenda', icon: '🗓️', label: 'Agenda' },
    { href: '/notes', icon: '📝', label: 'Notas' },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co';

    if (isSupabaseConfigured) {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>
          <span className="brand-dot" />
          Project<span>Flow</span>
        </h1>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((section) => (
          <div key={section.section} className="sidebar-section">
            <div className="sidebar-section-title">{section.section}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {getInitials(CURRENT_USER.full_name)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{CURRENT_USER.full_name}</div>
            <div className="sidebar-user-role">{CURRENT_USER.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', marginTop: '8px', color: 'var(--text-tertiary)', justifyContent: 'center' }}
          title="Cerrar sesión"
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
