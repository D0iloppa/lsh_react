import React from 'react';
import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';
import { Heart, Star } from 'lucide-react';
import LoadingScreen from '@components/LoadingScreen';

const InfoCard = ({
  title,
  description,
  imageSrc,
  imageSize = "w-16 h-16",
  className = "mb-4",
  titleClassName = "",
  descriptionClassName = "",
  showHatch = true,
  usingFavorite = false,
  isFavorite = false,
  toggleFavorite = () => {},
  usingRate = false,
  rating = 0,
  itemId // 즐겨찾기 토글을 위한 고유 ID
}) => {
  return (
    <>
      <style jsx="true">{`
        .info-card-container {
          position: relative;
          transition: transform 0.2s ease;
          margin-top: 5px;
        }
        .info-card-container:hover {
          transform: scale(1.02) rotate(0.5deg);
        }
        .info-card-title {
          color: #374151;
          font-weight: 600;
          line-height: 1.3;
          margin-bottom: 0px;
        }
          
        .info-card-description {
          font-size: 0.9rem;
          line-height: 1.5;
          color: #6b7280;
          margin-top: 0.5rem;
        }

        .info-card-image {
              border: 1px solid #333;
              border-radius: 5px;
              width: 130px;
              height: 100px;
              flex-shrink: 0;
              margin-top: auto;
              margin-bottom: auto;
        }
        .ic-gap {
          gap: 20px;
        }

        .favorite-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .favorite-button.active svg {
          fill: currentColor;
        }

        .favorite-button.active {
          color: #ef4444;
          transform: rotate(-8deg);
        }


        .rating-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.85rem;
          color: #f59e0b; /* amber-500 */
          margin-top: 0.25rem;
        }
      `}</style>

      <SketchDiv variant="card" className={`info-card-container ${className}`}>
        {showHatch && <HatchPattern opacity={0.3} />}

        <div className="relative z-10">
          {/* 즐겨찾기 버튼 */}
          {usingFavorite && (
            <button
              className={`favorite-button ${isFavorite ? 'active' : ''}`}
              onClick={() => toggleFavorite(itemId)}
            >
              <Heart
                size={20}
                fill={isFavorite ? 'currentColor' : 'none'}
              />
            </button>
          )}

          <div className="flex items-start ic-gap">
            <div className={`info-card-image ${imageSize}`}>
              <ImagePlaceholder src={imageSrc} className="w-full h-full" />
            </div>

            <div className="flex-1">
              <h3 className={`info-card-title ${titleClassName}`}>{title}</h3>
              <p className={`info-card-description ${descriptionClassName}`}>{description}</p>

              {usingRate && (
                <div className="rating-badge">
                  <Star size={16} fill="currentColor" />
                  <span>{rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </SketchDiv>
      
    </>
  );
};

export default InfoCard;
