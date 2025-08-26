import React, { useRef, useState, useEffect } from 'react';
import { useMsg } from '@contexts/MsgContext';
import { overlay } from 'overlay-kit';
import CountryFlag from 'react-country-flag';

const FLAG_CODES = {
  kr: 'KR',
  vi: 'VN',
  en: 'US',
  ja: 'JP',
  cn: 'CN',
};
const LANG_LABELS = {
  kr: '한국어',
  vi: 'Tiếng Việt',
  en: 'English',
  ja: '日本語',
  cn: '中文',
};
const LANGS = ['kr', 'en', 'vi', 'ja', 'cn'];

const MENU_WIDTH = 160;
const MENU_HEIGHT = 200;
const PADDING = 8;

const MessageFlag = ({ style }) => {
  const { currentLang, setLanguage } = useMsg();


  console.log('msgFlag currentLang', currentLang);

  const btnRef = useRef();
  const [position, setPosition] = useState({ x: window.innerWidth - 72, y: window.innerHeight - 72 });
  const dragging = useRef(false);
  const dragStarted = useRef(false); // 드래그가 실제로 시작되었는지 추적
  const offset = useRef({ x: 0, y: 0 });
  const overlayRef = useRef(null); // 현재 열린 overlay 추적

  // 현재 열린 overlay 닫기
  const closeOverlay = () => {
    if (overlayRef.current) {
      overlay.unmount(overlayRef.current); // ID로 언마운트
      overlayRef.current = null;
    }
  };

  // 전역 클릭 이벤트로 overlay 닫기
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // overlay가 열려있고, 클릭된 요소가 플로팅 버튼이 아닌 경우에만 닫기
      if (overlayRef.current && !btnRef.current?.contains(e.target)) {
        closeOverlay();
      }
    };

    if (overlayRef.current) {
      document.addEventListener('click', handleGlobalClick, true);
      return () => document.removeEventListener('click', handleGlobalClick, true);
    }
  }, [overlayRef.current]);

  // 드래그 시작
  const handleMouseDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    dragStarted.current = false; // 아직 실제 드래그는 시작되지 않음
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 드래그 중
  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    
    // 실제 드래그가 시작됨을 표시
    if (!dragStarted.current) {
      dragStarted.current = true;
      closeOverlay(); // 드래그 시작시 overlay 닫기
    }
    
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  // 드래그 종료
  const handleMouseUp = () => {
    dragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    // dragStarted.current는 클릭 핸들러에서 확인하므로 여기서 리셋하지 않음
  };

  // 모바일 터치 대응
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    dragging.current = true;
    dragStarted.current = false;
    offset.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = (e) => {
    if (!dragging.current) return;
    e.preventDefault(); // 스크롤 방지
    
    if (!dragStarted.current) {
      dragStarted.current = true;
      closeOverlay();
    }
    
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - offset.current.x,
      y: touch.clientY - offset.current.y,
    });
  };

  const handleTouchEnd = () => {
    dragging.current = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    
    // 드래그가 실제로 일어났다면 클릭 이벤트 무시
    if (dragStarted.current) {
      dragStarted.current = false; // 리셋
      return;
    }
    
    // 이미 열려있으면 닫기
    if (overlayRef.current) {
      closeOverlay();
      return;
    }
    
    const rect = btnRef.current.getBoundingClientRect();
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    let menuLeft = rect.left;
    let menuTop = rect.bottom + PADDING;
    
    // 화면 바깥으로 나가면 위치 조정
    if (rect.left + MENU_WIDTH > winW) {
      menuLeft = rect.right - MENU_WIDTH;
    }
    if (rect.bottom + MENU_HEIGHT > winH) {
      menuTop = rect.top - MENU_HEIGHT - PADDING;
    }
    if (menuLeft < 0) menuLeft = 0;
    if (menuTop < 0) menuTop = 0;

    // 새 overlay 열기
    const overlayId = overlay.open(({ isOpen, close, unmount }) => {
      return (
        <div
          style={{
            position: 'fixed',
            top: menuTop,
            left: menuLeft,
            background: '#fff',
            borderRadius: '0.7rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
            zIndex: 9999,
            minWidth: MENU_WIDTH,
            width: MENU_WIDTH,
            padding: '0.3rem 0.5rem',
            border: '1px solid #eee',
          }}
          onClick={e => e.stopPropagation()} // 버블링 방지
        >
          {LANGS.map(lang => (
            <div
              key={lang}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0.4rem 0.7rem',
                cursor: 'pointer',
                fontWeight: currentLang === lang ? 700 : 400,
                background: currentLang === lang ? '#f3f4f6' : 'transparent',
                borderRadius: 8,
                fontSize: '1.05rem',
              }}
              onClick={e => {
                e.stopPropagation();
                console.log('set Lang to', lang);
                setLanguage(lang);
                overlayRef.current = null; // ref 먼저 정리
                unmount();
              }}
            >
              <CountryFlag countryCode={FLAG_CODES[lang]} svg style={{fontSize:'1.6rem'}} />
              <span>{LANG_LABELS[lang]}</span>
            </div>
          ))}
        </div>
      );
    });
    
    // overlay ID 저장
    overlayRef.current = overlayId;
  };

  // 컴포넌트 언마운트시 overlay 정리
  useEffect(() => {
    return () => {
      closeOverlay();
    };
  }, []);

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        position: 'fixed',
        left: position.x,
        bottom: 20,
        zIndex: 1000,
        background: '#fff',
        border: '1.5px solid #eee',
        borderRadius: '50%',
        width: 48,
        height: 48,
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.7rem',
        cursor: 'pointer',
        touchAction: 'none',
        ...style,
      }}
      aria-label="Change language"
    >
      <CountryFlag countryCode={FLAG_CODES[currentLang] || 'US'} svg style={{fontSize:'1.7rem'}} />
    </button>
  );
};

export default MessageFlag;