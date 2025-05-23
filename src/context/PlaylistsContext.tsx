import React, { createContext, useContext, useState, useEffect } from 'react';
import { Song } from '../types/music';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

interface PlaylistsContextType {
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  getPlaylist: (playlistId: string) => Playlist | undefined;
  renamePlaylist: (playlistId: string, newName: string) => void;
}

const PlaylistsContext = createContext<PlaylistsContextType | undefined>(undefined);

export const PlaylistsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('playlists');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.map((playlist: any) => ({
        ...playlist,
        songs: Array.isArray(playlist.songs) ? playlist.songs : []
      }));
    } catch (error) {
      console.error('Error parsing playlists from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('playlists', JSON.stringify(playlists));
  }, [playlists]);

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: name.slice(0, 20),
      songs: []
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const addToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId && !playlist.songs.some(s => s.id === song.id)) {
        return { ...playlist, songs: [...playlist.songs, song] };
      }
      return playlist;
    }));
  };

  const removeFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        return { ...playlist, songs: playlist.songs.filter(song => song.id !== songId) };
      }
      return playlist;
    }));
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
  };

  const getPlaylist = (playlistId: string) => {
    return playlists.find(playlist => playlist.id === playlistId);
  };

  const renamePlaylist = (playlistId: string, newName: string) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        return { ...playlist, name: newName.slice(0, 20) };
      }
      return playlist;
    }));
  };

  return (
    <PlaylistsContext.Provider 
      value={{ 
        playlists, 
        createPlaylist, 
        addToPlaylist, 
        removeFromPlaylist,
        deletePlaylist,
        getPlaylist,
        renamePlaylist
      }}
    >
      {children}
    </PlaylistsContext.Provider>
  );
};

export const usePlaylists = () => {
  const context = useContext(PlaylistsContext);
  if (context === undefined) {
    throw new Error('usePlaylists must be used within a PlaylistsProvider');
  }
  return context;
}; 