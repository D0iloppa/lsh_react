import React, { useState,useEffect} from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import HatchPattern from '@components/HatchPattern';
import { Filter, Star, Edit, Trash2, Eye, MessagesSquare, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';

const mockReviews = [
  {
    id: 1,
    name: 'Emily Tran',
    rating: 5.0,
    content: 'Amazing atmosphere and friendly staff. Will visit again!',
    response: null // 기존 답변이 있으면 여기에 저장
  },
  {
    id: 2,
    name: 'Lucas Nguyen',
    rating: 3.5,
    content: 'Good service but the music was too loud.',
    response: 'Thank you for your feedback! We\'ll work on adjusting the music volume.'
  },
  {
    id: 3,
    name: 'Sophie Le',
    rating: 4.0,
    content: 'Great place but the wait time was long.',
    response: null
  },
];

const ReviewManagement = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [ratingFilter, setRatingFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Newest');
  const [openResponses, setOpenResponses] = useState({}); // 각 리뷰의 답변 영역 열림 상태
  const [responses, setResponses] = useState({}); // 각 리뷰의 답변 텍스트
  const [reviews, setReviews] = useState(mockReviews); // 리뷰 상태 관리
  const { user } = useAuth();

  const venue_id = user.venue_id;

  useEffect(() => {
      const loadVenueReview = async () => {
        if (!venue_id) return;
  
        try {
          const response = await ApiClient.postForm('/api/getVenueReviewList', {
            venue_id: venue_id
          });
  
          console.log('responseReview', response.data);
  
          // 상태에 저장하거나 사용하기
          setReviews(response.data);
         
        } catch (error) {
          setReviews([])
          console.error('리뷰 로딩 실패:', error);
        }
      };
  
      loadVenueReview();
    }, [venue_id]);

  // 답변 영역 토글
  const toggleResponse = (reviewId) => {
    setOpenResponses(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
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
    const responseText = responses[reviewId];
    
    if (!responseText || responseText.trim() === '') {
      Swal.fire({
        title: '입력 오류',
        text: '답변 내용을 입력해주세요.',
        icon: 'warning',
        confirmButtonText: '확인',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    try {
      // API 호출 (실제 구현 시)
      // await ApiClient.postForm('/api/reviews/respond', {
      //   review_id: reviewId,
      //   response: responseText
      // });

      // 성공 시 로컬 상태 업데이트
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, response: responseText }
          : review
      ));

      // 답변 입력창 초기화 및 닫기
      setResponses(prev => ({
        ...prev,
        [reviewId]: ''
      }));
      setOpenResponses(prev => ({
        ...prev,
        [reviewId]: false
      }));

      // 성공 알림
      Swal.fire({
        title: '답변 등록 완료',
        text: '리뷰에 대한 답변이 성공적으로 등록되었습니다.',
        icon: 'success',
        confirmButtonText: '확인',
        confirmButtonColor: '#10b981'
      });

    } catch (error) {
      console.error('답변 등록 실패:', error);
      Swal.fire({
        title: '오류',
        text: '답변 등록에 실패했습니다. 다시 시도해주세요.',
        icon: 'error',
        confirmButtonText: '확인',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // 답변 수정
  const handleEditResponse = (reviewId, currentResponse) => {
    setResponses(prev => ({
      ...prev,
      [reviewId]: currentResponse
    }));
    setOpenResponses(prev => ({
      ...prev,
      [reviewId]: true
    }));
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
        }
        .filter-row {
          padding: 0.3rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0.5rem 0 0.5rem 0;
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
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .review-card {
          padding: 0.8rem 0.9rem 1.1rem 0.9rem;
          position: relative;
        }
        .review-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .review-name {
          font-size: 1.05rem;
          font-weight: 600;
        }
        .review-rating {
          font-size: 1.05rem;
          color: #222;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }
        .review-content {
          font-size: 0.97rem;
          color: #222;
          margin-bottom: 1rem;
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
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
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
      `}</style>
      <div className="review-container">
        <SketchHeader
          title="Manage Reviews"
          showBack={true}
          onBack={goBack}
        />
        <div className="filter-row">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="filter-label">Rating</span>
            <select className="filter-select" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
              <option>All</option>
              <option>5.0</option>
              <option>4.0+</option>
              <option>3.0+</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="filter-label">Date:</span>
            <select className="filter-select" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
              <option>Newest</option>
              <option>Oldest</option>
            </select>
          </div>
        </div>
        <div className="review-list">
          {reviews.map(review => (
            <SketchDiv key={review.id} className="review-card">
              <HatchPattern opacity={0.6} />
              <div className="review-header">
                <div className="review-name">{review.user_name}</div>
                <div className="review-rating"><Star size={14} fill='yellow'/> {review.rating}</div>
              </div>
              <div className="review-content">"{review.content}"</div>
              
              {/* 기존 답변이 있는 경우 표시 */}
              {review.response && !openResponses[review.id] && (
                <div className="existing-response">
                  <div className="existing-response-header">
                    <span className="response-label">Manager Response:</span>
                  </div>
                  <div className="existing-response-text">{review.response}</div>
                </div>
              )}

              <div className="review-actions">
                <SketchBtn 
                  variant={openResponses[review.id] ? "secondary" : "event"} 
                  size="small" 
                  className="review-action-btn"
                  onClick={() => toggleResponse(review.id)}
                >
                  {openResponses[review.id] ? (
                    <>
                      <ChevronUp size={14} /> Close
                    </>
                  ) : (
                    <>
                      {review.response ? 'Edit Response' : 'Respond'}
                    </>
                  )}
                </SketchBtn>
                <SketchBtn variant="danger" size="small" className="review-action-btn">Flag</SketchBtn>
              </div>

              {/* 답변 입력 폼 */}
              {openResponses[review.id] && (
                <div className="response-form">
                  <textarea
                    className="response-textarea"
                    placeholder="Write your response to this review..."
                    value={responses[review.id] || ''}
                    onChange={(e) => handleResponseChange(review.id, e.target.value)}
                  />
                  <div className="response-form-actions">
                    <SketchBtn 
                      variant="secondary" 
                      size="small" 
                      className="response-form-btn"
                      onClick={() => toggleResponse(review.id)}
                    >
                      Cancel
                    </SketchBtn>
                    <SketchBtn 
                      variant="event" 
                      size="small" 
                      className="response-form-btn"
                      onClick={() => handleSubmitResponse(review.id)}
                    >
                      <Send size={12} /> Submit
                    </SketchBtn>
                  </div>
                </div>
              )}
            </SketchDiv>
          ))}
        </div>
      </div>
    </>
  );
};

export default ReviewManagement;