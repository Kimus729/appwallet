
"use client";

import { useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadCloud, FileText, XCircle, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext'; // Import useLocale
import { useGetAccount } from '@multiversx/sdk-dapp/out/react/account/useGetAccount';
import { useGetIsLoggedIn } from '@multiversx/sdk-dapp/out/react/account/useGetIsLoggedIn';
import { getAccountProvider } from '@multiversx/sdk-dapp/out/providers/helpers/accountProvider';
import { TransactionManager } from '@multiversx/sdk-dapp/out/managers/TransactionManager';
import { Address, Transaction } from '@multiversx/sdk-core/out';
import { ApiNetworkProvider } from '@multiversx/sdk-core/out/networkProviders';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import axios from 'axios';

interface FileHashCalculatorProps {
  onHashCalculated?: (hash: string) => void;
  onFileCleared?: () => void;
}

export default function FileHashCalculator({ onHashCalculated, onFileCleared }: FileHashCalculatorProps) {
  const { t } = useLocale(); // Get t function
  const { currentConfig } = useEnvironment();
  const account = useGetAccount();
  const isLoggedIn = useGetIsLoggedIn();

  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [fileType, setFileType] = useState("01"); // default "01" (Exclusive)
  const [isWriting, setIsWriting] = useState(false);

  const calculateSHA256 = async (inputFile: File): Promise<string> => {
    const buffer = await inputFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const processFile = async (selectedFile: File | null) => {
    if (!selectedFile) {
      clearFile();
      return;
    }

    setFile(selectedFile);
    setHash(null);
    setError(null);
    setIsLoading(true);

    try {
      const calculatedHash = await calculateSHA256(selectedFile);
      setHash(calculatedHash);
      if (onHashCalculated) {
        onHashCalculated(calculatedHash);
      }
    } catch (e: any) {
      console.error("Hashing Error:", e);
      setError(e.message || 'An unexpected error occurred during hashing.');
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    setError(null);

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0];
      await processFile(droppedFile);
      event.dataTransfer.clearData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      await processFile(event.target.files[0]);
    } else {
      await processFile(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setHash(null);
    setError(null);
    setIsLoading(false);
    const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    if (onFileCleared) {
      onFileCleared();
    }
  };

  const handleWrite = async () => {
    if (!hash || !isLoggedIn || !account?.address) return;

    setIsWriting(true);
    try {
      const data = `printInfo@${fileType}@${hash}`;

      const tx = new Transaction({
        value: BigInt(0),
        data: new TextEncoder().encode(data),
        sender: new Address(account.address),
        receiver: new Address(currentConfig.defaultScAddress),
        gasLimit: BigInt(10000000), // Safe default for simulation
        gasPrice: BigInt(1000000000), // Default 1 Gwei
        chainID: currentConfig.chainId,
        nonce: BigInt(account.nonce)
      });

      // Gas estimation using ApiNetworkProvider as per documentation
      try {
        const apiProvider = new ApiNetworkProvider(currentConfig.api);
        const costResponse = await apiProvider.estimateTransactionCost(tx);
        
        if (costResponse && costResponse.gasLimit) {
          const estimatedGas = costResponse.gasLimit;
          // Use estimated value + 5% as requested
          const calculatedGasLimit = BigInt(Math.ceil(estimatedGas * 1.05));
          tx.gasLimit = calculatedGasLimit;
          console.log(`[FileHashCalculator] Gas estimated: ${estimatedGas}, setting gasLimit: ${calculatedGasLimit}`);
        }
      } catch (estError) {
        console.warn("[FileHashCalculator] Gas estimation failed, falling back to default limit:", estError);
        // If estimation fails, we keep the high default of 10M to be safe
      }

      const provider = getAccountProvider();
      const signedTransactions = await provider.signTransactions([tx]);

      const txManager = TransactionManager.getInstance();
      const sentTransactions = await txManager.send(signedTransactions);
      await txManager.track(sentTransactions, {
        transactionsDisplayInfo: {
          processingMessage: t('fileHash_writingTx'),
          errorMessage: t('fileHash_errorTitle'),
          successMessage: t('fileHash_writeSuccess'),
        },
        onSuccess: async () => {
          if (onHashCalculated && hash) {
            onHashCalculated(hash);
          }
        }
      });
    } catch (e: any) {
      console.error("Transaction Error:", e);
      setError(e.message || 'An unexpected error occurred during transaction.');
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardContent className="space-y-6 pt-6">
        <div
          className={cn(
            "flex flex-col items-center justify-center w-full p-6 sm:p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-accent hover:bg-accent/5",
            error ? "border-destructive bg-destructive/5" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload-input')?.click()}
          role="button"
          tabIndex={0}
          aria-label={t('fileHash_uploadOrDrag')}
        >
          <UploadCloud className={cn("h-10 w-10 sm:h-12 sm:w-12 mb-4", isDragging ? "text-primary" : "text-muted-foreground")} />
          <p className="mb-2 text-sm text-muted-foreground">
            <span className="font-semibold">{t('fileHash_uploadOrDrag')}</span>
          </p>
          <p className="text-xs text-muted-foreground">{t('fileHash_anyFileType')}</p>
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3 w-3 mr-1 text-green-500" />
            <span>{t('fileHash_processedLocally')}</span>
          </div>
          <Input
            id="file-upload-input"
            type="file"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>

        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('fileHash_errorTitle')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {file && !error && (
          <div className="p-4 border rounded-md bg-card space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium truncate" title={file.name}>{file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
              <Button variant="ghost" size="icon" onClick={clearFile} aria-label={t('fileHash_clearFile')} title={t('fileHash_clearFile')} className="text-muted-foreground hover:text-destructive shrink-0">
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            {isLoading && (
              <div className="flex items-center text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {t('fileHash_calculating')}
              </div>
            )}

            {hash && !isLoading && (
              <div>
                <p className="text-sm font-semibold text-primary mb-1">{t('fileHash_sha256Hash')}</p>
                <pre className="text-xs font-mono bg-muted/80 p-3 rounded-md break-all overflow-x-auto select-all">
                  {hash}
                </pre>
              </div>
            )}

            {hash && !isLoading && isLoggedIn && (
              <div className="pt-4 mt-4 border-t space-y-4">
                <Button
                  onClick={handleWrite}
                  disabled={isWriting}
                  className="w-full sm:w-auto"
                >
                  {isWriting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {t('fileHash_writingTx')}
                    </>
                  ) : (
                    t('fileHash_writeButton')
                  )}
                </Button>

                <RadioGroup
                  defaultValue="01"
                  value={fileType}
                  onValueChange={setFileType}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="01" id="r1" />
                    <Label htmlFor="r1">{t('fileHash_exclusive')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="02" id="r2" />
                    <Label htmlFor="r2">{t('fileHash_duplicable')}</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        )}
        {!file && !error && !isLoading && (
          <div className="text-center text-sm text-muted-foreground py-4">
            {t('fileHash_noFileSelected')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
