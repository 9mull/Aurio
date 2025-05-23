import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Search as SearchIcon, ArrowRight, Play} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../../context/MusicContext';
import { useSearch } from '../../context/SearchContext';
import { musics, artists } from '../../data/musicData';
import { imageCache } from '../../services/imageCache';

const QuickSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [songResults, setSongResults] = useState<typeof musics>([]);
  const [artistResults, setArtistResults] = useState<typeof artists>([]);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [showPreview, setShowPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousSearchRef = useRef<string>('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { playSong, currentSong, isPlaying, togglePlay } = useMusic();
  const { setGlobalSearchQuery } = useSearch();
  const navigate = useNavigate();

  const handleImageLoad = useCallback((id: string, src: string) => {
    if (imageCache.isImageCached(src)) {
      setLoadedImages(prev => ({ ...prev, [id]: true }));
    }
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (query.trim() === previousSearchRef.current.trim()) {
      return;
    }

    if (query.trim()) {
      const filteredSongs = musics.filter(music => 
        music.song.title.toLowerCase().includes(query.toLowerCase()) ||
        music.song.artist.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3);

      const filteredArtists = artists.filter(artist =>
        artist.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 2);

      const imagesToPreload = [
        ...filteredSongs.map(music => music.song.musicArt),
        ...filteredArtists.map(artist => artist.photo)
      ];

      try {
        await imageCache.preloadImages(imagesToPreload);
        
        const newLoadedImages: Record<string, boolean> = {};
        filteredSongs.forEach(music => {
          newLoadedImages[music.id] = true;
        });
        filteredArtists.forEach(artist => {
          newLoadedImages[artist.id] = true;
        });
        setLoadedImages(newLoadedImages);
      } catch (error) {
        console.error('Error preloading images:', error);
      }

      setSongResults(filteredSongs);
      setArtistResults(filteredArtists);
      setShowPreview(true);
    } else {
      setSongResults([]);
      setArtistResults([]);
      setShowPreview(false);
    }
    previousSearchRef.current = query.trim();
  }, []);

  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 200);
  }, [performSearch]);

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    const initialImages = [
      ...musics.slice(0, 3).map(music => music.song.musicArt),
      ...artists.slice(0, 2).map(artist => artist.photo)
    ];
    imageCache.preloadImages(initialImages).catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPreview(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePlayClick = useCallback((music: typeof musics[0], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentSong?.id === music.song.id) {
      togglePlay();
    } else {
      playSong(music.song);
    }
  }, [currentSong, togglePlay, playSong]);

  const handleArtistClick = useCallback((artistId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      contentArea.scrollTop = 0;
    }
    navigate(`/artist/${artistId}`);
    setShowPreview(false);
  }, [navigate]);

  const handleViewAllClick = useCallback(() => {
    setGlobalSearchQuery(searchQuery);
    navigate('/search');
    setShowPreview(false);
  }, [searchQuery, setGlobalSearchQuery, navigate]);

  const searchPreviewContent = useMemo(() => {
    if (!showPreview) return null;

    return (
      <div className="search-preview">
        {songResults.length > 0 && (
          <>
            <div className="preview-section-title">Songs</div>
            {songResults.map((music) => (
              <div
                key={music.id}
                className="preview-result-item"
                onClick={(e) => handlePlayClick(music, e)}
              >
                <div className="preview-result-art">
                  <div className="image-container">
                    {!loadedImages[music.id] && (
                      <div className="spinner-container">
                        <div className="spinner" />
                      </div>
                    )}
                    <img
                      src={music.song.musicArt}
                      alt={music.song.title}
                      onLoad={() => handleImageLoad(music.id, music.song.musicArt)}
                      style={{ opacity: loadedImages[music.id] ? 1 : 0 }}
                      loading="eager"
                    />
                  </div>
                </div>
                <div className="preview-result-info">
                  <h4 className="preview-result-title">{music.song.title}</h4>
                  <p className="preview-result-artist">{music.song.artist}</p>
                </div>
                <div className="preview-result-play">
                  {currentSong?.id === music.song.id && isPlaying ? (
                    <div className="play-icon playing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <div className="play-icon">
                      <Play size={28} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
        
        {artistResults.length > 0 && (
          <>
            <div className="preview-section-title">Artists</div>
            {artistResults.map((artist) => (
              <div
                key={artist.id}
                className="preview-result-item"
                onClick={(e) => handleArtistClick(artist.id, e)}
              >
                <div className="preview-result-art">
                  <div className="image-container">
                    {!loadedImages[artist.id] && (
                      <div className="spinner-container">
                        <div className="spinner" />
                      </div>
                    )}
                    <img
                      src={artist.photo}
                      alt={artist.name}
                      onLoad={() => handleImageLoad(artist.id, artist.photo)}
                      style={{ 
                        opacity: loadedImages[artist.id] ? 1 : 0,
                        borderRadius: '50%'
                      }}
                      loading="eager"
                    />
                  </div>
                </div>
                <div className="preview-result-info">
                  <h4 className="preview-result-title">{artist.name}</h4>
                  <p className="preview-result-artist">{artist.songs.length} songs</p>
                </div>
              </div>
            ))}
          </>
        )}
        
        {(songResults.length > 0 || artistResults.length > 0) && (
          <button className="view-all-results" onClick={handleViewAllClick}>
            View all results
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    );
  }, [showPreview, songResults, artistResults, handleViewAllClick, handlePlayClick, handleArtistClick, loadedImages, currentSong, isPlaying]);

  return (
    <div className="quick-search-container" ref={containerRef}>
      <div className="search-wrapper">
        <SearchIcon className="search-icon" size={20} />
        <input
          type="text"
          className="search-input"
          placeholder="Search for songs, artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {searchPreviewContent}
    </div>
  );
};

export default React.memo(QuickSearch); 