import React, { useState, useEffect } from 'react';
import ApiClient from '@utils/ApiClient';
import LoadingScreen from '@components/LoadingScreen';
import './AdminApp.css';

const AdminApp = () => {
    const [eventList, setEventList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 데이터 가져오기 및 정렬
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

            const rawData = res.data || [];
            // 최신순 정렬
            const sortedData = [...rawData].sort((a, b) => b.reserved_at - a.reserved_at);
            setEventList(sortedData);

        } catch (err) {
            console.error('Data load failed', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEventData();
    }, []);

    // 날짜/시간 포맷 분리 함수
    const getDateInfo = (ts) => {
        const d = new Date(ts);
        const dateStr = d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\.$/, "");
        const timeStr = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
        return { dateStr, timeStr };
    };

    // 예약 시간 포맷
    const formatSchedule = (dateStr, start, end) => {
        // dateStr이 타임스탬프라면 변환
        const d = new Date(dateStr);
        const yyyymmdd = d.toISOString().split('T')[0];
        return `${yyyymmdd} ${start} - ${end}`;
    };

    return (
        <div className="booking-status-content">
            {/* 상단 타이틀 (스타일은 기존 유지 혹은 css에 .events-title 추가) */}
            <div style={{ padding: '20px 20px 0', maxWidth: '800px' }}>
                <h2 style={{ 
                    background: '#4b6584', color: 'white', padding: '12px', 
                    borderRadius: '8px', fontSize: '18px', margin: 0 
                }}>
                    실시간 이벤트 피드 ({eventList.length}건)
                </h2>
            </div>

            <ul className="timeline-list">
                {eventList.map((item, index) => {
                    // 상태값 확인
                    const isCompleted = item.status === 'completed';
                    const themeColor = isCompleted ? '#6c757d' : '#eb4d4b'; // 회색 vs 빨강
                    const { dateStr, timeStr } = getDateInfo(item.reserved_at);

                    return (
                        <li key={item.reservation_id} className="timeline-item">
                            
                            {/* 1. 왼쪽: 날짜/시간 */}
                            <div className="timeline-left">
                                <span className="timeline-date">{dateStr}</span>
                                <span className="timeline-time">{timeStr}</span>
                            </div>

                            {/* 2. 중앙: 점과 선 */}
                            <div className="timeline-center">
                                {/* 점 (테마 색상 적용) */}
                                <div className="timeline-dot" style={{ backgroundColor: themeColor }}></div>
                                {/* 선 */}
                                <div className="timeline-line"></div>
                            </div>

                            {/* 3. 오른쪽: 카드 컨텐츠 */}
                            <div className="timeline-right">
                                <div className="event-card" style={{ borderLeftColor: themeColor }}>
                                    
                                    {/* 카드 헤더 */}
                                    <div className="card-header">
                                        <div className="card-title-group">
                                            <span className="store-name">{item.venue_name}</span>
                                            <span className="store-type">
                                                {item.target_type === 'venue' ? '매장' : '스태프'}
                                            </span>
                                        </div>
                                        <span className="status-badge" style={{ backgroundColor: themeColor }}>
                                            {isCompleted ? '완료됨' : '취소됨 : 자동 취소'}
                                        </span>
                                    </div>

                                    {/* 카드 바디 */}
                                    <div className="card-body">
                                        <div className="info-row">
                                            <span className="info-label">신청자:</span>
                                            {item.nickname}
                                            <button className="detail-btn">상세보기</button>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">아이피:</span>
                                            {item.accessed_ip} 
                                            (접속지역: <img src={`https://flagcdn.com/16x12/${item.country_code?.toLowerCase() || 'un'}.png`} alt="flag" style={{verticalAlign:'middle'}} /> 
                                             설정언어: {item.setting_language === 'KR' ? '🇰🇷' : '🌐'})
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">예약 시간:</span>
                                            {formatSchedule(item.real_visit_date, item.schedule_start_time, item.schedule_end_time)}
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">참석자 수:</span>
                                            {item.attendee}명
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">에스코트:</span>
                                            {item.use_escort ? `신청 (${item.escort_entrance}번입구)` : '신청 안함'}
                                        </div>
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