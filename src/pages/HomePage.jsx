// 전체 상단 import는 동일
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Star, Heart, ArrowRight, Clock, MapPin,  MoveLeft, Sparkles, Diamond } from 'lucide-react';
import GoogleMapComponent from '@components/GoogleMapComponent';
import ImagePlaceholder from '@components/ImagePlaceholder';
import SketchSearch from '@components/SketchSearch';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import { useAuth } from '../contexts/AuthContext';
import { useMsg } from '@contexts/MsgContext';
import { useNavigate } from 'react-router-dom';
import { useFcm } from '@contexts/FcmContext';
import LoadingScreen from '@components/LoadingScreen';


import GlobalPopupManager from '@components/GlobalPopupManager';
import Swal from 'sweetalert2';
import ApiClient from '@utils/ApiClient';
import { useLoginOverlay } from '@hooks/useLoginOverlay.jsx';
import { overlay } from 'overlay-kit';

const HomePage = ({ navigateToMap, navigateToSearch, navigateToPageWithData, PAGES, goBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hotspots, setHotspots] = useState([]);
  const [originalHotspots, setOriginalHotspots] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortRating, setSortRating] = useState('RATING_ALL');
  const [sortPrice, setSortPrice] = useState('PRICE_ALL');
  const [sortStaff, setSortStaff] = useState('STAFF_ALL');
  const [staffLanguageFilter, setStaffLanguageFilter] = useState('ALL');
  const navigate = useNavigate();
  const [isReservationOnly, setIsReservationOnly] = useState(false);
  const { messages, get, currentLang, isLoading } = useMsg();
  const [showPopup, setShowPopup] = useState(false);
  const { user, isActiveUser, iauMasking } = useAuth();
  const [favorites, setFavorits] = useState([]);
  const { fcmToken } = useFcm();
  const [iauData, setIauData] = useState(null);

    // 커스텀 훅 사용
  const navigationProps = { navigateToPageWithData, PAGES, goBack };
  const { openLoginOverlay } = useLoginOverlay(navigationProps);

  // 팝업 열기 핸들러
  const handleOpenPopup = () => {
    localStorage.removeItem('popupClosedDate');
    // testPopup.emit('adViewCount'); 
  };

  

  useEffect(() => {
    // PopupProvider가 마운트된 후에 testPopup이 생성됨
    if (window.testPopup) {
      //console.log('✅ testPopup 사용 가능');
      
      window.testPopup.emit('adViewCount');
      
    } else {
      console.log('❌ testPopup이 아직 생성되지 않음');
    }
  }, []); // 컴포넌트 마운트 후 실행

  useEffect(() => {
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';

    const upateAppId = async () => {
      try {
        const res = await axios.get(`${API_HOST}/api/upateAppId`, {
          params: {
            user_id: user?.user_id || 1,
            app_id: fcmToken,
            login_type:0
          },
        });
        return res.data || [];
      } catch (err) {
        console.error('즐겨찾기 실패:', err);
        return [];
      }
    };

    //alert(fcmToken);
    if (fcmToken) {
      upateAppId();
      // optional logging
      console.log('📲 HomePage에서 받은 FCM 토큰:', fcmToken, 'user_id:', user?.user_id || 1);
    }
  }, [fcmToken, user]);

  useEffect(() => {
    if (window.testPopup) {
      window.testPopup.emit('adViewCount');
    } 

    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';

    const fetchFavorits = async () => {
      try {
        const res = await axios.get(`${API_HOST}/api/getMyFavoriteList`, {
          params: { user_id: user?.user_id || 1 }
        });
        return res.data || [];
      } catch (err) {
        console.error('즐겨찾기 실패:', err);
        return [];
      }
    };

    const fetchHotspots = async (favoritesData) => {
      try {
        const res = await axios.get(`${API_HOST}/api/getVenueList`);
        const data = res.data || [];

        const favoriteIds = new Set(
          favoritesData
            .filter((f) => f.target_type === 'venue')
            .map((f) => f.target_id)
        );

        const iau = await isActiveUser();
        console.log('IAU:', iau);
        
        setIauData(iau);

        console.log('data', data);
        
        const transformed = data.map((item, index) => ({
          id: item.venue_id || index,
          name: item.name || 'Unknown',
          rating: parseFloat(item.rating || 0).toFixed(1),
          image: item.image_url,
          address: iauMasking(iau, item.address || ''),
          opening_hours: `${item.open_time}~${item.close_time}` || '정보 없음',
          isFavorite: favoriteIds.has(item.venue_id),
          cat_nm: item.cat_nm || 'UNKNOWN',
          created_at: new Date(item.created_at || '2000-01-01'),
          price: item.price || 0,
          staff_cnt: item.staff_cnt || 0,
          is_reservation: item.is_reservation === true,
          schedule_status:item.schedule_status,
          staff_languages: item.staff_languages || '',
        }));

        transformed.sort((a, b) => b.staff_cnt - a.staff_cnt);

        setOriginalHotspots(transformed);
        setHotspots(transformed);
      } catch (err) {
        console.error('장소 정보 실패:', err);
      }
    };

    const init = async () => {
      if (messages && Object.keys(messages).length > 0 && !localStorage.getItem('homeScrollY')) {
        window.scrollTo(0, 0);
      }
      const favoritesData = await fetchFavorits();
      setFavorits(favoritesData);
      await fetchHotspots(favoritesData);


const savedScrollY = localStorage.getItem('homeScrollY');

if (savedScrollY !== null) {
  const scrollY = parseInt(savedScrollY, 10);
  const container = document.querySelector('.content-area');

  let checkCount = 0;
  const maxChecks = 30;

  const checkReadyAndScroll = () => {
    const container = document.querySelector('.content-area');
    if (!container) {
      console.log('⏳ .content-area 아직 없음');
      requestAnimationFrame(checkReadyAndScroll);
      return;
    }

    const scrollReady = container.scrollHeight > container.clientHeight + 10;

    if (scrollReady) {
      container.scrollTop = scrollY;
      console.log('✅ 스크롤 복원 완료:', scrollY);
      localStorage.removeItem('homeScrollY');
    } else {
      checkCount++;
      if (checkCount < maxChecks) {
        requestAnimationFrame(checkReadyAndScroll);
      } else {
        console.warn('⚠️ 스크롤 복원 실패: 조건 만족 못함');
      }
    }
  };

  requestAnimationFrame(checkReadyAndScroll);
}


    };

    init();


  }, [messages, currentLang]);

  const handleGoBack = () => {
    navigate(-1);
  };
  
  
  const isNewSpot = (createdAt) => {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7); // 🔄 일주일 전으로 설정
    return createdDate > oneWeekAgo;
  };


