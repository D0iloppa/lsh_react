import React from 'react';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';

import { ChevronLeft } from 'lucide-react';


const SketchHeader = ({ 
  title, 
  showBack = false, 
  onBack = () => {}, 
  rightButtons = [],
  variant = 'primary',
  className = '',
  sticky = true  // 기본값을 true로 변경
}) => {

    console.log('sticky', sticky);

    
  return (
    <>
      <style jsx="true">{`
        .page-header {
          width: 100%;
          padding: 0.3rem 0;
          margin: 0 auto;
          max-width: 28rem;
          background-color: #ffffff;
          border-bottom: 0.8px solid #666;
          position: fixed;  /* sticky 대신 fixed 사용 */
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;  /* 높은 z-index */
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 2rem;
          box-sizing: border-box;
          border-top-left-radius: 15px 8px;
          border-top-right-radius: 8px 12px;
          border-bottom-right-radius: 12px 6px;
          border-bottom-left-radius: 6px 14px;
          transform: rotate(0.1deg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);  /* 기본 그림자 추가 */
        }

        /* 헤더 아래 여백을 위한 가상 요소 */
        .page-header::after {
          content: '';
          display: block;
          height: 3.5rem;  /* 헤더 높이만큼 여백 */
          width: 100%;
        }

        /* Variants */
        .page-header.primary {
          background-color: #ffffff;
          color: #1f2937;
          border-color: #666;
        }

        .page-header.secondary {
          background-color: #f9fafb;
          color: #1f2937;
          border-color: #6b7280;
        }

        .page-header.accent {
          background-color: #fef3c7;
          color: #1f2937;
          border-color: #f59e0b;
        }

        .page-header.dark {
          background-color: #1f2937;
          color: #ffffff;
          border-color: #374151;
        }

        .left-section {
          display: flex;
          align-items: center;
          width: 3rem;
          flex-shrink: 0;
        }

        .bb-noshow{
          display:none;
        }

        .back-button {
          width: 2.5rem;
          height: 2.5rem;
          background-color:rgba(243, 244, 246, 0);
          border: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: bold;
          color: #374151;
          transition: all 0.2s;
          transform: rotate(-0.5deg);
          position: relative;
          z-index: 2;
        }

        .back-button:hover {
          background-color: #e5e7eb;
          transform: rotate(-0.5deg) scale(1.05);
          box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .back-button:active {
          transform: rotate(-0.5deg) scale(0.95);
          box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        }

        .center-section {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 1;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        .page-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          text-align: center;
          line-height: 1.2;
          transform: rotate(-0.1deg);
          text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.05);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .right-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: auto;
          min-width: 3rem;
          justify-content: flex-end;
          flex-shrink: 0;
          position: relative;
          z-index: 2;
        }

        .right-buttons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .header-button {
          height: 2.25rem;
          background-color: #f8fafc;
          border: 0.8px solid #666;
          border-radius: 6px 12px 8px 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1rem;
          color: #374151;
          transition: all 0.2s;
          transform: rotate(0.3deg);
        }

        .header-button:nth-child(even) {
          transform: rotate(-0.3deg);
        }

        .header-button:hover {
          background-color: #e2e8f0;
          transform: rotate(0.3deg) scale(1.05);
          box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-button:nth-child(even):hover {
          transform: rotate(-0.3deg) scale(1.05);
        }

        .header-button:active {
          transform: rotate(0.3deg) scale(0.95);
        }

        .header-button:nth-child(even):active {
          transform: rotate(-0.3deg) scale(0.95);
        }

        /* Icon button style */
        .header-button svg {
          width: 1rem;
          height: 1rem;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .page-header {
            padding: 0.75rem 1rem;
            min-height: 3rem;
          }

          .page-header::after {
            height: 3rem;
          }

          .page-title {
            font-size: 1.1rem;
          }

          .back-button {
            width: 2.25rem;
            height: 2.25rem;
            font-size: 1rem;
          }

          .header-button {
            font-size: 0.875rem;
          }
        }

        /* Fixed header option - 이제 기본값이므로 조건부 적용 */
        .page-header.not-sticky {
          position: relative;
          box-shadow: none;
        }

        .page-header.not-sticky::after {
          display: none;
        }

        /* Shadow variants */
        .page-header.shadow-sm {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .page-header.shadow-md {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .page-header.shadow-lg {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
      
      <SketchDiv className={`page-header ${variant} ${className} ${!sticky ? 'not-sticky' : ''}`}>
        <HatchPattern opacity={0.3} />

        {/* 왼쪽: Back 버튼 (선택적) */}
        <div className="left-section">
            <button  style={{ display: showBack ? '' : 'none' }} className={`back-button ${showBack ? '' : 'bb-noshow'}`} onClick={onBack}>
                <ChevronLeft size={20} />
            </button>
        </div>

        {/* 가운데: 타이틀 */}
        <div className="center-section">
          <h1 className="page-title">
            {Array.isArray(title) ? title : title}
          </h1>
          <span style={{ fontSize: '20px',  marginLeft: '5px', lineHeight: '1.5', display:'none' }}>🔞</span>
        </div>

        {/* 오른쪽: 버튼들 (옵션) */}
        <div className="right-section">
          <div className="right-buttons">
            {rightButtons && rightButtons.map((btn, idx) => {
              // 객체인 경우 (icon, onClick 등이 있는 경우)
              if (typeof btn === 'object' && btn !== null && !React.isValidElement(btn)) {
                const IconComponent = btn.icon;
                return (
                  <button 
                    key={idx} 
                    className="header-button"
                    onClick={btn.onClick}
                    title={btn.title || ''}
                  >
                    {IconComponent && <IconComponent size={16} />}
                    {btn.label && <span style={{ marginLeft: btn.icon ? '4px' : '0' }}>{btn.label}</span>}
                  </button>
                );
              }
              // 만약 버튼이 단순 문자열이나 아이콘이라면 header-button으로 감싸기
              if (typeof btn === 'string' || (React.isValidElement(btn) && !btn.props.className?.includes('sketch'))) {
                return (
                  <button key={idx} className="header-button">
                    {btn}
                  </button>
                );
              }
              // 이미 스타일이 적용된 컴포넌트라면 그대로 렌더링
              return <span key={idx}>{btn}</span>;
            })}
          </div>
        </div>
      </SketchDiv>
      {sticky && <div style={{ height: '66px' }}></div>}
    </>
  );
};

export default SketchHeader;