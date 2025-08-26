import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Check, Zap } from 'lucide-react';
import HatchPattern from '@components/HatchPattern';
import { useAuth } from '@contexts/AuthContext';
import { useMsg } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';
import { getVersionCheck } from '@utils/storage';


import Swal from 'sweetalert2';
import { CreditCard } from 'lucide-react';
import SketchHeader from '@components/SketchHeader';




const PurchasePage = ({  goBack, navigateToPageWithData, PAGES, navigateToPage, ...otherProps}) => {
  const navigate = useNavigate();
  const { user, isActiveUser } = useAuth();
  const { get } = useMsg();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState(otherProps?.mode || 'daily');


  const daysRef = useRef(1);

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
  const handleDailyPurchase = async (item) => {


    const { price, days = 1 } = item;
    

    daysRef.current = days;

    if (!user?.user_id || user.type !== 'user') {
      Swal.fire({
        title: get('SWAL_SIGNUP_REQUIRED_TITLE'),
        text: get('SWAL_SIGNUP_REQUIRED_TEXT'),
        icon: 'warning',
        confirmButtonText: get('BUTTON_CONFIRM')
      });
      return;
    }

    let payload = 'buyItem';

    if(days > 1){
      payload = payload + (days + "");
    }


    /*
    if ( item == 0 ) payload=payload;
    else if ( item == 1 ) payload=payload+"3";
    else if ( item == 2 ) payload=payload+"7";
    else if ( item == 3 ) payload=payload+"15";
    else if ( item == 4 ) payload=payload+"30";
    */

    // 인앱 결제 요청

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

  const handleExtendPurchase = async (item) => {
    console.log('handleExtendPurchase', mode);


    const { price, days = 1 } = item;

    
    daysRef.current = days;

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
    let payload = 'buyItem';

    if(days > 1){
      payload = payload + (days + "");
    }

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

  const buyCoupon = async (days=1) => {

    Swal.fire(days);

    const response = await ApiClient.postForm('/api/buyCoupon', {
      user_id: user.user_id,
      days: days
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
  
  const extendCoupon = async (days=1) => {

    const { subscription = {}} = await isActiveUser();
    

    const response = await ApiClient.postForm('/api/extendCoupon', {
      user_id: subscription.user_id,
      subscription_id: subscription.subscription_id,
      days: days
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
  

        const days = daysRef.current;


        try {
          if (mode === 'extend') {
            await extendCoupon(days);
          } else {
            await buyCoupon(days);
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

  const highlightBenefit = (msg, highlightTexts = []) => {
    let result = msg;
    highlightTexts.forEach(text => {
      result = result.replace(
        text,
        `<span class="highlighted-benefit">${text}</span>`
      );
    });
    return result;
  };
  


  const highlighted = highlightBenefit(get('Popup.Today.Benefit7'), [
    '10% 추가 할인',
    '10% additional discount',
    'Giảm thêm 10%',
    '追加割引',
    '折优惠'
  ]);

  // 일일권 혜택 목록
  const dailyBenefits = [
    highlighted,
    get('Popup.Today.Benefit1'),
    get('Popup.Today.Benefit2'),
    get('Popup.Today.Benefit3'),
    get('Popup.Today.Benefit4'),
    get('Popup.Today.Benefit5'),
    get('Popup.Today.Benefit6')
  ];

  const asHtmlBlock = (htmlString) => {
    return <span dangerouslySetInnerHTML={{ __html: htmlString }} />;
  };


  const {isLatestVersion, isAndroid, isIOS} = getVersionCheck();

  console.log('isLatestVersion', isLatestVersion, isAndroid, isIOS);


  const itemList = [
    {
      //1일권
      title: get('daily.pass.purchase.title.1'),
      price: 9.99,
      sale: 0,
      days: 1,
      visible: true
    },
    {
      //3일권
      title: get('daily.pass.purchase.title.3'),
      price: 26.00,
      saleRate: 12,
      days: 3,
      visible: true
    },
    {
      //7일권
      title: get('daily.pass.purchase.title.7'),
      price: 51.90,
      saleRate: 25,
      days: 7,
      visible: true
    },
    {
      //15일권
      title: get('daily.pass.purchase.title.15'),
      price: 89.00,
      saleRate: 40,
      days: 15,
      visible: false
    },
    {
      //1개월
      title: get('daily.pass.purchase.title.30'),
      price: 148.99,
      saleRate: 50,
      days: 30,
      visible: false
    }
  ]

  return (
    <>
      <style jsx="true">{`
        .purchase-page {
          min-height: 100dvh;
          background: #f9fafb;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        @media (max-height: 640px) {
          .purchase-page {
            max-height: 50dvh;
          }
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
          overflow-x: hidden;
          overflow-y: auto;
          position: relative;
          box-shadow: 6px 6px 0px #c1c1c1;
          margin-bottom: 2rem;
        }

        .card-header {
          padding: 0.5rem 2rem 0.5rem;
          text-align: center;
          position: relative;
          background: linear-gradient(135deg, #00f0ff, #fff0d8);
        }

        .plan-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(255, 255, 255, 0.9);
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .price-section {
          margin-bottom: 0.25rem;
        }

        .price {
          font-size: 1.5rem;
          font-weight: bold;
          color: #333;
          margin: 0;
        }

        .price-period {
          font-size: 0.75rem;
          color: #555;
          margin: 0;
        }

        .card-body {
          padding: 0.5rem 0.5rem;
          min-height: 200px;
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
          height: 170px;
          overflow-y: hidden;
        }

        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 0.3rem;
          margin-bottom: 0.4rem;
          font-size: 13px;
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

        .compact-purchase-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .compact-purchase-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: 2px solid #1e40af;
          padding: 0.5rem 1rem;
          font-size: 0.7rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 2px 2px 0px #1e40af;
          width: 100%;
        }

        .compact-purchase-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 4px 4px 0px #1e40af;
        }

        .compact-purchase-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 2px 2px 0px #1e40af;
        }

        .compact-purchase-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .button-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .button-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .sale-badge {
          background: rgba(255, 255, 255, 0.2);
          color: #fbbf24;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: bold;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .button-right {
          display: flex;
          align-items: center;
          gap: 0.1rem;
        }

        .price-amount {
          font-size: 1.1rem;
          font-weight: bold;
          margin: 0;
        }

        .price-currency {
          font-size: 0.9rem;
          opacity: 0.9;
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

        .highlighted-benefit {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
          padding: 0.15rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
          display: inline-flex;
          align-items: center;
          line-height: 1.2;
          vertical-align: middle;
          margin-left: 0.2rem;
          margin-bottom: 3px;
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
            
            {/* 카드 헤더 */}
            <div className="card-header">
              <div className="shimmer"></div>
              <div className="plan-badge" style={{display: 'none'}}>
                <Zap size={16} />
                {get('daily.pass.badge.title')}
              </div>
              
              <div className="price-section">
                <h2 className="price">
                  $9.99 <span className="price-period">{get('daily.pass.price.period')}</span>
                </h2>
                
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
                    {asHtmlBlock(benefit)}
                  </div>
                ))}
              </div>

              <div className="compact-purchase-buttons">
                {itemList.map((item, index) => (
                  item.visible && (
                    <button key={index}
                      className="compact-purchase-button"
                      onClick={() => handleDailyPurchase(item)}
                      disabled={isProcessing}
                    >
                      <div className="button-left">
                        <span className="button-title">{item.title}</span>
                        {item.saleRate > 0 && (
                          <span className="sale-badge">{item.saleRate}% sale</span>
                        )}
                      </div>
                      <div className="button-right">
                        <span className="price-currency">$</span>
                        <span className="price-amount">{item.price.toFixed(2)}</span>
                      </div>
                    </button>
                  )
                ))}
              </div>

              {/* 구매 버튼 */}
              {/*
              <button
                className="purchase-button daily-special"
                onClick={handleDailyPurchase}
                disabled={isProcessing}
              >
                {isProcessing ? get('daily.pass.processing') : get('daily.pass.purchase.button')}
              </button>
              */}

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