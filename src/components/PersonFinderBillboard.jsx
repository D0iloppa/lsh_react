import React, { useState, useEffect, useRef } from 'react';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { RotateCcw } from 'lucide-react'; // 회전 아이콘
import Swal from 'sweetalert2';

const PersonFinderBillboard = ({ onClose }) => {
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [name, setName] = useState('');
  const [inputName, setInputName] = useState('');
  const [isRotated, setIsRotated] = useState(false);
  const marqueeRef = useRef(null);
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
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

  // 화면 회전 요청 함수
  const requestRotation = () => {
    setIsRotated(!isRotated); // 회전 상태 토글
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
          transition: transform 0.5s ease;
        }

        .billboard-overlay.rotated {
          transform: rotate(90deg);
          transform-origin: center center;
          width: 100vh;
          height: 100vw;
          top: calc((100vh - 100vw) / 2);
          left: calc((100vw - 100vh) / 2);
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
          position: relative;
        }

        .header-section {
          position: relative;
          width: 100%;
          max-width: 400px;
          text-align: center;
          margin-bottom: 30px;
        }

        .rotate-button {
          position: absolute;
          top: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          transition: all 0.3s ease;
        }

        .rotate-button:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          transform: rotate(90deg);
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
          height: 200px;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }

        .rotated .marquee-container {
          height: 300px;
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

        .rotated .marquee-text {
          font-size: 180px;
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

        .rotated .close-btn {
          font-size: 16px;
          padding: 8px 16px;
        }

        .rotated .rotate-button {
          top: 15px !important;
          right: 300px !important;
        }

        @media (max-width: 768px) {
          .marquee-text {
            font-size: 10rem;
          }
          
          .name-input {
            width: 250px;
            font-size: 18px;
          }

          .header-section {
            max-width: 300px;
          }

          .rotated .marquee-text {
            font-size: 10rem;
          }

          .close-btn {
            font-size: 14px;
            padding: 6px 12px;
            top: 15px;
          }

          .rotated .close-btn:nth-of-type(2) {
            right: 120px;
          }
        }

        @media (orientation: landscape) {
          .marquee-text {
            font-size: 10rem;
          }
        }

        @media (max-width: 768px) and (orientation: portrait) {
          .rotated .marquee-text {
            font-size: 8rem;
          }

          .rotated .marquee-container {
            height: 550px;
          }
        }
      `}</style>

      <div className={`billboard-overlay ${isRotated ? 'rotated' : ''}`}>
        {!isDisplaying ? (
          // 입력 화면
          <div className="input-screen">
            <div className="header-section">
              <h2 style={{ margin: 0, color: 'white' }}>
                {get('BILLBOARD_TITLE')}
              </h2>
              {/* <button 
                className="rotate-button"
                onClick={requestRotation}
                title={get('ROTATE_TOOLTIP') || '화면을 가로 모드로 회전'}
              >
                <RotateCcw size={20} />
              </button> */}
            </div>
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
            <button 
              className="rotate-button"
              onClick={requestRotation}
              title={get('ROTATE_TOOLTIP') || '화면을 가로 모드로 회전'}
              style={{ 
                position: 'absolute',
                top: '20px',
                right: '320px',
                zIndex: 10
              }}
            >
              <RotateCcw size={20} />
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