import React, { useState, useEffect, useRef  } from 'react';
import axios from 'axios';
import RotationDiv from '@components/RotationDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';
import SketchHeader from '@components/SketchHeader';
import GoogleMapComponent from '@components/GoogleMapComponent';
import SketchBtn from '@components/SketchBtn';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import LoadingScreen from '@components/LoadingScreen';
import { Star, Clock, Users, Phone, CreditCard, MessageCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ApiClient from '@utils/ApiClient';
import { useAuth } from '../contexts/AuthContext';
import { useLoginOverlay } from '@hooks/useLoginOverlay.jsx';
import { overlay } from 'overlay-kit';
import Swal from 'sweetalert2';

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

 

const DiscoverPage = ({ navigateToPageWithData, PAGES, goBack, showAdWithCallback, ...otherProps }) => {

  const venueId = otherProps?.venueId || null;
  const [venueInfo, setVenueInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [topGirls, setTopGirls] = useState([]);
  const [showFooter, setShowFooter] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);

/*
  const handleDetail = (girl) => {
    navigateToPageWithData(PAGES.STAFFDETAIL, girl);
  };*/
  const { user, isActiveUser, iauMasking } = useAuth();

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

    // 커스텀 훅 사용
  const navigationProps = { navigateToPageWithData, PAGES, goBack };
  const { openLoginOverlay } = useLoginOverlay(navigationProps);

 const handleDetail = (girl) => {
  try {


    showAdWithCallback(
      // 광고 완료 시 콜백
      () => {
        navigateToPageWithData(PAGES.STAFFDETAIL, girl);
      },
      // fallback 콜백 (광고 응답 없을 때)
      () => {
        navigateToPageWithData(PAGES.STAFFDETAIL, girl);
      },
      1000 // 1초 타임아웃
    );


  } catch (e) {
    console.error('광고 호출 중 예외 발생:', e);
    navigateToPageWithData(PAGES.STAFFDETAIL, girl);
  }
};


  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const [staffList, setStaffList] = useState([]);
  // 스크롤 이벤트용 별도 useEffect

  const navigate = useNavigate();
  
// useEffect(() => {
//   const debugScroll = () => {
//     console.log('=== 스크롤 디버깅 ===');
//     console.log('window.scrollY:', window.scrollY);
//     console.log('window.pageYOffset:', window.pageYOffset);
//     console.log('document.documentElement.scrollTop:', document.documentElement.scrollTop);
//     console.log('document.body.scrollTop:', document.body.scrollTop);
//     console.log('document.documentElement.clientHeight:', document.documentElement.clientHeight);
//     console.log('document.documentElement.scrollHeight:', document.documentElement.scrollHeight);
//     console.log('document.body.clientHeight:', document.body.clientHeight);
//     console.log('document.body.scrollHeight:', document.body.scrollHeight);
    
//     const discoverContainer = document.querySelector('.discover-container');
//     if (discoverContainer) {
//       console.log('discover-container scrollTop:', discoverContainer.scrollTop);
//       console.log('discover-container scrollHeight:', discoverContainer.scrollHeight);
//       console.log('discover-container clientHeight:', discoverContainer.clientHeight);
//     }
//   };

//   debugScroll();
  
//   // 스크롤 시도
//   window.scrollTo(0, 0);
  
//   setTimeout(debugScroll, 1000);
// }, [venueId]);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     const scrollY = window.scrollY;
  //     const windowHeight = window.innerHeight;
  //     const documentHeight = document.documentElement.scrollHeight;

  //     const scrollPercentage = scrollY / (documentHeight - windowHeight);

  //     if (scrollPercentage > 0.5) {
  //       setShowFooter(false);
  //     } else {
  //       setShowFooter(true);
  //     }
  //   };

  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []); // 의존성 배열 비움


useEffect(() => {
  const resetContentAreaScroll = () => {
    // 진짜 스크롤 컨테이너인 .content-area를 리셋
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      contentArea.scrollTop = 0;
      console.log('content-area 스크롤이 0으로 리셋됨');
    }
    
    // window도 함께 (혹시 모르니)
    window.scrollTo(0, 0);
  };

  resetContentAreaScroll();
  
  // DOM 렌더링 완료 후 한 번 더
  setTimeout(resetContentAreaScroll, 100);
  
}, [venueId]);

  useEffect(() => {
    //window.scrollTo(0, 0);

    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      //window.scrollTo(0, 0);
    }


    const fetchVenueInfo = async () => {
      if (!venueId) return;
      setLoading(true);
      try {
        const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';

        const response = await axios.get(`${API_HOST}/api/getVenue`, {
          params: { venue_id: venueId },
        });

        console.log("response", response.data)

        const iau = await isActiveUser();
        const venueInfo = response.data;

        const vi = {
          ...venueInfo,
          phone: iauMasking(iau, venueInfo.phone || ''),
          address: iauMasking(iau, venueInfo.address || '')
        };
        window.scrollTo(0, 0);
        setVenueInfo(vi || null);
      } catch (error) {
        console.error('Venue 정보 가져오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    // const fetchTopGirls = async () => {
    //   if (!venueId) return;
    //   try {

    //     const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
    //     const res = await axios.get(`${API_HOST}/api/getVenueStaffList`, {
    //       params: { venue_id: venueId },
    //     });
    //     const staffList = res.data || [];
    //     const top3 = staffList.slice(0, 3).map((girl) => {
    //       const birthYear = parseInt(girl.birth_year, 10);
    //       const currentYear = new Date().getFullYear();
    //       const age = birthYear ? currentYear - birthYear : '?';
    //       return {
    //         ...girl, 
    //         displayName: `${girl.name} (${age})`,
    //       };
    //     });
    //     setTopGirls(top3);
    //   } catch (error) {
    //     console.error('Top girls 가져오기 실패:', error);
    //   }
    // };

    fetchVenueInfo();
    
    //fetchTopGirls();
  }, [venueId, messages, currentLang]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!venueId) return;

      try {
        // 1. 먼저 staff 리스트를 가져옴
        const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
        const res = await axios.get(`${API_HOST}/api/getVenueStaffList`, {
          params: { venue_id: venueId },
        });
        const staffList = res.data || [];
        //console.log("staffList", staffList)
        setStaffList(staffList);
        // 2. staff 리스트가 있을 때만 availCnt 호출
        if (staffList.length > 0) {
          const top3WithAvailCnt = await Promise.all(
            staffList.map(async (girl) => {
              const birthYear = parseInt(girl.birth_year, 10);
              const currentYear = new Date().getFullYear();
              const age = birthYear ? currentYear - birthYear : '?';

              // 재시도 로직 추가
              let availCnt = 0;
              try {
                const response = await ApiClient.get('/api/staffAvailCnt', {
                  params: { staff_id: girl.staff_id }
                });

                // console.log(`=== Staff ${girl.staff_id} 전체 response 구조 확인 ===`);
                // console.log('response:', response);
                // console.log('response.data:', response.data);
                // console.log('response 키들:', Object.keys(response));

                // ApiClient가 다른 구조일 수 있으니 여러 가능성 체크
                let data = null;
                if (response.data) {
                  data = response.data;
                } else if (response.body) {
                  data = response.body;
                } else if (response.result) {
                  data = response.result;
                } else if (Array.isArray(response)) {
                  data = response;
                } else {
                  data = response; // response 자체가 데이터일 수도
                }

                console.log('실제 데이터:', data);

                if (Array.isArray(data) && data.length > 0) {
                  availCnt = data[0]?.availcnt || 0;
                } else if (data?.availcnt) {
                  availCnt = data.availcnt;
                }

                console.log('Final availCnt:', availCnt);

              } catch (error) {
                console.error(`Staff ${girl.staff_id} availCnt 로딩 실패:`, error);
                availCnt = 0;
              }


              return {
                ...girl,
                //displayName: `${girl.name} (${age})`,
                displayName: `${girl.name}`,
                availCnt: availCnt
              };
            })
          );

          setTopGirls(top3WithAvailCnt);
        }
      } catch (error) {
        console.error('Staff 데이터 가져오기 실패:', error);
      }
    };

    fetchAllData();
    
    window.scrollTo(0, 0);
  }, [venueId]);


  useEffect(() => {
    const loadVenueReview = async () => {
      if (!venueId) return;

      try {
        const response = await ApiClient.postForm('/api/getVenueReviewList', {
          venue_id: venueId
        });

        //console.log('responseReview', response.data);

        // 상태에 저장하거나 사용하기
        // setReviews(response.data);
        setReviewCount(response.data?.length || 0);
      } catch (error) {
        setReviewCount(0);
        console.error('리뷰 로딩 실패:', error);
      }
    };

    loadVenueReview();
  }, [venueId]); // venueId가 변경될 때만 실행




  const renderStars = (rating = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let color = '#d1d5db'; // 기본 회색 (gray-300)
      if (rating >= i) {
        color = '#fbbf24'; // 노란색 (yellow-400)
      } else if (rating >= i - 0.5) {
        color = '#fde68a'; // 연노란색 (yellow-200)
      }

      stars.push(
        <span key={i}>
          <Star color={color} fill={color} size={20} />
        </span>
      );
    }
    return stars;
  };

  const CalendarIcon = ({ size = 24, color = '#333' }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      stroke={color}
      strokeWidth="1.5"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );




  const MenuOverlay = ({ menuList, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scale, setScale] = useState(1);
    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    
    const imageRef = useRef(null);
    const lastTapRef = useRef(0);
    const initialDistanceRef = useRef(0);
    const initialScaleRef = useRef(1);
    const lastTouchRef = useRef({ x: 0, y: 0 });
  
    // 줌 리셋
    const resetZoom = () => {
      setScale(1);
      setTranslateX(0);
      setTranslateY(0);
      setIsZoomed(false);
    };

    const handleSwipeStart = (e) => {
      if (e.touches.length === 1 && !isZoomed) {
        touchStartX.current = e.touches[0].clientX;
      }
    };

    const handleSwipeEnd = (e) => {
      if (!isZoomed && e.changedTouches.length === 1) {
        touchEndX.current = e.changedTouches[0].clientX;
        const deltaX = touchEndX.current - touchStartX.current;

        if (Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            goToPrev(); // 오른쪽 → 왼쪽으로 밀기 → 이전 이미지
          } else {
            goToNext(); // 왼쪽 → 오른쪽으로 밀기 → 다음 이미지
          }
        }
      }
    };

  
    // 이미지 변경 시 줌 리셋
    useEffect(() => {
      resetZoom();
    }, [currentIndex]);
  
    // 더블탭 줌
    const handleDoubleTap = (e) => {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;
      
      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        e.preventDefault();
        if (scale === 1) {
          setScale(2);
          setIsZoomed(true);
        } else {
          resetZoom();
        }
      }
      lastTapRef.current = now;
    };
  
    // 핀치 줌 시작
    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        initialDistanceRef.current = distance;
        initialScaleRef.current = scale;
      } else if (e.touches.length === 1 && isZoomed) {
        const touch = e.touches[0];
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };
  
    // 핀치 줌 중
    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        const newScale = (distance / initialDistanceRef.current) * initialScaleRef.current;
        const clampedScale = Math.min(Math.max(newScale, 1), 4); // 1x ~ 4x
        
        setScale(clampedScale);
        setIsZoomed(clampedScale > 1);
      } else if (e.touches.length === 1 && isZoomed) {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastTouchRef.current.x;
        const deltaY = touch.clientY - lastTouchRef.current.y;
        
        setTranslateX(prev => prev + deltaX);
        setTranslateY(prev => prev + deltaY);
        
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };
  
    // 네비게이션 (줌 상태에서는 비활성화)
    const goToNext = () => {
      if (!isZoomed) {
        setCurrentIndex((prev) => (prev + 1) % menuList.length);
      }
    };
  
    const goToPrev = () => {
      if (!isZoomed) {
        setCurrentIndex((prev) => (prev - 1 + menuList.length) % menuList.length);
      }
    };
  
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}
        onClick={!isZoomed ? onClose : undefined}
      >
        <div
          style={{
          position: 'relative',
    backgroundColor: 'black',
    overflow: 'hidden',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',     // 세로 정렬
    justifyContent: 'center'  // 가로 정렬
        }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <X size={18} />
          </button>
  
          {/* 줌 리셋 버튼 */}
          {isZoomed && (
            <button
              onClick={resetZoom}
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                color: 'white',
                cursor: 'pointer',
                zIndex: 10,
                fontSize: '12px'
              }}
            >
              리셋
            </button>
          )}
  
          {/* 이전 버튼 */}
          {menuList.length > 1 && !isZoomed && (
            <button
              onClick={goToPrev}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <ChevronLeft size={20} />
            </button>
          )}
  
          {/* 다음 버튼 */}
          {menuList.length > 1 && !isZoomed && (
            <button
              onClick={goToNext}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <ChevronRight size={20} />
            </button>
          )}
  
          {/* 메뉴 이미지 */}
          <div 
            style={{ 
              position: 'relative',
              overflow: 'hidden',
              touchAction: isZoomed ? 'none' : 'auto'
            }}
            onTouchStart={(e) => {
              handleTouchStart(e);
              handleSwipeStart(e);
            }}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleSwipeEnd}
          >
            <img
              ref={imageRef}
              src={menuList[currentIndex]}
              alt={`메뉴 ${currentIndex + 1}`}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain',
                transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
                transition: scale === 1 ? 'transform 0.3s ease' : 'none',
                cursor: isZoomed ? 'grab' : 'pointer'
              }}
              onClick={handleDoubleTap}
              onDragStart={(e) => e.preventDefault()}
            />
  
            {/* 인디케이터 */}
            {menuList.length > 1 && !isZoomed && (
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '6px'
              }}>
                {menuList.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
  
          {/* 메뉴 카운터 */}
          {menuList.length > 1 && !isZoomed && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif" // ← 추가
            }}>
              {currentIndex + 1} / {menuList.length}
            </div>
          )}
  
          {/* 줌 상태일 때 도움말 */}
          {isZoomed && (
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '11px'
            }}>
              드래그로 이동 • 더블탭으로 줌아웃
            </div>
          )}
        </div>
      </div>
    );
  };

  // 기존 컴포넌트에서 사용
  // 기존 컴포넌트에서 사용
