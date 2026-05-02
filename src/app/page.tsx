
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import VmQueryForm from '@/components/vm-query-form';
import FileHashCalculator from '@/components/file-hash-calculator';
import EnvironmentSwitcher from '@/components/EnvironmentSwitcher';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { MultiversxWalletButton } from '@/components/MultiversxWalletButton';
import { WalletDashboard } from '@/components/WalletDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { useMultiversx } from '@/contexts/MultiversxContext';
import logoSrc from '../../public/vosdecisions-logo.png';


export default function HomePage() {
  const { t, locale } = useLocale();
  const { isConnected, balance } = useMultiversx();
  const [showFileHashCalculator, setShowFileHashCalculator] = useState(true);
  const [showVmQueryTool, setShowVmQueryTool] = useState(false);
  const [hashForQuery, setHashForQuery] = useState<string | null>(null);
  const [autoQueryModeActive, setAutoQueryModeActive] = useState(false);

  const handleHashCalculated = (newHash: string) => {
    setHashForQuery(newHash);
    setAutoQueryModeActive(true);
    // setShowVmQueryTool(true); // Keep VM Query tool hidden by default on auto-query
  };

  const handleFileCleared = () => {
    setHashForQuery(null);
    setAutoQueryModeActive(false);
    setShowVmQueryTool(false);
  };

  const handleInitialArgConsumed = () => {
    setHashForQuery(null);
  };


  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background">
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 mt-2 px-2 md:px-0">
        <div className="flex items-center space-x-2 order-2 sm:order-1 w-full sm:w-auto justify-center sm:justify-start">
          {isConnected && (
            <div className="flex items-center px-3 py-1 bg-white border border-border rounded-md shadow-sm h-9 text-sm">
              <span className="text-gray-500 mr-2">{t('wallet_balanceLabel')} :</span>
              <span className="font-semibold text-cyan-600">{balance} EGLD</span>
            </div>
          )}
          <LocaleSwitcher />
        </div>
        <div className="order-1 sm:order-2">
          <MultiversxWalletButton />
        </div>
      </div>
      <header className="w-full max-w-3xl mb-6 pt-4 md:pt-8 md:mb-12 text-center">
        <div className="flex justify-center mb-4">
          <Image
            src={logoSrc}
            alt="VOSDECISIONS Logo"
            width={80}
            height={80}
            data-ai-hint="abstract square root database"
            unoptimized={process.env.NEXT_PUBLIC_GITHUB_ACTIONS === 'true'}
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-genos font-normal text-green-950">VOSDECISIONS</h1>
      </header>

      <div className="w-full max-w-3xl space-y-8 flex-grow">
        <WalletDashboard />
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-2xl">{t('checkFileTitle')}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFileHashCalculator(!showFileHashCalculator)}
              aria-expanded={showFileHashCalculator}
              aria-controls="file-hash-calculator-content"
              aria-pressed={showFileHashCalculator}
              role="button"
              title={showFileHashCalculator ? t('hideText') : t('showText')}
            >
              {showFileHashCalculator ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              <span className="sr-only">{showFileHashCalculator ? t('hideText') : t('showText')} {t('checkFileTitle')}</span>
            </Button>
          </CardHeader>
          {showFileHashCalculator && (
            <CardContent id="file-hash-calculator-content" className="pt-6">
              <FileHashCalculator
                onHashCalculated={handleHashCalculated}
                onFileCleared={handleFileCleared}
              />
            </CardContent>
          )}
        </Card>

        {autoQueryModeActive ? (
            <VmQueryForm
              initialArg0={hashForQuery}
              onInitialArgConsumed={handleInitialArgConsumed}
              isAutoMode={true}
            />
        ) : (
          showVmQueryTool ? (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-2xl">{t('vmQueryToolTitle')}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVmQueryTool(!showVmQueryTool)}
                  aria-expanded={showVmQueryTool}
                  aria-controls="vm-query-tool-content"
                  aria-pressed={showVmQueryTool}
                  role="button"
                  title={showVmQueryTool ? t('hideText') : t('showText')}
                >
                  {showVmQueryTool ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  <span className="sr-only">{showVmQueryTool ? t('hideText') : t('showText')} {t('vmQueryToolTitle')}</span>
                </Button>
              </CardHeader>
              {showVmQueryTool && (
                <CardContent id="vm-query-tool-content" className="pt-6">
                    <VmQueryForm
                      initialArg0={null}
                      onInitialArgConsumed={handleInitialArgConsumed}
                      isAutoMode={false}
                    />
                </CardContent>
              )}
            </Card>
          ) : null
        )}
      </div>
      <footer className="w-full max-w-3xl mt-auto py-8 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-border/30">
        <div className="order-2 sm:order-1">
          <EnvironmentSwitcher />
        </div>
        <div className="order-1 sm:order-2 text-center sm:text-right">
          <p className="text-xs text-muted-foreground">{t('footerCopyright')}</p>
        </div>
      </footer>
    </div>
  );
}
