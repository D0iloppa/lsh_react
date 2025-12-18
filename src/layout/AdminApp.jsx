import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, MessagesSquare, Settings } from 'lucide-react';

// Contexts & Hooks
import { useAuth } from '@contexts/AuthContext';
import { useMsg } from '@contexts/MsgContext';
import { useFcm } from '@contexts/FcmContext';

// Config & Utils
import ApiClient from '@utils/ApiClient';
import LoadingScreen from '@components/LoadingScreen';

import './AdminApp.css';

const AdminApp = () => {
    const { fcmToken } = useFcm();
    const { get, isLoading } = useMsg();
    const [eventList, setEventList] = useState([]);

    // 1. 날짜 포맷팅 헬퍼 (YYYY-MM-DD)
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    // 2. 데이터 페칭 (파라미터 조건 반영)
    const fetchEventData = async () => {
        try {
            const today = new Date();
            const sevenDaysLater = new Date(today);
            sevenDaysLater.setDate(today.getDate() + 7);

            const res = await ApiClient.get('/api/getBookingStatusChart', {
                params: {
                    startDate: '2025-08-17',
                    endDate: formatDate(sevenDaysLater)
                }
            });

            // JSON 구조 { data: [...] } 반영
            setEventList(res.data || []);
        } catch (err) {
            console.error('데이터 로드 실패', err);
        }
    };

    useEffect(() => {
        fetchEventData();
    }, []);

    // 3. 타임스탬프 변환 헬퍼 (좌측 피드 시간용)
    const formatTimestamp = (ts) => {
        const d = new Date(ts);
        const dateStr = d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\.$/, "");
        const timeStr = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
        return { dateStr, timeStr };
    };

    // 4. 방문 날짜 변환 (밀리초 -> 날짜)
    const formatVisitDate = (ts) => {
        return new Date(ts).toISOString().split('T')[0];
    };

    return (
        <div className="admin-dashboard-container">
            <header className="feed-header">
                <h2>실시간 이벤트 피드 ({eventList.length}건)</h2>
            </header>

            <div className="timeline-container">
                {eventList.map((item, index) => {
                    const { dateStr, timeStr } = formatTimestamp(item.reserved_at);
                    
                    return (
                        <div key={item.reservation_id} className="timeline-item">
                            {/* 좌측 날짜 영역 (reserved_at 기준) */}
                            <div className="timeline-date">
                                <span className="date-text">{dateStr}</span>
                                <span className="time-text">{timeStr}</span>
                                <div className={`timeline-dot ${index === 0 ? 'active' : ''}`} />
                                {index !== eventList.length - 1 && <div className="timeline-line" />}
                            </div>

                            {/* 우측 카드 영역 (실제 데이터 매핑) */}
                            <div className={`event-card ${item.status === 'completed' ? 'border-complete' : 'border-cancel'}`}>
                                <div className="card-header">
                                    <div className="title-group">
                                        <span className="business-name">{item.venue_name}</span>
                                        <span className="type-badge">
                                            {item.target_type === 'venue' ? '매장' : '스태프'}
                                        </span>
                                    </div>
                                    <span className={`status-badge status-${item.status}`}>
                                        {item.status === 'completed' ? '완료됨' : '취소됨 : 자동 취소'}
                                    </span>
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <span className="label">신청자:</span>
                                        <span className="value">{item.nickname}</span>
                                        <button className="detail-btn">상세보기</button>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">아이피:</span>
                                        <span className="value">
                                            {item.accessed_ip} (접속지역: {item.country_code}) 
                                            설정언어: {item.setting_language === 'KR' ? '🇰🇷' : '🌐'}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">예약 시간:</span>
                                        <span className="value">
                                            {formatVisitDate(item.real_visit_date)} {item.schedule_start_time} - {item.schedule_end_time}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">참석자 수:</span>
                                        <span className="value">{item.attendee}명</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">에스코트:</span>
                                        <span className="value">
                                            {item.use_escort ? `신청 (${item.escort_entrance}번입구)` : '신청 안함'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <LoadingScreen isVisible={isLoading} />
        </div>
    );
};

export default AdminApp;