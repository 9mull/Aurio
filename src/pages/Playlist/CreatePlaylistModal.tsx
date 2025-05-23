import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePlaylists } from '../../context/PlaylistsContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import ReactDOM from 'react-dom';

interface CreatePlaylistModalProps {
  onClose: () => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ onClose }) => {
  const [playlistName, setPlaylistName] = useState('');
  const { createPlaylist } = usePlaylists();
  const isMobile = useIsMobile();

  useEffect(() => {
    const player = document.querySelector('.player');
    const carousel = document.querySelector('.carousel-container');
    const search = document.querySelector('.quick-search-container');
    
    player?.classList.add('modal-open');
    carousel?.classList.add('modal-open');
    search?.classList.add('modal-open');

    return () => {
      player?.classList.remove('modal-open');
      carousel?.classList.remove('modal-open');
      search?.classList.remove('modal-open');
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playlistName.trim()) {
      createPlaylist(playlistName.trim());
      onClose();
    }
  };

  const modalContent = isMobile ? (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={28} />
        </button>
        <h2 className="modal-title">Create Playlist</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input
            type="text"
            value={playlistName}
            onChange={e => setPlaylistName(e.target.value)}
            maxLength={20}
            placeholder="Enter playlist name"
            className="modal-input"
            autoFocus
          />
          <button type="submit" className="modal-submit" disabled={!playlistName.trim()}>
            <span>Create</span>
          </button>
        </form>
      </div>
    </div>
  ) : (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="modal-title">Create Playlist</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={playlistName}
            onChange={e => setPlaylistName(e.target.value)}
            maxLength={20}
            placeholder="Enter playlist name"
            className="modal-input"
            autoFocus
          />
          <div className="modal-actions">
            <button type="submit" className="modal-submit" disabled={!playlistName.trim()}>
              <span>Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;
  return ReactDOM.createPortal(modalContent, modalRoot);
};

export default CreatePlaylistModal; 