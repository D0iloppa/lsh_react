import React, { useState } from 'react';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import SketchInput from '@components/SketchInput';

const MapPage = ({ onVenueSelect = () => {}, onSearch = () => {} }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venueCount, setVenueCount] = useState(45);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleMapView = () => {
    // 맵 뷰 토글 로직
    console.log('Toggle map view');
  };

  return (
    <>
      <style jsx>{`
        .map-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          border: 4px solid #1f2937;
          position: relative;
        }

        .map-search-section {
          padding: 1rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
          text-align: center;
        }

        .search-form {
          margin-bottom: 1rem;
          text-align: left;
        }

        .search-input-container {
          position: relative;
        }

        .search-input-wrapper {
          position: relative;
          border: 3px solid #1f2937;
          border-radius: 0;
          background-color: white;
          display: flex;
          align-items: center;
          transform: rotate(-0.5deg);
          box-shadow: 3px 3px 0px #1f2937;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem;
          border: none;
          outline: none;
          font-size: 1rem;
          background: transparent;
          font-family: 'Comic Sans MS', cursive, sans-serif;
        }

        .search-input::placeholder {
          color: #6b7280;
          font-style: italic;
        }

        .search-button {
          padding: 0.5rem;
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          transition: transform 0.1s;
        }

        .search-button:hover {
          transform: scale(1.1);
        }

        .map-view-button {
          padding: 0.75rem 1.5rem;
          border: 3px solid #1f2937;
          background-color: #f3f4f6;
          cursor: pointer;
          text-align: center;
          transform: rotate(0.3deg);
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
          display: inline-block;
        }

        .map-view-button:hover {
          transform: rotate(0.3deg) scale(1.02);
          box-shadow: 2px 2px 0px #1f2937;
        }

        .map-view-text {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-weight: bold;
          font-size: 0.9rem;
          color: #1f2937;
          position: relative;
          z-index: 10;
        }

        .map-container-area {
          height: 450px;
          position: relative;
          border-bottom: 3px solid #1f2937;
        }

        .map-content-area {
          width: 100%;
          height: 100%;
          border: 3px solid #1f2937;
          margin: 0.5rem;
          margin-right: 1rem;
          margin-bottom: 1rem;
          background-color: #f8fafc;
          position: relative;
          overflow: hidden;
          transform: rotate(-0.2deg);
        }

        .map-component-placeholder {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 5;
        }

        .map-placeholder-content p {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1.1rem;
          color: #4b5563;
          margin: 0;
          font-weight: bold;
        }

        .map-placeholder-content small {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.8rem;
          color: #6b7280;
          font-style: italic;
        }

        .location-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background-color: white;
          border: 2px solid #1f2937;
          border-radius: 50%;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          z-index: 20;
          transform: rotate(5deg);
          transition: all 0.2s;
          box-shadow: 2px 2px 0px #1f2937;
        }

        .location-button:hover {
          transform: rotate(5deg) scale(1.1);
          box-shadow: 3px 3px 0px #1f2937;
        }

        .venue-info-overlay {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          background-color: white;
          border: 3px solid #1f2937;
          padding: 1rem;
          transform: rotate(0.5deg);
          box-shadow: 4px 4px 0px #1f2937;
          z-index: 30;
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
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1.1rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .venue-details {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.9rem;
          color: #4b5563;
        }

        .venue-price-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Comic Sans MS', cursive, sans-serif;
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

        .venues-count-section {
          padding: 1rem 0;
        }

        .venues-count {
          padding: 0.75rem;
          border: 3px solid #1f2937;
          background-color: #f9fafb;
          width: calc(100% - 2rem);
          margin: 0 1rem;
          transform: rotate(-0.3deg);
          position: relative;
          overflow: hidden;
          box-shadow: 2px 2px 0px #1f2937;
        }

        .count-text {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-weight: bold;
          color: #1f2937;
          font-size: 0.9rem;
          position: relative;
          z-index: 10;
        }

        /* 스케치 효과를 위한 추가 스타일 */
        .map-search-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
          pointer-events: none;
          opacity: 0.5;
        }

        @media (max-width: 480px) {
          .map-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
          
          .venue-info-overlay {
            left: 0.5rem;
            right: 0.5rem;
          }

          .venues-count {
            width: calc(100% - 2rem);
            margin: 0 0.5rem;
          }
        }
      `}</style>

      <div className="map-container">
        {/* 상단 검색 영역 */}
        <div className="map-search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <SketchDiv className="search-input-wrapper">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search nightlife venues"
                  className="search-input"
                />
                <button 
                  type="submit" 
                  className="search-button"
                  aria-label="Search"
                >
                  🔍
                </button>
              </SketchDiv>
            </div>
          </form>

          {/* MAP VIEW 버튼 */}
          <SketchDiv className="map-view-button" onClick={toggleMapView}>
            <HatchPattern opacity={0.1} />
            <span className="map-view-text">MAP VIEW</span>
          </SketchDiv>
        </div>

        {/* 맵 컨테이너 영역 */}
        <div className="map-container-area">
          <SketchDiv className="map-content-area">
            <HatchPattern opacity={0.05} />
            
            {/* 맵 컴포넌트가 들어갈 영역 */}
            <div className="map-component-placeholder">
              {/* 여기에 실제 맵 컴포넌트가 들어갈 예정 */}
              <div className="map-placeholder-content">
                <p>맵 컴포넌트 영역</p>
                <small>Map Component Area</small>
              </div>
            </div>
          </SketchDiv>

          {/* 선택된 장소 정보 (맵 하단에 오버레이) */}
          {selectedVenue ? (
            <SketchDiv className="venue-info-overlay">
              <HatchPattern opacity={0.1} />
              <div className="venue-info-content">
                <div className="venue-info-header">
                  <span className="venue-star">⭐</span>
                  <h3 className="venue-name">{selectedVenue.name}</h3>
                </div>
                <div className="venue-details">
                  <span className="venue-rating">🎵 {selectedVenue.music}</span>
                  <span className="venue-people">👥 {selectedVenue.people}</span>
                </div>
                <div className="venue-price-info">
                  <span className="venue-price">${selectedVenue.price}</span>
                  <span className="venue-entry">entry</span>
                  <span className="venue-stars">⭐{selectedVenue.rating}/5</span>
                </div>
              </div>
            </SketchDiv>
          ) : null}
        </div>

        {/* 하단 결과 개수 */}
        <div className="venues-count-section">
          <SketchDiv className="venues-count">
            <HatchPattern opacity={0.1} />
            <span className="count-text">{venueCount} venues found</span>
          </SketchDiv>
        </div>
      </div>
    </>
  );
};

export default MapPage;