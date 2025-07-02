import React, { useState, useEffect } from 'react'; 

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';
import SketchHeader from '@components/SketchHeader';
import BookingSummary from '@components/BookingSummary';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import LoadingScreen from '@components/LoadingScreen';
import ApiClient from '@utils/ApiClient';

const ReserveSummaryPage = ({ 
  navigateToPageWithData, 
  goBack,
  PAGES, 
  reserve_data,
  ...otherProps 
}) => {
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  
  // 예약 확정을 위한 상태 관리
  const [reservationPayload, setReservationPayload] = useState({});
  const [displayData, setDisplayData] = useState({
    target: '',
    targetName: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: '',
    attendee: '',
    memo: ''
  });
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);

  // 예약 데이터 처리 및 상태 설정
  useEffect(() => {
    if (reserve_data) {
      console.log('📋 Reserve data received:', reserve_data);

      const {
        user, 
        target, 
        target_id, 
        selectedDate, 
        selectedTime, 
        attendee, 
        duration,
        endTime, 
        memo
      } = reserve_data;

      // API 요청을 위한 payload 준비
      const api_payload = {
        client_id: user?.user_id || user?.id,
        target: target,
        target_id: Number.parseInt(target_id),
        reserve_date: selectedDate,
        attendee: Number.parseInt(attendee),
        start_time: selectedTime,
        end_time: endTime,
        duration: duration,
        note: memo || ''
      };

      setReservationPayload(api_payload);
      console.log('💾 API Payload prepared:', api_payload);

      // 화면 표시용 데이터 준비
      const display_data = {
        target: target,
        targetName: getTargetDisplayName(target, target_id),
        date: formatDate(selectedDate),
        startTime: selectedTime,
        endTime: endTime,
        duration: duration ? `${duration}${get('Reservation.HourUnit') || '시간'}` : '',
        attendee: `${attendee}${get('Reservation.PersonUnit') || '명'}`,
        memo: memo || ''
      };

      setDisplayData(display_data);
      console.log('🖥️ Display data prepared:', display_data);
    }
  }, [reserve_data, get]);

  // 예약 대상 표시명 생성
  const getTargetDisplayName = (target, target_id) => {
    switch(target) {
      case 'venue':
        return get('ReservationType.Venue') || '매장 예약';
      case 'staff':
        return `${get('ReservationType.Staff') || '스태프 예약'} (ID: ${target_id})`;
      default:
        return `${target} ${get('ReservationType.Default') || '예약'}`;
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // 다국어 요일 처리
    const dayOfWeek = getDayOfWeek(date.getDay());
    
    return `${year}.${month}.${day} (${dayOfWeek})`;
  };

  // 요일 다국어 처리
  const getDayOfWeek = (dayIndex) => {
    const days = [
      get('Day.Sunday') || '일',
      get('Day.Monday') || '월', 
      get('Day.Tuesday') || '화',
      get('Day.Wednesday') || '수',
      get('Day.Thursday') || '목',
      get('Day.Friday') || '금',
      get('Day.Saturday') || '토'
    ];
    return days[dayIndex];
  };

  // 예약 확정 처리
  const handleConfirm = async () => {
    // 유효성 검사 메시지
    const invalidDataMessage = get('Validation.InvalidReservationData') || '예약 정보가 올바르지 않습니다.';
    const confirmingMessage = get('Reservation.Confirming') || '예약 확정 중...';
    const successMessage = get('Reservation.Success') || '예약이 완료되었습니다.';
    const errorMessage = get('Reservation.Error') || '예약 도중 오류가 발생했습니다. 다시 시도해주세요.';

    if (!reservationPayload.client_id || !reservationPayload.reserve_date || !reservationPayload.start_time) {
      console.error('❌ Invalid reservation data');
      alert(invalidDataMessage);
      return;
    }

    setIsConfirming(true);
    
    try {
      console.log('🚀 Sending reservation request:', reservationPayload);
      
      // API 요청
      const response = await ApiClient.postForm('/api/reservation/confirm', reservationPayload);
      
      console.log('✅ Reservation confirmed:', response);
      
      // 성공 메시지 표시
      alert(successMessage);
      
      // 홈으로 이동
      navigateToPageWithData && navigateToPageWithData(PAGES.HOME);
      
    } catch (error) {
      console.error('❌ Reservation failed:', error);
      
      // 에러 메시지 표시 (서버에서 에러 메시지가 있으면 우선 사용)
      const serverErrorMessage = error?.response?.data?.message || error?.message;
      const finalErrorMessage = serverErrorMessage || errorMessage;
      
      alert(finalErrorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleHome = () => {
    console.log('Home 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.HOME);
  };

  const handleBack = () => {
    goBack();
  };

  // 예약 내용 summary 메시지
  const getSummaryMessages = () => {
    return {
      pageTitle: get('BookingSum1.1') || '예약 확인',
      targetLabel: get('BookingSum.Target') || '예약 대상',
      dateLabel: get('BookingSum1.2') || '날짜',
      timeLabel: get('BookingSum1.3') || '시간',
      attendeeLabel: get('ReservationCompo1.1') || '참석자',
      memoLabel: get('Reservation.MemoLabel') || '메모',
      confirmButton: get('btn.confirmRes.1') || '예약 확정',
      noMemo: get('BookingSum.NoMemo') || '메모 없음',
      confirmingButton: get('Reservation.Confirming') || '예약 확정 중...'
    };
  };

  const messages_summary = getSummaryMessages();

  return (
    <>
      <style jsx="true">{`
        .summary-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          position: relative;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
          position: relative;
        }

        .logo {
          font-weight: bold;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .content-section {
          padding: 2rem 1.5rem;
        }

        .section-title {
          font-size: 1.3rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }



        .confirm-section {
          padding: 0 1.5rem 2rem;
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
          margin-right: 0.75rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 480px) {
          .summary-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
        }
      `}</style>

      <div className="summary-container">
        {/* Header */}
        <SketchHeader
          title={messages_summary.pageTitle}
          showBack={true}
          onBack={() => handleBack()}
          rightButtons={[]}
        />

        {/* Content Section */}
        <div className="content-section">
          <div className="section-title">{messages_summary.pageTitle}</div>
          
          {/* Booking Summary Component */}
          <BookingSummary 
            displayData={displayData}
            messages={messages_summary}
          />
        </div>

        {/* Confirm Section */}
        <div className="confirm-section">
          <SketchBtn 
            className="full-width" 
            variant="event" 
            size="normal"
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            <HatchPattern opacity={0.4} />
            {isConfirming ? messages_summary.confirmingButton : messages_summary.confirmButton}
          </SketchBtn>
        </div>

        <LoadingScreen 
          isVisible={isLoading || isConfirming} 
        />
      </div>
    </>
  );
};

export default ReserveSummaryPage;