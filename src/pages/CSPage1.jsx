import React, { useState } from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';

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
          min-height: 100vh;
          border: 4px solid #1f2937;
          position: relative;
        }

        .header {
          padding: 1.5rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
          text-align: center;
        }

        .page-title {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1.4rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .search-section {
          padding: 1.5rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .contact-form-section {
          padding: 1.5rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .section-title {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1.1rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .contact-form {
          border: 3px solid #1f2937;
          background-color: #f8fafc;
          padding: 1.5rem;
          transform: rotate(-0.2deg);
          box-shadow: 3px 3px 0px #1f2937;
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
          width: 100%;
          min-height: 120px;
          padding: 0.75rem;
          border: 3px solid #1f2937;
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.9rem;
          background-color: white;
          resize: vertical;
          transform: rotate(0.1deg);
          box-shadow: 2px 2px 0px #1f2937;
          outline: none;
        }

        .message-textarea:focus {
          transform: rotate(0.1deg) scale(1.01);
          box-shadow: 3px 3px 0px #1f2937;
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
          font-family: 'Comic Sans MS', cursive, sans-serif;
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
        <div className="header">
          <h1 className="page-title">Customer Support</h1>
        </div>

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

        {/* Contact Form Section */}
        <div className="contact-form-section">
          <div className="section-title">Contact Form</div>
          
          <div className="contact-form">
            <HatchPattern opacity={0.05} />
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
                  variant="primary" 
                  size="large"
                >
                  Submit
                  <HatchPattern opacity={0.1} />
                </SketchBtn>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p className="operating-hours">
            Operating Hours: Mon-Fri 9 PM - 5 PM
          </p>
        </div>
      </div>
    </>
  );
};

export default CSPage1;