"use client"

import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

const slides = [
  { id: 1, image: "https://wallpapers.com/images/hd/pubg-banner-4139-x-2160-background-n61oourk4241zghp.jpg" },
  { id: 2, image: "https://sm.ign.com/ign_in/screenshot/default/garena-free-fire_734y.jpg" },
  { id: 3, image: "https://c4.wallpaperflare.com/wallpaper/903/725/119/clash-of-clans-4k-full-hd-wallpaper-preview.jpg" },
  { id: 4, image: "https://i.ytimg.com/vi/ppMcRIcf4-k/maxresdefault.jpg" },
];

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const autoPlayRef = useRef(null);
  const containerRef = useRef(null);

  const startAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000); // slower for better view
  };

  useEffect(() => {
    startAutoPlay();
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, []);

  const handleDragStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    setTranslateX(clientX - startX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 100;
    if (translateX < -threshold) setCurrentIndex((prev) => (prev + 1) % slides.length);
    else if (translateX > threshold) setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setTranslateX(0);
    startAutoPlay();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] overflow-hidden cursor-grab active:cursor-grabbing select-none "
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseMove={(e) => handleDragMove(e.clientX)}
      onMouseUp={handleDragEnd}
      onMouseLeave={() => isDragging && handleDragEnd()}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
      onTouchEnd={handleDragEnd}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full h-full flex-shrink-0">
            <img
              src={slide.image}
              alt={`Slide ${slide.id}`}
              className="w-full h-full  object-cover object-center"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              index === currentIndex
                ? "w-12 bg-cyan-500"
                : "w-8 bg-gray-500/50 hover:bg-gray-400/70"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;
