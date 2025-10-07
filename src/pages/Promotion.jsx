import React, { useState, useEffect } from 'react';
import axios from 'axios';

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchInput from '@components/SketchInput';
import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';
import SketchHeader from '@components/SketchHeaderMain';
import { MapPin, Filter, Star } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import LoadingScreen from '@components/LoadingScreen';

const PromotionsPage = ({
  navigateToPage,
  navigateToPageWithData,
  navigateToMap,
  PAGES,
  goBack,
  keyword = '',
  ...otherProps
}) => {
  const [filterQuery, setFilterQuery] = useState(keyword);
  const { user, exts: { venueCatMap } } = useAuth();
  const [promotions, setPromotions] = useState([]);
  const [venueId, setVenueId] = useState(otherProps?.venueId || null);
  const [originalPromotions, setOriginalPromotions] = useState([]);
  const API_HOST = import.meta.env.VITE_API_HOST;
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  const handleBack = () =>{

    const rankingFromPage = localStorage.getItem('themeSource');
    console.log("rankingFromPage", rankingFromPage);

    switch (rankingFromPage) {
      case 'BARLIST':
        localStorage.removeItem('themeSource');
        navigateToPage(PAGES.BARLIST);
        break;
      case 'MASSAGELIST':
        localStorage.removeItem('themeSource');
        navigateToPage(PAGES.MASSAGELIST);
        break;
      default:
         navigateToPage(PAGES.HOME);
        break;
    }

   
    //goBack();
  }

 useEffect(() => {
     window.scrollTo(0, 0);
 
     if (messages && Object.keys(messages).length > 0) {
         console.log('✅ Messages loaded:', messages);
         // setLanguage('en'); // 기본 언어 설정
         console.log('Current language set to:', currentLang);
         window.scrollTo(0, 0);
       }
 
     const fetchPromotion = async () => {
 
 
       const params = {
         lang: currentLang,
       }
 
       if(venueId) {
         params.venue_id = venueId;
       }
 
       console.log("getPromotion params", params);
       try {
 
       // venueCatMap 데이터 가져오기
       const vcm = await venueCatMap();
       const themeSource = localStorage.getItem('themeSource');
         
         const response = await axios.get(`${API_HOST}/api/getPromotion`,{
           params: params
         });
         const data = response.data || [];

         //console.log("프로모션 데이터:", data);
 
         // reviewsData에 cat_nm을 매칭해서 추가
         const proWithCat = data.map(r => {
           const catInfo = vcm.find(v => v.venue_id === r.venue_id);
           return {
             ...r,
             cat_nm: catInfo ? catInfo.cat_nm : null, // 없으면 null
             cat_id: catInfo ? catInfo.cat_id : null // 없으면 null
           };
         });
 
         //console.log("매칭된 프로모션 데이터:", themeSource, proWithCat);
 
         let filteredPro = proWithCat;
         if (themeSource === 'BARLIST') {
           filteredPro = proWithCat.filter(r => r.cat_id === 1);
         } else if (themeSource === 'MASSAGELIST') {
           filteredPro = proWithCat.filter(
             r => r.cat_id === 2 || r.cat_id === 3
           );
         }
 
 
 
         setOriginalPromotions(filteredPro);
 
          // ✅ keyword가 있으면 자동 검색 실행
       if (keyword && keyword.trim() !== '') {
         const lowerKeyword = keyword;
         const filtered = filteredPro.filter(p =>
           p.venue_name?.includes(lowerKeyword)
         );
         
         setPromotions(filtered);
       } else {
         setPromotions(filteredPro);
       }
 
 
 
 
 
 
 
 
 
 
 
 
       } catch (error) {
         console.error('프로모션 정보 불러오기 실패:', error);
       }
     };
 
     fetchPromotion();
 
     window.scrollTo(0, 0);
       const container = document.querySelector('.content-area');
       container.scrollTop=0;
   }, [user, messages, currentLang]);

  useEffect(() => {
    const resetPromotionScroll = () => {
      const savedScrollY = localStorage.getItem('promotionScrollY');
      console.log("INIT promotionScrollY", savedScrollY);

      if (savedScrollY !== null) {
        const scrollY = parseInt(savedScrollY, 10);
        const container = document.querySelector('.content-area');

        let checkCount = 0;
        const maxChecks = 30;

        const checkReadyAndScroll = () => {
          const container = document.querySelector('.content-area');
          if (!container) {
            console.log('⏳ .content-area 아직 없음');
            requestAnimationFrame(checkReadyAndScroll);
            return;
          }

          const scrollReady = container.scrollHeight > container.clientHeight + 10;

          if (scrollReady) {
            container.scrollTop = scrollY;
            console.log('✅ promotionScrollY 복원 완료:', scrollY);
            // localStorage.removeItem('promotionScrollY'); // 필요 시 제거
          } else {
            checkCount++;
            if (checkCount < maxChecks) {
              requestAnimationFrame(checkReadyAndScroll);
            } else {
              console.warn('⚠️ promotionScrollY 복원 실패: 조건 만족 못함');
            }
          }
        };

        requestAnimationFrame(checkReadyAndScroll);
      }
    };

    resetPromotionScroll();

    // DOM 렌더링 후 한 번 더 시도
    setTimeout(resetPromotionScroll, 500);
  }, []);


  const handleApplyFilter = () => {
    const keyword = filterQuery.toLowerCase();
    const filtered = originalPromotions.filter(p =>
      p.venue_name?.toLowerCase().includes(keyword)
    );
    setPromotions(filtered);
  };

  const handleBookNow = (promotion) => {

    if(promotion.target_type == 'admin') {
        Swal.fire({
              title: get('ADMIN_SWAL_TITLE'),
              text: get('ADMIN_SWAL_CONTENT'),
              icon: 'info',
              confirmButtonText: get('INQUIRY_CONFIRM'),
              confirmButtonColor: '#3085d6'
          });

          return;
    }

    const container = document.querySelector('.content-area');

    if (container) {
      const scrollY = container.scrollTop;
      localStorage.setItem('promotionScrollY', scrollY.toString());
    }

      navigateToPageWithData && navigateToPageWithData(PAGES.DISCOVER, {
      venueId:promotion.venue_id
    });

    // navigateToPageWithData && navigateToPageWithData(PAGES.RESERVATION, {
    //   target: promotion.target_type,
    //   id: (promotion.target_type == 'venue') ? promotion.venue_id : promotion.target_id,
    //   staff: (promotion.target_type == 'staff') ? { name : promotion.venue_name}  : {}
    // });
  };

  const handleShare = (promotion) => {
    navigateToMap({
      initialKeyword: promotion.venue_name,
      searchFrom: 'home',
    });
  };

  return (
    <>
      <style jsx="true">{`
          .promotions-container {
            max-width: 28rem;
            margin: 0 auto;
            background-color: white;
            min-height: 100vh;
            position: relative;
          }

          .content-section {
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .filter-section {
            padding: 1.25rem;
            background-color: #fefefe;
            border: 0.8px solid #666;
            position: relative;
            overflow: hidden;
            border-radius: 12px;
          }

          .filter-content {
              display: flex;
              align-items: center;
              flex-direction: row;   /* ✅ 항상 가로 */
              justify-content: space-between;
              width:92%;
              margin-left:3%;
              margin-top:3%;
              gap: 8px;              /* 입력창과 버튼 사이 여백 */
            }

            .filter-input {
              flex: 8;               /* ✅ 입력창이 남는 공간을 차지 */
            }

            .filter-btn {
              flex: 2;               /* ✅ 비율 2 */
              display: flex;
              align-items: center;
              justify-content: center;
              height:45px;
            }


          .promotion-card {
            padding: 0;
            background-color: #fefefe;
            border: 0.8px solid #666;
            position: relative;
            overflow: hidden;
            border-radius: 12px;
            transition: all 0.2s;
            margin-bottom: 20px;
          }

          

          .promotion-card:nth-child(even) {
            transform: rotate(0.3deg);
          }

          .promotion-card:nth-child(odd) {
            transform: rotate(-0.2deg);
          }

          .promotion-card:hover {
            box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
          }

          .promotion-card:nth-child(even):hover {
            transform: rotate(0.3deg) scale(1.01);
          }

          .promotion-card:nth-child(odd):hover {
            transform: rotate(-0.2deg) scale(1.01);
          }

          .promotion-content {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            padding: 1rem;
          }

          .promotion-image {
            width: 100%;
            height: 200px;              /* 높이 고정 */
            object-fit: cover;          /* 비율 유지하면서 잘림 */
            object-position: center;    /* 가운데 기준 */
            border-bottom: 0.8px solid #666;
          }

          .promotion-info {
            padding: 1.25rem;
          }

          .promotion-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 0.75rem 0;
            line-height: 1.2;
          }

          .promotion-details {
            margin-bottom: 1rem;
          }
            
        .sketch-input-group {
          margin-bottom: 0rem; 
        }

          .promotion-detail {
            font-size: 0.875rem;
            color: #6b7280;
            margin: 0.25rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .detail-label {
            font-weight: 500;
            color: #374151;
            min-width: 3rem;
          }

          .promotion-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.75rem;
            margin-top: 1rem;
          }

          .book-btn-wrapper {
            flex: 1;
          }

          .share-btn {
            width: 2.5rem;
            height: 2.5rem;
            background-color: #f8fafc;
            border: 0.8px solid #666;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            transform: rotate(2deg);
            flex-shrink: 0;
          }

          .share-btn:hover {
            background-color: #e2e8f0;
            transform: rotate(2deg) scale(1.05);
            box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
          }

          .promotion-card.featured {
            border-color: #38bdf8;
            background-color: #e0f2fe;
          }

          .featured-star {
                position: absolute;
                top: 0.95rem;
                right: 0.95rem;
                z-index: 3;
                width: 28px;
                height: 28px;
                stroke: #ffffff;
          }
          // .promotion-card.featured::before {
          //   content: '⭐';
          //   position: absolute;
          //   top: 0.95rem;
          //   right: 0.95rem;
          //   font-size: 1.5rem;
          //   z-index: 3;
          // }

          .empty-state {
            text-align: center;
            padding: 3rem 1.5rem;
            color: #6b7280;
          }

          .empty-state h3 {
            font-size: 1.125rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
            color: #374151;
          }

          .empty-state p {
            font-size: 0.875rem;
            line-height: 1.5;
          }

          @media (max-width: 480px) {
            .content-section {
              padding: 1rem;
            }

            .promotion-info {
              padding: 1rem;
            }

            .promotion-title {
              font-size: 1.1rem;
            }

            .promotion-actions {
              flex-direction: row;
              gap: 0.75rem;
              align-items: center;
            }

            .book-btn-wrapper {
              justify-content: center;
            }

            .share-btn {
              align-self: auto;
            }
          }
        `}</style>

      <div className="promotions-container">
        <SketchHeader title={get('btn.promotion.1')} showBack={true} onBack={handleBack}
          rightButtons={[]} />

               <SketchDiv className="" style={{ border: "none" }}>

            <HatchPattern opacity={0.02} />
            <div className="filter-content">
              <div className="filter-input">
                <SketchInput
                  type="text"
                  placeholder={get('Promotion1.1')}
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyFilter();
                    }
                  }}
                />
              </div>
              <SketchBtn
                variant="event"
                size="small"
                onClick={handleApplyFilter}
                className="filter-btn"
              >
                <HatchPattern opacity={0.8} />
              
                {get('btn.search.1')}
              </SketchBtn>
            </div>
          </SketchDiv>

        <div className="content-section">
     

          <div className="promotions-list">
            {promotions.length > 0 ? (
              promotions.map((promotion, index) => (
                <SketchDiv
                  key={promotion.id}
                  className={`promotion-card ${index === 0 ? 'featured' : ''}`}
                >
                  <HatchPattern opacity={0.4} />

                 {/* featured일 때만 별 아이콘 표시 */}
                  {index === 0 && (
                    <Star 
                      size={24} 
                      className="featured-star" 
                      fill="#fbbf24" 
                      color="#fbbf24"
                    />
                  )}

                  <div className="promotion-content">
                    <ImagePlaceholder
                      src={promotion.image_url}
                      alt={promotion.title}
                      className="promotion-image"
                    />
                    <div className="promotion-info">
                      <h3 className="promotion-title">{promotion.title}</h3>
                      <div className="promotion-detail">
                        <span className="detail-label">{get('title.text.14')} : </span>
                        <span>{promotion.venue_name}</span>
                      </div>
                      <div className="promotion-details">
                        <div className="promotion-detail">
                          <span className="detail-label">{get('BookingSum1.2')} : </span>
                          <span>
                            {promotion.start_date} ~
                          </span>
                        </div>
                        <div className="promotion-detail">
                          <span className="detail-label" 
                            style={{alignSelf: 'flex-start'}}
                          >
                            {get('Promotion1.2')} : 
                          </span>
                          <span>{promotion.description}</span>
                        </div>
                      </div>

                      <div className="promotion-actions">
                        <div className="book-btn-wrapper">
                          <SketchBtn
                            variant="primary"
                            size="medium"
                            onClick={() => handleBookNow(promotion)}
                          >
                            {get('COMMON_VIEW_DETAILS')}
                          </SketchBtn>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                </SketchDiv>
              ))
            ) : (
              <SketchDiv className="promotion-card">
                <HatchPattern opacity={0.02} />
                <div className="empty-state">
                  <h3>{get('Promotion1.3')}</h3>
                  <p>{get('Promotion1.4')}</p>
                </div>
              </SketchDiv>
            )}
              <LoadingScreen 
                variant="cocktail"
                loadingText="Loading..."
                isVisible={isLoading} 
              />
          </div>
        </div>
      </div>
    </>
  );
};

export default PromotionsPage;
