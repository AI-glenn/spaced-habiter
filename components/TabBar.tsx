'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, ListChecks, Settings as SettingsIcon } from 'lucide-react';

interface Tab {
  href: string;
  label: string;
  Icon: typeof CalendarDays;
  matches: (path: string) => boolean;
}

const TABS: Tab[] = [
  {
    href: '/',
    label: 'Today',
    Icon: CalendarDays,
    matches: (p) => p === '/' || p === '',
  },
  {
    href: '/habits',
    label: 'Habits',
    Icon: ListChecks,
    matches: (p) => p.startsWith('/habits'),
  },
  {
    href: '/settings',
    label: 'Settings',
    Icon: SettingsIcon,
    matches: (p) => p.startsWith('/settings'),
  },
];

export default function TabBar() {
  const pathname = usePathname() ?? '/';
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-surface/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex w-full max-w-xl items-stretch">
        {TABS.map(({ href, label, Icon, matches }) => {
          const active = matches(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex flex-col items-center justify-center gap-1 py-3 transition-colors',
                  active ? 'text-accent' : 'text-ink-muted hover:text-ink',
                ].join(' ')}
              >
                <Icon size={22} strokeWidth={1.75} aria-hidden />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