const openMenuOverlay = (menuList) => {
  const overlayElement = overlay.open(({ isOpen, close, unmount }) => (
    <MenuOverlay
      menuList={menuList}
      onClose={() => {
        console.log('Trying to close...');
        unmount(); // close 대신 unmount 시도
      }}
    />
  ));
};

















  return (
    <>
      <style jsx="true">{`
        .discover-container {
            touch-action: pan-y !important;
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          //min-height: 100vh;

          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .featured-section { padding-bottom: 60px; padding: 1rem; text-align: center;}
        .club-image-area {
          border-radius: 3px;
          width: 100%; height: 200px; border: 1px solid #1f2937;
          background-color: #f3f4f6; margin-bottom: 1rem;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .club-image-area img { width: 100%; height: 100%; object-fit: cover; }
        .club-name {
          font-size: 1.5rem; font-weight: bold; 
          word-break: break-word; white-space: normal;
          margin-bottom: 0.5rem;
        }
        .club-location { font-size: 0.9rem; color: #6b7280;  margin-bottom: 15px;}
        .top-venues-text { font-size: 1.2rem; font-weight: bold; margin-bottom: 8px;}
        .description {
          font-size: 0.9rem; color: #4b5563; line-height: 1.4; margin-bottom: 1rem;
        }
        .action-row {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
        }
        .make-text { font-weight: bold; }
        .reserve-btn {
          border: 0; font-size: 1.5rem; background: none; cursor: pointer;
        }
        .stars { font-size: 1.2rem; }
        // .upcoming-events {
        //   padding: 1rem; border-bottom: 1px solid #1f2937;
        // }
        .section-title { font-size: 1.1rem; font-weight: bold; margin-bottom: 1rem;}
        .events-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
        }
        .event-card {
          width: 100%; height: 120px; border: 1px solid #1f2937;
          background-color: #f9fafb; display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          color: #6b7280; 
        }
        .top-girls-section { padding: 1rem; margin-top: 20px; margin-bottom: 25px}
        .girls-rotation { width: 100%; margin-bottom: 3rem;}
        .girl-slide { text-align: center;  margin-top: 10px;}
        .girl-img {
          width: 220px;
          height: 300px; 
          object-fit: cover; border-radius: 0.5rem;
          margin: 0 auto 0.5rem;
          object-position: top;
        }
        .girl-name {
          
          text-align: center; margin-bottom: 0.5rem;
        }
        .girl-detail-btn {
          display: block; margin: 0 auto; padding: 0.3rem 2rem;
          border: 1px solid #1f2937; background-color: white; border-radius: 3px;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          cursor: pointer;
        }
        @media (max-width: 480px) {
          .discover-container {
              touch-action: pan-y !important;
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
        }
       .map-section {
          width: 100%;
          height: 250px;
          margin-top: 1rem;
          border: 1px solid #666;
        }   
          .reservation-footer {
          position: fixed;
          bottom: 80px;
          left: 0;
          right: 0;
          background: white;
          padding: 10px 10px 12px 15px;
          z-index: 1000;
          transform: translateY(0);
          transition: transform 0.3s ease-in-out;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        }

        .reservation-footer.hidden {
          transform: translateY(100%);
        }

        .reservation-footer-content {
          // max-width: 7rem;
          margin: 0 auto;
          display: flex;
         justify-content: space-between;
        }

        .top-sum {margin-top: 25px; display: flex; justify-content: space-between; margin-bottom: 2rem; padding-bottom: 8px; border-bottom: 1px solid #cecece;}

        .rotation-image-container{ width: 100%;
  height: 200px; }
      `}</style>

      <div className="discover-container">
        <SketchHeader
          title={venueInfo?.name || 'Discover'}
          showBack={true}
          onBack={goBack}
          rightButtons={[]}
        />

        <div className="featured-section">


          <div className="club-image-area">
            {loading ? (
              <div className="club-name">Loading...</div>
            ) : venueInfo?.imgList && Array.isArray(venueInfo.imgList) && venueInfo.imgList.length > 0 ? (
              // 1순위: imgList가 존재하고 빈 배열이 아닌 경우
              <RotationDiv
                interval={500000000}
                swipeThreshold={50}
                showIndicators={true}
                pauseOnHover={true}
                className="venue-rotation"
              >
                {venueInfo.imgList.map((imageUrl, index) => (
                  <div key={index} className="rotation-image-container">
                    <img src={imageUrl} alt={`venue-${index}`} />
                  </div>
                ))}
              </RotationDiv>
            ) : venueInfo?.image_url ? (
              // 2순위: imgList가 없으면 대표 이미지(image_url)
              <img src={venueInfo.image_url} alt="venue" />
            ) : (
              // 3순위: 이미지가 없는 경우
              <div className="club-name">No Image</div>
            )}
          </div>





          {venueInfo && (
            <div
              className="is-reservation"
              style={{
                right: '-130px',
                top: '-210px',
                position: 'relative',
                backgroundColor: venueInfo.is_reservation ? 'rgb(11, 199, 97)' : 'rgb(107 107 107)',
                color: '#fff',
                padding: '5px 7px',
                borderRadius: '3px',
                display: 'inline-block',
              }}
            >
              {venueInfo.is_reservation ? 
                get('VENUE_RESERVATION_AVAILABLE') || '예약 가능' : 
                get('VENUE_RESERVATION_CLOSED') || '예약 마감'
              }
            </div>
          )}


          <div className="club-name">{venueInfo?.name || 'Club One'}</div>

          <div className='sum-info text-start'>
            <div className="club-location">{venueInfo?.address || venueInfo?.location || 'in Vietnam'}</div>
           
            <div className="description">
              {formatTextWithLineBreaks(venueInfo?.description ||
                get('DiscoverPage1.5'))}
            </div>

            <div className="phone" style={{ marginBottom: '5px' }}>
              <span style={{ color: '#858585' }}><Phone size={14} /> tell: </span> {venueInfo?.phone || '-'}
            </div>

            <div style={{ marginBottom: '5px' }}>
              <span style={{ color: '#858585' }}><Users size={14} />  Staff Count: </span>
              {venueInfo && venueInfo.staff_cnt !== undefined ? (
                <span>{venueInfo.staff_cnt} {get('text.cnt1')}</span>
              ) : (
                <span>-</span>
              )}
            </div>
            <div>
              <span style={{ color: '#858585' }}>
                <CreditCard size={14} /> Menu:
              </span>
              {venueInfo?.menuList && Array.isArray(venueInfo.menuList) && venueInfo.menuList.length > 0 && (
                <button
                  onClick={() => openMenuOverlay(venueInfo.menuList)}
                  style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#374151'
                  }}
                >
                  {get('VENUE_VIEW_MENU') || '메뉴보기'}
                </button>
              )}
            </div>
          </div>

          <div className="top-sum">
            <div className="stars">{renderStars(venueInfo?.rating)}</div>
           <div 
              style={{ 
                color: reviewCount > 0 ? '#0072ff' : '#999999',
                cursor: reviewCount > 0 ? 'pointer' : 'default'
              }} 
              onClick={async () => {
                if (reviewCount > 0) {
                   
                  showAdWithCallback(
                    // 광고 완료 시 콜백
                    () => {
                      navigateToPageWithData(PAGES.VIEWREVIEWDETAIL, { venueId });
                    },
                    // fallback 콜백 (광고 응답 없을 때)
                    () => {
                      navigateToPageWithData(PAGES.VIEWREVIEWDETAIL, { venueId });
                    },
                    1000 // 1초 타임아웃
                  );





/*
                  const { isActiveUser: isActive = false } = await isActiveUser();

                  if (isActive) {
                    navigateToPageWithData(PAGES.VIEWREVIEWDETAIL, { venueId });
                  } else {

                    showAdWithCallback(
                      // 광고 완료 시 콜백
                      () => {
                        navigateToPageWithData(PAGES.VIEWREVIEWDETAIL, { venueId });
                      },
                      // fallback 콜백 (광고 응답 없을 때)
                      () => {
                        navigateToPageWithData(PAGES.VIEWREVIEWDETAIL, { venueId });
                      },
                      1000 // 1초 타임아웃
                    );
                        
                  }
*/


                }
              }}
            >
              {get('nav.review.1')} <span className='reviewCnt'>{reviewCount}</span>{get('text.cnt.1')} {get('text.cnt.2')} &gt;
            </div>
          </div>

          <div className="section-title" style={{ textAlign: 'start' }}>{get('DiscoverPage1.6')}</div>
          <div className="map-section">
            <GoogleMapComponent
              places={venueInfo ? [venueInfo] : []}
              disableInteraction={true}
            />
          </div>
        </div>

        <div className="upcoming-events">
        </div>

        <div className="top-girls-section">
          <div className="section-title">{get('DiscoverPage1.2')}</div>
          <RotationDiv interval={500000000} swipeThreshold={50} showIndicators={true} pauseOnHover={true} className="girls-rotation">
            {staffList.map((girl, index) => {
              // topGirls에서 같은 staff_id의 availCnt 찾기
              const topGirlData = topGirls.find(topGirl => topGirl.staff_id === girl.staff_id);
              const availCnt = topGirlData?.availCnt || 0;
              //console.log("availCnt", availCnt)

              // 나이 계산
              const birthYear = parseInt(girl.birth_year, 10);
              const currentYear = new Date().getFullYear();
              const age = birthYear ? currentYear - birthYear : '?';
              //const displayName = `${girl.name} (${age})`;
              const displayName = `${girl.name}`;

              console.log(`Girl ${index} - staff_id: ${girl.staff_id}, availCnt: ${availCnt}`);

              return (
                <div key={index} className="girl-slide" style={{ position: 'relative' }}>
                  {girl.image_url ? (
                    <div style={{ position: 'relative' }}>
                      <img src={girl.image_url} className="girl-img" alt="girl" />
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: availCnt > 0 ? 'rgb(11, 199, 97)' : 'rgb(107, 107, 107)',
                        color: 'rgb(255, 255, 255)',
                        padding: '3px 6px',
                        borderRadius: '3px',
                        fontSize: '11px',
                      }}>
                        {availCnt > 0 ? get('VENUE_RESERVATION_AVAILABLE') : get('VENUE_RESERVATION_CLOSED')}
                      </div>
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <ImagePlaceholder />
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: availCnt > 0 ? 'rgb(11, 199, 97)' : 'rgb(107, 107, 107)',
                        color: 'rgb(255, 255, 255)',
                        padding: '3px 6px',
                        borderRadius: '3px',
                        fontSize: '11px',
                      }}>
                        {availCnt > 0 ? get('VENUE_RESERVATION_AVAILABLE') : get('VENUE_RESERVATION_CLOSED')}
                      </div>
                    </div>
                  )}
                  <div className="girl-name">{displayName}</div>

                  <SketchBtn
                    type="text"
                    className="sketch-button"
                    size='small'
                    variant='primary'
                    style={{ width: '130px', marginBottom: '20px' }}
                    onClick={() => handleDetail(girl)}
                  >
                    <HatchPattern opacity={0.8} />
                    {get('DiscoverPage1.3')}
                  </SketchBtn>
                </div>
              );
            })}
          </RotationDiv>
          {/*</div><div className={`reservation-footer ${showFooter ? '' : 'hidden'}`}>*/}
          <div className={`reservation-footer ${showFooter ? '' : ''}`}>
            {<HatchPattern opacity={0.4} />}
            <div className="reservation-footer-content">
              <div>
                <div className="club-name" style={{ color: '#374151', fontSize: '17px', maxWidth: '160px' }}>{venueInfo?.name || 'Club One'}</div>
                <div>
                  <Clock size={13} style={{ marginRight: '4px' }} />
                  {venueInfo && venueInfo.open_time && venueInfo.close_time
                    ? `${venueInfo.open_time} - ${venueInfo.close_time}`
                    : '-'}
                </div>
              </div>
              <SketchBtn
                className="sketch-button enter-button"
                variant="event"
                style={{ width: '45px', height: '39px', marginTop: '10px', background: '#374151', color: 'white' }}
                onClick={async () => {
                  // 로그인 여부 체크
                  if (!user || !user.user_id) {
                    // navigate('/login'); ← 이거 대신 오버레이로 변경
                    openLoginOverlay(PAGES.DISCOVER, { venueId }); // 오버레이 함수 호출
                    return;
                  }

                  try {
                    // 1. room_sn 조회

                    /*
                    const chatList = await ApiClient.get('/api/getChattingList', {
                      params: {
                        venue_id: venueId,
                        target: 'manager',
                        user_id: user.user_id,
                        account_id: user.user_id,
                        account_type: user.type,
                      },
                    });

                    let room_sn = null;
                    if (chatList.length > 0) {
                      room_sn = chatList[0].room_sn;
                      console.log('room_sn', room_sn);
                    }
                    */

                    const chatRoom = await ApiClient.postForm('/api/getChatRoom', {
      
                      sender : user.user_id,
                      sender_type: 'user',
                
                      receiver_id: venueInfo.manager_id,
                      send_to:'manager'
                    });
                
                    const {room_sn = null} = chatRoom;

                      const response = await ApiClient.postForm('/api/getSubscriptionInfo', { 
                        user_id: user.user_id 
                      });
                      
                      let { isActiveUser = false } = response;

                      console.log('isActiveUser:', isActiveUser);

                      if (isActiveUser === true) {
                        navigateToPageWithData(PAGES.CHATTING, {
                          name: venueInfo?.name,
                          room_sn: room_sn,
                          send_to: 'manager',
                          receiver_id: venueInfo.manager_id,
                        });
                      } else {
                        // 미구독자인 경우 일일권 구매 안내
                        const result = await Swal.fire({
                          title: get('Popup.Button.TodayTrial'),
                          text: get('reservation.daily_pass.purchase_required'),
                          icon: 'info',
                          showCancelButton: true,
                          confirmButtonText: get('Popup.Button.TodayTrial'),
                          cancelButtonText: get('Common.Cancel'),
                          confirmButtonColor: '#3085d6',
                          cancelButtonColor: '#d33'
                        });

                        if (result.isConfirmed) {
                            //navigateToPageWithData(PAGES.PURCHASEPAGE);
                            navigate('/purchase');
                        }
                      }
                  } catch (error) {
                    console.error('채팅방 조회 실패:', error);
                    alert('채팅방 정보를 불러오는 데 실패했습니다.');
                  }
                }}
              >
                <MessageCircle size={16} />
              </SketchBtn>
              <SketchBtn
                className="sketch-button enter-button"
                variant="event"
                style={{ width: '90px', height: '39px', marginTop: '10px', marginLeft: '-55px' }}
                disabled={!venueInfo?.is_reservation}
                onClick={async () => {
                    if (!venueInfo.is_reservation) return;

                    // 로그인 여부 체크
                    if (!user || !user.user_id) {
                      openLoginOverlay(PAGES.DISCOVER, { venueId }); // 오버레이 함수 호출
                      return;
                    }

                    try {
                      const response = await ApiClient.postForm('/api/getSubscriptionInfo', { 
                        user_id: user.user_id 
                      });

                      let { isActiveUser = false } = response;

                      console.log('isActiveUser:', isActiveUser);

                      if (isActiveUser === true) {
                        // 구독자인 경우 바로 예약 페이지로 이동
                        navigateToPageWithData(PAGES.RESERVATION, {
                          target: 'venue',
                          id: venueId || 1,
                        });
                      } else {
                        // 미구독자인 경우 일일권 구매 안내
                        const result = await Swal.fire({
                          title: get('Popup.Button.TodayTrial'),
                          text: get('reservation.daily_pass.purchase_required'),
                          icon: 'info',
                          showCancelButton: true,
                          confirmButtonText: get('Popup.Button.TodayTrial'),
                          cancelButtonText: get('Common.Cancel'),
                          confirmButtonColor: '#3085d6',
                          cancelButtonColor: '#d33'
                        });

                        if (result.isConfirmed) {
                            //navigateToPageWithData(PAGES.PURCHASEPAGE);
                            navigate('/purchase');
                        }
                      }
                    } catch (error) {
                      console.error('구독 정보 확인 중 오류:', error);
                      // 에러 발생 시 기본 동작 (예약 페이지로 이동)
                      navigateToPageWithData(PAGES.RESERVATION, {
                        target: 'venue',
                        id: venueId || 1,
                      });
                    }
                  }}

              >
                <HatchPattern opacity={0.8} />
                {venueInfo?.is_reservation
                  ? get('DiscoverPage1.1') || '예약하기'
                  : get('DiscoverPage1.1.disable') || '예약 마감'
                }
              </SketchBtn>
            </div>
          </div>
          <div className="action-row">
            <SketchBtn
              className="sketch-button enter-button"
              variant="event"
              style={{ 'display': 'none' }}
              disabled={!venueInfo?.is_reservation}
              onClick={() => {

                if (!venueInfo.is_reservation) return;

                navigateToPageWithData(PAGES.RESERVATION, {
                  target: 'venue',
                  id: venueId || 1,
                })
              }}
            ><HatchPattern opacity={0.8} />
              {venueInfo?.is_reservation
                ? get('DiscoverPage1.1.enable') || '예약하기'
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
      </div>
    </>
  );
};

export default DiscoverPage;
