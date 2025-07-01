// 전체 상단 import는 동일
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Star, Heart, ArrowRight, Clock, MapPin,  MoveLeft } from 'lucide-react';
import GoogleMapComponent from '@components/GoogleMapComponent';
import ImagePlaceholder from '@components/ImagePlaceholder';
import SketchSearch from '@components/SketchSearch';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import { useAuth } from '../contexts/AuthContext';
import { useMsg } from '@contexts/MsgContext';
import LoadingScreen from '@components/LoadingScreen';
import { useNavigate } from 'react-router-dom';

const HomePage = ({ navigateToMap, navigateToSearch, navigateToPageWithData, PAGES }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hotspots, setHotspots] = useState([]);
  const [originalHotspots, setOriginalHotspots] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortRating, setSortRating] = useState('RATING_ALL');
  const [sortPrice, setSortPrice] = useState('PRICE_ALL');
  const [sortStaff, setSortStaff] = useState('STAFF_ALL');
  const [staffLanguageFilter, setStaffLanguageFilter] = useState('ALL');
  const navigate = useNavigate();
  const [isReservationOnly, setIsReservationOnly] = useState(false); // ✅ 이 변수만 사용
  const { messages, get, currentLang, isLoading } = useMsg();
  const { user } = useAuth();
  const [favorites, setFavorits] = useState([]);

  useEffect(() => {
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

        const transformed = data.map((item, index) => ({
          id: item.venue_id || index,
          name: item.name || 'Unknown',
          rating: parseFloat(item.rating || 0).toFixed(1),
          image: item.image_url,
          address: item.address || '',
          opening_hours: `${item.open_time}~${item.close_time}` || '정보 없음',
          isFavorite: favoriteIds.has(item.venue_id),
          cat_nm: item.cat_nm || 'UNKNOWN',
          created_at: new Date(item.created_at || '2000-01-01'),
          price: item.price || 0,
          staff_cnt: item.staff_cnt || 0,
          is_reservation: item.is_reservation === true,
          staff_languages: item.staff_languages || '', // ✅ 이 줄 추가
        }));

        setOriginalHotspots(transformed);
        setHotspots(transformed);
      } catch (err) {
        console.error('장소 정보 실패:', err);
      }
    };

    const init = async () => {
      if (messages && Object.keys(messages).length > 0) {
        window.scrollTo(0, 0);
      }
      const favoritesData = await fetchFavorits();
      setFavorits(favoritesData);
      await fetchHotspots(favoritesData);
    };

    init();
  }, [messages, currentLang]);

  const handleGoBack = () => {
    navigate(-1); // 브라우저 히스토리에서 한 단계 뒤로
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

    // ✅ 예약 가능 필터 조건 추가
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
  }, [searchQuery, categoryFilter, sortRating, sortPrice, sortStaff, isReservationOnly,staffLanguageFilter]); // ✅ 여기도 의존성 추가

  const handleDiscover = (venueId) => {
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

  return (
    <>
      <style jsx="true">{`
      
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
          margin-bottom: 1.5rem;
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

      `}</style>
{/* <button onClick={handleGoBack} style={{
        position: 'fixed',
        bottom: '145px',
        right: '11px',
        zIndex: 1000,
        background: 'white',
        border: '1px solid #333',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}>
        < MoveLeft size={16} />
      </button> */}
      <div className="homepage-container">
        <section className="hero-section">
          <HatchPattern opacity={0.3} />
          <h1 className="hero-title">{get('HomePage1.1')}</h1>
          <SketchSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={() =>
              filterAndSortHotspots(searchQuery, categoryFilter, sortRating, sortPrice, sortStaff)
            }
            style={{ marginTop: 0, marginBottom: 0 }}
          />
          <div className="filter-selects">
            <select 
              style={{'display':'none'}}
              className="select-box" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">{get('main.filter.category.all')}</option>
              <option value="BAR">{get('main.filter.category.bar')}</option>
              <option value="RESTAURANT">{get('main.filter.category.restaurant')}</option>
            </select>
            <select className="select-box" value={sortRating} onChange={(e) => setSortRating(e.target.value)}>
              <option value="RATING_ALL">{get('main.filter.rating.all')}</option>
              <option value="RATING_5">{get('main.filter.rating.5plus')}</option>
              <option value="RATING_4">{get('main.filter.rating.4plus')}</option>
              <option value="RATING_3">{get('main.filter.rating.3plus')}</option>
            </select>
             
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isReservationOnly}
              onChange={(e) => setIsReservationOnly(e.target.checked)}
              style={{ transform: 'scale(1.1)' }}
            />
            {get('main.filter.reservation.available')}
          </label>
        </section>
        

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

    return (
      <div
        className="card"
        key={spot.id}
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
        {/* 이미지 */}
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

          {/* 공통 하트 위치 */}
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

          {/* 평점 뱃지 (1~3번째만) */}
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
                    backgroundColor: spot.is_reservation ? 'rgb(17 157 81)' : 'rgb(107 107 107)',
                    color: '#fff',
                    padding: '5px 7px',
                    borderRadius: '3px',
                    display: 'inline-block',
                    marginTop: '4px',
                    fontSize: '12px',
                    height: '13px'
                  }}
                >
                  {spot.is_reservation ? get('DiscoverPage1.1.able') : get('DiscoverPage1.1.disable')}
                </div>
            <div style={{ fontSize: '14px', color: '#333', marginTop: '6px' }}>
              <MapPin size={14}/> {spot.address}
            </div>
            <div style={{ fontSize: '14px', color: '#555', marginTop: '4px' }}>
              <Clock size={14}/> {openHoursText}  / <Users size={14}/> {spot.staff_cnt} {get('title.text.16')}
            </div>

            {/* 평점 (4번째부터만) */}
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
    );
  })}
</section>

      </div>
    </>
  );
};

export default HomePage;
