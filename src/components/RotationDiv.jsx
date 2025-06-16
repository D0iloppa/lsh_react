import React, { useState, useEffect, Children } from 'react';
import './RotationDiv.css';

const RotationDiv = ({ 
  children, 
  items = [], 
  interval = 3000, 
  showIndicators = true, 
  autoRotate = true,
  className = '',
  transitionDuration = 500,
  pauseOnHover = true
}) => {
  // children이 있으면 children을 사용하고, 없으면 items를 사용
  const rotationItems = children ? Children.toArray(children) : items;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!autoRotate || rotationItems.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % rotationItems.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoRotate, rotationItems.length, interval, isPaused]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? rotationItems.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % rotationItems.length);
  };

  const handleMouseEnter = () => {
    if (pauseOnHover) setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) setIsPaused(false);
  };

  if (!rotationItems || rotationItems.length === 0) {
    return (
      <div className={`rotation-div empty ${className}`}>
        <div className="rotation-placeholder">
          No items to display
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`rotation-div ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 메인 컨텐츠 영역 */}
      <div className="rotation-content">
        <div 
          className="rotation-items-container"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: `transform ${transitionDuration}ms ease-in-out`
          }}
        >
          {rotationItems.map((item, index) => (
            <div key={index} className="rotation-item">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      {rotationItems.length > 1 && (
        <>
          <button 
            className="rotation-nav rotation-nav-prev"
            onClick={goToPrevious}
            aria-label="Previous item"
          >
            ‹
          </button>
          <button 
            className="rotation-nav rotation-nav-next"
            onClick={goToNext}
            aria-label="Next item"
          >
            ›
          </button>
        </>
      )}

      {/* 인디케이터 */}
      {showIndicators && rotationItems.length > 1 && (
        <div className="rotation-indicators">
          {rotationItems.map((_, index) => (
            <button
              key={index}
              className={`rotation-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RotationDiv;