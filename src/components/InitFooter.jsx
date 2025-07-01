import React, { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

import HatchPattern from '@components/HatchPattern';

const InitFooter = ({ 
  className = "",
  privacyHref = "#",
  termsHref = "#",
  hatchOpacity = 0.3,
  ...props 
}) => {
  const navigate = useNavigate();
  
  // 컴포넌트 최상위에서 hooks 사용
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  // useEffect도 컴포넌트 최상위에서 사용
  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);

  const navigateTo = (href) => {
    navigate(href);
  };

    
  return (
    <>
      <footer className={`init-footer ${className}`} {...props}>
        <HatchPattern opacity={hatchOpacity} />
        <div className="footer-content">
          <a 
             onClick={(e) => {
              e.preventDefault();
              navigateTo(privacyHref);
            }}
            className="sketch-link"
          >
            { get('Footer1.1') }
          </a>
          <span className="divider">|</span>
          <a 
            onClick={(e) => {
              e.preventDefault();
              navigateTo(termsHref);
            }}
            className="sketch-link"
          >
            { get('Footer1.2') }
          </a>
        </div>
      </footer>
      
      <style jsx="true">{`
        .init-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #f8f8f8;
          border-top: 1px solid #e0e0e0;
          padding: 16px 20px;
          text-align: center;
          z-index: 10;
        }
        
        .footer-content {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #666;
          position: relative;
          z-index: 2;
        }
        
        .sketch-link {
          color: #666;
          font-size: 12px;
          text-decoration: none;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
          display: inline-block;
        }
        
        .sketch-link:hover {
          color: #333;
          background: #e8e8e8;
          text-decoration: none;
        }
        
        .sketch-link:active {
          transform: translateY(1px);
        }
        
        .divider {
          color: #ccc;
          margin: 0 4px;
          user-select: none;
        }
        
        /* 반응형 */
        @media (max-width: 768px) {
          .init-footer {
            padding: 8px 16px;
          }
          
          .footer-content {
            font-size: 11px;
          }
          
          .sketch-link {
            font-size: 13px;
            padding: 2px 6px;
          }
        }
      `}</style>
    </>
  );
};

export default InitFooter;