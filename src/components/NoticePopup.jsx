// src/components/NoticePopup.jsx
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const NoticePopup = ({ notice, showNotice, setShowNotice }) => {
  const scrollYRef = useRef(0);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    if (!showNotice) return;

    scrollYRef.current = window.scrollY || window.pageYOffset;
    const body = document.body;
    body.style.position = 'fixed';
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      const y = scrollYRef.current;
      const b = document.body;
      b.style.position = '';
      b.style.top = '';
      b.style.left = '';
      b.style.right = '';
      b.style.width = '';
      b.style.overflow = '';
      window.scrollTo(0, y);
    };
  }, [showNotice]);

  const handleClose = () => {
    if (dontShowToday) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      localStorage.setItem('hasFetchedNotice', `${yyyy}-${mm}-${dd}`);
    }
    setShowNotice(false);
  };

  if (!showNotice || !notice) return null;

  const modal = (
    <div className="notice-modal">
      <div
        className="notice-modal__overlay"
        onClick={handleClose}
        aria-modal="true"
        role="dialog"
      >
        <div
          className="notice-modal__content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="notice-modal__header">
            <h3 className="notice-modal__title">{notice.title}</h3>
          </div>

          <div className="notice-modal__body">
            <div
              className="notice-modal__desc"
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />
          </div>

          <div className="notice-modal__footer">
            <label className="notice-modal__checkbox">
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
              />{' '}
              오늘 하루 보지 않기
            </label>
            <button
              className="notice-modal__btn"
              onClick={handleClose}
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .notice-modal .notice-modal__overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2147483647;
          animation: fadeIn 0.2s ease-out;
          padding-bottom: env(safe-area-inset-bottom);
        }
        @keyframes fadeIn { from {opacity:0;} to {opacity:1;} }

        .notice-modal .notice-modal__content {
          background: #fff;
          border: 1px solid #666;
          border-radius: 8px 12px 6px 10px;
          max-width: 500px;
          width: 90%;
          position: relative;
          animation: popupSlide 0.3s ease-out;
          transform: rotate(-0.5deg);
          box-shadow: 6px 6px 0px #c1c1c1;
          overflow: hidden;
        }
        @keyframes popupSlide {
          from { opacity:0; transform: scale(0.9) rotate(-0.5deg); }
          to { opacity:1; transform: scale(1) rotate(-0.5deg); }
        }

        .notice-modal .notice-modal__header {
          text-align: center;
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 2px solid #333;
        }
        .notice-modal .notice-modal__title {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0;
          color: #333;
        }

        .notice-modal .notice-modal__body {
          padding: 1.5rem;
        }
        .notice-modal .notice-modal__desc {
          font-size: 0.9rem;
          color: #444;
          line-height: 1.6;
        }

        .notice-modal .notice-modal__footer {
          display: flex;
          justify-content: space-between; /* 왼쪽 체크박스 / 오른쪽 닫기 */
          align-items: center;
          padding: 1rem 1.5rem;
        }
        .notice-modal .notice-modal__checkbox {
          font-size: 0.85rem;
          color: #333;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .notice-modal .notice-modal__btn {
          background-color: #f8fafc;
          color: #333;
          border: 1px solid #666;
          border-radius: 8px;
          padding: 0.7rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 80px;
        }
        .notice-modal .notice-modal__btn:hover {
          background-color: #e2e8f0;
          transform: translateY(-1px);
        }

        .notice-modal .notice-modal__body {
          padding: 1.5rem;
        }

        .notice-modal .notice-modal__desc {
          font-size: 0.9rem;
          color: #444;
          line-height: 1.4;
          max-height: 300px;       /* 고정 높이 */
          overflow-y: auto;        /* 내용이 넘치면 세로 스크롤 */
          word-break: break-word; 
        }

        .notice-modal .notice-modal__desc p {
  margin: 0 0 0.8em; /* 문단마다 약간의 간격 */
}
        /* 스크롤바 스타일(선택) */
        .notice-modal .notice-modal__desc::-webkit-scrollbar {
          width: 6px;
        }
        .notice-modal .notice-modal__desc::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
};

export default NoticePopup;
