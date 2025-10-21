'use client';

import { TabItem, Tabs } from '@worldcoin/mini-apps-ui-kit-react';
import { Bank, Home, User } from 'iconoir-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const tabs = [
  { value: '/home', icon: <Home />, label: 'Home' },
  { value: '/wallet', icon: <Bank />, label: 'Wallet' },
  { value: '/profile', icon: <User />, label: 'Profile', disabled: true },
];

export const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState('/home');

  useEffect(() => {
    if (pathname && pathname !== value) {
      const match = tabs.find((tab) => pathname.startsWith(tab.value));
      if (match) {
        setValue(match.value);
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
