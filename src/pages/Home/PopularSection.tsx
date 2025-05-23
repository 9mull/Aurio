import React from 'react';
import MusicCarousel from './MusicCarousel';

const PopularSection: React.FC = () => {
  return (
    <div className="section">
      <span className="section-subtitle">Music</span>
      <h2 className="section-title">Popular</h2>
      <MusicCarousel />
    </div>
  );
};

export default PopularSection; 