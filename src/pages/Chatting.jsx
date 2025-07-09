import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import SketchHeader from '@components/SketchHeader';
import { ImageUploader } from '@components/ImageUploader';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '../contexts/AuthContext';
import '@components/SketchComponents.css';
import ApiClient from '@utils/ApiClient';
import axios from 'axios';
import Swal from 'sweetalert2';

// 예약 요약 카드 컴포넌트
const ReservationCard = ({ data, onSend, onClose }) => (
  <div style={{
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px',
    margin: '8px 0',
    maxWidth: '320px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    position: 'relative',
    left: '50%',
    transform: 'translateX(-50%)',
  }}>
    <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 16, color: '#9ca3af', cursor: 'pointer' }}>×</button>
    <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6, paddingRight: 20 }}>예약자: {data.target_name}</div>
    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>예약일시: {data.reserved_at} {data.res_start_time} - {data.res_end_time}</div>
    {data.note && <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, fontStyle: 'italic' }}>메모: {data.note.length > 30 ? `${data.note.substring(0, 30)}...` : data.note}</div>}
    <button onClick={onSend} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500, marginRight: 8 }}>전송</button>
    <button onClick={() => { /* 상세보기 오버레이 */ }} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>상세보기</button>
  </div>
);

// 최적화된 입력 컴포넌트
const ChatInput = React.memo(({ onSend, placeholder, onKeyDown, onRef }) => {
  const inputRef = useRef(null);
  
  const handleSend = useCallback(() => {
    const inputValue = inputRef.current?.value?.trim();
    if (!inputValue) return;
    onSend(inputValue);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onSend]);
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
    onKeyDown?.(e);
  }, [handleSend, onKeyDown]);
  
  // ref를 부모 컴포넌트에 전달
  useEffect(() => {
    if (onRef) {
      onRef({ handleSend, inputRef });
    }
  }, [onRef, handleSend]);
  
  return (
    <input
      ref={inputRef}
      className="chat-input"
      type="text"
      placeholder={placeholder}
      onKeyDown={handleKeyDown}
      style={{ width: '20px' }}
    />
  );
});

