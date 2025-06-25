import React from 'react';



import { Calendar, Users, ClipboardList, Tag, Star, Headphones, Bell, Settings } from 'lucide-react';

import SketchHeader from '@components/SketchHeader';
import SketchMenuBtn from '@components/SketchMenuBtn';
import HatchPattern from '@components/HatchPattern';

import '@components/SketchComponents.css';



export default function ManagerDashboard({ goBack, navigateToPageWithData, PAGES, ...otherProps  }) {
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
    { id: 1, icon: <Calendar size={24} />, name: 'Reservations' },
    { id: 2, icon: <Users size={24} />, name: 'Staff Management' },
    { id: 3, icon: <ClipboardList size={24} />, name: 'Staff Schedule' },
    { id: 4, icon: <Tag size={24} />, name: 'Promotions' },
    { id: 5, icon: <Star size={24} />, name: 'Reviews' },
    { id: 6, icon: <Headphones size={24} />, name: 'Support' },
    { id: 7, icon: <Bell size={24} />, name: 'Notifications' },
    { id: 8, icon: <Settings size={24} />, name: 'Settings' }
  ];

  return (
    <div className="account-container">

      
    <SketchHeader 
        title="LetanTon Sheriff Manager"
        showBack={false}
        onBack={goBack}
        rightButtons={[]}
      />


      <div style={{ padding: '1.5rem 0 0 0' }}>
        {summary.map((item, idx) => (
          <div key={idx} style={{
            background: 'white',
            margin: '0 1.5rem 1rem 1.5rem',
            padding: '1.2rem',
            borderRadius: '8px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            fontFamily: 'inherit',
            transform: 'rotate(-0.2deg)'
          }}>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 4 }}>{item.title}</div>
            <div style={{ color: '#555', fontSize: '1rem' }}>{item.content}</div>
          </div>
        ))}
      </div>
      <div className="menu-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '0 1.5rem 1.5rem 1.5rem' }}>
        {menus.map((menu, idx) => (
          <div key={menu.id} style={{ flex: '1 1 45%', minWidth: '140px' }}>
            <SketchMenuBtn
              icon={menu.icon}
              name={menu.name}
              hasArrow={false}
              onClick={() => {}}
              className="menu-item"
            />
          </div>
        ))}
      </div>
      {/* 하단 네비게이션 바는 별도 컴포넌트로 분리되어 있을 수 있음 */}
    </div>
  );
} 