import React, { createContext, useContext, useState } from 'react';

interface SearchContextType {
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  return (
    <SearchContext.Provider value={{ globalSearchQuery, setGlobalSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}; 