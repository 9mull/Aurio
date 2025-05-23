import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Plus  } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { useFavourites } from '../../context/FavouritesContext';
import { usePlaylists } from '../../context/PlaylistsContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const Player: React.FC = () => {
  const navigate = useNavigate();
  
  const { 
    currentSong, 
    isPlaying, 
    currentTime, 
    duration, 
    volume,
    togglePlay, 
    setCurrentTime, 
    setVolume,
    nextSong,
    prevSong,
    currentArtistId
  } = useMusic();
  
  const { isFavourite, addToFavourites, removeFromFavourites } = useFavourites();
  const { playlists, addToPlaylist, removeFromPlaylist } = usePlaylists();
  const [lastVolume, setLastVolume] = useState(70);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const playlistBtnRef = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();

  const isInPlaylist = (playlistId: string) => {
    const playlist = playlists.find(pl => pl.id === playlistId);
    return playlist?.songs.some(song => song.id === currentSong?.id) ?? false;
  };

  const handlePlaylistToggle = (playlistId: string) => {
    if (!currentSong) return;

    const isCurrentlyInPlaylist = isInPlaylist(playlistId);
    if (isCurrentlyInPlaylist) {
      removeFromPlaylist(playlistId, currentSong.id);
    } else {
      addToPlaylist(playlistId, currentSong);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && currentSong) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setCurrentTime(pos * duration);
    }
  };

  const handleVolumeBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeRef.current) {
      const rect = volumeRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      setVolume(Math.max(0, Math.min(100, pos * 100)));
    }
  };

  const handleProgressDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!progressRef.current || !currentSong) return;
    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setCurrentTime(pos * duration);
  };

  const handleProgressMouseDown = (e: React.MouseEvent) => {
    setIsDraggingProgress(true);
    handleProgressDrag(e);
  };
  const handleProgressTouchStart = (e: React.TouchEvent) => {
    setIsDraggingProgress(true);
    handleProgressDrag(e);
  };

  const handleVolumeDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!volumeRef.current) return;
    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    const rect = volumeRef.current.getBoundingClientRect();
    const pos = (clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(100, pos * 100)));
  };

  const handleVolumeMouseDown = (e: React.MouseEvent) => {
    setIsDraggingVolume(true);
    handleVolumeDrag(e);
  };
  const handleVolumeTouchStart = (e: React.TouchEvent) => {
    setIsDraggingVolume(true);
    handleVolumeDrag(e);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingProgress) {
        e.preventDefault();
        handleProgressDrag(e as unknown as React.MouseEvent);
      }
      if (isDraggingVolume) {
        e.preventDefault();
        handleVolumeDrag(e as unknown as React.MouseEvent);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingProgress(false);
      setIsDraggingVolume(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingProgress) {
        handleProgressDrag(e as unknown as React.TouchEvent);
      }
      if (isDraggingVolume) {
        handleVolumeDrag(e as unknown as React.TouchEvent);
      }
    };

    const handleTouchEnd = () => {
      setIsDraggingProgress(false);
      setIsDraggingVolume(false);
    };

    if (isDraggingProgress || isDraggingVolume) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDraggingProgress, isDraggingVolume]);

  const handleVolumeMuteToggle = () => {
    if (volume > 0) {
      setLastVolume(volume);
      setVolume(0);
    } else {
      setVolume(lastVolume);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const playlistMenu = document.querySelector('.playlist-menu');
      if (
        playlistBtnRef.current && 
        !playlistBtnRef.current.contains(target) && 
        playlistMenu && 
        !playlistMenu.contains(target)
      ) {
        setShowPlaylistMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (isMobile) {
    return (
      <>
        {currentSong && (
          <div className="mobile-progress-container">
            <div
              ref={progressRef}
              className="progress-bar"
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
              onTouchStart={handleProgressTouchStart}
              style={{
                width: '100%',
                height: '0.35rem',
                background: 'rgba(255,255,255,0.25)',
                position: 'relative',
                cursor: 'pointer',
                borderRadius: 0,
              }}
            >
              <div
                style={{
                  width: currentSong ? `${(currentTime / duration) * 100}%` : '0%',
                  height: '100%',
                  background: 'rgba(255,255,255)',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  borderRadius: 0,
                }}
              />
              <div
                className="progress-thumb"
                style={{
                  left: currentSong ? `${(currentTime / duration) * 100}%` : '0%',
                  position: 'absolute',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '16px',
                  height: '16px',
                  background: 'var(--accent-color, #504ab6)',
                  border: '2px solid #fff',
                  zIndex: 2,
                }}
              />
            </div>
          </div>
        )}
        <div className={`player ${!currentSong ? 'player-empty' : ''}`}>  
          <div className="player-mobile-top-row">
            {currentSong && (
              <div className="song-thumbnail">
                <img src={currentSong.musicArt} alt={currentSong.title} />
              </div>
            )}
            <div className="song-details">
              <h4 className="song-title">{currentSong ? currentSong.title : 'Select a track to play'}</h4>
              <p className="song-artist" style={{ cursor: currentArtistId ? 'pointer' : 'default' }} onClick={() => currentArtistId && navigate(`/artist/${currentArtistId}`)}>
                {currentSong ? currentSong.artist : ''}
              </p>
            </div>
            <div className="player-mobile-actions">
              {currentSong && (
                <>
                  <button 
                    className="add-playlist-button"
                    ref={playlistBtnRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPlaylistMenu(!showPlaylistMenu);
                    }}
                    style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer' }}
                  >
                    <Plus size={24} color="var(--primary-text)" />
                  </button>
                  {showPlaylistMenu && (
                    <div className="playlist-menu" onClick={(e) => e.stopPropagation()}>
                      {playlists.length === 0 ? (
                        <div className="playlist-menu-empty">No playlists yet</div>
                      ) : (
                        playlists.map(pl => (
                          <label key={pl.id} className="playlist-menu-checkbox">
                            <input type="checkbox" checked={isInPlaylist(pl.id)} onChange={(e) => {e.stopPropagation();handlePlaylistToggle(pl.id);}} />
                            <span>{pl.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      currentSong && (isFavourite(currentSong.id) ? removeFromFavourites(currentSong.id) : addToFavourites(currentSong));
                    }}
                    className={`favorite-button ${currentSong && isFavourite(currentSong.id) ? 'active' : ''}`}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    <Heart size={22} fill={currentSong && isFavourite(currentSong.id) ? 'currentColor' : 'none'} />
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="player-mobile-controls-row">
            <button className="control-button"><svg width="24" height="24"><use href="#shuffle" /></svg></button>
            <button className="control-button" onClick={prevSong} disabled={!currentSong}><SkipBack size={24} /></button>
            <motion.button className="play-button" onClick={togglePlay} disabled={!currentSong}>{isPlaying ? <Pause size={24} /> : <Play size={24} />}</motion.button>
            <button className="control-button" onClick={nextSong} disabled={!currentSong}><SkipForward size={24} /></button>
            <button className="control-button"><svg width="24" height="24"><use href="#repeat" /></svg></button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`player ${!currentSong ? 'player-empty' : ''}`}>  
        <div className="player-song-info">
          {currentSong ? (
            <>
              <div className="song-thumbnail">
                <img 
                  src={currentSong.musicArt} 
                  alt={currentSong.title} 
                />
              </div>
              <div className="song-details">
                <h4 className="song-title">{currentSong.title}</h4>
                <p 
                  className="song-artist" 
                  onClick={() => currentArtistId && navigate(`/artist/${currentArtistId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {currentSong.artist}
                </p>
              </div>
            </>
          ) : (
            <div className="song-details">
              <h4 className="song-title">Select a track to play</h4>
            </div>
          )}
        </div>
        
        <div className="player-controls">
          <button className="control-button" onClick={prevSong} disabled={!currentSong}>
            <SkipBack size={20} />
          </button>
          
          <motion.button 
            className="play-button"
            onClick={togglePlay}
            disabled={!currentSong}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </motion.button>
          
          <button className="control-button" onClick={nextSong} disabled={!currentSong}>
            <SkipForward size={20} />
          </button>
        </div>

        <div className="desktop-progress-container">
          <div className="progress-container">
            <span className="time-display">{currentSong ? formatTime(currentTime) : '--:--'}</span>
            <div 
              ref={progressRef}
              className="progress-bar-container"
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
              onTouchStart={handleProgressTouchStart}
            >
              <div 
                className="progress-bar"
                style={{ width: currentSong ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
              {currentSong && (
                <div 
                  className="progress-thumb"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                />
              )}
            </div>
            <span className="time-display">{currentSong ? formatTime(duration) : '--:--'}</span>
          </div>
        </div>
        
        <div className="player-actions">
          {currentSong && (
            <div className="playlist-container">
              <button 
                className="add-playlist-button"
                ref={playlistBtnRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylistMenu(!showPlaylistMenu);
                }}
                style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer' }}
              >
                <Plus size={20} color="var(--primary-text)" />
              </button>
              {showPlaylistMenu && (
                <div className="playlist-menu" onClick={(e) => e.stopPropagation()}>
                  {playlists.length === 0 ? (
                    <div className="playlist-menu-empty">
                      No playlists yet
                    </div>
                  ) : (
                    playlists.map(pl => (
                      <label key={pl.id} className="playlist-menu-checkbox">
                        <input
                          type="checkbox"
                          checked={isInPlaylist(pl.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handlePlaylistToggle(pl.id);
                          }}
                        />
                        <span>{pl.name}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          {currentSong && (
            <button 
              onClick={() => {
                currentSong && (isFavourite(currentSong.id) ? removeFromFavourites(currentSong.id) : addToFavourites(currentSong));
              }}
              className={`favorite-button ${currentSong && isFavourite(currentSong.id) ? 'active' : ''}`}
            >
              <Heart size={20} fill={currentSong && isFavourite(currentSong.id) ? 'currentColor' : 'none'} />
            </button>
          )}
          <div className="volume-control">
            <button 
              className="volume-icon-button"
              onClick={handleVolumeMuteToggle}
            >
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div 
              ref={volumeRef}
              className="volume-bar-container"
              onClick={handleVolumeBarClick}
              onMouseDown={handleVolumeMouseDown}
              onTouchStart={handleVolumeTouchStart}
            >
              <div 
                className="volume-bar"
                style={{ width: `${volume}%` }}
              />
              <div 
                className="volume-thumb"
                style={{ left: `${volume}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Player;