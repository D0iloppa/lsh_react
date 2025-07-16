import React, { useEffect, useState, useRef } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import SwipeableCard from '@components/SwipeableCard';
import '@components/SketchComponents.css';
import '@components/SwipeableCard.css';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';
import axios from 'axios';
import { Calendar, Users, ClipboardList, Tag, Star, Headphones, Bell, Settings, MessagesSquare } from 'lucide-react';
import Swal from 'sweetalert2';

import ApiClient from '@utils/ApiClient';

const ChattingList = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {

  const [staffs, setStaffs] = useState([]);
  const { user } = useAuth();
  const intervalRef = useRef(null);
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const [roomType, setRoomType] = useState('');

    useEffect(() => {
      const { chatRoomType = 'manager' } = otherProps;

      
      setRoomType(chatRoomType);
    }, [otherProps]); // 의존성 배열로 제어


  useEffect(() => {
      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }
    }, [messages, currentLang]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user?.venue_id && roomType) {
      fetchAndUpdate(user.venue_id); // 최초 데이터
      startInterval(user.venue_id);  // 주기적 갱신
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current); // 언마운트 시 정리
    };
  }, [user, roomType]); // roomType 의존성 추가

  const startInterval = (venue_id) => {
    intervalRef.current = setInterval(() => {
      fetchAndUpdate(venue_id);
    }, 500); // 0.5초마다 갱신
  };

  const fetchAndUpdate = async (venue_id) => {
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';

    let params = { account_type : roomType };

    switch(roomType){
      case 'manager':
        params.venue_id = venue_id;
        params.manager_id = user.manager_id;
        params.account_type = 'manager';
        params.account_id = user.manager_id;
        break;
      case 'staff':
        params.staff_id = user.staff_id;
        params.account_type = 'staff';
        params.account_id = user.staff_id;
        break;
    }

    try {
      const response = await axios.get(`${API_HOST}/api/getChattingList`, {
        params: params
      });
      const data = response.data || [];


      const mappedStaffs = data.map((item, index) => ({
        
        id: item.user_id || index,
        creator_type: item.participant_type || item.creator_type,
        account_status: item.account_status,
        room_sn: item.room_sn,
        name: item.room_name || '이름 없음',
        lastMessage: item.last_message_preview || '메시지 없음',
        lastTime: item.last_message_at
          ? new Date(item.last_message_at).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          : '--:--',
        isNew: item.not_read_cnt || 0,
        img: item.image_url || '',
      }));

      // 기존 데이터와 비교해 다를 때만 setState
     setStaffs(mappedStaffs);
     
    } catch (error) {
      console.error('❌ 채팅 리스트 불러오기 실패:', error);
    }
  };

  const handleClickStaff = (staff) => {
        if(staff.account_status == 'deleted'){
          Swal.fire({
            title: '탈퇴한 사용자입니다',
            text: '탈퇴한 사용자는 채팅을 할 수 없습니다.',
            icon: 'warning',
            confirmButtonText: get('BUTTON_CONFIRM')
          });
          return;

        }else {
        navigateToPageWithData(PAGES.CHATTING, {
              room_sn: staff.room_sn,
              name: staff.name,
            });
        }

    
  };

  // 삭제 핸들러 추가
  const handleDeleteStaff = async (chatRoom) => {
    console.log('Delete staff:', chatRoom);
    /*
    Swal.fire({
      title: '삭제할 채팅방 정보',
      html: `
        <div style="text-align: left;">
          <p><strong>ID:</strong> ${chatRoom.id}</p>
          <p><strong>이름:</strong> ${chatRoom.name}</p>
          <p><strong>방 번호:</strong> ${chatRoom.room_sn}</p>
          <p><strong>타입:</strong> ${chatRoom.creator_type}</p>
          <p><strong>마지막 메시지:</strong> ${chatRoom.lastMessage}</p>
          <p><strong>마지막 시간:</strong> ${chatRoom.lastTime}</p>
          <p><strong>새 메시지 수:</strong> ${chatRoom.isNew}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '확인'
    })
      */
    /*
    Swal.fire({
      title: '삭제할 채팅방 정보',
      text: JSON.stringify({
        room_sn: chatRoom.room_sn,
        account_id: (user.type == 'manager') ? user.manager_id : user.staff_id,
        account_type: user.type
      })
    })
    */

    ApiClient.postForm('/api/deleteChatRoom', {
      room_sn: chatRoom.room_sn,
      account_id: (user.type == 'manager') ? user.manager_id : user.staff_id,
      account_type: user.type
    });

    /*
    // API 호출로 채팅방 삭제
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
    try {
      await axios.delete(`${API_HOST}/api/deleteChatRoom`, {
        data: { 
          room_sn: staffId,
          venue_id: user?.venue_id 
        }
      });
      
      // 성공 시 리스트에서 제거
      setStaffs(prev => prev.filter(staff => staff.id !== staffId));
      
    } catch (error) {
      console.error('❌ 채팅방 삭제 실패:', error);
      // 에러 처리 (SweetAlert 등)
    }
      */
  };

        

  return (
    <>
      <style jsx="true">{`
        .staff-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .staff-list {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          padding: 1rem;
        }
        .staff-card {
          position: relative;
          background: #fff;
          padding: 0.7rem 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: background 0.2s;
        }
        .staff-card:hover {
          background: #f9f9f9;
        }
        .staff-img {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          background: #f3f4f6;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: #bbb;
          flex-shrink: 0;
        }
        .staff-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .staff-info {
          flex: 1;
        }
        .staff-name {
          font-size: 1.02rem;
          font-weight: 600;
          margin-bottom: 0.2rem;
          margin-right: -10px;
        }
        .staff-rating {
          font-size: 0.9rem;
          color: #555;
        }
        .staff-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          gap: 0.4rem;
          min-width: 50px;
        }
        .last-time {
          font-size: 0.75rem;
          color: #999;
        }
        .new-badge {
          background-color: red;
          color: white;
          font-size: 0.72rem;
          font-weight: bold;
          width: 1.4rem;
          height: 1.4rem;
          line-height: 1.4rem;
          border-radius: 50%;
          text-align: center;
        }

        .roomType {
          font-size: 0.9rem;
          font-weight: normal;
          background: #dbf6f4;
          padding: 1px 3px;
          border-radius: 5px;
        }
          .account-status {
            color: rgb(87 87 87);
            background: #ffe8e8;
            font-size: 0.8rem;
            margin-left: 5px;
            background: #e2e2e2;
            font-weight: normal;
            border-radius: 10px;
            padding: 3px;}
      `}</style>

      <div className="staff-container">
        <SketchHeader 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessagesSquare size={16} />
              <span>{get('CHATTING_LIST_TITLE')}</span>
            </div>
          }
          showBack={true} 
          onBack={goBack} 
        />


        <div className="staff-list">
          {staffs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
              {get('CHAT_NO_HISTORY')}
            </div>
          ) : (
            staffs.map((staff) => (
              <SwipeableCard
                key={staff.id}
                data={staff}
                onDelete={(data) => handleDeleteStaff(data)}
                onCardClick={() => handleClickStaff(staff)}
                confirmDelete={true}
              >
                <SketchDiv className="staff-card">
                  <HatchPattern opacity={0.4} />
                  <div className="staff-img">
                    {staff.img ? (
                      <img src={staff.img} alt={staff.name} />
                    ) : (
                      <span>🖼️</span>
                    )}
                  </div>
                  <div className="staff-info">
                    <div className="staff-name">
                      {staff.name} <span className='roomType'>{staff.creator_type}</span> 
                      <span className='account-status' style={{ color: staff.account_status == 'deleted' ? '#ca1212' : '#555', fontSize: '0.8rem', marginLeft: '5px' }}>
                        {staff.account_status == 'deleted' ? '탈퇴한 사용자' : staff.account_status}
                      </span>
                    </div>
                    <div className="staff-rating">{staff.lastMessage}</div>
                  </div>
                  <div className="staff-actions">
                    <div className="last-time">{staff.lastTime}</div>
                    {staff.isNew > 0 && (
                      <div className="new-badge">{staff.isNew}</div>
                    )}
                  </div>
                </SketchDiv>
              </SwipeableCard>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ChattingList;
