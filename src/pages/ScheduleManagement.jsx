import React, { useState, useEffect } from 'react';
import axios from 'axios';

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchInput from '@components/SketchInput';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import SketchHeader from '@components/SketchHeader';
import { Calendar, Clock, User, MapPin, Plus, Edit, Trash2 } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import LoadingScreen from '@components/LoadingScreen';

const ScheduleManagement = ({
  navigateToPageWithData,
  PAGES,
  ...otherProps
}) => {
  const [schedules, setSchedules] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const API_HOST = import.meta.env.VITE_API_HOST;
  const { messages, isLoading: msgLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  useEffect(() => {
    window.scrollTo(0, 0);

    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }

    fetchSchedules();
  }, [user, messages, currentLang]);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      // TODO: 실제 API 엔드포인트로 변경
      const response = await axios.get(`${API_HOST}/api/getSchedules`);
      const data = response.data || [];
      setSchedules(data);
    } catch (error) {
      console.error('스케줄 정보 불러오기 실패:', error);
      // 임시 데이터로 테스트
      setSchedules([
        {
          id: 1,
          staff_name: '김스태프',
          date: '2024-01-15',
          start_time: '09:00',
          end_time: '17:00',
          venue: '강남점',
          status: 'confirmed'
        },
        {
          id: 2,
          staff_name: '이스태프',
          date: '2024-01-15',
          start_time: '14:00',
          end_time: '22:00',
          venue: '홍대점',
          status: 'pending'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    // 필터링 로직 구현
    console.log('Filter:', filterQuery, selectedDate);
  };

  const handleAddSchedule = () => {
    // 새 스케줄 추가 페이지로 이동
    navigateToPageWithData(PAGES.SCHEDULE_ADD, {});
  };

  const handleEditSchedule = (schedule) => {
    // 스케줄 수정 페이지로 이동
    navigateToPageWithData(PAGES.SCHEDULE_EDIT, { schedule });
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        // TODO: 실제 API 호출
        await axios.delete(`${API_HOST}/api/deleteSchedule/${scheduleId}`);
        fetchSchedules();
      } catch (error) {
        console.error('스케줄 삭제 실패:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return '확정';
      case 'pending': return '대기';
      case 'cancelled': return '취소';
      default: return '알 수 없음';
    }
  };

  return (
    <>
      <style jsx="true">{`
        .schedule-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          position: relative;
        }

        .content-section {
          padding: 1rem;
        }

        .filter-section {
          margin-bottom: 1.5rem;
          position: relative;
        }

        .filter-content {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .filter-input {
          flex: 1;
        }

        .filter-btn {
          white-space: nowrap;
        }

        .add-schedule-btn {
          margin-bottom: 1rem;
        }

        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .schedule-card {
          border: 2px solid #333;
          border-radius: 8px 12px 6px 10px;
          padding: 1rem;
          background-color: #f8fafc;
          position: relative;
          transform: rotate(-0.5deg);
        }

        .schedule-card:nth-child(even) {
          transform: rotate(0.5deg);
        }

        .schedule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .staff-name {
          font-size: 1.1rem;
          font-weight: bold;
          color: #1f2937;
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: bold;
          color: white;
        }

        .schedule-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: #4b5563;
        }

        .schedule-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .action-btn {
          padding: 0.25rem 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background-color: white;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background-color: #f3f4f6;
        }

        .action-btn.edit {
          color: #059669;
        }

        .action-btn.delete {
          color: #dc2626;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .empty-state h3 {
          margin-bottom: 0.5rem;
          color: #374151;
        }
      `}</style>

      <div className="schedule-container">
        <SketchHeader 
          title={get('Schedule1.1') || '스케줄 관리'} 
          showBack={false} 
          rightButtons={[]} 
        />

        <div className="content-section">
          <SketchDiv className="filter-section">
            <HatchPattern opacity={0.02} />
            <div className="filter-content">
              <div className="filter-input">
                <SketchInput
                  type="text"
                  placeholder={get('Schedule1.2') || '스태프명 검색'}
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                />
              </div>
              <div className="filter-input">
                <SketchInput
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <SketchBtn
                variant="event"
                size="small"
                onClick={handleFilter}
                className="filter-btn"
              >
                <HatchPattern opacity={0.8} />
                {get('btn.search.1') || '검색'}
              </SketchBtn>
            </div>
          </SketchDiv>

          <SketchBtn
            variant="primary"
            size="medium"
            onClick={handleAddSchedule}
            className="add-schedule-btn"
          >
            <HatchPattern opacity={0.8} />
            <Plus size={16} />
            {get('Schedule1.3') || '새 스케줄 추가'}
          </SketchBtn>

          <div className="schedule-list">
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <SketchDiv key={schedule.id} className="schedule-card">
                  <HatchPattern opacity={0.02} />
                  <div className="schedule-header">
                    <div className="staff-name">{schedule.staff_name}</div>
                    <div 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(schedule.status) }}
                    >
                      {getStatusText(schedule.status)}
                    </div>
                  </div>
                  
                  <div className="schedule-details">
                    <div className="detail-item">
                      <Calendar size={14} />
                      {schedule.date}
                    </div>
                    <div className="detail-item">
                      <Clock size={14} />
                      {schedule.start_time} - {schedule.end_time}
                    </div>
                    <div className="detail-item">
                      <User size={14} />
                      {schedule.staff_name}
                    </div>
                    <div className="detail-item">
                      <MapPin size={14} />
                      {schedule.venue}
                    </div>
                  </div>

                  <div className="schedule-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditSchedule(schedule)}
                    >
                      <Edit size={12} />
                      수정
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 size={12} />
                      삭제
                    </button>
                  </div>
                </SketchDiv>
              ))
            ) : (
              <SketchDiv className="schedule-card">
                <HatchPattern opacity={0.02} />
                <div className="empty-state">
                  <h3>{get('Schedule1.4') || '등록된 스케줄이 없습니다'}</h3>
                  <p>{get('Schedule1.5') || '새 스케줄을 추가해보세요'}</p>
                </div>
              </SketchDiv>
            )}
          </div>
        </div>

        <LoadingScreen 
          isVisible={isLoading || msgLoading} 
        />
      </div>
    </>
  );
};

export default ScheduleManagement; 