import React, { useState } from 'react';
import RotationDiv from '@components/RotationDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';

import HatchPattern from '@components/HatchPattern';
import SketchInput from '@components/SketchInput';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';

const StaffDetailPage = ({ navigateToPageWithData, PAGES, ...otherProps }) => {
  const [date, setDate] = useState('');
  const [partySize, setPartySize] = useState('');

  const profiles = [
    {
      id: "10",
      image: "/placeholder-girl1.jpg"
    },
    {
      id: "15",
      image: "/placeholder-girl2.jpg"
    },
    {
      id: "8", 
      image: "/placeholder-girl3.jpg"
    }
  ];

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
      `}</style>

      <div className="staff-detail-container">
        {/* Header */}
        <div className="header">
          <div className="logo">🍸 LeTanTon Sheriff</div>
        </div>

        {/* Profile Images Section */}
        <div className="profile-images-section">
          <RotationDiv 
            interval={3000} 
            showIndicators={true}
            pauseOnHover={true}
            className="profile-rotation"
          >
            {profiles.map((profile, index) => (
              <div key={index} className="profile-slide">
                <div className="dual-image-container">
                  <div className="image-left">
                    <ImagePlaceholder src={profile.image} className="profile-image" />
                  </div>
                </div>
              </div>
            ))}
          </RotationDiv>
        </div>

        {/* Staff Info Section */}
        <div className="staff-info-section">
          <div className="staff-name">Linh Tran</div>
          <div className="staff-age">Age 24</div>
          <div className="staff-specialty">Specialty Mixology Customer Relations</div>
          
          <div className="staff-description">
            Linh has been working in the nightlife industry for over 3 years and 
            is known for her excellent mixology skills and friendly customer 
            service.
          </div>
        </div>

        {/* Booking Form Section */}
        <div className="booking-form-section">
          <div className="form-field">
            <label className="field-label">Date</label>
            <SketchInput 
              type="text" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
              placeholder=""
            />
          </div>

          <div className="form-field">
            <label className="field-label">Party Size</label>
            <SketchInput 
              type="text" 
              value={partySize}
              onChange={(e) => setPartySize(e.target.value)}
              className="form-input"
              placeholder=""
            />
          </div>


        <SketchBtn className="full-width"
                onClick={ () => {
                    navigateToPageWithData(PAGES.RESERVATION, {});
                }}
            >
            Reserve Now
            <HatchPattern opacity={0.4} />
        </SketchBtn>


        </div>
      </div>
    </>
  );
};

export default StaffDetailPage;