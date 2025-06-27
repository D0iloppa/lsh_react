import React, { useState, useEffect, useRef } from 'react';
import SketchHeader from '@components/SketchHeader';
import { ImageUploader } from '@components/ImageUploader';
import { useAuth } from '../contexts/AuthContext';
import '@components/SketchComponents.css';
import ApiClient from '@utils/ApiClient';
import axios from 'axios';

const Chatting = ({ navigateToPageWithData, PAGES, goBack, ...otherProps }) => {
  const venue_id = otherProps?.id || null;
  const venue_name = otherProps?.name || null;

  const { user } = useAuth();
  const user_id = user?.user_id;
  const nickname = user?.nickname;

  const [chat_messages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const lastChatSnRef = useRef(null);
  const messageEndRef = useRef(null);
  const messageBoxRef = useRef(null);
  const firstLoadRef = useRef(true);

  const isUserAtBottom = () => {
    const el = messageBoxRef.current;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 50;
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user_id && venue_id) {
      getChattingData(); // 초기 로딩
      const interval = setInterval(getChattingData, 1000);
      return () => clearInterval(interval);
    }
  }, [user_id, venue_id]);

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

  const getChattingData = async () => {
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
    try {
      const response = await axios.get(`${API_HOST}/api/getChattingData`, {
        params: {
          user_id: user_id,
          venue_id: venue_id,
          chat_sn: lastChatSnRef.current || null
        },
      });

      
      const newMessages = response.data.map((item, index) => ({
        id: item.chat_sn || index + 1,
        sender: item.sender_type === 'user' ? 'me' : 'other',
        text: item.chat_msg || '',
        image: item.image_url || null,
        chat_sn: item.chat_sn,
        time: formatTime(new Date(item.send_dt)),
      }));

      
      // 초기 로드와 업데이트 구분
      if (lastChatSnRef.current === null) {
        // 첫 로드 시 전체 메시지 설정
        console.log('First load - setting all messages:', newMessages);
        setChatMessages(newMessages);
        
        // 첫 로드 후에만 lastChatSnRef.current 설정
        if (newMessages.length > 0) {
          const lastMessage = newMessages[newMessages.length - 1];
          lastChatSnRef.current = lastMessage.chat_sn;
          
          // 첫 로딩 시 화면 맨 밑으로 스크롤
          setTimeout(() => {
            messageEndRef.current?.scrollIntoView({ behavior: 'auto' });
          }, 100);
        }
      } else {
        // 기존 메시지에 새로운 메시지만 추가
        const newChatMessages = newMessages.filter(msg => msg.chat_sn > lastChatSnRef.current);
        if (newChatMessages.length > 0) {
          setChatMessages(prev => {
            const updated = [...prev, ...newChatMessages];
            console.log('Updated chat_messages:', updated);
            return updated;
          });
          
          // 새로운 메시지가 추가된 후 lastChatSnRef.current 업데이트
          const lastMessage = newChatMessages[newChatMessages.length - 1];
          lastChatSnRef.current = lastMessage.chat_sn;
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
      id: Date.now(),
      sender: 'me',
      text: inputValue.trim(),
      time: formatTime(now),
    };

    // setChatMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    scrollToBottom();

    const chatData = {
      room_sn: 0,
      chat_msg: inputValue.trim(),
      sender: user_id,
      sender_type: 'user',
      content_id: 0,
      room_name: `${nickname}`,
      room_description: ``,
      created_by: user_id,
      creator_type: 'user',
      last_message_preview: inputValue.trim(),
      venue_id: venue_id,
    };

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
      room_sn: 0,
      chat_msg: '',
      sender: user_id,
      sender_type: 'user',
      content_id: content_id,
      room_name: `${nickname}`,
      room_description: ``,
      created_by: user_id,
      creator_type: 'user',
      last_message_preview: '사진',
      venue_id: venue_id,
    })
  };

  const handleUploadError = (error) => {
    console.error('이미지 업로드 실패:', error);
    alert('이미지 업로드에 실패했습니다.');
  };

  function formatTime(date) {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

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
        <SketchHeader title="1:1 채팅" showBack={true} onBack={goBack} rightButtons={[]} />

        <div className="chat-messages" ref={messageBoxRef}>
          {console.log('Rendering chat_messages:', chat_messages)}
          {chat_messages.map((msg) => (
            <div key={msg.id} className={`chat-message-wrapper ${msg.sender}`}>
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
            placeholder="메시지를 입력하세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{ width: '20px' }}
          />
          <button className="send-button" onClick={handleSend}>
            전송
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
