import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { musics } from '../../data/musicData';
import { imageCache } from '../../services/imageCache';
import Spinner from '../../components/Spinner';

interface AllSongsProps {
  searchQuery: string;
  searchResults: typeof musics;
}

const TRACKS_PER_PAGE = 5;

const AllSongs: React.FC<AllSongsProps> = ({ searchQuery, searchResults }) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [visibleTracks, setVisibleTracks] = useState(TRACKS_PER_PAGE);
  const [isButtonSliding, setIsButtonSliding] = useState(false);
  const [newCards, setNewCards] = useState<string[]>([]);
  const { playSong, currentSong, isPlaying, togglePlay } = useMusic();

  useEffect(() => {
    setVisibleTracks(TRACKS_PER_PAGE);
    setIsButtonSliding(false);
    setNewCards([]);
  }, [searchResults]);

  const handleImageLoad = (id: string, src: string) => {
    if (imageCache.isImageCached(src)) {
      setLoadedImages(prev => ({ ...prev, [id]: true }));
    }
  };

  const handlePlayClick = (music: typeof musics[0]) => {
    if (currentSong?.id === music.song.id) {
      togglePlay();
    } else {
      playSong(music.song);
    }
  };

  const handleShowMore = async () => {
    setIsButtonSliding(true);
    const currentVisible = visibleTracks;
    const newVisible = Math.min(currentVisible + TRACKS_PER_PAGE, searchResults.length);
    
    const newSlice = searchResults.slice(currentVisible, newVisible);
    const imagesToPreload = newSlice.map(music => music.song.musicArt);
    
    try {
      await imageCache.preloadImages(imagesToPreload);
      
      const newCardIds = newSlice.map(music => music.id);
      setVisibleTracks(newVisible);
      setNewCards(newCardIds);
      
      const newLoadedImages = { ...loadedImages };
      newSlice.forEach(music => {
        newLoadedImages[music.id] = true;
      });
      setLoadedImages(newLoadedImages);
    } catch (error) {
      console.error('Error preloading images:', error);
    }
    
    setIsButtonSliding(false);
  };

  useEffect(() => {
    const initialImages = searchResults
      .slice(0, visibleTracks)
      .map(music => music.song.musicArt);
    
    imageCache.preloadImages(initialImages)
      .then(() => {
        const newLoadedImages: Record<string, boolean> = {};
        searchResults.slice(0, visibleTracks).forEach(music => {
          newLoadedImages[music.id] = true;
        });
        setLoadedImages(newLoadedImages);
      })
      .catch(console.error);
  }, [searchResults, visibleTracks]);

  const hasMoreTracks = visibleTracks < searchResults.length;

  return (
    <div className="search-results">
      <h2 className="section-title">
        {searchQuery ? '' : 'All Songs'}
      </h2>
      <div className="search-results-grid">
        {searchResults.slice(0, visibleTracks).map((music) => (
          <div
            key={music.id}
            className={`search-result-card ${newCards.includes(music.id) ? 'new-card' : ''}`}
            onClick={() => handlePlayClick(music)}
          >
            <div className="search-result-art">
              <div className="image-container">
                {!loadedImages[music.id] && <Spinner />}
                <img
                  src={music.song.musicArt}
                  alt={music.song.title}
                  onLoad={() => handleImageLoad(music.id, music.song.musicArt)}
                  style={{ opacity: loadedImages[music.id] ? 1 : 0 }}
                  loading="eager"
                />
              </div>
              <div className="search-result-overlay">
                {currentSong?.id === music.song.id && isPlaying ? (
                  <div className="play-icon playing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <div className="play-icon">
                    <Play size={38} />
                  </div>
                )}
              </div>
            </div>
            <div className="search-result-info">
              <h3 className="search-result-title">{music.song.title}</h3>
              <p className="search-result-artist">{music.song.artist}</p>
            </div>
          </div>
        ))}
      </div>
      {hasMoreTracks && (
        <div className={`show-more-button-wrapper${isButtonSliding ? ' sliding' : ''}`}>
          <button 
            className="show-more-button" 
            onClick={handleShowMore}
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
};

export default AllSongs; 