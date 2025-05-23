import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Heart, Trash2 } from 'lucide-react';
import { usePlaylists } from '../../context/PlaylistsContext';
import { useMusic } from '../../context/MusicContext';
import { useFavourites } from '../../context/FavouritesContext';
import Spinner from '../../components/Spinner';

const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPlaylist, removeFromPlaylist } = usePlaylists();
  const { playSong, currentSong, isPlaying, togglePlay } = useMusic();
  const { isFavourite, addToFavourites, removeFromFavourites } = useFavourites();
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const playlist = getPlaylist(id!);

  if (!playlist) {
    return (
      <div className="playlist-page">
        <div className="not-found-message">
          Playlist not found
        </div>
      </div>
    );
  }

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const handlePlay = (song: typeof playlist.songs[0]) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, { type: 'playlist', id: playlist.id });
    }
  };

  const handleRemove = (songId: string) => {
    removeFromPlaylist(playlist.id, songId);
  };

  const handleFavourite = (e: React.MouseEvent, song: typeof playlist.songs[0]) => {
    e.stopPropagation();
    if (isFavourite(song.id)) {
      removeFromFavourites(song.id);
    } else {
      addToFavourites(song);
    }
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    const totalSeconds = playlist.songs.reduce((total, song) => total + song.duration, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  return (
    <div className="playlist-page">
      <div className="playlist-header">
        <div className="playlist-info">
          <h1 className="playlist-title">{playlist.name}</h1>
          <div className="playlist-stats">
            {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'} • {getTotalDuration()}
          </div>
        </div>
      </div>

      <div className="playlist-content">
        {playlist.songs.length === 0 ? (
          <div className="no-results-message">
            No songs in this playlist yet
          </div>
        ) : (
          <div className="playlist-songs">
            {playlist.songs.map((song, index) => (
              <div
                key={song.id}
                className={`playlist-track ${currentSong?.id === song.id ? 'active' : ''}`}
                onClick={() => handlePlay(song)}
              >
                <div className="playlist-track-info">
                  <div className="playlist-track-number">
                    {index + 1}
                  </div>
                  <div className="playlist-track-art">
                    {!loadedImages[song.id] && <Spinner />}
                    <img 
                      src={song.musicArt} 
                      alt={song.title}
                      style={{ opacity: loadedImages[song.id] ? 1 : 0 }}
                      onLoad={() => handleImageLoad(song.id)}
                    />
                    <div className="playlist-track-overlay">
                      {currentSong?.id === song.id && isPlaying ? (
                        <div className="play-icon playing">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      ) : (
                        <Play size={24} />
                      )}
                    </div>
                  </div>
                  <div className="playlist-track-details">
                    <h3 className="playlist-track-title">{song.title}</h3>
                    <p className="playlist-track-artist">{song.artist}</p>
                  </div>
                </div>
                <div className="playlist-track-actions">
                  <span className="playlist-track-duration">
                    {formatDuration(song.duration)}
                  </span>
                  <button
                    className={`favorite-button ${isFavourite(song.id) ? 'active' : ''}`}
                    onClick={(e) => handleFavourite(e, song)}
                  >
                    <Heart size={20} fill={isFavourite(song.id) ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    className="remove-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(song.id);
                    }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistPage; 