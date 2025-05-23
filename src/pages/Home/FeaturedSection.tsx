import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { useMusic } from "../../context/MusicContext";
import { featuredMusics } from "../../data/musicData";
import Spinner from '../../components/Spinner';

const FeaturedSection: React.FC = () => {
  const { playSong, currentSong, isPlaying, togglePlay } = useMusic();
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const handlePlayClick = (music: typeof featuredMusics[0]) => {
    if (currentSong?.id === music.song.id) {
      togglePlay();
    } else {
      playSong(music.song, { type: 'featured' });
    }
  };

  return (
    <div className="section">
      <span className="section-subtitle">this week</span>
      <h2 className="section-title">Featured</h2>
      <div className="featured-grid">
        {featuredMusics.map((music) => (
          <div key={music.id} className="featured-card" onClick={() => handlePlayClick(music)}>
            <div className="image-container">
              {!loadedImages[music.id] && <Spinner />}
            <img 
              src={music.song.musicArt} 
              alt={music.song.title} 
              className="featured-image" 
                style={{ opacity: loadedImages[music.id] ? 1 : 0 }}
                onLoad={() => handleImageLoad(music.id)}
            />
            </div>
            <div 
              className="featured-image-reflection"
              style={{ 
                backgroundImage: `url(${music.song.musicArt})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: loadedImages[music.id] ? 1 : 0
              }}
            />
            <div className="featured-overlay">
              <h3 className="featured-title">{music.song.title}</h3>
              <p className="featured-artist">{music.song.artist}</p>
            </div>
            <div className="featured-play-overlay">
              {currentSong?.id === music.song.id && isPlaying ? (
                <div className="play-icon playing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <div className="play-icon">
                  <Play size={32} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedSection;