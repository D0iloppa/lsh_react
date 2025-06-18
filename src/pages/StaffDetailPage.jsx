import React, { useState, useEffect } from 'react';  // ⬅ useEffect 추가

import RotationDiv from '@components/RotationDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import SketchHeader from '@components/SketchHeader';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';

const StaffDetailPage = ({ navigateToPageWithData, PAGES, ...otherProps }) => {
  const [date, setDate] = useState('');
  const [partySize, setPartySize] = useState('');
  const girl = otherProps || {};

  const getAgeFromBirthYear = (birthYear) => {
    const currentYear = new Date().getFullYear();
    return birthYear ? currentYear - parseInt(birthYear, 10) : null;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <style jsx>{`
        .discover-section {
          padding: 2rem 1.5rem;
          text-align: center;
        }
        
        .discover-button {
          position: relative;
          padding: 0.75rem 2rem;
          background-color: #e5e7eb;
          color: #374151;
          border: 2px solid #374151;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          font-size: 1rem;
          border-radius: 10px 6px 12px 8px;
          transform: rotate(-0.5deg);
        }
        
        .discover-button:hover {
          background-color: #d1d5db;
          transform: rotate(0.3deg);
        }

        .staff-detail-container {
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        .profile-images-section {
          margin-bottom: 1rem;
        }

        .dual-image-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .image-left {
          width: 100%;
          max-width: 300px;
        }

        .profile-image {
          margin-top: 20px;
          width: 100%;
          border-radius: 1rem;
        }

        .staff-info-section {
          text-align: center;
          margin-top: 1rem;
        }

        .staff-name {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .staff-age {
          font-size: 1.1rem;
          margin-top: 0.25rem;
        }

        .staff-specialty {
          font-size: 1rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .staff-description {
          margin-top: 0.75rem;
          font-size: 0.95rem;
          color: #4b5563;
        }

        .booking-form-section {
          margin-top: 2rem;
          padding-bottom: 20px;
        }

        .full-width {
          width: 100%;
        }
      `}</style>

      <div className="staff-detail-container">
        <SketchHeader
          title={'STAFF PROFILE'}
          showBack={true}
          onBack={() => console.log('뒤로가기')}
          rightButtons={[]}
        />

        <div className="profile-images-section">
          <RotationDiv 
            interval={3000} 
            showIndicators={true}
            pauseOnHover={true}
            className="profile-rotation"
          >
            <div className="profile-slide">
              <div className="dual-image-container">
                <div className="image-left">
                  <ImagePlaceholder
                    src={girl.image_url || '/placeholder-girl1.jpg'}
                    className="profile-image"
                  />
                </div>
              </div>
            </div>
          </RotationDiv>
        </div>

        <div className="staff-info-section">
          <div className="staff-name">{girl.name || 'Unknown Staff'}</div>
          <div className="staff-age">
            {girl.birth_year ? `Age ${getAgeFromBirthYear(girl.birth_year)}` : 'Age N/A'}
          </div>
          <div className="staff-specialty">Specialty Mixology Customer Relations</div>
          <div className="staff-description">
            {girl.description || 'No description available.'}
          </div>
        </div>

        <div className="booking-form-section">
          <SketchBtn
            className="full-width" variant = 'event'
            onClick={() => {
              navigateToPageWithData(PAGES.RESERVATION, {});
            }}
          >
            Reserve Now
            <HatchPattern opacity={0.8} />
          </SketchBtn>
        </div>
      </div>
    </>
  );
};

export default StaffDetailPage;
