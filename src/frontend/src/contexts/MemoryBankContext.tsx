import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Types for memory bank
export interface MemoryBank {
  // Add more keys as you expand memory features
  theme: string;
  sidebarOpen: boolean;
  chatHistory: any[];
  settings: Record<string, any>;
  [key: string]: any;
}

interface MemoryBankContextType {
  memory: MemoryBank;
  setMemory: (key: keyof MemoryBank, value: any) => void;
  clearMemory: () => void;
}

const defaultMemory: MemoryBank = {
  theme: 'dark',
  sidebarOpen: true,
  chatHistory: [],
  settings: {},
};

const MemoryBankContext = createContext<MemoryBankContextType | undefined>(undefined);

export const MemoryBankProvider = ({ children }: { children: ReactNode }) => {
  const [memory, setMemoryState] = useState<MemoryBank>(() => {
    try {
      const stored = localStorage.getItem('memory-bank');
      return stored ? { ...defaultMemory, ...JSON.parse(stored) } : defaultMemory;
    } catch {
      return defaultMemory;
    }
  });

  // Sync to localStorage on change
  useEffect(() => {
    localStorage.setItem('memory-bank', JSON.stringify(memory));
  }, [memory]);

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'memory-bank' && e.newValue) {
        setMemoryState({ ...defaultMemory, ...JSON.parse(e.newValue) });
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const setMemory = (key: keyof MemoryBank, value: any) => {
    setMemoryState(prev => ({ ...prev, [key]: value }));
  };

  const clearMemory = () => {
    setMemoryState(defaultMemory);
    localStorage.removeItem('memory-bank');
  };

  return (
    <MemoryBankContext.Provider value={{ memory, setMemory, clearMemory }}>
      {children}
    </MemoryBankContext.Provider>
  );
};

export const useMemoryBank = () => {
  const ctx = useContext(MemoryBankContext);
  if (!ctx) throw new Error('useMemoryBank must be used within MemoryBankProvider');
  return ctx;
};
