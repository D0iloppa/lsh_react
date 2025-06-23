import React, { useState, useEffect } from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchMenuBtn from '@components/SketchMenuBtn';
import '@components/SketchComponents.css';

import { useNavigate } from 'react-router-dom';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import SketchHeader from '@components/SketchHeader'

import { User, History, CreditCard, Bell, Heart, Settings, HelpCircle, LogOut, MessageCircle   } from 'lucide-react';
import LoadingScreen from '@components/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';

const AccountPage = ({ 
  navigateToPageWithData, 
  PAGES,
  goBack,
  ...otherProps 
}) => {


  const navigate = useNavigate();

  const { logout } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const [showChatButton, setShowChatButton] = useState(true);


  useEffect(() => {
      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }
    }, [messages, currentLang]);

  const handleBack = () => {
    console.log('Back 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.HOME);
  };

  const handleChatClick = () => {
    // 채팅 페이지로 이동하거나 채팅 기능 연결
    console.log('채팅 버튼 클릭');
    // navigateToPageWithData && navigateToPageWithData(PAGES.CHAT);
    // 또는 외부 채팅 서비스 연결
    // window.open('https://chat-service.com', '_blank');
  };

  const menuBtnClick = (menu_id) => {
    // 각 알림 타입에 따른 페이지 이동 로직
    switch(menu_id) {
      case 1: // Profile (제작 필요)
        navigateToPageWithData && navigateToPageWithData(PAGES.PROFILE);
        break;
      case 2:  // Booking History
        navigateToPageWithData && navigateToPageWithData(PAGES.BOOKINGHISTORY);
        break;
      case 3: // Payment (제작 필요)
        navigateToPageWithData && navigateToPageWithData(PAGES.PAYMENT);
        break;
      case 4: // Notifications
        navigateToPageWithData && navigateToPageWithData(PAGES.NOTIFICATIONS);
        break;
      case 5: // Favorites
        navigateToPageWithData && navigateToPageWithData(PAGES.FAVORITES);
        break;
      case 6: // Settings
        navigateToPageWithData && navigateToPageWithData(PAGES.SETTING);
        break;
      case 7: // Support
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
      icon: <CreditCard size={20} />,
      name:  get('Menu1.7'),
      isRead: true,
      hasArrow: false
    },
    {
      id: 4,
      icon: <Bell size={20} />,
      name: get('Notification1.1'),
      isRead: false,
      hasArrow: false
    },
    {
      id: 5,
      icon: <Heart size={20} />,
      name: get('Menu1.8'),
      isRead: true,
      hasArrow: false
    },
    {
      id: 6,
      icon: <Settings size={20} />,
      name: get('Menu1.3'),
      isRead: true,
      hasArrow: false
    },
    {
      id: 7,
      icon: <HelpCircle size={20} />,
      name: get('Menu1.9'),
      isRead: true,
      hasArrow: false
    }
  ];

  return (
    <>
      <style jsx="true">{`
        .account-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;
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

        .logout{
          /*margin-top:100px;*/
        }

        .chat-button {
          position: fixed;
          bottom: 110px; /* 하단 네비게이션 위에 위치 */
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
          z-index: 1000;
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


      `}</style>

      <div className="account-container">
        
        {/* Header */}
        <SketchHeader 
          title= { get('Menu1.4') }
          showBack={true}
          onBack={goBack}
          rightButtons={[]}
        />

        {/* Menus Section */}
        <div className="menu-section">
          {menus.map((menu) => (
          <SketchMenuBtn
              key={menu.id}
              icon={menu.icon}
              name={menu.name}
              hasArrow={menu.hasArrow}
              onClick={() => menuBtnClick(menu.id)}
              className={`menu-item`}
            />
          ))}

          <SketchMenuBtn
              key={'logout'}
              icon={<LogOut size={20} />}
              name={get('Menu1.10')}
              hasArrow={false}
              onClick={async () => {

                console.log('logout')

                await logout();
                navigate('/login'); 

              }}
              className={`logout`}
            />
        </div>
        {/* 고정 채팅 버튼 */}
        <div className="chat-button" onClick={handleChatClick}>
          <MessageCircle size={24} className="chat-icon" />
        </div>

        <LoadingScreen 
          variant="cocktail"
          loadingText="Loading..."
          isVisible={isLoading} 
        />
               <LoadingScreen 
                         variant="cocktail"
                         loadingText="Loading..."
                         isVisible={isLoading} 
                       />
        

      </div>
    </>
  );
};

export default AccountPage;