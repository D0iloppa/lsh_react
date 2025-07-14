import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';
import { Calendar } from 'lucide-react';
import HatchPattern from '@components/HatchPattern';

import { useAuth } from '@contexts/AuthContext';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';

import Swal from 'sweetalert2';

const StaffWorkScheduleCreate = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const { user, isLoggedIn } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [weekData, setWeekData] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [weekInfo, setWeekInfo] = useState({
    monday_start: false,
    week_offset: 0,
    start_date: '',
    week_dates: []
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (messages && Object.keys(messages).length > 0) {
      window.scrollTo(0, 0);
    }

    const {mode, staff_id, start_date, scheduleData: initialScheduleData} = otherProps;

    console.log('pageData', mode, staff_id, start_date, initialScheduleData);

    // scheduleData가 있으면 초기 데이터로 설정
    if (initialScheduleData && Array.isArray(initialScheduleData)) {
      setScheduleData(initialScheduleData);
      setWeekData(initialScheduleData); // 원본 데이터를 그대로 사용
      setIsLoadingData(false);
    } else {
      // scheduleData가 없으면 빈 배열로 초기화
      setScheduleData([]);
      setWeekData([]);
      setIsLoadingData(false);
    }
  }, [messages, currentLang, pageData]);

  // 날짜 포맷팅
  const formatDateRange = () => {
    if (weekData.length >= 2) {
      const startDate = new Date(weekData[0]?.work_date);
      const endDate = new Date(weekData[6]?.work_date);
      
      const formatDate = (date) => {
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
      };
      
      return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
    }
    return '';
  };

  // 시간 옵션 생성
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hourStr = String(i).padStart(2, '0');
    return { value: `${hourStr}:00:00`, label: `${i}` };
  });

  const handleSave = async () => {
    try {
      
      // Java 코드에 맞춰 필요한 필드만 포함하여 저장
      const formattedData = weekData.map(item => {
        return {
          date: item.work_date,
          start: item.start_time || '',
          end: item.end_time || '',
          status: item.status || 'dayoff',
          on: Boolean(item.status !== null && 
                     item.status !== 'dayoff' &&
                     item.start_time && 
                     item.end_time)
        };
      });
      
      const jsonDataStr = JSON.stringify(formattedData);
      console.log('jsonDataStr:', jsonDataStr);

      const payload = {
        staff_id: user?.staff_id,
        jsonData: encodeURIComponent(jsonDataStr)
      }

      const response = await ApiClient.postForm('/api/upsertStaffSchedule', payload);
      console.log('response:', response);


      Swal.fire({
        title: get('schedule.save.success.title'),
        text: get('schedule.save.success.message'),
        icon: 'success',
        confirmButtonText: get('Common.Confirm')
      })
      
    } catch (error) {
      console.error(get('schedule.save.error') + ':', error);
    }
  };

  if (isLoadingData) {
    return (
      <div className="workschedulecreate-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>{get('schedule.loading.week')}</div>
        </div>
      </div>
    );
  }

  const days = weekInfo.monday_start 
    ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


    // 날짜 비교 유틸리티 함수
  const isPastDate = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString < today;
  };

  const isTodayOrFuture = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString >= today;
  };

  return (
    <>
      <style jsx="true">{`
        .workschedule-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          padding: 0.3rem;
        }
        .week-title {
          padding-bottom: 1rem;
          border-bottom: 1px solid #cccccc;
          font-size: 1.3rem;
          font-weight: 600;
          margin: 1.1rem 0 1rem 0;
          text-align: center;
          color: #222;
        }
        .week-range {
          font-size: 0.92rem;
          color: #6b7280;
          margin-bottom: 0.7rem;
          margin-top: 0.1rem;
        }
        .week-row {
          display: grid;
          grid-template-columns: 80px 70px 55px 45px 25px 45px;
          align-items: center;
          margin-bottom: 0.7rem;
          min-height: 2.3rem;
          gap: 0.13rem;
          width: 100%;
          flex-wrap: nowrap;
          margin-left: 20px;
        }
        .week-day {
          font-size: 1.1rem;
          font-weight: 600;
          color: #222;
          white-space: nowrap;
        }
        .week-onoff {
          width: 1.0rem;
          padding-left: 2rem;
        }
        .week-hours {
          display: contents;
        }
        .hours-label {
          font-size: 0.97rem;
          color: #222;
          margin-left: 1.5rem;
          min-width: 40px;
        }
        .to-label {
          font-size: 0.97rem;
          color: #222;
          text-align: center;
          margin-right: 13px;
        }
        .week-hours select{
          //margin-left: 0.6rem;
          // text-align: right;
        }
        .select-style {
          height: 27px;
          width: 50px;
          min-width: 50px;
          max-width: 50px;
          font-size: 0.93rem;
          border-radius: 3px;
          padding: 0.08rem 0.3rem 0.08rem 0.2rem;
          border: 0.8px solid #666;
          background: #fff;
          color: #222;
          box-sizing: border-box;
        }
        .select-style:focus {
          outline: none;
          border-color: #2bb4bb;
        }
        .save-btn-row {
          margin: 1.1rem 0 0.5rem 0;
          display: flex;
          justify-content: center;
        }
        .save-btn {
          width: 100%;
          max-width: 320px;
          font-size: 1.01rem;
          font-family: inherit;
          border-radius: 0;
          border: 1.2px solid #222;
          background: #f8f8f8;
          color: #222;
          font-weight: 600;
          letter-spacing: 0.01em;
          box-shadow: none;
          padding: 0.5rem 0;
        }
        .save-btn:active {
          background: #ecec;
        }
        @media (max-width: 500px) {
          // .workschedule-container {
          //   padding: 0 0.1rem 1rem 0.1rem;
          // }
          .week-row {
            grid-template-columns: 60px 54px 40px 36px 18px 36px;
          }
          .week-day {
            font-size: 0.91rem;
          }
        }
      `}</style>
      <SketchHeader
        title={<><Calendar size={20} style={{marginRight:'7px',marginBottom:'-3px'}}/>{get('schedule.work.title')}</>}
        showBack={true}
        onBack={goBack}
      />
      <div className="workschedule-container">
        <div className="week-title">{get('schedule.weekly.title')}</div>
        <div>
          {weekData.map((dayData, index) => {
              const day = days[index];
              const isPast = isPastDate(dayData.work_date);

             // status와 시간 값만으로 on 상태 계산
            const isOn = dayData.status !== null && 
                        dayData.status !== 'dayoff' &&
                        dayData.start_time && 
                        dayData.end_time;
            
            return (
              <div key={`${dayData?.work_date || index}`} className={`week-row ${isPast ? 'past-row' : ''}`}>
                <div className="week-day">
                  <span>{day}</span>
                  <span>({parseInt(dayData.work_date.split('-')[2])})</span>
                  </div>
                <div className="week-onoff">
                  <select 
                    value={isOn ? 'on' : 'off'} 
                    onChange={e => {
                      // 과거 날짜는 수정 불가
                      if (isPast) {
                        Swal.fire({
                          title: get('SCHEDULE_PAST_EDIT_ERROR_TITLE') || '과거 스케줄 수정 불가',
                          text: get('SCHEDULE_PAST_EDIT_ERROR_MESSAGE') || '과거 날짜의 스케줄은 수정할 수 없습니다.',
                          icon: 'warning',
                          confirmButtonText: get('SCHEDULE_MODAL_OK')
                        });
                        return;
                      }

                      const newWeekData = [...weekData];
                      if (e.target.value === 'on') {
                        newWeekData[index] = { 
                          ...dayData, 
                          status: 'pending',
                          start_time: dayData.start_time || '00:00:00',
                          end_time: dayData.end_time || '01:00:00'
                        };
                      } else {
                        newWeekData[index] = { 
                          ...dayData, 
                          status: 'dayoff',
                          start_time: '',
                          end_time: ''
                        };
                      }
                      setWeekData(newWeekData);
                    }} 
                    className={`select-style ${isPast ? 'disabled' : ''}`}
                    disabled={isPast}
                  >
                    <option value="on">{get('schedule.status.on')}</option>
                    <option value="off">{get('schedule.status.off')}</option>
                  </select>
                </div>
                {isOn && (
                  <div className="week-hours">
                    <div style={{marginLeft:'0.6rem', display:'flex',alignItems:'center'}}>
                      <span className="hours-label">{get('schedule.hours.label')}</span>
                      <select 
                        value={dayData?.start_time || ''} 
                         onChange={e => {
                          // 과거 날짜는 수정 불가
                          if (isPast) {
                            Swal.fire({
                              title: get('SCHEDULE_PAST_EDIT_ERROR_TITLE') || '과거 스케줄 수정 불가',
                              text: get('SCHEDULE_PAST_EDIT_ERROR_MESSAGE') || '과거 날짜의 스케줄은 수정할 수 없습니다.',
                              icon: 'warning',
                              confirmButtonText: get('SCHEDULE_MODAL_OK')
                            });
                            return;
                          }

                          const newWeekData = [...weekData];
                          newWeekData[index] = { ...dayData, start_time: e.target.value };
                          setWeekData(newWeekData);
                        }} 
                        className={`select-style ${isPast ? 'disabled' : ''}`}
                        disabled={isPast}
                      >
                        <option value="">--</option>
                        {hourOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{marginLeft:'6.2rem', display:'flex',alignItems:'center'}}>
                      <span className="to-label">{get('schedule.time.to')}</span>
                      <select 
                          value={dayData?.end_time || ''} 
                          onChange={e => {
                            // 과거 날짜는 수정 불가
                            if (isPast) {
                              Swal.fire({
                                title: get('SCHEDULE_PAST_EDIT_ERROR_TITLE') || '과거 스케줄 수정 불가',
                                text: get('SCHEDULE_PAST_EDIT_ERROR_MESSAGE') || '과거 날짜의 스케줄은 수정할 수 없습니다.',
                                icon: 'warning',
                                confirmButtonText: get('SCHEDULE_MODAL_OK')
                              });
                              return;
                            }

                            const newWeekData = [...weekData];
                            newWeekData[index] = { ...dayData, end_time: e.target.value };
                            setWeekData(newWeekData);
                          }} 
                          className={`select-style ${isPast ? 'disabled' : ''}`}
                          disabled={isPast}
                        >
                          <option value="">{get('common.select.empty')}</option>
                          {hourOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="save-btn-row">
          <SketchBtn className="save-btn" variant="event" onClick={handleSave}>
          <HatchPattern opacity={0.4} /> {get('schedule.save.button')}
        </SketchBtn>
        </div>
      </div>
    </>
  );
};

export default StaffWorkScheduleCreate;