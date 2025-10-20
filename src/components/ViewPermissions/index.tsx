'use client';

import { ListItem } from '@worldcoin/mini-apps-ui-kit-react';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { useEffect, useState } from 'react';

import { getPermissions, isWorldApp } from '@/lib/minikit';

export const ViewPermissions = () => {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const { isInstalled } = useMiniKit();

  useEffect(() => {
    const fetchPermissions = async () => {
      if (isInstalled || isWorldApp()) {
        try {
          const permissionsResult = await getPermissions();
          if (permissionsResult?.finalPayload.status === 'success') {
            setPermissions(permissionsResult?.finalPayload.permissions || {});
          }
        } catch (error) {
          console.error('Failed to fetch permissions:', error);
        }
      }
    };
    fetchPermissions();
  }, [isInstalled]);

  return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">Permissions</p>
      {permissions &&
        Object.entries(permissions).map(([permission, value]) => (
          <ListItem
            key={permission}
            description={`Enabled: ${value}`}
            label={permission}
          />
        ))}
    </div>
  );
};
