import React, { useState, useEffect } from 'react'; 

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';
import SketchHeader from '@components/SketchHeader';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';
import LoadingScreen from '@components/LoadingScreen';
import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';
import AgreementCheckbox2 from '@components/AgreementCheckbox2';


const ReserveSummaryPage = ({ 
  navigateToPageWithData, 
  goBack,
  PAGES, 
  reserve_data,
  ...otherProps 
}) => {
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  
  // 예약 확정을 위한 상태 관리
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [reservationPayload, setReservationPayload] = useState({});
  const [displayData, setDisplayData] = useState({
    target: '',
    targetName: '',
    bookerName: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: '',
    attendee: '',
    memo: '',
    escort_entrance: ''
  });
  const [isConfirming, setIsConfirming] = useState(false);


  const { user, isLoggedIn } = useAuth();
  console.log("displayData", displayData)


  const [agreements, setAgreements] = useState({
    policyTerms: false
  });
  
  // 핸들러 추가
  const handleAgreementChange = (key, checked) => {

    console.log(agreements, checked);

    setAgreements(prev => ({
      ...prev,
      [key]: checked
    }));
  };


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
        bookerName,
        target, 
        target_id, 
        selectedDate, 
        selectedTime, 
        attendee, 
        duration,
        endTime, 
        memo,
        venueToItem,
        targetName,
        pickupService,
        useStaffService,
        selectedEntrance,
        escort_entrance
      } = reserve_data;

      // API 요청을 위한 payload 준비
      const api_payload = {
        client_id: user?.user_id || user?.id,
        target: target,
        escort_string: bookerName,
        target_id: Number.parseInt(target_id),
        reserve_date: selectedDate,
        attendee: Number.parseInt(attendee),
        start_time: selectedTime,
        end_time: endTime,
        duration: duration,
        note: memo || '',
        mngCode:0,
        use_escort: pickupService ? 1 : 0,
        use_staff: useStaffService ? 1 : 0,
        venueToItem:true, pickupService:pickupService,useStaffService:useStaffService,
        escort_entrance: escort_entrance
      };

      setReservationPayload(api_payload);
      console.log('💾 API Payload prepared:', api_payload);

      // 화면 표시용 데이터 준비
      const display_data = {
        target: target,
        targetName: targetName,
        bookerName: bookerName,
        date: formatDate(selectedDate),
        startTime: selectedTime,
        endTime: endTime,
        duration: duration ? `${duration}${get('Reservation.HourUnit') || '시간'}` : '',
        attendee: `${attendee}${get('Reservation.PersonUnit') || '명'}`,
        memo: memo || '',
        pickupService: pickupService,
        useStaffService: useStaffService,
        escort_entrance: escort_entrance
      };

      setDisplayData(display_data);
      console.log('🖥️ Display data prepared:', display_data);
    }
  }, [reserve_data, get]);

