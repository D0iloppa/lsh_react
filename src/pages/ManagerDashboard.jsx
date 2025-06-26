import React, { useState, useEffect } from 'react';



import { Calendar, Users, ClipboardList, Tag, Star, Headphones, Bell, Settings } from 'lucide-react';

import SketchHeader from '@components/SketchHeader';
import SketchMenuBtn from '@components/SketchMenuBtn';
import HatchPattern from '@components/HatchPattern';
import CocktailIcon from '@components/CocktailIcon';
import SketchDiv from '@components/SketchDiv';

import '@components/SketchComponents.css';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

export default function ManagerDashboard({ navigateToPage, navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) {
  
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  useEffect(() => {
    window.scrollTo(0, 0);

    if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }


  }, [ messages, currentLang]);
  
  
  
  
  // 대시보드 상단 요약 정보
  const summary = [
    {
      title: "Today's Reservations",
      content: 'You have 12 reservations today.'
    },
    {
      title: 'Active Promotions',
      content: '3 ongoing promotions.'
    },
    {
      title: 'Recent Reviews',
      content: '5 new reviews.'
    }
  ];

  // 대시보드 주요 메뉴
  const menus = [
    {
      id: 1,
      icon: <Calendar size={24} />,
      name: 'Reservations',
      page: PAGES.RESERVATION_MANAGEMENT,
      menuEvent: () => { navigateToPage(PAGES.RESERVATION_MANAGEMENT); }
    },
    {
      id: 2,
      icon: <Users size={24} />,
      name: 'Staff Management',
      page: PAGES.STAFF_MANAGEMENT,
      menuEvent: () => { navigateToPage(PAGES.STAFF_MANAGEMENT); }
    },
    {
      id: 3,
      icon: <ClipboardList size={24} />,
      name: 'Staff Schedule',
      page: PAGES.STAFF_SCHEDULE,
      menuEvent: () => { navigateToPage(PAGES.STAFF_SCHEDULE); }
    },
    { 
      id: 4, 
      icon: <Tag size={24} />, 
      name: 'Promotions', 
      page: PAGES.PROMOTION_MANAGEMENT,
      menuEvent: () => { navigateToPage(PAGES.PROMOTION_MANAGEMENT); }
    },
    { 
      id: 5, 
      icon: <Star size={24} />, 
      name: 'Reviews', 
      page: PAGES.REVIEW_MANAGEMENT,
      menuEvent: () => { navigateToPage(PAGES.REVIEW_MANAGEMENT); }
    },
    { 
      id: 6, 
      icon: <Headphones size={24} />, 
      name: 'Support', 
      page: PAGES.CUSTOMER_SUPPORT,
      menuEvent: () => { navigateToPage(PAGES.CUSTOMER_SUPPORT); }
    },
    { 
      id: 7, 
      icon: <Bell size={24} />, 
      name: 'Notifications', 
      page: PAGES.NOTIFICATION_CENTER,
      menuEvent: () => { navigateToPage(PAGES.NOTIFICATION_CENTER); }
    },
    { 
      id: 8, 
      icon: <Settings size={24} />, 
      name: 'Settings', 
      page: PAGES.SETTINGS,
      menuEvent: () => { navigateToPage(PAGES.ManagerSettings); }
    }
    ,
    { 
      id: 9, 
      icon: <Settings size={24} />, 
      name: 'CHATTING', 
      page: PAGES.CHATTING,
      menuEvent: () => { navigateToPage(PAGES.CHATTINGLIST); }
    }
  ];

  return (
    <>
    <style jsx="true">{` 
      .menu-item { min-height: 58px; }
      .item-content{background: #fafafa;}
    `}</style>


    <div className="account-container">
    <SketchHeader 
        title={[<CocktailIcon key="icon" />, "LetanTon Sheriff Manager"]}
        showBack={false}
        onBack={goBack}
        rightButtons={[]}
      />


      <div style={{ padding: '0.7rem 0 0 0' }}>
        {summary.map((item, idx) => (
          <div key={idx} style={{
            background: 'white',
            padding: '0.2rem 0.9rem',
            borderRadius: '5px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            fontFamily: 'inherit',
            transform: 'rotate(-0.2deg)'
          }}>
            <SketchDiv className="item-content">
              <HatchPattern opacity={0.4} />
              <div style={{padding: '0.9rem'}}>
                <div style={{ fontWeight: 600, fontSize: '0.98rem', marginBottom: 2 }}>{item.title}</div>
                <div style={{ color: '#555', fontSize: '0.92rem', lineHeight: 1.3 }}>{item.content}</div>
              </div>
            </SketchDiv>
            
            
          </div>
        ))}
        </div>
    
      <div className="menu-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', padding: '1rem 0.7rem 1.5rem', alignItems: 'stretch' }}>
        {menus.map((menu) => (
          <div key={menu.id} style={{ flex: '1 1 45%', minWidth: '140px' }}>
            <SketchMenuBtn
              icon={menu.icon}
              name={menu.name}
              hasArrow={false}
              onClick={menu.menuEvent}
              className={"menu-item"}
            />
          </div>
        ))}
      </div>
      {/* 하단 네비게이션 바는 별도 컴포넌트로 분리되어 있을 수 있음 */}
    </div>
    </>
  );
} 