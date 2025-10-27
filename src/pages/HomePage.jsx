// 전체 상단 import는 동일
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Wine, Star, Heart, ArrowRight, Clock, MapPin,  MoveLeft, Sparkles, Diamond, Scissors, Home } from 'lucide-react';
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
import NoticePopup from '@components/NoticePopup';


import GlobalPopupManager from '@components/GlobalPopupManager';
import Swal from 'sweetalert2';
import ApiClient from '@utils/ApiClient';
import { useLoginOverlay } from '@hooks/useLoginOverlay.jsx';
import { overlay } from 'overlay-kit';
import PageHeader from '@components/PageHeader';
import AdBannerSlider from '@components/AdBannerSlider';

import { getOpeningStatus } from '@utils/VietnamTime'

import { getVersionInfo, compareVersions } from '@utils/storage'


const HomePage = ({ pageHistory, navigateToMap, navigateToSearch, navigateToPageWithData, PAGES, goBack, showAdWithCallback }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hotspots, setHotspots] = useState([]);
  const [originalHotspots, setOriginalHotspots] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortRating, setSortRating] = useState('RATING_ALL');
  const [sortPrice, setSortPrice] = useState('PRICE_ALL');
  const [sortStaff, setSortStaff] = useState('STAFF_ALL');
  const navigate = useNavigate();
  const [isReservationOnly, setIsReservationOnly] = useState(false);
  const { messages, get, currentLang, isLoading } = useMsg();
  const [showPopup, setShowPopup] = useState(false);
  const { user, isActiveUser, iauMasking } = useAuth();
  const [favorites, setFavorits] = useState([]);
  const { fcmToken } = useFcm();
  const [iauData, setIauData] = useState(null);
  const [staffLanguageFilter, setStaffLanguageFilter] = useState('ALL');
  

  // 공지사항 상태
  const [notice, setNotice] = useState(null);
  const [showNotice, setShowNotice] = useState(false);

  const [sortType, setSortType] = useState('latest');

