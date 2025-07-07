import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';
import '@components/SketchComponents.css';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';
import ApiClient from '@utils/ApiClient';
import { Filter, Star, Edit, Tag } from 'lucide-react';

import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const mockPromotions = [
  {
    id: 1,
    title: 'Summer Fest 2023',
    desc: 'Join the biggest summer event of the year with live performances and exclusive drinks.',
    date: '25th July 2023',
    img: '',
  },
  {
    id: 2,
    title: 'Autumn Bash',
    desc: 'Experience the charm of autumn with live jazz music and gourmet food stalls.',
    date: '10th October 2023',
    img: '',
  },
];

const PromotionManagement = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [promotions, setPromotions] = useState([]);
  const [originalPromotions, setOriginalPromotions] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { messages, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  useEffect(() => {
      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }
    }, [messages, currentLang]);


  // 프로모션 데이터 로딩
const fetchPromotions = async () => {
  setIsLoading(true);
  try {
    console.log('Fetching promotions for venue:', user?.venue_id);
    
    // 실제 API 호출
    const response = await ApiClient.postForm('/api/getVenuePromotion', {
      venue_id: user?.venue_id
    });

    console.log('✅ Venue promotions loaded:', response);
    
    const { data = [] } = response;
    setOriginalPromotions(data);
    setPromotions(data);
    
  } catch (error) {
    console.error('Failed to fetch promotions:', error);
    toast.error(get('PROMOTION_FETCH_ERROR'));
    setOriginalPromotions([]);
    setPromotions([]);
  } finally {
    setIsLoading(false);
  }
};

// 필터 적용
const handleApplyFilter = () => {
  const keyword = filterQuery.toLowerCase();
  const filtered = originalPromotions.filter(p =>
    p.title?.toLowerCase().includes(keyword) ||
    p.venue_name?.toLowerCase().includes(keyword)
  );
  setPromotions(filtered);
};

