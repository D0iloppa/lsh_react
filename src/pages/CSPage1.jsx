import React, { useState } from 'react';
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

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search FAQs:', searchQuery);
    // FAQ 검색 로직
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    // 폼 제출 로직
    // 성공 시 CS Page 2로 이동할 수도 있음
    navigateToPageWithData && navigateToPageWithData(PAGES.CS_PAGE_2, { 
      submittedForm: formData 
    });
  };

  return (
    <>
      <style jsx>{`
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

        .search-section {
            margin-top: 15px;
          padding: 1.0rem;
        }

        .contact-form-section {
        margin: auto;
         width: 80%;
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

        {/* Search Section */}
        <div className="search-section">
         
          <form onSubmit={handleSearch}>
            <SketchInput
              type="text"
              placeholder="Search FAQs" style={{ backGroundColor: 'white' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

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
                  variant="secondary" 
                  size="normal"
                >
                  Submit
                  <HatchPattern opacity={0.4} />
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