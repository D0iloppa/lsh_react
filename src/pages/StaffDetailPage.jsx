import React, { useState, useEffect } from 'react';  // ⬅ useEffect 추가

import RotationDiv from '@components/RotationDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import SketchHeader from '@components/SketchHeader';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';
import LoadingScreen from '@components/LoadingScreen';
import ApiClient from '@utils/ApiClient';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

const StaffDetailPage = ({ navigateToPageWithData, goBack, PAGES, ...otherProps }) => {
  const [date, setDate] = useState('');
  const [partySize, setPartySize] = useState('');
  const girl = otherProps || {};
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const getAgeFromBirthYear = (birthYear) => {
    const currentYear = new Date().getFullYear();
    return birthYear ? currentYear - parseInt(birthYear, 10) : null;
  };

  const handleBack = () => {
    goBack();
  }

  const handleReserve = () => {

    
    navigateToPageWithData(PAGES.RESERVATION, {
      target: 'staff',
      id: girl.staff_id || 123,
    })
  }

  
  const toggleFavorite = async (spotTmp) => {
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
    setHotspots((prev) =>
      prev.map((spot) =>
        spot.id === spotTmp.id ? { ...spot, isFavorite: !spot.isFavorite } : spot
      )
    );

    const isNowFavorite = !spotTmp.isFavorite;

    try {
      const url = `${API_HOST}/api/${isNowFavorite ? 'insertFavorite' : 'deleteFavorite'}`;
      await axios.get(url, {
        params: {
          user_id: user?.user_id || 1,
          target_type: 'staff',
          target_id: spotTmp.id,
        },
      });
    } catch (error) {
      console.error('API 호출 실패:', error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    console.log('profile', girl);
    
     if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);

  return (
    <>
      <style jsx="true">{`
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
          margin-bottom: 0.75rem;
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
          title={get('Menu1.2')}
          showBack={true}
          onBack={handleBack}
          rightButtons={[]}
        />

        <div className="profile-images-section">
          <RotationDiv 
            interval={50000000} 
            swipeThreshold={50} 
            showIndicators={true}  
            pauseOnHover={true}
            className="profile-rotation"
          >
            {(() => {
              const images = girl.images || [girl.image_url];
              const hasMultipleImages = images.length > 1;
              
              // 이미지가 1개면 같은 이미지를 3-4번 복제
              const slidesToShow = hasMultipleImages ? images : Array(4).fill(images[0]);
              
              return slidesToShow.map((imageUrl, index) => (
                <div key={index} className="profile-slide">
                  <div className="dual-image-container">
                    <div className="image-left">
                      <ImagePlaceholder
                        src={imageUrl || '/placeholder-girl1.jpg'}
                        className="profile-image"
                      />
                    </div>
                  </div>
                </div>
              ));
            })()}
          </RotationDiv>
        </div>

        <div className="staff-info-section">
          <div className="staff-name">{girl.name || 'Unknown Staff'}</div>
          <div className="staff-age">
            {girl.birth_year ? `Age ${getAgeFromBirthYear(girl.birth_year)}` : 'Age N/A'}
          </div>
          <div className="staff-specialty">{get('StaffDetail1.1')}</div>
          <div className="staff-description">
            {girl.description || 'No description available.'}
          </div>
        </div>

        p
      </div>
    </>
  );
};

export default StaffDetailPage;
