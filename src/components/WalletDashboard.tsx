'use client';

import React from 'react';
import { useMultiversx } from '@/contexts/MultiversxContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

export function WalletDashboard() {
  const { isConnected, address, balance, nfts, isLoading } = useMultiversx();

  if (!isConnected) return null;

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 shadow-lg md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Balance</CardTitle>
            <Coins className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            ) : (
              <div>
                <div className="text-3xl font-kanit font-bold text-gray-900">{balance} <span className="text-xl text-cyan-500 font-normal">EGLD</span></div>
                <p className="text-xs text-gray-500 mt-1 break-all bg-gray-100 p-2 rounded truncate" title={address || ''}>
                  {address}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-kanit font-normal text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-cyan-500" /> 
              My Digital Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            ) : nfts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No NFTs or SFTs found in this wallet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {nfts.map((nft) => (
                  <div key={nft.identifier} className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:border-cyan-500/50 transition-colors shadow-sm hover:shadow-md">
                    <div className="aspect-square relative flex items-center justify-center bg-gray-100">
                      {nft.thumbnailUrl || nft.url ? (
                        <Image 
                          src={nft.thumbnailUrl || nft.url || ''} 
                          alt={nft.name} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-600" />
                      )}
                      {Number(nft.balance) > 1 && (
                        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full border border-gray-700">
                          x{nft.balance}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-xs text-cyan-600 mb-1 truncate">{nft.collection}</div>
                      <div className="text-sm font-medium text-gray-900 truncate" title={nft.name}>{nft.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
