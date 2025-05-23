import React, { useState } from 'react';
import { Heart, Play, Pause } from 'lucide-react';
import { musics } from '../../data/musicData';
import { useMusic } from '../../context/MusicContext';
import { useFavourites } from '../../context/FavouritesContext';
import Spinner from '../../components/Spinner';

const PremiereSection: React.FC = () => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const { playSong, currentSong, isPlaying, togglePlay } = useMusic();
  const { isFavourite, addToFavourites, removeFromFavourites } = useFavourites();

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const handleFavouriteClick = (music: typeof musics[0], e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavourite(music.song.id)) {
      removeFromFavourites(music.song.id);
    } else {
      addToFavourites(music.song);
    }
  };

  const handlePlayClick = (music: typeof musics[0]) => {
    if (currentSong?.id === music.song.id) {
      togglePlay();
    } else {
      playSong(music.song, { type: 'carousel' });
    }
  };

  return (
    <div className="section">
      <span className="section-subtitle">new releases</span>
      <h2 className="section-title">Premiere</h2>
      <div className="premiere-tracks">
        {musics.slice(0, 6).map((music) => (
          <div 
            key={music.id} 
            className="premiere-track"
            onClick={() => handlePlayClick(music)}
          >
            <div className="premiere-track-info">
              <div className="premiere-track-art">
                <div className="image-container">
                  {!loadedImages[music.id] && <Spinner />}
                  <img 
                    src={music.song.musicArt} 
                    alt={music.song.title}
                    style={{ opacity: loadedImages[music.id] ? 1 : 0 }}
                    onLoad={() => handleImageLoad(music.id)}
                  />
                </div>
                <div className="premiere-track-overlay">
                  {currentSong?.id === music.song.id && isPlaying ? (
                    <Pause size={24} />
                  ) : (
                    <Play size={24} />
                  )}
                </div>
              </div>
              <div className="premiere-track-details">
                <h3 className="premiere-track-title">{music.song.title}</h3>
                <p className="premiere-track-artist">{music.song.artist}</p>
              </div>
            </div>
            <div className="premiere-track-actions">
              <span className="premiere-track-duration">
                {Math.floor(music.song.duration / 60)}:{String(Math.floor(music.song.duration % 60)).padStart(2, '0')}
              </span>
              <button 
                className={`premiere-track-favorite ${isFavourite(music.song.id) ? 'active' : ''}`}
                onClick={(e) => handleFavouriteClick(music, e)}
              >
                <Heart size={18} fill={isFavourite(music.song.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiereSection; 