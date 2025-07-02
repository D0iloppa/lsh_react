// src/components/ImagePlaceholder.jsx
import React, { useState, useEffect } from 'react';

const ImagePlaceholder = ({
  src = null,
  alt = 'Image',
  className = '',
  imageSize = 'w-full h-full',
  fallbackClassName = '',
  style = {}
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // src가 변경될 때마다 상태 초기화
  useEffect(() => {
    if (src) {
      setImageError(false);
      setImageLoaded(false);
    } else {
      setImageError(true);
    }
  }, [src]);

  const handleImageError = (e) => {
    console.error('❌ Image load failed:', e.target.src);
    setImageError(true);
    setImageLoaded(false);
  };

  const handleImageLoad = (e) => {
    console.log('✅ Image loaded successfully:', e.target.src);
    setImageError(false);
    setImageLoaded(true);
  };

  // src가 없거나 에러가 발생한 경우 placeholder 표시
  if (!src || imageError) {
    return (
      <div className={`relative ${className}`} style={style}>
        <div className={`placeholder-image ${fallbackClassName}`}>
          <svg className="cross-svg" viewBox="0 0 100 100">
            <line x1="10" y1="10" x2="90" y2="90" stroke="gray" strokeWidth="2" />
            <line x1="90" y1="10" x2="10" y2="90" stroke="gray" strokeWidth="2" />
          </svg>
        </div>

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
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      <img
        src={src}
        alt={alt}
        className={`${imageSize} object-cover`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default ImagePlaceholder;