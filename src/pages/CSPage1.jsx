import React, { useState, useEffect } from 'react';
import axios from 'axios';
import qs from 'qs';

import { useAuth } from '../contexts/AuthContext';
  
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';
import LoadingScreen from '@components/LoadingScreen';
import SketchHeader from '@components/SketchHeader'
import Swal from 'sweetalert2';

const CSPage1 = ({ 
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const { user, isLoggedIn } = useAuth();
  const [userInfo, setUserInfo] = useState({});


  const API_HOST = import.meta.env.VITE_API_HOST; // ex: https://doil.chickenkiller.com/api
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
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
          params: { user_id: user?.user_id || 1 }
        });
        setUserInfo(response.data || {});
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }
    };

    fetchUserInfo();
  }, [user, messages, currentLang]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지
  
    try {
      
       const payload = {
              user_id: user?.user_id || 1,
              name: userInfo.nickname,
              email: userInfo.email,
              contents: formData.message
            };

            await axios.post(
              `${API_HOST}/api/insertSupport`,
              qs.stringify(payload),
              {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                }
              }
            );

      // 성공 시 처리
      

       Swal.fire({
          title: get('SWAL_SUCCESS_TITLE'),
          text: get('INQUIRY_SUBMIT_SUCCESS'),
          icon: 'success',
          confirmButtonText: get('SWAL_CONFIRM_BUTTON'),
          confirmButtonColor: '#10b981'
        });

      // 성공한 경우에만 페이지 이동
      navigateToPageWithData && navigateToPageWithData(PAGES.CS_PAGE_2, { 
        submittedForm: formData,
        success: true
      });

    } catch (error) {
      console.error('문의 등록 실패:', error);
      
      // 에러 처리 - 사용자에게 알림 표시
       Swal.fire({
          title: get('SWAL_ERROR_TITLE'),
          text: get('INQUIRY_SUBMIT_ERROR'),
          icon: 'error',
          confirmButtonText: get('SWAL_CONFIRM_BUTTON'),
          confirmButtonColor: '#ef4444'
        });
      
      // 또는 에러와 함께 페이지 이동
      // navigateToPageWithData && navigateToPageWithData(PAGES.CS_PAGE_2, { 
      //   submittedForm: formData,
      //   success: false,
      //   error: error.message
      // });
    }
};

  return (
    <>
      <style jsx="true">{`
        .cs-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;

           font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        .header {
          padding: 1.5rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
          text-align: center;
        }

        .page-title {
          font-size: 1.4rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }


        .contact-form-section {
         margin-top: 20px;
         border-top-left-radius: 12px 7px;
         border-top-right-radius: 6px 14px;
         border-bottom-right-radius: 10px 5px;
         border-bottom-left-radius: 8px 11px;
          padding: 1.5rem;
          border: 1px solid #666;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: bold;
          color: #1f2937;
        }

        .contact-form {
          
          padding: 1.5rem;
          transform: rotate(-0.2deg);
          position: relative;
          overflow: hidden;
        }

        .form-content {
          position: relative;
          z-index: 10;
        }

        .form-field {
          margin-bottom: 1rem;
        }

        .form-field:last-of-type {
          margin-bottom: 1.5rem;
        }

        .message-textarea {
         border-top-left-radius: 12px 7px;
         border-top-right-radius: 6px 14px;
         border-bottom-right-radius: 10px 5px;
         border-bottom-left-radius: 8px 11px;
          width: 91%;
          min-height: 180px;
          padding: 0.75rem;
          background-color: white;
          resize: vertical;
          transform: rotate(0.1deg);
          outline: none;
        }

        .message-textarea:focus {
          transform: rotate(0.1deg) scale(1.01);
        }

        .message-textarea::placeholder {
          color: #6b7280;
          font-style: italic;
        }

        .footer {
          padding: 1rem 1.5rem;
          text-align: center;
          background-color: #f9fafb;
        }

        .operating-hours {
          font-size: 0.9rem;
          color: #4b5563;
          margin: 0;
        }

        @media (max-width: 480px) {
          .cs-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
        }
      `}</style>

      <div className="cs-container">
        {/* Header */}

        <SketchHeader
          title={get('btn.contact.1')}
          showBack={true}
          onBack={goBack}
          rightButtons={[]}
        />


        {/* Contact Form Section */}
        <div className="contact-form-section">
          <div className="section-title">{get('CustomSupport1.6')}</div>
          
          <div className="contact-form">
            <div className="form-content">
              <form onSubmit={handleSubmit}>
                <div className="form-field">
                  <span style={{ display: 'inline-block', padding: '0.5rem 0' }}>
                    {userInfo.nickname || '아이디'} ({userInfo.email || '이메일 없음'})
                  </span>
                </div>

                <div className="form-field">
                  <textarea
                    className="message-textarea"
                    placeholder="Message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                  />
                </div>

                <SketchBtn 
                  type="submit"
                  className="full-width" 
                  variant="event" 
                  size="normal"
                >
                  {get('btn.submit.1	')}
                  <HatchPattern opacity={0.8} />
                </SketchBtn>
                <LoadingScreen
                variant="cocktail"
                subText="Loading..."
                isVisible={isLoading}
              />
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="footer" style={{backgroundColor: '#f9fafb'}}>
          <p className="operating-hours">
            {get('CustomSupport1.7')}: Mon-Fri 9 PM - 5 PM
          </p>
        </div> */}
      </div>
    </>
  );
};

export default CSPage1;