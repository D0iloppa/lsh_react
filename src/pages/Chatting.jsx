import React, { useState, useEffect, useRef } from 'react';
import SketchHeader from '@components/SketchHeader';
import { useAuth } from '../contexts/AuthContext';
import '@components/SketchComponents.css';
import { Image as ImageIcon } from 'lucide-react';

const Payment = ({ navigateToPageWithData, PAGES }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
   
  ]);
  const [inputValue, setInputValue] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const fileInputRef = useRef(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleBack = () => {
    navigateToPageWithData && navigateToPageWithData(PAGES.ACCOUNT);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const now = new Date();
    const newMessage = {
      id: messages.length + 1,
      sender: 'me',
      text: inputValue.trim(),
      time: formatTime(now),
    };
    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newMessage = {
        id: messages.length + 1,
        sender: 'me',
        image: reader.result,
        time: formatTime(new Date()),
      };
      setMessages([...messages, newMessage]);
    };
    reader.readAsDataURL(file);
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
          margin-bottom: 0.5rem;
        }

        .chat-message-wrapper.me {
          justify-content: flex-end;
          flex-direction: row;
        }

        .chat-message-wrapper.other {
          justify-content: flex-start;
          flex-direction: row;
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
          width:50px;
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
        <SketchHeader
          title="1:1 채팅"
          showBack={true}
          onBack={handleBack}
          rightButtons={[]}
        />

        <div className="chat-messages">
          {messages.map((msg) => (
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
        <button
            className="image-button"
            onClick={() => fileInputRef.current.click()}
            aria-label="이미지 업로드"
          >
            <ImageIcon size={22} strokeWidth={1.6} />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImageUpload}
            capture="environment"
          />
          <input
            className="chat-input"
            type="text"
            placeholder="메시지를 입력하세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="send-button" onClick={handleSend}>전송</button>
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

export default Payment;
