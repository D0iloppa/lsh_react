import React, { useState, useEffect } from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import AgreementCheckbox from '@components/AgreementCheckbox';

import '@components/SketchComponents.css';
import SketchHeader from '@components/SketchHeader';
import ApiClient from '@utils/ApiClient';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import LoadingScreen from '@components/LoadingScreen';

// 새로운 컴포넌트 import
import { 
  ReservationForm, 
  generateTimeSlots,
  weeklyTableStyles  // CSS 스타일
} from '@components/ReservationComponents';

import { useAuth } from '../contexts/AuthContext';

import Swal from 'sweetalert2';
  

const ReservationPage = ({ navigateToPageWithData, goBack, PAGES, ...otherProps }) => {
  const { target, id } = otherProps || {};
  const { user } = useAuth();

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // 상태들 - Duration 방식으로 변경
  const [attendee, setAttendee] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [memo, setMemo] = useState(''); // 메모 상태 추가
  const [bookerName, setBookerName] = useState('');
  
  // Duration 기반 예약 데이터
  const [reservationData, setReservationData] = useState({
    startTime: '',
    duration: null,
    endTime: null
  });

  const [note, setNote] = useState('');
  const [baseDate] = useState(new Date()); // 오늘 날짜 고정
  const [scheduleData, setScheduleData] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [targetName, setTargetName] = useState('');
  const [pickupService, setPickupService] = useState(false);
  const [useStaffService, setUseStaffService] = useState(false);
  

  // 체크박스 상태들
  const [agreements, setAgreements] = useState({
    allTerms: false,
    ageConfirm: false,
    personalInfo: false,
    thirdParty: false
  });

  // 체크박스 변경 핸들러
  const handleAgreementChange = (key, checked) => {
     if (key === 'allTerms') {
      // 전체 동의를 클릭했을 때 모든 항목을 같은 상태로 변경
      setAgreements({
        allTerms: checked,
        ageConfirm: checked,
        personalInfo: checked,
        thirdParty: checked
      });
    } else {
      // 개별 항목을 클릭했을 때
      const newAgreements = {
        ...agreements,
        [key]: checked
      };
      
      // 개별 항목들이 모두 체크되었는지 확인하여 전체 동의도 업데이트
      const individualItems = ['ageConfirm', 'personalInfo', 'thirdParty'];
      const allIndividualChecked = individualItems.every(item => newAgreements[item]);
      
      newAgreements.allTerms = allIndividualChecked;
      
      setAgreements(newAgreements);
    }
  };

// 모든 체크박스가 체크되었는지 확인
const isAllAgreed = () => {
  return Object.values(agreements).every(value => value === true);
};

  const [timeSlots, setTimeSlots] = useState([]);
  const [disabledTimes, setDisabledTimes] = useState([]);
  
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  const [shouldAutoSelect, setShouldAutoSelect] = useState(false);

  useEffect(() => {
  const resetContentAreaScroll = () => {
    // 진짜 스크롤 컨테이너인 .content-area를 리셋
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      contentArea.scrollTop = 0;
      console.log('content-area 스크롤이 0으로 리셋됨');
    }
    
    // window도 함께 (혹시 모르니)
    window.scrollTo(0, 0);
  };

  resetContentAreaScroll();
  
  // DOM 렌더링 완료 후 한 번 더
  setTimeout(resetContentAreaScroll, 100);
  
}, [id, target]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (messages && Object.keys(messages).length > 0) {
      window.scrollTo(0, 0);
    }

    if (target && id) {
      loadScheduleData().then((res) => {
        setScheduleData(res);
        if (!selectedDate) {
          setShouldAutoSelect(true); // 자동 선택 플래그
        }
      });
    }
  }, [target, id, messages, currentLang]);

  // scheduleData 업데이트 완료 후 실행
  useEffect(() => {
    if (shouldAutoSelect && Object.keys(scheduleData).length > 0) {
      const today = new Date().toISOString().split('T')[0];
      console.log('DEFAULT SELECT with complete data:', today, scheduleData);
      handleDateSelect(today, 1);
      setShouldAutoSelect(false);
    }
  }, [scheduleData, shouldAutoSelect]);

  const getTargetLabel = () => {
    const {staff={}} = otherProps;
    const {venueInfo = false, scheduleList = []}  = scheduleData;
    console.log('gtl', otherProps);

    let _targetName = (target=='staff') ? staff.name : venueInfo.name;
    setTargetName(_targetName)
    return _targetName;

  }

  const loadScheduleData = () => {
    return new Promise((resolve, reject) => {
      console.log('load', target, id);
      
      setIsLoadingSchedule(true);
      
      ApiClient.postForm('/api/schedule', {  // data
        target: target,
        target_id: id
      })
      .then(response => {
        console.log('✅ Schedule loaded:', response);
        setScheduleData(response || {});
        setErrorMsg(null);
        setIsLoadingSchedule(false);
        resolve(response); // 성공 시 resolve
      })
      .catch(error => {
        console.error('❌ Failed to load schedule:', error);
        setScheduleData({});
        setErrorMsg(error.message);
        setIsLoadingSchedule(false);
        reject(error); // 실패 시 reject
      });
    });
  };

  const handleBack = () => {
    goBack();
  }

  const handleDateSelect = (fullDate, dayNumber) => {
    setSelectedDate(fullDate);
    
    // 날짜 변경시 예약 데이터 초기화
    setReservationData({
      startTime: '',
      duration: null,
      endTime: null
    });

    console.log('check-schedule', scheduleData);

    const {venueInfo = false, scheduleList = []}  = scheduleData;
    
    // 1. venue-info에 의한 timeSlot 설정
    let disabledTimes = [];

    if(venueInfo){
      let {open_time, close_time} = venueInfo;
      
      open_time = open_time.split(':')[0];
      open_time = Number.parseInt(open_time);
      close_time = close_time.split(':')[0];
      close_time = Number.parseInt(close_time);

      console.log('🕐 Venue hours:', open_time, close_time);

      const venueTimeSlots = generateTimeSlots(open_time, close_time);
      setTimeSlots(venueTimeSlots); // timeSlots 상태 업데이트
    }

    try {
      // 1. 지난 시간인지 확인
      const today = new Date().toISOString().split('T')[0];
      
      if (fullDate === today) {
        const currentHour = new Date().getHours();
        console.log('🕐 Current hour:', currentHour, 'for date:', fullDate);

        let _open_time = venueInfo.open_time
        _open_time = _open_time.split(':')[0];
        _open_time = Number.parseInt(_open_time);
        
        // 현재 시간까지 비활성화
        for (let hour = _open_time; hour <= currentHour; hour++) {
          const timeString = hour.toString().padStart(2, '0') + ':00';
          disabledTimes.push(timeString);
        }
        
        console.log('⏰ Past times disabled:', disabledTimes);
      }
    
      // 2. 예약 가능한 리스트에 존재하는지 확인
      let scheduleList_filter = scheduleList.filter(i => i.work_date == fullDate);
      console.log('📅 Schedule list for', fullDate, ':', scheduleList_filter);
      
      if (scheduleList_filter.length > 0) {
        // scheduleList에서 time 필드들을 추출하여 가능한 시간 리스트 생성
        const availableTimes = scheduleList_filter
          .map(schedule => schedule.time) // time 필드 추출
          .filter(time => time && time !== '') // null, undefined, 빈 문자열 제거
          .map(time => {
            // 시간 형식 통일 (HH:mm:ss -> HH:00 형태로)
            if (time.includes(':')) {
              const hour = time.split(':')[0];
              return hour.padStart(2, '0') + ':00';
            }
            return time;
          });
        
        // 중복 제거
        const uniqueAvailableTimes = [...new Set(availableTimes)];
        console.log('📋 Available times from schedule list:', uniqueAvailableTimes);
        
        if (uniqueAvailableTimes.length > 0) {
          // 전체 시간대 생성 (venue의 운영시간 기준으로 변경)
          const allPossibleTimes = generateTimeSlots(
            parseInt(venueInfo.open_time.split(':')[0]), 
            parseInt(venueInfo.close_time.split(':')[0])
          );
          console.log('🕐 All possible times format:', allPossibleTimes.slice(0, 3)); // 형식 확인용
          
          // 가능한 시간 리스트에 없는 시간들을 비활성화
          allPossibleTimes.forEach(timeSlot => {
            if (!uniqueAvailableTimes.includes(timeSlot)) {
              disabledTimes.push(timeSlot);
            }
          });
          
          console.log('🚫 Times not in available list:', 
            allPossibleTimes.filter(time => !uniqueAvailableTimes.includes(time))
          );
          console.log('✅ Available times that match:', 
            allPossibleTimes.filter(time => uniqueAvailableTimes.includes(time))
          );
        } else {
          console.warn('⚠️ No valid times found in schedule list for', fullDate);
          // 가능한 시간이 없으면 모든 시간 비활성화
          const allTimes = generateTimeSlots(
            parseInt(venueInfo.open_time.split(':')[0]), 
            parseInt(venueInfo.close_time.split(':')[0])
          );
          disabledTimes.push(...allTimes);
        }
      } else {
        console.log('ℹ️ No schedule found for', fullDate);
        // 스케줄이 없으면 모든 시간 비활성화
        const allTimes = generateTimeSlots(
          parseInt(venueInfo.open_time.split(':')[0]), 
          parseInt(venueInfo.close_time.split(':')[0])
        );
        disabledTimes.push(...allTimes);
      }
    
    } catch (error) {
      console.error('❌ Error calculating disabled times:', error);
    }
    
    // 중복 제거 및 정렬
    const uniqueDisabledTimes = [...new Set(disabledTimes)].sort();
    console.log('🔒 Final disabled times:', uniqueDisabledTimes);
    
    setDisabledTimes(uniqueDisabledTimes);
  };

  // Duration 기반 시간 선택 핸들러
  const handleTimeSelect = (timeData) => {
    console.log('Time selection data:', timeData);
    setReservationData(timeData);
  };

  // 유효성 검사 및 포커스 이동 함수
  const validateAndFocus = () => {
    const messages_validation = getReservationMessages();
    
    // 1. 참석자 확인
    if (!attendee) {
      const attendeeElement = document.querySelector('.attendee-select');
      if (attendeeElement) {
        attendeeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        setTimeout(() => {
          attendeeElement.focus();
          // 시각적 강조 효과
          attendeeElement.style.borderColor = '#ef4444';
          attendeeElement.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
          setTimeout(() => {
            attendeeElement.style.borderColor = '#1f2937';
            attendeeElement.style.boxShadow = 'none';
          }, 2000);
        }, 300);
      }
      //alert(messages_validation.attendeeRequired || '참석자 수를 선택해주세요.');

             Swal.fire({
              title: messages_validation.attendeeRequired,
              icon: 'warning',
              confirmButtonText: get('SWAL_CONFIRM_BUTTON')
            });


      return { isValid: false, field: 'attendee' };
    }

    // 2. 날짜 확인
    if (!selectedDate) {
      const dateElement = document.querySelector('.weekly-table');
      if (dateElement) {
        dateElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // 날짜 테이블 강조 효과
        setTimeout(() => {
          dateElement.style.borderColor = '#ef4444';
          dateElement.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
          setTimeout(() => {
            dateElement.style.borderColor = 'transparent';
            dateElement.style.boxShadow = 'none';
          }, 2000);
        }, 300);
      }
      //alert(messages_validation.dateRequired || '날짜를 선택해주세요.');

            Swal.fire({
              title: messages_validation.dateRequired,
              icon: 'warning',
              confirmButtonText: get('SWAL_CONFIRM_BUTTON')
            });

      return { isValid: false, field: 'date' };
    }

    // 3. 시작 시간 확인
    if (!reservationData.startTime) {
      const timeGridElement = document.querySelector('.time-grid');
      if (timeGridElement) {
        timeGridElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // 시간 그리드 강조 효과
        setTimeout(() => {
          timeGridElement.style.borderColor = '#ef4444';
          timeGridElement.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
          setTimeout(() => {
            timeGridElement.style.borderColor = 'transparent';
            timeGridElement.style.boxShadow = 'none';
          }, 2000);
        }, 300);
      }
      //alert(messages_validation.startTimeRequired || '시작 시간을 선택해주세요.');

            Swal.fire({
              title: messages_validation.startTimeRequired,
              icon: 'warning',
              confirmButtonText: get('SWAL_CONFIRM_BUTTON')
            });

      return { isValid: false, field: 'startTime' };
    }

    // 4. 이용 시간 확인
    if (!reservationData.duration) {
      const durationElement = document.querySelector('.duration-selector');
      if (durationElement) {
        durationElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // 이용시간 선택기 강조 효과
        setTimeout(() => {
          durationElement.style.borderColor = '#ef4444';
          durationElement.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
          setTimeout(() => {
            durationElement.style.borderColor = 'transparent';
            durationElement.style.boxShadow = 'none';
          }, 2000);
        }, 300);
      }
      //alert(messages_validation.durationRequired || '이용 시간을 선택해주세요.');

            Swal.fire({
              title: messages_validation.durationRequired,
              icon: 'warning',
              confirmButtonText: get('SWAL_CONFIRM_BUTTON')
            });

      return { isValid: false, field: 'duration' };
    }

    return { isValid: true };
  };
  

