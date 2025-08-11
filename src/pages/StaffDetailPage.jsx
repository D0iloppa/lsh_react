import React, { useState, useEffect, useRef } from 'react';

import RotationDiv from '@components/RotationDiv';
import ImagePlaceholder from '@components/ImagePlaceholderStaff';
import SketchHeader from '@components/SketchHeader';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';
import LoadingScreen from '@components/LoadingScreen';
import ApiClient from '@utils/ApiClient';

import { useMsg } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';
import { usePopup } from '@contexts/PopupContext';

import CountryFlag from 'react-country-flag';

const FLAG_CODES = {
  kr: 'KR',
  en: 'US',
  vi: 'VN',
  ja: 'JP',
  cn: 'CN',
};

const StaffDetailPage = ({ navigateToPageWithData, goBack, PAGES, showAdWithCallback, ...otherProps }) => {

  // 이미지 확대 여부
  const [noImagePopup, setNoImagePopup] = useState(true);

  const [date, setDate] = useState('');
  const [partySize, setPartySize] = useState('');
  const [availCnt, setAvailCnt] = useState(0);
  const [vnScheduleStatus, setVnScheduleStatus] = useState('');
  const [isLoadingAvailCnt, setIsLoadingAvailCnt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [girl, setGirl] = useState(otherProps || {});
  const [images, setImages] = useState([]);
  const didOpenIOSViewerRef = useRef(false);


  const { get, currentLang, messages } = useMsg();
  const { isActiveUser } = useAuth();
  const { showPopup, closePopup } = usePopup();

  const isAndroid = !!window.native;
//  const isIOS = !!window.webkit?.messageHandlers?.native?.postMessage;
  const isIOS = false;
  const openIOSImageViewer = (images = [], startIndex = 0) => {
    try {

      if(noImagePopup) return;

        window.webkit.messageHandlers.native.postMessage(
          JSON.stringify({
            type: 'showImageViewer',
            images: images,
            startIndex: 0
          })
        );
      } catch (e) {
        console.error('iOS 메시지 전송 실패:', e);
      }
  };

  const IOSImageViewer = ({ images = [] }) => {
    const validImages = (images || []).filter(Boolean);
    const slides = validImages.length > 0 ? validImages : [null];

    return (
      <div className="profile-rotation ios-native-image-viewer" style={{ padding: '0 16px' }}>
        {slides.map((imageUrl, index) => (
          <div key={index} className="profile-slide">
            <div className="dual-image-container">
              <div className="image-left">
                <img
                  src={imageUrl || '/img/no-image.png'}
                  alt={`staff-${index}`}
                  className="profile-image"
                  onClick={() => openIOSImageViewer(validImages, index)}
                  // iOS에서 네이티브 띄울 거라 로테이션/줌 없이 단순 이미지
                  draggable={false}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
};


  const getAgeFromBirthYear = (birthYear) => {
    const currentYear = new Date().getFullYear();
    
    return birthYear ? currentYear - parseInt(birthYear, 10) : null;
  };

    // 텍스트 줄바꿈 처리 함수
    const formatTextWithLineBreaks = (text) => {
      if (!text) return '';
      
      return text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    };

    // 플리킹 감지를 위한 useRef 선언
      const touchStartXRef = useRef(null);
      const touchEndXRef = useRef(null);

       
      const handleTouchStart = (e) => {

        const isIgnoredArea = e.target.closest('.profile-rotation');
  if (isIgnoredArea) return;

  
      if (e.touches.length === 1) {
        touchStartXRef.current = e.touches[0].clientX;
      }
    };
    
    // 터치 종료
    const handleTouchEnd = (e) => {

       const isIgnoredArea = e.target.closest('.profile-rotation');
  if (isIgnoredArea) return;

      if (e.changedTouches.length === 1) {
        touchEndXRef.current = e.changedTouches[0].clientX;
        const deltaX = touchEndXRef.current - touchStartXRef.current;
    
        if (deltaX > 80) { // ← 플리킹 감지 (좌 → 우)
          console.log('플리킹: 좌에서 우로 → 뒤로가기');
          goBack(); // 또는 navigate(-1);
        }
      }
    };

  const handleBack = () => {
    goBack();
  };

  const handleReserve = async () => {
    try {
      // 구독 상태 확인
      const { isActiveUser: isActive = false } = await isActiveUser();

      if (isActive) {
        // Active User: 예약 페이지로 이동

        12321123
        navigateToPageWithData(PAGES.RESERVATION, {
          target: 'staff',
          id: girl.staff_id || 123,
          staff: girl
        });


      } else {

        // 팝업띄우고 막음
         // Inactive User: 구독 필요 팝업 표시
         showPopup({
          id: 'subscription-required',
          type: 'premium-tabs',
          title: '구독이 필요한 서비스입니다',
          content: '예약 서비스를 이용하시려면 구독이 필요합니다.',
          /*
          onTodayTrial: () => {

            console.log('hi');
            closePopup('subscription-required');
            // navigateToPageWithData(PAGES.SUBSCRIPTION_PAY, {});
            // hidePopup();
          },
          */
        });


          /*
          // Inactive User: 광고 시청 후 예약 페이지로 이동
          showAdWithCallback(
            // 광고 완료 시 콜백
            () => {
              navigateToPageWithData(PAGES.RESERVATION, {
                target: 'staff',
                id: girl.staff_id || 123,
                staff: girl
              });
            },
            // fallback 콜백 (광고 실패 시)
            () => {
              navigateToPageWithData(PAGES.RESERVATION, {
                target: 'staff',
                id: girl.staff_id || 123,
                staff: girl
              });
            },
            4000 // 4초 타임아웃
          );
          */
        }
    } catch (error) {
      console.error('구독 상태 확인 실패:', error);
      // 에러 시 기본적으로 예약 페이지로 이동
      navigateToPageWithData(PAGES.RESERVATION, {
        target: 'staff',
        id: girl.staff_id,
        staff: girl
      });
    }
  };


  const staffViewCntUpsert = () => {
    console.log('viewCountUpsert', girl);

    ApiClient.postForm('/api/viewCountUpsert', {
      target_type: 'staff',
      target_id: girl.staff_id,
      venue_id: girl.venue_id,
    });
    
  }

  useEffect(() => {
    const fetchStaffData = async () => {
      if (otherProps.fromReview && otherProps.staff_id) {
        setLoading(true);
        try {
          

          const response = await ApiClient.get('/api/getStaffProfile', {
            params: { staff_id: otherProps.staff_id
              ,lang:currentLang
             }
          });

          const apiDataArray = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : [];

          const basicInfo = apiDataArray.length > 0 ? apiDataArray[0] : {};
          setGirl({
            ...otherProps,
            ...basicInfo,
          });

        } catch (error) {
          console.error('Staff 정보 로딩 실패:', error);
          setGirl(otherProps);
        } finally {
          setLoading(false);
        }
      } else {
        setGirl(otherProps);
      }
    };

    fetchStaffData();
  }, [otherProps.fromReview, otherProps.staff_id]);

  // 이미지 가져오기
  useEffect(() => {

  staffViewCntUpsert();

  const fetchStaffPhotos = async () => {
    if (!otherProps.staff_id) return;

    try {

      const activeUser = await isActiveUser();
      const { isActiveUser:iau = false} = activeUser;

      console.log('noImagePopup-chk', iau);
      // iau true -> 이미지 팝업, iau false -> 이미지 팝업 안함
      setNoImagePopup(!iau);


      const res = await ApiClient.get('/api/getStaffPhotos', {
        params: { staff_id: otherProps.staff_id }
      });

      console.log('사진 응답:', res);

      const baseUrl = ''; // ⚠️ 실제 CDN 도메인으로 교체
      const photos = Array.isArray(res?.data) ? res.data : [];

      const urls = photos
        .map(p => p?.url?.startsWith('/') ? baseUrl + p.url : p.url)
        .filter(img => typeof img === 'string' && img.trim() !== '');

      setImages(urls);
    } catch (err) {
      console.error('사진 로딩 실패:', err);
      setImages([]);
    }
  };

  fetchStaffPhotos();
}, [otherProps.staff_id]);

// RotationDiv가 올라갈 자리 요소
const rotationHostRef = useRef(null);

// viewport 기준 rect 반환
const getViewportRect = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    x: r.left,
    y: r.top,
    width: r.width,
    height: r.height,
    dpr: window.devicePixelRatio || 1,
  };
};

// iOS로 안전하게 postMessage
const postIOS = (payload) => {
  try {
    window.webkit?.messageHandlers?.native?.postMessage(JSON.stringify(payload));
  } catch (e) {
    console.error('iOS postMessage 실패:', e);
  }
};

useEffect(() => {
  
  if (!isIOS) return;
  const valid = (images || []).filter(Boolean);
  if (valid.length === 0) return;
  if (didOpenIOSViewerRef.current) return;

  let raf1, raf2;
  // 레이아웃이 안정된 뒤 rect 측정
  raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(() => {
      const rect = getViewportRect(rotationHostRef.current);
      if (!rect) return;
      postIOS({
        type: 'showImageViewer', // 인라인 뷰어 호출
        images: valid,
        startIndex: 0,
        noImagePopup:noImagePopup,
        rect,
      });
      didOpenIOSViewerRef.current = true;
    });
  });

  // 언마운트 시 정리
  return () => {
    if (raf1) cancelAnimationFrame(raf1);
    if (raf2) cancelAnimationFrame(raf2);

    if (!isIOS) return;
    
    postIOS({ type: 'deleteImageViewer' });
    didOpenIOSViewerRef.current = false;
  };
}, [isIOS, images]);

  // availCnt 가져오기
  useEffect(() => {
    const fetchStaffAvailCnt = async () => {
      if (!girl.staff_id) return;
      setIsLoadingAvailCnt(true);

      try {

        setVnScheduleStatus(girl.vn_schedule_status);
        
        const response = await ApiClient.get('/api/staffAvailCnt', {
          params: { staff_id: girl.staff_id }
        });

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
  }, [messages, currentLang]);


  useEffect(() => {
  const container = document.querySelector('.staff-detail-container');
  if (!container) return;

  container.addEventListener('touchstart', handleTouchStart, { passive: true });
  container.addEventListener('touchend', handleTouchEnd, { passive: true });

  return () => {
    container.removeEventListener('touchstart', handleTouchStart);
    container.removeEventListener('touchend', handleTouchEnd);
  };
}, []);


  return (
    <>
      <style jsx="true">{`
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

        .rotation-div{height: 300px;}

        .profile-image {
            margin-top: 20px;
            width: 100%;
            max-height: 300px;
            height: 350px; /* 추가: height도 고정해야 중앙정렬 가능 */
            object-fit: contain; /* ✅ 이미지 비율 유지 + 여백 생기면 중앙 정렬 */
            object-position: center center; /* ✅ 상하좌우 중앙 정렬 */
            display: block;
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
          margin: 1rem;
        }
        .booking-form-section {
          margin-top: 2rem;
          padding-bottom: 20px;
          margin: 1rem;
        }
          .staff-languages {
          font-size: 0.9rem;
          margin-top: 0.5rem;
          color: #555;
        }
      `}</style>

      <div className="staff-detail-container">
        <SketchHeader
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{get('Menu1.2')}</span>
              {!isLoadingAvailCnt && (
                <span
                  style={{
                    backgroundColor: 
                      vnScheduleStatus === 'closed' 
                        ? 'rgb(107, 107, 107)' 
                        : availCnt > 0 
                          ? 'rgb(11, 199, 97)' 
                          : 'rgb(107, 107, 107)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '10px',
                  }}
                >
                  {vnScheduleStatus === 'closed'
                    ? get('DiscoverPage1.1.disable')
                    : availCnt > 0 
                      ? get('DiscoverPage1.1.able') 
                      : get('DiscoverPage1.1.disable')}
                </span>
              )}
            </div>
          }
          showBack={true}
          onBack={handleBack}
          rightButtons={[]}
        />
<div className="profile-images-section">
  <div
    ref={rotationHostRef}                // ← 이 ref가 iOS 네이티브가 붙을 "자리"
    className="profile-rotation"
    style={{ position: 'relative' }}
  >
    {isIOS ? (
      // iOS: 웹 이미지는 렌더링하지 않고, 자리만 유지(높이는 기존 이미지 높이와 동일하게)
      <div style={{ width: '100%', height: 350 }} />
    ) : (
      <RotationDiv
        interval={50000000}
        swipeThreshold={50}
        showIndicators={true}
        pauseOnHover={true}
        className="profile-rotation"
      >
        {(() => {
          const validImages = images.filter(img => img && img.trim() !== '');
          const slides = validImages.length > 0 ? validImages : [null];



          return slides.map((imageUrl, index) => (
            <div key={index} className="profile-slide">
              <div className="dual-image-container">
                <div className="image-left">
                  <ImagePlaceholder
                    noPopup={noImagePopup}
                    src={imageUrl}
                    fullList={images}
                    initialIndex={index}
                    placeholder={true}
                    className="profile-image"
                  />
                </div>
              </div>
            </div>
          ));
        })()}
      </RotationDiv>
    )}
  </div>
</div>



        <div className="staff-info-section">
          <div className="staff-name">{girl.name || 'Unknown Staff'}</div>
          {girl.languages && (
            <div
              className="staff-languages"
              style={{
                marginTop: '0.5rem',
                fontSize: '0.9rem',
                color: '#555',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                flexWrap: 'wrap'
              }}
            >
              <span>{get('LANGUAGES_LABEL')}:</span>
              {girl.languages.split(',').map((lang) => {
                const code = FLAG_CODES[lang.trim()];
                return code ? (
                  <CountryFlag
                    key={lang}
                    countryCode={code}
                    svg
                    style={{
                      fontSize: '1.5rem',
                      height:'auto',
                      border: '1px solid #ccc',       // 테두리 추가       
                      lineHeight: '1.5rem'
                    }}
                    title={lang}
                  />
                ) : null;
              })}
            </div>
          )}


          {/*
          <div className="staff-age">
            {girl.birth_year ? `Age ${getAgeFromBirthYear(girl.birth_year)}` : 'Age N/A'}
          </div>
          */}
          <div className="staff-description">
            { 
              formatTextWithLineBreaks(girl.description || 'No description available.')
            }
          </div>
        </div>

        <div className="booking-form-section">
          <SketchBtn
            className="sketch-button enter-button"
            variant="event"
            style={{ display: 'block' }}
            disabled={availCnt <= 0 || vnScheduleStatus === 'closed'}
            onClick={handleReserve}
          >
            <HatchPattern opacity={0.8} />
            {vnScheduleStatus === 'closed'
              ? get('DiscoverPage1.1.disable') || '예약 마감'
              : availCnt > 0
                ? get('DiscoverPage1.1') || '예약하기'
                : get('DiscoverPage1.1.disable') || '예약 마감'}
          </SketchBtn>
        </div>

        <LoadingScreen
          variant="cocktail"
          loadingText="Loading..."
          isVisible={loading}
        />
      </div>
    </>
  );
};

const getLanguageFlagImages = (langStr) => {
  if (!langStr) return [];

  const flagMap = {
    kr: '/flags/kr.png',
    en: '/flags/us.png',
    vi: '/flags/vn.png',
    ja: '/flags/jp.png',
    cn: '/flags/cn.png',
  };

  return langStr
    .split(',')
    .map(l => l.trim())
    .filter(l => flagMap[l])
    .map(l => ({ lang: l, src: flagMap[l] }));
};


export default StaffDetailPage;
