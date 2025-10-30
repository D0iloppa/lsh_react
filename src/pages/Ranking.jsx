import React, { useState, useEffect } from 'react';
import { Heart, Users, Star, Clock, MapPin, Trophy, Eye, Calendar } from 'lucide-react';
import SketchSearch from '@components/SketchSearch';
import HatchPattern from '@components/HatchPattern';
import { useAuth } from '../contexts/AuthContext';
import { useMsg } from '@contexts/MsgContext';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@components/LoadingScreen';
import ApiClient from '@utils/ApiClient';
import SketchHeader from '@components/SketchHeaderMain';
import SketchBtn from '@components/SketchBtn';

import Swal from 'sweetalert2';

import { getOpeningStatus } from '@utils/VietnamTime'


const Ranking = ({ navigateToPageWithData, PAGES, goBack, showAdWithCallback, ...otherProps }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rankingData, setRankingData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [rankingType, setRankingType] = useState('none'); // 'venue' or 'staff'
  const [timeFilter, setTimeFilter] = useState('week'); // 'day', 'week', 'month'
  const { messages, get, isLoading } = useMsg();
  const navigate = useNavigate();
  const { user, isActiveUser, iauMasking, filterFavorits, exts: { venueCatMap } } = useAuth();
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [iauData, setIauData] = useState(null);

  const [promoInterval] = useState(() => 4 + Math.floor(Math.random() * 5));


  const handleBack = () => {
    console.log('Back 클릭');
    navigateToPageWithData(PAGES.HOME);
  };

  useEffect(() => {
    if (!isApiLoading && rankingData.length > 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const savedScrollY = localStorage.getItem('rankScrollY');
          const savedRankingType = localStorage.getItem('rankingType'); // 저장된 필터 정보 가져오기

          if (savedRankingType) {
            setRankingType(savedRankingType); // 필터 복원
          }

          if (savedScrollY !== null) {
            const scrollY = parseInt(savedScrollY, 10);
            const container = document.querySelector('.content-area');

            // scrollY 복원 시, 콘텐츠 로딩 완료 후 100ms 뒤에 복원하도록 설정
            setTimeout(() => {
              const checkScrollPosition = () => {
                const scrollHeight = container.scrollHeight;
                const clientHeight = container.clientHeight;

                // if (scrollHeight > clientHeight) {
                const ratio = parseFloat(localStorage.getItem('rankScrollY'), 10);
                container.scrollTop = ratio;
                console.log('✅ 스크롤 비율 복원 완료 ratio :', ratio);
                //  } else {
                //    requestAnimationFrame(checkScrollPosition);
                //  }
              };

              requestAnimationFrame(checkScrollPosition);
            }, 200); // 100ms 대기 후 스크롤 복원
          }
        });
      });
    }
  }, [isApiLoading, rankingData]);

  // 랭킹 점수 계산 함수
  const calculateRankingScore = (item) => {
    const rating = parseFloat(item.rating || 0);
    const reservationCount = parseInt(item.reservation_count || 0);
    const viewCount = parseInt(item.view_count || 0);

    // 가중치를 적용한 점수 계산
    const score = (rating * 30) + (reservationCount * 2) + (viewCount * 0.1);
    return Math.round(score * 100) / 100;
  };


  useEffect(() => {

    setIsApiLoading(true)

    const fetchRankingData = async () => {
      try {

        const iau = await isActiveUser();
        setIauData(iau);




        const rankingFromPage = localStorage.getItem('themeSource');

        // venueCatMap 데이터 가져오기
       const vcm = await venueCatMap();

        // iau.onlyMasking = true;

        const fvrs = (await filterFavorits(rankingType)).map(item => item.target_id);
        const fvrsSet = new Set(fvrs);


        //실제 API 호출 (현재는 주석 처리)
        const res = await ApiClient.postForm('/api/getRank', {
          target_type: rankingType,
          timeFilter: timeFilter
        });

        let data = (res.data || []);

        // data = data.slice(0, 100);

        

        // 필터
        //data = data.filter(i=>i.cat_id == 1);


        // 최대 랭킹
       
        //const data = res.data || []


       const transformed = data.map((item, index) => {

           // venue_id로 카테고리 정보 찾기
          const catInfo = vcm.find(v => v.venue_id === item.venue_id);

          return{
            id: item.target_type == 'venue' ? item.venue_id : item.target_id,
            name: rankingType === 'staff' ? iauMasking(iau, item.name || '') : item.name || 'Unknown',
            rating: parseFloat(item.avg_rating || 0).toFixed(1),
            image: item.image_url,
            address: iauMasking(iau, item.address || ''),
            opening_hours: rankingType === 'venue' ? `${item.open_time}~${item.close_time}` : null,
            schedule_status: item.is_open,
            is_reservation: item.is_open === 'available',
            reservation_count: item.reservation_cnt || 0,
            view_cnt: item.view_cnt || 0,
            staff_cnt: rankingType === 'venue' ? item.staff_cnt : null,
            venue_name: rankingType === 'staff' ? item.venue_name : null,
            venue_id: item.venue_id,
            cat_nm: catInfo?.cat_nm || 'UNKNOWN', // venueCatMap에서 가져온 카테고리
            cat_id: catInfo?.cat_id || 'UNKNOWN',
            rank: index + 1,
            latest_staff_created_at: item.latest_staff_created_at,
            isUpdated : isUpdated(item.latest_staff_created_at),
            isFavorite: fvrsSet.has(item.target_type == 'venue' ? item.venue_id : item.target_id),
            score: calculateRankingScore(item),
            opening_status: getOpeningStatus({
              open_time : item.open_time, 
              close_time : item.close_time, 
              schedule_status : item.is_open
            })
       };
    });


        console.log('rank', fvrsSet, transformed, data);

        // 이전 페이지에 따른 카테고리 필터링
        let filteredData = transformed;

        console.log("rankingFromPage", rankingFromPage);
        
        if (rankingFromPage === 'BARLIST') {
          filteredData = transformed.filter(venue => venue.cat_id === 1);
        } else if (rankingFromPage === 'MASSAGELIST') {
          filteredData = transformed.filter(venue => 
            venue.cat_id === 2 || venue.cat_id === 3
          );
        }


         const topRank = 100;
        // data = data.slice(0, topRank);

        filteredData = filteredData.map((item, index) => ({
          ...item,
          rank: index + 1
        }));

        filteredData = filteredData.slice(0, 100);

        // // 점수 기준으로 정렬
        // transformed.sort((a, b) => b.score - a.score);

        // // 순위 재설정
        // transformed.forEach((item, index) => {
        //   item.rank = index + 1;
        // });

        setOriginalData(filteredData);  // 필터링된 데이터로 변경
        setRankingData(filteredData);

      } catch (err) {
        console.error('랭킹 데이터 가져오기 실패:', err);
      } finally {
        setIsApiLoading(false);
      }
    };

    const init = async () => {
      if (messages && Object.keys(messages).length > 0) {
        if (!localStorage.getItem('rankScrollY')) {
          window.scrollTo(0, 0);
        }

        if (rankingType !== 'none') {


          if (rankingType != localStorage.getItem('rankingType')) {
            localStorage.setItem('rankScrollRatio', 0);
            localStorage.setItem('rankScrollY', 0);
            window.scrollTo(0, 0);
          }

          localStorage.setItem('rankingType', rankingType); // 필터 정보 저장

        }
      }

      await fetchRankingData();


    };

    init();
  }, [messages, rankingType, timeFilter]);

  // 검색 필터링
  useEffect(() => {
    let filtered = [...originalData];

    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setRankingData(filtered);

  }, [searchQuery, originalData]);


  const isUpdated = (created_at) => {
    try {
      // 문자열 → Date 변환
      const parsedDate = new Date(created_at.replace(" ", "T"));
      if (isNaN(parsedDate.getTime())) {
        return false; // 파싱 실패
      }

      // 현재 시각
      const now = Date.now();
      // 7일(ms 단위)
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      // 최신 여부 판단
      return (now - parsedDate.getTime()) <= sevenDays;
    } catch (e) {
      return false; // 예외 발생 시 false
    }
  };


  const toggleFavorite = async (item) => {

    setRankingData((prev) =>
      prev.map((spot) =>
        spot.id === item.id ? { ...spot, isFavorite: !spot.isFavorite } : spot
      )
    );

    console.log('toggle', item);

    const isNowFavorite = !item.isFavorite;
  
    try {

      await ApiClient.get(`/api/${isNowFavorite ? 'insertFavorite' : 'deleteFavorite'}`, {
        params: {
          user_id: user?.user_id || 1,
          target_type: rankingType,
          target_id: item.id
        },
      });
  
    } catch (error) {
      console.error('즐겨찾기 API 호출 실패:', error);
    }
  };



  const handleDiscover = async (item) => {
    console.log("item", item)


    const container = document.querySelector('.content-area');

    if (container) {
      const scrollY = container.scrollTop;
      localStorage.setItem('rankScrollY', scrollY.toString());
      localStorage.setItem('discoverScrollY', '0');
      console.log("✅ savedScrollY from .content-area:", scrollY);


      const scrollRatio = container.scrollTop / (container.scrollHeight - container.clientHeight);
      localStorage.setItem('rankScrollRatio', scrollRatio);


      console.log('스크롤 비율 저장됨 scrollTop:', container.scrollTop);
      console.log('스크롤 비율 저장됨 scrollHeight :', container.scrollHeight);
      console.log('스크롤 비율 저장됨 clientHeight:', container.clientHeight);
      console.log('스크롤 비율 저장됨:', scrollRatio);
    }



    if (rankingType === 'venue') {

      showAdWithCallback(
        // 광고 완료 시 콜백
        () => {
          navigateToPageWithData(PAGES.DISCOVER, { venueId: item.id });
        },
        // fallback 콜백 (광고 응답 없을 때)
        () => {
          navigateToPageWithData(PAGES.DISCOVER, { venueId: item.id });
        },
        1000 // 1초 타임아웃
      );


      // navigateToPageWithData(PAGES.DISCOVER, { venueId: item.id });
    } else {



      const iau = await isActiveUser();
      iau.onlyMasking = true;



      showAdWithCallback(
        // 광고 완료 시 콜백
        () => {
          navigateToPageWithData(PAGES.STAFFDETAIL, {
            staff_id: item.id,  // staffId → staff_id로 변경
            venue_id: item.venue_id,
            vn_schedule_status: false,
            fromReview: true   // 데이터 fetch를 위해 필요

          });
        },
        // fallback 콜백 (광고 응답 없을 때)
        () => {
          navigateToPageWithData(PAGES.STAFFDETAIL, {
            staff_id: item.id,  // staffId → staff_id로 변경
            venue_id: item.venue_id,
            vn_schedule_status: false,
            fromReview: true   // 데이터 fetch를 위해 필요
          });
        },
        1000 // 1초 타임아웃
      );

      /*
      // 스탭 상세 페이지로 이동
      navigateToPageWithData(PAGES.STAFFDETAIL, { 
        staff_id: item.id,  // staffId → staff_id로 변경
        venue_id:item.venue_id,
        fromReview: true   // 데이터 fetch를 위해 필요
      });
      */
    }
  };

  // 순위별 색상 반환
  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#ca9b00ff'; // 금색
      case 2: return '#928c8cff'; // 은색  
      case 3: return '#dd8e3eff'; // 동색
      default: return '#6B7280'; // 회색
    }
  };

  const getRankIcon = (rank) => {
    if (rank <= 3) {
      const rankImgSrc = `/cdn/rank${rank}.png`;

      return (
        <div style={{

        }}>
          {/* 숫자 (숨겨도 되지만 DOM 유지) */}

          {/* 아이콘이 숫자를 덮는 오버레이 */}
          <img
            src={rankImgSrc}
            alt={`rank${rank}`}
            style={{
              position: 'absolute',
              top: '0%',
              left: '0%',
              transform: 'translate(-50%, -50%)',
              width: '50Px',
              height: '50px',
              zIndex: 2,
              opacity: 1,
              animation: rank === 1 ? 'goldTrophy 2s ease-in-out infinite' :
                rank === 2 ? 'silverTrophy 2.5s ease-in-out infinite' :
                  'bronzeTrophy 3s ease-in-out infinite'
            }}
          />
        </div>
      );
    } else {
      // 4등 이상 → 숫자만
      return (
        <span style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: getRankColor(rank)
        }}>
          {rank}
        </span>
      );
    }
  };



  const formatTime = (t) => {
    if (!t || typeof t !== 'string') return '';
    const [h, m] = t.split(':');
    return `${h}:${m}`;
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
        .ranking-container {
          background: #f9fafb;
          font-family: 'BMHanna', 'Comic Sans MS';
        }

       

        .search-container{margin-bottom: 1rem !important;}

       
        
        .filter-tabs {
          display: flex;
          gap: 12px;
        }
        .filter-tab {
          padding: 8px 10px;
          border: 1px solid #333;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          color: #333;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-tab.active {
          background: #374151;
          color: white;
        }
        .filter-selects {
          display: flex;
          gap: 12px;
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
          min-width: 100px;
          background-image: url("data:image/svg+xml,%3Csvg fill='black' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.5 7l4.5 4 4.5-4'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 12px;
        }
        .content-section {
          padding: 20px 10px;
        }
        .ranking-card {
          border: 1px solid #333;
          border-radius: 10px;
          overflow: hidden;
          background: white;
          margin-bottom: 1rem;
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.6rem;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .ranking-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .score-badge {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: linear-gradient(135deg, #00f0ff, #fff0d8);
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 0.75rem;
          font-weight: bold;
          z-index: 2;
        }
        .image-container {
          flex: 0 0 100px;
          width: 100px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          border: 1px solid #333;
        }


        .ranking-card.rank-1 .image-container {
          flex: 0 0 120px;
          width: 120px;
          height: 120px;
          left : 0%;
        }

        .ranking-card.rank-2 .image-container {
          flex: 0 0 120px;
          width: 120px;
          height: 120px;
        }

        .ranking-card.rank-3 .image-container {
          flex: 0 0 120px;
          width: 120px;
          height: 120px;
        }

      .ranking-card.rank-1 .rank-number,
      .ranking-card.rank-2 .rank-number,
      .ranking-card.rank-3 .rank-number {
        flex: 0 0 0;
        width: 0;
        margin: 0;
        padding: 0;
      }

          
        .content-area {
          flex: 1;
          position: relative;
        }
        .rank-number {
          flex: 0 0 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
        }
        .stats-row {
          display: flex;
          gap: 16px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .stats-row-2 {
          display: flex;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #666;
        }

        /* 트로피 애니메이션 */
        @keyframes goldTrophy {
          0%, 100% { 
            transform: rotate(0deg) scale(1);
            filter: drop-shadow(0 0 3px #FFD700);
          }
          25% { 
            transform: rotate(-5deg) scale(1.1);
            filter: drop-shadow(0 0 8px #FFD700);
          }
          50% { 
            transform: rotate(0deg) scale(1.15);
            filter: drop-shadow(0 0 12px #FFD700);
          }
          75% { 
            transform: rotate(5deg) scale(1.1);
            filter: drop-shadow(0 0 8px #FFD700);
          }
        }

        @keyframes silverTrophy {
          0%, 100% { 
            transform: translateY(0px) scale(1);
            filter: drop-shadow(0 0 2px #C0C0C0);
          }
          50% { 
            transform: translateY(-3px) scale(1.05);
            filter: drop-shadow(0 0 6px #C0C0C0);
          }
        }

        @keyframes bronzeTrophy {
          0%, 100% { 
            transform: rotate(0deg);
            filter: drop-shadow(0 0 1px #CD7F32);
          }
          33% { 
            transform: rotate(-2deg);
            filter: drop-shadow(0 0 3px #CD7F32);
          }
          66% { 
            transform: rotate(2deg);
            filter: drop-shadow(0 0 3px #CD7F32);
          }
        }

       
         /* 1위 카드*/
        .ranking-card.rank-1 {
            background: linear-gradient(38deg, #fffef8ff, #feff9b, #ffffff);
            border: 2px solid #ffcc3f;
            position: relative;
            overflow: hidden;
        }
       
        /* 2위 카드 - 실버 그라디언트 */
        .ranking-card.rank-2 {
           background: linear-gradient(38deg, #ffffff70, #c3c3c370, #ffffff90);
            border: 2px solid #bdbdbd;
            box-shadow: 0 2px 8px rgba(192, 192, 192, 0.3);
        }

        /* 3위 카드 - 브론즈 그라디언트 */
        .ranking-card.rank-3 {
            background: linear-gradient(38deg, #fff3e870, #ffddc070, #ffffff90);
            border: 2px solid #ffab55;
            box-shadow: 0 2px 8px rgba(205, 127, 50, 0.3);
        }
        .page-header {
            display: none !important;
          }
      `}</style>

      <div className="ranking-container">
        <SketchHeader onBack={handleBack} style={{ display: 'none' }} />
        {/* 헤더 섹션 */}
        <section className="hero-section">
          <HatchPattern opacity={0.3} />
          <h1 className="hero-title">
            {get('ranking_title_text')}
          </h1>
          <SketchSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder={rankingType === 'venue' ? get('ranking_search_venue') : get('ranking_search_staff')}
          />
          <div className="filter-tabs">
            {/* 기간 필터 */}
            <div className="filter-selects">
              <select
                className="select-box"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">{get('btn.all.1') || '전체'}</option>
                <option value="week">{get('WORK_SCHEDULE_WEEK') || '주간'}</option>
                <option value="month">{get('WORK_SCHEDULE_MONTH') || '월간'}</option>
              </select>
            </div>

            <div
              className={`filter-tab ${rankingType === 'venue' ? 'active' : ''}`}
              onClick={() => setRankingType('venue')}
            >
              {get('ranking.venue.title') || '매장 랭킹'}
            </div>
            <div
              className={`filter-tab ${rankingType === 'staff' ? 'active' : ''}`}
              onClick={() => setRankingType('staff')}
            >
              {get('ranking.staff.title') || '스탭 랭킹'}
            </div>
          </div>
        </section>

        {/* 필터 섹션 */}

        <section className="filter-section">
          <HatchPattern opacity={0.2} />

          {/* 랭킹 타입 선택 */}

        </section>

        {/* 랭킹 리스트 */}
        <section className="content-section">
  {rankingData.flatMap((item, index) => {
    const elements = [];
    const isOverlayStyle = index >= 3;

    const openTime = formatTime(item.opening_hours?.split('~')[0]);
    const closeTime = formatTime(item.opening_hours?.split('~')[1]);
    const openHoursText = item.opening_hours ? `${openTime} ~ ${closeTime}` : '';

    const shouldShowDailyPass = () => {
      const currentIndex = index + 1;
      if (currentIndex === 3) return true;
      if (currentIndex > 3) return (currentIndex - 3) % 10 === 0;
      return false;
    };

    // ① 랭킹 카드 구성
    elements.push(
      <React.Fragment key={`item-${item.id}`}>
        <div
          className={`ranking-card ${item.rank <= 3 ? `rank-${item.rank}` : ''}`}
          onClick={() => handleDiscover(item)}
        >
          {/* 순위 표시 */}
          <div className="rank-number">
            {getRankIcon(item.rank)}
          </div>

          {/* 이미지 영역 */}
          <div className="image-container" style={{ position: 'relative' }}>
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {/* 즐겨찾기 하트 버튼 */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(item);
              }}
              style={{
                position: 'absolute',
                right: 3,
                top: 3,
              }}
            >
              <Heart size={22} fill={item.isFavorite ? '#f43f5e' : 'none'} color="white" />
            </div>

            {/* UPDATED 오버레이 */}
            {item.isUpdated && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '6px 8px',
                  backgroundColor: 'rgba(255, 0, 0, 0.7)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  borderBottomLeftRadius: '4px',
                  borderBottomRightRadius: '4px',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              >
                UPDATED!!
              </div>
            )}
          </div>

          {/* 콘텐츠 영역 */}
          <div className="rank-content-area">
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {item.name}
              {rankingType === 'staff' && item.venue_name && (
                <span
                  style={{
                    fontSize: '11px',
                    color: '#666',
                    marginLeft: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  @ {item.venue_name}
                  <span style={{ display: 'inline-flex', marginLeft: '4px' }}>
                    {/* 영업 상태 */}
                    <span
                      style={{
                        backgroundColor:
                          item.opening_status?.opening_status === 'open'
                            ? 'rgb(11, 199, 97)'
                            : 'rgb(107, 107, 107)',
                        color: '#fff',
                        padding: '3px 5px',
                        borderRadius: '3px',
                        fontSize: '9px',
                        lineHeight: '1',
                        marginLeft: '4px',
                      }}
                    >
                      {get(item.opening_status?.msg_code)}
                    </span>

                    {/* 예약 가능 여부 */}
                    <span
                      style={{
                        backgroundColor:
                          item.schedule_status === 'available'
                            ? 'rgb(11, 199, 97)'
                            : 'rgb(107, 107, 107)',
                        color: '#fff',
                        padding: '3px 5px',
                        borderRadius: '3px',
                        fontSize: '9px',
                        lineHeight: '1',
                        marginLeft: '2px',
                      }}
                    >
                      {item.schedule_status === 'available'
                        ? get('DiscoverPage1.1.able')
                        : get('DiscoverPage1.1.disable')}
                    </span>
                  </span>
                </span>
              )}
            </div>

            {/* venue일 경우 주소 + 통계 표시 */}
            {rankingType === 'venue' && item.address && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {item.address}
              </div>
            )}

            <div className="stats-row">
              {rankingType === 'venue' && (
                <div className="stat-item">
                  <Users size={12} />
                  {get('title.text.16')} {item.staff_cnt}{get('Reservation.PersonUnit')}
                </div>
              )}
              <div className="stat-item">
                <Star size={12} style={{ fill: '#ffe800' }} />
                {item.rating}
              </div>
            </div>

            <div className="stats-row-2">
              <div className="stat-item">
                <Calendar size={12} />
                {`${timeFilter == 'week' ? get('WORK_SCHEDULE_WEEK') : timeFilter == 'month' ? get('WORK_SCHEDULE_MONTH') : ''}` + ' ' + get('btn.booking.1') + ' '}
                {item.reservation_count}{' ' + get('text.cnt.1')}
              </div>
              <div className="stat-item">
                <Eye size={12} />
                {`${timeFilter == 'week' ? get('WORK_SCHEDULE_WEEK') : timeFilter == 'month' ? get('WORK_SCHEDULE_MONTH') : ''}` + ' ' + get('ranking_veiw_text')}
                {' ' + item.view_cnt.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* 일일 이용권 안내 */}
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

    // ② 중간 프로모션 카드 삽입 로직
    //const randomInterval = 4 + Math.floor(Math.random() * 4);
    if ((index + 1) % promoInterval === 0 && index !== 0) {
      if (iauData?.isActiveUser === true) return elements;

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

  {rankingData.length === 0 && (
    <div
      style={{
        textAlign: 'center',
        padding: '2rem',
        color: '#666',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #ddd',
      }}
    >
      {get('title.text.17')}
    </div>
  )}
</section>



        <LoadingScreen
          variant="cocktail"
          loadingText="Loading..."
          isVisible={isApiLoading}
        />
      </div>

    </>
  );
};

export default Ranking;