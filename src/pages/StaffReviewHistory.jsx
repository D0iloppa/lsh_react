import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import HatchPattern from '@components/HatchPattern';
import ImagePlaceholder from '@components/ImagePlaceholder';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { Filter, Star, Edit, Trash2, Eye, MessagesSquare, ChevronDown, ChevronUp, Send, Store, User, AlertTriangle, Siren } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';
import { overlay } from 'overlay-kit';
import LoadingScreen from '@components/LoadingScreen';

const StaffReviewHistory = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [ratingFilter, setRatingFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [openResponses, setOpenResponses] = useState({});
  const [responses, setResponses] = useState({});
  const [reviews, setReviews] = useState([]);
  const [originalReviews, setOriginalReviews] = useState([]); // 원본 데이터 보관
  
  // 신고 모달 관련 상태
  const [selectedReview, setSelectedReview] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const { user } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  console.log('user', user)

  const venue_id = user.venue_id;
  const target_id = user.staff_id;


  const registerReader = async (reviewId) => {
        try {
          if (!user?.staff_id || !reviewId) {
            console.warn('staff ID 또는 Review ID가 없어서 registerReader를 건너뜁니다.');
            return;
          }

          const response = await ApiClient.postForm('/api/registerReader', {
            target_table: 'StaffReviews',
            target_id: reviewId,           // 각 리뷰의 ID
            reader_type: 'staff',
            reader_id: user.staff_id
          });

          console.log('✅ registerReader 성공:', response);
          
        } catch (error) {
          console.error('❌ registerReader 실패:', error);
        }
      };

  useEffect(() => {
      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }
    }, [messages, currentLang]);
    
  // 오늘 날짜인지 확인하는 함수
  const isToday = (dateString) => {
    if (!dateString) return false;
    // 마이크로초 및 공백 제거
    const safeDateString = dateString.replace(' ', 'T').split('.')[0];
    const today = new Date();
    const reviewDate = new Date(safeDateString);

    return today.getFullYear() === reviewDate.getFullYear() &&
           today.getMonth() === reviewDate.getMonth() &&
           today.getDate() === reviewDate.getDate();
  };

  // 필터링 및 정렬 함수
  const applyFilters = () => {
    let filtered = [...originalReviews];

    // Rating 필터 적용
    if (ratingFilter !== 'All') {
      if (ratingFilter === '5.0') {
        filtered = filtered.filter(review => review.rating === 5);
      } else if (ratingFilter === '4.0+') {
        filtered = filtered.filter(review => review.rating >= 4);
      } else if (ratingFilter === '3.0+') {
        filtered = filtered.filter(review => review.rating >= 3);
      }
    }

    // 날짜 필터 적용
    if (dateFilter === 'Newest') {
      // 오늘 작성된 리뷰만 보여주기
      filtered = filtered.filter(review => isToday(review.created_at));
    } else if (dateFilter === 'Oldest') {
      // 오늘이 아닌 리뷰들만 보여주기
      filtered = filtered.filter(review => !isToday(review.created_at));
    }

    // 날짜순 정렬
     filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      
      if (dateFilter === 'Newest') {
        return dateB - dateA; // 최신순 (오늘 리뷰들 중에서)
      } else if (dateFilter === 'Oldest') {
        return dateA - dateB; // 오래된순 (과거 리뷰들 중에서)
      } else {
        // 🎯 'All'일 때는 최신순 유지 (원본 순서 또는 최신순)
        return dateB - dateA; // 최신순으로 기본 정렬
      }
    });

    setReviews(filtered);
  };

  // 필터가 변경될 때마다 적용
  useEffect(() => {
    applyFilters();
  }, [ratingFilter, dateFilter, originalReviews]);

  useEffect(() => {
    const loadVenueReview = async () => {
      if (!venue_id || !target_id) return;

      try {
        const response = await ApiClient.postForm('/api/getStaffReviewList', {
          venue_id: venue_id,
          target_id: target_id
        });

        console.log('responseReview', response);

        const data = Array.isArray(response) ? response : [];
        const staffReviews = data.filter(review => review.target_type === 'staff');

        // 원본 데이터 저장
        setOriginalReviews(staffReviews);

         // 각 리뷰에 대해 registerReader 호출
          if (staffReviews && staffReviews.length > 0) {
            for (const review of staffReviews) {
              await registerReader(review.review_id || review.id);
            }
          }
       
      } catch (error) {
        setOriginalReviews([]);
        setReviews([]);
        console.error('리뷰 로딩 실패:', error);
      }
    };

    loadVenueReview();
  }, [venue_id, target_id]);

  // 답변 영역 토글
  const toggleResponse = (reviewId) => {
    setOpenResponses(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
    
    // 답변 창을 열 때 기존 답변이 있으면 responses에 설정
    if (!openResponses[reviewId]) {
      const currentReview = reviews.find(review => (review.review_id || review.id) === reviewId);
      const existingResponse = currentReview?.reply_content || currentReview?.response;
      if (existingResponse) {
        setResponses(prev => ({
          ...prev,
          [reviewId]: existingResponse
        }));
      }
    }
  };

  // 답변 텍스트 변경
  const handleResponseChange = (reviewId, text) => {
    setResponses(prev => ({
      ...prev,
      [reviewId]: text
    }));
  };

  // 답변 제출
const handleSubmitResponse = async (reviewId) => {
  let responseText = responses[reviewId];
  
  const currentReview = reviews.find(review => (review.review_id || review.id) === reviewId);
  const existingResponse = currentReview?.reply_content || currentReview?.response;
  
  if (!responseText || responseText.trim() === '') {
    if (!existingResponse) {
      Swal.fire({
        title: get('REVIEW_INPUT_ERROR_TITLE'),
        text: get('REVIEW_INPUT_ERROR_MESSAGE'),
        icon: 'warning',
        confirmButtonText: get('SWAL_CONFIRM_BUTTON'),
        confirmButtonColor: '#f59e0b'
      });
      return;
    }
    responseText = existingResponse;
  }

  try {
    const response = await ApiClient.postForm('/api/updateReplyContent', {
      review_id: reviewId,
      venue_id: venue_id,
      reply_content: responseText
    });

    console.log('답변 등록 응답:', response);

    // 원본 데이터와 필터된 데이터 모두 업데이트
    setOriginalReviews(prev => prev.map(review => 
      (review.review_id || review.id) === reviewId 
        ? { ...review, reply_content: responseText }
        : review
    ));

    setResponses(prev => ({
      ...prev,
      [reviewId]: ''
    }));
    setOpenResponses(prev => ({
      ...prev,
      [reviewId]: false
    }));

    Swal.fire({
      title: get('REVIEW_SUBMIT_SUCCESS_TITLE'),
      text: get('REVIEW_SUBMIT_SUCCESS_MESSAGE'),
      icon: 'success',
      confirmButtonText: get('SWAL_CONFIRM_BUTTON'),
      confirmButtonColor: '#10b981'
    });

  } catch (error) {
    console.error('답변 등록 실패:', error);
    Swal.fire({
      title: get('SWAL_ERROR_TITLE'),
      text: get('REVIEW_SUBMIT_ERROR_MESSAGE'),
      icon: 'error',
      confirmButtonText: get('SWAL_CONFIRM_BUTTON'),
      confirmButtonColor: '#ef4444'
    });
  }
};

  // 별점 렌더링 함수
  const renderStars = (rating) => {
    return (
      <>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            fill={i < rating ? '#fbbf24' : 'none'}
            color={i < rating ? '#fbbf24' : '#d1d5db'}
            style={{ marginRight: 2 }}
          />
        ))}
      </>
    );
  };

  // 신고 모달 열기
  const handleReport = async (review) => {
    // 중복 신고 확인을 위한 API 호출
    try {
      const checkPayload = {
        target_id: review.review_id,
        reporter_id: user.staff_id
      };
      
      const checkResponse = await ApiClient.postForm('/api/isAlreadyReported', checkPayload);
      
      // 이미 신고한 이력이 있는 경우 (res > 0)
      if (checkResponse && checkResponse > 0) {
        Swal.fire({
          title: get('MENU_NOTIFICATIONS'),
          text: get('MENU_NOTIFICATIONS2'),
          icon: 'warning',
          confirmButtonText: get('BUTTON_CONFIRM'),
          confirmButtonColor: '#f59e0b'
        });
        return;
      }
    } catch (error) {
      console.error('신고 이력 확인 실패:', error);
      // 에러가 발생해도 신고 모달은 열 수 있도록 함
    }

    // 중복 신고가 아닌 경우에만 모달 열기
    setSelectedReview(review);
    setReportReason('');
    
    overlay.open(({ isOpen, close, unmount }) => {
      // 모달 내부에서 사용할 로컬 상태
      let localReportReason = '';
      let localIsSubmitting = false;
      
      const updateLocalReason = (value) => {
        localReportReason = value;
        setReportReason(value); // 외부 상태도 업데이트
      };
      
      const handleLocalSubmit = async () => {
        if (!localReportReason.trim()) {
          Swal.fire({
            title: get('MENU_NOTIFICATIONS'),
            text: get('REPORT_REASON_REQUIRED_TEXT'),
            icon: 'warning',
            confirmButtonText: get('BUTTON_CONFIRM'),
            confirmButtonColor: '#f59e0b'
          });
          return;
        }

        localIsSubmitting = true;
        setIsSubmittingReport(true);

        try {
          // API 호출을 위한 payload 구성
          const reportPayload = {
            reporter_id: user.staff_id,
            target_type: 'review',
            target_id: review.review_id,
            reason: localReportReason.trim(),
            status: 'pending',
            reporter_type: user.type || 'staff'
          };

          console.log('신고 제출 payload:', reportPayload);

          // TODO: API 엔드포인트가 준비되면 아래 주석 해제
          const response = await ApiClient.postForm('/api/insertReport', reportPayload);
          console.log('신고 제출 응답:', response);

          // 임시로 성공 메시지 표시
          Swal.fire({
            title: get('REPORT_SUBMITTED_TITLE'),
            text: get('REPORT_SUBMITTED_TEXT'),
            icon: 'success',
            confirmButtonText: get('BUTTON_CONFIRM'),
            confirmButtonColor: '#10b981'
          });

          unmount();
          setSelectedReview(null);
          setReportReason('');
          setIsSubmittingReport(false);

        } catch (error) {
          console.error('신고 제출 실패:', error);
          Swal.fire({
           title: get('REPORT_SUBMIT_FAILED_TITLE'),
            text: get('REPORT_SUBMIT_FAILED_TEXT'),
            icon: 'error',
            confirmButtonText: get('BUTTON_CONFIRM'),
            confirmButtonColor: '#ef4444'
          });
        } finally {
          localIsSubmitting = false;
          setIsSubmittingReport(false);
        }
      };

      return (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              unmount();
            }
          }}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '500px',
              width: '90%',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => unmount()}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                zIndex: 1
              }}
            >
              ×
            </button>

            <div style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '0.5rem',
                  color: '#ef4444'
                }}>
                  <AlertTriangle size={16} />
                  <span style={{ fontWeight: '600' }}>{get('REPORT_TARGET_REVIEW')}</span>
                </div>
                {review && (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    color: '#374151'
                  }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>{get('REVIEW_AUTHOR_LABEL')}</strong> {review.user_name || review.name}
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>{get('REVIEW_RATING_LABEL')}</strong> {renderStars(review.rating)}
                    </div>
                    <div>
                      <strong>{get('REVIEW_CONTENT_LABEL')}</strong> "{review.content || review.review_content}"
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {get('REPORT_REASON_LABEL')}
                </label>
                <textarea
                  defaultValue=""
                  onChange={(e) => updateLocalReason(e.target.value)}
                  placeholder={get('REPORT_REASON_PLACEHOLDER')}
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontFamily: 'BMHanna, Comic Sans MS, cursive, sans-serif',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                justifyContent: 'flex-end',
                marginTop: '1.5rem'
              }}>
                <SketchBtn
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    unmount();
                    setSelectedReview(null);
                    setReportReason('');
                    setIsSubmittingReport(false);
                  }}
                >
                  {get('Common.Cancel')}
                </SketchBtn>
                <SketchBtn
                  variant="danger"
                  size="small"
                  onClick={handleLocalSubmit}
                >
                  {localIsSubmitting ? get('BUTTON_SUBMITTING') : get('BUTTON_SUBMIT_REPORT')}
                </SketchBtn>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };


  return (
    <>
      <style jsx="true">{`
        .review-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          padding-bottom: 1rem;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          padding:1rem;
        }
        .filter-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 1rem 0 0.3rem 0;
        }
        .filter-label {
          font-size: 1rem;
          margin-right: 0.5rem;
        }
        .filter-select {
          border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
          transform: rotate(0.3deg);
          font-size: 1rem;
          border: 1px solid #666;
          padding: 0.2rem 1.2rem 0.2rem 0.5rem;
          background: #fff;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .review-list {
            padding: 1rem;
          display: flex;
          flex-direction: column;
        }
        .review-card {
          background-color: #f8fafc;
          padding: 1rem;
          margin-bottom: 1rem;
          transform: rotate(0.2deg);
          position: relative;
          overflow: hidden;
        }
        .review-card:nth-child(even) {
          transform: rotate(-0.2deg);
        }
        .review-content {
          position: relative;
          z-index: 10;
        }
        .review-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .user-avatar {
          width: 60px;
          height: 60px;
          flex-shrink: 0;
        }
        .user-info {
          flex: 1;
        }
        .user-name {
          font-size: 0.95rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }
        .review-meta {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0.25rem 0 0 0;
        }
        .review-text {
          font-size: 0.9rem;
          color: #374151;
          line-height: 1.4;
          margin: 0 0 1rem 0;
        }
        .review-target-name {
          font-size: 15px;
          font-weight: 500;
          color: #333;
          letter-spacing: 0.3px;
        }
        .review-actions {
          display: flex;
          gap: 0.7rem;
          margin-bottom: 0.5rem;
        }
        .review-action-btn {
          min-width: 54px;
          font-size: 0.95rem;
          padding: 0.18rem 0.5rem;
        }
        .existing-response {
          background-color: white;
          border: 1px solid #c4c4c4;
          border-radius: 8px;
          padding: 0.75rem;
          margin-top: 0.5rem;
          position: relative;
          margin-bottom: 1rem;
        }
        .existing-response-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .response-label {
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 600;
        }
        .edit-response-btn {
          font-size: 0.8rem;
          padding: 0.1rem 0.4rem;
          min-width: auto;
        }
        .existing-response-text {
          font-size: 0.9rem;
          color: #374151;
          line-height: 1.4;
        }
        .response-form {
          margin-top: 0.5rem;
          padding: 0.75rem;
          background-color: #f9fafb;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            padding-top: 0;
            padding-bottom: 0;
          }
          to {
            opacity: 1;
            max-height: 200px;
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
        }
        .response-textarea {
          width: 100%;
          min-height: 80px;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          resize: vertical;
          box-sizing: border-box;
        }
        .response-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        .response-form-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          justify-content: flex-end;
        }
        .response-form-btn {
          font-size: 0.85rem;
          padding: 0.3rem 0.7rem;
          min-width: auto;
        }
        .no-reviews {
          text-align: center;
          color: #6b7280;
          padding: 2rem;
          font-size: 0.9rem;
        }
      `}</style>
        <div className="review-container">
        <SketchHeader
           title={
          <>
            <Star size={18} style={{marginRight:'7px',marginBottom:'-3px'}}/>
            {get('STAFF_REVIEW_MANAGEMENT_TITLE')}
          </>
        }
          showBack={true}
          onBack={goBack}
        />
        
        <div className="filter-row">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="filter-label">{get('REVIEW_FILTER_RATING')}: </span>
            <select className="filter-select" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
              <option value="All">{get('REVIEW_FILTER_ALL')}</option>
              <option value="5.0">5.0</option>
              <option value="4.0+">4.0+</option>
              <option value="3.0+">3.0+</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="filter-label">{get('REVIEW_FILTER_DATE')}</span>
            <select className="filter-select" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
              <option value="All">{get('REVIEW_FILTER_ALL')}</option>
              <option value="Newest">{get('REVIEW_FILTER_TODAY')}</option>
              <option value="Oldest">{get('REVIEW_FILTER_PREVIOUS')}</option>
            </select>
          </div>
        </div>
        
        <div className="review-list">
          {reviews.length > 0 ? reviews.map(review => (
            <SketchDiv key={review.review_id || review.id} className="review-card">
              <HatchPattern opacity={0.03} />
              <div className="review-content">
                <div className="review-header">
                  <ImagePlaceholder
                    src={review.targetImage || '/placeholder-user.jpg'}
                    className="user-avatar" 
                    alt="profile"
                  />
                  <div className="user-info">
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#fef3c7',
                        color: '#d97706'
                      }}>
                        <User size={14} />
                      </div>
                      <span className="review-target-name">
                        {review.targetName || review.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '0.95rem' }}>{get('REVIEW_AUTHOR_LABEL')}</span>
                      <h3 className="user-name">{review.user_name || review.name}</h3>
                    </div>
                    <p className="review-meta">
                      {renderStars(review.rating)} - {new Date(review.created_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="review-text">"{review.content}"</p>
                
                {/* 기존 답변이 있는 경우 표시 */}
                {(review.reply_content || review.response) && !openResponses[review.review_id || review.id] && (
                  <div className="existing-response">
                    <div className="existing-response-header">
                      <span className="response-label">{get('REVIEW_RESPONSE_LABEL')}</span>
                    </div>
                    <div className="existing-response-text">{review.reply_content || review.response}</div>
                  </div>
                )}

                <div className="review-actions">
                  <SketchBtn 
                    variant={openResponses[review.review_id || review.id] ? "secondary" : 
                            ((review.reply_content || review.response) ? "primary" : "event")} 
                    size="small" 
                    className="review-action-btn"
                    onClick={() => toggleResponse(review.review_id || review.id)}
                  >
                    {openResponses[review.review_id || review.id] ? (
                      <>
                        <ChevronUp size={14} /> {get('REVIEW_CLOSE_BUTTON')}
                      </>
                    ) : (
                      <>
                        {(review.reply_content || review.response) ? (
                          <>
                            <Edit size={14} /> {get('REVIEW_EDIT_RESPONSE_BUTTON')}
                          </>
                        ) : (
                          get('REVIEW_ADD_RESPONSE_BUTTON')
                        )}
                      </>
                    )}
                  </SketchBtn>
                  <SketchBtn 
                    onClick={() => handleReport(review)}
                    variant="danger" size="small" className="review-action-btn">
                    <Siren size={14} /> {get('REVIEW_REPORT_BUTTON')}
                  </SketchBtn>
                </div>

                {/* 답변 입력 폼 */}
                {openResponses[review.review_id || review.id] && (
                  <div className="response-form">
                    <textarea
                      className="response-textarea"
                      placeholder={get('REVIEW_RESPONSE_PLACEHOLDER')}
                      value={responses[review.review_id || review.id] || ''}
                      onChange={(e) => handleResponseChange(review.review_id || review.id, e.target.value)}
                    />
                    <div className="response-form-actions">
                      <SketchBtn 
                        variant="secondary" 
                        size="small" 
                        className="response-form-btn"
                        onClick={() => toggleResponse(review.review_id || review.id)}
                      >
                        {get('REVIEW_CANCEL_BUTTON')}
                      </SketchBtn>
                      <SketchBtn 
                        variant="event" 
                        size="small" 
                        className="response-form-btn"
                        onClick={() => handleSubmitResponse(review.review_id || review.id)}
                      >
                        <Send size={12} /> {get('REVIEW_SUBMIT_RESPONSE_BUTTON')}
                      </SketchBtn>
                    </div>
                  </div>
                )}
              </div>
            </SketchDiv>
          )) : (
            <div className="no-reviews">
              {get('REVIEW_NO_REVIEWS_MESSAGE')}
            </div>
          )}
        </div>
      </div>

       <LoadingScreen
            variant="cocktail"
            subText="Loading..."
            isVisible={isLoading}
          />
    </>
  );
};

export default StaffReviewHistory;