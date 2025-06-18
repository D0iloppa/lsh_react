import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
  

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';

import SketchHeader from '@components/SketchHeader'

const CSPage1 = ({ 
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const { user, isLoggedIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지
  
    try {
      // INSERT 작업이므로 POST 메소드가 더 적절합니다
      const response = await axios.post('/api/api/insertSupport', {
        accountId: user?.user_id || 1,
        name: formData.name,
        email: formData.email,
        contents: formData.message
      });

      // 성공 시 처리
      console.log('문의 등록 성공:', response.data);
      
      // 성공한 경우에만 페이지 이동
      navigateToPageWithData && navigateToPageWithData(PAGES.CS_PAGE_2, { 
        submittedForm: formData,
        success: true
      });

    } catch (error) {
      console.error('문의 등록 실패:', error);
      
      // 에러 처리 - 사용자에게 알림 표시
      alert('문의 등록에 실패했습니다. 다시 시도해주세요.');
      
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

           font-family: 'Kalam', 'Comic Sans MS', cursive, sans-serif;
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
        font-family: 'Kalam', 'Comic Sans MS', cursive, sans-serif;
         border-top-left-radius: 12px 7px;
         border-top-right-radius: 6px 14px;
         border-bottom-right-radius: 10px 5px;
         border-bottom-left-radius: 8px 11px;
          width: 91%;
          min-height: 120px;
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
          title="Customer Support"
          showBack={true}
          onBack={() => {
            // goBack();
            navigateToPageWithData && navigateToPageWithData(PAGES.ACCOUNT);
          }}
          
          rightButtons={[]}
        />


        {/* Contact Form Section */}
        <div className="contact-form-section">
          <div className="section-title">Contact Form</div>
          
          <div className="contact-form">
            <div className="form-content">
              <form onSubmit={handleSubmit}>
                
                <div className="form-field">
                 
                  <SketchInput
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  /> 
                </div>

                <div className="form-field">
                  <SketchInput
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
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
                  Submit
                  <HatchPattern opacity={0.8} />
                </SketchBtn>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer" style={{backgroundColor: '#f9fafb'}}>
          <p className="operating-hours">
            Operating Hours: Mon-Fri 9 PM - 5 PM
          </p>
        </div>
      </div>
    </>
  );
};

export default CSPage1;