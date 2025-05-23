import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { artists } from '../../data/musicData';
import Spinner from '../../components/Spinner';

const OutstandingArtists: React.FC = () => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const handleExplore = (artistId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.scrollTo(0, 0);
    navigate(`/artist/${artistId}`);
  };

  const topArtists = artists.slice(0, 5);

  return (
    <div className="section">
      <span className="section-subtitle">artists</span>
      <h2 className="section-title">Outstanding Artists</h2>
      <div className="artists-grid">
        {topArtists.map((artist) => (
          <div 
            key={artist.id} 
            className="artist-card"
            style={{ 
              '--artist-bg': artist.bgColor || '#6366f1',
              '--artist-bg-light': `${artist.bgColor || '#6366f1'}33`
            } as React.CSSProperties}
          >
            <div className="artist-image-container">
              <div className="image-container">
                {!loadedImages[artist.id] && <Spinner />}
                <img 
                  src={artist.photo} 
                  alt={artist.name} 
                  className="artist-image"
                  style={{ opacity: loadedImages[artist.id] ? 1 : 0 }}
                  onLoad={() => handleImageLoad(artist.id)}
                />
              </div>
            </div>
            <div className="artist-info">
              <h3 className="artist-name">{artist.name}</h3>
              <p className="artist-songs-count">{artist.songs.length} songs</p>
            </div>
            <button 
              className="artist-explore"
              onClick={(e) => handleExplore(artist.id, e)}
            >
              Explore <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutstandingArtists; 