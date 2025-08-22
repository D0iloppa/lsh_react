import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Check, Zap } from 'lucide-react';
import HatchPattern from '@components/HatchPattern';
import { useAuth } from '@contexts/AuthContext';
import { useMsg } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';
import { CreditCard } from 'lucide-react';
import SketchHeader from '@components/SketchHeader';


const PurchasePage = ({  goBack, navigateToPageWithData, PAGES, navigateToPage, ...otherProps}) => {
  const navigate = useNavigate();
  const { user, isActiveUser } = useAuth();
  const { get } = useMsg();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState(otherProps?.mode || 'daily');

  console.log('PAGES', user, otherProps)

  useEffect(() => {
  const resetContentAreaScroll = () => {
    // 진짜 스크롤 컨테이너인 .content-area를 리셋
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      contentArea.scrollTop = 0;
      console.log('content-area 스크롤이 0으로 리셋됨');
    }
    
    // window도 함께 (혹시 모르니)
    window.scrollTo(0, 0);
  };

  resetContentAreaScroll();
  
  // DOM 렌더링 완료 후 한 번 더
  setTimeout(resetContentAreaScroll, 100);
  
}, [user]);


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

    
    // 인앱 결제 요청
    const payload = 'buyItem';

     const isAndroid = !!window.native;
            const isIOS = !!window.webkit?.messageHandlers?.native?.postMessage;

    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.native) {
      // ✅ iOS WebView
      console.log('📱 iOS 인앱 결제 요청');

    
      window.webkit.messageHandlers.native.postMessage(payload);
      
    } else if (isAndroid) {
      // ✅ Android WebView
      console.log('🤖 Android 인앱 결제 요청');
      window.native.postMessage(payload);

    } else {
      console.warn('⚠️ 웹뷰 환경이 아님 - 인앱 결제 불가');
      //alert('인앱 결제가 지원되지 않는 환경입니다.');

      Swal.fire({
          title: get('daily.pass.notice.title'),
          text: get('in.app.purchase.not.supported'),
          icon: 'info',
          confirmButtonText: get('Common.Confirm')
        })
    }

    
  };

  const handleExtendPurchase = async () => {
    console.log('handleExtendPurchase', mode);

    if (!user?.user_id || user.type !== 'user') {
      Swal.fire({
        title: get('SWAL_SIGNUP_REQUIRED_TITLE'),
        text: get('SWAL_SIGNUP_REQUIRED_TEXT'),
        icon: 'warning',
        confirmButtonText: get('BUTTON_CONFIRM')
      });
      return;
    }

    
    // 인앱 결제 요청
    const payload = 'buyItem';

     const isAndroid = !!window.native;
            const isIOS = !!window.webkit?.messageHandlers?.native?.postMessage;

    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.native) {
      // ✅ iOS WebView
      console.log('📱 iOS 인앱 결제 요청');

    
      window.webkit.messageHandlers.native.postMessage(payload);
      
    } else if (isAndroid) {
      // ✅ Android WebView
      console.log('🤖 Android 인앱 결제 요청');
      window.native.postMessage(payload);

    } else {
      console.warn('⚠️ 웹뷰 환경이 아님 - 인앱 결제 불가');
      //alert('인앱 결제가 지원되지 않는 환경입니다.');

      Swal.fire({
          title: get('daily.pass.notice.title'),
          text: get('in.app.purchase.not.supported'),
          icon: 'info',
          confirmButtonText: get('Common.Confirm')
        })
    }

  };

  const buyCoupon = async () => {
    const response = await ApiClient.postForm('/api/buyCoupon', {
      user_id: user.user_id
    });
    const { success = false } = response;
  
    if (success) {
      await Swal.fire({
        title: get('SWAL_DAILY_TICKET_SUCCESS_TITLE'),
        text: get('SWAL_DAILY_TICKET_SUCCESS_TEXT'),
        icon: 'success',
        confirmButtonText: get('Common.Confirm')
      });
      navigate('/main');
    } else {
      throw new Error('구매 실패');
    }
  };
  
  const extendCoupon = async () => {

    const { subscription = {}} = await isActiveUser();


    const response = await ApiClient.postForm('/api/extendCoupon', {
      user_id: subscription.user_id,
      subscription_id: subscription.subscription_id
    });
    const { success = true } = response;
  
    if (success) {
      await Swal.fire({
        title: get('SWAL_DAILY_TICKET_SUCCESS_TITLE'),
        text: get('SWAL_DAILY_TICKET_SUCCESS_TEXT'),
        icon: 'success',
        confirmButtonText: get('Common.Confirm')
      });
      // navigate('/main');
    } else {
      throw new Error('구매 실패');
    }
  };
  
  useEffect(() => {
    const handleMessage = async (event) => {
  
      if (event.data === 'purchaseSuccess') {
        console.log('✅ 결제 성공 메시지 수신');
        setIsProcessing(true);
  
        try {
          if (mode === 'extend') {
            await extendCoupon();
          } else {
            await buyCoupon();
          }
        } catch (error) {
          console.error('❌ 일일권 구매 실패:', error);
          await Swal.fire({
            title: get('daily.pass.purchase.fail.title'),
            text: get('daily.pass.purchase.fail.text'),
            icon: 'error',
            confirmButtonText: get('Common.Confirm')
          });
        } finally {
          setIsProcessing(false);
        }
      } else if (event.data === 'purchaseCancelled') {
        await Swal.fire({
          title: get('daily.pass.payment.cancel.title'),
          text: get('daily.pass.payment.cancel.text'),
          icon: 'info',
          confirmButtonText: get('Common.Confirm')
        });
        setIsProcessing(false);
      } else {

        if ( event.data === 'onBackPressed' )  {
            if(mode === 'extend'){
              goBack();
            }else{
              navigate('/main'); // 메인으로 직접 이동
            }
        } else {
          // 실패 케이스: icon 을 error 로 수정
          await Swal.fire({
            title: get('daily.pass.payment.fail.title'),
            text: get('daily.pass.payment.fail.text'),
            icon: 'error',
            confirmButtonText: get('Common.Confirm')
          });
          setIsProcessing(false);
        }
      }
    };
  
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
    // ✅ 필요한 값들만 의존성에 넣어 리스너 재등록
  }, [mode, user?.user_id, get, navigate]);



    const handleBack = () => {
    //navigate(-1); // 브라우저 히스토리 뒤로가기
    

    if(mode === 'extend'){
      goBack();
    }else{
      navigate('/main'); // 메인으로 직접 이동
    }
  };

  // 일일권 혜택 목록
  const dailyBenefits = [
    get('Popup.Today.Benefit1'),
    get('Popup.Today.Benefit2'),
    get('Popup.Today.Benefit3'),
    get('Popup.Today.Benefit4'),
    get('Popup.Today.Benefit5'),
    get('Popup.Today.Benefit6')
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
          padding: 0.5rem 0.5rem;
        }

        .benefits-title {
          font-size: 1.2rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 0.5rem;
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
          padding: 1rem;
          margin-bottom: 1rem;
          height: 250px;
          overflow-y: auto;
        }

        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1rem;
          font-size: 15px;
          line-height: 1.5;
          color: #374151;
          // letter-spacing: -1px;
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
          padding: 0.5rem;
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
            padding: 0rem 0.5rem;
          }

          .card-header {
            padding: 1rem 1rem 1rem;
          }

          .card-body {
            padding: 0.5rem 0.5rem;
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
                 title={mode === 'extend' ? '이용권 연장 안내' : get('daily.pass.purchase.title')}
                 showBack={true}
              onBack={handleBack}
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
                {get('daily.pass.badge.title')}
              </div>
              
              <div className="price-section">
                <h2 className="price">$9.99</h2>
                <p className="price-period">{get('daily.pass.price.period')}</p>
              </div>
            </div>

            {/* 카드 바디 */}
            <div className="card-body">
              <div className="benefits-title">
                <Star size={20} fill="#fbbf24" color="#fbbf24" />
                {get('daily.pass.benefits.title')}
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
                {isProcessing ? get('daily.pass.processing') : get('daily.pass.purchase.button')}
              </button>

              {/* 안내 사항 */}
              <div className="notice-section">
                <strong>{get('daily.pass.notice.title')}</strong><br />
                • {get('daily.pass.notice.validity')}<br />
                • {get('daily.pass.notice.immediate')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PurchasePage;