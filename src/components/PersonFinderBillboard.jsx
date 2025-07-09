import React, { useState, useEffect, useRef } from 'react';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import Swal from 'sweetalert2';

const PersonFinderBillboard = ({ onClose }) => {
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [name, setName] = useState('');
  const [inputName, setInputName] = useState('');
  const marqueeRef = useRef(null);
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

      useEffect(() => {
          if (messages && Object.keys(messages).length > 0) {
            console.log('✅ Messages loaded:', messages);
            // setLanguage('en'); // 기본 언어 설정
            console.log('Current language set to:', currentLang);
            window.scrollTo(0, 0);
          }
        }, [messages, currentLang]);
        
  const showDisplay = () => {
    if (!inputName.trim()) {
       
      return;
    }
    
    setName(inputName.trim());
    setIsDisplaying(true);
    
    // 애니메이션 초기화
    setTimeout(() => {
      if (marqueeRef.current) {
        marqueeRef.current.style.animation = 'none';
        marqueeRef.current.offsetHeight; // 리플로우 강제 실행
        marqueeRef.current.style.animation = 'marquee 20s linear infinite, blink 1s step-start infinite';
      }
    }, 50);
  };

  const goBack = () => {
    setIsDisplaying(false);
    setInputName('');
    setName('');
  };

  const handleClose = () => {
    goBack();
    if (onClose) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      showDisplay();
    }
  };

  return (
    <>
      <style jsx>{`
        .billboard-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          font-family: Arial, sans-serif;
        }

        .input-screen, .display-screen {
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        .input-screen {
          background-color: #111;
          color: white;
        }

        .name-input {
          padding: 15px;
          font-size: 20px;
          width: 300px;
          margin-bottom: 20px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .billboard-button {
          padding: 12px 24px;
          font-size: 18px;
          cursor: pointer;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          margin: 5px;
        }

        .billboard-button:hover {
          background-color: #0056b3;
        }

        .display-screen {
          background-color: black;
          position: relative;
        }

        .marquee-container {
          width: 100%;
          overflow: hidden;
          height: 150px;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }

        .marquee-text {
          white-space: nowrap;
          font-size: 120px;
          font-weight: bold;
          color: #0f0;
          position: absolute;
        }

        @keyframes marquee {
          0% {
            left: 100%;
          }
          100% {
            left: -100%;
          }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 30px;
          font-size: 20px;
          background: red;
          color: white;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          z-index: 10;
          border-radius: 4px;
        }

        .close-btn:hover {
          background: darkred;
        }

        @media (max-width: 768px) {
          .marquee-text {
            font-size: 13rem;
          }
          
          .name-input {
            width: 250px;
            font-size: 18px;
          }
        }
      `}</style>

      <div className="billboard-overlay">
        {!isDisplaying ? (
          // 입력 화면
          <div className="input-screen">
            <h2 style={{ marginBottom: '30px', color: 'white' }}>
              {get('BILLBOARD_TITLE')}
            </h2>
            <input
              type="text"
              className="name-input"
              placeholder={get('BILLBOARD_NAME_PLACEHOLDER')}
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <div>
              <button 
                className="billboard-button" 
                style={{background: 'linear-gradient(135deg, #00f0ff, #fff0d8)', color: 'black'}}
                onClick={showDisplay}
              >
                {get('BILLBOARD_FIND_BUTTON')}
              </button>
              <button 
                className="billboard-button" 
                onClick={handleClose}
                style={{ backgroundColor: '#6c757d' }}
              >
                {get('BILLBOARD_CANCEL_BUTTON')}
              </button>
            </div>
          </div>
        ) : (
          // 전광판 화면
          <div className="display-screen">
            <button className="close-btn" onClick={goBack}>
              {get('BILLBOARD_BACK_BUTTON')}
            </button>
            <button 
              className="close-btn" 
              onClick={handleClose}
              style={{ right: '170px' }}
            >
              {get('BILLBOARD_CLOSE_BUTTON')}
            </button>
            <div className="marquee-container">
              <div 
                ref={marqueeRef}
                className="marquee-text"
              >
                {name}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PersonFinderBillboard;