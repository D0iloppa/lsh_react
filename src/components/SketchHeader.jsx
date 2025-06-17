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
  className = ''
}) => {
  return (
    <>
      <style jsx>{`
        .page-header {
          width: 100%;
          padding: 1rem 1.25rem;
          background-color: #ffffff;
          border-bottom: 0.8px solid #666;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          min-height: 3.5rem;
          box-sizing: border-box;
          border-top-left-radius: 15px 8px;
          border-top-right-radius: 8px 12px;
          border-bottom-right-radius: 12px 6px;
          border-bottom-left-radius: 6px 14px;
          transform: rotate(0.1deg);
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
        }

        .page-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          text-align: center;
          line-height: 1.2;
          transform: rotate(-0.1deg);
          text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.05);

          font-family: 'Courier New', monospace;
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
          width: 2.25rem;
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

          .page-title {
            font-size: 1.1rem;
          }

          .back-button {
            width: 2.25rem;
            height: 2.25rem;
            font-size: 1rem;
          }

          .header-button {
            width: 2rem;
            height: 2rem;
            font-size: 0.875rem;
          }
        }

        /* Sticky header option */
        .page-header.sticky {
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
      
      <SketchDiv className={`page-header ${variant} ${className}`}>
        <HatchPattern opacity={0.3} />

        {/* 왼쪽: Back 버튼 (선택적) */}
        <div className="left-section">
            <button  style={{ display: showBack ? '' : 'none' }} className={`back-button ${showBack ? '' : 'bb-noshow'}`} onClick={onBack}>
                <ChevronLeft size={20} />
            </button>
        </div>

        {/* 가운데: 타이틀 */}
        <div className="center-section">
          <h1 className="page-title">{title}</h1>
        </div>

        {/* 오른쪽: 버튼들 (옵션) */}
        <div className="right-section">
          <div className="right-buttons">
            {rightButtons && rightButtons.map((btn, idx) => {
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
    </>
  );
};

export default SketchHeader;