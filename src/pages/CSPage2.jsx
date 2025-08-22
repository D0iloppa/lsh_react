import React, { useState, useEffect } from 'react'; // useEffect import 추가
import axios from 'axios';
import qs from 'qs';

import { useAuth } from '../contexts/AuthContext';

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';
import SketchInput from '@components/SketchInput';

import SketchDiv from '@components/SketchDiv'
import { AlertCircle } from 'lucide-react';
import SketchHeader from '@components/SketchHeader'

import { CircleAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import LoadingScreen from '@components/LoadingScreen';

const CSPage2 = ({ 
  navigateToPageWithData, 
  PAGES,
  goBack,
  ...otherProps 
}) => {

  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // 실제 데이터를 위한 상태 추가
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedInquiry, setExpandedInquiry] = useState(null); // 펼쳐진 문의 ID
  const { user, isLoggedIn } = useAuth();

  const API_HOST = import.meta.env.VITE_API_HOST; // ex: https://doil.chickenkiller.com/api
  const { messages, isLoading, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  
  // 처음 로딩 시 데이터 가져오기
  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (messages && Object.keys(messages).length > 0) {
            console.log('✅ Messages loaded:', messages);
            // setLanguage('en'); // 기본 언어 설정
            console.log('Current language set to:', currentLang);
            window.scrollTo(0, 0);
          }

    const fetchInquiries = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_HOST}/api/selectSupportAll`, {
          params: { user_id: user?.user_id || 1 }
          
        });

        console.log('문의 목록:', response.data);
        
        // API 응답을 inquiries 형태로 변환
        const formattedInquiries = (response.data || []).map((item, index) => ({
          id: item.id || index + 1,
          title: item.contents?.substring(0, 50) || 'Inquiry',
          date: formatDate(item.created_at || item.date),
          status: item.status || 'pending',
          statusLabel: getStatusLabel(item.status || 'pending'),
          contents: item.contents || '',
          response: item.response_contents || '', // 수정된 부분
          responseDate: item.response_created_at ? formatDate(item.response_created_at) : null
        }));
        
        setInquiries(formattedInquiries);
      } catch (error) {
        console.error('문의 목록 불러오기 실패:', error);
        setError('문의 목록을 불러오는데 실패했습니다.');
        
        // 실패 시 기본 더미 데이터 사용
        setInquiries(getDefaultInquiries());
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [user?.user_id, messages, currentLang]);

  // 아이콘 타입별 매핑
  const getIconByType = (type) => {
    switch(type) {
      case 'normal': <CircleAlert  />
    }
  };

  // 상태 라벨 매핑
  const getStatusLabel = (status) => {
    switch(status) {
      case 0: return get('CustomSupport1.4');
      case 1: return get('CustomSupport1.5');
      default: return get('CustomSupport1.4');
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    // timestamp인 경우 (숫자)
    const timestamp = Number(dateString);
    if (!isNaN(timestamp) && timestamp > 0) {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });
    }
    
    // 일반 날짜 문자열인 경우
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  // 기본 더미 데이터 (API 실패 시 사용)
  const getDefaultInquiries = () => [
    {
      id: 1,
      type: 'reservation',
      icon:  <CircleAlert  />,
      title: 'Reservation Inquiry',
      date: 'October 5, 2023',
      status: 'processing',
      statusLabel: 'Processing',
      contents: 'I would like to make a reservation for 4 people on Friday evening.',
      response: 'Thank you for your inquiry. We have availability on Friday evening. Please call us to confirm your reservation.',
      responseDate: 'October 6, 2023'
    },
    {
      id: 2,
      type: 'event',
      icon:  <CircleAlert  />,
      title: 'Event Inquiry',
      date: 'September 30, 2023',
      status: 'answered',
      statusLabel: 'Answered',
      contents: 'Do you host private events?',
      response: 'Yes, we do host private events. Please contact our events team for more details about pricing and availability.',
      responseDate: 'October 1, 2023'
    },
    {
      id: 3,
      type: 'other',
      icon:  <CircleAlert  />,
      title: 'Other Inquiry',
      date: 'September 11, 2023',
      status: 'pending',
      statusLabel: 'Pending',
      contents: 'What are your opening hours?',
      response: '',
      responseDate: null
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search FAQs:', searchQuery);
    // FAQ 검색 로직
  };

  const handleInquiryClick = (inquiry) => {
    console.log('Inquiry clicked:', inquiry);
    // 클릭 기능 비활성화 (답변이 있으면 항상 펼쳐져 있음)
  };

  // 새 문의하기 버튼 클릭 핸들러
  const handleNewInquiryClick = () => {
    console.log('새 문의하기 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.CSPAGE1);
  };

  const getStatusVariant = (status) => {
    switch(status) {
      case 'processing':
        return 'event';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <style jsx="true">{`
        .cs2-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;
          
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        .page-title {
          font-size: 1.4rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .inquiries-section {
          padding: 10px;
        }

        .inquiry-card {
          background-color: #f8fafc;
          padding: 1.5rem;
          margin-bottom: 1rem;
          cursor: pointer;
          transform: rotate(-0.1deg);
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .inquiry-card:hover {
          transform: rotate(-0.1deg) scale(1.01);
          box-shadow: 4px 4px 0px #1f2937;
        }

        .inquiry-card:nth-child(even) {
          transform: rotate(0.1deg);
        }

        .inquiry-card:nth-child(even):hover {
          transform: rotate(0.1deg) scale(1.01);
        }

        .inquiry-content {
          position: relative;
          z-index: 10;
        }

        .inquiry-header {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .inquiry-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .inquiry-details {
          flex: 1;
        }

        .inquiry-title {
          font-size: 1rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .inquiry-date {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
        }

        .inquiry-status {
          align-self: flex-start;
        }

        .expand-icon {
          font-size: 1rem;
          color: #6b7280;
        }

        /* 펼쳐진 내용 스타일 */
        .inquiry-expanded {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px dashed #e5e7eb;
        }

        .inquiry-full-content {
          background-color: #ffffff;
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
        }

        .content-label {
          font-size: 0.9rem;
          font-weight: bold;
          color: #374151;
          display: block;
        }

        .content-text {
          font-size: 0.9rem;
          color: #1f2937;
          line-height: 1.5;
          margin: 0;
          white-space: pre-wrap;
        }

        .response-section {
          margin-top: 1rem;
        }

        .no-response {
          font-style: italic;
          color: #9ca3af;
        }

        .response-date {
          margin-top: 1.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .date-text {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .search-section {
          margin-top: 15px;
          padding: 1.0rem;
        }

        .new-inquiry-section {
          margin-bottom: 20px;
          padding: 0 10px;
        }

        .loading-message, .error-message {
          text-align: center;
          padding: 2rem;
        }

        .error-message {
          color: #6b7280;
        }

        .loading-message {
          color: #6b7280;
        }

        @media (max-width: 480px) {
          .cs2-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
            
          }

          .inquiry-header {
            flex-direction: column;
            gap: 0.5rem;
          }

          .inquiry-status {
            align-self: stretch;
          }
        }
      `}</style>

      <div className="cs2-container">
        {/* Header */}
        <SketchHeader
          title={get('CUSTOMER_INQUIRY_TITLE')}
          showBack={true}
          onBack={goBack}
          rightButtons={[]}
        />

        {/* Search Section */}
        <div className="search-section">
          <form onSubmit={handleSearch}>
            <SketchInput
              type="text"
              placeholder={get('CustomSupport1.1')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Inquiries Section */}
        <div className="inquiries-section">
          {loading ? (
            <div className="loading-message">
              {get('CustomSupport1.2')}
            </div>
          ) : error ? (
            <div className="error-message">
              {error}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="loading-message">
              {get('CustomSupport1.3')}
            </div>
          ) : (
            inquiries.map((inquiry, index) => (
              <SketchDiv
                key={inquiry.id}
                className="inquiry-card"
                onClick={() => handleInquiryClick(inquiry)}
              >
                <HatchPattern opacity={0.4} />
                
                <div className="inquiry-content">
                  <div className="inquiry-header">
                    <div className="inquiry-icon">
                      <CircleAlert style={{opacity: '0.6', color: '#1f2937'}}/>
                    </div>
                    
                    <div className="inquiry-details">
                      <h3 className="inquiry-title">
                        {inquiry.title}
                      </h3>
                      <p className="inquiry-date">{inquiry.date}</p>
                    </div>
                    
                    <div className="inquiry-status">
                      <SketchBtn 
                        variant={getStatusVariant(inquiry.status)}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Status clicked:', inquiry.status);
                        }}
                      >
                        {inquiry.statusLabel}
                      </SketchBtn>
                    </div>
                  </div>

                  {/* 답변이 있는 경우 항상 펼쳐서 표시 */}
                  {inquiry.response && (
                    <div className="inquiry-expanded">
                      {/* 답변 내용만 표시 */}
                      <div className="response-section">
                        <div className="inquiry-full-content">
                          <span className="content-label">{get('REVIEW_RESPONSE_LABEL')}</span>
                          <p className="content-text">{inquiry.response}</p>
                          {inquiry.responseDate && (
                            <div className="response-date">
                              <span className="content-label">{get('REVIEW_ADD_RESPONSE_BUTTON')} {get('REVIEW_FILTER_DATE')}</span>
                              <span className="date-text">{inquiry.responseDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
              </SketchDiv>
              
            ))
          )}
        </div>

        {/* 새 문의하기 버튼 섹션 */}
        <div className="new-inquiry-section">
          <SketchBtn 
            variant="event"
            size="small"
            onClick={handleNewInquiryClick}
            className="new-inquiry-btn"
          ><HatchPattern opacity={0.4} />
            {get('btn.contact.1')}
          </SketchBtn>
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

export default CSPage2;