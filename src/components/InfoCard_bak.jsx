import React from 'react';
import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';

const InfoCard = ({ 
  title, 
  description, 
  imageSize = "w-16 h-16", 
  className = "mb-4",
  titleClassName = "",
  descriptionClassName = "",
  showHatch = true // ← 해칭 패턴 옵션 추가
}) => {
  return (
    <>
      <style jsx>{`
        .info-card-container {
          position: relative;
          transition: transform 0.2s ease;
        }
        
        .info-card-container:hover {
          transform: scale(1.02) rotate(0.5deg);
        }
        
        .info-card-title {
          color: #374151;
          font-weight: 600;
          line-height: 1.3;
          margin-bottom: 0.5rem;
        }
        
        .info-card-description {
          font-size: 0.9rem;
          line-height: 1.5;
          color: #6b7280;
          margin-top: 0.5rem;
        }
        
        .info-card-image {
          width: 64px;
          height: 64px;
          flex-shrink: 0;
        }

        .ic-gap {
            gap: 20px;
        }

        .mb-4 {
            margin-bottom: 4px;
        }

        .mb-8 {
            margin-bottom: 8px;
        }
      `}</style>
      
      <SketchDiv variant="card" className={`info-card-container ${className}`}>
        {/* 해칭 패턴 배경 */}
        {showHatch && <HatchPattern opacity={0.3} />}
        
        {/* 카드 내용 */}
        <div className="relative z-10"> {/* ← z-10으로 해칭 패턴 위에 표시 */}
          <div className="flex items-start ic-gap">
            <div className="info-card-image">
              <ImagePlaceholder className="w-full h-full" />
            </div>
            <div className="flex-1">
              <h3 className={`info-card-title ${titleClassName}`}>
                {title}
              </h3>
              <p className={`info-card-description ${descriptionClassName}`}>
                {description}
              </p>
            </div>
          </div>
        </div>
      </SketchDiv>
    </>
  );
};

export default InfoCard;