import React, { useState, useEffect } from 'react';
import { Users, Star, Clock, MapPin, Trophy, Eye, Calendar } from 'lucide-react';
import SketchSearch from '@components/SketchSearch';
import HatchPattern from '@components/HatchPattern';
import { useAuth } from '../contexts/AuthContext';
import { useMsg } from '@contexts/MsgContext';
import LoadingScreen from '@components/LoadingScreen';
import ApiClient from '@utils/ApiClient';
import SketchHeader from '@components/SketchHeaderMain';

import Swal from 'sweetalert2';



const Ranking = ({ navigateToPageWithData, PAGES, goBack, showAdWithCallback, ...otherProps }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rankingData, setRankingData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [rankingType, setRankingType] = useState('none'); // 'venue' or 'staff'
  const [timeFilter, setTimeFilter] = useState('week'); // 'day', 'week', 'month'
  const { messages, get, isLoading } = useMsg();
  const { user, isActiveUser, iauMasking } = useAuth();
  const [isApiLoading, setIsApiLoading] = useState(false);

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
        // iau.onlyMasking = true;

        //실제 API 호출 (현재는 주석 처리)
        const res = await ApiClient.postForm('/api/getRank', {
          target_type: rankingType,
          timeFilter: timeFilter
        });
       
       // 최대 랭킹
        const topRank = 10;
        //const data = (res.data || []).slice(0, topRank);
        const data = res.data || []


        const transformed = data.map((item, index) => ({
          id: item.target_type == 'venue' ? item.venue_id : item.target_id,
          name: rankingType === 'staff' ? iauMasking(iau, item.name || '') : item.name || 'Unknown',
          rating: parseFloat(item.rating || 0).toFixed(1),
          image: item.image_url,
          address: iauMasking(iau, item.address || ''),
          opening_hours: rankingType === 'venue' ? `${item.open_time}~${item.close_time}` : null,
          schedule_status: item.is_open,
          is_reservation: item.is_open === 'available',
          reservation_count: item.reservation_cnt || 0,
          view_cnt: item.view_cnt || 0,
          staff_cnt: rankingType === 'venue' ? item.staff_cnt : null,
          venue_name: rankingType === 'staff' ? item.venue_name : null,
          venue_id : item.venue_id,
          rank: index + 1,
          score: calculateRankingScore(item)
        }));

        
        console.log('rank', transformed, data);

        // // 점수 기준으로 정렬
        // transformed.sort((a, b) => b.score - a.score);
        
        // // 순위 재설정
        // transformed.forEach((item, index) => {
        //   item.rank = index + 1;
        // });

        setOriginalData(transformed);
        setRankingData(transformed);
        
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
       
        
        if (rankingType != localStorage.getItem('rankingType') ){
          localStorage.setItem('rankScrollRatio',0);
          localStorage.setItem('rankScrollY',0);
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
            venue_id:item.venue_id,
            vn_schedule_status:false,
            fromReview: true   // 데이터 fetch를 위해 필요
            
          });
        },
        // fallback 콜백 (광고 응답 없을 때)
        () => {
          navigateToPageWithData(PAGES.STAFFDETAIL, { 
            staff_id: item.id,  // staffId → staff_id로 변경
            venue_id:item.venue_id,
            vn_schedule_status:false,
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

  // 순위별 아이콘
  const getRankIcon = (rank) => {
  if (rank <= 3) {
    const rankImgSrc = `/cdn/rank${rank}.png`;

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '2px'
      }}>
        <span style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          color: getRankColor(rank)
        }}>
          {rank}{get('ranking_number')}
        </span>
        <img 
          src={rankImgSrc} 
          alt={`rank${rank}`} 
          style={{ 
            width: '35px', 
            height: '35px',
            animation: rank === 1 ? 'goldTrophy 2s ease-in-out infinite' : 
                      rank === 2 ? 'silverTrophy 2.5s ease-in-out infinite' :
                      'bronzeTrophy 3s ease-in-out infinite'
          }} 
        />
      </div>
    );
  }

  return <span style={{ color: '#6B7280', fontWeight: 'bold', fontSize: '18px' }}>{rank}</span>;
};


  const formatTime = (t) => {
    if (!t || typeof t !== 'string') return '';
    const [h, m] = t.split(':');
    return `${h}:${m}`;
  };

  return (
    <>
      <style jsx>{`
        .ranking-container {
          background: #f9fafb;
          font-family: 'BMHanna', 'Comic Sans MS';
          padding-bottom: 3rem;
        }

        .search-container{margin-bottom: 1rem !important;}

        .hero-section {
          padding: 1rem 1.5rem 1.5rem;
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .filter-tabs {
          display: flex;
          gap: 12px;
        }
        .filter-tab {
          padding: 8px 16px;
          border: 1px solid #333;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          color: #333;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-tab.active {
          background: #333;
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
            placeholder={rankingType === 'venue' ? get('ranking_search_venue')  : get('ranking_search_staff')}
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
          {rankingData.map((item) => {
            const openTime = formatTime(item.opening_hours?.split('~')[0]);
            const closeTime = formatTime(item.opening_hours?.split('~')[1]);
            const openHoursText = item.opening_hours ? `${openTime} ~ ${closeTime}` : '';

            return (
              <div
                key={item.id}
                className={`ranking-card ${item.rank <= 3 ? `rank-${item.rank}` : ''}`}
                onClick={() => handleDiscover(item)}
              >
                {/* 순위 표시 */}
                <div className="rank-number">
                  {getRankIcon(item.rank)}
                </div>

                {/* 이미지 영역 */}
                <div className="image-container">
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />

                  {/* 점수 배지 */}
                  <div className="score-badge" style={{display: 'none'}}>
                    {item.score}점
                  </div>
                </div>

                {/* 콘텐츠 영역 */}
                <div className="rank-content-area">
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {item.name}
                    {rankingType === 'staff' && item.venue_name && (
                      <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                        @ {item.venue_name}
                      </span>
                    )}
                  </div>

                  {/* 영업 상태 (매장만) */}
                  {rankingType === 'venue' && (
                    /*
                    <div
                      style={{
                        backgroundColor:
                          item.schedule_status === 'closed' || item.schedule_status === 'before_open'
                            ? 'rgb(107, 107, 107)'
                            : item.is_reservation
                            ? 'rgb(11, 199, 97)'
                            : 'rgb(107, 107, 107)',
                        color: '#fff',
                        padding: '4px 6px',
                        borderRadius: '3px',
                        display: 'inline-block',
                        marginTop: '4px',
                        fontSize: '11px'
                      }}
                    >
                      {item.schedule_status === 'closed' || item.schedule_status === 'before_open'
                        ? get('VENUE_END') || '영업종료'
                        : (item.is_reservation ? get('DiscoverPage1.1.able') || '예약가능' : get('DiscoverPage1.1.disable') || '예약불가')}
                    </div>
                    */
                    <div
                        className="is-reservation"
                        style={{
                          backgroundColor:
                          item.schedule_status === 'available'
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

                      {item.schedule_status === 'available'
                          ? get('DiscoverPage1.1.able')  // 예약가능
                          : get('VENUE_END') // 영업종료
                      }  
                      </div>
                  )}

                  {/* 주소 (매장만) */}
                  {rankingType === 'venue' && item.address && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                       {item.address}
                    </div>
                  )}

                  {/* 통계 정보 */}
                  <div className="stats-row">
                    <div className="stat-item">
                      <Star size={12} style={{ fill: '#ffe800' }} />
                      {item.rating}
                    </div>
                    <div className="stat-item">
                      <Calendar size={12} />
                      {get('btn.booking.1')} {item.reservation_count}{get('text.cnt.1')}
                    </div>
                    <div className="stat-item">
                      <Eye size={12} />
                      {get('ranking_veiw_text')} {item.view_cnt.toLocaleString()}
                    </div>
                    {rankingType === 'venue' && item.staff_cnt != null && (
                      <div className="stat-item">
                        <Users size={12} />
                        {get('title.text.16')} {item.staff_cnt}{get('Reservation.PersonUnit')}
                      </div>
                    )}
                    {/* {rankingType === 'venue' && openHoursText && (
                      <div className="stat-item">
                        <Clock size={12} />
                        {openHoursText}
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            );
          })}

          {rankingData.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: '#666',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
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