import React, { useState, useEffect } from 'react';
import axios from 'axios';

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchHeader from '@components/SketchHeader';
import SketchDiv from '@components/SketchDiv';
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

  const [targetTypeFilter, setTargetTypeFilter] = useState("ALL"); // 전체 / venue / staff


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

        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setFavorits(data);
        setFilteredFavorites(data); // 추가
      } catch (error) {
        console.error('getMyFavoriteList 목록 불러오기 실패:', error);
      }
    };

    fetchFavorits();
  }, [messages, currentLang]);

 useEffect(() => {
    let filtered = [...favorites];

    if (targetTypeFilter !== "ALL") {
      filtered = filtered.filter(item => item.target_type === targetTypeFilter.toLowerCase());
    }

    // 항상 최신순
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredFavorites(filtered);
  }, [targetTypeFilter, favorites]);

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

  const handleBook = (item) => {

    handleDiscover(item);

    /*
    navigateToPageWithData && navigateToPageWithData(PAGES.DISCOVER, {
      venueId:item.target_id
    });
    */
  };

  const handleDiscover = (item) => {

    const {target_type='venue', target_id = -1} = item;

    if(!target_id) return;
    
    switch(target_type){
      case 'venue':
        navigateToPageWithData && navigateToPageWithData(PAGES.DISCOVER, {
          venueId:target_id
        });
        break;

      case 'staff':
        navigateToPageWithData && navigateToPageWithData(PAGES.STAFFDETAIL, {
          staff_id: item.target_id,  // staffId → staff_id로 변경
          venue_id: null,
          vn_schedule_status: false,
          fromReview: true   // 데이터 fetch를 위해 필요
        });
        break;
    }
    

    //navigateToPageWithData(PAGES.DISCOVER, { venueId });
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
          height: 300px;
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

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #6b7280;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .empty-state p {
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0;
        }
      }

      .filter-tab {
    flex: 1;
    text-align: center;
    padding: 6px 10px;
    border: 1px solid #333;
    border-radius: 6px;
    background: white;
    font-size: 13px;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;
  }
  .filter-tab.active {
    background: #374151;
    color: white;
    font-weight: 600;
    border: 2px solid #333;
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
        {/* Content Section */}
        <div className="content-section">
          {/* Section Header */}
          <div className="section-header">

             <div className="filter-buttons" style={{ display: 'flex', gap: '8px' }}>
              <div
                className={`filter-tab ${targetTypeFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setTargetTypeFilter('ALL')}
              >
                {get('btn.all.1')}
              </div>
              <div
                className={`filter-tab ${targetTypeFilter === 'venue' ? 'active' : ''}`}
                onClick={() => setTargetTypeFilter('venue')}
              >
                {get('title.text.14')}
              </div>
              <div
                className={`filter-tab ${targetTypeFilter === 'staff' ? 'active' : ''}`}
                onClick={() => setTargetTypeFilter('staff')}
              >
                {get('title.text.16')}
              </div>
            </div>

            
            {/* <div className="filter-buttons">
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
            </div> */}

          </div>

          {/* Favorites List */}
          <div className="favorites-list">
            {filteredFavorites.length > 0 ? (
              filteredFavorites.map((venue, index) => (
                <div key={venue.venue_id} className="favorite-card">
                  <HatchPattern opacity={0.4} />
                  
                    <div className="card-content" onClick={() => handleDiscover(venue)}>
                    <ImagePlaceholder 
                      src={venue.image_url} 
                      className="venue-image"
                    />
                    
                    <div className="venue-details">
                      <div className="venue-info">
                      <h3 className="venue-name">{venue.name}</h3>
                      {/* <ShareIcon /> */}
                      </div>
                      <p className="venue-description">{venue.description}</p>
                    </div>

                    <div className="book-action">
                      <SketchBtn 
                        variant="primary" 
                        size="small"
                         onClick={(e) => {
                          e.stopPropagation();
                          handleBook(venue);
                        }}
                      >
                        {get('btn.booking.2')}
                      </SketchBtn>
                       <LoadingScreen 
                                 variant="cocktail"
                                 loadingText="Loading..."
                                 isVisible={isLoading} 
                               />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <SketchDiv className="favorite-card">
                <HatchPattern opacity={0.02} />
                <div className="empty-state">
                  <h3>{get('Favorites.empty.title')}</h3>
                  <p style={{fontSize: '0.83rem'}}>{get('Favorites.empty.description')}</p>
                </div>
              </SketchDiv>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FavoritesPage;