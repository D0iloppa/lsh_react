import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Check, Zap } from 'lucide-react';
import HatchPattern from '@components/HatchPattern';
import { useAuth } from '@contexts/AuthContext';
import { useMsg } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';
import { CreditCard} from 'lucide-react';
import SketchHeader from '@components/SketchHeader';

const PurchasePage = ({  goBack}) => {
  const navigate = useNavigate();
  const { user, isActiveUser } = useAuth();
  const { get } = useMsg();
  const [isProcessing, setIsProcessing] = useState(false);

  // 일일권 구매 함수
  const handleDailyPurchase = async () => {
    if (!user?.user_id || user.type !== 'user') {
      Swal.fire({
        title: get('SWAL_SIGNUP_REQUIRED_TITLE'),
        text: get('SWAL_SIGNUP_REQUIRED_TEXT'),
        icon: 'warning',
        confirmButtonText: get('BUTTON_CONFIRM')
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await ApiClient.postForm('/api/buyCoupon', {
        user_id: user.user_id
      });

      const { success = false } = response;

      if (success) {
        Swal.fire({
          title: get('SWAL_DAILY_TICKET_SUCCESS_TITLE'),
          text: get('SWAL_DAILY_TICKET_SUCCESS_TEXT'),
          icon: 'success',
          confirmButtonText: '확인'
        }).then(() => {
          navigate('/main');
        });
      } else {
        throw new Error('구매 실패');
      }
    } catch (error) {
      console.error('❌ 일일권 구매 실패:', error);
      Swal.fire({
        title: '구매 실패',
        text: '일일권 구매에 실패했습니다. 다시 시도해주세요.',
        icon: 'error',
        confirmButtonText: '확인'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 일일권 혜택 목록
  const dailyBenefits = [
    get('Popup.Today.Benefit1') || '무제한 매장 정보 열람',
    get('Popup.Today.Benefit2') || '무제한 예약 기능',
    get('Popup.Today.Benefit3') || '에스코트 리뷰 열람',
    get('Popup.Today.Benefit4') || '광고 없는 깔끔한 화면',
    get('Popup.Today.Benefit5') || '프리미엄 매장 우선 노출',
    get('Popup.Today.Benefit6') || '24시간 고객 지원'
  ];

  return (
    <>
      <style jsx="true">{`
        .purchase-page {
          min-height: 100vh;
          background: #f9fafb;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        .purchase-header {
          background: white;
          padding: 1rem 1.5rem;
          border-bottom: 2px solid #333;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .back-btn {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .back-btn:hover {
          background-color: #f3f4f6;
        }

        .page-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #333;
          margin: 0;
        }

        .purchase-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .purchase-tabs {
          display: none;
        }

        .purchase-card {
          background: white;
          border: 2px solid #707070;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          box-shadow: 6px 6px 0px #c1c1c1;
          margin-bottom: 2rem;
        }

        .card-header {
          padding: 2rem 2rem 1rem;
          text-align: center;
          position: relative;
          background: linear-gradient(135deg, #00f0ff, #fff0d8);
        }

        .plan-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.9);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
        }

        .price-section {
          margin-bottom: 1rem;
        }

        .price {
          font-size: 3rem;
          font-weight: bold;
          color: #333;
          margin: 0;
        }

        .price-period {
          font-size: 1.1rem;
          color: #555;
          margin: 0;
        }

        .card-body {
          padding: 2rem;
        }

        .benefits-title {
          font-size: 1.2rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 1.5rem;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .benefits-list {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1rem;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #374151;
        }

        .benefit-item:last-child {
          margin-bottom: 0;
        }

        .benefit-icon {
          color: #10b981;
          margin-top: 0.125rem;
          flex-shrink: 0;
        }

        .purchase-button {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: 2px solid #1e40af;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: bold;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 4px 4px 0px #1e40af;
        }

        .purchase-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 6px 6px 0px #1e40af;
        }

        .purchase-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 2px 2px 0px #1e40af;
        }

        .purchase-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .premium-special {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .notice-section {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.5;
        }

        .shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        @media (max-width: 640px) {
          .purchase-container {
            padding: 1rem 0.5rem;
          }

          .card-header {
            padding: 1.5rem 1rem 1rem;
          }

          .card-body {
            padding: 1.5rem 1rem;
          }

          .price {
            font-size: 2.5rem;
          }

          .purchase-tab {
            padding: 0.75rem 0.5rem;
            font-size: 0.9rem;
          }
        }
      `}</style>

      <div className="purchase-page">
        {/* 헤더 */}
             <SketchHeader
                 title='일일권 구매 안내'
                 showBack={true}
              onBack={goBack}
                 rightButtons={[]}
               />

        {/* 메인 콘텐츠 */}
        <div className="purchase-container">
          {/* 구매 카드 */}
          <div className="purchase-card">
            <HatchPattern opacity={0.1} />
            
            {/* 카드 헤더 */}
            <div className="card-header">
              <div className="shimmer"></div>
              <div className="plan-badge">
                <Zap size={16} />
                오늘 하루 이용권
              </div>
              
              <div className="price-section">
                <h2 className="price">$9.9</h2>
                <p className="price-period">/ 1일</p>
              </div>
            </div>

            {/* 카드 바디 */}
            <div className="card-body">
              <div className="benefits-title">
                <Star size={20} fill="#fbbf24" color="#fbbf24" />
                포함된 혜택
                <Star size={20} fill="#fbbf24" color="#fbbf24" />
              </div>

              <div className="benefits-list">
                {dailyBenefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <Check size={18} className="benefit-icon" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* 구매 버튼 */}
              <button
                className="purchase-button daily-special"
                onClick={handleDailyPurchase}
                disabled={isProcessing}
              >
                {isProcessing ? '처리 중...' : '지금 구매하기'}
              </button>

              {/* 안내 사항 */}
              <div className="notice-section">
                <strong>안내사항:</strong><br />
                • 일일권은 구매 시점부터 24시간 동안 유효합니다.<br />
                • 모든 혜택은 즉시 적용됩니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PurchasePage;