import React, { createContext, useContext, useState, useEffect } from 'react';
import { Song } from '../types/music';

interface FavouritesContextType {
  favourites: Song[];
  addToFavourites: (song: Song) => void;
  removeFromFavourites: (songId: string) => void;
  isFavourite: (songId: string) => boolean;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export const FavouritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favourites, setFavourites] = useState<Song[]>(() => {
    const saved = localStorage.getItem('favourites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('favourites', JSON.stringify(favourites));
  }, [favourites]);

  const addToFavourites = (song: Song) => {
    setFavourites(prev => {
      if (!prev.some(s => s.id === song.id)) {
        return [...prev, song];
      }
      return prev;
    });
  };

  const removeFromFavourites = (songId: string) => {
    setFavourites(prev => prev.filter(song => song.id !== songId));
  };

  const isFavourite = (songId: string) => {
    return favourites.some(song => song.id === songId);
  };

  return (
    <FavouritesContext.Provider 
      value={{ 
        favourites, 
        addToFavourites, 
        removeFromFavourites, 
        isFavourite 
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (context === undefined) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
}; 