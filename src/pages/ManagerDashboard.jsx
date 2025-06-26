import React from 'react';



import { Calendar, Users, ClipboardList, Tag, Star, Headphones, Bell, Settings } from 'lucide-react';

import SketchHeader from '@components/SketchHeader';
import SketchMenuBtn from '@components/SketchMenuBtn';
import HatchPattern from '@components/HatchPattern';
import CocktailIcon from '@components/CocktailIcon';
import SketchDiv from '@components/SketchDiv';

import '@components/SketchComponents.css';



export default function ManagerDashboard({ navigateToPage, navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) {
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
      page: PAGES.SCHEDULE_ADD,
      menuEvent: () => {}
    },
    { 
      id: 4, 
      icon: <Tag size={24} />, 
      name: 'Promotions', 
      menuEvent: () => {} 
    },
    { 
      id: 5, 
      icon: <Star size={24} />, 
      name: 'Reviews', 
      menuEvent: () => {} 
    },
    { 
      id: 6, 
      icon: <Headphones size={24} />, 
      name: 'Support', 
      menuEvent: () => {} 
    },
    { 
      id: 7, 
      icon: <Bell size={24} />, 
      name: 'Notifications', 
      menuEvent: () => {} 
    },
    { 
      id: 8, 
      icon: <Settings size={24} />, 
      name: 'Settings', 
      menuEvent: () => {} 
    }
  ];

  return (
    <>
    <style jsx="true">{` 
    
    .item-content{margin: 0, padding: 0}
    
    
    
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
            margin: '0 0.7rem 0.5rem 0.7rem',
            padding: '0.7rem 0.9rem',
            borderRadius: '5px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            fontFamily: 'inherit',
            transform: 'rotate(-0.2deg)'
          }}>
            <SketchDiv className="item-content">
              <div style={{padding: '0.5rem'}}>
              <div style={{ fontWeight: 600, fontSize: '0.98rem', marginBottom: 2 }}>{item.title}</div>
              <div style={{ color: '#555', fontSize: '0.92rem', lineHeight: 1.3 }}>{item.content}</div>
              </div>
            </SketchDiv>
          </div>
        ))}
        </div>
    
      <div className="menu-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '0 1.5rem 1.5rem 1.5rem' }}>
        {menus.map((menu) => (
          <div key={menu.id} style={{ flex: '1 1 45%', minWidth: '140px' }}>
            <SketchMenuBtn
              icon={menu.icon}
              name={menu.name}
              hasArrow={false}
              onClick={menu.menuEvent}
              className="menu-item"
            />
          </div>
        ))}
      </div>
      {/* 하단 네비게이션 바는 별도 컴포넌트로 분리되어 있을 수 있음 */}
    </div>
    </>
  );
} 