'use client';

import React, { useState, useEffect } from 'react';
import { useGetAccount } from '@multiversx/sdk-dapp/out/react/account/useGetAccount';
import { useGetIsLoggedIn } from '@multiversx/sdk-dapp/out/react/account/useGetIsLoggedIn';
import { getAccountProvider } from '@multiversx/sdk-dapp/out/providers/helpers/accountProvider';
import { UnlockPanelManager } from '@multiversx/sdk-dapp/out/managers/UnlockPanelManager';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import { Wallet, XCircle, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function MultiversxWalletButton() {
  const { t } = useLocale();
  const account = useGetAccount();
  const isLoggedIn = useGetIsLoggedIn();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shortenAddress = (addr: string) =>
    `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  const handleConnect = () => {
    const unlockPanelManager = UnlockPanelManager.init({
      loginHandler: () => {
        // Callback after successful login — nothing extra needed,
        // sdk-dapp updates the store automatically
      },
    });
    unlockPanelManager.openUnlockPanel();
  };

  const handleDisconnect = async () => {
    try {
      const provider = getAccountProvider();
      await provider.logout();
    } catch (err) {
      console.error('[MultiversxWalletButton] Logout failed:', err);
    }
  };

  // Avoid hydration mismatch — render nothing until mounted on client
  if (!mounted) {
    return (
      <Button variant="default" disabled className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white opacity-60">
        <Wallet className="w-4 h-4" />
        {t('connectWallet')}
      </Button>
    );
  }

  if (isLoggedIn && account?.address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-cyan-500/30 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-500/60 transition-all"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-xs">{shortenAddress(account.address)}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          <div className="px-2 py-1.5 text-xs text-gray-500 border-b mb-1">
            {t('wallet_balanceLabel')} :{' '}
            <span className="font-semibold text-cyan-600">
              {account.balance
                ? (Number(account.balance) / 1e18).toFixed(4)
                : '0'}{' '}
              EGLD
            </span>
          </div>
          <DropdownMenuItem
            className="gap-2 text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer"
            onClick={handleDisconnect}
          >
            <XCircle className="w-4 h-4" />
            {t('disconnect')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="default"
      onClick={handleConnect}
      className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/20 transition-all"
    >
      <Wallet className="w-4 h-4" />
      {t('connectWallet')}
    </Button>
  );
}
