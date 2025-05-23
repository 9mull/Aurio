import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Heart } from 'lucide-react';
import { artists } from '../../data/musicData';
import { useMusic } from '../../context/MusicContext';
import { useFavourites } from '../../context/FavouritesContext';
import { imageCache } from '../../services/imageCache';
import Spinner from '../../components/Spinner';
import { Song } from '../../types/music';

const ArtistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [dominantColor, setDominantColor] = useState<string>('rgba(99, 102, 241, 0.3)');
  const { playSong, currentSong, isPlaying, togglePlay } = useMusic();
  const { isFavourite, addToFavourites, removeFromFavourites } = useFavourites();
  
  const artist = useMemo(() => artists.find(a => a.id === id), [id]);
  const artistSongs = useMemo(() => artist?.songs || [], [artist]);
  
  useEffect(() => {
    if (artist) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = artist.photo;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          const colorCounts: { [key: string]: number } = {};
          
          for (let i = 0; i < imageData.length; i += 4) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            
            const roundedR = Math.round(r / 10) * 10;
            const roundedG = Math.round(g / 10) * 10;
            const roundedB = Math.round(b / 10) * 10;
            
            const key = `${roundedR},${roundedG},${roundedB}`;
            colorCounts[key] = (colorCounts[key] || 0) + 1;
          }

          let maxCount = 0;
          let dominantColor = '0,0,0';
          
          Object.entries(colorCounts).forEach(([color, count]) => {
            if (count > maxCount) {
              maxCount = count;
              dominantColor = color;
            }
          });

          const [r, g, b] = dominantColor.split(',').map(Number);
          document.documentElement.style.setProperty('--artist-color', `rgb(${r}, ${g}, ${b})`);

          setDominantColor(`linear-gradient(180deg, 
            rgba(${r}, ${g}, ${b}, 0.8) 0%,
            rgba(${r}, ${g}, ${b}, 0.6) 15%,
            rgba(${r}, ${g}, ${b}, 0.4) 30%,
            rgba(${r}, ${g}, ${b}, 0.2) 45%,
            rgba(${r}, ${g}, ${b}, 0.1) 60%,
            rgba(${r}, ${g}, ${b}, 0.05) 75%,
            rgba(${r}, ${g}, ${b}, 0) 90%,
            rgba(${r}, ${g}, ${b}, 0) 100%
          )`);
          
        } catch (error) {
          console.error('Error getting dominant color:', error);
        }
      };
    }
  }, [artist]);
  
  const handleImageLoad = useCallback((id: string, src: string) => {
    if (imageCache.isImageCached(src)) {
      setLoadedImages(prev => ({ ...prev, [id]: true }));
    }
  }, []);

  const handlePlayClick = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, { type: 'artist', id: artist?.id });
    }
  };

  const handleFavouriteClick = useCallback((song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavourite(song.id)) {
      removeFromFavourites(song.id);
    } else {
      addToFavourites(song);
    }
  }, [isFavourite, removeFromFavourites, addToFavourites]);

  const handlePlayAll = useCallback(() => {
    if (artistSongs.length > 0) {
      playSong(artistSongs[0]);
    }
  }, [artistSongs, playSong]);

  const artistHeaderStyle = useMemo(() => ({
    background: dominantColor
  }), [dominantColor]);

  const songsList = useMemo(() => {
    if (!artist) return null;

    return artistSongs.map((song, index) => (
      <div
        key={song.id}
        className={`song-item ${currentSong?.id === song.id ? 'active' : ''}`}
        onClick={() => handlePlayClick(song)}
      >
        <span className="song-number">{(index + 1).toString().padStart(2, '0')}</span>
        <div className="song-art">
          {!loadedImages[song.id] && <Spinner />}
          <img
            src={song.musicArt}
            alt={song.title}
            onLoad={() => handleImageLoad(song.id, song.musicArt)}
            style={{ opacity: loadedImages[song.id] ? 1 : 0 }}
            loading="eager"
          />
          <div className="song-overlay">
            {currentSong?.id === song.id && isPlaying ? (
              <div className="play-icon playing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              <Play size={24} className="play-icon" />
            )}
          </div>
        </div>
        <div className="song-info">
          <span className="song-title">{song.title}</span>
        </div>
        <span className="song-duration">
          {Math.floor(song.duration / 60)}:{String(Math.floor(song.duration % 60)).padStart(2, '0')}
        </span>
        <button
          onClick={(e) => handleFavouriteClick(song, e)}
          className={`favorite-button ${isFavourite(song.id) ? 'active' : ''}`}
        >
          <Heart size={20} fill={isFavourite(song.id) ? 'currentColor' : 'none'} />
        </button>
      </div>
    ));
  }, [artist, artistSongs, currentSong, isPlaying, loadedImages, handleImageLoad, handlePlayClick, handleFavouriteClick, isFavourite]);

  useEffect(() => {
    if (artist) {
      const imagesToPreload = [
        artist.photo,
        ...artistSongs.map(song => song.musicArt)
      ];
      
      imageCache.preloadImages(imagesToPreload)
        .then(() => {
          const newLoadedImages: Record<string, boolean> = {};
          newLoadedImages[artist.id] = true;
          artistSongs.forEach(song => {
            newLoadedImages[song.id] = true;
          });
          setLoadedImages(newLoadedImages);
        })
        .catch(console.error);
    }
  }, [artist, artistSongs]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!artist) {
    return (
      <div className="artist-page">
        <div className="not-found-message">
          Artist not found
        </div>
      </div>
    );
  }

  return (
    <div className="artist-page">
      <div className="artist-header" style={artistHeaderStyle}>
        <div className="artist-header-content">
          <div className="artist-photo-container">
            {!loadedImages[artist.id] && <Spinner />}
            <img
              src={artist.photo}
              alt={artist.name}
              className="artist-photo"
              onLoad={() => handleImageLoad(artist.id, artist.photo)}
              style={{ opacity: loadedImages[artist.id] ? 1 : 0 }}
              loading="eager"
            />
          </div>
          <div className="artist-info">
            <span className="artist-type">Artist</span>
            <h1 className="artist-name">{artist.name}</h1>
            <span className="artist-stats">{artistSongs.length} songs</span>
            <div className="play-button-container">
              <button className="play-all-button" onClick={handlePlayAll}>
                <Play size={20} /> Play All
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="artist-content">
        <div className="songs-list">
          {songsList}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ArtistPage); 