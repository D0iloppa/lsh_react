import React, { useState, useEffect } from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchMenuBtn from '@components/SketchMenuBtn';
import '@components/SketchComponents.css';

import { useNavigate } from 'react-router-dom';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import SketchHeader from '@components/SketchHeaderMain'

import { User, History, CreditCard, Bell, Heart, Settings, HelpCircle, Megaphone, LogOut, MessageCircle, Tag } from 'lucide-react';
import LoadingScreen from '@components/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';

import Swal from 'sweetalert2';
import ApiClient from '@utils/ApiClient';
import useWebviewBackBlock from '@hooks/useWebviewBackBlock';

const AccountPage = ({
  navigateToPageWithData,
  navigateToPage,
  PAGES,
  goBack,
  ...otherProps
}) => {

  const navigate = useNavigate();

  const { user, logout, isActiveUser } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const [showChatButton, setShowChatButton] = useState(true);
  const [activeUser, setActiveUser] = useState({});
  const [unreadChatCount, setUnreadChatCount] = useState(0);


  // 채팅 개수 가져오기
  const fetchUnreadChatCount = async () => {
    if (!user?.user_id) return;

    try {
      const response = await ApiClient.get('/api/getUnreadCountChat_mng', {
        params: {
          participant_type: 'user',
          participant_user_id: user.user_id
        }
      });

      console.log("count", response)

      // response가 직접 숫자로 온다면
      const count = parseInt(response) || 0;
      setUnreadChatCount(count);

    } catch (error) {
      console.error('읽지 않은 채팅 개수 조회 실패:', error);
      setUnreadChatCount(0);
    }
  };

  // 초기 로드 및 주기적 업데이트
  useEffect(() => {
    fetchUnreadChatCount();

    const interval = setInterval(fetchUnreadChatCount, 3000);

    return () => clearInterval(interval);
  }, [user]);

  // 채팅 페이지 이동 시 개수 초기화 함수
  const resetChatCount = () => {
    //setUnreadChatCount(0);
  };

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

  const menuBtnClick = async (menu_id) => {
    switch (menu_id) {
      case 1:
        navigateToPageWithData && navigateToPageWithData(PAGES.PROFILE);
        break;
      case 2:
        navigateToPageWithData && navigateToPageWithData(PAGES.BOOKINGHISTORY);
        break;
      case 3:{

        const {isActiveUser: isActive = false } = await isActiveUser();
        console.log('isActive', isActive);

        if(!isActive){
            // 구매 유도 팝업
            let swalTitle = get('chatting_swal_title');
            let swalText = get('CHATTING_PURCHASE_MESSAGE');

            Swal.fire({
              title: swalTitle,
              text: swalText,
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: get('Popup.Button.TodayTrial'),
              cancelButtonText: get('Common.Cancel'),
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33'
            }).then((result) => {
              if (result.isConfirmed) {
                navigate('/purchase');
              }
            });
        }else{
          navigateToPageWithData &&
          navigateToPageWithData(PAGES.CHATTINGLIST, { chatRoomType: 'user' });
        }
        break; 
      }
      case 4:
        navigateToPageWithData && navigateToPageWithData(PAGES.NOTICE);
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
      icon: <MessageCircle size={20} />,
      name: get('MENU_CHATTING'),
      isRead: true,
      hasArrow: false
    },

    // {
    //   id: 4,
    //   icon: <Megaphone size={20} />,
    //   name:  get('Menu1.99'),
    //   isRead: true,
    //   hasArrow: false
    // },

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
          padding-bottom: 3rem;
        }

        @media (max-width: 480px) {
          .account-container {
            padding-top: 50px;
            padding-bottom: 3rem;
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
        
        .unread-badge {
          position: absolute;
          top: 15px;
          right: 12px;
          background-color: red;
          color: white;
          font-size: 12px;
          font-weight: bold;
          border-radius: 50%;
          width: 20px;       /* 고정 크기 */
          height: 20px;      /* 고정 크기 */
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }

      `}</style>

      <div className="page-wrapper">
        {/* 특별한 className을 추가하여 우선순위 높이기 */}
        <SketchHeader
          title={get('MENU_SETTINGS')}
          showBack={true}
          onBack={handleBack}
          sticky={true}
          className="account-page-header"
        />


        <div className="account-container">
          <div className="menu-section">
            {menus.map((menu) => (
              <div key={menu.id} style={{ position: "relative" }}>
                <SketchMenuBtn
                  icon={menu.icon}
                  name={menu.name}
                  hasArrow={menu.hasArrow}
                  onClick={() => menuBtnClick(menu.id)}
                  className="menu-item"
                />

                {/* 채팅 메뉴(id === 3)이고 unreadChatCount > 0일 때만 표시 */}
                {menu.id === 3 && unreadChatCount > 0 && (
                  <span className="unread-badge">
                    {unreadChatCount}
                  </span>
                )}
              </div>
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