const filterAndSortHotspots = (query, category, ratingSort, priceSort, staffSort) => {
    let filtered = [...originalHotspots];

    if (query.trim()) {
      filtered = filtered.filter((spot) =>
        spot.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category !== 'ALL') {
      filtered = filtered.filter((spot) => spot.cat_nm === category);
    }

    if (ratingSort === 'RATING_5') filtered = filtered.filter((spot) => parseFloat(spot.rating) >= 5);
    else if (ratingSort === 'RATING_4') filtered = filtered.filter((spot) => parseFloat(spot.rating) >= 4);
    else if (ratingSort === 'RATING_3') filtered = filtered.filter((spot) => parseFloat(spot.rating) >= 3);

    if (priceSort === 'PRICE_LOW') filtered.sort((a, b) => a.price - b.price);
    else if (priceSort === 'PRICE_HIGH') filtered.sort((a, b) => b.price - a.price);

    if (staffSort === 'STAFF_10') filtered = filtered.filter((spot) => spot.staff_cnt >= 10);
    else if (staffSort === 'STAFF_5') filtered = filtered.filter((spot) => spot.staff_cnt >= 5);
    else if (staffSort === 'STAFF_3') filtered = filtered.filter((spot) => spot.staff_cnt >= 3);

    if (isReservationOnly) {
      filtered = filtered.filter((spot) => spot.is_reservation === true);
    }

    if (staffLanguageFilter !== 'ALL') {
      filtered = filtered.filter((v) =>
        typeof v.staff_languages === 'string' && v.staff_languages.includes(staffLanguageFilter)
      );
    }

    setHotspots(filtered);
  };

  useEffect(() => {
    filterAndSortHotspots(searchQuery, categoryFilter, sortRating, sortPrice, sortStaff);
  }, [searchQuery, categoryFilter, sortRating, sortPrice, sortStaff, isReservationOnly,staffLanguageFilter]);

  const handleDiscover = (venueId) => {
    const container = document.querySelector('.content-area');

    if (container) {
      const scrollY = container.scrollTop;
      localStorage.setItem('homeScrollY', scrollY.toString());
      localStorage.setItem('discoverScrollY', '0');
      console.log("✅ savedScrollY from .content-area:", scrollY);
    }
    
    navigateToPageWithData(PAGES.DISCOVER, { venueId });
  };

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
          target_type: 'venue',
          target_id: spotTmp.id,
        },
      });
    } catch (error) {
      console.error('API 호출 실패:', error);
    }
  };

  // 오늘의 체험권 구매 기본 함수
    const defaultTodayTrial = () => {
      // alert('🎯 오늘의 체험권 구매 시작');
  
      // alert(JSON.stringify(user));

      let accessFlag = (user?.type == 'user') && user.user_id && user.user_id > 0;

     if (!accessFlag) {
        // 로그인 성공 후 이동할 페이지를 지정
        openLoginOverlay();
        // navigate('/purchase');
        // 팝업 닫기
        onClose();
      } else {
        // 이미 로그인된 경우 바로 이동
         navigate('/purchase');
        // 팝업 닫기
        onClose();
      }
 
      
  
      // ApiClient.postForm('/api/trialCoupon',{
      //   user_id: user?.user_id
      // }).then(res => {

      //   const {success = false} = res;
        
      //   if(success){
      //     Swal.fire({
      //       title: get('SWAL_DAILY_TICKET_SUCCESS_TITLE'),
      //       text: get('SWAL_DAILY_TICKET_SUCCESS_TEXT'),
      //       icon: 'success',
      //       confirmButtonText: '확인'
      //     }).then(() => {
      //       // Swal 확인 버튼 클릭 후 페이지 새로고침
      //       window.location.reload();
      //     });
      //   }

      //   console.log('✅ 체험권 발급 :', res);
      //   // alert('체험권이 발급되었습니다!');
        
      // }).catch(error => {
      //   console.error('❌ 체험권 발급 실패:', error);
      //   // alert('체험권 발급에 실패했습니다. 다시 시도해주세요.');
      // });
  
      /*
      // 인앱 결제 요청
      const payload = JSON.stringify({ action: 'buyItem' });
  
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.buyItem) {
        // iOS WebView
        console.log('📱 iOS 인앱 결제 요청');
        window.webkit.messageHandlers.buyItem.postMessage(null);
      } else if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        // Android WebView
        console.log('🤖 Android 인앱 결제 요청');
        window.ReactNativeWebView.postMessage(payload);
      } else {
        console.warn('⚠️ 웹뷰 환경이 아님 - 인앱 결제 불가');
        alert('인앱 결제가 지원되지 않는 환경입니다.');
      }
        */
      
      // 팝업 닫기
      onClose();
    };

  return (
    <>
      <style jsx>{`
        .filter-selects {
          display: flex;
          gap: 12px;
          margin: 12px 0 0;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .filter-selects::-webkit-scrollbar {
          display: none;
        }
        .select-box {
          padding: 8px 12px;
          border: 1px solid #333;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          color: #333;
          appearance: none;
          min-width: 130px;
          background-image: url("data:image/svg+xml,%3Csvg fill='black' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.5 7l4.5 4 4.5-4'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 12px;
        }
        .homepage-container {
          background: #f9fafb;
          font-family: 'BMHanna', 'Comic Sans MS';
          padding-bottom: 3rem;
        }
        .hero-section {
          padding: 2rem 1.5rem 1.5rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #333;
        }
        .hero-title {
          text-align: center;
          font-size: 1.55rem;
          font-weight: bold;
          color: #374151;
          margin-bottom: 1rem;
        }
        .content-section {
          padding: 20px 10px;
        }
        .card {
          border: 1px solid #333;
          border-radius: 10px;
          overflow: hidden;
          background: white;
          margin-bottom: 1rem;
          position: relative;
        }
        .rating-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: linear-gradient(135deg, #00f0ff, #fff0d8);
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 0.75rem;
          z-index: 2;
          display: flex;
          align-items: center;
        }
        .heart-icon {
          position: absolute;
          top: 8px;
          right: 8px;
          cursor: pointer;
          z-index: 2;
        }
        .card-footer {
          padding: 1rem;
          background: #f3f4f6;
          text-align: right;
        }
        .discover-btn-small {
          background: black;
          color: white;
          padding: 4px 10px;
          font-size: 13px;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          margin-left: auto;
        }

        .search-container  {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }

        @keyframes shake {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
          75% { transform: rotate(-3deg); }
          100% { transform: rotate(0deg); }
        }
           .checkbox-label {
          padding: 8px 12px;
          border: 1px solid #333;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

         .checkbox-label {
          padding: 8px 12px;
          border: 0px solid #333;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          margin-top:5px;
          margin-left:-10px;
          margin-bottom:-15px;
        }

         .daily-purchase {
            position: relative;
            overflow: hidden;
            text-align: center;
            padding: 1rem;
            margin: 1rem 0;
            // background: linear-gradient(135deg, rgb(255 255 255), rgb(231 245 255), rgb(188 254 255));
            border: 1px solid rgb(14, 133, 189);
            border-radius: 8px;
            color: #0369a1;
            font-weight: bold;
            max-width: 400px;
            background: #e2f5ff;
        }

        .daily-purchase::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -100%;
            width: 50%;
            height: 200%;
            background: linear-gradient(
                45deg,
                transparent,
                rgba(255, 255, 255, 0.05),
                rgba(255, 255, 255, 0.15),
                rgba(255, 255, 255, 0.25),
                rgba(255, 255, 255, 0.15),
                rgba(255, 255, 255, 0.05),
                transparent
            );
            transform: rotate(30deg);
            animation: shine-diagonal 4s ease-in-out infinite;
            filter: blur(2px);
        }

        @keyframes shine-diagonal {
            0% {
                left: -50%;
                opacity: 0;
            }
            30% {
                opacity: 0.6;
            }
            70% {
                opacity: 0.8;
            }
            100% {
                left: 120%;
                opacity: 0;
            }
        }

        .benefits {
            margin-top: 0.75rem;
            font-size: 0.75rem;
            font-weight: normal;
            color: #334155;
            text-align: start;
            margin-left: 2rem;
        }

        .benefit-item {
            margin-bottom: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .benefit-item:last-child {
            margin-bottom: 0;
        }

        .sparkle {
            width: 10px;
            height: 10px;
            color: #fbbf24;
        }

        .purchase-btn {
            margin-top: 1rem;
            color: white;
            background-color: rgb(59, 174, 228);
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
        }

        .purchase-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 174, 228, 0.3);
        }
            // .masked-content-wrapper{display: flex;}
            // .visible-text{min-width: 100px;}
      `}</style>

      <div className="homepage-container">
        <section className="hero-section">
          <HatchPattern opacity={0.3} />
          <h1 className="hero-title">{get('HomePage1.1')}</h1>
          <SketchSearch
              placeholder={get('Search1.1')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </section>

        {/* 단일 content-section - 중복 제거 */}
        <section className="content-section">
          {hotspots.map((spot, index) => {
            const isOverlayStyle = index >= 3;

            // 시간 처리
            const formatTime = (t) => {
              if (!t || typeof t !== 'string') return '';
              const [h, m] = t.split(':');
              return `${h}:${m}`;
            };

            const openTime = formatTime(spot.opening_hours?.split('~')[0]);
            const closeTime = formatTime(spot.opening_hours?.split('~')[1]);
            const openHoursText = `${openTime} ~ ${closeTime}`;

            // 일일권 구매 카드 표시 조건
            const shouldShowDailyPass = () => {
              const currentIndex = index + 1; // 1부터 시작
              
              if (currentIndex === 3) {
                // 처음 3개 후에 표시
                return true;
              } else if (currentIndex > 3) {
                // 3개 이후부터는 10개마다 표시 (13, 23, 33, 43, ...)
                return (currentIndex - 3) % 10 === 0;
              }
              
              return false;
            };

            return (
              <React.Fragment key={spot.id}>
                <div
                  className="card"
                  onClick={() => handleDiscover(spot.id)}
                  style={{
                    cursor: 'pointer',
                    display: isOverlayStyle ? 'flex' : 'block',
                    flexDirection: isOverlayStyle ? 'row' : 'initial',
                    alignItems: isOverlayStyle ? 'center' : 'initial',
                    gap: isOverlayStyle ? '1rem' : '0',
                    padding: isOverlayStyle ? '1rem' : '0',
                    position: 'relative',
                  }}
                >
                  {/* 이미지 영역 */}
                  <div
                    style={{
                      flex: isOverlayStyle ? '0 0 100px' : '1',
                      width: isOverlayStyle ? '100px' : '100%',
                      height: isOverlayStyle ? '100px' : '200px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={spot.image}
                      alt={spot.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />

                    <div
                      className="heart-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(spot);
                      }}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        cursor: 'pointer',
                        zIndex: 2,
                      }}
                    >
                      <Heart fill={spot.isFavorite ? '#f43f5e' : 'white'} color="white" />
                    </div>

                    {isNewSpot(spot.created_at) && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        backgroundColor: '#ff4757',
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        zIndex: 10,
                        padding: '6px 0',
                        lineHeight: 1.2,
                        boxShadow: '0 -2px 6px rgba(0,0,0,0.3)',
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px'
                      }}>
                        {isOverlayStyle ? 'NEW STAFF' : 'NEW STAFF UPDATED!!'}
                      </div>
                    )}



                    {!isOverlayStyle && (
                      <div className="rating-badge">
                        <Star size={16} style={{ marginRight: '4px', fill: '#ffe800', animation: 'shake 1s ease-in-out infinite'}} />
                        {spot.rating}
                      </div>
                    )}
                  </div>

                  {/* 텍스트 영역 */}
                  <div style={{ flex: '1', position: 'relative' }}>
                    <div style={{ padding: isOverlayStyle ? '0' : '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{spot.name}</div>
                      <div
                        className="is-reservation"
                        style={{
                          backgroundColor:
                            spot.schedule_status === 'available'
                            ? 'rgb(11, 199, 97)'  // 예약가능 - 초록색
                            : 'rgb(107, 107, 107)', // 영업종료 - 회색
                          color: '#fff',
                          padding: '5px 7px',
                          borderRadius: '3px',
                          display: 'inline-block',
                          marginTop: '4px',
                          fontSize: '12px'
                        }}
                      >

                      {spot.schedule_status === 'available'
                          ? get('DiscoverPage1.1.able')  // 예약가능
                          : get('VENUE_END') // 영업종료
                      }  
                      </div>
                      <div style={{ fontSize: '14px', color: '#333', marginTop: '6px' }}>
                        <MapPin size={14}/> {spot.address}
                      </div>
                      <div style={{ fontSize: '14px', color: '#555', marginTop: '4px' }}>
                        <Clock size={14}/> {openHoursText}  / <Users size={14}/> <strong style={{color:'rgb(11, 199, 97)'}}>{spot.staff_cnt}</strong> {get('title.text.16')}
                        {/*<Clock size={14}/> {openHoursText}  / <img src="/cdn/stepIcon.png" alt="staff" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> <strong>{spot.staff_cnt}</strong> {get('title.text.16')}*/}
                      </div>

                      {isOverlayStyle && (
                        <div
                          style={{
                            fontSize: '14px',
                            marginTop: '4px',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Star size={14} style={{ fill: '#ffe800' }} />
                          {spot.rating}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 일일권 구매 안내 표시 */}
                {shouldShowDailyPass() && iauData && !iauData.isActiveUser && (
                  <div className='daily-purchase' style={{
                    textAlign: 'center',
                    padding: '1rem',
                    margin: '1rem 0',
                    border: '1px solid rgb(14, 133, 189)',
                    borderRadius: '8px',
                    color: '#0369a1',
                    fontWeight: 'bold'
                  }}>
                    {get('reservation.daily_pass.benefits_title')}
                    <div style={{
                        marginTop: '0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 'normal',
                        color: '#334155',
                        textAlign: 'start',
                        marginLeft:'2rem'
                      }}>
                        <div style={{ marginBottom: '0.25rem' }}>
                          <Sparkles size={10} style={{ color: '#fbbf24' }}/> {get('reservation.daily_pass.benefit_no_ads')}
                        </div>
                        <div style={{ marginBottom: '0.25rem' }}>
                          <Sparkles size={10} style={{ color: '#fbbf24' }}/> {get('reservation.daily_pass.benefit_unlimited_info')}
                        </div>
                        <div style={{ marginBottom: '0.25rem' }}>
                          <Sparkles size={10} style={{ color: '#fbbf24' }}/> {get('reservation.daily_pass.benefit_unlimited_booking')}
                        </div>
                        <div>
                          <Sparkles size={10} style={{ color: '#fbbf24' }}/> {get('reservation.daily_pass.benefit_escort_reviews')}
                        </div>
                      </div>
                     <SketchBtn 
                        className="purchase-btn-shine"
                        onClick={defaultTodayTrial}
                        style={{
                          marginTop: '1rem', 
                          color: 'white', 
                          backgroundColor: 'rgb(66 179 222)'
                        }}
                      ><HatchPattern opacity={0.5} />
                        {get('reservation.daily_pass.purchase_button')}
                      </SketchBtn>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </section>
         <LoadingScreen 
          variant="cocktail"
          loadingText="Loading..."
          isVisible={isLoading} 
        />
      </div>
    </>
  );
};

export default HomePage;