'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import { WalletProvider as WebWalletProvider } from '@multiversx/sdk-web-wallet-provider';
import { getMvxConfig } from '@/config/multiversx';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import axios from 'axios';

type NFT = {
  identifier: string;
  collection: string;
  name: string;
  type: string;
  nonce: number;
  balance: string;
  url?: string;
  thumbnailUrl?: string;
};

type MultiversxContextType = {
  address: string | null;
  isConnected: boolean;
  balance: string;
  nfts: NFT[];
  isLoading: boolean;
  page: number;
  totalNfts: number;
  pageSize: number;
  setPage: (page: number) => void;
  connectExtension: () => Promise<void>;
  connectWebWallet: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshData: () => Promise<void>;
};

const MultiversxContext = createContext<MultiversxContextType | undefined>(undefined);

export function MultiversxProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [totalNfts, setTotalNfts] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12; // Adjusted for a nice grid
  const [isLoading, setIsLoading] = useState(false);
  const [webWalletProvider, setWebWalletProvider] = useState<WebWalletProvider | null>(null);
  const { selectedEnvironment } = useEnvironment();
  const mvxConfig = getMvxConfig(selectedEnvironment);

  useEffect(() => {
    // Check if there is an existing session or if we are returning from Web Wallet login
    const savedAddress = localStorage.getItem('mvx_address');
    
    // Initialize WebWallet provider dynamically
    const wwp = new WebWalletProvider(`${mvxConfig.walletUrl}/show-unlock-page`);
    setWebWalletProvider(wwp);

    if (savedAddress) {
      setAddress(savedAddress);
    } else {
      // Check window location for web wallet return
      const urlParams = new URLSearchParams(window.location.search);
      const addrParams = urlParams.get('address');
      if (addrParams) {
        setAddress(addrParams);
        localStorage.setItem('mvx_address', addrParams);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    if (address) {
      refreshData();
    } else {
      setBalance('0');
      setNfts([]);
      setTotalNfts(0);
      setPage(1);
    }
  }, [address, page]); // Refresh on address OR page change

  const refreshData = async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      // Fetch balance from API
      const accRes = await axios.get(`${mvxConfig.apiUrl}/accounts/${address}`);
      if (accRes.data && accRes.data.balance) {
        // Balance is returned in attoeGLD (18 decimals)
        const balanceEGLD = (Number(accRes.data.balance) / Math.pow(10, 18)).toFixed(4);
        setBalance(balanceEGLD);
      }

      // Fetch overall NFT count
      const countRes = await axios.get(`${mvxConfig.apiUrl}/accounts/${address}/nfts/count`);
      setTotalNfts(countRes.data || 0);

      // Fetch NFTs/SFTs for current page
      const from = (page - 1) * pageSize;
      const nftsRes = await axios.get(`${mvxConfig.apiUrl}/accounts/${address}/nfts?from=${from}&size=${pageSize}`);
      if (nftsRes.data) {
        const mappedNfts: NFT[] = nftsRes.data.map((item: any) => ({
          identifier: item.identifier,
          collection: item.collection,
          name: item.name,
          type: item.type, // MetaESDT, NonFungibleESDT, SemiFungibleESDT
          nonce: item.nonce,
          balance: item.balance || '1',
          url: item.media?.[0]?.url,
          thumbnailUrl: item.media?.[0]?.thumbnailUrl || item.url
        }));
        setNfts(mappedNfts);
      }
    } catch (err) {
      console.error("Failed to fetch multiversx data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const connectExtension = async () => {
    try {
      const provider = ExtensionProvider.getInstance();
      await provider.init();
      if (!provider.isInitialized()) {
        alert("MultiversX Extension Wallet is not installed.");
        return;
      }
      
      const newAddress = await provider.login();
      if (newAddress) {
        setAddress(newAddress);
        localStorage.setItem('mvx_address', newAddress);
        // Use standard localStorage property as the extension might internally need it,
        // or just rely on our manually managed 'mvx_address'
      }
    } catch (err) {
      console.error("Login with Extension failed", err);
    }
  };

  const connectWebWallet = async () => {
    try {
      if (!webWalletProvider) return;
      const callbackUrl = window.location.origin + window.location.pathname;
      await webWalletProvider.login({ callbackUrl });
    } catch (err) {
      console.error("Login with Web Wallet failed", err);
    }
  };

  const disconnect = async () => {
    localStorage.removeItem('mvx_address');
    setAddress(null);
    setBalance('0');
    setNfts([]);
    setTotalNfts(0);
    setPage(1);
  };

  useEffect(() => {
    // When environment changes, we should refresh the providers and the data
    const wwp = new WebWalletProvider(`${mvxConfig.walletUrl}/show-unlock-page`);
    setWebWalletProvider(wwp);
    setPage(1); // Reset page on network change
    if (address) {
      refreshData();
    }
  }, [selectedEnvironment]);

  return (
    <MultiversxContext.Provider
      value={{
        address,
        isConnected: !!address,
        balance,
        nfts,
        isLoading,
        page,
        totalNfts,
        pageSize,
        setPage,
        connectExtension,
        connectWebWallet,
        disconnect,
        refreshData
      }}
    >
      {children}
    </MultiversxContext.Provider>
  );
}

export function useMultiversx() {
  const context = useContext(MultiversxContext);
  if (context === undefined) {
    throw new Error('useMultiversx must be used within a MultiversxProvider');
  }
  return context;
}