const Chatting = ({ navigateToPageWithData, PAGES, goBack, ...otherProps }) => {
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const { user } = useAuth();
  const user_id = user?.user_id;
  const nickname = user?.name;
  const venue_id = user?.venue_id;

  const { initType = 'chat' } = otherProps;

  const [room_sn, setRoomSn] = useState(null);
  const [showReservationCard, setShowReservationCard] = useState(false);
  const [reservationCardData, setReservationCardData] = useState(null);
  const [roomTitle, setRoomTitle] = useState('');
  const [sendTo, setSendTo] = useState(null);
  const [receiverId, setReceiverId] = useState(null);

  // ⭐ 인터벌 관리를 위한 ref 추가
  const intervalRef = useRef(null);

  // room_sn 초기화
  useEffect(() => {

    console.log('chatRoom init!', otherProps);

    const roomSn = otherProps?.room_sn || null;
    setRoomSn(roomSn);
    setRoomTitle(otherProps?.name || '');
    setSendTo(otherProps?.send_to || null);
    setReceiverId(otherProps?.receiver_id || null);
    setRoomTitle(otherProps?.name || '');

    console.log('enter', sendTo, receiverId);
  }, [otherProps]);

  // ⭐ 인터벌을 시작하는 함수
  const startPolling = useCallback(() => {
    // 기존 인터벌이 있다면 먼저 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 새 인터벌 시작
    intervalRef.current = setInterval(() => {
      if (room_sn) {
        getChattingData(false);
      }
    }, 500);

    console.log('✅ Polling started:', intervalRef.current);
  }, [room_sn]);

  // ⭐ 인터벌을 정지하는 함수
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('🛑 Polling stopped');
    }
  }, []);

  const registerReader = async (roomSn) => {
  try {
    if (!user?.manager_id) {
      console.warn('Manager ID가 없어서 registerReader를 건너뜁니다.');
      return;
    }

    const response = await ApiClient.postForm('/api/registerReader', {
      target_table: 'ManagerChat',  // 예약 테이블
      target_id: roomSn,    // roomID
      reader_type: 'manager',        // 리더 타입
      reader_id: user.manager_id     // 리더 ID (매니저 ID와 동일)
    });

    console.log('✅ registerReader 성공:', response);
    
  } catch (error) {
    console.error('❌ registerReader 실패:', error);
    // 에러가 발생해도 페이지 로딩을 막지 않음
  }
};

  // room_sn이 변경될 때마다 채팅 데이터 다시 불러오기
 useEffect(() => {
  console.log('🔄 Room SN changed to:', room_sn);
  
  // 기존 폴링 정지
  stopPolling();

  if (room_sn) {
    // room_sn이 새로 생성된 경우 lastChatSnRef 초기화
    if (lastChatSnRef.current === null) {
      console.log('🆕 New room created, resetting chat state');
      setChatMessages([]); // 기존 메시지 초기화
    }

     registerReader(room_sn);
    
    // 채팅 데이터 새로 불러오기 (init=false로 변경)
    getChattingData(false).then(() => {
      // 데이터 로딩 완료 후 폴링 시작
      startPolling();
    });
  }

  // cleanup 함수에서 인터벌 정리
  return () => {
    stopPolling();
  };
}, [room_sn, stopPolling, startPolling]);

  const generateInitChatItem = useCallback(() => {
    switch(initType){
      case 'booking':{
        const { reservation_id, client_name, res_start_time, res_end_time, note, reserved_at } = otherProps;
        const formatDate = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          return `${year}.${month}.${day}`;
        };
        const formatTime = (timeString) => {
          if (!timeString) return '';
          return timeString.slice(0, 5);
        };

        const endTime = new Date(`2000-01-01T${res_end_time}`);
        endTime.setHours(endTime.getHours() + 1);
        const adjustedEndTime = endTime.toTimeString().slice(0, 5);

        setReservationCardData({
          reservation_id,
          target_name: client_name,
          reserved_at: formatDate(reserved_at),
          res_start_time: formatTime(res_start_time),
          res_end_time: adjustedEndTime,
          note: note || ''
        });

        // 바로 send
        // handleReservationSend();



        // setShowReservationCard(true);
        return null;
      }
    }
  }, [initType, otherProps]);

  useEffect(() => {
    if (reservationCardData && sendTo && receiverId) {
      // 모든 필요한 데이터가 준비되었을 때만 전송
      handleReservationSend();
    }
  }, [reservationCardData, sendTo, receiverId]);


  const [chat_messages, setChatMessages] = useState([]);
  const [modalImage, setModalImage] = useState(null);

  const lastChatSnRef = useRef(null);
  const messageEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const firstLoadRef = useRef(true);
  const chatInputRef = useRef(null);

  useEffect(() => {
      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }
    }, [messages, currentLang]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // room_sn이 있을 때만 초기 데이터 로드
    if (room_sn) {
      getChattingData(false).then(() => {
        startPolling();
      });
    }

    // cleanup에서 인터벌 정리
    return () => {
      stopPolling();
    };
  }, []); // room_sn 의존성 제거 (별도 useEffect에서 처리)

  const isUserAtBottom = useCallback(() => {
    if (!chatBoxRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    console.log('Distance from bottom:', distanceFromBottom);
    return distanceFromBottom < 50;
  }, []);

  // 🎯 스크롤을 맨 밑으로 이동시키는 함수
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    console.log('scrollToBottom', behavior);
    
    if (!chatBoxRef.current) return;
    
    // DOM 업데이트를 기다린 후 스크롤 실행
    const scrollToBottomImmediate = () => {
      if (!chatBoxRef.current) return;
      
      const { scrollHeight, clientHeight } = chatBoxRef.current;
      const maxScrollTop = scrollHeight - clientHeight;
      
      console.log('Scroll info:', { scrollHeight, clientHeight, maxScrollTop });
      
      if (behavior === 'auto') {
        // 즉시 스크롤
        chatBoxRef.current.scrollTop = maxScrollTop;
      } else {
        // 부드러운 스크롤
        chatBoxRef.current.scrollTo({
          top: maxScrollTop,
          behavior: 'smooth'
        });
      }
    };
    
    // DOM 업데이트를 기다린 후 실행
    setTimeout(scrollToBottomImmediate, 50);
    
    // 추가로 messageEndRef도 사용 (백업)
    setTimeout(() => {
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ 
          behavior, 
          block: 'end',
          inline: 'nearest'
        });
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
    } else if (isUserAtBottom()) {
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [chat_messages, isUserAtBottom]);

  const formatTime = useCallback((date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }, []);

  // 예약 정보 캐시
  const reservationCache = {};

  // 예약 정보를 가져오는 함수 (캐싱 적용)
  const getReservationInfo = useCallback(async (reservationId) => {
    if (reservationCache[reservationId]) {
      return reservationCache[reservationId];
    }
    try {
      const res = await ApiClient.get('/api/getReservationList_mng', {
        params: { venue_id: venue_id }
      });
      if(res && res.length > 0){
        let reservation = res.find(item => item.reservation_id === parseInt(reservationId));
        if(reservation){
          reservation.res_start_time = reservation.res_start_time.slice(0, 5);
          const endTime = new Date(`2000-01-01T${reservation.res_end_time}`);
          endTime.setHours(endTime.getHours() + 1);
          reservation.res_end_time = endTime.toTimeString().slice(0, 5);
          reservation.target_name = reservation.client_name;
          reservationCache[reservationId] = reservation;
          return reservation;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }, [venue_id]);

  // 예약 링크 템플릿 컴포넌트 (비동기 로딩 제거)
  const ReservationLinkTemplate = React.memo(({ reservationData, reservationId }) => {
    if (!reservationData) {
      return (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px',
          margin: '8px 0',
          maxWidth: '320px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center',
          color: '#dc2626'
        }}>
          예약 정보를 불러올 수 없습니다.
        </div>
      );
    }
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}.${month}.${day}`;
    };
    const formatTime = (timeString) => {
      if (!timeString) return '';
      return timeString.slice(0, 5);
    };
    return (
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        width: '100%',
        padding: '12px',
        margin: '8px 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'relative',
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '6px'
        }}>
          <span style={{
            background: '#10b981',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            예약 정보
          </span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
          예약자: {reservationData.target_name || 'N/A'}
        </div>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
          예약일시: {formatDate(reservationData.reserved_at)} {formatTime(reservationData.res_start_time)} - {formatTime(reservationData.res_end_time)}
        </div>
        {reservationData.note && (
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, fontStyle: 'italic' }}>
            메모: {reservationData.note.length > 30 ? `${reservationData.note.substring(0, 30)}...` : reservationData.note}
          </div>
        )}
        <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
          예약 ID: {reservationId}
        </div>
      </div>
    );
  });

  // getLinkTemplate 수정
  const getLinkTemplate = useCallback((msg) => {
    switch(msg.link_type){
      case 'reservation':{
        return <ReservationLinkTemplate reservationData={msg.reservationData} reservationId={msg.link_target} />;
      } 
      default:
        return null;
    }
  }, []);

  // ChatMessage에서 예약 데이터 바로 전달
  const ChatMessage = React.memo(({ msg, setModalImage }) => {
    if (msg.link_type && msg.link_target && msg.reservationData) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <ReservationLinkTemplate reservationData={msg.reservationData} reservationId={msg.link_target} />
        </div>
      );
    }
    return (
      <div className={`chat-message-wrapper ${msg.sender}`}>
        {msg.sender === 'me' ? (
          <>
            <div className="chat-content-wrapper">
              <div className="chat-name">{msg.sender_name}</div>
              <div className={`chat-message ${msg.sender}`}>
                {msg.text && <div>{msg.text}</div>}
                {msg.image && (
                  <img
                    src={msg.image}
                    className="chat-image"
                    onClick={() => setModalImage(msg.image)}
                  />
                )}
              </div>
            </div>
            <div className="chat-time">{msg.time}</div>
          </>
        ) : (
          <>
            <div className="chat-content-wrapper">
              <div className="chat-name">{msg.sender_name}</div>
              <div className={`chat-message ${msg.sender}`}>
                {msg.text && <div>{msg.text}</div>}
                {msg.image && (
                  <img
                    src={msg.image}
                    className="chat-image"
                    onClick={() => setModalImage(msg.image)}
                  />
                )}
              </div>
            </div>
            <div className="chat-time">{msg.time}</div>
          </>
        )}
      </div>
    );
  });

  // 중복 제거 유틸
  function dedupeMessages(messages) {
    const seen = new Set();
    return messages.filter(msg => {
      if (seen.has(msg.chat_sn)) return false;
      seen.add(msg.chat_sn);
      return true;
    });
  }

  const getChattingData = useCallback(async (init = false) => {
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
    try {
      const response = await axios.get(`${API_HOST}/api/getChattingData`, {
        params: { 
          room_sn,
          chat_sn: lastChatSnRef.current || null
        },
      });

      // 예약 정보 미리 포함
      const newMessages = await Promise.all(response.data.map(async (item, index) => {
        let reservationData = null;
        if (item.link_type === 'reservation' && item.link_target) {
          reservationData = await getReservationInfo(item.link_target);
        }
        return {
          id: index + 1,
          sender: item.sender_type === user.type ? 'me' : 'other',
          text: item.chat_msg || '',
          image: item.image_url || null,
          chat_sn: item.chat_sn,
          sender_type: item.sender_type,
          time: formatTime(new Date(item.send_dt)),
          link_type: item.link_type,
          link_target: item.link_target,
          sender_name: item.sender_name,
          reservationData, // 추가
        };
      }));

      if (lastChatSnRef.current === null) {
        // 오래된 메시지가 먼저 오도록 정렬
        const sortedMessages = [...newMessages].sort((a, b) => a.chat_sn - b.chat_sn);
        setChatMessages(dedupeMessages(sortedMessages));
        if (sortedMessages.length > 0) {
          const lastMessage = sortedMessages[sortedMessages.length - 1];
          lastChatSnRef.current = lastMessage.chat_sn;
          setTimeout(() => {
            scrollToBottom('auto');
          }, 300);
        }
      } else {
        const newChatMessages = newMessages.filter(msg => msg.chat_sn > lastChatSnRef.current);
        if (newChatMessages.length > 0) {
          setChatMessages(prev => dedupeMessages([...prev, ...newChatMessages]));
          const lastMessage = newChatMessages[newChatMessages.length - 1];
          const shouldScroll = lastMessage.sender_type === 'manager' || isUserAtBottom();
          if (shouldScroll) {
            setTimeout(() => {
              scrollToBottom(lastMessage.sender_type === 'manager' ? 'auto' : 'smooth');
            }, 200);
          }
          lastChatSnRef.current = lastMessage.chat_sn;
        }
      }
    } catch (error) {
      console.error('❌ 채팅 데이터 불러오기 실패:', error);
    }
  }, [room_sn, user.type, formatTime, scrollToBottom, isUserAtBottom, getReservationInfo]);

  // ⭐ 최적화된 메시지 전송 핸들러
  const handleMessageSend = useCallback(async (message) => {

     const senderType = chat_messages.length > 0 ? chat_messages[0].sender_type : user.type;
    

     const {type} = user;
    let login_id = (type=='staff') ? user.staff_id : user.manager_id;
    
     const chatData = {
      room_sn,
      chat_msg: message,
      sender: login_id,
      sender_type: user.type,
      content_id: 0,
      room_name: roomTitle ||nickname,
      room_description: '',
      created_by: login_id,
      creator_type: user.type,
      last_message_preview: message,
      venue_id,
      send_to: sendTo,
      receiver_id: receiverId
    };

    setTimeout(() => {
      scrollToBottom('auto');
    }, 150);

    await insertChattingData(chatData);
  }, [room_sn, user_id, user.type, nickname, venue_id, scrollToBottom, sendTo, receiverId, roomTitle]);

  const insertChattingData = useCallback(async (params) => {
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
    try {
      const response = await axios.post(`${API_HOST}/api/insertChattingData`, params);
      console.log('✅ 채팅 서버 응답:', response.data);

      const {chat_sn, room_sn, room_mode} = response.data;
      if(chat_sn && room_sn){
        setRoomSn(room_sn);
      }



    } catch (error) {
      console.error('❌ 채팅 전송 실패:', error);
    }
  }, []);

  const handleUploadComplete = useCallback((content_id, file) => {
    console.log('이미지 전송 ^_T', content_id);

    insertChattingData({
      room_sn,
      chat_msg: '',
      sender: user_id,
      sender_type: 'manager',
      content_id: content_id,
      room_name: nickname,
      room_description: '',
      created_by: user_id,
      creator_type: 'manager',
      last_message_preview: '사진',
      venue_id,
    });

    setTimeout(() => {
      scrollToBottom('auto');
    }, 300);
  }, [room_sn, user_id, nickname, venue_id, insertChattingData, scrollToBottom]);

  const handleUploadError = useCallback((error) => {
    console.error('이미지 업로드 실패:', error);
    //alert('이미지 업로드에 실패했습니다.');

    Swal.fire({
              title: get('IMAGE_UPLOAD_ERROR'),
              icon: 'error',
              confirmButtonText: get('SWAL_CONFIRM_BUTTON')
            });

  }, []);

  // console.log("user.type", user)


  //번역
  const translateText = async (text, targetLang) => {
  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=AIzaSyAnvkb7_-zX-aI8WVw6zLMRn63yQQrss9c`,
      {
        q: text,
        target: targetLang,
        format: 'text',
      }
    );
    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('❌ 번역 실패:', error);
    return null;
  }
};



  // ⭐ ReservationCard onSend 함수 - 정리된 버전
  const handleReservationSend = useCallback(async (params) => {

    console.log('reservationCardData send!', reservationCardData, params);

    const {type} = user;
    let login_id = (type=='staff') ? user.staff_id : user.manager_id;

   
    const chatData = {
      room_sn: room_sn || 0,
      chat_msg: '',
      sender: login_id,
      sender_type: user.type,
      content_id: 0,
      room_name: nickname,
      room_description: '',
      created_by: login_id,
      creator_type: user.type,
      last_message_preview: '예약 정보',
      venue_id,
      link_type: 'reservation',
      link_target: reservationCardData?.reservation_id || params.reservation_id,
      send_to: sendTo,
      receiver_id: receiverId
    };

    console.log('Sending chatData:', chatData);

    try {
      // 기존 폴링 먼저 정지
      stopPolling();
      
      // ⭐ 먼저 예약 카드를 숨김 (전송 즉시)
      setShowReservationCard(false);
      setReservationCardData(null);

      //const res = await ApiClient.postForm('/api/sendChat', chatData);
      const res = await ApiClient.post('/api/insertChattingData', chatData);
      
      console.log('sendChat response:', res);
      
      const {chat_sn, room_sn: newRoomSn} = res;
      
      if(chat_sn && newRoomSn){
        console.log('Updated lastChatSnRef to:', chat_sn);
        
        // room_sn이 새로 생성되거나 변경된 경우
        if (!room_sn || room_sn !== newRoomSn) {
          console.log('🆕 Room SN changed from', room_sn, 'to', newRoomSn);
          
          // ⭐ 상태 업데이트 - 이것이 useEffect[room_sn]를 트리거함
          setRoomSn(newRoomSn);
          
        } else {
          // room_sn이 동일한 경우에도 새 메시지를 위해 갱신 후 폴링 재시작
          await getChattingData(false);
        }
        startPolling();
      }
      
    } catch (error) {
      console.error('sendChat error:', error);
      // 에러 발생 시에도 폴링 재시작
      startPolling();
      
      // ⭐ 에러 발생 시 예약 카드 다시 표시할지 결정
      // setShowReservationCard(true); // 필요시 주석 해제
    }
  }, [user, room_sn, nickname, venue_id, reservationCardData, stopPolling, getChattingData, startPolling]);

  const handleCloseReservationCard = useCallback(() => {
    setShowReservationCard(false);
    setReservationCardData(null);
  }, []);

  // 초기 로드 시에만 예약 카드 생성하도록 별도 useEffect 추가
  useEffect(() => {
    if (initType === 'booking' && !showReservationCard && !reservationCardData) {
      generateInitChatItem();
    }
  }, [initType]); // 한 번만 실행되도록 의존성 최소화

  return (
    <>
      <style jsx="true">{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 85vh;
          background-color: #f2f2f2;
        }
        .chat-messages {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          scroll-behavior: smooth;
        }
        .chat-message-wrapper {
            display: flex;
            align-items: flex-end;
            margin-bottom: 1rem;
          }

          .chat-message-wrapper.me {
            justify-content: flex-end;
          }

          .chat-message-wrapper.other {
            justify-content: flex-start;
          }

          .chat-content-wrapper {
            display: flex;
            flex-direction: column;
            max-width: 70%;
          }

          .chat-name {
            font-size: 0.75rem;
            color: #6b7280;
            margin-bottom: 0.25rem;
            padding: 0 0.5rem;
          }

          .chat-message-wrapper.me .chat-name {
              text-align: right;
            }

            .chat-message-wrapper.other .chat-name {
              text-align: left;
            }
              
        .chat-time {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0 0.4rem;
          white-space: nowrap;
          align-self: flex-end;
        }

        .chat-message {
          padding: 0.75rem 0.5rem;
          border-radius: 1rem;
          word-break: break-word;
        }

        .chat-message div, .chat-message.me {text-align: center}

        .chat-message.me {
          background-color: #10b981;
          color: white;
          border-bottom-right-radius: 0;
        }

        .chat-message.other {
          background-color: #e5e7eb;
          color: #111827;
          border-bottom-left-radius: 0;
        }
        .chat-image {
          max-width: 200px;
          max-height: 200px;
          border-radius: 1rem;
          cursor: pointer;
        }
        .chat-input-wrapper {
           display: flex;
           align-items: center;
           padding: 0.75rem;
           background-color: white;
           padding-bottom: 1.2rem;
        }
        .chat-input {
          flex: 1;
          padding: 0.5rem 1rem;
          border: 1px solid #ccc;
          border-radius: 1.5rem;
          margin: 0 0.5rem;
          font-size: 1rem;
        }
        .send-button {
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 1.5rem;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-weight: bold;
        }
        .image-button {
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
        }
        .image-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .image-modal img {
          max-width: 90%;
          max-height: 90%;
          border-radius: 1rem;
        }
        .image-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          color: white;
          font-size: 2rem;
          cursor: pointer;
        }
      `}</style>

      <div className="chat-container">
        {/*<SketchHeader title={get('CHAT_ONE_ON_ONE_TITLE')} showBack={true} onBack={goBack} rightButtons={[]} />*/}
        <SketchHeader title={roomTitle} showBack={true} onBack={goBack} rightButtons={[]} />
        <div className="chat-messages" ref={chatBoxRef}>
          {chat_messages.map((msg) => (
            <ChatMessage key={msg.chat_sn} msg={msg} setModalImage={setModalImage} />
          ))}
          <div ref={messageEndRef} style={{ height: '1px', minHeight: '1px' }} />
        </div>

        {/* 예약 카드 표시 */}
        {showReservationCard && reservationCardData && (
          <ReservationCard
            data={reservationCardData}
            onSend={handleReservationSend}
            onClose={handleCloseReservationCard}
          />
        )}

        <div className="chat-input-wrapper">
          <ImageUploader 
            apiClient={ApiClient}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            showContextMenu={false}
            showPreview={false}
            className="chat-image-uploader"
          />
          {/* ⭐ 최적화된 입력 컴포넌트 - 재렌더링 방지 */}
          <ChatInput 
            onSend={handleMessageSend}
            placeholder={get('CHAT_INPUT_PLACEHOLDER')}
            onRef={(refData) => {
              chatInputRef.current = refData;
            }}
          />
          <button className="send-button" onClick={() => {
            if (chatInputRef.current?.handleSend) {
              chatInputRef.current.handleSend();
            }
          }}>
            {get('CHAT_SEND_BUTTON')}
          </button>
        </div>
      </div>

      {modalImage && (
        <div className="image-modal" onClick={() => setModalImage(null)}>
          <span className="image-modal-close">&times;</span>
          <img src={modalImage} alt="확대 이미지" />
        </div>
      )}
    </>
  );
};

export default Chatting;