import React, { useState, useEffect } from 'react'; // useEffect import 추가
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';
import SketchInput from '@components/SketchInput';

import SketchDiv from '@components/SketchDiv'

import SketchHeader from '@components/SketchHeader'

const CSPage2 = ({ 
  navigateToPageWithData, 
  PAGES,
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

  const { user, isLoggedIn } = useAuth();

  // 처음 로딩 시 데이터 가져오기
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchInquiries = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/api/api/selectAll', {
          params: { accountId: user?.user_id || 1 }
        });
        
        // API 응답을 inquiries 형태로 변환
        const formattedInquiries = (response.data || []).map((item, index) => ({
          id: item.id || index + 1,
          type: item.type || 'general',
          icon: getIconByType(item.type || 'general'),
          title: item.title || item.contents?.substring(0, 50) || 'Inquiry',
          date: formatDate(item.created_at || item.date),
          status: item.status || 'pending',
          statusLabel: getStatusLabel(item.status || 'pending'),
          contents: item.contents || '',
          response: item.response || ''
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
  }, [user?.user_id]);

  // 아이콘 타입별 매핑
  const getIconByType = (type) => {
    switch(type) {
      case 'reservation': return '⚠️';
      case 'event': return 'ℹ️';
      case 'payment': return '💳';
      case 'technical': return '🔧';
      default: return 'ℹ️';
    }
  };

  // 상태 라벨 매핑
  const getStatusLabel = (status) => {
    switch(status) {
      case 'processing': return 'Processing';
      case 'answered': return 'Answered';
      case 'pending': return 'Pending';
      case 'closed': return 'Closed';
      default: return 'Pending';
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    
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
      icon: '⚠️',
      title: 'Reservation Inquiry',
      date: 'October 5, 2023',
      status: 'processing',
      statusLabel: 'Processing'
    },
    {
      id: 2,
      type: 'event',
      icon: 'ℹ️',
      title: 'Event Inquiry',
      date: 'September 30, 2023',
      status: 'answered',
      statusLabel: 'Answered'
    },
    {
      id: 3,
      type: 'other',
      icon: 'ℹ️',
      title: 'Other Inquiry',
      date: 'September 11, 2023',
      status: 'pending',
      statusLabel: 'Pending'
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search FAQs:', searchQuery);
    // FAQ 검색 로직
  };

  const handleInquiryClick = (inquiry) => {
    console.log('Inquiry clicked:', inquiry);
    // 문의 상세 페이지로 이동하거나 상세 내용 표시
  };

  // 새 문의하기 버튼 클릭 핸들러
  const handleNewInquiryClick = () => {
    console.log('새 문의하기 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.CSPAGE1);
  };

  const getStatusVariant = (status) => {
    switch(status) {
      case 'processing':
        return 'accent';
      case 'answered':
        return 'secondary';
      case 'pending':
        return 'primary';
      case 'closed':
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
          margin-bottom: 0.75rem;
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
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
        }

        .inquiry-date {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
        }

        .inquiry-status {
          align-self: flex-start;
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
          font-family: 'Comic Sans MS', cursive, sans-serif;
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
          title="Customer Support"
          showBack={true}
          onBack={() => {
            navigateToPageWithData && navigateToPageWithData(PAGES.ACCOUNT);
          }}
          rightButtons={[]}
        />

        {/* Search Section */}
        <div className="search-section">
          <form onSubmit={handleSearch}>
            <SketchInput
              type="text"
              placeholder="Search FAQs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Inquiries Section */}
        <div className="inquiries-section">
          {loading ? (
            <div className="loading-message">
              문의 목록을 불러오는 중...
            </div>
          ) : error ? (
            <div className="error-message">
              {error}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="loading-message">
              등록된 문의가 없습니다.
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
                      {inquiry.icon}
                    </div>
                    
                    <div className="inquiry-details">
                      <h3 className="inquiry-title">{inquiry.title}</h3>
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
                </div>
              </SketchDiv>
            ))
          )}
        </div>

        {/* 새 문의하기 버튼 섹션 */}
        <div className="new-inquiry-section">
          <SketchBtn 
            variant="primary"
            size="small"
            onClick={handleNewInquiryClick}
            className="new-inquiry-btn"
          >
            문의하기
          </SketchBtn>
        </div>
      </div>
    </>
  );
};

export default CSPage2;