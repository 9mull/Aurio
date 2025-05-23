import React, { createContext, useState, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';
import { Song } from '../types/music';
import { featuredMusics, artists, musics } from '../data/musicData';
import { useFavourites } from './FavouritesContext';
import { usePlaylists } from './PlaylistsContext';

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentArtistId: string | null;
  currentPlaylistId: string | null;
  playSong: (song: Song, source?: { type: 'artist' | 'playlist' | 'favourites' | 'carousel' | 'featured', id?: string }) => void;
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  nextSong: () => void;
  prevSong: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentArtistId, setCurrentArtistId] = useState<string | null>(null);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [currentPlaylistSource, setCurrentPlaylistSource] = useState<'carousel' | 'artist' | 'featured' | 'playlist' | 'favourites' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPositionRef = useRef<number>(0);
  const { favourites } = useFavourites();
  const { getPlaylist } = usePlaylists();

  const getCurrentPlaylist = useCallback(() => {
    switch (currentPlaylistSource) {
      case 'carousel':
        return musics.map(m => m.song);
      case 'artist':
        if (currentArtistId) {
          const artist = artists.find(a => a.id === currentArtistId);
          return artist ? artist.songs : [];
        }
        return [];
      case 'featured':
        return featuredMusics.map(m => m.song);
      case 'playlist':
        if (currentPlaylistId) {
          const playlist = getPlaylist(currentPlaylistId);
          return playlist ? playlist.songs : [];
        }
        return [];
      case 'favourites':
        return favourites;
      default:
        return [];
    }
  }, [currentPlaylistSource, currentArtistId, currentPlaylistId, favourites, getPlaylist]);

  const nextSong = useCallback(() => {
    const currentPlaylist = getCurrentPlaylist();
    if (!currentPlaylist.length || !currentSong) return;

    const currentIndex = currentPlaylist.findIndex(song => song.id === currentSong.id);
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % currentPlaylist.length;
    playSong(currentPlaylist[nextIndex], { 
      type: currentPlaylistSource || 'carousel',
      id: currentPlaylistSource === 'artist' ? currentArtistId || undefined : 
          currentPlaylistSource === 'playlist' ? currentPlaylistId || undefined : undefined
    });
  }, [currentSong, currentPlaylistSource, currentArtistId, currentPlaylistId, getCurrentPlaylist]);

  const handleTrackEnd = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    nextSong();
  }, [nextSong]);

  const saveCurrentPosition = useCallback(() => {
    if (audioRef.current) {
      lastPositionRef.current = audioRef.current.currentTime;
    }
  }, []);

  const restorePosition = useCallback(() => {
    if (audioRef.current && lastPositionRef.current > 0) {
      audioRef.current.currentTime = lastPositionRef.current;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current || new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      lastPositionRef.current = time;
      
      if (audio.duration && time >= audio.duration - 0.5) {
        handleTrackEnd();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      if (currentSong && audio.src.includes(currentSong.musicSrc)) {
        restorePosition();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleTrackEnd);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      saveCurrentPosition();
    };
  }, [handleTrackEnd, saveCurrentPosition, restorePosition, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      const isSameTrack = audioRef.current.src.includes(currentSong.musicSrc);
      
      if (!isSameTrack) {
        audioRef.current.pause();
        audioRef.current.src = currentSong.musicSrc;
        audioRef.current.load();
        lastPositionRef.current = 0;
        
        const handleCanPlay = async () => {
          if (isPlaying && audioRef.current) {
            try {
              await audioRef.current.play();
            } catch (error) {
              console.error('Error playing audio:', error);
              setIsPlaying(false);
            }
          }
        };

        audioRef.current.addEventListener('canplay', handleCanPlay, { once: true });
      }
    }
  }, [currentSong, isPlaying]);

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const handlePlayStateChange = async () => {
      if (!audioRef.current) return;

      try {
        if (isPlaying) {
          if (audioRef.current.readyState >= 2) {
            await audioRef.current.play();
          } else {
            const handleCanPlay = async () => {
              if (audioRef.current && isPlaying) {
                try {
                  await audioRef.current.play();
                } catch (error) {
                  console.error('Error playing audio:', error);
                  setIsPlaying(false);
                }
              }
            };
            audioRef.current.addEventListener('canplay', handleCanPlay, { once: true });
          }
        } else {
          audioRef.current.pause();
        }
      } catch (error) {
        console.error('Error handling play state:', error);
        setIsPlaying(false);
      }
    };

    handlePlayStateChange();
  }, [isPlaying, currentSong]);

  const playSong = useCallback((song: Song, source?: { type: 'artist' | 'playlist' | 'favourites' | 'carousel' | 'featured', id?: string }) => {
    if (currentSong?.id === song.id) {
      if (!isPlaying) {
        setIsPlaying(true);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setCurrentSong(song);
    setIsPlaying(true);

    if (source) {
      setCurrentPlaylistSource(source.type);
      
      switch (source.type) {
        case 'artist':
          setCurrentArtistId(source.id || null);
          setCurrentPlaylistId(null);
          break;
        case 'playlist':
          setCurrentPlaylistId(source.id || null);
          setCurrentArtistId(null);
          break;
        case 'favourites':
          setCurrentPlaylistId(null);
          setCurrentArtistId(null);
          break;
        case 'carousel':
          const artist = artists.find(a => a.songs.some(s => s.id === song.id));
          setCurrentArtistId(artist?.id || null);
          setCurrentPlaylistId(null);
          break;
        case 'featured':
          const featuredArtist = artists.find(a => a.songs.some(s => s.id === song.id));
          setCurrentArtistId(featuredArtist?.id || null);
          setCurrentPlaylistId(null);
          break;
      }
    }
  }, [currentSong, isPlaying]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const setNewCurrentTime = useCallback((time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      lastPositionRef.current = time;
    }
  }, []);

  const prevSong = useCallback(() => {
    const currentPlaylist = getCurrentPlaylist();
    if (!currentPlaylist.length || !currentSong) return;

    const currentIndex = currentPlaylist.findIndex(song => song.id === currentSong.id);
    if (currentIndex === -1) return;

    const prevIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playSong(currentPlaylist[prevIndex], { 
      type: currentPlaylistSource || 'carousel',
      id: currentPlaylistSource === 'artist' ? currentArtistId || undefined : 
          currentPlaylistSource === 'playlist' ? currentPlaylistId || undefined : undefined
    });
  }, [currentSong, currentPlaylistSource, currentArtistId, currentPlaylistId, getCurrentPlaylist, playSong]);

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        currentArtistId,
        currentPlaylistId,
        playSong,
        togglePlay,
        setCurrentTime: setNewCurrentTime,
        setVolume,
        nextSong,
        prevSong,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};