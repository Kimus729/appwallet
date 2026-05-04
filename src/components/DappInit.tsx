'use client';

import { useEffect } from 'react';
import { initSdkDapp } from '@/lib/sdkDapp';

/**
 * DappInit — Client-only component that initializes sdk-dapp v5.
 * Must be rendered inside the body to avoid SSR issues.
 */
export function DappInit() {
  useEffect(() => {
    initSdkDapp().catch((err) => {
      console.error('[DappInit] Failed to initialize sdk-dapp:', err);
    });
  }, []);

  return null;
}
