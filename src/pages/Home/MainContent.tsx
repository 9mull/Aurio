import React, { useEffect } from 'react';
import QuickSearch from './QuickSearch';
import FeaturedSection from './FeaturedSection';
import MusicCarousel from './MusicCarousel';
import PremiereSection from './PremiereSection';
import OutstandingArtists from './OutstandingArtists';

const MainContent: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="main-content">
      <div className="search-container">
        <QuickSearch />
      </div>
      <div className="content-padding">
        <MusicCarousel />
        <FeaturedSection />
        <PremiereSection />
        <OutstandingArtists />
      </div>
    </div>
  );
};

export default MainContent;