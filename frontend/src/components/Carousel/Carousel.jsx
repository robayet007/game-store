"use client"

import { useEffect, useRef, useState } from "react";
import { Link } from 'react-router-dom';
import "./Carousel.css";

const slides = [
  { 
    id: 1, 
    image: "https://wallpapers.com/images/hd/pubg-banner-4139-x-2160-background-n61oourk4241zghp.jpg",
    title: "PUBG Mobile",
    description: "Battle in epic 100-player matches"
  },
  { 
    id: 2, 
    image: "https://sm.ign.com/ign_in/screenshot/default/garena-free-fire_734y.jpg",
    title: "Free Fire",
    description: "Survive the ultimate battle royale"
  },
  { 
    id: 3, 
    image: "https://c4.wallpaperflare.com/wallpaper/903/725/119/clash-of-clans-4k-full-hd-wallpaper-preview.jpg",
    title: "Clash of Clans",
    description: "Build your village and conquer enemies"
  },
  { 
    id: 4, 
    image: "https://i.ytimg.com/vi/ppMcRIcf4-k/maxresdefault.jpg",
    title: "Mobile Legends",
    description: "5v5 MOBA action on your phone"
  },
];

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const autoPlayRef = useRef(null);
  const containerRef = useRef(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const startAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
  };

  useEffect(() => {
    startAutoPlay();
    return () => { 
      if (autoPlayRef.current) clearInterval(autoPlayRef.current); 
    };
  }, []);

  const handleDragStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    setTranslateX(Math.max(Math.min(diff, 100), -100));
  };

  const handleDragEnd = () => {
  if (!isDragging) return;
  setIsDragging(false);
  
  const threshold = isMobile ? 30 : 50;
  if (translateX < -threshold) {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  } else if (translateX > threshold) {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }
  // Reset translateX immediately
  setTranslateX(0);
  startAutoPlay();
};

  const goToSlide = (index) => {
    setCurrentIndex(index);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    startAutoPlay();
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    startAutoPlay();
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    startAutoPlay();
  };

  const handleUserInteraction = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    startAutoPlay();
  };

  return (
    <div className="carousel-wrapper">
      <div
        ref={containerRef}
        className="carousel-container"
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => isDragging && handleDragEnd()}
        onTouchStart={(e) => {
          handleDragStart(e.touches[0].clientX);
          handleUserInteraction();
        }}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
        onClick={handleUserInteraction}
      >
        {/* Slides Container */}
        <div
          className="slides-wrapper"
          style={{ 
            transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))` 
          }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="carousel-slide">
              <img
                src={slide.image}
                alt={`Slide ${slide.id}`}
                className="slide-image"
                draggable={false}
                loading="lazy"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=600&fit=crop";
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="slide-overlay">
                <div className="slide-content">
                  <h2 className="slide-title">
                    {slide.title}
                  </h2>
                  <p className="slide-description">
                    {slide.description}
                  </p>
                  <Link to="/shop" className="shop-now-btn">
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Hidden on mobile */}
        {!isMobile && (
          <>
            <button
              onClick={() => {
                goToPrev();
                handleUserInteraction();
              }}
              className="nav-arrow nav-arrow-prev"
              aria-label="Previous slide"
            >
              <svg className="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => {
                goToNext();
                handleUserInteraction();
              }}
              className="nav-arrow nav-arrow-next"
              aria-label="Next slide"
            >
              <svg className="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Progress Indicators */}
        <div className="progress-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                goToSlide(index);
                handleUserInteraction();
              }}
              className={`progress-dot ${index === currentIndex ? 'progress-dot-active' : 'progress-dot-inactive'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Mobile swipe hint */}
        {isMobile && (
          <div className="mobile-swipe-hint">
            <span className="swipe-text">Swipe</span>
            <svg className="swipe-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export default Carousel;