import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const ImagePlaceholder = ({
  src = '',
  fullList = [],
  initialIndex = 0,
  alt = 'Image',
  className = '',
  imageSize = 'w-full h-full',
  fallbackClassName = '',
  style = {},
  placeholder = '',
}) => {
  const imageList = Array.isArray(fullList) && fullList.length > 0 ? fullList : [src];

  const [imageError, setImageError] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const startX = useRef(0);
  const deltaX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const shouldShowPlaceholder = !src || imageError;

  const handleImageError = () => setImageError(true);
  const handleImageLoad = () => setImageError(false);

  const openViewer = (index) => {

     const isAndroid = !!window.native;
     const isIOS = !!window.webkit?.messageHandlers?.native?.postMessage;
      
     if (isIOS) {
       try {
        window.webkit.messageHandlers.native.postMessage(
          JSON.stringify({
            type: 'openImageViewer',
            images: imageList,
            startIndex: index
          })
        );
      } catch (e) {
        console.error('iOS 메시지 전송 실패:', e);
      }
        //setCurrentIndex(index);
        //setIsViewerOpen(true);
        //document.body.style.overflow = 'hidden';
     } else {
      setCurrentIndex(index);
      setIsViewerOpen(true);
      document.body.style.overflow = 'hidden';
     } 
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    document.body.style.overflow = '';
  };

  const showPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const showNext = () => {
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  const handleStart = (x) => {
    startX.current = x;
    deltaX.current = 0;
    isDragging.current = true;
  };

  const handleMove = (x) => {
    if (!isDragging.current) return;
    deltaX.current = x - startX.current;
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    if (deltaX.current > 50) {
      showPrev();
    } else if (deltaX.current < -50) {
      showNext();
    }
    isDragging.current = false;
  };

  const FullscreenViewer = () => (
    <div
      className="fullscreen-overlay"
      //onClick={closeViewer}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => {
        if (isDragging.current) e.preventDefault();
        handleMove(e.clientX);
      }}
      onMouseUp={handleEnd}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.95)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        touchAction: 'pan-y',
      }}
    >
      <button
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10000,
          backgroundColor: 'red',
          borderRadius: '9999px',
          width: 40,
          height: 40,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          closeViewer();
        }}
      >
        <X color="white" size={20} />
      </button>

      <img
        id="fullscreen-image"
        src={imageList[currentIndex] || ''}
        alt={`slide-${currentIndex}`}
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
          zIndex: 9998,
        }}
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />

      {imageList.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            display: 'flex',
            gap: 8,
            zIndex: 10000,
          }}
        >
          {imageList.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: idx === currentIndex ? 'white' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className={`relative ${className}`} style={style}>
        {!shouldShowPlaceholder ? (
          <img
            src={src}
            alt={`${alt}-${initialIndex}`}
            className={`${imageSize} object-cover cursor-pointer`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={() => openViewer(initialIndex)}
          />
        ) : (
          <div className={`placeholder-image ${fallbackClassName}`}>
            <svg className="cross-svg" viewBox="0 0 100 100">
              <line x1="10" y1="10" x2="90" y2="90" stroke="gray" strokeWidth="2" />
              <line x1="90" y1="10" x2="10" y2="90" stroke="gray" strokeWidth="2" />
            </svg>
          </div>
        )}
      </div>

      {isViewerOpen && createPortal(<FullscreenViewer />, document.body)}

      <style jsx="true">{`
        .placeholder-image {
          width: 100%;
          height: 100%;
          background-color: #f9fafb;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
        }
        .cross-svg {
          width: 50%;
          height: 50%;
        }
      `}</style>
    </>
  );
};

export default ImagePlaceholder;
