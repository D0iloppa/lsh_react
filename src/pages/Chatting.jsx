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
const ReservationCard = React.memo(({ data, onSend, onClose }) => (
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
));

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
        bottom: '180px',
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
const ChatInput = React.memo(({ onSend, placeholder, onKeyDown, onRef, onFocus }) => {
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
      onFocus={onFocus}   // ✅ props에서 받아서 적용
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
    console.log('🔤 Long Press 감지됨:', chatSn);
    setShowTranslateIcon(prev => ({
      ...prev,
      [chatSn]: true,
    }));
  }, []);

  const handleTranslate = useCallback(async (chatSn, text) => {
    console.log('🔤 번역 요청:', { chatSn, text });
    
    if (translationMap[chatSn]) {
      console.log('🔤 이미 번역된 메시지:', chatSn);
      return;
    }

    try {
      console.log('🔤 Google Translate API 호출 시작');

      let language=user.language;
    if ( language == 'kr') language='ko';
    if ( language == 'cn') language='zh';
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=AIzaSyAnvkb7_-zX-aI8WVw6zLMRn63yQQrss9c`,
        {
          q: text,
          target: language || 'ko',
          format: 'text',
        }
      );

      const translated = response.data.data.translations[0].translatedText;
      console.log('🔤 번역 완료:', translated);

      setTranslationMap(prev => ({
        ...prev,
        [chatSn]: translated,
      }));
    } catch (error) {
      console.error('❌ 번역 실패:', error);
      Swal.fire('번역 오류', 'Google Translate API 호출에 실패했습니다.', 'error');
    }
  }, [translationMap, user.language]);

          useEffect(() => {
              const width = window.screen.width;
              const height = window.screen.height;
              const ratio = (height / width).toFixed(2); // 소수점 2자리
  
              // CSS 변수에 주입
              document.documentElement.style.setProperty("--aspect-ratio", ratio);
  
              // 조건에 따라 safe-bottom 조정
              const isAndroid = !!window.native;
  
              if (isAndroid && ratio <= 2.21) {
              document.documentElement.style.setProperty("--safe-bottom", "0px");
              } else {
              document.documentElement.style.setProperty("--safe-bottom", "0px");
              }
          }, []);

  // ⭐ 인터벌 관리를 위한 ref 추가
  const intervalRef = useRef(null);
  const lastChatSnRef = useRef(null);
  const messageEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const firstLoadRef = useRef(true);
  const chatInputRef = useRef(null);
  const isScrollingRef = useRef(false);
  const isLoadingRef = useRef(false); // 중복 호출 방지 플래그 추가
  const scrollTimeoutRef = useRef(null); // 스크롤 디바운스용
  const [modalImage, setModalImage] = useState(null);

    const checkUser = useRef(false);
  
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

  // ⭐ 인터벌을 시작하는 함수 - 최적화
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    intervalRef.current = setInterval(() => {
      // room_sn이 있고, 로딩 중이 아닐 때만 실행
      if (room_sn && !isLoadingRef.current) {
        getChattingData(false, false);
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

      const response = await ApiClient.postForm('/api/registerReader', {
        target_table: 'UserChat',
        target_id: roomSn,
        reader_type: 'user',
        reader_id: user.user_id
      });


      console.log('✅ registerReader 성공:', response);
      
    } catch (error) {
      console.error('❌ registerReader 실패:', error);
    }
  };

  // 스크롤 위치 감지
  const isUserAtBottom = useCallback(() => {
    if (!chatBoxRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    const isAtBottom = distanceFromBottom < 10;
    console.log('📍 사용자 위치 확인:', {
      distanceFromBottom,
      isAtBottom
    });
    return isAtBottom;
  }, []);

  // 스크롤을 맨 밑으로 이동시키는 함수 - 개선된 버전
  const scrollToBottom = useCallback((behavior = 'smooth', force = false) => {
    console.log('🔄 scrollToBottom 호출됨:', behavior, 'force:', force);
    
    if (!force && isScrollingRef.current) {
      console.log('⏸️ 이미 스크롤 중이므로 호출 무시');
      return;
    }
    
    if (!chatBoxRef.current) {
      console.log('❌ chatBoxRef가 없음');
      return;
    }
    
    isScrollingRef.current = true;
    
    const scrollToBottomImmediate = () => {
      if (!chatBoxRef.current) {
        isScrollingRef.current = false;
        return;
      }
      
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
        setTimeout(() => {
          isScrollingRef.current = false;
          setShowFloatButton(false);
        }, 50); // 더 짧은 시간으로 변경
      } else {
        chatBoxRef.current.scrollTo({
          top: maxScrollTop,
          behavior: 'smooth'
        });
        console.log('🔄 부드러운 스크롤 이동 시작');
        setTimeout(() => {
          isScrollingRef.current = false;
          setShowFloatButton(false);
        }, 500); // smooth 스크롤 완료 대기 시간
      }
    };
    
    // DOM 업데이트 완료 후 스크롤 실행
    requestAnimationFrame(scrollToBottomImmediate);
  }, []);

  // 스크롤 위치 유지를 위한 함수 추가
  const maintainScrollPosition = useCallback(() => {
    if (!chatBoxRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // 사용자가 맨 아래에 있지 않다면 스크롤 위치 유지
    if (distanceFromBottom > 50) {
      const savedScrollTop = scrollTop;
      requestAnimationFrame(() => {
        if (chatBoxRef.current) {
          chatBoxRef.current.scrollTop = savedScrollTop;
        }
      });
      return true; // 위치 유지됨
    }
    return false; // 맨 아래에 있음
  }, []);

  const formatTime = useCallback((date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }, []);

  function calculateActualEndTime(startTime, durationHours) {
    if (!startTime || !durationHours) return '';
  
    const [hoursStr = '00', minutesStr = '00', secondsStr = '00'] = startTime.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const seconds = parseInt(secondsStr, 10);
  
    const totalStartMinutes = hours * 60 + minutes;
    const totalEndMinutes = totalStartMinutes + (durationHours * 60);
  
    const endHours = Math.floor(totalEndMinutes / 60);
    const endMinutes = totalEndMinutes % 60;
    const isNextDay = endHours >= 24;
    const displayHours = endHours % 24;
  
    const result = `${displayHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return isNextDay ? `${result}+1` : result;
  }
  

  // 예약 정보를 가져오는 함수 - 안정화
   const getReservationInfo = useCallback(async (reservationId) => {


    try {

      const {type} = user;
      let login_id = user.user_id;

      const response = await ApiClient.get('/api/bookingHistory', {
        params: { user_id: login_id }
      });
      const resTmp = response.data; // ⬅️ 여기서 배열을 추출



      

      const targetReservation = resTmp.find(item => item.reservation_id === reservationId);
      console.log('getReservationInfo', reservationId, resTmp, targetReservation);

      if( targetReservation != null ){
        
          targetReservation.res_start_time = targetReservation.time;
          const endTime = calculateActualEndTime(targetReservation.end_time || targetReservation.time, 1);
          targetReservation.res_end_time = endTime;
          targetReservation.target_name = targetReservation.venue_name;
          //reservationCache[reservationId] = targetReservation;

          

          console.log('1111-00', targetReservation);


          return targetReservation;
        }

      return null;
    } catch (error) {

       console.log('1111-01', error);
      return null;
    }
  }, [venue_id]);

  // 예약 링크 템플릿 컴포넌트 - 에러 처리 강화
  const ReservationLinkTemplate = React.memo(({ reservationData, reservationId }) => {
    console.log('🏨 ReservationLinkTemplate 렌더링:', { reservationId, hasData: !!reservationData });
    
    // 로딩 상태 표시
    if (reservationData === undefined) {
      return (
        <div style={{
          background: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '12px',
          margin: '8px 0',
          maxWidth: '320px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: 12 }}>
            예약 정보를 불러오는 중...
          </div>
          <div style={{ fontSize: 10, marginTop: 4, color: '#9ca3af' }}>
            예약 ID: {reservationId}
          </div>
        </div>
      );
    }
    
    // 데이터가 없는 경우
    if (!reservationData) {

      getReservationInfo(reservationId).then(reservationData => {
        console.log('reservationData-1', reservationId, reservationData);
      });

      


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
          <div style={{ fontSize: 12 }}>
            예약 정보를 불러올 수 없습니다.
          </div>
          <div style={{ fontSize: 10, marginTop: 4, color: '#9ca3af' }}>
            예약 ID: {reservationId}
          </div>
        </div>
      );
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}.${month}.${day}`;
      } catch (error) {
        console.error('❌ 날짜 포맷 에러:', error);
        return 'N/A';
      }
    };
    
    const formatTime = (timeString) => {
      if (!timeString) return 'N/A';
      try {
        return timeString.slice(0, 5);
      } catch (error) {
        console.error('❌ 시간 포맷 에러:', error);
        return 'N/A';
      }
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
          {get('BookingSum.Target')}: {reservationData.target_name || reservationData.client_name || 'N/A'}
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

    console.log('getLinkTemplate', msg);
    switch(msg.link_type){
      case 'reservation':{
        return <ReservationLinkTemplate reservationData={msg.reservationData} reservationId={msg.link_target} />;
      } 
      default:
        return null;
    }
  }, []);

  // ChatMessage 컴포넌트 - 메모이제이션 최적화
  const ChatMessage = React.memo(({ msg, setModalImage }) => {
    const isMine = msg.sender === 'me';
    const isTranslated = translationMap[msg.chat_sn];
    const showIcon = showTranslateIcon[msg.chat_sn];

    console.log('🔤 ChatMessage 렌더링:', {
      chat_sn: msg.chat_sn,
      isMine,
      isTranslated,
      showIcon,
      hasText: !!msg.text
    });

    const pressTimerRef = useRef(null);

    const handleMouseDown = () => {
      if (!isMine) {
        console.log('🔤 Mouse Down 감지:', msg.chat_sn);
        pressTimerRef.current = setTimeout(() => {
          handleLongPress(msg.chat_sn);
        }, 600);
      }
    };

    const handleMouseUp = () => {
      if (pressTimerRef.current) {
        console.log('🔤 Mouse Up 감지 (타이머 취소):', msg.chat_sn);
        clearTimeout(pressTimerRef.current);
      }
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
              {!isMine && !isTranslated && msg.text && (
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
  }, (prevProps, nextProps) => {
    // 실제로 변경된 props만 리렌더링
    return prevProps.msg.chat_sn === nextProps.msg.chat_sn &&
           prevProps.msg.text === nextProps.msg.text &&
           prevProps.msg.image === nextProps.msg.image;
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

  // 🎯 최적화된 getChattingData 함수 - 예약 정보 처리 개선
  const getChattingData = useCallback(async (isInitial = false, loadOlder = false) => {
    // 중복 호출 방지
    if (isLoadingRef.current) {
      console.log('🚫 이미 로딩 중이므로 호출 무시');
      return;
    }
    
    if (!room_sn) {
      console.log('🚫 room_sn이 없어서 로딩 차단');
      return;
    }

    isLoadingRef.current = true; // 로딩 시작
    
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
    
    try {
      const params = { 
        room_sn: room_sn,
        limit: 10,
        direction: loadOlder ? 'older' : 'newer',
        account_type: user.type
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

      console.log('📡 채팅 데이터 요청:', params);
      const response = await axios.get(`${API_HOST}/api/getChattingData_v2`, {
        params
      });

      console.log('📨 채팅 데이터 응답:', response.data?.length || 0, '개');

      // 메시지 기본 정보 먼저 생성 (예약 정보 제외)
      const basicMessages = response.data.map((item, index) => ({
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
        reservationData: null, // 초기에는 null
      }));

      console.log('📋 기본 메시지 생성 완료:', basicMessages.length, '개');

      // 예약 정보가 필요한 메시지들만 별도로 처리
      const reservationMessages = basicMessages.filter(msg => 
        msg.link_type === 'reservation' && msg.link_target
      );

      console.log('🏨 예약 정보 처리 필요:', reservationMessages.length, '개');

      // 예약 정보 비동기 로딩 (에러 발생 시에도 계속 진행)
      if (reservationMessages.length > 0) {
        // Promise.allSettled 사용하여 일부 실패해도 계속 진행
        const reservationResults = await Promise.allSettled(
          reservationMessages.map(async (msg) => {
            try {
              console.log('🔍 예약 정보 조회 시작:', msg.link_target);
              const reservationData = await getReservationInfo(msg.link_target);
              console.log('✅ 예약 정보 조회 완료:', msg.link_target, !!reservationData);
              return { chat_sn: msg.chat_sn, reservationData };
            } catch (error) {
              console.error('❌ 예약 정보 조회 실패:', msg.link_target, error);
              return { chat_sn: msg.chat_sn, reservationData: null };
            }
          })
        );

        // 성공한 예약 정보들을 메시지에 적용
        reservationResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            const { chat_sn, reservationData } = result.value;
            const messageIndex = basicMessages.findIndex(msg => msg.chat_sn === chat_sn);
            if (messageIndex !== -1) {
              basicMessages[messageIndex].reservationData = reservationData;
            }
          }
        });

        console.log('🏨 예약 정보 적용 완료');
      }

      const newMessages = basicMessages;

      console.log("2222", isInitial);
      if (isInitial) {
        // 초기 로딩: 최신 메시지 10개 (내림차순으로 정렬하여 최신이 맨 아래에 오도록)
        const sortedMessages = [...newMessages].sort((a, b) => b.chat_sn - a.chat_sn).reverse();
        console.log('🎯 초기 로딩 - 정렬된 메시지:', sortedMessages.map(m => ({ chat_sn: m.chat_sn, text: m.text })));
        setChatMessages(dedupeMessages(sortedMessages));
        if (sortedMessages.length > 0) {
          const lastMessage = sortedMessages[sortedMessages.length - 1];
          lastChatSnRef.current = lastMessage.chat_sn;
          // 초기 로딩 시에만 스크롤 (부드럽게 하지 않고 즉시)
          setTimeout(() => {
            scrollToBottom('auto', true);
          }, 100);
        }
        setIsInitialLoad(false);
      } else if (loadOlder) {
        // 이전 메시지 로딩: 앞에 추가 (스크롤 위치 유지)
        console.log('📚 이전 메시지 로딩:', newMessages.map(m => ({ chat_sn: m.chat_sn, text: m.text })));
        
        // 현재 스크롤 위치 저장
        const currentScrollTop = chatBoxRef.current?.scrollTop || 0;
        const currentScrollHeight = chatBoxRef.current?.scrollHeight || 0;
        
        setChatMessages(prev => {
          const updated = dedupeMessages([...newMessages, ...prev]);
          
          // 메시지 추가 후 스크롤 위치 복원
          requestAnimationFrame(() => {
            if (chatBoxRef.current) {
              const newScrollHeight = chatBoxRef.current.scrollHeight;
              const heightDiff = newScrollHeight - currentScrollHeight;
              chatBoxRef.current.scrollTop = currentScrollTop + heightDiff;
            }
          });
          
          return updated;
        });
      } else {
        // 새 메시지 로딩: 뒤에 추가
        const newChatMessages = newMessages.filter(msg => msg.chat_sn > lastChatSnRef.current);

        if (newChatMessages.length > 0) {
          console.log('🆕 새 메시지 로딩:', newChatMessages.map(m => ({ chat_sn: m.chat_sn, text: m.text })));
          
          // 사용자가 맨 아래에 있는지 미리 확인
          const wasAtBottom = isUserAtBottom();
          
          setChatMessages(prev => {
            const updated = dedupeMessages([...prev, ...newChatMessages]);
            
            // 메시지 추가 후 스크롤 처리
            if (wasAtBottom) {
              // 사용자가 맨 아래에 있었다면 새 메시지로 자동 스크롤
              requestAnimationFrame(() => {
                scrollToBottom(newChatMessages[0].sender_type === user.type ? 'auto' : 'smooth');
              });
            }
            // 맨 아래에 있지 않았다면 스크롤하지 않음
            
            return updated;
          });
          
          const lastMessage = newChatMessages[newChatMessages.length - 1];
          lastChatSnRef.current = lastMessage.chat_sn;
        }
      }
    } catch (error) {
      console.error('❌ 채팅 데이터 불러오기 실패:', error);
    } finally {
      isLoadingRef.current = false; // 로딩 완료
    }
  }, [room_sn, user.type, formatTime, scrollToBottom, isUserAtBottom]); // getReservationInfo 의존성 제거

  // 이전 메시지 로딩 함수 - 의존성 배열 수정
  const loadOlderMessages = useCallback(async () => {
    if (!room_sn) {
      console.log('🚫 room_sn이 없어서 로딩 차단');
      return;
    }
    
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
        room_sn: room_sn, // 최신 room_sn 사용
        limit: 13,
        direction: 'older',
        before_chat_sn: oldestMessage.chat_sn,
        account_type: user.type
      };

      const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
      const response = await axios.get(`${API_HOST}/api/getChattingData_v2`, { params });
      
      // 예약 정보 포함한 메시지 처리
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

      if (newMessages.length === 0) {
        setHasMoreOlder(false);
      } else {
        setChatMessages(prev => dedupeMessages([...newMessages, ...prev]));
      }
    } catch (error) {
      console.error('❌ 이전 메시지 로딩 실패:', error);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [room_sn, chat_messages, isLoadingOlder, hasMoreOlder, user.type, formatTime, getReservationInfo]); // room_sn 추가!

  // 스크롤 이벤트 핸들러 - 디바운스 처리로 최적화
  const handleScroll = useCallback(() => {
    if (!chatBoxRef.current) return;
    
    // 디바운스 처리
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      if (!chatBoxRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
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
      
      // 이전 메시지 로딩 (중복 방지 조건 추가)
      if (!isLoadingOlder && hasMoreOlder && !isLoadingRef.current && scrollTop < 100) {
        console.log('🔄 이전 메시지 로딩 시작');
        loadOlderMessages();
      }
    }, 100); // 100ms 디바운스
  }, [isLoadingOlder, hasMoreOlder, loadOlderMessages, showFloatButton]);

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const chatBox = chatBoxRef.current;
    if (chatBox) {
      chatBox.addEventListener('scroll', handleScroll);
      return () => {
        chatBox.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  // room_sn 변경 시 상태 초기화 최적화
  useEffect(() => {
    console.log('🔄 Room SN changed to:', room_sn);
    
    // 기존 폴링 정지
    stopPolling();
    
    // 로딩 플래그 초기화
    isLoadingRef.current = false;

    if (room_sn) {
      // 상태 초기화
      setChatMessages([]);
      setHasMoreOlder(true);

      console.log('2222', 'room_sn초기화');
      setRoomSn(room_sn);
      
      setIsInitialLoad(true);
      lastChatSnRef.current = null;

      registerReader(room_sn);
      
      // 초기 채팅 데이터 로딩
      getChattingData(true, false).then(() => {
        // 데이터 로딩 완료 후 폴링 시작
        startPolling();
      });
    }

    return () => {
      stopPolling();
      // 타이머 정리
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [room_sn]); // 다른 의존성 제거하여 불필요한 재실행 방지

  // 메시지가 업데이트될 때 불필요한 스크롤 방지
  useEffect(() => {
    // 초기 로딩이나 새 메시지가 추가된 경우가 아니라면 스크롤하지 않음
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    
    // 메시지 업데이트로 인한 불필요한 스크롤 방지
    // 이 useEffect는 제거하거나 조건을 더 엄격하게 설정
  }, []); // 의존성 배열을 비워서 불필요한 실행 방지

  const handleMessageSend = useCallback(async (message) => {

    const {type} = user;
    let login_id = user.user_id;



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
      send_to: 'manager',
      receiver_id: receiverId
    };

    // 메시지 전송 즉시 스크롤 (사용자가 직접 보낸 메시지이므로)
    requestAnimationFrame(() => {
      scrollToBottom('auto', true);
    });

    await insertChattingData(chatData);
  }, [room_sn, user, nickname, venue_id, scrollToBottom, roomTitle]);

  const insertChattingData = useCallback(async (params) => {
    const safeParams = {
      ...params,
      receiver_id: params.receiver_id || receiverId
    };

    console.log(safeParams, receiverId);

    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
    try {
      const response = await axios.post(`${API_HOST}/api/insertChattingData`, safeParams);
      console.log('✅ 채팅 서버 응답:', response.data);

      const {chat_sn, room_sn: newRoomSn} = response.data;
      if(chat_sn && newRoomSn){
        setRoomSn(newRoomSn);
      }
    } catch (error) {
      console.error('❌ 채팅 전송 실패:', error);
    }
  }, [receiverId]);

  const handleUploadComplete = useCallback((content_id, file) => {
    console.log('이미지 전송 ^_T', room_sn, content_id, sendTo, receiverId);

    const {type} = user;
    let login_id = user.user_id;

    
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
      send_to: memoizedProps.send_to || sendTo,
      receiver_id: receiverId
    });

    setTimeout(() => {
      scrollToBottom('auto');
    }, 300);
  }, [room_sn, user, nickname, venue_id, insertChattingData, scrollToBottom, sendTo, receiverId, memoizedProps.send_to]);

  const handleUploadError = useCallback((error) => {
    console.error('이미지 업로드 실패:', error);
    Swal.fire({
      title: get('IMAGE_UPLOAD_ERROR'),
      icon: 'error',
      confirmButtonText: get('SWAL_CONFIRM_BUTTON')
    });
  }, [get]);

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

  const hasSentReservationRef = useRef(false);

  useEffect(() => {
    if (reservationCardData && sendTo && receiverId && !hasSentReservationRef.current) {
      hasSentReservationRef.current = true; // ✅ 1회만 전송
      checkUser.current = true
      handleReservationSend();
    }
  }, [reservationCardData, sendTo, receiverId]);

  const handleReservationSend = useCallback(async (params) => {
    console.log('reservationCardData send!', reservationCardData, params);

    const {type} = user;
    let login_id = user.user_id;

    
    console.log("1111=1", user.type);

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
      send_to: memoizedProps.send_to || sendTo,
      receiver_id: receiverId
      //send_to: user.type,
      //receiver_id: receiverId
    };

    console.log('Sending chatData:', chatData, reservationCardData);

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
  }, [user, room_sn, nickname, venue_id, reservationCardData, stopPolling, getChattingData, startPolling, receiverId]);

  const handleCloseReservationCard = useCallback(() => {
    setShowReservationCard(false);
    setReservationCardData(null);
  }, []);

  useEffect(() => {
    if (initType === 'booking' && !showReservationCard && !reservationCardData) {
      generateInitChatItem();
    }

  }, [initType, showReservationCard, reservationCardData, generateInitChatItem]);

  useEffect(() => {
    // 탈퇴한 사용자 체크
    if (otherProps?.account_status === 'deleted') {
      
      // SweetAlert 표시
      Swal.fire({
        title: get('SWAL_ACCOUNT_STATUS1'),
        text: get('SWAL_ACCOUNT_STATUS2'),
        icon: 'warning',
        confirmButtonText: get('BUTTON_CONFIRM')
      }).then((result) => {
        if (result.isConfirmed) {
          // 확인 버튼 클릭 시 이전 페이지로 돌아가기
          goBack();
        }
      });
    }
  }, [otherProps?.account_status, get, goBack]); // account_status 변경 시만 실행




  useEffect(() => {
  if (window.visualViewport) {
    const handleResize = () => {
      // 키보드가 올라와서 viewport가 줄어든 경우
      if (chatBoxRef.current) {
        setTimeout(() => {
          scrollToBottom('auto', true); // ✅ 약간 딜레이 후 실행
        }, 150); // 키보드 애니메이션 끝날 시간 고려
      }
    };

    window.visualViewport.addEventListener("resize", handleResize);
    return () => {
      window.visualViewport.removeEventListener("resize", handleResize);
    };
  }
}, [scrollToBottom]);



  return (
    <>
      <style jsx="true">{`


html, body {
  height: 100%;
  overflow: hidden; /* 외부 스크롤 방지 */
}


        .chat-container {
          display: flex;
          flex-direction: column;
          /* 입력창을 제외한 높이 계산 */
            height: calc(100dvh - 60px - 4rem - var(--safe-bottom, 0px));
          margin-top: 4rem;   /* 또는 padding-top: 3rem */

          overflow: hidden;
          background: white;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          margin-top:-66px;
           -webkit-overflow-scrolling: touch; /* iOS 스크롤 안정화 */
        }


        .content-area {
          flex: 1;               /* 남는 공간 채움 */
          background: #fff;
          overflow: hidden;       /* ✅ 스크롤 안되게 */
        }



        /* 기본 */
        .chat-message-wrapper {
          display: flex;
          flex-direction: column;
          margin: 4px 0;
          max-width: 70%;   /* 기본 너비 줄임 */
        }

        /* 내가 보낸 메시지 */
        .chat-message-wrapper.me {
          align-self: flex-end;
          text-align: right;
          max-width: 60%;   /* 내 메시지는 더 좁게 */
        }

       /* 내가 보낸 메시지 */
          .chat-message-wrapper.me {
            margin-left: auto;   /* ✅ 오른쪽 끝으로 이동 */
            max-width: 70%;      /* 최대 폭 제한 */
          }

          .chat-message-wrapper.me .chat-message {
            background-color: #dcf8c6;
            border-radius: 16px 16px 0 16px;
            padding: 8px 12px;
            display: inline-block;
            font-size: 14px;
            line-height: 1.4;
            color: #111;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);

            text-align: left;
            word-break: break-word;
          }


        .chat-message-wrapper.other .chat-message {
          background-color: #fff;
          border-radius: 16px 16px 16px 0;
          padding: 8px 12px;
          display: inline-block;
          font-size: 14px;
          line-height: 1.4;
          color: #111;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px rgba(0,0,0,0.08);
        }

        /* 이름 */
        .chat-message-wrapper .chat-name {
          font-size: 12px;
          color: #888;
          margin-bottom: 2px;
        }

        /* 시간 */
        .chat-time {
          font-size: 11px;
          color: #aaa;
          margin-top: 2px;
        }











          /* 입력창 */
        .chat-input-wrapper {
          position: fixed;
          bottom: var(--safe-bottom, 0px); /* 안전영역 반영 */

          left: 4px;        /* 왼쪽 여백 */
          right: 4px;       /* 오른쪽 여백 */
          width: auto;       /* width 대신 auto */
          max-width: 28rem;  /* 필요시 앱 화면 최대 폭 제한 */
          height: 50px;

          display: flex;
          align-items: center;
          padding: 0.8rem 1rem;

          background-color: white;
          border-top: 1px solid #e5e7eb;
          z-index: 2000;
          border-radius: 8px; /* 선택: 여백 줄 때 라운드주면 자연스러움 */
        }

        /* 입력창 내부 input */
        .chat-input {
          flex: 1;
          padding: 0.5rem 1rem;
          border: 1px solid #ccc;
          border-radius: 1.5rem;
          margin: 0 0.5rem;
          font-size: 1rem;
        }

        /* 전송 버튼 */
        .send-button {
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 1.5rem;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-weight: bold;
        }

        /* 이미지 업로드 버튼 (선택사항) */
        .image-button {
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
        }

        /* 채팅 이미지 */
.chat-image {
  width: 180px;       /* 원하는 고정 너비 */
  height: 180px;      /* 원하는 고정 높이 */
  border-radius: 8px; /* 모서리 둥글게 */
  object-fit: cover;  /* 비율 유지하며 잘림 */
  cursor: pointer;    /* 클릭 가능 */
  display: block;
  margin-top: 6px;
}


.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85); /* 어두운 배경 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000; /* 최상위 */
  cursor: zoom-out; /* 닫기 힌트 */
}

.image-modal img {
  max-width: 95%;
  max-height: 95%;
  object-fit: contain; /* 원본 비율 유지 */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  animation: fadeIn 0.2s ease-in-out;
}

.image-modal-close {
  position: absolute;
  top: 16px;
  right: 24px;
  font-size: 2rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
}

/* 부드럽게 나타나는 효과 */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
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

        
        
      </div>


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
              onFocus={() => {
              
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