const handleReserve = async () => {
 // 유효성 검사 및 포커스 이동
    const validationResult = validateAndFocus();
    if (!validationResult.isValid) {
      return; // 유효성 검사 실패 시 예약 진행하지 않음
    }

    console.log("reservationData",reservationData);
    // Duration 방식의 예약 처리 로직
    const legacyData = {
      user,
      user_id : user.user_id,
      target: target,
      target_id: id,
      attendee,
      selectedDate,
      selectedTime: reservationData.startTime,
      duration: reservationData.duration,
      endTime: reservationData.endTime,
      pickupService: pickupService,
      useStaffService: useStaffService,
      memo: memo 
    };
    
    navigateToPageWithData(PAGES.RESERVATION_SUM, {
      reserve_data : legacyData
    });
};

  // 예약 가능 여부 체크
  const isReservationValid = () => {
    return attendee && selectedDate && reservationData.startTime && reservationData.duration;
  };

  // Duration 컴포넌트에서 사용할 다국어 메시지 정리
  const getReservationMessages = () => {
    return {

      bookerLabel: get('RESERVATION_CLIENT_LABEL') || 'Booker',
      // AttendeeSelector 메시지들
      attendeeLabel: get('Reservation.AttendeeLabel') || 'Attendee',
      selectPeople: get('Reservation.SelectPeople') || 'Select number of people',
      onePerson: get('Reservation.OnePerson') || '1 person',
      twoPeople: get('Reservation.TwoPeople') || '2 people',
      threePeople: get('Reservation.ThreePeople') || '3 people',
      fourPeople: get('Reservation.FourPeople') || '4 people',
      fivePlusePeople: get('Reservation.FivePlusPeople') || '5+ people',
      
      // WeeklyTableComponent 메시지들
      selectDateLabel: get('Reservation.SelectDateLabel') || 'Select Date',
      
      // DurationBasedTimeSelector 메시지들
      timeAndDurationLabel: get('Reservation.TimeAndDurationLabel') || '시간 및 이용시간 선택',
      hourUnit: get('Reservation.HourUnit') || '시간',
      selectDurationWarning: get('Reservation.SelectDurationWarning') || '시작 시간을 선택했습니다. 이용 시간을 선택해주세요.',
      
      // DurationSelector 메시지들
      durationSelectLabel: get('Reservation.DurationSelectLabel') || '부터 이용 시간 선택',
      reservationTimeLabel: get('Reservation.ReservationTimeLabel') || '예약 시간',
      
      // TimeSlotSelector 메시지들 (기존 호환성)
      chooseTimeLabel: get('Reservation.ChooseTimeLabel') || 'Choose Time',

      // MemoSelector 메시지들
      memoLabel: get('Reservation.MemoLabel') || 'Memo',
      memoPlaceholder: get('Reservation.MemoPlaceholder') || '추가 요청사항이나 메모를 입력해주세요...',

      // Validation 메시지들
      attendeeRequired: get('Validation.AttendeeRequired') || '참석자 수를 선택해주세요.',
      dateRequired: get('Validation.DateRequired') || '날짜를 선택해주세요.',
      startTimeRequired: get('Validation.StartTimeRequired') || '시작 시간을 선택해주세요.',
      durationRequired: get('Validation.DurationRequired') || '이용 시간을 선택해주세요.',

      targetLabel:get('BookingSum.Target'),
      pickupOption:get('reservation.escort.1'),
      pickupInfo: get('reservation.escort.title'),
      pickupInfo1:get('reservation.escort.info1'),
      pickupInfo2:get('reservation.escort.info2'),
      pickupInfo3:get('reservation.escort.info3'),
      pickupInfo4:get('reservation.escort.info4'),
      staff_info:get('STAFF_MSG_1'),
      rev_target:target
    };
  };

  return (
    <>
      <style jsx="true">{`
        ${weeklyTableStyles}  /* 주간 테이블 CSS 추가 */
        
        .sketch-btn.disabled {
          opacity: 0.4 !important;
          background-color: #f3f4f6 !important;
          color: #9ca3af !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
        }

        .sketch-btn.disabled:hover {
          background-color: #f3f4f6 !important;
          border-color: #e5e7eb !important;
        }

        .reservation-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;
        }

        .header {
          padding: 1rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
          position: relative;
        }

        .back-button {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .header-content {
          text-align: center;
        }

        .main-title {
          font-size: 1.2rem;
          font-weight: bold;
          margin: 0;
          color: #1f2937;
        }

        .sub-title {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0.25rem 0 0 0;
        }

        .form-section {
          padding: 1.5rem;
        }

        .form-step {
          margin-bottom: 2rem;
        }

        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          background-color: #1f2937;
          color: white;
          border-radius: 50%;
          font-size: 0.8rem;
          font-weight: bold;
          margin-right: 0.5rem;
        }

        .step-label {
          font-size: 1rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
        }

        .attendee-select {
          height: 40px;
          border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #1f2937;
          background-color: white;
          cursor: pointer;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          transition: all 0.3s ease;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
          margin-top: 0.75rem;
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
        }

        .calendar-header {
          font-weight: bold;
          color: #6b7280;
        }

        .calendar-date {
          cursor: pointer;
          border: 2px solid transparent;
        }

        .calendar-date:hover {
          border-color: #1f2937;
        }

        .calendar-date.selected {
          background-color: #1f2937;
          border-radius: 2px;
          color: white;
        }

        .calendar-date.disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .time-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-top: 0.75rem;
          transition: all 0.3s ease;
        }

        .weekly-table {
          transition: all 0.3s ease;
        }

        .duration-selector {
          transition: all 0.3s ease;
        }

        .reserve-section {
          padding: 1rem 1.5rem 1.5rem;
        }

        .form-step-3 { 
          padding: 8px;
          border: 1px solid #333;
          border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
        }

        .loading-overlay {
          position: relative;
          opacity: 0.6;
          pointer-events: none;
        }

        .validation-highlight {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }

        .Important-info{padding: 1.5rem; background: #f3f3f3; border-radius: 6px; font-size: 18px;}

        @media (max-width: 480px) {
          .reservation-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
        }
      `}</style>

      <div className="reservation-container">
        <SketchHeader
          title={get('Menu1.11')}
          showBack={true}
          onBack={() => handleBack()}
          rightButtons={[]}
        />

        <ReservationForm
          attendee={attendee}
          onAttendeeChange={setAttendee}
          baseDate={baseDate}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          timeSlots={timeSlots}
          selectedTimes={reservationData} // Duration 데이터 전달
          onTimeSelect={handleTimeSelect} // Duration 핸들러 사용
          memo={memo} // 메모 값 전달
          onMemoChange={setMemo} // 메모 변경 핸들러 전달
          onBookerChange={setBookerName} // booker 변경 핸들러
          disabledDates={[]}
          disabledTimes={disabledTimes}
          useDurationMode={true} // Duration 모드 활성화
          maxDuration={4} // 최대 4시간까지 선택 가능
          messages={getReservationMessages()} // 다국어 메시지 전달
          pickupService = {pickupService}
          setPickupService = {setPickupService}
          useStaffService = {useStaffService}
          setUseStaffService = {setUseStaffService}
          getTargetLabel={getTargetLabel}
        />
        {/* <div className='Important-info'>
    <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
      {get('Reservation.ImportantInfo')}
    </div>
    
        <AgreementCheckbox 
          agreements={agreements}
          onAgreementChange={handleAgreementChange}
          showRequired={true}
        />
    </div> */}

        <div className="reserve-section">
          <SketchBtn 
            className="full-width" 
            variant="event" 
            size="normal" 
            onClick={handleReserve}
          >
            {get('Menu1.11')}
            <HatchPattern opacity={0.4} />
          </SketchBtn>
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

export default ReservationPage;