import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MusicProvider } from './context/MusicContext';
import { SearchProvider } from './context/SearchContext';
import { FavouritesProvider } from './context/FavouritesContext';
import { PlaylistsProvider } from './context/PlaylistsContext';
import Layout from './components/Layout';
import './styles/index.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <FavouritesProvider>
        <PlaylistsProvider>
          <SearchProvider>
            <MusicProvider>
              <Layout />
            </MusicProvider>
          </SearchProvider>
        </PlaylistsProvider>
      </FavouritesProvider>
    </BrowserRouter>
  );
};

export default App;