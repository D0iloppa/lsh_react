import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ImagePlaceholder = ({
  src = [],
  alt = 'Image',
  className = '',
  imageSize = 'w-full h-full',
  fallbackClassName = '',
  style = {},
  placeholder = '',
  noPopup = false
}) => {
  const isArray = Array.isArray(src);
  const imageList = isArray ? src.filter(Boolean) : [src];

  const [imageError, setImageError] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const shouldShowPlaceholder = !imageList?.length || imageError;

  const handleImageError = () => setImageError(true);
  const handleImageLoad = () => setImageError(false);

  const openViewer = (index) => {
    if (noPopup) return;
    
    setCurrentIndex(index);
    setIsViewerOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    document.body.style.overflow = '';
  };

  const showPrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
    
  };

  const showNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  const FullscreenViewer = () => (
    <div
      className="fullscreen-overlay"
      onClick={closeViewer}
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
      }}
    >
      {/* 닫기 버튼 */}
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

      {/* 좌우 버튼 */}
      {imageList.length > 1 && (
        <>
          <button
            style={{ position: 'absolute', left: 20, zIndex: 10000 }}
            onClick={showPrev}
          >
            <ChevronLeft color="white" size={40} />
          </button>
          <button
            style={{ position: 'absolute', right: 20, zIndex: 10000 }}
            onClick={showNext}
          >
            <ChevronRight color="white" size={40} />
          </button>
        </>
      )}

      {/* 메인 이미지 */}
      <img
         id="fullscreen-image"
        src={imageList[currentIndex]}
        alt={`slide-${currentIndex}`}
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
          zIndex: 9998,
        }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* 하단 인디케이터 */}
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
            imageList.map((imgSrc, index) => (
              <img
                key={index}
                src={imgSrc}
                alt={`${alt}-${index}`}
                className={`${imageSize} object-cover cursor-pointer`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                onClick={() => openViewer(index)}
              />
            ))
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
