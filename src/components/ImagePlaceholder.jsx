// src/components/ImagePlaceholder.jsx
import React, { useState } from 'react';

const ImagePlaceholder = ({
  src = null,
  alt = 'Image',
  className = '',
  imageSize = 'w-full h-full',
  fallbackClassName = '',
  style = {}
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  return (
    <div className={`relative ${className}`} style={style}>
      {!imageError ? (
        <img
          src={src}
          alt={alt}
          className={`${imageSize} object-cover`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        <div className={`placeholder-image ${fallbackClassName}`}>
          <svg className="cross-svg" viewBox="0 0 100 100">
            <line x1="10" y1="10" x2="90" y2="90" stroke="gray" strokeWidth="2" />
            <line x1="90" y1="10" x2="10" y2="90" stroke="gray" strokeWidth="2" />
          </svg>
        </div>
      )}

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
};

export default ImagePlaceholder;
