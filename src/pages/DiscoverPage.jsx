import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RotationDiv from '@components/RotationDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';
import SketchHeader from '@components/SketchHeader';
import GoogleMapComponent from '@components/GoogleMapComponent';
import SketchBtn from '@components/SketchBtn';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import LoadingScreen from '@components/LoadingScreen';
import {Star, Clock, Users, Phone, CreditCard, MessageCircle} from 'lucide-react';
import ApiClient from '@utils/ApiClient';

const DiscoverPage = ({ navigateToPageWithData, PAGES, goBack, ...otherProps }) => {

  const venueId = otherProps?.venueId || null;
  const [venueInfo, setVenueInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [topGirls, setTopGirls] = useState([]);
  const [showFooter, setShowFooter] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);

  const handleDetail = (girl) => {
    navigateToPageWithData(PAGES.STAFFDETAIL, girl);
  };
const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  // 스크롤 이벤트용 별도 useEffect
useEffect(() => {
  const handleScroll = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    const scrollPercentage = scrollY / (documentHeight - windowHeight);
    
    if (scrollPercentage > 0.5) {
      setShowFooter(false);
    } else {
      setShowFooter(true);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []); // 의존성 배열 비움


  useEffect(() => {
    window.scrollTo(0, 0); 

  if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }


    const fetchVenueInfo = async () => {
      if (!venueId) return;
      setLoading(true);
      try {
        const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';

        const response = await axios.get(`${API_HOST}/api/getVenue`, {
          params: { venue_id: venueId },
        });

        console.log("response", response.data)

        setVenueInfo(response.data || null);
      } catch (error) {
        console.error('Venue 정보 가져오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    // const fetchTopGirls = async () => {
    //   if (!venueId) return;
    //   try {

    //     const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
    //     const res = await axios.get(`${API_HOST}/api/getVenueStaffList`, {
    //       params: { venue_id: venueId },
    //     });
    //     const staffList = res.data || [];
    //     const top3 = staffList.slice(0, 3).map((girl) => {
    //       const birthYear = parseInt(girl.birth_year, 10);
    //       const currentYear = new Date().getFullYear();
    //       const age = birthYear ? currentYear - birthYear : '?';
    //       return {
    //         ...girl, 
    //         displayName: `${girl.name} (${age})`,
    //       };
    //     });
    //     setTopGirls(top3);
    //   } catch (error) {
    //     console.error('Top girls 가져오기 실패:', error);
    //   }
    // };

    fetchVenueInfo();
    //fetchTopGirls();
  }, [venueId, messages, currentLang]);

useEffect(() => {
  const fetchAllData = async () => {
    if (!venueId) return;
    
    try {
      // 1. 먼저 staff 리스트를 가져옴
      const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
      const res = await axios.get(`${API_HOST}/api/getVenueStaffList`, {
        params: { venue_id: venueId },
      });
      const staffList = res.data || [];
      
      // 2. staff 리스트가 있을 때만 availCnt 호출
      if (staffList.length > 0) {
        const top3WithAvailCnt = await Promise.all(
          staffList.slice(0, 3).map(async (girl) => {
            const birthYear = parseInt(girl.birth_year, 10);
            const currentYear = new Date().getFullYear();
            const age = birthYear ? currentYear - birthYear : '?';
            
            // 재시도 로직 추가
          let availCnt = 0;
            try {
              const response = await ApiClient.get('/api/staffAvailCnt', {
                params: { staff_id: girl.staff_id }
              });
              
              console.log(`=== Staff ${girl.staff_id} 전체 response 구조 확인 ===`);
              console.log('response:', response);
              console.log('response.data:', response.data);
              console.log('response 키들:', Object.keys(response));
              
              // ApiClient가 다른 구조일 수 있으니 여러 가능성 체크
              let data = null;
              if (response.data) {
                data = response.data;
              } else if (response.body) {
                data = response.body;
              } else if (response.result) {
                data = response.result;
              } else if (Array.isArray(response)) {
                data = response;
              } else {
                data = response; // response 자체가 데이터일 수도
              }
              
              console.log('실제 데이터:', data);
              
              if (Array.isArray(data) && data.length > 0) {
                availCnt = data[0]?.availcnt || 0;
              } else if (data?.availcnt) {
                availCnt = data.availcnt;
              }
              
              console.log('Final availCnt:', availCnt);
              
            } catch (error) {
              console.error(`Staff ${girl.staff_id} availCnt 로딩 실패:`, error);
              availCnt = 0;
            }
            
            return {
              ...girl, 
              displayName: `${girl.name} (${age})`,
              availCnt: availCnt
            };
          })
        );
        
        setTopGirls(top3WithAvailCnt);
      }
    } catch (error) {
      console.error('Staff 데이터 가져오기 실패:', error);
    }
  };

  fetchAllData();
}, [venueId]); 


useEffect(() => {
  const loadVenueReview = async () => {
    if (!venueId) return;
    
    try {
      const response = await ApiClient.postForm('/api/getVenueReviewList', {
        venue_id: venueId
      });
      
      //console.log('responseReview', response.data);
      
      // 상태에 저장하거나 사용하기
      // setReviews(response.data);
      setReviewCount(response.data?.length || 0);
    } catch (error) {
      setReviewCount(0);
      console.error('리뷰 로딩 실패:', error);
    }
  };

  loadVenueReview();
}, [venueId]); // venueId가 변경될 때만 실행
 



  const renderStars = (rating = 0) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    let color = '#d1d5db'; // 기본 회색 (gray-300)
    if (rating >= i) {
      color = '#fbbf24'; // 노란색 (yellow-400)
    } else if (rating >= i - 0.5) {
      color = '#fde68a'; // 연노란색 (yellow-200)
    }

    stars.push(
      <span key={i}>
        <Star color={color} fill={color} size={20}/>
      </span>
    );
  }
  return stars;
};

  const CalendarIcon = ({ size = 24, color = '#333' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke={color}
    strokeWidth="1.5"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

  return (
    <>
      <style jsx="true">{`
        .discover-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          min-height: 100vh;

          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .featured-section { padding-bottom: 60px; padding: 1rem; text-align: center;}
        .club-image-area {
          border-radius: 3px;
          width: 100%; height: 200px; border: 1px solid #1f2937;
          background-color: #f3f4f6; margin-bottom: 1rem;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .club-image-area img { width: 100%; height: 100%; object-fit: cover; }
        .club-name {
          font-size: 1.5rem; font-weight: bold; margin: 0.5rem 0;
          word-break: break-word; white-space: normal;
        }
        .club-location { font-size: 0.9rem; color: #6b7280;  margin-bottom: 15px;}
        .top-venues-text { font-size: 1.2rem; font-weight: bold; margin-bottom: 8px;}
        .description {
          font-size: 0.9rem; color: #4b5563; line-height: 1.4; margin-bottom: 1rem;
        }
        .action-row {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
        }
        .make-text { font-weight: bold; }
        .reserve-btn {
          border: 0; font-size: 1.5rem; background: none; cursor: pointer;
        }
        .stars { font-size: 1.2rem; }
        // .upcoming-events {
        //   padding: 1rem; border-bottom: 1px solid #1f2937;
        // }
        .section-title { font-size: 1.1rem; font-weight: bold; margin-bottom: 1rem;}
        .events-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
        }
        .event-card {
          width: 100%; height: 120px; border: 1px solid #1f2937;
          background-color: #f9fafb; display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          color: #6b7280; 
        }
        .top-girls-section { padding: 1rem; margin-top: 20px}
        .girls-rotation { width: 100%; margin-bottom: 30px;}
        .girl-slide { text-align: center;  margin-top: 20px;}
        .girl-img {
          width: 220px;
          height: 300px; 
          object-fit: cover; border-radius: 0.5rem;
          margin: 0 auto 0.5rem;
        }
        .girl-name {
          
          text-align: center; margin-bottom: 0.5rem;
        }
        .girl-detail-btn {
          display: block; margin: 0 auto; padding: 0.3rem 2rem;
          border: 1px solid #1f2937; background-color: white; border-radius: 3px;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          cursor: pointer;
        }
        @media (max-width: 480px) {
          .discover-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
        }
       .map-section {
          width: 100%;
          height: 250px;
          margin-top: 1rem;
          border: 1px solid #666;
        }   
          .reservation-footer {
          position: fixed;
          bottom: 88px;
          left: 0;
          right: 0;
          background: white;
          padding: 10px 10px 12px 15px;
          z-index: 1000;
          transform: translateY(0);
          transition: transform 0.3s ease-in-out;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        }

        .reservation-footer.hidden {
          transform: translateY(100%);
        }

        .reservation-footer-content {
          // max-width: 7rem;
          margin: 0 auto;
          display: flex;
         justify-content: space-between;
        }

        .top-sum {margin-top: 25px; display: flex; justify-content: space-between; margin-bottom: 2rem; padding-bottom: 8px; border-bottom: 1px solid #cecece;}
      `}</style>

      <div className="discover-container">
        <SketchHeader
          title={venueInfo?.name || 'Discover'}
          showBack={true}
          onBack={goBack}
          rightButtons={[]}
        />

        <div className="featured-section">
            <div className="club-image-area">
              {loading ? (
                <div className="club-name">Loading...</div>
              ) : venueInfo?.image_url ? (
                <img src={venueInfo.image_url} alt="venue" />
              ) : (
                <div className="club-name">No Image</div>
              )}
            </div>
            {venueInfo && (
                <div
                  className="is-reservation"
                  style={{
                    right: '22px',
                    top: '90px',
                    position: 'absolute',
                    backgroundColor: venueInfo.is_reservation ? 'rgb(11 199 97)' : 'rgb(107 107 107)',
                    color: '#fff',
                    padding: '5px 7px',
                    borderRadius: '3px',
                    display: 'inline-block',
                  }}
                >
                  {venueInfo.is_reservation ? '예약 가능' : '예약 불가능'}
                </div>
              )}


            <div className="club-name">{venueInfo?.name || 'Club One'}</div>

            <div className='sum-info text-start'>
            <div className="club-location">{venueInfo?.address || venueInfo?.location || 'in Vietnam'}</div>
            <div className="top-venues-text">{venueInfo?.description || get('DiscoverPage1.4')}</div>
            
            <div className="description">
              {venueInfo?.description ||
                get('DiscoverPage1.5')}
            </div>

            <div className="phone" style={{marginBottom: '5px'}}>
              <span style={{color: '#858585'}}><Phone size={14}/> tell: </span> {venueInfo?.phone ||'-'}
            </div>

            <div style={{marginBottom: '5px'}}>
              <span style={{color: '#858585'}}><Users size={14}/>  Staff Count: </span>
              {venueInfo && venueInfo.staff_cnt !== undefined ? (
                  <span>{venueInfo.staff_cnt} {get('text.cnt1')}</span>
                ) : (
                  <span>-</span>
                )}
            </div>
            <div>
              <span style={{color: '#858585'}}><CreditCard size={14}/> Menu: </span> 
            </div>
          </div>

          <div className="top-sum">
            <div className="stars">{renderStars(venueInfo?.rating)}</div>
            <div style={{color: '#0072ff'}} onClick={() =>
              navigateToPageWithData(PAGES.VIEWREVIEW, {venueId})
            }>
              리뷰 <span className='reviewCnt'>{reviewCount}</span>개 모두 보기 >
            </div>
          </div>

          <div className="section-title" style={{textAlign:'start'}}>{get('DiscoverPage1.6')}</div>
          <div className="map-section">
            <GoogleMapComponent
              places={venueInfo ? [venueInfo] : []}
              disableInteraction={true}
            />
          </div>
        </div>

        <div className="upcoming-events">
        </div>

        <div className="top-girls-section">
          <div className="section-title">{get('DiscoverPage1.2')}</div>
          <RotationDiv interval={500000000} swipeThreshold={50} showIndicators={true}  pauseOnHover={true} className="girls-rotation">
            {topGirls.map((girl, index) => (
              <div key={index} className="girl-slide" style={{position: 'relative'}}>
                {girl.image_url ? (
                  <div style={{position: 'relative'}}>
                    <img src={girl.image_url} className="girl-img" alt="girl" />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: girl.availCnt > 0 ? 'rgb(11, 199, 97)' : 'rgb(107, 107, 107)',
                      color: 'rgb(255, 255, 255)',
                      padding: '3px 6px',
                      borderRadius: '3px',
                      fontSize: '11px',
                    }}>
                      {girl.availCnt > 0 ? '예약 가능' : '예약 마감'}
                    </div>
                  </div>
                ) : (
                  <div style={{position: 'relative'}}>
                    <ImagePlaceholder />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: girl.availCnt > 0 ? 'rgb(11, 199, 97)' : 'rgb(107, 107, 107)',
                      color: 'rgb(255, 255, 255)',
                      padding: '3px 6px',
                      borderRadius: '3px',
                      fontSize: '11px',
                    }}>
                      {girl.availCnt > 0 ? '예약 가능' : '예약 마감'}
                    </div>
                  </div>
                )}
                <div className="girl-name">{girl.displayName}</div>
                
                <SketchBtn
                  type="text"
                  className="sketch-button" 
                  size='small'
                  variant='primary' 
                  style={{ width: '130px', marginBottom: '20px'}}
                  onClick={() => handleDetail(girl)}
                >
                  <HatchPattern opacity={0.8} />
                  {get('DiscoverPage1.3')}
                </SketchBtn>
              </div>
            ))}
            </RotationDiv>
            <div className={`reservation-footer ${showFooter ? '' : 'hidden'}`}>
              {<HatchPattern opacity={0.4} />}
              <div className="reservation-footer-content">
                <div>
                <div className="club-name" style={{ color: '#374151', fontSize:'17px', maxWidth: '160px'}}>{venueInfo?.name || 'Club One'}</div>
                <div>
                  <Clock size={13} style={{ marginRight: '4px' }} />
                  {venueInfo && venueInfo.open_time && venueInfo.close_time
                    ? `${venueInfo.open_time} - ${venueInfo.close_time}`
                    : '-'}
                </div>
                </div>
                 <SketchBtn 
                  className="sketch-button enter-button"  
                  variant="event" 
                  style={{ width: '45px', height: '39px', marginTop: '10px', background:'#374151', color:'white'}}
                  // onClick={() =>
                  //   navigateToPageWithData(PAGES.RESERVATION, {
                  //     target: 'venue',
                  //     id: venueId || 1,
                  //   })
                  // }
                ><MessageCircle size={16}/></SketchBtn>
                <SketchBtn 
                  className="sketch-button enter-button"  
                  variant="event" 
                  style={{ width: '85px', height: '39px', marginTop: '10px', marginLeft:'-55px'}}
                  onClick={() =>
                    navigateToPageWithData(PAGES.RESERVATION, {
                      target: 'venue',
                      id: venueId || 1,
                    })
                  }
                >
                  <HatchPattern opacity={0.8} />
                  {get('DiscoverPage1.1')}
                </SketchBtn>
              </div>
            </div>
           <div className="action-row">
            <SketchBtn 
                          className="sketch-button enter-button"  
                          variant="event" 
                          onClick={() =>
                          navigateToPageWithData(PAGES.RESERVATION, {
                            target: 'venue',
                            id: venueId || 1,
                          })
                        }
                      ><HatchPattern opacity={0.8} />
                          {get('DiscoverPage1.1')}
                        </SketchBtn>
          </div> 
                          <LoadingScreen 
                                    variant="cocktail"
                                    loadingText="Loading..."
                                    isVisible={isLoading} 
                                  />
        </div>
      </div>
    </>
  );
};

export default DiscoverPage;
