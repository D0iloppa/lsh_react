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
  const [loading, setLoading] = useState(false);
  const [girl, setGirl] = useState(otherProps || {});
  
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
      staff:girl
    })
  }

   useEffect(() => {
  const fetchStaffData = async () => {
    if (otherProps.fromReview && otherProps.staff_id) {
      setLoading(true);
      try {
        //console.log('Review에서 온 경우 - API 호출:', otherProps.staff_id);
        
        const response = await ApiClient.get('/api/getStaffProfile', {
          params: { staff_id: otherProps.staff_id }
        });
        
        //console.log('API response:', response);
        
        // 배열 전체를 데이터로 사용
        const apiDataArray = Array.isArray(response) 
          ? response 
          : (response.data && Array.isArray(response.data))
            ? response.data
            : [];

        //console.log("apiDataArray", apiDataArray);

        // 첫 번째 객체에서 공통 정보 추출
        const basicInfo = apiDataArray.length > 0 ? apiDataArray[0] : {};
        
        // 모든 이미지 URL들 추출
        const images = apiDataArray.map(item => item.image_url).filter(Boolean);
        
        // API 데이터와 기존 데이터 합치기
        const staffData = {
          ...otherProps,
          ...basicInfo, // 기본 정보
          images: images, // 모든 이미지들
          image_url: images || basicInfo.image_url, // 대표 이미지
        };
        
        setGirl(staffData);
        //console.log('최종 staff 데이터:', staffData);
        
      } catch (error) {
        console.error('Staff 정보 로딩 실패:', error);
        setGirl(otherProps);
      } finally {
        setLoading(false);
      }
    } else {
      //console.log('기존 방식 - otherProps 사용');
      setGirl(otherProps);
    }
  };

  fetchStaffData();
}, [otherProps.fromReview, otherProps.staff_id]);


    // availCnt 가져오기
  useEffect(() => {
    const fetchStaffAvailCnt = async () => {
      if (!otherProps.staff_id) return;
      
      setIsLoadingAvailCnt(true);

      console.log("otherProps.staff_id", otherProps.staff_id)
      
      try {
        const response = await ApiClient.get('/api/staffAvailCnt', {
          params: { staff_id: otherProps.staff_id }
        });
        
        //console.log(`Staff ${girl.staff_id} availCnt response:`, response);
        
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
  }, [otherProps.staff_id]);

  useEffect(() => {
    window.scrollTo(0, 0);
     if (messages && Object.keys(messages).length > 0) {
      //console.log('✅ Messages loaded:', messages);
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
                  {availCnt > 0 ? get('DiscoverPage1.1.able') : get('DiscoverPage1.1.disable')}
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

              // 유효한 이미지만 필터링 (null, undefined, 빈 문자열 제외)
              const validImages = images.filter(img => img && img.trim() !== '');
              const hasValidImages = validImages.length > 0;

              //console.log("images", images, "validImages", validImages, "hasValidImages", hasValidImages);

              let slidesToShow;

              if (!hasValidImages) {
                // 유효한 이미지가 없으면 1개의 placeholder만
                slidesToShow = [null];
              } else {
                // 여러 유효한 이미지가 있으면 그대로 사용
                slidesToShow = validImages;
              }

              console.log("slidesToShow", slidesToShow)
              
              return slidesToShow.map((imageUrl, index) => (
                <div key={index} className="profile-slide">
                  <div className="dual-image-container">
                    <div className="image-left">
                      <ImagePlaceholder
                        src={imageUrl}
                        placeholder={true}
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
            className="sketch-button enter-button"
            variant="event"
            style={{ display: 'block' }}
            disabled={availCnt <= 0} // 예약 마감일 때 버튼 비활성화
            onClick={handleReserve}
          >
            <HatchPattern opacity={0.8} />
            {availCnt > 0
              ? get('DiscoverPage1.1') || '예약하기'
              : get('DiscoverPage1.1.disable') || '예약 마감'
            }
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
