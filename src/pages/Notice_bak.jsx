// src/pages/Notice.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchHeader from '@components/SketchHeader';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import { useMsg } from '@contexts/MsgContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '@components/LoadingScreen';

const Notice = ({
  navigateToPageWithData,
  PAGES,
  goBack,
  ...otherProps
}) => {
  const { user } = useAuth();
  const { get, isLoading, currentLang } = useMsg();

  const [notices, setNotices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | NORMAL | URGENT
  const API_HOST = import.meta.env.VITE_API_HOST;

  // 상태(숫자) -> 텍스트 & 색상
  const statusMeta = (s) => {
    const n = Number(s);
    return n === 1
      ? { label: get('notice.status.urgent') || '긴급', className: 'badge-urgent' }
      : { label: get('notice.status.normal') || '일반', className: 'badge-normal' };
  };

  const fetchNotices = async () => {
    try {
      // TODO: 필요 시 엔드포인트/파라미터 맞추기
      // 서버에서 display_date <= 오늘, created_at DESC 로 정렬/필터링해 주는게 가장 좋아요.
      const res = await axios.get(`${API_HOST}/api/getNoticeList`, {
        params: {
          // 예시 파라미터 — 서버 구현에 맞게 조정
          lang: currentLang,
          onlyVisible: true, // display_date 이전만
          order: 'created_at_desc',
        },
      });
      const list = Array.isArray(res.data) ? res.data : [];
      setNotices(list);
      setFiltered(applyFilter(list, statusFilter));
    } catch (e) {
      console.error('공지사항 목록 불러오기 실패:', e);
      setNotices([]);
      setFiltered([]);
    }
  };

  const applyFilter = (list, filter) => {
    if (filter === 'ALL') return list;
    if (filter === 'URGENT') return list.filter((n) => Number(n.status) === 1);
    if (filter === 'NORMAL') return list.filter((n) => Number(n.status) !== 1);
    return list;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLang]);

  useEffect(() => {
    setFiltered(applyFilter(notices, statusFilter));
  }, [statusFilter, notices]);

  const handleNoticeClick = (notice) => {
    if (!navigateToPageWithData || !PAGES?.NOTICE_DETAIL) return;
    navigateToPageWithData(PAGES.NOTICE_DETAIL, { noticeId: notice.notice_id });
  };

  return (
    <>
      <style jsx="true">{`
        .notice-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: #fff;
          min-height: 100vh;
          position: relative;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .content-section { padding: 1.5rem; }
        .section-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem;
        }
        .section-title {
          font-size: 1.3rem; font-weight: bold; color: #1f2937; margin: 0;
        }
        .filter-buttons { display: flex; gap: .5rem; }
        .notice-list { display: flex; flex-direction: column; gap: 1rem; }

        .notice-card {
          position: relative; overflow: hidden;
          border: 1px solid #1f2937; background: #f8fafc;
          border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
          padding: 1rem; transform: rotate(-0.1deg);
          transition: transform .2s;
          cursor: pointer;
        }
        .notice-card:hover { transform: rotate(-0.1deg) scale(1.01); }
        .notice-card:nth-child(even) { transform: rotate(0.1deg); }
        .notice-card:nth-child(even):hover { transform: rotate(0.1deg) scale(1.01); }

        .notice-top {
          display: flex; align-items: center; gap: .5rem; margin-bottom: .4rem;
        }
        .notice-title {
          font-size: 1rem; font-weight: bold; color: #111827; margin: 0;
          line-height: 1.2;
          text-align: start;
        }
        .notice-meta {
          display: flex; gap: .75rem; font-size: .8rem; color: #6b7280;
          margin-top: .25rem; flex-wrap: wrap;
        }
        .notice-desc {
          font-size: .86rem; color: #374151; margin-top: .4rem;
          line-height: 1.35; text-align: start;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          word-break: break-word;
        }

        .badge {
          display: inline-block; padding: .15rem .5rem; border: 1px solid #111827;
          border-radius: 9999px; font-size: .72rem; line-height: 1; white-space: nowrap;
          background: #fff;
        }
        .badge-urgent { background: #fee2e2; border-color: #991b1b; color: #991b1b; }
        .badge-normal { background: #e5e7eb; border-color: #374151; color: #374151; }

        .empty-state { text-align: center; padding: 3rem 1rem; color: #6b7280; }
        .empty-state h3 { font-size: 1.1rem; font-weight: 700; color: #374151; margin-bottom: .4rem; }

        @media (max-width: 480px) {
          .notice-container { max-width: 100%; }
          .section-header { flex-direction: column; gap: 1rem; align-items: stretch; }
          .filter-buttons { justify-content: center; }
        }
      `}</style>

      <div className="notice-container">
        <SketchHeader
          onClick={goBack}
          title={get('Menu1.99') || '공지사항'}
          showBack={true}
          onBack={goBack}
          rightButtons={[]}
        />

        <div className="content-section">
          <div className="notice-list">
            {filtered.length > 0 ? (
              filtered.map((n) => {
                const s = statusMeta(n.status);
                return (
                  <div
                    key={n.notice_id}
                    className="notice-card"
                    onClick={() => handleNoticeClick(n)}
                  >
                    <HatchPattern opacity={0.08} />
                    <div className="notice-top">
                      <span className={`badge ${s.className}`}>{s.label}</span>
                      <h3 className="notice-title">{n.title}</h3>
                    </div>

                    {n.content && (
                      <div
                        className="notice-desc"
                        // 목록에서는 2줄만 미리보기. XSS 방지 필요시 서버에서 sanitize 하거나 여기서도 처리
                        dangerouslySetInnerHTML={{ __html: n.content }}
                      />
                    )}

                    <div className="notice-meta">
                      {n.display_date && <span>🗓 {n.display_date}</span>}
                      {n.view_count != null && <span>👁 {n.view_count}</span>}
                      {n.created_at && <span>⏱ {n.created_at}</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              <SketchDiv className="notice-card" style={{ cursor: 'default' }}>
                <HatchPattern opacity={0.02} />
                <div className="empty-state">
                  <h3>{get('Menu1.100') || '표시할 공지사항이 없어요'}</h3>
                </div>
              </SketchDiv>
            )}
          </div>
        </div>

        <LoadingScreen
          variant="cocktail"
          loadingText="Loading..."
          isVisible={isLoading}
        />
      </div>
    </>
  );
};

export default Notice;
