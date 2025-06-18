import React from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchMenuBtn from '@components/SketchMenuBtn';
import '@components/SketchComponents.css';


import SketchHeader from '@components/SketchHeader'

import { User, History, CreditCard, Bell, Heart, Settings, HelpCircle, LogOut  } from 'lucide-react';


const AccountPage = ({ 
  navigateToPageWithData, 
  PAGES,
  ...otherProps 
}) => {

  const handleBack = () => {
    console.log('Back 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.HOME);
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
      name: "Profile",
      isRead: true,
      hasArrow: false
    },
    {
      id: 2,
      icon: <History size={20} />,
      name: "Booking History",
      isRead: true,
      hasArrow: false
    },
    {
      id: 3,
      icon: <CreditCard size={20} />,
      name: "Payment",
      isRead: true,
      hasArrow: false
    },
    {
      id: 4,
      icon: <Bell size={20} />,
      name: "Notifications",
      isRead: false,
      hasArrow: false
    },
    {
      id: 5,
      icon: <Heart size={20} />,
      name: "Favorites",
      isRead: true,
      hasArrow: false
    },
    {
      id: 6,
      icon: <Settings size={20} />,
      name: "Settings",
      isRead: true,
      hasArrow: false
    },
    {
      id: 7,
      icon: <HelpCircle size={20} />,
      name: "Support",
      isRead: true,
      hasArrow: false
    }
  ];

  return (
    <>
      <style jsx>{`
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


      `}</style>

      <div className="account-container">
        
        {/* Header */}
        <SketchHeader 
          title="Account"
          showBack={true}
          onBack={() => console.log("뒤로가기")}
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
              name={'Logout'}
              hasArrow={false}
              onClick={() => console.log('logout')}
              className={`logout`}
            />
        </div>

        

      </div>
    </>
  );
};

export default AccountPage;