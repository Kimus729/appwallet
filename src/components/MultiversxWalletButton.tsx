'use client';

import React, { useState } from 'react';
import { useMultiversx } from '@/contexts/MultiversxContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Wallet, Globe, XCircle } from 'lucide-react';

export function MultiversxWalletButton() {
  const { t } = useLocale();
  const { isConnected, address, balance, connectExtension, connectWebWallet, disconnect } = useMultiversx();
  const [open, setOpen] = useState(false);

  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleConnectExtension = async () => {
    await connectExtension();
    setOpen(false);
  };

  const handleConnectWebWallet = async () => {
    await connectWebWallet();
    setOpen(false);
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-semibold tracking-wide text-cyan-600">{shortenAddress(address)}</span>
        </div>
        <Button variant="outline" size="sm" onClick={disconnect} className="gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10">
          <XCircle className="w-4 h-4" />
          {t('disconnect')}
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/20">
          <Wallet className="w-4 h-4" />
          {t('connectWallet')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-gray-200 text-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-kanit font-normal text-center">{t('connect_a_wallet')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <p className="text-sm text-gray-500 mb-2">{t('options')}</p>
          
          <button 
            onClick={handleConnectExtension}
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-100 transition-all bg-gray-50 border border-gray-200 group"
          >
            <div className="bg-cyan-500 rounded-lg p-2 w-10 h-10 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl">X</span>
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium group-hover:text-cyan-600 transition-colors">MultiversX Wallet Extension</div>
            </div>
          </button>

          <button 
            onClick={handleConnectWebWallet}
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-100 transition-all bg-gray-50 border border-gray-200 group"
          >
            <div className="bg-cyan-500 rounded-lg p-2 w-10 h-10 flex items-center justify-center shrink-0">
              <Globe className="text-white w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium group-hover:text-cyan-600 transition-colors">MultiversX Web Wallet</div>
            </div>
          </button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
