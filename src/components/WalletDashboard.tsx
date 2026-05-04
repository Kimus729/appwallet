'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGetAccount } from '@multiversx/sdk-dapp/out/react/account/useGetAccount';
import { useGetIsLoggedIn } from '@multiversx/sdk-dapp/out/react/account/useGetIsLoggedIn';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';

interface Media {
  url: string;
  thumbnailUrl?: string;
}

interface Nft {
  identifier: string;
  collection: string;
  name: string;
  url?: string;
  thumbnailUrl?: string;
  media?: Media[];
  uris?: string[];
  balance: string;
}

export function WalletDashboard() {
  const account = useGetAccount();
  const isLoggedIn = useGetIsLoggedIn();
  const { currentConfig } = useEnvironment();
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);

  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalNfts, setTotalNfts] = useState(0);
  const [page, setPage] = useState(1);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const pageSize = 18;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchNfts = useCallback(async () => {
    if (!account?.address) return;
    setIsLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const [countRes, nftsRes] = await Promise.all([
        axios.get(`${currentConfig.api}/accounts/${account.address}/nfts/count`),
        axios.get(`${currentConfig.api}/accounts/${account.address}/nfts?from=${from}&size=${pageSize}`),
      ]);
      setTotalNfts(countRes.data ?? 0);
      setNfts(nftsRes.data ?? []);
    } catch (err) {
      console.error('[WalletDashboard] Error fetching NFTs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, page, currentConfig.api]);

  useEffect(() => {
    if (mounted && isLoggedIn) {
      fetchNfts();
    }
  }, [fetchNfts, mounted, isLoggedIn]);

  const getImageUrl = (nft: Nft) => {
    let url = '';
    
    // 1. Priority: media[0].thumbnailUrl (official thumbnail service)
    if (nft.media && nft.media.length > 0 && nft.media[0].thumbnailUrl) {
      url = nft.media[0].thumbnailUrl;
    } 
    // 2. Priority: media[0].url (official asset service)
    else if (nft.media && nft.media.length > 0 && nft.media[0].url) {
      url = nft.media[0].url;
    } 
    // 3. Priority: Root thumbnailUrl
    else if (nft.thumbnailUrl) {
      url = nft.thumbnailUrl;
    } 
    // 4. Priority: Root url
    else if (nft.url) {
      url = nft.url;
    } 
    // 5. Fallback: Try decoding URIs
    else if (nft.uris && nft.uris.length > 0) {
      try {
        // MultiversX API returns URIs as base64 encoded strings
        url = atob(nft.uris[0]);
      } catch (e) {
        url = nft.uris[0];
      }
    }

    if (!url) return '';

    // Handle IPFS protocol and normalize to a public gateway
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }

    return url;
  };

  const handleImageError = (identifier: string) => {
    setImageErrors((prev) => ({ ...prev, [identifier]: true }));
  };

  const totalPages = Math.ceil(totalNfts / pageSize);

  // Only render after client mount and when logged in
  if (!mounted || !isLoggedIn) return null;

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
                {nfts.map((nft: Nft) => {
                  const imageUrl = getImageUrl(nft);
                  const hasError = imageErrors[nft.identifier];

                  return (
                    <div
                      key={nft.identifier}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:border-cyan-500/50 transition-colors shadow-sm hover:shadow-md"
                    >
                      <div className="aspect-square relative flex items-center justify-center bg-gray-100">
                        {imageUrl && !hasError ? (
                          <Image
                            src={imageUrl}
                            alt={nft.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                            onError={() => handleImageError(nft.identifier)}
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        )}
                        {Number(nft.balance) > 1 && (
                          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full border border-gray-700">
                            x{nft.balance}
                          </div>
                        )}
                      </div>
                    <div className="p-3">
                      <div className="text-xs text-cyan-600 mb-1 truncate">{nft.collection}</div>
                      <div className="text-sm font-medium text-gray-900 truncate" title={nft.name}>
                        {nft.name}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  {t('pagination_showing')} {(page - 1) * pageSize + 1} {t('pagination_to')}{' '}
                  {Math.min(page * pageSize, totalNfts)} {t('pagination_of')} {totalNfts}{' '}
                  {t('pagination_assets')}
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
