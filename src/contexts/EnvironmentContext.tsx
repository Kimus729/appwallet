// src/contexts/EnvironmentContext.tsx
"use client";

import type { EnvironmentKey, EnvironmentConfig } from '@/config/environments'; // Import EnvironmentConfig
import { DEFAULT_ENVIRONMENT, ENVIRONMENTS } from '@/config/environments';
import type { Dispatch, ReactNode, SetStateAction} from 'react';
import { createContext, useContext, useState, useMemo, useEffect } from 'react';

interface EnvironmentContextType {
  selectedEnvironment: EnvironmentKey;
  setSelectedEnvironment: Dispatch<SetStateAction<EnvironmentKey>>;
  currentConfig: EnvironmentConfig; // Changed from currentUrls to currentConfig
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export const EnvironmentProvider = ({ children }: { children: ReactNode }) => {
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentKey>(DEFAULT_ENVIRONMENT);

  useEffect(() => {
    // Restore preferred network from storage if it exists
    const saved = localStorage.getItem('vos_environment') as EnvironmentKey | null;
    if (saved && ENVIRONMENTS[saved]) {
      setSelectedEnvironment(saved);
    }
  }, []);

  useEffect(() => {
    // Save to local storage whenever it changes (Crucial for Web Wallet redirects)
    localStorage.setItem('vos_environment', selectedEnvironment);
  }, [selectedEnvironment]);

  const currentConfig = useMemo(() => { // Changed from currentUrls to currentConfig
    return ENVIRONMENTS[selectedEnvironment];
  }, [selectedEnvironment]);

  return (
    <EnvironmentContext.Provider value={{ selectedEnvironment, setSelectedEnvironment, currentConfig }}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = (): EnvironmentContextType => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};
