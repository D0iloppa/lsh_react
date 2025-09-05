import React, { useState, useEffect } from 'react';
import axios from 'axios';

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchMenuBtn from '@components/SketchMenuBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import {ChevronRight} from 'lucide-react';
import SketchHeader from '@components/SketchHeader';

import { Star, Edit3, User, Sparkles, Check } from 'lucide-react';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '@components/LoadingScreen';
import ApiClient from '@utils/ApiClient';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Profile = ({
  navigateToPageWithData,
  PAGES,
  goBack,
  ...otherProps
}) => {
  const { user, isActiveUser, isLoggedIn } = useAuth();
  const [userInfo, setUserInfo] = useState({});
  const [userReviews, setUserReviews] = useState([]);
  const API_HOST = import.meta.env.VITE_API_HOST; // ex: https://doil.chickenkiller.com/api
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const [iauData, setIauData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`${API_HOST}/api/getUserInfo`, {
          params: { user_id: user?.user_id}
        });
        setUserInfo(response.data || {});
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }

      const iau = await isActiveUser();
      console.log('IAU:', iau.isActiveUser);
      setIauData(iau);
    };

    const fetchUserReviews = async () => {
    try {
          const response = await axios.get(`${API_HOST}/api/getMyReviewList`, {
          params: { user_id: user?.user_id}
        });
        setUserReviews(response.data || []);
      } catch (error) {
        console.error('리뷰 목록 불러오기 실패:', error);
      }
    };

    fetchUserInfo();
    fetchUserReviews();
  }, [user, messages, currentLang]);

  // 1) 스크롤 복구: userReviews가 렌더링된 뒤에 적용
useEffect(() => {
  if (!userReviews || userReviews.length === 0) return;

  const raw = localStorage.getItem('profileScrollY');
  if (!raw) return;

  const y = parseInt(raw, 10);
  if (Number.isNaN(y)) return;

  const container = document.querySelector('.content-area');
  if (!container) return;

  // 다음 페인트 시점에 한 번
  requestAnimationFrame(() => {
    container.scrollTop = y;
  });

  // 이미지/폰트 로딩 등으로 레이아웃이 변하는 경우를 위한 보정(선택)
  const t = setTimeout(() => {
    container.scrollTop = y;
  }, 150);

  return () => clearTimeout(t);
}, [userReviews]);


  const handleDailyPassClick = () => {
  if (iauData?.isActiveUser) {
    // // 이미 활성화됨 알림
    // Swal.fire({
    //   title: get('reservation.daily_pass.purchase_button3'),
    //   text: get('SWAL_LAREADY_PURCHASE'),
    //   icon: 'info'
    // });
    return; // 페이지 이동 차단
  }
  
  // 구매 페이지로 이동
   navigate('/purchase');
};

  const handleBack = () => {
    navigateToPageWithData && navigateToPageWithData(PAGES.ACCOUNT);
  };

const edeitReview = (review) => {

  console.log('🌐 review:', review);

  const container = document.querySelector('.content-area');

      if (container) {
        const scrollY = container.scrollTop;
        localStorage.setItem('profileScrollY', scrollY.toString());
      }


    navigateToPageWithData && navigateToPageWithData(PAGES.SHARE_EXP, {
      mode:'edit',
      review:review,

      reservation_id : review.reservation_id,
      image : review.targetImage,
      user_id : review.user_id,
      target : review.target_type,
      target_id : review.target_id,
      targetName : review.targetName
    });
  }

