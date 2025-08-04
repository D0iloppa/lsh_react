import React, { useState, useEffect, Children, useRef } from 'react';
import './RotationDiv.css';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

const RotationDiv = ({
  children,
  items = [],
  interval = 3000,
  showIndicators = true,
  autoRotate = true,
  className = '',
  transitionDuration = 500,
  pauseOnHover = true,
  swipeThreshold = 50,
  infiniteLoop = true
}) => {
  const rotationItems = children ? Children.toArray(children) : items;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex === rotationItems.length - 1;
  const edgeClass = `${isAtStart ? 'edge-left' : ''} ${isAtEnd ? 'edge-right' : ''}`.trim();
const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();    
  useEffect(() => {
    if (!autoRotate || rotationItems.length <= 1 || isPaused) return;

     if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        //window.scrollTo(0, 0);
      }

    const timer = setInterval(() => {
      handleNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoRotate, rotationItems.length, interval, isPaused, currentIndex,messages, currentLang]);

  const handleBounce = () => {
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.2s ease';
      containerRef.current.style.transform += ' scale(0.98)';

      setTimeout(() => {
        containerRef.current.style.transform = `translateX(-${currentIndex * 100}%) scale(1)`;
      }, 200);
    }
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handlePrev = () => {
   if (currentIndex === 0) {
      if (infiniteLoop) {
        // 무한 루프: 마지막 슬라이드로 이동
        setCurrentIndex(rotationItems.length - 1);
      } else {
        handleBounce();
      }
      return;
    }
    setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
   if (currentIndex === rotationItems.length - 1) {
      if (infiniteLoop) {
        // 무한 루프: 첫 번째 슬라이드로 이동
        setCurrentIndex(0);
      } else {
        handleBounce();
      }
      return;
    }
    setCurrentIndex(currentIndex + 1);
  };

  const handleMouseEnter = () => {
    if (pauseOnHover) setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) setIsPaused(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.x || !touchStart.y) return;

    const touch = e.changedTouches[0];
    const deltaX = touchStart.x - touch.clientX;
    const deltaY = touchStart.y - touch.clientY;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      setTouchStart({ x: 0, y: 0 });
      return;
    }

    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0) handleNext();
      else handlePrev();
    }

    setTouchStart({ x: 0, y: 0 });
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    node.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => node.removeEventListener('touchmove', handleTouchMove);
  }, [touchStart]);

  if (!rotationItems || rotationItems.length === 0) {
    return (
      <div className={`rotation-div empty ${className}`}>
        <div className="rotation-placeholder">{get('title.text.17')}</div>
      </div>
    );
  }

  return (
    <div
      className={`rotation-div ${edgeClass} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="rotation-content"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        ref={contentRef}
      >
        <div
          className="rotation-items-container"
          ref={containerRef}
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

      {rotationItems.length > 1 && (
        <>
          <button
            className="rotation-nav rotation-nav-prev"
            onClick={handlePrev}
            aria-label="Previous item"
            style={{ display: 'none' }}
          >
            ‹
          </button>
          <button
            className="rotation-nav rotation-nav-next"
            onClick={handleNext}
            aria-label="Next item"
            style={{ display: 'none' }}
          >
            ›
          </button>
        </>
      )}

      {showIndicators && rotationItems.length > 1 && (
          <div className="rotation-indicators">
            {(() => {
              const totalItems = rotationItems.length;
              const indicatorCount = 5;
              const groupSize = Math.ceil(totalItems / indicatorCount);

              return [...Array(indicatorCount)].map((_, index) => {
                const targetIndex = index * groupSize;
                const isActive =
                  currentIndex >= targetIndex &&
                  currentIndex < targetIndex + groupSize;

                let className = 'rotation-indicator';
                if (isActive) className += ' active';

                return (
                  <button
                    key={index}
                    className={className}
                    onClick={() => goToSlide(targetIndex)}
                    aria-label={`Go to item ${targetIndex + 1}`}
                  />
                );
              });
            })()}
          </div>
        )}

    </div>
  );
};

export default RotationDiv;
