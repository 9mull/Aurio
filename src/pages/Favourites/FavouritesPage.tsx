import React, { useState, useEffect } from 'react';
import { Play, Heart } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { useFavourites } from '../../context/FavouritesContext';
import Spinner from '../../components/Spinner';

const FavouritesPage: React.FC = () => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const { playSong, currentSong, isPlaying, togglePlay } = useMusic();
  const { favourites, removeFromFavourites } = useFavourites();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const handlePlayClick = (song: typeof favourites[0]) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, { type: 'favourites' });
    }
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (favourites.length === 0) {
    return (
      <div className="favourites-page">
        <h2 className="section-title">Favourites</h2>
        <div className="no-results-message">
          No favourite tracks yet. Like some tracks to see them here!
        </div>
      </div>
    );
  }

  return (
    <div className="favourites-page">
      <h2 className="section-title">Favourites</h2>
      <div className="favourites-content">
        {favourites.map(song => (
          <div key={song.id} className="favourite-track">
            <div className="favourite-track-info">
              <div className="favourite-track-art">
                {!loadedImages[song.id] && <Spinner />}
                <img 
                  src={song.musicArt} 
                  alt={song.title}
                  style={{ opacity: loadedImages[song.id] ? 1 : 0 }}
                  onLoad={() => handleImageLoad(song.id)}
                />
                <div 
                  className="favourite-track-overlay"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayClick(song);
                  }}
                >
                  {currentSong?.id === song.id && isPlaying ? (
                    <div className="play-icon playing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <Play size={38} />
                  )}
                </div>
              </div>
              <div className="favourite-track-details">
                <h3 className="favourite-track-title">{song.title}</h3>
                <p className="favourite-track-artist">{song.artist}</p>
              </div>
            </div>
            <div className="favourite-track-actions">
              <span className="favourite-track-duration">{formatDuration(song.duration)}</span>
              <button 
                className="favourite-track-heart active"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromFavourites(song.id);
                }}
              >
                <Heart size={20} fill="#ef4444" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavouritesPage; 