// src/components/ImagePlaceholder.jsx
import React, { useState, useEffect } from 'react';

const ImagePlaceholder = ({ 
  src = null, 
  alt = "Image", 
  className = "",
  fallbackClassName = "",
  style = {} 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!src);

  // src가 변경될 때마다 상태 초기화
  useEffect(() => {
    if (src) {
      setImageLoaded(false);
      setImageError(false);
      setIsLoading(true);
    } else {
      setImageLoaded(false);
      setImageError(false);
      setIsLoading(false);
    }
  }, [src]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
    setIsLoading(false);
  };

  // 이미지가 있고 로딩 성공한 경우
  if (src && imageLoaded && !imageError) {
    return (
      <div className={`relative ${className}`} style={style}>
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    );
  }

  // 로딩 중인 경우
  if (src && isLoading && !imageError) {
    return (
      <div className={`border-2 border-gray-800 bg-gray-100 relative ${className}`} style={style}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
        {/* 숨겨진 이미지로 로딩 체크 */}
        <img 
          src={src} 
          alt={alt}
          className="hidden"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    );
  }

  // 이미지가 없거나 로딩 실패한 경우 - SVG 플레이스홀더
  return (
    <div className={`border-2 border-gray-800 bg-white relative ${className} ${fallbackClassName}`} style={style}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <line x1="10" y1="10" x2="90" y2="90" stroke="black" strokeWidth="2"/>
        <line x1="90" y1="10" x2="10" y2="90" stroke="black" strokeWidth="2"/>
      </svg>
      {/* 이미지 로딩 실패 시 숨겨진 이미지 */}
      {src && imageError && (
        <img 
          src={src} 
          alt={alt}
          className="hidden"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};

export default ImagePlaceholder;