import React, { useState, useEffect, useRef } from 'react';
import SketchHeader from '@components/SketchHeader';
import { ImageUploader } from '@components/ImageUploader';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '../contexts/AuthContext';
import '@components/SketchComponents.css';
import ApiClient from '@utils/ApiClient';
import axios from 'axios';

const Chatting = ({ navigateToPageWithData, PAGES, goBack, ...otherProps }) => {
  const room_sn = otherProps?.room_sn || null;
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const { user } = useAuth();
  const user_id = user?.user_id;
  const nickname = user?.name;
  const venue_id = user?.venue_id;

  const [chat_messages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const lastChatSnRef = useRef(null);
  const messageEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const firstLoadRef = useRef(true);

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
    getChattingData();

    const interval = setInterval(() => {
      getChattingData();
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const isUserAtBottom = () => {
    if (!chatBoxRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
    return scrollHeight - scrollTop - clientHeight < 50;
  };

  // 🎯 스크롤을 맨 밑으로 이동시키는 함수
  const scrollToBottom = (behavior = 'smooth') => {
    // 여러 방법을 시도해서 확실하게 스크롤
    if (chatBoxRef.current) {
      // 방법 1: scrollTop 직접 설정
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      
      // 방법 2: scrollIntoView 사용
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ 
          behavior, 
          block: 'end',
          inline: 'nearest'
        });
      }, 10);
      
      // 방법 3: 추가 보정 (이미지 로딩 등을 고려)
      setTimeout(() => {
        if (chatBoxRef.current) {
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (firstLoadRef.current) {
      // 첫 로딩 시에는 스크롤하지 않음 (getChattingData에서 처리)
      firstLoadRef.current = false;
    } else if (isUserAtBottom()) {
      // 사용자가 맨 밑에 있을 때만 자동 스크롤
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [chat_messages]);

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  };

  const getChattingData = async () => {
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
    try {
      const response = await axios.get(`${API_HOST}/api/getChattingData`, {
        params: { 
          room_sn,
          chat_sn: lastChatSnRef.current || null
        },
      });

       /*
      console.log('API Response:', response.data);
      console.log('Current lastChatSnRef.current:', lastChatSnRef.current);
      */
      const newMessages = response.data.map((item, index) => ({
        id: index + 1,
        sender: item.sender_type === 'user' ? 'other' : 'me',
        text: item.chat_msg || '',
        image: item.image_url || null,
        chat_sn: item.chat_sn,
        sender_type: item.sender_type, // 추가: 원본 sender_type 보존
        time: formatTime(new Date(item.send_dt)),
      }));

      // console.log('Processed newMessages:', newMessages);

      // 초기 로드와 업데이트 구분
      if (lastChatSnRef.current === null) {
        // 첫 로드 시 전체 메시지 설정
        console.log('First load - setting all messages:', newMessages);
        setChatMessages(newMessages);
        
        // 첫 로드 후에만 lastChatSnRef.current 설정
        if (newMessages.length > 0) {
          const lastMessage = newMessages[newMessages.length - 1];
          lastChatSnRef.current = lastMessage.chat_sn;
          console.log('Updated lastChatSnRef.current to:', lastChatSnRef.current);
          
          // 🎯 첫 로딩 시 반드시 맨 밑으로 스크롤 (시간 여유를 더 줌)
          setTimeout(() => {
            scrollToBottom('auto');
          }, 200);
        }
      } else {
        // 기존 메시지에 새로운 메시지만 추가
        const newChatMessages = newMessages.filter(msg => msg.chat_sn > lastChatSnRef.current);
        // console.log('Filtered new messages:', newChatMessages);
        if (newChatMessages.length > 0) {
          setChatMessages(prev => {
            const updated = [...prev, ...newChatMessages];
            //console.log('Updated chat_messages:', updated);
            return updated;
          });
          
          // 새로운 메시지가 추가된 후 lastChatSnRef.current 업데이트
          const lastMessage = newChatMessages[newChatMessages.length - 1];

          // 🎯 내가 보낸 메시지이거나 사용자가 맨 밑에 있을 때 스크롤
          const shouldScroll = lastMessage.sender_type === 'manager' || isUserAtBottom();
          
          if (shouldScroll) {
            setTimeout(() => {
              scrollToBottom(lastMessage.sender_type === 'manager' ? 'auto' : 'smooth');
            }, 100);
          }
          
          lastChatSnRef.current = lastMessage.chat_sn;
          // console.log('Updated lastChatSnRef.current to:', lastChatSnRef.current);
        }
      }
    } catch (error) {
      console.error('❌ 채팅 데이터 불러오기 실패:', error);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const now = new Date();
    const newMessage = {
      id: chat_messages.length + 1,
      sender: 'me',
      text: inputValue.trim(),
      time: formatTime(now),
    };

    // setChatMessages([...chat_messages, newMessage]);
    
    const chatData = {
      room_sn,
      chat_msg: inputValue.trim(),
      sender: user_id,
      sender_type: 'manager',
      content_id: 0,
      room_name: nickname,
      room_description: '',
      created_by: user_id,
      creator_type: 'manager',
      last_message_preview: inputValue.trim(),
      venue_id,
    };

    setInputValue(''); // 입력창 즉시 비우기
    
    // 🎯 메시지 전송 후 약간의 지연을 두고 스크롤
    setTimeout(() => {
      scrollToBottom('auto');
    }, 150);

    await insertChattingData(chatData);
  };

  

  const insertChattingData = async (params) => {
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
    try {
      const response = await axios.post(`${API_HOST}/api/insertChattingData`, params);
      console.log('✅ 채팅 서버 응답:', response.data);
    } catch (error) {
      console.error('❌ 채팅 전송 실패:', error);
    }
  };

  const handleUploadComplete = (content_id, file) => {

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

    // 🎯 이미지 업로드 후 스크롤 (이미지 로딩 시간 고려)
    setTimeout(() => {
      scrollToBottom('auto');
    }, 300);

  };

  const handleUploadError = (error) => {
    console.error('이미지 업로드 실패:', error);
    alert('이미지 업로드에 실패했습니다.');
  };

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
        .chat-time {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0 0.4rem;
          white-space: nowrap;
        }
        .chat-message {
          max-width: 70%;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          word-break: break-word;
        }
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
          border-top: 1px solid #ddd;
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
      `}</style>

      <div className="chat-container">
        <SketchHeader title={get('CHAT_ONE_ON_ONE_TITLE')} showBack={true} onBack={goBack} rightButtons={[]} />
        <div className="chat-messages" ref={chatBoxRef}>
          {console.log('Rendering chat_messages:', chat_messages)}
          {chat_messages.map((msg) => (
            <div key={msg.chat_sn} className={`chat-message-wrapper ${msg.sender}`}>
              {msg.sender === 'me' ? (
                <>
                  <div className="chat-time">{msg.time}</div>
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
                </>
              ) : (
                <>
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
                  <div className="chat-time">{msg.time}</div>
                </>
              )}
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        <div className="chat-input-wrapper">
          <ImageUploader 
            apiClient={ApiClient}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            showContextMenu={true}
            showPreview={false}
            className="chat-image-uploader"
          />
          <input
            className="chat-input"
            type="text"
            placeholder={get('CHAT_INPUT_PLACEHOLDER')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{ width: '20px' }}
          />
          <button className="send-button" onClick={handleSend}>
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