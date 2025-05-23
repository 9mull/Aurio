import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useMusic } from "../../context/MusicContext";
import { motion, AnimatePresence } from 'framer-motion';
import { musics } from '../../data/musicData';
import Spinner from '../../components/Spinner';
import { useIsMobile } from '../../hooks/useIsMobile';

const MusicCarousel: React.FC = () => {
  const { playSong, isPlaying, togglePlay, currentSong } = useMusic();
  const [currentIndex, setCurrentIndex] = useState(2);
  const [centerHovered, setCenterHovered] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const carouselRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const getCircularIndex = (index: number) => {
    const normalizedIndex = ((index % musics.length) + musics.length) % musics.length;
    return normalizedIndex;
  };

  const visibleMusics = (isMobile
    ? [-1, 0, 1]
    : [-2, -1, 0, 1, 2]
  ).map(offset => {
    const index = getCircularIndex(currentIndex + offset);
    return {
      ...musics[index].song,
      position: offset
    };
  });

  const goToNext = () => {
    setCurrentIndex(prev => getCircularIndex(prev + 1));
  };

  const goToPrev = () => {
    setCurrentIndex(prev => getCircularIndex(prev - 1));
  };

  const getItemClass = (position: number) => {
    if (position === 0) return 'music-item center';
    if (Math.abs(position) === 1) return 'music-item adjacent';
    return 'music-item outer';
  };

  const getTransform = (position: number) => {
    const xOffset = position * 210; 
    const scale = position === 0 ? 1 : Math.abs(position) === 1 ? 0.9 : 0.8;
    const zOffset = position === 0 ? 0 : -100 * Math.abs(position);
    
    return {
      x: xOffset,
      scale,
      z: zOffset
    };
  };

  useEffect(() => {
    if (carouselRef.current) {
      const scrollAmount = currentIndex * 160 - (carouselRef.current.offsetWidth / 2) + 80;
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        <button 
          onClick={goToPrev}
          className="carousel-nav-button prev"
        >
          <ChevronLeft size={24} />
        </button>

        <motion.div 
          className="carousel-glow"
          animate={{
            opacity: [0.5, 0.7, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />

        <div className="carousel-track" ref={carouselRef}>
          <AnimatePresence initial={false} mode="popLayout">
            {visibleMusics.map(({ id, title, artist, musicArt, position }) => {
              const transform = getTransform(position);
              const isCenter = position === 0;
              return (
                <motion.div
                  key={id}
                  className={getItemClass(position)}
                  onMouseEnter={() => isCenter && setCenterHovered(true)}
                  onMouseLeave={() => isCenter && setCenterHovered(false)}
                  initial={{ 
                    opacity: 0,
                    x: position < 0 ? -300 : 300,
                    scale: transform.scale,
                  }}
                  animate={{ 
                    opacity: 1,
                    x: transform.x,
                    scale: transform.scale,
                    z: transform.z
                  }}
                  exit={{ 
                    opacity: 0,
                    x: position < 0 ? 300 : -300,
                    scale: transform.scale,
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut"
                  }}
                  style={{
                    filter: position !== 0 ? 'brightness(0.7)' : 'brightness(1)',
                    cursor: isCenter ? 'pointer' : 'default'
                  }}
                >
                  <motion.div 
                    className="music-cover"
                    animate={{
                      rotate: isCenter ? [0, 5, 0] : 0
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                  >
                    {!loadedImages[id] && <Spinner />}
                    <img 
                      src={musicArt} 
                      alt={`${title} by ${artist}`}
                      style={{ opacity: loadedImages[id] ? 1 : 0 }}
                      onLoad={() => handleImageLoad(id)}
                    />
                    {isCenter && (
                      <div className={`carousel-center-overlay${centerHovered ? ' visible' : ''}`}>
                        <button
                          className="carousel-center-play"
                          onClick={e => {
                            e.stopPropagation();
                            const centerMusic = musics[getCircularIndex(currentIndex)].song;
                            if (!currentSong || currentSong.id !== centerMusic.id) {
                              playSong(centerMusic, { type: 'carousel' });
                            } else {
                              togglePlay();
                            }
                          }}
                          tabIndex={-1}
                        >
                          {(currentSong && currentSong.id === musics[getCircularIndex(currentIndex)].song.id && isPlaying)
                            ? <Pause size={32} />
                            : <Play size={32} />}
                        </button>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <button 
          onClick={goToNext}
          className="carousel-nav-button next"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="music-info"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <h3 className="music-title">
            {musics[getCircularIndex(currentIndex)].song.title}
          </h3>
          <p className="music-artist">
            {musics[getCircularIndex(currentIndex)].song.artist}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MusicCarousel;