// 프로모션 삭제
const handleDeletePromotion = async (promotionId) => {
  const result = await Swal.fire({
    title: get('PROMOTION_DELETE_TITLE'),
    text: get('PROMOTION_DELETE_CONFIRM_TEXT'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: get('PROMOTION_DELETE_BUTTON'),
    cancelButtonText: get('PROMOTION_CANCEL_BUTTON'),
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  });

  if (result.isConfirmed) {
    try {
      // TODO: API 구현 후 실제 API 호출로 변경

      
      console.log('Deleting promotion:', promotionId);
      
      // 임시로 로컬 상태만 업데이트
      setPromotions(prev => prev.filter(p => p.promotion_id !== promotionId));
      setOriginalPromotions(prev => prev.filter(p => p.promotion_id !== promotionId));
      
      toast.success(get('PROMOTION_DELETE_SUCCESS'));
    } catch (error) {
      console.error('Failed to delete promotion:', error);
      toast.error(get('PROMOTION_DELETE_ERROR'));
    }
  }
};

// 프로모션 종료
const handleEndPromotion = async (promotionId) => {
  const result = await Swal.fire({
    title: get('PROMOTION_END_TITLE'),
    text: get('PROMOTION_END_CONFIRM_TEXT'),
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: get('PROMOTION_END_BUTTON'),
    cancelButtonText: get('PROMOTION_CANCEL_BUTTON'),
    confirmButtonColor: '#f39c12',
    cancelButtonColor: '#3085d6'
  });

  if (result.isConfirmed) {
    try {
      // TODO: API 구현 후 실제 API 호출로 변경

      const response = await ApiClient.postForm('/api/promotionEnd', {
        promotion_id: promotionId
      });
      
      console.log('Ending promotion:', promotionId);
      
      // 상태를 'end'로 업데이트 (UI와 일치하도록)
      setPromotions(prev => 
        prev.map(p => 
          p.promotion_id === promotionId 
            ? { ...p, status: 'end' } 
            : p
        )
      );
      setOriginalPromotions(prev => 
        prev.map(p => 
          p.promotion_id === promotionId 
            ? { ...p, status: 'end' } 
            : p
        )
      );
      
      toast.success(get('PROMOTION_END_SUCCESS'));
    } catch (error) {
      console.error('Failed to end promotion:', error);
      toast.error(get('PROMOTION_END_ERROR'));
    }
  }
};

  // 프로모션 편집 페이지로 이동
  const handleEditPromotion = (promotion) => {
    navigateToPageWithData(PAGES.CREATE_PROMOTION, {
      mode: 'edit',
      venue_id: user?.venue_id,
      promotionData: promotion
    });
  };

  // 새 프로모션 생성 페이지로 이동
  const handleCreatePromotion = () => {
    navigateToPageWithData(PAGES.CREATE_PROMOTION, {
      mode: 'create',
      venue_id: user?.venue_id
    });
  };

  useEffect(() => {
    fetchPromotions();
  }, [user]);

  return (
    <>
      <style jsx="true">{`
        .promotion-container {
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
          position: relative;
          z-index: 2;
          gap: 0.75rem;
        }

        .filter-input {
          flex: 1;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .create-btn-row {
          margin-bottom: 1rem;
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
        }

        .promotion-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
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

        .promotion-detail {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0.25rem 0;
          line-height: 1.4;
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
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .action-btn {
          min-width: 60px;
          font-size: 0.85rem;
          padding: 0.3rem 0.6rem;
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

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-badge.active {
          background-color: #dcfce7;
          color: #166534;
        }

        .status-badge.inactive {
          background-color: #fee2e2;
          color: #991b1b;
        }

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

          .filter-content {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-btn {
            justify-content: center;
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

          .promotion-image-container {
              position: relative;
              display: inline-block;
            }

            .promotion-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 8px;
            }

            .promotion-end-text {
              color: #ffffff;
              font-size: 1.2rem;
              font-weight: bold;
              text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
              letter-spacing: 1px;
            }

            /* 종료된 프로모션 카드 전체 스타일 (선택사항) */
            .promotion-card.ended {
              opacity: 0.8;
            }

            .promotion-card.ended .promotion-title {
              color: #6b7280;
            }

            .promotion-card.ended .promotion-details {
              opacity: 0.7;
            }
        }
      `}</style>
        <div className="promotion-container">
        <SketchHeader
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={18} />
              {get('PROMOTION_MANAGEMENT_TITLE')}
            </span>
          }
          showBack={true}
          onBack={goBack}
        />
        
        <div className="content-section">
          <div className="create-btn-row">
            <SketchBtn 
              variant="primary" 
              size="medium" 
              style={{ width: '100%' }} 
              onClick={handleCreatePromotion}
            >
              {get('PROMOTION_CREATE_BUTTON')}
              <HatchPattern opacity={0.6} />
            </SketchBtn>
          </div>

          <div className="promotions-list">
            {isLoading ? (
              <div className="empty-state">
                <h3>{get('PROMOTION_LOADING_TITLE')}</h3>
                <p>{get('PROMOTION_LOADING_MESSAGE')}</p>
              </div>
            ) : promotions.length > 0 ? (
              promotions.map((promotion, index) => (
                <SketchDiv
                  key={promotion.promotion_id}
                  className={`promotion-card ${index === -1 ? 'featured' : ''} ${promotion.status === 'end' ? 'ended' : ''}`}
                >
                  <HatchPattern opacity={0.4} />

                  <div className="promotion-content">
                    <div className="promotion-image-container">
                      <ImagePlaceholder
                        src={promotion.image_url}
                        alt={promotion.title}
                        className="promotion-image"
                      />
                      {promotion.status === 'end' && (
                        <div className="promotion-overlay">
                          <span className="promotion-end-text">{get('PROMOTION_END_BUTTON')}</span>
                        </div>
                      )}
                    </div>
                    <div className="promotion-info">
                      <h3 className="promotion-title">{promotion.title}</h3>
                      
                      <div className="promotion-details">
                        <div className="promotion-detail">
                          <span>{promotion.description}</span>
                        </div>
                        <div className="promotion-detail">
                          <span className="detail-label">{get('PROMOTION_DISCOUNT_LABEL')}</span>
                          <span>
                            {promotion.discount_type === 'percent' 
                              ? `${promotion.discount_value}%` 
                              : `${promotion.discount_value}won`
                            }
                          </span>
                        </div>
                        <div className="promotion-detail">
                          <span className="detail-label">{get('PROMOTION_PERIOD_LABEL')}</span>
                          <span>{promotion.start_date} ~ {promotion.end_date}</span>
                        </div>
                      </div>

                      {/* 종료된 프로모션이 아닐 때만 액션 버튼 표시 */}
                      {promotion.status !== 'end' && (
                        <div className="promotion-actions">
                          <SketchBtn 
                            size="small" 
                            className="action-btn" 
                            onClick={() => handleEditPromotion(promotion)}
                          >
                            <Edit size={13}/> {get('PROMOTION_EDIT_BUTTON')}
                          </SketchBtn>
                          <SketchBtn 
                            size="small" 
                            className="action-btn" 
                            variant="danger"
                            onClick={() => handleEndPromotion(promotion.promotion_id)}
                          >
                            {get('PROMOTION_END_BUTTON_SHORT')}
                          </SketchBtn>
                        </div>
                      )}
                    </div>
                  </div>
                </SketchDiv>
              ))
            ) : (
              <SketchDiv className="promotion-card">
                <HatchPattern opacity={0.02} />
                <div className="empty-state">
                  <h3>{get('PROMOTION_EMPTY_TITLE')}</h3>
                  <p>{get('PROMOTION_EMPTY_MESSAGE')}</p>
                </div>
              </SketchDiv>
            )}
          </div>
        </div>

        <ToastContainer
          position="bottom-center"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{
            borderRadius: '25px',
            fontSize: '14px',
            padding: '12px 20px'
          }}
        />
      </div>
    </>
  );
};

export default PromotionManagement; 