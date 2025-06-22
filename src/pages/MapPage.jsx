import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import SketchSearch from '@components/SketchSearch';

import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import SketchInput from '@components/SketchInput';
import GoogleMapComponent from '@components/GoogleMapComponent';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import LoadingScreen from '@components/LoadingScreen';

const MapPage = ({ onVenueSelect = () => {}, navigateToPageWithData, PAGES, onSearch = () => {}, initialKeyword = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialKeyword); 
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [places, setPlaces] = useState([]);
  const [venueCount, setVenueCount] = useState(0);
  const inputRef = useRef(null); // ✅ inputRef 추가

  const fetchPlaces = async (keyword = '') => {
    try {
         setSelectedVenue(null);

      const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';  
      const response = await axios.get(`${API_HOST}/api/getVenueList`, {
        params: {
          keyword: keyword
        }
      });
      const venueList = response.data || [];
      setPlaces(venueList);
      setVenueCount(venueList.length);
      setSelectedVenue(null);

      if (inputRef.current) {
        inputRef.current.blur(); // ✅ 키패드 닫기
      }
    } catch (error) {
      console.error('장소 목록 불러오기 실패:', error);
    }
  };
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  useEffect(() => {

    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }

    if (initialKeyword) {
      fetchPlaces(initialKeyword); // 초기 keyword로 검색
    } else {
      fetchPlaces();
    }
  }, [initialKeyword, messages, currentLang]);

  const handleSearch = (e) => {
    fetchPlaces(searchQuery);
    if (onSearch) onSearch(searchQuery);

     if (inputRef.current) {
      inputRef.current.blur(); // 🔻 키패드 닫기 위해 포커스 제거
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <style jsx="true">{`
        .map-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          position: relative;
        }

        .map-container-area {
          height: 85vh;
          position: relative;
          
        }

        .map-content-area {
          width: 100%;
          height: 100%;
          background-color: #f8fafc;
          position: relative;
          overflow: hidden;
          transform: rotate(-0.2deg);
        }

        .map-component-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .map-search-overlay {
          position: absolute;
          top: 1rem;
          left: 1rem;
          right: 1rem;
          z-index: 50;
        }

        .map-venue-count-bottom {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 35;
          width: calc(100% - 2rem);
          pointer-events: none;
        }

        .venue-info-overlay {
              position: absolute;
              bottom: 4.5rem;
              left: 1rem;
              right: 1rem;
              padding: 1rem;
              background-color: white;
              border: 1px solid #303946;
              border-radius: 5px;
              box-shadow: 0 0 1px #94fff9, 0 0 5px #94fff9, 0 0 30px #94fff9;
              transform: rotate(0.5deg);
              z-index: 30;
              color: white;
        }



        .venue-info-content {
          position: relative;
          z-index: 10;
        }

        .venue-info-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .venue-star {
          font-size: 1.2rem;
          color: #fbbf24;
        }

        .venue-name {
          
          font-size: 1.1rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .venue-details {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
          
          font-size: 0.9rem;
          color: #4b5563;
        }

        .venue-price-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
         
          font-size: 0.9rem;
        }

        .venue-price {
          font-weight: bold;
          color: #059669;
        }

        .venue-entry {
          color: #6b7280;
          font-style: italic;
        }

        .venue-stars {
          color: #fbbf24;
          font-weight: bold;
        }

        .venues-count {
          background: #94fff9;
          padding: 0.75rem;
          border: 1px solid #1f2937;
          border-radius: 5px;
          background-color: #f9fafb;
          transform: rotate(-0.3deg);
          overflow: hidden;
          box-shadow: 1px 1px 0px #1f2937;
          text-align: center;
        }

        .count-text {
          
          font-weight: bold;
          color: #1f2937;
          font-size: 0.9rem;
          position: relative;
          z-index: 10;
        }

        @media (max-width: 480px) {
          .map-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
        }
      `}</style>

      <div className="map-container">
        <div className="map-container-area">
          <SketchDiv className="map-content-area">
            <HatchPattern opacity={0.05} />
            <div className="map-component-placeholder">
              <GoogleMapComponent
                places={places}
                onMarkerClick={(venue) => setSelectedVenue(venue)}
                onMapClick={() => setSelectedVenue(null)}
              />
            </div>

            <div className="map-search-overlay">

               <SketchSearch
                              searchQuery={searchQuery}
                              setSearchQuery={setSearchQuery}
                              handleSearch={handleSearch}
                              handleLocationClick={()=>{}}
                            />

              {/*
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-container">
                  <SketchDiv className="search-input-wrapper">
                    <input
                      ref={inputRef} // ✅ ref 연결
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search nightlife venues"
                      className="search-input"
                    />
                    <button type="submit" className="search-button" aria-label="Search">
                      🔍
                    </button>
                  </SketchDiv>
                </div>
              </form>
              */}
            </div>

            <div className="map-venue-count-bottom">
              <SketchDiv className="venues-count sketch-div sketch-div--default">
                <HatchPattern opacity={0.4} />
                <span className="count-text">{venueCount} {get('MapPage1.1')}</span>
              </SketchDiv>
            </div>

            {selectedVenue && (
            <SketchDiv
              className="venue-info-overlay"
              onClick={() =>
                navigateToPageWithData(PAGES.DISCOVER, { venueId: selectedVenue.venue_id })
              }
              style={{ cursor: 'pointer' }} // 클릭 가능한 것처럼 보이게
            >
              <HatchPattern opacity={0.1} />
              <div className="venue-info-content">
                <div className="venue-info-header">
                  <span className="venue-star"></span>
                  <h3 className="venue-name">{selectedVenue.name}</h3>
                </div>
                <div className="venue-details">
                  <span className="venue-people">🗺️ {selectedVenue.address}</span>
                </div>
                <div className="venue-details">
                  <span className="venue-people">📞 {selectedVenue.phone}</span>
                </div>
                <div className="venue-details">
                  <span className="venue-people">👥 {selectedVenue.staff_cnt} / ⭐{selectedVenue.rating}/5</span>
                </div>
              </div>
            </SketchDiv>
          )}

            
          </SketchDiv>
            <LoadingScreen 
        isVisible={isLoading} 
        // loadingText="Loading" 
/>
        </div>
      </div>
    </>
  );
};

export default MapPage;
