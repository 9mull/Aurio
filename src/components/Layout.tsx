import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';
import MainContent from '../pages/Home/MainContent';
import SearchPage from '../pages/Search/SearchPage';
import FavouritesPage from '../pages/Favourites/FavouritesPage';
import ArtistPage from '../pages/Artist/ArtistPage';
import PlaylistPage from '../pages/Playlist/PlaylistPage';
import Sidebar from '../pages/Sidebar/Sidebar';
import Player from '../pages/Player/Player';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {!isSidebarOpen && (
        <div className="header-mobile">
          <button 
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content-wrapper">
        <Routes>
          <Route path="/artist/:id" element={<ArtistPage />} />
          <Route path="*" element={
            <div className="content-area">
              <Routes>
                <Route path="/" element={<MainContent />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/favourites" element={<FavouritesPage />} />
                <Route path="/playlist/:id" element={<PlaylistPage />} />
              </Routes>
            </div>
          } />
        </Routes>
        <Player />
      </div>
    </div>
  );
};

export default Layout; 