'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Home, Group, Wallet, Settings } from 'iconoir-react';

const NAV_ITEMS = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/creators', label: 'Creators', icon: Group },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className="flex w-full items-center justify-around border-t border-gray-200 bg-white py-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 text-xs font-semibold ${
              isActive ? 'text-black' : 'text-gray-400'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
};
