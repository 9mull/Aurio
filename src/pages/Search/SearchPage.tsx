import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { musics, artists } from '../../data/musicData';
import AllSongs from './AllSongs';
import AllArtists from './AllArtists';

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [songResults, setSongResults] = useState(musics);
  const [artistResults, setArtistResults] = useState(artists);
  const { globalSearchQuery, setGlobalSearchQuery } = useSearch();

  useEffect(() => {
    if (globalSearchQuery) {
      setSearchQuery(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    
    const filteredSongs = musics.filter(music => 
      music.song.title.toLowerCase().includes(query) ||
      music.song.artist.toLowerCase().includes(query)
    );

    const filteredArtists = artists.filter(artist =>
      artist.name.toLowerCase().includes(query)
    );

    setSongResults(filteredSongs);
    setArtistResults(filteredArtists);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setGlobalSearchQuery(value);
  };

  const hasResults = songResults.length > 0 || artistResults.length > 0;

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-input-container">
          <SearchIcon className="search-input-icon" size={24} />
          <input
            type="text"
            placeholder="Search for songs or artists..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input-large"
            autoFocus
          />
        </div>
      </div>

      <div className="search-content">
        {searchQuery ? (
          <>
            <h2 className="section-title">Search Results</h2>
            
            {!hasResults && (
              <div className="no-results-message">
                No results found for "{searchQuery}"
              </div>
            )}

            {songResults.length > 0 && (
              <div className="search-section">
                <h3 className="search-section-title">Songs</h3>
                <AllSongs 
                  searchQuery={searchQuery}
                  searchResults={songResults}
                />
              </div>
            )}

            {artistResults.length > 0 && (
              <div className="search-section">
                <h3 className="search-section-title">Artists</h3>
                <AllArtists 
                  searchQuery={searchQuery}
                  searchResults={artistResults}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <AllSongs 
              searchQuery=""
              searchResults={songResults}
            />
            <AllArtists 
              searchQuery=""
              searchResults={artistResults}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage; 