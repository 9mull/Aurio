import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Trash2, Edit2, Check, X as CancelIcon } from 'lucide-react';
import { usePlaylists, Playlist } from '../../context/PlaylistsContext';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ManagePlaylistsModalProps {
  onClose: () => void;
}

const ManagePlaylistsModal: React.FC<ManagePlaylistsModalProps> = ({ onClose }) => {
  const { playlists, deletePlaylist, renamePlaylist } = usePlaylists();
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (editingPlaylistId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingPlaylistId]);

  const handleEdit = (playlist: Playlist) => {
    setEditingPlaylistId(playlist.id);
    setEditValue(playlist.name);
  };

  const handleSave = (playlistId: string) => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== playlists.find(p => p.id === playlistId)?.name) {
      renamePlaylist(playlistId, trimmed);
    }
    setEditingPlaylistId(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingPlaylistId(null);
    setEditValue('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, playlistId: string) => {
    if (e.key === 'Enter') {
      handleSave(playlistId);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const modalContent = isMobile ? (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content manage-playlists-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={28} />
        </button>
        <h2 className="modal-title">Manage Playlists</h2>
        <div className="manage-playlists-list">
          {playlists.length === 0 ? (
            <div className="manage-playlists-empty">No playlists yet</div>
          ) : (
            playlists.map(playlist => (
              <div key={playlist.id} className="manage-playlist-item">
                <div className="manage-playlist-info">
                  {editingPlaylistId === playlist.id ? (
                    <input
                      ref={inputRef}
                      className="manage-playlist-edit-input"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => handleSave(playlist.id)}
                      onKeyDown={e => handleInputKeyDown(e, playlist.id)}
                      maxLength={40}
                      style={{ fontSize: '1rem', padding: '2px 6px', borderRadius: 4, border: '1px solid #ccc', minWidth: 0, width: '70%' }}
                    />
                  ) : (
                    <span className="manage-playlist-name">{playlist.name}</span>
                  )}
                  <span className="manage-playlist-count">
                    {playlist.songs?.length || 0} {(playlist.songs?.length || 0) === 1 ? 'song' : 'songs'}
                  </span>
                </div>
                <div className="manage-playlist-actions">
                  {editingPlaylistId === playlist.id ? (
                    <>
                      <button className="manage-playlist-save" onMouseDown={e => e.preventDefault()} onClick={() => handleSave(playlist.id)} title="Save" style={{ marginRight: 4 }}>
                        <Check size={18} />
                      </button>
                      <button className="manage-playlist-cancel" onMouseDown={e => e.preventDefault()} onClick={handleCancel} title="Cancel">
                        <CancelIcon size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="manage-playlist-edit"
                        onClick={() => handleEdit(playlist)}
                        title="Rename playlist"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="manage-playlist-delete"
                        onClick={() => deletePlaylist(playlist.id)}
                        title="Delete playlist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content manage-playlists-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="modal-title">Manage Playlists</h2>
        <div className="manage-playlists-list">
          {playlists.length === 0 ? (
            <div className="manage-playlists-empty">No playlists yet</div>
          ) : (
            playlists.map(playlist => (
              <div key={playlist.id} className="manage-playlist-item">
                <div className="manage-playlist-info">
                  {editingPlaylistId === playlist.id ? (
                    <input
                      ref={inputRef}
                      className="manage-playlist-edit-input"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => handleSave(playlist.id)}
                      onKeyDown={e => handleInputKeyDown(e, playlist.id)}
                      maxLength={40}
                      style={{ fontSize: '1rem', padding: '2px 6px', borderRadius: 4, border: '1px solid #ccc', minWidth: 0, width: '70%' }}
                    />
                  ) : (
                    <span className="manage-playlist-name">{playlist.name}</span>
                  )}
                  <span className="manage-playlist-count">
                    {playlist.songs?.length || 0} {(playlist.songs?.length || 0) === 1 ? 'song' : 'songs'}
                  </span>
                </div>
                <div className="manage-playlist-actions">
                  {editingPlaylistId === playlist.id ? (
                    <>
                      <button className="manage-playlist-save" onMouseDown={e => e.preventDefault()} onClick={() => handleSave(playlist.id)} title="Save" style={{ marginRight: 4 }}>
                        <Check size={18} />
                      </button>
                      <button className="manage-playlist-cancel" onMouseDown={e => e.preventDefault()} onClick={handleCancel} title="Cancel">
                        <CancelIcon size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="manage-playlist-edit"
                        onClick={() => handleEdit(playlist)}
                        title="Rename playlist"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="manage-playlist-delete"
                        onClick={() => deletePlaylist(playlist.id)}
                        title="Delete playlist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    modalContent,
    modalRoot
  );
};

export default ManagePlaylistsModal; 