import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { artists } from '../../data/musicData';
import { imageCache } from '../../services/imageCache';
import Spinner from '../../components/Spinner';

interface AllArtistsProps {
  searchQuery: string;
  searchResults: typeof artists;
}

const ARTISTS_PER_PAGE = 4;

const AllArtists: React.FC<AllArtistsProps> = ({ searchQuery, searchResults }) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [visibleArtists, setVisibleArtists] = useState(ARTISTS_PER_PAGE);
  const [isButtonSliding, setIsButtonSliding] = useState(false);
  const [newCards, setNewCards] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setVisibleArtists(ARTISTS_PER_PAGE);
    setIsButtonSliding(false);
    setNewCards([]);
  }, [searchResults]);

  const handleImageLoad = (id: string, src: string) => {
    if (imageCache.isImageCached(src)) {
      setLoadedImages(prev => ({ ...prev, [id]: true }));
    }
  };

  const handleShowMore = async () => {
    setIsButtonSliding(true);
    const currentVisible = visibleArtists;
    const newVisible = Math.min(currentVisible + ARTISTS_PER_PAGE, searchResults.length);
    
    const newSlice = searchResults.slice(currentVisible, newVisible);
    const imagesToPreload = newSlice.map(artist => artist.photo);
    
    try {
      await imageCache.preloadImages(imagesToPreload);
      
      const newCardIds = newSlice.map(artist => artist.id);
      setVisibleArtists(newVisible);
      setNewCards(newCardIds);
      
      const newLoadedImages = { ...loadedImages };
      newSlice.forEach(artist => {
        newLoadedImages[artist.id] = true;
      });
      setLoadedImages(newLoadedImages);
    } catch (error) {
      console.error('Error preloading images:', error);
    }
    
    setIsButtonSliding(false);
  };

  useEffect(() => {
    const initialImages = searchResults
      .slice(0, visibleArtists)
      .map(artist => artist.photo);
    
    imageCache.preloadImages(initialImages)
      .then(() => {
        const newLoadedImages: Record<string, boolean> = {};
        searchResults.slice(0, visibleArtists).forEach(artist => {
          newLoadedImages[artist.id] = true;
        });
        setLoadedImages(newLoadedImages);
      })
      .catch(console.error);
  }, [searchResults, visibleArtists]);

  const handleArtistClick = (artistId: string) => {
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      contentArea.scrollTop = 0;
    }
    navigate(`/artist/${artistId}`);
  };

  const hasMoreArtists = visibleArtists < searchResults.length;

  return (
    <div className="search-results">
      <h2 className="section-title">
        {searchQuery ? '' : 'All Artists'}
      </h2>
      <div className="search-results-grid artists-grid">
        {searchResults.slice(0, visibleArtists).map((artist) => (
          <div
            key={artist.id}
            className={`search-result-card artist-result-card ${newCards.includes(artist.id) ? 'new-card' : ''}`}
            onClick={() => handleArtistClick(artist.id)}
          >
            <div className="search-result-art">
              <div className="image-container">
                {!loadedImages[artist.id] && <Spinner />}
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
            <div className="search-result-info">
              <h3 className="search-result-title">{artist.name}</h3>
              <p className="search-result-artist">{artist.songs.length} songs</p>
            </div>
          </div>
        ))}
      </div>
      {hasMoreArtists && (
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

export default AllArtists; 