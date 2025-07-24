import React, { useState, useEffect } from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchMenuBtn from '@components/SketchMenuBtn';
import '@components/SketchComponents.css';

import { useNavigate } from 'react-router-dom';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import SketchHeader from '@components/SketchHeaderMain'

import { User, History, CreditCard, Bell, Heart, Settings, HelpCircle, LogOut, MessageCircle, Tag   } from 'lucide-react';
import LoadingScreen from '@components/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';

import Swal from 'sweetalert2';
import ApiClient from '@utils/ApiClient';

const AccountPage = ({ 
  navigateToPageWithData, 
  navigateToPage,
  PAGES,
  goBack,
  ...otherProps 
}) => {

  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const [showChatButton, setShowChatButton] = useState(true);

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

  useEffect(() => {
      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }
    }, [messages, currentLang]);

  const handleBack = () => {
    console.log('Back 클릭');
    navigateToPage(PAGES.HOME);
  };

  const handleChatClick = () => {
    console.log('채팅 버튼 클릭');
  };

  const menuBtnClick = (menu_id) => {
    switch(menu_id) {
      case 1:
        navigateToPageWithData && navigateToPageWithData(PAGES.PROFILE);
        break;
      case 2:
        navigateToPageWithData && navigateToPageWithData(PAGES.BOOKINGHISTORY);
        break;
      case 3:
        navigateToPageWithData && navigateToPageWithData(PAGES.PROMOTION);
        break;
      case 4:
        navigateToPageWithData && navigateToPageWithData(PAGES.PAYMENT);
        break;
      case 5:
        navigateToPageWithData && navigateToPageWithData(PAGES.NOTIFICATIONS);
        break;
      case 6:
        navigateToPageWithData && navigateToPageWithData(PAGES.FAVORITES);
        break;
      case 7:
        navigateToPageWithData && navigateToPageWithData(PAGES.SETTING);
        break;
      case 8:
        navigateToPageWithData && navigateToPageWithData(PAGES.CSPAGE2);
        break;
    }
  };

  const menus = [
    {
      id: 1,
      icon: <User size={20} />,
      name: get('Menu1.5'),
      isRead: true,
      hasArrow: false
    },
    {
      id: 2,
      icon: <History size={20} />,
      name: get('Menu1.6'),
      isRead: true,
      hasArrow: false
    },
     {
      id: 3,
      icon: <Tag size={20} />,
      name: get('btn.promotion.1'),
      isRead: true,
      hasArrow: false
    },
    /*
    {
      id: 4,
      icon: <CreditCard size={20} />,
      name:  get('Menu1.7'),
      isRead: true,
      hasArrow: false
    },
    */
    {
      id: 5,
      icon: <Bell size={20} />,
      name: get('Notification1.1'),
      isRead: false,
      hasArrow: false
    },
    {
      id: 6,
      icon: <Heart size={20} />,
      name: get('Menu1.8'),
      isRead: true,
      hasArrow: false
    },
    {
      id: 7,
      icon: <Settings size={20} />,
      name: get('Menu1.3'),
      isRead: true,
      hasArrow: false
    },
    {
      id: 8,
      icon: <HelpCircle size={20} />,
      name: get('Menu1.9'),
      isRead: true,
      hasArrow: false
    }
  ];

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: get('account_page_delete_swal_title'),
      text: get('account_page_delete_swal_text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: get('account_page_delete_swal_confirm'),
      cancelButtonText: get('Reservation.CancelButton')
    });

    if (result.isConfirmed) {
      try {
        await ApiClient.get('/api/userDelete', {
          params: { 
            user_id: user?.user_id,
            action: 'force'
          }
        });

        await Swal.fire({
          title: '탈퇴 완료',
          text: '계정이 성공적으로 삭제되었습니다.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        
        await logout();
        navigateToPage(PAGES.HOME);
        
      } catch (e) {
        console.error('계정 탈퇴 중 오류:', e);
      }
    }
  };

  return (
    <>
      {/* 강제 고정을 위한 글로벌 스타일 */}
      <style>{`
        /* 최고 우선순위로 헤더 고정 */
        .account-page-header.page-header {
          position: fixed !important;
          top: 0 !important;
          left: 50% !important;
          transform: translateX(-50%) rotate(0.1deg) !important;
          width: 100% !important;
          max-width: 28rem !important;
          z-index: 10000 !important;
          background-color: #ffffff !important;
          border-bottom: 0.8px solid #666 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          padding: 0.3rem 0 !important;
          min-height: 2rem !important;
        }

        /* 모바일 반응형 */
        @media (max-width: 480px) {
          .account-page-header.page-header {
            padding: 0.75rem 1rem !important;
            min-height: 3rem !important;
          }
        }

        .page-wrapper {
          position: relative;
          min-height: 100vh;
          background: #fff;
        }

        .account-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          padding-top: 50px; /* 헤더 높이만큼 여백 */
        }

        @media (max-width: 480px) {
          .account-container {
            padding-top: 50px;
          }
        }

        .menu-section {
          padding: 1.5rem;
        }

        .menu-item {
          width: 100%;
          margin-bottom: 0.75rem;
          padding: 1rem;
          background-color: white;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-align: left;
          cursor: pointer;
          transform: rotate(-0.2deg);
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .chat-button {
          position: fixed;
          bottom: 110px;
          right: 20px;
          width: 50px;
          height: 50px;
          background: #1f2937;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 999;
          transition: all 0.3s ease;
          border: 2px solid #333;
        }

        .chat-button:hover {
          transform: scale(1.1);
          background: #374151;
        }

        .chat-button:active {
          transform: scale(0.95);
        }

        .chat-icon {
          color: white;
        }

        .staff-delete {
          text-align: center;
          color: red;
          margin-top: 0.8rem;
          text-decoration: underline;
          cursor: pointer;
        }

        .delete-container {
          margin-top: 20px;
        }
      `}</style>

      <div className="page-wrapper">
        {/* 특별한 className을 추가하여 우선순위 높이기 */}
        <SketchHeader 
          title={get('MENU_SETTINGS')} 
          showBack={true}
          onBack={goBack}
          sticky={true}
          className="account-page-header"
        />

        <div className="account-container">
          <div className="menu-section">
            {menus.map((menu) => (
              <SketchMenuBtn
                key={menu.id}
                icon={menu.icon}
                name={menu.name}
                hasArrow={menu.hasArrow}
                onClick={() => menuBtnClick(menu.id)}
                className="menu-item"
              />
            ))}

            {/*
            <SketchMenuBtn
              key="logout"
              icon={<LogOut size={20} />}
              name={get('Menu1.10')}
              hasArrow={false}
              onClick={async () => {
                console.log('logout')


                 const result = await Swal.fire({
                    title: get('LOGOUT_TITLE') || '로그아웃',
                    text: get('LOGOUT_MSG') || '로그아웃 되었습니다.',
                    icon: 'success',
                    confirmButtonText: get('FORGOT_PASSWORD_SUCCESS_CONFIRM') || '확인'
                  });

                  if (result.isConfirmed) {
                    await logout();
                   navigateToPage(PAGES.HOME);
                  }
              }}
              className="logout"
            />
            */}

            <div className="delete-container">
              <div className="staff-delete" onClick={handleDelete}>
                {get('account_page_delete_btn')}
              </div>
            </div>
          </div>

          {/* <div className="chat-button" onClick={handleChatClick}>
            <MessageCircle size={24} className="chat-icon" />
          </div> */}

          <LoadingScreen 
            variant="cocktail"
            loadingText="Loading..."
            isVisible={isLoading} 
          />
        </div>
      </div>
    </>
  );
};

export default AccountPage;