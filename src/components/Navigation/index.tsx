'use client';

import { TabItem, Tabs } from '@worldcoin/mini-apps-ui-kit-react';
import { Bank, Home, Message, Settings } from 'iconoir-react';
import { usePathname, useRouter } from 'next/navigation';
import { startTransition, useEffect, useState } from 'react';

const tabs = [
  { value: '/home', icon: <Home />, label: 'Inicio' },
  { value: '/feed', icon: <Message />, label: 'Feed' },
  { value: '/wallet', icon: <Bank />, label: 'Wallet' },
  { value: '/settings', icon: <Settings />, label: 'Ajustes' },
];

export const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState('/home');

  useEffect(() => {
    if (pathname && pathname !== value) {
      const match = tabs.find((tab) => pathname.startsWith(tab.value));
      if (match) {
        startTransition(() => {
          setValue(match.value);
        });
      }
    }
  }, [pathname, value]);

  const handleChange = (nextValue: string) => {
    setValue(nextValue);
    if (nextValue !== pathname) {
      router.push(nextValue);
    }
  };

  return (
    <Tabs value={value} onValueChange={handleChange}>
      {tabs.map((tab) => (
        <TabItem
          key={tab.value}
          value={tab.value}
          icon={tab.icon}
          label={tab.label}
          disabled={tab.disabled}
        />
      ))}
    </Tabs>
  );
};
