import React, { useCallback , useState, useEffect, useRef } from 'react';
import axios from 'axios';

import SketchSearch from '@components/SketchSearch';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import GoogleMapComponent from '@components/GoogleMapComponent';
import LoadingScreen from '@components/LoadingScreen';
import SketchHeader from '@components/SketchHeaderMain'
import SketchBtn from '@components/SketchBtn';

import { useMsg } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';
import { Users, Star, Heart, ArrowRight, Clock, MapPin, CreditCard, Phone, Locate  } from 'lucide-react';

const MapPage = ({ onVenueSelect = () => {}, navigateToPage, navigateToPageWithData, PAGES, goBack, onSearch = () => {}, initialKeyword = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialKeyword);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [places, setPlaces] = useState([]);
  const [originalPlaces, setOriginalPlaces] = useState([]);
  const [venueCount, setVenueCount] = useState(0);
  const [showVenueList, setShowVenueList] = useState(false);
  const [markerSelectedVenue, setMarkerSelectedVenue] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortRating, setSortRating] = useState('RATING_ALL');
  const [sortPrice, setSortPrice] = useState('PRICE_ALL');
  const [sortStaff, setSortStaff] = useState('STAFF_ALL');
  const [isReservationOnly, setIsReservationOnly] = useState(false);
  const [staffLanguageFilter, setStaffLanguageFilter] = useState('ALL');

  const [pressed, setPressed] = useState(false);

  const inputRef = useRef(null);

  const mapRef = useRef(null);
  
  const { messages, isLoading, get, currentLang } = useMsg();
  const { iauMasking, isActiveUser } = useAuth();

  const handleBack = () =>{
    navigateToPage(PAGES.HOME);
  }

  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) window.scrollTo(0, 0);
    if (initialKeyword) fetchPlaces(initialKeyword);
    else fetchPlaces();
  }, [initialKeyword, messages, currentLang]);

  const fetchPlaces = async (keyword = '') => {
    try {
      const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
      const response = await axios.get(`${API_HOST}/api/getVenueList`, { params: { keyword } });
      let venueList = response.data || [];

      const iau = await isActiveUser();
      
      const themeSource = localStorage.getItem('themeSource');
      const currentCategory = localStorage.getItem('currentVenueCategory');

      console.log("1234:"+themeSource);


  if (themeSource === 'BARLIST') {
    venueList = venueList.filter(v => v.cat_nm === 'BAR');
  } else if (themeSource === 'MASSAGELIST') {
    venueList = venueList.filter(v => v.cat_nm === 'SALON');
  }
      
      // 구독 정보 확인 및 주소 마스킹 적용
      const processedVenueList = venueList.map(item => ({
        ...item,
        phone: iauMasking(iau, item.phone || ''),
        address: iauMasking(iau, item.address || ''),
        isActiveUser: iau?.isActiveUser || false // 마스킹 컴포넌트에서 사용
      }));
      
      setOriginalPlaces(processedVenueList);
      applyFilters(processedVenueList);
      if (inputRef.current) inputRef.current.blur();
    } catch (error) {
      console.error('장소 목록 불러오기 실패:', error);
    }
  };

  const applyFilters = (baseList) => {
    let filtered = [...baseList];
    if (categoryFilter !== 'ALL') filtered = filtered.filter((v) => v.cat_nm === categoryFilter);
    if (sortRating === 'RATING_5') filtered = filtered.filter((v) => parseFloat(v.rating) <= 5);
    else if (sortRating === 'RATING_4') filtered = filtered.filter((v) => parseFloat(v.rating) <= 4);
    else if (sortRating === 'RATING_3') filtered = filtered.filter((v) => parseFloat(v.rating) <= 3);
    if (sortPrice === 'PRICE_LOW') filtered.sort((a, b) => a.price - b.price);
    else if (sortPrice === 'PRICE_HIGH') filtered.sort((a, b) => b.price - a.price);
    if (sortStaff === 'STAFF_10') filtered = filtered.filter((v) => v.staff_cnt >= 10);
    else if (sortStaff === 'STAFF_5') filtered = filtered.filter((v) => v.staff_cnt >= 5);
    else if (sortStaff === 'STAFF_3') filtered = filtered.filter((v) => v.staff_cnt >= 3);

    if (staffLanguageFilter !== 'ALL') {
    filtered = filtered.filter((v) =>
      typeof v.staff_languages === 'string' && v.staff_languages.includes(staffLanguageFilter)
    );
  }

    if (isReservationOnly) {
      filtered = filtered.filter((v) => v.is_reservation === true);
    }

    setPlaces(filtered);
    setVenueCount(filtered.length);
    setSelectedVenue(null);
    setShowVenueList(false);
  };

  useEffect(() => {
    applyFilters(originalPlaces);
  }, [categoryFilter, sortRating, sortPrice, sortStaff, isReservationOnly, staffLanguageFilter]);

  const handleSearch = () => {
    fetchPlaces(searchQuery);
    if (onSearch) onSearch(searchQuery);
    if (inputRef.current) inputRef.current.blur();
  };

  // 마스킹된 콘텐츠 렌더링 함수
  const renderMaskedContent = (content, isActive) => {
    // content가 문자열이 아니거나 비어있으면 그대로 반환
    if (!content || typeof content !== 'string') {
      return content;
    }

    if (isActive) {
      return content; // 활성 사용자는 전체 내용 표시
    }

    // 비활성 사용자는 마스킹된 내용 표시
    const visiblePart = content.substring(0, Math.floor(content.length * 0.4));
    
    return (
      <div className="masked-content-wrapper">
        <span className="visible-text">{visiblePart}</span>
        <div className="masked-section">
          <span className="masked-dots">***</span>
          <button 
            className="daily-pass-btn"
            onClick={(e) => {
              e.stopPropagation(); // 부모 클릭 이벤트 방지
              navigateToPageWithData(PAGES.PURCHASEPAGE);
            }}
          >
            {get('purchase.daily_pass.btn')}
          </button>
        </div>
      </div>
    );
  };

  const handleMyPositionClick = useCallback(() => {
    console.log('my position logic');
    // 여기서 map recenter 등 필요한 로직 수행
  }, []);

  return (
    <>
      <style jsx>{`
        .map-container { max-width: 28rem; margin: 0 auto; font-family: 'BMHanna', sans-serif; background-color: white; }
        .map-container-area { height: 88.7vh; position: relative; }
        .map-content-area { height: 100%; background: #f8fafc; position: relative; overflow: hidden; }
        .map-component-placeholder { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
        .map-search-overlay { position: absolute; top: 1rem; left: 1rem; right: 1rem; z-index: 50; }
        .map-filter-selects {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          gap: 12px;
          margin-top: 0.5rem;
          padding-right: 1rem;
          scrollbar-width: none;
        }
        .map-filter-selects::-webkit-scrollbar { display: none; }
        .select-box {
          padding: 8px 12px;
          border: 1px solid #333;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          min-width: 135px;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg fill='black' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.5 7l4.5 4 4.5-4'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 12px;
        }
        .checkbox-label {
          padding: 8px 12px;
          border: 0px solid #333;
          border-radius: 8px;
          font-size: 14px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          margin-top: 5px;
          margin-left: -4px;
          margin-bottom: -10px;
        }
        .map-venue-count-bottom {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 2rem);
          z-index: 35;
          display: none;
        }
        .venues-count {
          background: #f9fafb;
          padding: 0.75rem;
          border: 1px solid #1f2937;
          border-radius: 5px;
          text-align: center;
          font-weight: bold;
          cursor: pointer;
        }
        .venue-list-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 230px;
          background: #ffffff;
          z-index: 40;
          border-top: 1px solid #1f2937;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
        }
        .venue-list-scroll {
          height: 230px;
          overflow-y: auto;
          padding: 0.5rem;
        }
          
        .venue-list-item {
          height: 195px;
          margin-bottom: 1rem !important;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: #f9fafb;
          cursor: pointer;
        }

         .search-container  {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }
        .venue-list-item:hover { background-color: #f3f4f6; }
        .venue-name { font-size: 1.1rem; font-weight: bold; color: #1f2937; }
        .venue-details { font-size: 0.9rem; color: #4b5563; }

        .hidden-header {
          display: none !important;
        }

        /* 마스킹 콘텐츠 스타일 */
        .masked-content-wrapper {
          display: flex !important;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          width: 100%;
          min-height: 24px;
         
        }
        
        .visible-text {
          color: inherit;
          font-weight: 500;
          flex-shrink: 0;
        }
        
        .masked-section {
          //display: inline-flex;
          align-items: center;
          //gap: 6px;
          position: relative;
         // padding: 2px 8px;
          border-radius: 6px;
          //min-width: 140px;
          height: 24px;
          overflow: visible;
          flex-shrink: 0;
        }
        
        .masked-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          // background: linear-gradient(
          //   45deg,
          //   transparent,
          //   rgba(255, 255, 255, 0.6),
          //   transparent
          // );
          // animation: shimmer 2.5s infinite;
          z-index: 1;
          pointer-events: none;
          border-radius: 6px;
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        
        .masked-dots {
          color: #c9980e;
          font-weight: bold;
          font-size: 12px;
          letter-spacing: 1px;
          position: relative;
          z-index: 2;
        }
        
        .daily-pass-btn {
          color: #c9980e;
          background: rgba(255, 222, 75, 0.8);
          border: 1px solid rgba(201, 152, 14, 0.4);
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 9px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          position: relative;
          z-index: 2;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 80px;
              margin-left: 0.2rem;
        }
        
        .daily-pass-btn:hover {
          // background: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(201, 152, 14, 0.3);
        }
        
        .daily-pass-btn:active {
          transform: translateY(0);
        }
        
        /* 모바일 최적화 */
        @media (max-width: 480px) {
          .masked-content-wrapper {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
         
          
          .daily-pass-btn {
            font-size: 8px;
            padding: 2px 4px;
            min-width: 70px;
            height: 16px;
          }
        }
        
        /* 더 넓은 화면에서의 최적화 */
        @media (min-width: 481px) {
          .masked-section {
            min-width: 160px;
            padding: 3px 10px;
            height: 26px;
          }
          
          .daily-pass-btn {
            font-size: 10px;
            padding: 3px 8px;
            min-width: 90px;
            height: 20px;
          }
        }

      `}</style>

<div style={{ display: 'none' }}>
  <SketchHeader 
    title={get('btn.searchMap.1.1')}
    showBack={true}
    onBack={handleBack}
    rightButtons={[]}
  />
</div>

      <div className="map-container">
        <div className="map-container-area">
          <SketchDiv className="map-content-area">
            <HatchPattern opacity={0.05} />
            <div className="map-component-placeholder">
              <GoogleMapComponent
                places={places}
                showEntrances={true}
                ref={mapRef}
                onMyPositionClick={handleMyPositionClick}
                onMarkerClick={(venue) => {
                   if (venue.isEntrance) {
                    // 입구 클릭 시 처리 - 리스트만 표시하고 상세 정보는 표시하지 않음
                    console.log("입구 클릭:", venue.name, venue.address);
                    setMarkerSelectedVenue(venue);
                    setShowVenueList(true);
                  } else {
                    // 일반 장소 클릭 시 기존 처리
                    setMarkerSelectedVenue(venue);
                    setShowVenueList(true);
                  }
                }}
                onMapClick={() => {
                 setShowVenueList(false);
                setMarkerSelectedVenue(null);
                setSelectedVenue(null);
                }}
              />
            </div>

            <div className="map-search-overlay">
              <SketchSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
                handleLocationClick={() => {}}
              />
              <div className="map-filter-selects">
                <select 
                  style={{'display':'none'}}
                  className="select-box" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="ALL">유형 전체</option>
                  <option value="BAR">BAR</option>
                  <option value="RESTAURANT">RESTAURANT</option>
                </select>
                <select className="select-box" value={sortRating} onChange={(e) => setSortRating(e.target.value)}>
                  <option value="RATING_ALL">{get('main.filter.rating.all')}</option>
                  <option value="RATING_5">{get('main.filter.rating.5plus')}</option>
                  <option value="RATING_4">{get('main.filter.rating.4plus')}</option>
                  <option value="RATING_3">{get('main.filter.rating.3plus')}</option>
                </select>
            
                <select
                  style={{'display':'none'}}
                  className="select-box"
                  value={staffLanguageFilter}
                  onChange={(e) => setStaffLanguageFilter(e.target.value)}
                >
                  <option value="ALL">{get('language.filter.all')}</option>
                  <option value="kr">{get('language.name.korean')}</option>
                  <option value="en">{get('language.name.english')}</option>
                  <option value="ja">{get('language.name.japanese')}</option>
                  <option value="vi">{get('language.name.vietnamese')}</option>
                </select>
              </div>
              

              {/* 내 위치로 이동 */}
              <div
                className="map-my-position-btn"
                style={{
                  position: 'absolute',                 // ✅ viewport 기준
                  right: 10,
                  top: 60,
                  zIndex: 10
                }}
              >
                <SketchBtn
                  aria-label="내 위치로 이동"
                  onClick={() => mapRef.current?.focusMyPosition?.()}
                  onMouseDown={() => setPressed?.(true)}
                  onMouseUp={() => setPressed?.(false)}
                  onMouseLeave={() => setPressed?.(false)}
                  onTouchStart={() => setPressed?.(true)}
                  onTouchEnd={() => setPressed?.(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 45, height: 45,            // 손가락에 적당한 히트 영역
                    padding: 0,                        // 아이콘 전용
                    borderRadius: 9999,                // 완전 둥근 버튼
                    background: 'rgba(255,255,255,0.92)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: pressed
                      ? '0 1px 4px rgba(0,0,0,0.18)'
                      : '0 4px 12px rgba(0,0,0,0.18)',
                    backdropFilter: 'saturate(150%) blur(8px)',
                    WebkitBackdropFilter: 'saturate(150%) blur(8px)',
                    transform: pressed ? 'translateY(1px) scale(0.98)' : 'translateY(0)',
                    transition: 'box-shadow 120ms ease, transform 120ms ease, background 120ms ease',
                    color: '#111',
                    cursor: 'pointer',
                    userSelect: 'none',
                    touchAction: 'manipulation'
                  }}
                >
                  <Locate size={18} strokeWidth={2} />
                </SketchBtn>
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
            </div>

            <div className="map-venue-count-bottom">
              <SketchDiv
                className="venues-count"
                onClick={() => {
                  setShowVenueList(true);
                  setSelectedVenue(null);
                  setMarkerSelectedVenue(null);
                }}
              >
                {venueCount} {get('MapPage1.1')}
              </SketchDiv>
            </div>

           {showVenueList && (
  <div className="venue-list-overlay">
    <div className="venue-list-scroll">
      {(markerSelectedVenue ? [markerSelectedVenue] : places).map((venue, index, array) => (
        <SketchDiv
          key={venue.venue_id || venue.name} // ✅ 입구는 venue_id가 없을 수 있으므로
          id={`venue-${venue.venue_id || venue.name}`}
          className="venue-list-item"
          onClick={() => {
            
            // ✅ 입구인 경우 클릭 이벤트 처리 안함 또는 다른 처리
            if (!venue.isEntrance) {

              const container = document.querySelector('.content-area');

              if (container) {
                const scrollY = container.scrollTop;
                localStorage.setItem('homeScrollY', scrollY.toString());
                localStorage.setItem('discoverScrollY', '0');
                console.log("✅ savedScrollY from .content-area:", scrollY);
              }

              localStorage.setItem('discoverScrollY', '0');

              navigateToPageWithData(PAGES.DISCOVER, { venueId: venue.venue_id });
            }

            
          }}
          style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            position: 'relative',
            cursor: venue.isEntrance ? 'default' : 'pointer', // ✅ 입구는 커서 변경
          }}
        >
          {/* ✅ 입구인 경우 다른 콘텐츠 표시 */}
          {venue.isEntrance ? (
            <>
              <div style={{ flex: '0 0 130px', height: '130px', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#60a5ffff' }}>
                <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{venue.name}</div>
              </div>
              <div style={{ flex: '1' }}>
                <div className="venue-name">{venue.name}</div>
                <div className="venue-details">
                  <MapPin size={12}/> {venue.address}
                </div>
              </div>
            </>
          ) : (
            // 기존 일반 장소 렌더링 코드
            <>
              <div style={{ flex: '0 0 130px', height: '130px', borderRadius: '10px', overflow: 'hidden' }}>
                <img
                  src={venue.image_url}
                  alt={venue.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>
              <div style={{ flex: '1' }}>
                <div className="venue-name">{venue.name}</div>
                <div className="venue-details">
                  <MapPin size={12}/> {renderMaskedContent(venue.address, venue.isActiveUser)}
                </div>
                <div className="venue-details">
                  <Phone size={12} style={{ marginRight: '4px' }} />
                  {venue.phone
                    ? renderMaskedContent(venue.phone, venue.isActiveUser)
                    : '-'}
                </div>
                <div className="venue-details"><Users size={12}/> {venue.staff_cnt}{get('text.cnt1')} <Star size={12} fill='yellow'/>{venue.rating}/5</div>
              </div>
            </>
          )}
        </SketchDiv>
      ))}
    </div>
  </div>
)}

            <LoadingScreen isVisible={isLoading} />
          </SketchDiv>
        </div>
      </div>
    </>
  );
};

export default MapPage;