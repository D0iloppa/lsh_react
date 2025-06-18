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
  pauseOnHover = true,
  swipeThreshold = 50
}) => {
  // children이 있으면 children을 사용하고, 없으면 items를 사용
  const rotationItems = children ? Children.toArray(children) : items;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

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

  // 터치 이벤트 핸들러
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
    });
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.x || !touchStart.y) return;

    const touch = e.changedTouches[0];
    const deltaX = touchStart.x - touch.clientX;
    const deltaY = touchStart.y - touch.clientY;

    // 세로 스크롤이 더 크면 무시 (페이지 스크롤 우선)
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      setTouchStart({ x: 0, y: 0 });
      return;
    }

    // 스와이프 임계값 체크
    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0) {
        // 왼쪽으로 스와이프 → 다음 슬라이드
        goToNext();
      } else {
        // 오른쪽으로 스와이프 → 이전 슬라이드
        goToPrevious();
      }
    }

    setTouchStart({ x: 0, y: 0 });
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
      <div 
        className="rotation-content"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
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

      {/* 네비게이션 버튼 - 숨김 처리 */}
      {rotationItems.length > 1 && (
        <>
          <button 
            className="rotation-nav rotation-nav-prev"
            onClick={goToPrevious}
            aria-label="Previous item"
            style={{ display: 'none' }} // 버튼 숨김
          >
            ‹
          </button>
          <button 
            className="rotation-nav rotation-nav-next"
            onClick={goToNext}
            aria-label="Next item"
            style={{ display: 'none' }} // 버튼 숨김
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