const myBanners = [
  {
    type: 'video',
    src: '/cdn/video_mobile.mp4',
    //poster: '/cdn/video-thumb.jpg'
  }
];

  // 카테고리 데이터
  const categories = [
     {
    id: 'BAR',
    name: get('category_bar_name'),
    description: get('category_bar_desc'),
    img: '/cdn/wine.png', 
    color: '#f97316',
    bgColor: '#fff7ed'
  },
  {
    id: 'MASSAGE',
    name: get('category_massage_name'),
    description: get('category_massage_desc'),
    img: '/cdn/bed.png',
    color: '#8b5cf6',
    bgColor: '#f3e8ff'
  }
  ];

  console.log(pageHistory);
  // 커스텀 훅 사용
  const navigationProps = { navigateToPageWithData, PAGES, goBack };
  const { openLoginOverlay } = useLoginOverlay(navigationProps);

  // 팝업 열기 핸들러
  const handleOpenPopup = () => {
    localStorage.removeItem('popupClosedDate');
    //testPopup.emit('adViewCount'); 
  };

  // 정렬
  useEffect(() => {
      if (!originalHotspots.length) return;

      const sorted = [...originalHotspots].sort((a, b) => {
        if (sortType === "status") {
         return (b.schedule_status === "available" ? 1 : 0) - (a.schedule_status === "available" ? 1 : 0);
        } else if (sortType === "rating") {
          return b.rating - a.rating; // 평점 높은 순
        } else if (sortType === "latest") {
          return b.created_at - a.created_at; // 최신 등록순
        }
        return 0;
      });

      setHotspots(sorted);
    }, [sortType, originalHotspots]);

  useEffect(() => {
    // 현재 상태를 강제로 push
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      // 뒤로가기를 눌러도 같은 주소로 다시 push
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    // PopupProvider가 마운트된 후에 testPopup이 생성됨
    if (window.testPopup) {
      // window.testPopup.emit('adViewCount');
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

    if (fcmToken) {
      upateAppId();
      console.log('📲 HomePage에서 받은 FCM 토큰:', fcmToken, 'user_id:', user?.user_id || 1);
    }
  }, [fcmToken, user]);

  useEffect(() => {
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';

    const upateSetting = async () => {
      try {
        const res = await axios.get(`${API_HOST}/api/userSetting`, {
          params: {
            user_id: user?.user_id || 1,
            lang: currentLang,
            email: user?.email,
            user_type: 'user',
          },
        });
        return res.data || [];
      } catch (err) {
        console.error('즐겨찾기 실패:', err);
        return [];
      }
    };

    localStorage.setItem('lsh_language', currentLang);
    upateSetting();
  }, [user, currentLang]);

  useEffect(() => {
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
    const hasFetched = localStorage.getItem("hasFetchedNotice");
    const today = new Date().toLocaleDateString('sv-SE');

    const fetchNotice = async () => {
      try {
        const res = await axios.get(`${API_HOST}/api/getNotice`, {
          params: { lang: currentLang }
        });

        if (res.data) { 
          let activeNotice = res.data;
          let noticeList = res.data;
          let id = null;
          let check = 0;

          if (noticeList.length > 0) {
            id = noticeList[0].notice_id;
          }

          const hasFetchedId = localStorage.getItem("hasFetchedNoticeId");

          if (hasFetchedId === null || hasFetchedId === "" || hasFetchedId != id) {
            localStorage.setItem("hasFetchedNotice", "false");
            localStorage.setItem("hasFetchedNoticeId", id);
            check = 1;
          }

          if (hasFetched == "true" && check == 0) return; 
          if (hasFetched === today && check == 0) return;

          setNotice(noticeList);
          setShowNotice(true);
          localStorage.setItem("hasFetchedNotice", "true");
        }
      } catch (err) {
        console.error("공지사항 불러오기 실패:", err);
      }
    };

    fetchNotice();
  }, []);

  useEffect(() => {
    if (window.testPopup) {
      // window.testPopup.emit('adViewCount');
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
        setIauData(iau);

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
          schedule_status: item.schedule_status,
          has_promotion: item.has_promotion,
          staff_languages: item.staff_languages || '',
          opening_status: getOpeningStatus({
            open_time : item.open_time, 
            close_time : item.close_time, 
            schedule_status : item.schedule_status
          })
        }));

       // transformed.sort((a, b) => b.staff_cnt - a.staff_cnt);
       transformed.sort((a, b) => b.created_at - a.created_at);


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
        let checkCount = 0;
        const maxChecks = 30;

        const checkReadyAndScroll = () => {
          const container = document.querySelector('.content-area');
          if (!container) {
            requestAnimationFrame(checkReadyAndScroll);
            return;
          }

          const scrollReady = container.scrollHeight > container.clientHeight + 10;

          if (scrollReady) {
            container.scrollTop = scrollY;
            localStorage.removeItem('homeScrollY');
          } else {
            checkCount++;
            if (checkCount < maxChecks) {
              requestAnimationFrame(checkReadyAndScroll);
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

  const handleSearch = () => {

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setHotspots(originalHotspots);
      return;
    }

    
    const filtered = originalHotspots.filter((spot) =>
      spot.name.toLowerCase().includes(query)
    );

    console.log('search', query, filtered);



    setHotspots(filtered);
  };
  
  const isNewSpot = (createdAt) => {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    return createdDate > oneWeekAgo;
  };

  const filterAndSortHotspots = (query, category, ratingSort, priceSort, staffSort) => {
    
    


    let filtered = [...originalHotspots];

    console.log('here', filtered);

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
  }, [searchQuery, categoryFilter, sortRating, sortPrice, sortStaff, isReservationOnly, staffLanguageFilter]);

  const handleDiscover = (venueId) => {
    const container = document.querySelector('.content-area');

    if (container) {
      const scrollY = container.scrollTop;
      localStorage.setItem('homeScrollY', scrollY.toString());
      localStorage.setItem('discoverScrollY', '0');
    }

    showAdWithCallback(
      () => {
        navigateToPageWithData(PAGES.DISCOVER, { venueId });
      },
      () => {
        navigateToPageWithData(PAGES.DISCOVER, { venueId });
      },
      1000
    );
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

const handleCategorySelect = (categoryId) => {

console.log('categoryId', categoryId)

  //setCategoryFilter(categoryId);
  
  switch(categoryId) {
    case 'BAR':
      navigateToPageWithData(PAGES.BARLIST, { category: categoryId });
      break;
    case 'MASSAGE':
      navigateToPageWithData(PAGES.MASSAGELIST, { category: categoryId });
      break;
    default:
      break;
  }
};

  const defaultTodayTrial = () => {
    let accessFlag = (user?.type == 'user') && user.user_id && user.user_id > 0;

    if (!accessFlag) {
      openLoginOverlay();
      onClose();
    } else {
      navigate('/purchase');
      onClose();
    }
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
        }
        .hero-section {
          padding: 1rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #333;
        }
        .hero-title {
          text-align: center;
          font-size: 1.7rem;
          font-weight: bold;
          color: #374151;
          margin-top: 0;
          margin-bottom: 1rem;
          white-space: normal;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: keep-all;   
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
        .search-container {
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
          border: 0px solid #333;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          margin-top: 5px;
          margin-left: -10px;
          margin-bottom: -15px;
        }
        .daily-purchase {
          position: relative;
          overflow: hidden;
          text-align: center;
          padding: 1rem;
          margin: 1rem 0;
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
        
        /* 카테고리 섹션 스타일 */
       .category-section {
          margin-bottom: 1rem;
        }


        .category-title {
          line-height: 1;
          font-size: 1.4rem;
          font-weight: bold;
          color: #374151;
          margin-top: 5px;
          white-space: pre-line;
        }
       .category-grid {
          padding: 0.5rem;
          display: flex;                    
          gap: 1rem;
          scrollbar-width: none;            
        }

        .category-grid::-webkit-scrollbar { 
          display: none;
        }

       .category-card {
          position: relative;
          border-radius: 8px;
          border: 1px solid rgb(249, 115, 22);
          display: flex;
          align-items: center;
          padding: 0.75rem;
          width: 100%;
          justify-content: space-between;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 
                      0 2px 4px rgba(0, 0, 0, 0.08); /* 더 입체적인 그림자 */
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .category-card:hover {
          transform: translateY(-4px); /* 살짝 떠오르는 효과 */
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18),
                      0 4px 8px rgba(0, 0, 0, 0.12); /* hover 시 더 강한 그림자 */
        }

        .category-description {
          font-size: 0.75rem;
          font-weight: normal;
          opacity: 0.8;
          white-space: pre-line;
          line-height: 0.7;
          margin-bottom: 0.5rem;
        }

       .category-image {
        position: absolute;
        right: 3px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1;
      }


        .category-name {
          /* 기존 스타일 유지 */
          font-size: 1.2rem;      
          margin-bottom: 0.7rem;
        }

        .category-name, .category-description {
        position: relative;
        z-index: 2;
      }
        

         .venue-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1rem;
            margin-bottom: 0;
            padding: 0 1rem;
        }
        .venue-list-title {
           font-size: 1.125rem;
            font-weight: bold;
            color: #374151;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin: 0;
        }
        .sort-select {
            padding: 6px 10px;
            border: 1px solid #1f2937;
            border-radius: 6px;
            background: white;
            font-size: 14px;
            color: #374151;
            min-width: 140px;
            cursor: pointer;
            }

            .ad-video{
              height:270px; 
              display:flex; 
              align-items:center; 
              justify-content:center; 
              color:#666; 
              font-size:14px; 
              margin-top:10px;
              border-radius:8px;
              padding: 0.5rem;
            }
      `}</style>

      <div className="homepage-container">

         <PageHeader 
           title='LeThanhTon Sheriff'
          category="All"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* 카테고리 섹션 */}
        <section className="category-section">
           
          {/* <h2
            className="category-title"
            dangerouslySetInnerHTML={{ __html: get('booking_prompt') }}
          ></h2> */}
          <div className='ad-video'>
            <AdBannerSlider banners={myBanners} />
            {/* <video width="100%" height="auto" controls autoPlay muted loop>
              <source src="/cdn/video_mobile.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video> */}
          </div>
          <div className="category-grid">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isActive = categoryFilter === category.id;
              
              return (
                <div
                  key={category.id}
                  className={`category-card ${isActive ? 'active' : ''}`}
                  style={{
                    color: isActive ? 'white' : category.color,
                    background: isActive
                      ? `linear-gradient(to bottom, ${category.color}, ${category.bgColor})`
                      : `linear-gradient(to bottom, ${category.bgColor}, #fff)`, // 비활성화 시 은은한 입체감
                    borderColor: category.color,
                    boxShadow: isActive
                      ? `0 6px 14px rgba(0,0,0,0.2), 0 3px 6px rgba(0,0,0,0.12)`
                      : `0 4px 10px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)`,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div>
                    <div className="category-name">{category.name}</div>
                    <div
                      className="category-description"
                      dangerouslySetInnerHTML={{ __html: category.description }}
                    ></div>
                  </div>
                  <div className="category-image">
                    <img
                      src={category.img}
                      alt={category.name}
                      style={{
                        width: '70px',
                        height: '70px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
              );

            })}
          </div>
        </section>

        {/* 전체 매장 제목 */}

      <div className="venue-header">
            <h2 className="venue-list-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Home size={22} color="#374151" opacity={0.8} />
            { get('all_venues') }
          </h2>
 
        </div>

        {/* 매장 목록 섹션 */}
        {/* 매장 목록 섹션 */}
<section className="content-section">
  {hotspots.flatMap((spot, index) => {
    const elements = [];
    const isOverlayStyle = index >= 3;

    const formatTime = (t) => {
      if (!t || typeof t !== 'string') return '';
      const [h, m] = t.split(':');
      return `${h}:${m}`;
    };

    const openTime = formatTime(spot.opening_hours?.split('~')[0]);
    const closeTime = formatTime(spot.opening_hours?.split('~')[1]);
    const openHoursText = `${openTime} ~ ${closeTime}`;

    const shouldShowDailyPass = () => {
      const currentIndex = index + 1;
      if (currentIndex === 3) {
        return true;
      } else if (currentIndex > 3) {
        return (currentIndex - 3) % 10 === 0;
      }
      return false;
    };

    // ① 기존 매장 카드 렌더링
    elements.push(
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

            {spot.has_promotion === 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: isNewSpot(spot.created_at)
                    ? (isOverlayStyle ? '45%' : '65%')
                    : (isOverlayStyle ? '70%' : '80%'),
                  left: '2%',
                  width: isOverlayStyle ? '98%' : '40%',
                  backgroundColor: '#007bff',
                  color: 'white',
                  fontSize: isOverlayStyle ? '11px' : '12px',
                  fontWeight: 'bold',
                  zIndex: 11,
                  padding: isOverlayStyle ? '6px 0' : '8px 0',
                  lineHeight: isOverlayStyle ? 1.2 : 1.4,
                  boxShadow: isOverlayStyle ? '0 2px 6px rgba(0,0,0,0.3)' : 'none',
                  borderRadius: isOverlayStyle ? '8px' : '4px',
                  display: isOverlayStyle ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isOverlayStyle ? '6px' : '4px',
                }}
              >
                <Sparkles size={14} color="white" />
                <span>PROMOTION</span>
              </div>
            )}

            {isNewSpot(spot.created_at) && (
              <div
                style={{
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
                  borderBottomRightRadius: '8px',
                }}
              >
                {isOverlayStyle ? 'NEW STAFF' : 'NEW STAFF UPDATED!!'}
              </div>
            )}

            {!isOverlayStyle && (
              <div className="rating-badge">
                <Star
                  size={16}
                  style={{
                    marginRight: '4px',
                    fill: '#ffe800',
                    animation: 'shake 1s ease-in-out infinite',
                  }}
                />
                {spot.rating}
              </div>
            )}
          </div>

          {/* 텍스트 영역 */}
          <div style={{ flex: '1', position: 'relative' }}>
            <div style={{ padding: isOverlayStyle ? '0' : '0.75rem 1rem' }}>
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {spot.name}
              </div>
              <div>
                {/* 영업 상태 */}
                <div
                  className="is-reservation"
                  style={{
                    backgroundColor:
                      spot.opening_status?.opening_status === 'open'
                        ? 'rgb(11, 199, 97)'
                        : 'rgb(107, 107, 107)',
                    color: '#fff',
                    padding: '5px 7px',
                    borderRadius: '3px',
                    display: 'inline-block',
                    marginTop: '4px',
                    fontSize: '12px',
                  }}
                >
                  {get(spot.opening_status?.msg_code)}
                </div>

                {/* 예약 가능 여부 */}
                <div
                  className="is-reservation"
                  style={{
                    backgroundColor:
                      spot.schedule_status === 'available'
                        ? 'rgb(11, 199, 97)'
                        : 'rgb(107, 107, 107)',
                    color: '#fff',
                    padding: '5px 7px',
                    borderRadius: '3px',
                    display: 'inline-block',
                    marginTop: '4px',
                    marginLeft: '2px',
                    fontSize: '12px',
                  }}
                >
                  {spot.schedule_status === 'available'
                    ? get('DiscoverPage1.1.able')
                    : get('DiscoverPage1.1.disable')}
                </div>
              </div>

              <div
                style={{ fontSize: '14px', color: '#333', marginTop: '6px' }}
              >
                <MapPin size={14} /> {spot.address}
              </div>
              <div
                style={{ fontSize: '14px', color: '#555', marginTop: '4px' }}
              >
                <Clock size={14} /> {openHoursText} / <Users size={14} />{' '}
                <strong style={{ color: 'rgb(11, 199, 97)' }}>
                  {spot.staff_cnt}
                </strong>{' '}
                {get('title.text.16')}
              </div>

              {isOverlayStyle && (
                <div style={{ position: 'relative' }}>
                  {spot.has_promotion === 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: -125,
                        zIndex: 11,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '3px 8px',
                        background:
                          'linear-gradient(180deg, #2d7ff9, #0a66ff)',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 700,
                        lineHeight: 1,
                        letterSpacing: '0.3px',
                        borderRadius: 9999,
                        boxShadow:
                          '0 2px 6px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.35)',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                      }}
                    >
                      <Sparkles size={14} color="white" />
                      <span>PROMOTION</span>
                    </div>
                  )}

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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 일일권 안내 (기존 그대로) */}
        {shouldShowDailyPass() && iauData && !iauData.isActiveUser && (
          <div
            className="daily-purchase"
            style={{
              textAlign: 'center',
              padding: '1rem',
              margin: '1rem 0',
              border: '1px solid rgb(14, 133, 189)',
              borderRadius: '8px',
              color: '#0369a1',
              fontWeight: 'bold',
              display: 'none',
            }}
          >
            {get('reservation.daily_pass.benefits_title')}
            <SketchBtn
              onClick={defaultTodayTrial}
              style={{
                marginTop: '1rem',
                color: 'white',
                backgroundColor: 'rgb(66 179 222)',
              }}
            >
              <HatchPattern opacity={0.5} />
              {get('reservation.daily_pass.purchase_button')}
            </SketchBtn>
          </div>
        )}
      </React.Fragment>
    );

    // ② 추가: 3~5개 사이마다 프로모션 더미 카드 삽입
    const randomInterval = 3 + Math.floor(Math.random() * 3);
    if ( 1 === 1 && (index + 1) % randomInterval === 0) {

      

      if(iauData?.isActiveUser == true){
        return elements;
      }
      
      console.log('randomInterval', iauData);

      elements.push(
        <div
          key={`promo-${index}`}
          className="promo-card"
          style={{
            border: '2px dashed #4f46e5',
            borderRadius: '12px',
            padding: '1.2rem',
            margin: '1.5rem 0',
            background: 'linear-gradient(180deg, #eef2ff, #ffffff)',
            textAlign: 'center',
            color: '#1e3a8a',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
          onClick={() => navigate('/purchase')}
        >
          <div style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>
            🎁 {get('daily.pass.benefits.title')}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#334155' }}>
            {get('Popup.Premium.Benefit1')}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#334155' }}>
            {get('Popup.Premium.Benefit2')}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#334155' }}>
            {get('Popup.Premium.Benefit3')}
          </div>
          <SketchBtn
            style={{
              marginTop: '0.8rem',
              background: '#4f46e5',
              color: '#fff',
              padding: '8px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {get('daily.pass.benefits.title')}
          </SketchBtn>
        </div>
      );
    }

    return elements;
  })}
</section>

        
        <LoadingScreen 
          variant="cocktail"
          loadingText="Loading..."
          isVisible={isLoading} 
        />
      </div>

      <NoticePopup
        notice={notice}
        showNotice={showNotice}
        setShowNotice={setShowNotice}
        get={get}
      />
    </>
  );
};

export default HomePage;