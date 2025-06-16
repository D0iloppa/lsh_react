import React from 'react';
import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';
import '@components/SketchComponents.css';
import './PopularVenue.css';

const PopularVenue = ({ 
  venueName = "KLUB ONE", 
  description = "Premium Entertainment", 
  image = null,
  rating = "4.8",
  location = "Ho Chi Minh City",
  className = ""
}) => {
  return (
    <SketchDiv className={`popular-venue ${className}`}>
      {/* 배경 이미지 또는 플레이스홀더 */}
      <div className="venue-image-container">
        {image ? (
          <img src={image} alt={venueName} className="venue-image" />
        ) : (
          <ImagePlaceholder />
        )}
        
        {/* 그라디언트 오버레이 */}
        <div className="venue-overlay">
          <HatchPattern opacity={0.1} />
        </div>
      </div>
    </SketchDiv>
  );
};

export default PopularVenue;