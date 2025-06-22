import React, { useState, useEffect } from 'react';
import axios from 'axios';

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchHeader from '@components/SketchHeader';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '@components/LoadingScreen';

const FavoritesPage = ({ 
  navigateToPageWithData, 
  PAGES,
  goBack,
  ...otherProps 
}) => {
  const [sortBy, setSortBy] = useState('name');
  const [filter, setFilter] = useState('all');

  const { user, isLoggedIn } = useAuth();
  const [userInfo, setUserInfo] = useState({});
  const [favorites, setFavorits] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]); // 초기 빈 배열로
  const API_HOST = import.meta.env.VITE_API_HOST; // ex: https://doil.chickenkiller.com/api

  // 버튼 클릭 시 필터링
  const handleFilterType = (type) => {
    if (type === 'ALL') {
      setFilteredFavorites(favorites);
    } else {
      setFilteredFavorites(
        favorites.filter(item => item.target_type === type.toLowerCase())
      );
    }
  };
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  // 마운트 시 즐겨찾기 가져오기
  useEffect(() => {
    window.scrollTo(0, 0);

  if (messages && Object.keys(messages).length > 0) {
              console.log('✅ Messages loaded:', messages);
              // setLanguage('en'); // 기본 언어 설정
              console.log('Current language set to:', currentLang);
              window.scrollTo(0, 0);
            }


    const fetchFavorits = async () => {
      try {
        const response = await axios.get(`${API_HOST}/api/getMyFavoriteList`, {
          params: { user_id: user?.user_id || 1 }
        });
        const data = response.data || [];
        setFavorits(data);
        setFilteredFavorites(data); // 추가
      } catch (error) {
        console.error('getMyFavoriteList 목록 불러오기 실패:', error);
      }
    };

    fetchFavorits();
  }, [messages, currentLang]);



  const handleProfile = () => {
    console.log('Profile 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.PROFILE);
  };

  const handleSort = () => {
    console.log('Sort 클릭');
    // 정렬 옵션 토글 또는 모달
  };

  const handleFilter = () => {
    console.log('Filter 클릭');
    // 필터 옵션 토글 또는 모달
  };

  const handleBook = (venue) => {
    console.log('Book clicked:', venue);
    navigateToPageWithData && navigateToPageWithData(PAGES.RESERVATION, {
      selectedVenue: venue
    });
  };

  const ShareIcon = ({ 
  size = 24, 
  color = "#333", 
  strokeWidth = 1.5,
  className = "",
  variant = "nodes", // "nodes", "arrow", "simple"
  ...props 
}) => {
     return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth={strokeWidth}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={`share-icon ${className}`}
      {...props}
    >
      {/* 오른쪽 위 노드 */}
      <circle cx="18" cy="5" r="3" />
      
      {/* 왼쪽 아래 노드 */}
      <circle cx="6" cy="12" r="3" />
      
      {/* 오른쪽 아래 노드 */}
      <circle cx="18" cy="19" r="3" />
      
      {/* 연결선들 */}
      <path d="M8.59 13.51L15.42 17.49" />
      <path d="M15.41 6.51L8.59 10.49" />
    </svg>
  );
};

  return (
    <>
      <style jsx="true">{`
        .favorites-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          position: relative;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
        }

        .logo {
          
          font-weight: bold;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .content-section {
          padding: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.3rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .favorites-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .favorite-card {
            border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
          border: 1px solid #1f2937;
          background-color: #f8fafc;
          padding: 1rem;
          transform: rotate(-0.1deg);
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .favorite-card:hover {
          transform: rotate(-0.1deg) scale(1.01);
         
        }

        .favorite-card:nth-child(even) {
          transform: rotate(0.1deg);
        }

        .favorite-card:nth-child(even):hover {
          transform: rotate(0.1deg) scale(1.01);
        }

        .card-content {
          position: relative;
          z-index: 10;
          display: flex;
          gap: 1rem;
        
          width: 100%;
        }

        .venue-image {
          width: 100%;
          height: 100%;
          flex-shrink: 0;
          border: 2px solid #1f2937;
        }

        .venue-details {
          flex: 1;
        }

        .venue-name {
         text-align: start;
          font-size: 1rem;
          font-weight: bold;
          color: #1f2937;   
          margin: 0 0 0.25rem 0;
        }
        .venue-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .venue-description {
         text-align: start;
          font-size: 0.85rem;
          color: #4b5563;
          margin: 0;
          line-height: 1.3;
        }

        .book-action {
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .favorites-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }

          .section-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .filter-buttons {
            justify-content: center;
          }

          .card-content {
            flex-direction: column;
            text-align: center;
            gap: 0.75rem;
          }

          .venue-image {
            align-self: center;
          }
        }
          
      `}</style>

      <div className="favorites-container">
        {/* Header */}
        <SketchHeader
                  onClick={handleProfile}
                  title={get('Menu1.8')}
                  showBack={true}
                  onBack={goBack}
                  rightButtons={[]}
                />
        {/* <div className="header">
          <div className="logo">≡ LeTanTon Sheriff</div>
          <SketchBtn 
            variant="secondary" 
            size="small"
            onClick={handleProfile}
          >
            PROFILE
          </SketchBtn>
        </div> */}

        {/* Content Section */}
        <div className="content-section">
          {/* Section Header */}
          <div className="section-header">
            <h1 className="section-title">{get('Menu1.8')}</h1>
            <div className="filter-buttons">
              <SketchBtn 
                variant="secondary" 
                size="small"
                onClick={() => handleFilterType("ALL")}
              >
                <HatchPattern opacity={0.4} />
                {get('btn.all.1')}
              </SketchBtn>
              
              <SketchBtn 
                variant="secondary" 
                size="small"
                onClick={() => handleFilterType("VENUE")}
              >
                <HatchPattern opacity={0.4} />
                {get('title.text.15')}
              </SketchBtn>
              
              <SketchBtn 
                variant="secondary" 
                size="small"
                onClick={() => handleFilterType("STAFF")}
              >
                <HatchPattern opacity={0.4} />
                {get('title.text.16')}
              </SketchBtn>
            </div>

          </div>

          {/* Favorites List */}
          <div className="favorites-list">
            {filteredFavorites.map((venue, index) => (
              <div key={venue.venue_id} className="favorite-card">
                <HatchPattern opacity={0.4} />
                
                <div className="card-content">
                  <ImagePlaceholder 
                    src={venue.image_url} 
                    className="venue-image"
                  />
                  
                  <div className="venue-details">
                    <div className="venue-info">
                    <h3 className="venue-name">{venue.name}</h3>
                    <ShareIcon />
                    </div>
                    <p className="venue-description">{venue.description}</p>
                  </div>

                  <div className="book-action">
                    <SketchBtn 
                      variant="primary" 
                      size="small"
                      onClick={() => handleBook(venue)}
                    >
                      {get('btn.booking.2')}
                    </SketchBtn>
                      <LoadingScreen 
        isVisible={isLoading} 
        // loadingText="Loading" 
/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FavoritesPage;