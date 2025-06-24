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
  const [availCnt, setAvailCnt] = useState(0);
  const [isLoadingAvailCnt, setIsLoadingAvailCnt] = useState(false);
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

    console.log(girl);
    navigateToPageWithData(PAGES.RESERVATION, {
      target: 'staff',
      id: girl.staff_id || 123,
      staff:girl
    })
  }
    // availCnt 가져오기
  useEffect(() => {
    const fetchStaffAvailCnt = async () => {
      if (!girl.staff_id) return;
      
      setIsLoadingAvailCnt(true);
      
      try {
        const response = await ApiClient.get('/api/staffAvailCnt', {
          params: { staff_id: girl.staff_id }
        });
        
        console.log(`Staff ${girl.staff_id} availCnt response:`, response);
        
        // ApiClient는 response 자체가 데이터 배열
        if (Array.isArray(response) && response.length > 0) {
          setAvailCnt(response[0]?.availcnt || 0);
        } else {
          setAvailCnt(0);
        }
        
      } catch (error) {
        console.error('availCnt 로딩 실패:', error);
        setAvailCnt(0);
      } finally {
        setIsLoadingAvailCnt(false);
      }
    };

    fetchStaffAvailCnt();
  }, [girl.staff_id]);

  useEffect(() => {
    window.scrollTo(0, 0);
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
        }

        .booking-form-section {
          margin-top: 2rem;
          padding-bottom: 20px;
        }

        .full-width {
          width: 100%;
        }

        // .avail-status-badge {
        //   position: absolute;
        //   top: 19px;
        //   right: 56px;
        //   padding: 4px 8px;
        //   border-radius: 4px;
        //   font-size: 11px;
        //   color: white;
        //   z-index: 10;
        // }
      `}</style>

    {/* {!isLoadingAvailCnt && (
            <div 
              className="avail-status-badge"
              style={{
                backgroundColor: availCnt > 0 ? 'rgb(11, 199, 97)' : 'rgb(107, 107, 107)'
              }}
            >
              {availCnt > 0 ? '예약 가능' : '예약 마감'}
            </div>
          )} */}

      <div className="staff-detail-container">
       <SketchHeader
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{get('Menu1.2')}</span>
              {!isLoadingAvailCnt && (
                <span 
                  style={{
                    backgroundColor: availCnt > 0 ? 'rgb(11, 199, 97)' : 'rgb(107, 107, 107)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '10px',
                  }}
                >
                  {availCnt > 0 ? '예약 가능' : '예약 마감'}
                </span>
              )}
            </div>
          }
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

        <div className="booking-form-section">
          <SketchBtn
            className="full-width" variant = 'event'
            onClick={handleReserve}
          >
            {get('btn.reserve.1')}
            <HatchPattern opacity={0.8} />
          </SketchBtn>
        </div>
         <LoadingScreen 
                   variant="cocktail"
                   loadingText="Loading..."
                   isVisible={isLoading} 
                 />
      </div>
    </>
  );
};

export default StaffDetailPage;