// 리뷰 삭제 함수
const deleteReview = async (reviewId) => {
  try {
    // 삭제 확인 다이얼로그
    const result = await Swal.fire({
      title: get('REVIEW_DELETE_CONFIRM'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: get('PROMOTION_DELETE_BUTTON'),
      cancelButtonText: get('Reservation.CancelButton')
    });
    
    if (!result.isConfirmed) {
      return; // 사용자가 취소한 경우
    }

    const response = await ApiClient.postForm('/api/deleteReview', {
      user_id: user.user_id,
      review_id: reviewId
    });
    
    if (response == 1) {
      await Swal.fire({
        title: get('REVIEW_DELETE_SUCCESS'),
        icon: 'success',
        confirmButtonText: get('SWAL_CONFIRM_BUTTON')
      });
      
      const updatedReviews = userReviews.filter(review => review.review_id !== reviewId);
      setUserReviews(updatedReviews);
    } else {
      throw new Error(`서버 오류: ${response.status}`);
    }
  } catch (error) {
    console.error('리뷰 삭제 실패:', error);
    await Swal.fire({
      title: get('REVIEW_DELETE_ERROR'),
      icon: 'error',
      confirmButtonText: get('SWAL_CONFIRM_BUTTON')
    });
  }
};


  return (
    <>
      <style jsx="true">{`
       

        .account-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;
        }

        .content-section {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .profile-info {
          padding: 1.5rem;
          background-color: #fefefe;
          border: 0.8px solid #666;
          position: relative;
          overflow: hidden;
          border-top-left-radius: 15px 8px;
          border-top-right-radius: 8px 12px;
          border-bottom-right-radius: 12px 6px;
          border-bottom-left-radius: 6px 14px;
          transform: rotate(-0.1deg);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          position: relative;
          z-index: 2;
        }

        .profile-image {
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #94fff9, rgb(255, 219, 158));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          border: 0.8px solid #666;
          transform: rotate(2deg);
          position: relative;
        }

        .profile-details h2 {
          margin: 0 0 0.25rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .profile-details p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .profile-stats {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          position: relative;
          z-index: 2;
        }

        .stat-item {
          text-align: center;
          flex: 1;
        }

        .stat-number {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          display: block;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .reviews-section {
          padding: 1.5rem;
          background-color: #fefefe;
          border: 0.8px solid #666;
          position: relative;
          overflow: hidden;
          border-top-left-radius: 12px 15px;
          border-top-right-radius: 14px 8px;
          border-bottom-right-radius: 8px 12px;
          border-bottom-left-radius: 10px 6px;
        }

        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.3rem;
            position: relative;
            z-index: 2;
            padding-bottom: 12px;
            border-bottom: 1px solid #d7d7d7;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .view-all-btn {
          font-size: 0.875rem;
          color: #6b7280;
          text-decoration: underline wavy #999;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }

        .review-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem 0.5rem;
          border-bottom: 1px dashed #a7a7a7;
        }

        .review-content {
          flex: 1;
        }

        .review-venue {
           display: flex;
           justify-content: space-between; /* 좌우 양끝 정렬 */
           align-items: center; /* 세로 중앙 정렬 */
           width: 100%; /* 전체 너비 사용 */
        }
           .venue-info {
              display: flex;
              align-items: center;
              gap: 0.25rem; /* 아이콘과 텍스트 간격 */
              max-width: 226px;
            }

        .review-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-bottom: 0.25rem;
        }

        .review-text {
          font-size: 0.75rem;
          color: #6b7280;
          line-height: 1.4;
          margin-bottom: 0.25rem;
        }

        .review-date {
          font-size: 0.7rem;
          color: #9ca3af;
        }
          .profile-image {
              width: 100px;
              height: 100px;
              border-radius: 50%;
              overflow: hidden;
              background: linear-gradient(135deg, #94fff9, rgb(255, 219, 158));
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.25rem;
              font-weight: bold;
              color: white;
              border: 0.8px solid #666;
              transform: rotate(2deg);
              position: relative;
            }

            .profile-image img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 50%;
            }

            .icon-tiny {
                width: 16px;
                height: 16px;
                margin-right: 4px;
                vertical-align: middle;
              }

              /* 매니저 답변 스타일 (기존) */
          .manager-response {
            background-color: #f0f9ff;
            border: 1px solid #e0f2fe;
            border-left: 4px solid #0284c7;
            border-radius: 8px;
            padding: 0.75rem;
            margin-top: 0.75rem;
            position: relative;
          }

          /* 스태프 답변 스타일 (노란색) */
          .manager-response.staff-response {
            background-color: #fffbeb;
            border: 1px solid #fed7aa;
            border-left: 4px solid #f59e0b;
          }

          .response-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
          }

          .response-label {
            font-size: 0.8rem;
            color: #0369a1;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          /* 스태프 답변일 때 라벨 색상 */
          .staff-response .response-label {
            color: #d97706;
          }

          .response-badge {
            background-color: #0284c7;
            color: white;
            font-size: 0.7rem;
            padding: 0.1rem 0.3rem;
            border-radius: 12px;
            font-weight: 500;
          }

          /* 스태프 답변일 때 배지 색상 */
          .staff-response .response-badge {
            background-color: #f59e0b;
          }

          .response-text {
            font-size: 0.9rem;
            color: #1e40af;
            line-height: 1.4;
            font-style: italic;
          }

          /* 스태프 답변일 때 텍스트 색상 */
          .staff-response .response-text {
            color: #92400e;
          }

         .btn-set {
            display: flex;
            justify-content: flex-end; /* 오른쪽 정렬 */
            align-items: center; /* 세로 중앙 정렬 */
            gap: 3px;
            flex-shrink: 0; /* 줄어들지 않도록 고정 */
            min-width: 80px; /* 최소 너비 보장 */
          }

        .delete-btn {    
          padding: 1px 7px; 
          background: #fb7272;
          border-radius: 12px;
          color: white;
          font-size: 0.75rem;
          cursor: pointer;
          transition: background-color 0.2s;
          border: none;
          white-space: nowrap; 
        }

        .edit-btn {
          padding: 1px 7px;
          background:rgb(84, 98, 223);
          border-radius: 12px;
          color: white;
          font-size: 0.75rem;
          cursor: pointer;
          transition: background-color 0.2s;
          border: none;
          white-space: nowrap; /* 텍스트 줄바꿈 방지 */
        }

       .modify-btn {
          padding: 3px 10px;
          background: #ebebeb;
          border-radius: 12px;
          color: #666;
          font-size: 0.75rem;
          cursor: pointer;
          transition: background-color 0.2s;
          border: none;
          white-space: nowrap; /* 텍스트 줄바꿈 방지 */
        }

        .empty-reviews {
          text-align: center;
          padding: 1rem 1rem;
          color: #9ca3af;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.6;
        }

        .empty-text {
          font-size: 1rem;
          color: #6b7280;
          margin: 0;
          font-style: italic;
        }
          .daily-stats {margin-top: 1.5rem;     box-shadow: 4px 4px 0px #49dde4; display:none;}
      `}</style>

      <div className="account-container">
        <SketchHeader
          title={get('Menu1.12')}
          showBack={true}
          onBack={handleBack}
          rightButtons={[]}
        />

        <div className="content-section">
          <SketchDiv className="profile-info">
            <HatchPattern opacity={0.4} />

            <div className="profile-header">
              <div className="profile-image">
                <img src={userInfo.image_url} alt="profile" />
            </div>
              <div className="profile-details">
                <h2>{userInfo?.nickname || get('PROFILE_NO_NICKNAME')}</h2>
                {/*<p>{userInfo?.email || get('PROFILE_NO_EMAIL')}</p>*/}
                <p>{userInfo?.created_at
                  ? `${get('PROFILE_MEMBER_SINCE')} ${new Date(userInfo.created_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })}`
                  : get('PROFILE_NO_JOIN_DATE')}</p>
              </div>
            </div>
            <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{userInfo?.booking_cnt ?? 0}</span>
              <span className="stat-label">{get('BookingSum1.1')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userInfo?.review_cnt ?? 0}</span>
              <span className="stat-label">{get('Profile1.1')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userInfo?.favorites_cnt ?? 0}</span>
              <span className="stat-label">{get('Menu1.8')}</span>
            </div>
          </div>

           <SketchBtn 
            className={`daily-stats ${iauData?.isActiveUser ? 'active' : ''}`}
            variant={iauData?.isActiveUser ? 'success' : 'event'}
            onClick={handleDailyPassClick}
          >
            {iauData?.isActiveUser ? (
              <>
                <Check size={16} style={{ marginRight: '0.5rem' }} />
                {get('reservation.daily_pass.purchase_button3')}
              </>
            ) : (
              <>
                {get('reservation.daily_pass.purchase_button2')} 
                <Sparkles size={16} color='#448e8d' style={{ marginLeft: '0.5rem' }} />
              </>
            )}
          </SketchBtn>
          </SketchDiv>

          <SketchDiv className="reviews-section">
            <HatchPattern opacity={0.02} />
            <div className="section-header">
              <h3 className="section-title">{get('Profile1.2')}</h3>
            </div>

            <div className="reviews-list">
              {userReviews.length > 0 ? (
                userReviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-content">
                      <div className="review-venue">
                        <div className="venue-info">
                          {review.target_type === 'venue' && (
                            <svg className="icon-tiny" viewBox="0 0 24 24">
                              <path d="M3 9L12 2L21 9V20A1 1 0 0 1 20 21H4A1 1 0 0 1 3 20V9Z" stroke="black" strokeWidth="1.5" fill="none"/>
                              <path d="M9 21V12H15V21" stroke="black" strokeWidth="1.5" fill="none"/>
                            </svg>
                          )}
                          {review.target_type === 'staff' && (
                            <svg className="icon-tiny" viewBox="0 0 24 24">
                              <circle cx="12" cy="7" r="4" stroke="black" strokeWidth="1.5" fill="none"/>
                              <path d="M5.5 21a6.5 6.5 0 0 1 13 0" stroke="black" strokeWidth="1.5" fill="none"/>
                            </svg>
                          )}
                          <span>{review.venue_name}</span>
                        </div>
                        <div className='btn-set'>
                          <button 
                            style={{marginRight: '0.3rem'}}
                            className='edit-btn' onClick={() => edeitReview(review)}>
                            {get('PROMOTION_EDIT_BUTTON')}
                          </button>

                          <button className='delete-btn' onClick={() => deleteReview(review.review_id)}>
                            {get('PROMOTION_DELETE_BUTTON')}
                          </button>
                        </div>
                      </div>

                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < review.rating ? '#fbbf24' : 'none'}
                            color={i < review.rating ? '#fbbf24' : '#d1d5db'}
                          />
                        ))}
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.25rem' }}>
                          {review.rating}/5
                        </span>
                      </div>
                      <div className="review-text">{review.content}</div>
                      <div className="review-date">
                        {review.created_at
                          ? new Date(review.created_at).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false
                            }).replace(/\./g, '-').replace(' ', ' ').replace(/- /g, '-')
                          : ''}
                      </div>
                      {review.reply_content && (
                        <div className={`manager-response ${review.target_type === 'staff' ? 'staff-response' : ''}`}>
                          <div className="response-header">
                            <span className="response-label">
                              {review.target_type === 'venue' 
                                ? get('REVIEW_MANAGER_RESPONSE') 
                                : get('REVIEW_STAFF_RESPONSE')
                              }
                            </span>
                            <span className="response-badge"><User size={14} /></span>
                          </div>
                          <div className="response-text">
                            "{review.reply_content}"
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-reviews">
                  <p className="empty-text">{get('Review3.5')}</p>
                </div>
              )}
            </div>
          </SketchDiv>
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

export default Profile;
