import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Users, ClipboardList, Tag, Star, Headphones, Bell, Settings, MessagesSquare } from 'lucide-react';

import SketchHeader from '@components/SketchHeader';
import SketchMenuBtn from '@components/SketchMenuBtn';
import HatchPattern from '@components/HatchPattern';
import CocktailIcon from '@components/CocktailIcon';
import SketchDiv from '@components/SketchDiv';
import { useFcm } from '@contexts/FcmContext';

import '@components/SketchComponents.css';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';

import ApiClient from '@utils/ApiClient';

export default function ManagerDashboard({ navigateToPage, navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) {
  

  const { user, verifyPassword, logout } = useAuth();
   const { fcmToken } = useFcm();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const [dashboardInfo, setDashboardInfo] = useState({
    recentReviews: 0,
    todaysReservations: 0,
    activePromotions: 0
  });


  
useEffect(() => {

  const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';

  const upateAppId = async () => {

   // alert(fcmToken);
    try {

      const res = await axios.get(`${API_HOST}/api/upateAppId`, {
        params: {
          user_id: user?.manager_id || 1,
          app_id: fcmToken || '2345',
          login_type:1,
        },
      });
      return res.data || [];
    } catch (err) {
      //alert(err);
      return [];
    }
  };

  if (fcmToken) {
    upateAppId();
    // optional logging
    console.log('📲 HomePage에서 받은 FCM 토큰:', fcmToken, 'manager_id:', user?.manager_id || 1);
  }
}, [fcmToken, user]);


  useEffect(() => {
    window.scrollTo(0, 0);

    if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }

    // 대시보드 정보 불러오기
    const fetchDashboardInfo = async () => {
      try {
        // venue_id는 pageData 또는 otherProps에서 받아온다고 가정
        const venue_id = user?.venue_id
        if (!venue_id) return;
        const res = await ApiClient.postForm('/api/getManagerDashboardInfo', { venue_id });
        setDashboardInfo(res);
      } catch (e) {
        console.error('Dashboard info fetch error:', e);
      }
    };
    fetchDashboardInfo();

  }, [ messages, currentLang ]);
  
  
  const formatMessage = (messageKey, count) => {
    return get(messageKey).replace('{count}', count);
  };
  
  // 대시보드 상단 요약 정보
  const summary = [
    {
      title: (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => navigateToPage(PAGES.RESERVATION_MANAGEMENT)}
          >
          <Calendar size={16} opacity={0.5}/>
          <span>{get('DASHBOARD_TODAYS_RESERVATIONS')}</span>
        </div>
      ),
      content: formatMessage('DASHBOARD_RESERVATIONS_COUNT', dashboardInfo.todaysReservations)
    },
    {
      title: (
         <div
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => navigateToPage(PAGES.PROMOTION_MANAGEMENT)}
          >
          <Tag size={16} opacity={0.5}/>
          <span>{get('DASHBOARD_ACTIVE_PROMOTIONS')}</span>
        </div>
      ),
      content: formatMessage('DASHBOARD_PROMOTIONS_COUNT', dashboardInfo.activePromotions)
    },
    {
      title: (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => navigateToPage(PAGES.REVIEW_MANAGEMENT)}
          >
          <Star size={16} opacity={0.5}/>
          <span>{get('DASHBOARD_RECENT_REVIEWS')}</span>
        </div>
      ),
      content: formatMessage('DASHBOARD_REVIEWS_COUNT', dashboardInfo.recentReviews)
    }
  ];

  // 대시보드 주요 메뉴

