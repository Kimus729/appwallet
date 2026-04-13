'use client';

import React, { useState } from 'react';
import { useMultiversx } from '@/contexts/MultiversxContext';
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
          <span className="text-sm font-semibold tracking-wide text-cyan-400">{shortenAddress(address)}</span>
          <span className="text-xs text-muted-foreground">{balance} EGLD</span>
        </div>
        <Button variant="outline" size="sm" onClick={disconnect} className="gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10">
          <XCircle className="w-4 h-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/20">
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#1e1e1e] border-[#333] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-kanit font-normal text-center">Connect a wallet</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <p className="text-sm text-gray-400 mb-2">Options</p>
          
          <button 
            onClick={handleConnectExtension}
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#2a2a2a] transition-all bg-[#1a1a1a] border border-[#333] group"
          >
            <div className="bg-cyan-400 rounded-lg p-2 w-10 h-10 flex items-center justify-center shrink-0">
              <span className="text-black font-bold text-xl">X</span>
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium group-hover:text-cyan-400 transition-colors">MultiversX Wallet Extension</div>
            </div>
          </button>

          <button 
            onClick={handleConnectWebWallet}
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#2a2a2a] transition-all bg-[#1a1a1a] border border-[#333] group"
          >
            <div className="bg-cyan-400 rounded-lg p-2 w-10 h-10 flex items-center justify-center shrink-0">
              <Globe className="text-black w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium group-hover:text-cyan-400 transition-colors">MultiversX Web Wallet</div>
            </div>
          </button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
