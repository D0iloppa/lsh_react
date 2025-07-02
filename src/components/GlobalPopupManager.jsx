// GlobalPopupManager.js
import React, { useState } from 'react';
import { usePopup } from '@contexts/PopupContext';
import { useMsg } from '@contexts/MsgContext';
import HatchPattern from '@components/HatchPattern';
import { Pencil } from 'lucide-react';

const GlobalPopupManager = () => {
  const { activePopups, closePopup } = usePopup();

  return (
    <>
      {activePopups.map((popup) => (
        <PopupModal
          key={popup.id}
          popup={popup}
          onClose={() => closePopup(popup.id)}
        />
      ))}
    </>
  );
};

const PopupModal = ({ popup, onClose }) => {
  const { get } = useMsg();
  const [activeTab, setActiveTab] = useState('premium'); // 'premium' | 'today'

  // 오늘 하루 열지 않음 체크박스 핸들러
  const handleTodayClose = (e) => {
    if (e.target.checked) {
      const today = new Date().toDateString();
      localStorage.setItem('popupClosedDate', today);
      onClose(); // 체크하자마자 모달 닫기
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 프리미엄 탭 콘텐츠
  const getPremiumContent = () => ({
    title: get('Popup.Premium.Title') || '프리미엄 회원만의 특별 혜택을 지금 확인해보세요!',
    description: get('Popup.Premium.Description') || '프리미엄 멤버십에 가입시 매장 예약 우선권과 10% 할인 혜택을 받으실 수 있습니다.',
    features: [
      get('Popup.Premium.Benefit1') || '매장 예약시 우선 예약권 제공으로 원하시는 시간에 예약 가능',
      get('Popup.Premium.Benefit2') || '모든 메뉴의 10%의 할인 혜택으로 더욱 저렴하게 즐기세요',
      get('Popup.Premium.Benefit3') || '신규 칵테일 출시시 우선 체험 기회 및 할인 혜택 추가 제공',
      get('Popup.Premium.Benefit4') || '추천하기',
      get('Popup.Premium.Benefit5') || '무료 칵테일 제작 클래스 참여 기회와 전문가 상담 서비스'
    ],
    buttons: [
      {
        text: get('Popup.Button.Later') || '다음 기회에',
        variant: 'secondary',
        onClick: onClose
      },
      {
        text: get('Popup.Button.JoinNow') || '지금 가입하기',
        variant: 'primary',
        onClick: popup.onConfirm || onClose
      }
    ]
  });

  // 오늘 하루 탭 콘텐츠
  const getTodayContent = () => ({
    title: get('Popup.Today.Title') || '오늘 하루, 프리미엄 혜택을 모두 누려보세요!',
    description: get('Popup.Today.Description') || '정회원 가입없이도 여러분 간편하게 프리미엄 서비스를 체험해 보실 수 있습니다.',
    features: [
      get('Popup.Today.Benefit1') || '매장 예약시 우선 예약권 제공으로 원하시는 시간에 예약 가능',
      get('Popup.Today.Benefit2') || '모든 메뉴의 10%의 할인 혜택으로 더욱 저렴하게 즐기세요',
      get('Popup.Today.Benefit3') || '신규 칵테일 출시시 우선 체험 기회 및 할인 혜택 추가 제공',
      get('Popup.Today.Benefit4') || '빼먹기 5% 등등의 실시간 할인 제공 (지속적 가격 정책)',
      get('Popup.Today.Benefit5') || '고객만의 신속 제작 클래스 참여 기회와 전문가 상담 서비스'
    ],
    buttons: [
      {
        text: get('Popup.Button.Later') || '다음 기회에',
        variant: 'secondary',
        onClick: onClose
      },
      {
        text: get('Popup.Button.TodayTrial') || '오늘만 무료체험',
        variant: 'primary',
        onClick: popup.onTodayTrial || onClose
      }
    ],
    notice: get('Popup.Today.Notice') || '본 혜택은 오늘 하루에만 제공되는 한정적인 혜택이 될 예정입니다.'
  });

  // 탭별 콘텐츠 가져오기
  const getTabContent = () => {
    if (popup.type === 'premium-tabs') {
      return activeTab === 'premium' ? getPremiumContent() : getTodayContent();
    }
    
    // 기본 팝업 (탭 없음)
    return {
      title: popup.title || '',
      description: popup.content || '',
      features: popup.features || [],
      buttons: popup.buttons || [
        {
          text: get('Common.Confirm') || '확인',
          variant: 'primary',
          onClick: onClose
        }
      ]
    };
  };

  const content = getTabContent();
  const showTabs = popup.type === 'premium-tabs';

  return (
    <>
      <style jsx="true">{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes popupSlide {
          from { 
            opacity: 0;
            transform: scale(0.9) rotate(-0.5deg);
          }
          to { 
            opacity: 1;
            transform: scale(1) rotate(-0.5deg);
          }
        }
        
        .popup-content {
          background: white;
          border: 1px solid #666;
          border-radius: 8px 12px 6px 10px;
          max-width: 400px;
          width: 100%;
          position: relative;
          animation: popupSlide 0.3s ease-out;
          transform: rotate(-0.5deg);
          box-shadow: 6px 6px 0px #c1c1c1;
          overflow: hidden;
        }

        .popup-close-btn {
          position: absolute;
          top: 8px;
          right: 12px;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          z-index: 10;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .popup-close-btn:hover {
          color: #333;
        }

        .popup-tabs {
          display: flex;
          background-color: white;
          position: relative;
        }

        .popup-tab {
          flex: 1;
          background: none;
          border: none;
          padding-right: 1rem;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          color: #666;
          transition: all 0.2s ease;
          position: relative;
          background-color: #e0e0e0;
        }

        .popup-tab.active {
          color: #333;
          background-color: white;
        }

        .popup-tab.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: white;
        }

        .popup-tab:hover:not(.active) {
          background-color: #f1f5f9;
        }

        .popup-tab:first-child {
          border-right: 1px solid #e5e7eb;
        }

        .popup-header {
          text-align: center;
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 2px solid #333;
          position: relative;
        }

        .popup-header.with-tabs {
          border-bottom: none;
          padding: 1rem 1.5rem 0.5rem 1.5rem;
        }

        .popup-title {
          font-size: 1.1rem;
          font-weight: bold;
          color: #333;
          margin: 0;
          line-height: 1.4;
        }

        .popup-body {
          padding: 1.5rem;
          position: relative;
        }

        .popup-description {
          font-size: 0.9rem;
          color: #555;
          line-height: 1.5;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .popup-features {
          border: 1px solid #adcfff;
          padding: 1rem;
          background: #f5fbff;
          margin-bottom: 0.5rem;
          color: #ffffff;
          max-height: 225px;
          overflow-y: auto;
        }

        .popup-feature-item {
          font-size: 0.85rem;
          color: #0f1434;
          margin-bottom: 0.4rem;
          position: relative;
          line-height: 1.4;
           display: flex;
          align-items: flex-start;
        }

        .icon-wrap {
          min-width: 16px;
          margin-right: 4px;
        }
          .feature-text {
            word-break: break-word;
          }

        .popup-feature-item:last-child {
          margin-bottom: 0;
        }

        .popup-notice {
            background-color: #f6f6f6;
            border-radius: 4px;
            padding: 0.75rem;
            font-size: 0.8rem;
            color: #666666;
            margin-bottom: 0.5rem;
            text-align: center;
            line-height: 1.4;
        }

        .popup-footer {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          padding: 0 1.5rem 1.5rem;
        }

        .popup-btn {
          background-color: #f8fafc;
          border: 1px solid #666;
          border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
          padding: 0.7rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          color: #333;
          min-width: 100px;
          box-shadow: 2px 2px 0px #c1c1c1;
        }

        .popup-btn:hover {
          background-color: #e2e8f0;
          transform: translateY(-1px);
          box-shadow: 2px 2px 0px #c1c1c1;
        }

        .popup-btn:active {
          transform: translateY(0px);
          box-shadow: 1px 1px 0px #333;
        }

        .popup-btn.primary {
          background: linear-gradient(135deg, #00f0ff, #fff0d8);
          color: #515f71;
        }

        .popup-btn.primary:hover {
           background: linear-gradient(135deg, #00f0ff, #fff0d8);
        }

        .popup-btn.secondary {
          background-color: #f1f5f9;
          color: #475569;
        }

        /* 오늘 하루 열지 않음 체크박스 스타일 */
        .today-close {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 1rem 1.5rem;
          border-top: 1px solid #e5e7eb;
          background-color: #f9fafb;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .today-close input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #3b82f6;
        }

        .today-close label {
          cursor: pointer;
          user-select: none;
          flex: 1;
        }

        /* 반응형 */
        @media (max-width: 480px) {
          .popup-content {
            max-width: 340px;
            margin: 0 0.5rem;
          }

          .popup-tab {
            padding: 0.8rem 1.2rem 0.8rem 0.5rem;
            font-size: 0.85rem;
          }

          .popup-header {
            padding: 1.2rem 1.2rem 0.8rem;
          }

          .popup-body {
            padding: 0.1rem 1rem;
          }

          .popup-title {
            font-size: 1rem;
          }

          .popup-description {
            font-size: 0.85rem;
          }

          .popup-feature-item {
            font-size: 0.8rem;
          }

          .popup-footer {
            flex-direction: column;
            gap: 0.5rem;
            padding: 0 1.2rem 0.2rem;
          }

          .popup-btn {
            width: 100%;
            min-width: auto;
          }

          .today-close {    
            font-size: 13px;
            margin-left: 1rem;
            padding: 0.4rem;
            font-size: 13px;
          }
        }
      `}</style>

      <div className="popup-overlay" onClick={handleOverlayClick}>
        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
          <HatchPattern opacity={0.4} />
          
          {/* 닫기 버튼 */}
          <button className="popup-close-btn" onClick={onClose}>
            ×
          </button>

          {/* 탭 (premium-tabs 타입일 때만 표시) */}
          {showTabs && (
            <div className="popup-tabs">
              <button 
                className={`popup-tab ${activeTab === 'premium' ? 'active' : ''}`}
                onClick={() => setActiveTab('premium')}
              >
                {get('Popup.Tab.Premium') || '프리미엄 혜택'}
              </button>
              <button 
                className={`popup-tab ${activeTab === 'today' ? 'active' : ''}`}
                onClick={() => setActiveTab('today')}
              >
                {get('Popup.Tab.Today') || '일일 혜택'}
              </button>
            </div>
          )}

          {/* 헤더 */}
          <div className={`popup-header ${showTabs ? 'with-tabs' : ''}`}>
            <h3 className="popup-title">
              {content.title}
            </h3>
          </div>

          {/* 바디 */}
          <div className="popup-body">
            {content.description && (
              <div className="popup-description">
                {content.description}
              </div>
            )}

           {content.features && content.features.length > 0 && (
          <div className="popup-features">
            {content.features.map((feature, index) => (
              <div key={index} className="popup-feature-item">
                <span className="icon-wrap">
                  <Pencil size={12} fill="#b4b4b4" />
                </span>
                <span className="feature-text">{feature}</span>
              </div>
            ))}
          </div>
        )}

            {/* 오늘 하루 탭의 안내 문구 */}
            {activeTab === 'today' && content.notice && (
              <div className="popup-notice">
                * {content.notice}
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="popup-footer">
            {content.buttons.map((button, index) => (
              <button
                key={index}
                className={`popup-btn ${button.variant || 'secondary'}`}
                onClick={button.onClick}
              >
                {button.text}
              </button>
            ))}
          </div>
          
          {/* 오늘 하루 열지 않음 체크박스 */}
          <div className='today-close'>
            <input 
              type="checkbox" 
              id="todayClosePopup"
              onChange={handleTodayClose}
            />
            <label htmlFor="todayClosePopup">
              {get('Popup.TodayClose') || '오늘 하루 열지 않음'}
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalPopupManager;