/**
 * sdk-dapp v5 initialization helper.
 * Reads the saved environment from localStorage (set by EnvironmentContext)
 * and calls initApp with the correct configuration.
 *
 * This file is imported from a 'use client' component to avoid SSR issues.
 */
import { initApp } from '@multiversx/sdk-dapp/out/methods/initApp/initApp';
import type { InitAppType } from '@multiversx/sdk-dapp/out/methods/initApp/initApp.types';
import { EnvironmentsEnum } from '@multiversx/sdk-dapp/out/types/enums.types';

// Map our environment keys to sdk-dapp EnvironmentsEnum
const ENV_MAP: Record<string, EnvironmentsEnum> = {
  devnet: EnvironmentsEnum.devnet,
  testnet: EnvironmentsEnum.testnet,
  mainnet: EnvironmentsEnum.mainnet,
};

export async function initSdkDapp(): Promise<void> {
  // Read saved environment preference (set by EnvironmentContext)
  const savedEnv =
    typeof window !== 'undefined'
      ? (localStorage.getItem('vos_environment') ?? 'devnet')
      : 'devnet';

  const environment = ENV_MAP[savedEnv] ?? EnvironmentsEnum.devnet;

  const config: InitAppType = {
    storage: {
      // Use sessionStorage for security — session ends when tab is closed
      getStorageCallback: () => sessionStorage,
    },
    dAppConfig: {
      environment,
      nativeAuth: {
        expirySeconds: 3600,                   // 1 hour session
        tokenExpirationToastWarningSeconds: 60, // warn 1 min before logout
      },
    },
  };

  await initApp(config);
}
