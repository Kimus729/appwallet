'use client';

import React from 'react';
import { useMultiversx } from '@/contexts/MultiversxContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Image as ImageIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from '@/contexts/LocaleContext';

export function WalletDashboard() {
  const { isConnected, address, balance, nfts, isLoading, page, totalNfts, pageSize, setPage } = useMultiversx();
  const { t } = useLocale();
  
  const totalPages = Math.ceil(totalNfts / pageSize);

  if (!isConnected) return null;

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-6">
        <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 shadow-lg w-full">
          <CardHeader>
            <CardTitle className="text-lg font-kanit font-normal text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-cyan-500" /> 
              {t('wallet_myAssetsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
              </div>
            ) : nfts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t('wallet_noAssetsFound')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  {t('pagination_showing')} {(page - 1) * pageSize + 1} {t('pagination_to')} {Math.min(page * pageSize, totalNfts)} {t('pagination_of')} {totalNfts} {t('pagination_assets')}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1 || isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-medium w-28 text-center">
                    {t('pagination_page')} {page} {t('pagination_pageOf')} {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages || isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
