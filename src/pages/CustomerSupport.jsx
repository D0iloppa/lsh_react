import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import HatchPattern from '@components/HatchPattern';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import ApiClient from '@utils/ApiClient';
import { useAuth } from '../contexts/AuthContext';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { Martini } from 'lucide-react';

const mockInquiries = [
  {
    id: 1,
    title: 'Booking Issue',
    user: 'John Doe',
    date: '2 days ago',
    status: 'New'
  },
  {
    id: 2,
    title: 'Payment Failure',
    user: 'Alice Nguyen',
    date: '1 day ago',
    status: 'In Progress'
  },
  {
    id: 3,
    title: 'Event Inquiry',
    user: 'David Tran',
    date: '3 days ago',
    status: 'Resolved'
  },
];

const getStatusStyle = (status) => {
  switch(status) {
    case 'New':
      return { color: '#dc2626' }; // 빨간색
    case 'In Progress':
      return { color: '#d97706' }; // 노란색
    case 'Resolved':
      return { color: '#059669', background: '#eeffee' }; // 초록색
    default:
      return { color: '#6b7280' }; // 기본 회색
  }
};

// 시간 포맷팅 함수
const formatDate = (timestamp) => {
  try {
    const now = new Date();
    const inquiryTime = new Date(timestamp);
    const diffInMs = now - inquiryTime;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  } catch (error) {
    return 'Recently';
  }
};

const CustomerSupport = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  const user_id = user?.manager_id||1;

  console.log('CustomerSupport 렌더링, user:', user);
  console.log('user_id:', user_id);

    useEffect(() => {
        if (messages && Object.keys(messages).length > 0) {
          console.log('✅ Messages loaded:', messages);
          // setLanguage('en'); // 기본 언어 설정
          console.log('Current language set to:', currentLang);
          window.scrollTo(0, 0);
        }
      }, [messages, currentLang]);

  // 고객문의 목록 로드
  useEffect(() => {
    console.log('CustomerSupport useEffect 실행');
    console.log('user_id:', user_id);

    const loadInquiries = async () => {
      if (!user_id) {
        console.log('user_id가 없어서 API 호출 건너뜀');
        return;
      }

      try {
        console.log('API 호출 시작, user_id:', user_id);
        setLoading(true);
        const response = await ApiClient.get('/api/selectSupportAll', {
          params: { user_id: user_id }
        });

        console.log('Customer support response:', response);

        // API 응답 처리 (배열 직접 반환 또는 data 프로퍼티)
        let apiData = null;
        
        if (Array.isArray(response)) {
          apiData = response;
          console.log('Using response directly as array');
        } else if (response && response.data && Array.isArray(response.data)) {
          apiData = response.data;
          console.log('Using response.data as array');
        }
        
        if (apiData && apiData.length >= 0) {
          console.log('API 데이터 설정:', apiData);
          setInquiries(apiData);
        } else {
          console.log('No inquiry data found');
          setInquiries([]);
        }

      } catch (error) {
        console.error('Failed to load inquiries:', error);
        // 에러 시 빈 배열로 설정
        setInquiries([]);
      } finally {
        console.log('API 호출 완료');
        setLoading(false);
      }
    };

    loadInquiries();
  }, [user_id]); // user_id가 변경될 때만 실행

  return (
    <>
      <style jsx="true">{`
        .support-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .inquiry-title {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 1.2rem 0 0.7rem 0;
        }
        .inquiry-list {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .inquiry-card {
          background: #fff;
          padding: 0.8rem 0.9rem 0.8rem 0.9rem;
          display: flex;
          align-items: center;
          position: relative;
        }
        .inquiry-info {
          flex: 1;
        }
        .inquiry-title-main {
          font-size: 1.05rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
          padding: 3px;
        }
        .inquiry-meta {
          font-size: 0.97rem;
          color: #222;
          padding: 3px;
          max-width: 172px;
        }
        .inquiry-status-btn {
          min-width: 74px;
          font-size: 0.95rem;
          padding: 0.18rem 0.5rem;
        }
        .loading-message {
          text-align: center;
          padding: 2rem;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .no-inquiries {
          text-align: center;
          padding: 2rem;
          color: #888;
          font-size: 0.95rem;
        }
      `}</style>
          <div className="support-container">
          <SketchHeader
            title={get('CUSTOMER_INQUIRY_TITLE')}
            showBack={true}
            onBack={goBack}
          />
          <div className="inquiry-title">{get('CUSTOMER_INQUIRY_TITLE')}</div>
          
          {loading ? (
            <div className="loading-message">
              <Martini size={15} />
              <span>{get('LOADING_INQUIRIES')}</span>
            </div>
          ) : (
            <div className="inquiry-list">
              {inquiries.length === 0 ? (
                <div className="no-inquiries">
                  {get('NO_INQUIRIES_MESSAGE')}
                </div>
              ) : (
                inquiries.map(inq => (
                  <SketchDiv key={inq.id} className="inquiry-card">
                    <HatchPattern opacity={0.3} />
                    <div className="inquiry-info">
                      <div className="inquiry-title-main">
                        {inq.name || get('CUSTOMER_INQUIRY_DEFAULT')}
                      </div>
                      <div className="inquiry-meta">
                        {inq.contents}
                      </div>
                      <div style={{padding: '3px', color: '#8e8e8e'}}>
                        {formatDate(inq.created_at)}
                      </div>
                    </div>
                    <SketchBtn 
                      variant="primary" 
                      size="small" 
                      className="inquiry-status-btn"  
                      style={{
                        width: '35%',
                        ...getStatusStyle('New') // 기본 상태로 설정
                      }}
                    >
                      {get('INQUIRY_STATUS_NEW')}
                      <HatchPattern opacity={0.6} />
                    </SketchBtn>
                  </SketchDiv>
                ))
              )}
            </div>
          )}
        </div>
    </>
  );
};

export default CustomerSupport;