const menus = [
  {
    id: 1,
    icon: <Calendar size={24} />,
    name: get('MENU_RESERVATIONS'),
    page: PAGES.RESERVATION_MANAGEMENT,
    menuEvent: () => { navigateToPage(PAGES.RESERVATION_MANAGEMENT); }
  },
  {
    id: 2,
    icon: <Users size={24} />,
    name: get('MENU_STAFF_MANAGEMENT'),
    page: PAGES.STAFF_MANAGEMENT,
    menuEvent: () => { navigateToPage(PAGES.STAFF_MANAGEMENT); }
  },
  {
    id: 3,
    icon: <ClipboardList size={24} />,
    name: get('MENU_STAFF_SCHEDULE'),
    page: PAGES.STAFF_SCHEDULE,
    menuEvent: () => { navigateToPage(PAGES.STAFF_SCHEDULE); }
  },
  { 
    id: 4, 
    icon: <Tag size={24} />, 
    name: get('MENU_PROMOTIONS'), 
    page: PAGES.PROMOTION_MANAGEMENT,
    menuEvent: () => { navigateToPage(PAGES.PROMOTION_MANAGEMENT); }
  },
  { 
    id: 5, 
    icon: <Star size={24} />, 
    name: get('MENU_REVIEWS'), 
    page: PAGES.REVIEW_MANAGEMENT,
    menuEvent: () => { navigateToPage(PAGES.REVIEW_MANAGEMENT); }
  },
   { 
    id: 6, 
    icon: <MessagesSquare size={24} />, 
    name: get('MENU_CHATTING'), 
    page: PAGES.CHATTING,
    menuEvent: () => { navigateToPageWithData(PAGES.CHATTINGLIST, { chatRoomType: 'manager' }); } 
  },
  // { 
  //   id: 6, 
  //   icon: <Headphones size={24} />, 
  //   name: 'Support', 
  //   page: PAGES.CUSTOMER_SUPPORT,
  //   menuEvent: () => { navigateToPage(PAGES.CUSTOMER_SUPPORT); }
  // },

  { 
    id: 7, 
    icon: <Bell size={24} />, 
    name: get('MENU_NOTIFICATIONS'), 
    page: PAGES.NOTIFICATION_CENTER,
    menuEvent: () => { navigateToPage(PAGES.NOTIFICATION_CENTER); }
  },
  { 
    id: 8, 
    icon: <Settings size={24} />, 
    name: get('MENU_SETTINGS'), 
    page: PAGES.MANAGER_SETTINGS,
    menuEvent: () => { navigateToPage(PAGES.MANAGER_SETTINGS); }
  }
  
  // { 
  //   id: 9, 
  //   icon: <MessagesSquare size={24} />, 
  //   name: 'Chatting', 
  //   page: PAGES.CHATTING,
  //   menuEvent: () => { navigateToPage(PAGES.CHATTINGLIST); }
  // }
];

  return (
    <>
    <style jsx="true">{` 
      .menu-item { 
        position: relative;
        padding: 0.75rem 1rem;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
        border: 1px solid #d1d5db;
        border-radius: 12px 10px 8px 14px;
        transform: rotate(0.4deg);
        transition: all 0.2s ease;
        cursor: pointer;
        box-sizing: border-box;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(0, 0, 0, 0.05);
        height: 60px; /* 고정 높이 설정 */
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      
      .menu-item-wrapper {
        flex: 1 1 45%;
        minWidth: 140px;
        height: 60px; /* wrapper도 같은 높이로 고정 */
      }
      
      .item-content {
        position: relative;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e8f9ff 100%);
        color: #1f2937;
        border: 1px solid #999999;
        box-shadow: 
          0 2px 4px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.8),
          inset 0 -1px 0 rgba(0, 0, 0, 0.05);
      }
      
      .menu-icon {
        margin-top: 3px;
      }
      
      /* 메뉴 텍스트가 두 줄일 때를 위한 스타일 */
      .menu-item .menu-text {
        font-size: 0.9rem;
        line-height: 1.2;
        text-align: center;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    `}</style>

    <div className="account-container">
    <SketchHeader 
        title={[<CocktailIcon key="icon" />, get('APP_TITLE')]}
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
              <div className="big-card" style={{padding: '0.9rem'}}>
                <div style={{ fontWeight: 600, fontSize: '0.98rem', marginBottom: 2 }}>{item.title}</div>
                <div style={{ color: '#555', fontSize: '0.92rem', lineHeight: 1.3 }}>{item.content}</div>
              </div>
            </SketchDiv>
          </div>
        ))}
      </div>
    
      <div className="menu-section" style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '0.3rem', 
        padding: '1rem 0.7rem 1.5rem',
        alignItems: 'stretch' 
      }}>
        {menus.map((menu) => (
          <div key={menu.id} className="menu-item-wrapper">
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
    </div>
    </>
  );
}