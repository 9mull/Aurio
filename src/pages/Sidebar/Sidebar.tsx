import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, ListMusic, Plus, Settings, X } from 'lucide-react';
import { usePlaylists, Playlist } from '../../context/PlaylistsContext';
import CreatePlaylistModal from '../Playlist/CreatePlaylistModal';
import ManagePlaylistsModal from '../Playlist/ManagePlaylistsModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const { playlists } = usePlaylists();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        onClose();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onClose]);

  return (
    <>
      {isOpen && isMobile && (
        <div
          className="sidebar-mobile-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            zIndex: 999,
            transition: 'opacity 0.2s',
          }}
        />
      )}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <button className="sidebar-close" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="logo">
          <img src="/logo.png" alt="Logo" className="logo-icon" width={96} height={96} />
          <span className="logo-gradient-text">Aurio</span>
        </div>

        <nav className="sidebar-main-nav">
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => { if (isMobile) onClose(); }}>
            <Home className="sidebar-link-icon" size={24} />
            Home
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => { if (isMobile) onClose(); }}>
            <Search className="sidebar-link-icon" size={24} />
            Search
          </NavLink>
          <NavLink to="/favourites" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => { if (isMobile) onClose(); }}>
            <Heart className="sidebar-link-icon" size={24} />
            Favourites
          </NavLink>
        </nav>

        <div className="sidebar-playlists-section">
          <div className="sidebar-playlists-header">
            <h2 className="sidebar-playlists-title">PLAYLISTS</h2>
            <div className="sidebar-playlists-actions">
              <button 
                className="sidebar-playlists-add"
                onClick={() => setShowCreateModal(true)}
                title="Create new playlist"
              >
                <Plus size={20} />
              </button>
              <button 
                className="sidebar-playlists-manage"
                onClick={() => setShowManageModal(true)}
                title="Manage playlists"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
          {playlists.length === 0 ? (
            <p className="sidebar-playlists-empty">No playlists yet</p>
          ) : (
            <div className="sidebar-playlists">
              {playlists.map((playlist: Playlist) => (
                <NavLink
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  className={({ isActive }) => `sidebar-playlist-link ${isActive ? 'active' : ''}`}
                  onClick={() => { if (isMobile) onClose(); }}
                >
                  <ListMusic size={20} />
                  <span className="sidebar-playlist-name">{playlist.name}</span>
                  <span className="sidebar-playlist-count">{playlist.songs?.length || 0}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
        {showCreateModal && <CreatePlaylistModal onClose={() => setShowCreateModal(false)} />}
        {showManageModal && <ManagePlaylistsModal onClose={() => setShowManageModal(false)} />}
      </div>
    </>
  );
};

export default Sidebar;