const getEntranceText = (entranceValue) => {
  if (!entranceValue) return '';
  
  switch(entranceValue) {
    case '1':
      return get('ENTRANCE_MARKER_1');
    case '2':
      return get('ENTRANCE_MARKER_2');
    default:
      return entranceValue;
  }
};

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
      //alert(invalidDataMessage);

      Swal.fire({
        title: invalidDataMessage,
        icon: 'warning',
        confirmButtonText: get('SWAL_CONFIRM_BUTTON')
      });

      return;
    }

    console.log(agreements.policyTerms);
    if (!agreements.policyTerms) {
      //alert(get('Agreement.Required') || '이용 정책에 동의해주세요.');

      Swal.fire({
        title: get('Agreement.Required'),
        icon: 'warning',
        confirmButtonText: get('SWAL_CONFIRM_BUTTON')
      });


      return;
    }

    setIsConfirming(true);

    try {
      console.log('🚀 Sending reservation request:', reservationPayload);
      
      // API 요청
      const response = await ApiClient.postForm('/api/reservation/confirm', reservationPayload);
      
      console.log('✅ Reservation confirmed:', response);
      
      // 성공 메시지 표시
      //alert(successMessage);

      Swal.fire({
        title: successMessage,
        icon: 'success',
        confirmButtonText: get('SWAL_CONFIRM_BUTTON')
      });
      
      // 홈으로 이동
      navigateToPageWithData && navigateToPageWithData(PAGES.HOME);
      
    } catch (error) {
      console.error('❌ Reservation failed:', error);
      
      // 에러 메시지 표시 (서버에서 에러 메시지가 있으면 우선 사용)
      const serverErrorMessage = error?.response?.data?.message || error?.message;
      const finalErrorMessage = serverErrorMessage || errorMessage;
      
      //alert(finalErrorMessage);

      Swal.fire({
        title: finalErrorMessage,
        icon: 'error',
        confirmButtonText: get('SWAL_CONFIRM_BUTTON')
      });

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
      bookerLabel: get('RESERVATION_CLIENT_LABEL') || 'Booker',
      targetLabel: get('BookingSum.Target') || '예약 대상',
      dateLabel: get('BookingSum1.2') || '날짜',
      timeLabel: get('BookingSum1.3') || '시간',
      attendeeLabel: get('ReservationCompo1.1') || '참석자',
      memoLabel: get('Reservation.MemoLabel') || '메모',
      confirmButton: get('btn.confirmRes.1') || '예약 확정',
      noMemo: get('BookingSum.NoMemo') || '메모 없음',
      confirmingButton: get('Reservation.Confirming') || '예약 확정 중...',
      escortLabel:get('reservation.escort.1'),
      useStaffLabel:get('STAFF_MSG_1'),
      entranceLabel: get('title.text.15')
    };
  };

  const messages_summary = getSummaryMessages();

  const convertTo12HourFormat = (time24) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const adjustedHours = hours % 24;
    
    
    
    const displayHours = adjustedHours.toString().padStart(2, '0');

    //adjustedHours === 0 ? 12 : (adjustedHours > 12 ? adjustedHours - 12 : adjustedHours);

    return `${displayHours}:00`;
  };

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
          padding-top: 2rem;
          padding-left: 1.5rem;
          padding-right: 1.5rem;
          padding-bottom: 0.5rem;
        }

        .section-title {
          font-size: 1.3rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .booking-summary-box {
          border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
          border: 1px solid #1f2937;
          background-color: #f8fafc;
          padding: 1.5rem;
          margin-bottom: 2rem;
          transform: rotate(-0.3deg);
          box-shadow: 3px 3px 0px #1f2937;
          position: relative;
          overflow: hidden;
        }

        .summary-content {
          position: relative;
          z-index: 10;
        }

        .summary-item {
          font-size: 0.95rem;
          color: #374151;
          margin-bottom: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .summary-item:last-child {
          margin-bottom: 0;
        }

        .summary-label {
          font-weight: bold;
          color: #1f2937;
          min-width: 80px;
          flex-shrink: 0;
        }

        .summary-value {
          color: #4b5563;
          text-align: right;
          flex: 1;
          word-break: break-word;
        }

        .time-range {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .duration-info {
          font-size: 0.85rem;
          color: #6b7280;
          margin-top: 2px;
        }

        .memo-content {
          max-height: 60px;
          overflow-y: auto;
          background-color: #f9fafb;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .no-memo {
          color: #9ca3af;
          font-style: italic;
        }

        .confirm-section {
          padding: 0 1.5rem 2rem;
          margin-bottom: 3rem;
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

        .agreements-section{
          margin-bottom:20px;
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
          
          {/* Booking Summary Box */}
          <div className="booking-summary-box">
            <HatchPattern opacity={0.4} />
            <div className="summary-content">
              {/* 예약 대상 */}
              <div className="summary-item">
                <span className="summary-label">{messages_summary.targetLabel}:</span>
                <span className="summary-value">{displayData.targetName}</span>
              </div>


              <div className="summary-item">
                <span className="summary-label">{messages_summary.bookerLabel}</span>
                <span className="summary-value">{displayData.bookerName}</span>
              </div>
              
              {/* 날짜 */}
              <div className="summary-item">
                <span className="summary-label">{messages_summary.dateLabel}:</span>
                <span className="summary-value">{displayData.date}</span>
              </div>
              
              {/* 시간 */}
              <div className="summary-item">
                <span className="summary-label">{messages_summary.timeLabel}:</span>
                <div className="time-range">
                  <span className="summary-value">
                    {convertTo12HourFormat(displayData.startTime)} - {convertTo12HourFormat(displayData.endTime)}
                  </span>
                  {displayData.duration && (
                    <span className="duration-info">({displayData.duration})</span>
                  )}
                </div>
              </div>
              
              {/* 참석자 */}
              <div className="summary-item">
                <span className="summary-label">{messages_summary.attendeeLabel}:</span>
                <span className="summary-value">{displayData.attendee}</span>
              </div>

              
              {/* 에스코트 */}
              <div className="summary-item" style={{display:(displayData.pickupService)? '' : 'none'}}>
                <span className="summary-label"></span>
                <div className="summary-value">
                  {<span className="">{messages_summary.escortLabel}</span>}
                </div>
              </div>

              <div className="summary-item" style={{display:(displayData.useStaffService)? '' : 'none'}}>
                <span className="summary-label"></span>
                <div className="summary-value">
                  {<span className="">{messages_summary.useStaffLabel}</span>}
                </div>
              </div>

              <div className="summary-item" style={{display:(displayData.escort_entrance)? '' : 'none'}}>
                <span className="summary-label">{messages_summary.entranceLabel}:</span>
                <div className="summary-value">
                  <span>{getEntranceText(displayData.escort_entrance)}</span>
                </div>
              </div>

              
              {/* 메모 */}
              <div className="summary-item">
                <span className="summary-label">{messages_summary.memoLabel}:</span>
                <div className="summary-value">
                  {displayData.memo ? (
                    <div className="memo-content">{displayData.memo}</div>
                  ) : (
                    <span className="no-memo">{messages_summary.noMemo}</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* agreements Section */}
        <div className="agreements-section">
          <AgreementCheckbox2 
            agreements={agreements}
            onAgreementChange={handleAgreementChange}
            showRequired={true}
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
                  variant="cocktail"
                  loadingText="Loading..."
                  isVisible={isLoading} 
                />
      </div>
    </>
  );
};

export default ReserveSummaryPage;