import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import SketchSearch from '@components/SketchSearch';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import GoogleMapComponent from '@components/GoogleMapComponent';
import LoadingScreen from '@components/LoadingScreen';
import SketchHeader from '@components/SketchHeaderMain'

import { useMsg } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';
import { Users, Star, Heart, ArrowRight, Clock, MapPin, CreditCard } from 'lucide-react';

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
  const [isReservationOnly, setIsReservationOnly] = useState(false); // ✅ 추가
  const [staffLanguageFilter, setStaffLanguageFilter] = useState('ALL');


  const inputRef = useRef(null);
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
      const venueList = response.data || [];

      const iau = await isActiveUser();
      
      
      // 구독 정보 확인 및 주소 마스킹 적용
      const processedVenueList = venueList.map(item => ({
        ...item,
        phone: iauMasking(iau, item.phone || ''),
        address: iauMasking(iau, item.address || '')
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
    if (sortRating === 'RATING_5') filtered = filtered.filter((v) => parseFloat(v.rating) >= 5);
    else if (sortRating === 'RATING_4') filtered = filtered.filter((v) => parseFloat(v.rating) >= 4);
    else if (sortRating === 'RATING_3') filtered = filtered.filter((v) => parseFloat(v.rating) >= 3);
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

    // ✅ 예약 가능 여부 필터
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
  }, [categoryFilter, sortRating, sortPrice, sortStaff, isReservationOnly, staffLanguageFilter]); // ✅ 반영

  const handleSearch = () => {
    fetchPlaces(searchQuery);
    if (onSearch) onSearch(searchQuery);
    if (inputRef.current) inputRef.current.blur();
  };

  return (
    <>
      <style jsx>{`
        .map-container { max-width: 28rem; margin: 0 auto; font-family: 'BMHanna', sans-serif; background-color: white; }
        .map-container-area { height: 85vh; position: relative; }
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
          height: 100%;
          overflow-y: auto;
          padding: 1rem;
        }
        .venue-list-item {
          margin-bottom: 1rem;
          padding: 0.75rem;
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
        .venue-details { margin-top: 0.4rem; font-size: 0.9rem; color: #4b5563; }

        .hidden-header {
          display: none !important;
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
                onMarkerClick={(venue) => {
                  setMarkerSelectedVenue(venue);
                  setShowVenueList(true);
                }}
                onMapClick={() => {
                 setShowVenueList(false);   // 오버레이 닫기
                setMarkerSelectedVenue(null); // 💥 마커 선택도 제거 (이게 중요!)
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

               {/* ✅ 예약 체크박스 */}
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
                      key={venue.venue_id}
                      id={`venue-${venue.venue_id}`}
                      className="venue-list-item"
                      onClick={() => navigateToPageWithData(PAGES.DISCOVER, { venueId: venue.venue_id })}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center',
                        height:'170px',
                        marginBottom: index === array.length - 1 && array.length > 1 ? '5vh' : '1rem',
                        position: 'relative',
                      }}
                    >
                      <div style={{ flex: '0 0 130px', height: '130px', borderRadius: '10px', overflow: 'hidden' }}>
                        <img
                          src={venue.image_url}
                          alt={venue.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      </div>
                      <div style={{ flex: '1' }}>
                        <div className="venue-name">{venue.name}</div>
                        <div className="venue-details">📜 {venue.address}</div>
                        <div className="venue-details">📞 {venue.phone}</div>
                        <div className="venue-details">👥 {venue.staff_cnt} / ⭐{venue.rating}/5</div>
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          right: '1rem',
                          bottom: '0.5rem',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#222'
                        }}
                      >
                      </div>
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
