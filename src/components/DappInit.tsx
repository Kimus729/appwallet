'use client';

import { useEffect, useState } from 'react';
import { initSdkDapp } from '@/lib/sdkDapp';

/**
 * DappProviderWrapper — Client-only component that initializes sdk-dapp v5.
 * It delays rendering of children until initApp has completed its initialization,
 * ensuring that the global store is correctly populated before any sdk-dapp hooks (e.g. useGetAccount) run.
 */
export function DappProviderWrapper({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initSdkDapp()
      .then(() => {
        setInitialized(true);
      })
      .catch((err) => {
        console.error('[DappProviderWrapper] Failed to initialize sdk-dapp:', err);
        // Even on error, we might want to let the app render, but log it.
        setInitialized(true);
      });
  }, []);

  if (!initialized) {
    // Return null or a subtle loading spinner while the store is being initialized
    return null;
  }

  return <>{children}</>;
}
