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

// Float Bottom Button 컴포넌트
const FloatBottomButton = React.memo(({ isVisible, onClick }) => {
  if (!isVisible) return null;
  
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: '180px', // 입력창 위에 오도록 조정
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: '#222',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        zIndex: 1000,
        transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
      }}
      onMouseEnter={e => {
        e.target.style.transform = 'translateX(-50%) scale(1.08)';
        e.target.style.backgroundColor = '#111';
      }}
      onMouseLeave={e => {
        e.target.style.transform = 'translateX(-50%) scale(1)';
        e.target.style.backgroundColor = '#222';
      }}
      aria-label="맨 아래로 이동"
    >
      ↓
    </button>
  );
});

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

  // otherProps의 핵심 값들을 메모이제이션
  const memoizedProps = useMemo(() => ({
    room_sn: otherProps?.room_sn || null,
    name: otherProps?.name || '',
    send_to: otherProps?.send_to || null,
    receiver_id: otherProps?.receiver_id || null,
  }), [otherProps?.room_sn, otherProps?.name, otherProps?.send_to, otherProps?.receiver_id]);

  const [room_sn, setRoomSn] = useState(null);
  const [showReservationCard, setShowReservationCard] = useState(false);
  const [reservationCardData, setReservationCardData] = useState(null);
  const [roomTitle, setRoomTitle] = useState('');
  const [sendTo, setSendTo] = useState(null);
  const [receiverId, setReceiverId] = useState(null);

  // Lazy Loading 관련 상태
  const [chat_messages, setChatMessages] = useState([]);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showFloatButton, setShowFloatButton] = useState(false);

  //번역
  const [translationMap, setTranslationMap] = useState({});
  const [showTranslateIcon, setShowTranslateIcon] = useState({});

  const handleLongPress = useCallback((chatSn) => {
    setShowTranslateIcon(prev => ({
      ...prev,
      [chatSn]: true,
    }));
  }, []);

  const handleTranslate = useCallback(async (chatSn, text) => {
    if (translationMap[chatSn]) return;

    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=AIzaSyAnvkb7_-zX-aI8WVw6zLMRn63yQQrss9c`,
        {
          q: text,
          target: user.language || 'vi',
          format: 'text',
        }
      );

      const translated = response.data.data.translations[0].translatedText;

      setTranslationMap(prev => ({
        ...prev,
        [chatSn]: translated,
      }));
    } catch (error) {
      console.error('번역 실패:', error);
      Swal.fire('번역 오류', 'Google Translate API 호출에 실패했습니다.', 'error');
    }
  }, [translationMap, user.language]);

  // ⭐ 인터벌 관리를 위한 ref 추가
  const intervalRef = useRef(null);
  const lastChatSnRef = useRef(null);
  const messageEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const firstLoadRef = useRef(true);
  const chatInputRef = useRef(null);
  const isScrollingRef = useRef(false); // 스크롤 중복 호출 방지 플래그
  const [modalImage, setModalImage] = useState(null);
  
  // room_sn 초기화
  useEffect(() => {
    console.log('chatRoom init!', memoizedProps);

    const roomSn = memoizedProps.room_sn;
    const roomName = memoizedProps.name;
    const sendToValue = memoizedProps.send_to;
    const receiverIdValue = memoizedProps.receiver_id;
    
    // 값이 실제로 변경되었을 때만 상태 업데이트
    if (roomSn !== room_sn) {
      setRoomSn(roomSn);
    }
    if (roomName !== roomTitle) {
      setRoomTitle(roomName);
    }
    if (sendToValue !== sendTo) {
      setSendTo(sendToValue);
    }
    if (receiverIdValue !== receiverId) {
      setReceiverId(receiverIdValue);
    }

    console.log('enter', sendToValue, receiverIdValue);
  }, [memoizedProps, room_sn, roomTitle, sendTo, receiverId]);

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
        getChattingData(false, false); // 새 메시지만 가져오기
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
        target_table: 'ManagerChat',
        target_id: roomSn,
        reader_type: 'manager',
        reader_id: user.manager_id
      });

      console.log('✅ registerReader 성공:', response);
      
    } catch (error) {
      console.error('❌ registerReader 실패:', error);
    }
  };

  // room_sn이 변경될 때마다 채팅 데이터 다시 불러오기
  useEffect(() => {
    console.log('🔄 Room SN changed to:', room_sn);
    
    // 기존 폴링 정지
    stopPolling();

    if (room_sn) {
      // room_sn이 새로 생성된 경우 상태 초기화
      if (lastChatSnRef.current === null) {
        console.log('🆕 New room created, resetting chat state');
        setChatMessages([]);
        setHasMoreOlder(true);
        setIsInitialLoad(true);
      }

      registerReader(room_sn);
      
      // 초기 채팅 데이터 로딩 (최신 10개)
      getChattingData(true, false).then(() => {
        // 데이터 로딩 완료 후 폴링 시작
        startPolling();
      });
    }

    // cleanup 함수에서 인터벌 정리
    return () => {
      stopPolling();
    };
  }, [room_sn, stopPolling, startPolling]);

  // 스크롤 위치 감지
  const isUserAtBottom = useCallback(() => {
    if (!chatBoxRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // 더 엄격한 기준: 10px 이내에 있을 때만 맨 아래로 간주
    const isAtBottom = distanceFromBottom < 10;
    console.log('📍 사용자 위치 확인:', {
      distanceFromBottom,
      isAtBottom
    });
    return isAtBottom;
  }, []);

  // 스크롤을 맨 밑으로 이동시키는 함수
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    console.log('🔄 scrollToBottom 호출됨:', behavior);
    
    // 이미 스크롤 중이면 중복 호출 방지
    if (isScrollingRef.current) {
      console.log('⏸️ 이미 스크롤 중이므로 호출 무시');
      return;
    }
    
    if (!chatBoxRef.current) {
      console.log('❌ chatBoxRef가 없음');
      return;
    }
    
    // 스크롤 시작 플래그 설정
    isScrollingRef.current = true;
    
    const scrollToBottomImmediate = () => {
      if (!chatBoxRef.current) return;
      
      const { scrollHeight, clientHeight } = chatBoxRef.current;
      const maxScrollTop = scrollHeight - clientHeight;
      
      console.log('📏 스크롤 계산:', {
        scrollHeight,
        clientHeight,
        maxScrollTop,
        currentScrollTop: chatBoxRef.current.scrollTop
      });
      
      if (behavior === 'auto') {
        chatBoxRef.current.scrollTop = maxScrollTop;
        console.log('⚡ 즉시 스크롤 이동 완료');
        // 즉시 스크롤 완료 시 플래그 해제 및 FloatButton 상태 업데이트
        setTimeout(() => {
          isScrollingRef.current = false;
          // 스크롤 완료 후 FloatButton 상태 강제 업데이트
          setShowFloatButton(false);
        }, 1);
      } else {
        chatBoxRef.current.scrollTo({
          top: maxScrollTop,
          behavior: 'smooth'
        });
        console.log('🔄 부드러운 스크롤 이동 시작');
        // 부드러운 스크롤 완료 후 플래그 해제 및 FloatButton 상태 업데이트
        setTimeout(() => {
          isScrollingRef.current = false;
          // 스크롤 완료 후 FloatButton 상태 강제 업데이트
          setShowFloatButton(false);
        }, 1);
      }
    };
    
    // messageEndRef 방식 제거하고 직접 스크롤만 사용
    setTimeout(scrollToBottomImmediate, 50);
  }, []);

  // 이전 메시지 로딩 함수
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlder || !hasMoreOlder || chat_messages.length === 0) {
      console.log('🚫 이전 메시지 로딩 차단:', { 
        isLoadingOlder, 
        hasMoreOlder, 
        messageCount: chat_messages.length 
      });
      return;
    }
    
    console.log('📚 이전 메시지 로딩 시작');
    setIsLoadingOlder(true);
    
    try {
      const oldestMessage = chat_messages[0];
      const params = {
        room_sn,
        limit: 10,
        direction: 'older',
        before_chat_sn: oldestMessage.chat_sn
      };

      const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
      const response = await axios.get(`${API_HOST}/api/getChattingData_v2`, { params });

      if (response.data && response.data.length > 0) {
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
            reservationData,
          };
        }));

        // 이전 메시지를 앞에 추가
        setChatMessages(prev => [...newMessages, ...prev]);
        
        // 스크롤 위치 유지
        setTimeout(() => {
          if (chatBoxRef.current && newMessages.length > 0) {
            const newMessageHeight = newMessages.length * 80; // 대략적인 메시지 높이
            chatBoxRef.current.scrollTop += newMessageHeight;
          }
        }, 100);
      } else {
        setHasMoreOlder(false);
      }
    } catch (error) {
      console.error('❌ 이전 메시지 로딩 실패:', error);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [room_sn, chat_messages, isLoadingOlder, hasMoreOlder, user.type]);

  // 스크롤 이벤트 핸들러 - 이전 메시지 로딩 + Float Button 제어
  const handleScroll = useCallback(() => {
    if (!chatBoxRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // 디버깅 로그 추가
    console.log('📜 스크롤 이벤트:', {
      scrollTop,
      scrollHeight,
      clientHeight,
      distanceFromBottom,
      showFloatButton: showFloatButton,
      isScrolling: isScrollingRef.current
    });
    
    // 스크롤 중일 때는 FloatButton 상태 변경하지 않음
    if (isScrollingRef.current) {
      console.log('⏸️ 스크롤 중이므로 FloatButton 상태 변경 무시');
      return;
    }
    
    // Float Button 표시/숨김 제어
    if (distanceFromBottom > 300) {
      console.log('🔘 Float Button 표시');
      setShowFloatButton(true);
    } else {
      console.log('🔘 Float Button 숨김');
      setShowFloatButton(false);
    }
    
    // 이전 메시지 로딩 (기존 로직)
    if (isLoadingOlder || !hasMoreOlder) return;
    
    // 스크롤이 맨 위에 가까우면 이전 메시지 로딩
    if (scrollTop < 100) {
      console.log('🔄 이전 메시지 로딩 시작');
      loadOlderMessages();
    }
  }, [isLoadingOlder, hasMoreOlder, loadOlderMessages, showFloatButton]);

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const chatBox = chatBoxRef.current;
    if (chatBox) {
      // console.log('📜 스크롤 이벤트 리스너 등록');
      chatBox.addEventListener('scroll', handleScroll);
      return () => {
        // console.log('📜 스크롤 이벤트 리스너 제거');
        chatBox.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

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

  // 예약 링크 템플릿 컴포넌트
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

  // ChatMessage 컴포넌트
  const ChatMessage = React.memo(({ msg, setModalImage }) => {
    const isMine = msg.sender === 'me';
    const isTranslated = translationMap[msg.chat_sn];
    const showIcon = showTranslateIcon[msg.chat_sn];

    const pressTimerRef = useRef(null);

    const handleMouseDown = () => {
      if (!isMine) {
        pressTimerRef.current = setTimeout(() => {
          handleLongPress(msg.chat_sn);
        }, 600);
      }
    };

    const handleMouseUp = () => {
      clearTimeout(pressTimerRef.current);
    };

    return (
      <div
        className={`chat-message-wrapper ${msg.sender}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {msg.link_type && msg.link_target ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            width: '100%',
            marginBottom: '1rem'
          }}>
            {getLinkTemplate(msg)}
          </div>
        ) : (
          <div className="chat-content-wrapper">
            <div className="chat-name">{msg.sender_name}</div>
            <div className={`chat-message ${msg.sender} ${msg.image ? 'has-image' : ''}`}>
              {msg.text && <div>{msg.text}</div>}
              {msg.image && (
                <img
                  src={msg.image}
                  className="chat-image"
                  onClick={() => setModalImage(msg.image)}
                />
              )}
              {isTranslated && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
                  {isTranslated} <span style={{ fontSize: 10, marginLeft: 4 }}>번역됨</span>
                </div>
              )}
              {showIcon && !isTranslated && msg.text && (
                <div style={{ textAlign: 'right', marginTop: 4 }}>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 11,
                      color: '#3b82f6',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    onClick={() => handleTranslate(msg.chat_sn, msg.text)}
                  >
                    번역
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="chat-time">{msg.time}</div>
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

  // 🎯 Lazy Loading을 위한 새로운 getChattingData 함수
  const getChattingData = useCallback(async (isInitial = false, loadOlder = false) => {
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
    
    try {
      const params = { 
        room_sn,
        limit: 10,
        direction: loadOlder ? 'older' : 'newer'
      };

      // 초기 로딩이거나 새 메시지 로딩
      if (!loadOlder) {
        if (lastChatSnRef.current) {
          params.chat_sn = lastChatSnRef.current;
        }
      } else {
        // 이전 메시지 로딩
        if (chat_messages.length > 0) {
          const oldestMessage = chat_messages[0];
          params.before_chat_sn = oldestMessage.chat_sn;
        }
      }


      const response = await axios.get(`${API_HOST}/api/getChattingData_v2`, {
        params
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
          reservationData,
        };
      }));

      if (isInitial) {
        // 초기 로딩: 최신 메시지 10개 (내림차순으로 정렬하여 최신이 맨 아래에 오도록)
        const sortedMessages = [...newMessages].sort((a, b) => b.chat_sn - a.chat_sn).reverse();
        console.log('🎯 초기 로딩 - 정렬된 메시지:', sortedMessages.map(m => ({ chat_sn: m.chat_sn, text: m.text })));
        setChatMessages(dedupeMessages(sortedMessages));
        if (sortedMessages.length > 0) {
          const lastMessage = sortedMessages[sortedMessages.length - 1];
          lastChatSnRef.current = lastMessage.chat_sn;
          setTimeout(() => {
            scrollToBottom('auto');
          }, 300);
        }
        setIsInitialLoad(false);
      } else if (loadOlder) {
        // 이전 메시지 로딩: 앞에 추가
        console.log('📚 이전 메시지 로딩:', newMessages.map(m => ({ chat_sn: m.chat_sn, text: m.text })));
        setChatMessages(prev => dedupeMessages([...newMessages, ...prev]));
      } else {
        // 새 메시지 로딩: 뒤에 추가
        const newChatMessages = newMessages.filter(msg => msg.chat_sn > lastChatSnRef.current);

        if (newChatMessages.length > 0) {

          console.log('🆕 새 메시지 로딩:', newChatMessages.map(m => ({ chat_sn: m.chat_sn, text: m.text })));
          setChatMessages(prev => dedupeMessages([...prev, ...newChatMessages]));
          const lastMessage = newChatMessages[newChatMessages.length - 1];
          
          // 자동 스크롤 조건 수정: 사용자가 맨 아래에 있을 때만 자동 스크롤
          const shouldScroll = lastMessage.sender_type === 'manager' || isUserAtBottom();
          console.log('🔄 자동 스크롤 조건:', {
            sender_type: lastMessage.sender_type,
            isUserAtBottom: isUserAtBottom(),
            shouldScroll
          });
          
          if (shouldScroll) {
            setTimeout(() => {
              scrollToBottom(lastMessage.sender_type === 'manager' ? 'auto' : 'smooth');
            }, 200);
          } else {
            console.log('⏸️ 사용자가 스크롤을 위로 올린 상태이므로 자동 스크롤하지 않음');
          }
          lastChatSnRef.current = lastMessage.chat_sn;
        }
      }
    } catch (error) {
      console.error('❌ 채팅 데이터 불러오기 실패:', error);
    }
  }, [room_sn, user.type, formatTime, scrollToBottom, isUserAtBottom, getReservationInfo, chat_messages]);

  // 최적화된 메시지 전송 핸들러
  const handleMessageSend = useCallback(async (message) => {
    const {type} = user;
    let login_id = (type=='staff') ? user.staff_id : user.manager_id;
    
    const chatData = {
      room_sn,
      chat_msg: message,
      sender: login_id,
      sender_type: user.type,
      content_id: 0,
      room_name: roomTitle || nickname,
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
    console.log('이미지 전송 ^_T', room_sn, content_id, sendTo, receiverId);

    const {type} = user;
    let login_id = (type=='staff') ? user.staff_id : user.manager_id;

    insertChattingData({
      room_sn,
      chat_msg: '',
      sender: login_id,
      sender_type: user.type,
      content_id: content_id,
      room_name: nickname,
      room_description: '',
      created_by: login_id,
      creator_type: user.type,
      last_message_preview: '사진',
      venue_id,
      send_to: sendTo,
      receiver_id: receiverId
    });

    setTimeout(() => {
      scrollToBottom('auto');
    }, 300);
  }, [room_sn, user_id, nickname, venue_id, insertChattingData, scrollToBottom, sendTo, receiverId]);

  const handleUploadError = useCallback((error) => {
    console.error('이미지 업로드 실패:', error);
    Swal.fire({
      title: get('IMAGE_UPLOAD_ERROR'),
      icon: 'error',
      confirmButtonText: get('SWAL_CONFIRM_BUTTON')
    });
  }, []);

  // 예약 관련 함수들
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
        return null;
      }
    }
  }, [initType, otherProps]);

  useEffect(() => {
    if (reservationCardData && sendTo && receiverId) {
      handleReservationSend();
    }
  }, [reservationCardData, sendTo, receiverId]);

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
      stopPolling();
      setShowReservationCard(false);
      setReservationCardData(null);

      const res = await ApiClient.post('/api/insertChattingData', chatData);
      
      console.log('sendChat response:', res);
      
      const {chat_sn, room_sn: newRoomSn} = res;
      
      if(chat_sn && newRoomSn){
        console.log('Updated lastChatSnRef to:', chat_sn);
        
        if (!room_sn || room_sn !== newRoomSn) {
          console.log('🆕 Room SN changed from', room_sn, 'to', newRoomSn);
          setRoomSn(newRoomSn);
        } else {
          await getChattingData(false, false);
        }
        startPolling();
      }
      
    } catch (error) {
      console.error('sendChat error:', error);
      startPolling();
    }
  }, [user, room_sn, nickname, venue_id, reservationCardData, stopPolling, getChattingData, startPolling]);

  const handleCloseReservationCard = useCallback(() => {
    setShowReservationCard(false);
    setReservationCardData(null);
  }, []);

  useEffect(() => {
    if (initType === 'booking' && !showReservationCard && !reservationCardData) {
      generateInitChatItem();
    }
  }, [initType]);

  return (
    <>
      <style jsx="true">{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 87vh;
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
        .chat-message.has-image {
          background-color: transparent !important;
          color: inherit !important;
          border-bottom-right-radius: 0 !important;
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
        .loading-indicator {
          text-align: center;
          padding: 1rem;
          color: #6b7280;
          font-size: 0.875rem;
        }
      `}</style>

      <div className="chat-container">
        <SketchHeader title={roomTitle} showBack={true} onBack={goBack} rightButtons={[]} />
        
        <div className="chat-messages" ref={chatBoxRef}>
          {/* 로딩 인디케이터 */}
          {isLoadingOlder && (
            <div className="loading-indicator">
              이전 메시지를 불러오는 중...
            </div>
          )}
          
          {chat_messages.map((msg) => (
            <ChatMessage key={msg.chat_sn} msg={msg} setModalImage={setModalImage} />
          ))}
          <div ref={messageEndRef} style={{ height: '1px', minHeight: '1px' }} />
          
          {/* Float Bottom Button */}
          <FloatBottomButton 
            isVisible={showFloatButton}
            onClick={() => {
              // 스크롤 중일 때는 클릭 무시
              if (isScrollingRef.current) {
                console.log('⏸️ 스크롤 중이므로 FloatBottomButton 클릭 무시');
                return;
              }
              console.log('🔘 FloatBottomButton 클릭됨');
              scrollToBottom('smooth');
            }}
          />
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