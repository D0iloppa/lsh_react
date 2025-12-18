import React, { useState, useEffect } from 'react';
import ApiClient from '@utils/ApiClient';
import LoadingScreen from '@components/LoadingScreen';
import './AdminApp.css';

const AdminApp = () => {
    const [eventList, setEventList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchEventData = async () => {
        setIsLoading(true);
        try {
            const today = new Date();
            const sevenDaysLater = new Date(today);
            sevenDaysLater.setDate(today.getDate() + 7);

            const res = await ApiClient.get('/api/getBookingStatusChart', {
                params: {
                    startDate: '2025-08-17',
                    endDate: sevenDaysLater.toISOString().split('T')[0]
                }
            });
            setEventList(res.data || []);
        } catch (err) {
            console.error('Data load failed', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEventData();
    }, []);

    const formatFullDate = (ts) => {
        const d = new Date(ts);
        const dateStr = d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const timeStr = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${dateStr} ${timeStr}`;
    };

    return (
        <div className="booking-status-content">
            <header className="events-title">
                실시간 이벤트 피드 ({eventList.length}건)
            </header>

            <ul className="push-list" style={{ listStyle: 'none', padding: 0 }}>
                {eventList.map((item, index) => {
                    // 상태에 따른 색상 결정
                    const isCompleted = item.status === 'completed';
                    const themeColor = isCompleted ? '#6c757d' : '#dc3545';

                    return (
                        <li key={item.reservation_id} className="timeline-item" data-reservation-id={item.reservation_id}>
                            {/* 1. 시간 영역 */}
                            <div className="timeline-time-section">
                                <div className="timeline-time-text">{formatFullDate(item.reserved_at)}</div>
                                <div className="timeline-dot" style={{ backgroundColor: themeColor }}></div>
                            </div>

                            {/* 2. 연결 선 */}
                            {index !== eventList.length - 1 && <div className="timeline-connector"></div>}

                            {/* 3. 콘텐츠 카드 영역 */}
                            <div className="timeline-content" style={{ borderLeft: `4px solid ${themeColor}` }}>
                                <div className="timeline-header">
                                    <div className="timeline-title-group">
                                        <span className="timeline-title">{item.venue_name}</span>
                                        <span className="timeline-type-badge">
                                            {item.target_type === 'venue' ? '매장' : '스태프'}
                                        </span>
                                    </div>
                                    <span className="timeline-status-badge" style={{ backgroundColor: themeColor }}>
                                        {isCompleted ? '완료됨' : '취소됨 : 자동 취소'}
                                    </span>
                                </div>

                                <div className="timeline-details">
                                    <div className="timeline-user-info">
                                        <strong>신청자:</strong> {item.nickname}
                                        <button className="member-detail-btn" style={{ marginLeft: '8px', border: 'none', background: '#e9ecef', color: '#495057', borderRadius: '3px', cursor: 'pointer' }}>
                                            상세보기
                                        </button>
                                    </div>

                                    <div className="timeline-access-info">
                                        <strong>아이피:</strong> {item.accessed_ip}
                                        <span>(접속지역: <img src={`https://flagcdn.com/16x12/${item.country_code?.toLowerCase() || 'un'}.png`} alt="flag" width="20" height="15" />)</span>
                                        <span>설정언어: {item.setting_language === 'KR' ? '🇰🇷' : '🌐'}</span>
                                    </div>

                                    <div className="timeline-time-info">
                                        <strong>예약 시간:</strong> {new Date(item.real_visit_date).toISOString().split('T')[0]} {item.schedule_start_time} - {item.schedule_end_time}
                                    </div>

                                    <div><strong>참석자 수:</strong> {item.attendee}명</div>
                                    <div>
                                        <strong>에스코트:</strong> {item.use_escort ? `신청 (${item.escort_entrance}번입구)` : '신청 안함'}
                                    </div>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <LoadingScreen isVisible={isLoading} />
        </div>
    );
};

export default AdminApp;