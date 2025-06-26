import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import HatchPattern from '@components/HatchPattern';
import '@components/SketchComponents.css';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';

const VenueSetup = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const [form, setForm] = useState({
    logo: '',
    cover: '',
    name: '',
    address: '',
    phone: '',
    open_time: '',
    close_time: '',
    intro: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }
    }, [messages, currentLang]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // 입력 시 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 검증 함수들
  const validateName = (name) => {
    if (!name.trim()) {
      return 'Venue name is required';
    }
    if (name.trim().length < 2) {
      return 'Venue name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Venue name must be less than 50 characters';
    }
    return '';
  };

  const validateAddress = (address) => {
    if (!address.trim()) {
      return 'Address is required';
    }
    if (address.trim().length < 5) {
      return 'Address must be at least 5 characters';
    }
    if (address.trim().length > 200) {
      return 'Address must be less than 200 characters';
    }
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) {
      return 'Phone number is required';
    }
    // 숫자, 하이픈, 괄호, 공백, + 기호만 허용
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (!phoneRegex.test(phone)) {
      return 'Invalid phone number format';
    }
    // 숫자만 추출해서 길이 확인
    const numbersOnly = phone.replace(/\D/g, '');
    if (numbersOnly.length < 8 || numbersOnly.length > 15) {
      return 'Phone number must be between 8-15 digits';
    }
    return '';
  };

  const validateOpenTime = (time) => {
    if (!time.trim()) {
      return 'Opening time is required';
    }
    // 시간 형식 검증 (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return 'Invalid time format (HH:MM)';
    }
    return '';
  };

  const validateCloseTime = (time) => {
    if (!time.trim()) {
      return 'Closing time is required';
    }
    // 시간 형식 검증 (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return 'Invalid time format (HH:MM)';
    }
    
    // 시작 시간과 종료 시간 비교 (둘 다 입력되었을 때만)
    if (form.open_time && time) {
      const openHour = parseInt(form.open_time.split(':')[0]);
      const openMinute = parseInt(form.open_time.split(':')[1]);
      const closeHour = parseInt(time.split(':')[0]);
      const closeMinute = parseInt(time.split(':')[1]);
      
      const openTotalMinutes = openHour * 60 + openMinute;
      const closeTotalMinutes = closeHour * 60 + closeMinute;
      
      if (closeTotalMinutes <= openTotalMinutes) {
        return 'Closing time must be after opening time';
      }
    }
    
    return '';
  };

  // 시간을 HH:MM:SS 형식으로 변환하는 함수
  const formatTimeToSeconds = (timeString) => {
    if (!timeString) return '';
    return timeString + ':00'; // HH:MM -> HH:MM:SS
  };

  const validateIntro = (intro) => {
    if (!intro.trim()) {
      return 'Introduction is required';
    }
    if (intro.trim().length < 10) {
      return 'Introduction must be at least 10 characters';
    }
    if (intro.trim().length > 500) {
      return 'Introduction must be less than 500 characters';
    }
    return '';
  };

  // 전체 폼 검증
  const validateForm = () => {
    const newErrors = {};

    newErrors.name = validateName(form.name);
    newErrors.address = validateAddress(form.address);
    newErrors.phone = validatePhone(form.phone);
    newErrors.open_time = validateOpenTime(form.open_time);
    newErrors.close_time = validateCloseTime(form.close_time);
    newErrors.intro = validateIntro(form.intro);

    // 빈 에러 메시지 제거
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) {
        delete newErrors[key];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 실시간 검증 (blur 이벤트)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    let errorMessage = '';

    switch (name) {
      case 'name':
        errorMessage = validateName(value);
        break;
      case 'address':
        errorMessage = validateAddress(value);
        break;
      case 'phone':
        errorMessage = validatePhone(value);
        break;
      case 'open_time':
        errorMessage = validateOpenTime(value);
        break;
      case 'close_time':
        errorMessage = validateCloseTime(value);
        break;
      case 'intro':
        errorMessage = validateIntro(value);
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = async () => {
    if (!validateForm()) {
      // 첫 번째 에러 필드로 스크롤
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // form 데이터에서 logo, cover 제외하고 전송 (이미지는 별도 처리)
      const venueData = {
        cat_id: 1,
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        open_time: formatTimeToSeconds(form.open_time.trim()),    // HH:MM:SS 형식으로 변환
        close_time: formatTimeToSeconds(form.close_time.trim()),  // HH:MM:SS 형식으로 변환
        description: form.intro.trim()
      };
      
      console.log('Saving venue data:', venueData);
      
      // API 호출
      const response = await ApiClient.post('/api/register_venue', venueData);
      
      console.log('API response:', response);
      
      // 성공 응답 체크 (API 응답 구조에 따라 조정)
      if (response && (response.success || response.data || response.venue_id)) {
        alert('Venue setup completed successfully!');
        
        // 메인 페이지로 이동
        if (navigateToPageWithData && PAGES?.MAIN) {
          navigateToPageWithData(PAGES.MAIN, { 
            venue_id: response.venue_id || response.data?.venue_id 
          });
        } else {
          // 페이지 새로고침으로 사용자 정보 업데이트
          window.location.reload();
        }
        
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error) {
      console.error('Venue setup failed:', error);
      
      // 에러 타입에 따른 메시지 처리
      let errorMessage = 'Failed to save venue information. Please try again.';
      
      if (error.response) {
        // API가 에러 응답을 반환한 경우
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 400) {
          errorMessage = errorData.message || 'Invalid venue information provided.';
        } else if (status === 401) {
          errorMessage = 'Please login again.';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to create a venue.';
        } else if (status === 409) {
          errorMessage = 'Venue with this information already exists.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        console.error('API error details:', errorData);
      } else if (error.request) {
        // 네트워크 에러
        errorMessage = 'Network error. Please check your connection.';
      }
      
      alert(errorMessage);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style jsx="true">{`
        .venue-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .section-title {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 1.2rem 0 0.7rem 0;
        }
        .img-row {
          display: flex;
          gap: 1.2rem;
          margin-bottom: 1.2rem;
        }
        .img-upload {
          flex: 1;
          background: #f3f4f6;
          border-radius: 6px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          color: #bbb;
          flex-direction: column;
          cursor: pointer;
          border: 2px dashed #d1d5db;
          transition: all 0.2s ease;
        }
        .img-upload:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }
        .img-label {
          font-size: 0.97rem;
          color: #222;
          margin-top: 0.3rem;
        }
        .input-row {
          margin-bottom: 0.7rem;
        }
        .time-input-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.7rem;
        }
        .time-input-col {
          flex: 1;
        }
        .time-label {
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }
        .save-btn-row {
          margin: 1.2rem 0 0.7rem 0;
        }
        .info-text {
          font-size: 0.875rem;
          color: #888;
          text-align: center;
          margin-top: 1.2rem;
          line-height: 1.4;
        }
        .required-field {
          position: relative;
        }
        .required-field::after {
          content: '*';
          color: #dc2626;
          margin-left: 4px;
        }
        .save-btn-row button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
      <div className="venue-container">
        <SketchHeader
          title={get('VENUE_SETUP_TITLE')}
          showBack={true}
          onBack={goBack}
        />
        
        <div className="section-title">{get('VENUE_UPLOAD_IMAGES')}</div>
        <div className="img-row">
          <div className="img-upload">
            🖼️
            <div className="img-label">{get('VENUE_LOGO')}</div>
          </div>
          <div className="img-upload">
            🖼️
            <div className="img-label">{get('VENUE_COVER_PHOTO')}</div>
          </div>
        </div>
        
        <div className="section-title required-field">{get('VENUE_INFORMATION')}</div>
        
        <div className="input-row">
          <SketchInput
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={get('VENUE_NAME_PLACEHOLDER')}
            error={errors.name}
          />
        </div>
        
        <div className="input-row">
          <SketchInput
            name="address"
            value={form.address}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={get('VENUE_ADDRESS_PLACEHOLDER')}
            error={errors.address}
          />
        </div>
        
        <div className="input-row">
          <SketchInput
            name="phone"
            value={form.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={get('VENUE_PHONE_PLACEHOLDER')}
            error={errors.phone}
          />
        </div>
        
        <div className="time-input-row">
          <div className="time-input-col">
            <div className="time-label">시작 시간</div>
            <SketchInput
              name="open_time"
              type="time"
              value={form.open_time}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="09:00"
              error={errors.open_time}
            />
          </div>
          <div className="time-input-col">
            <div className="time-label">종료 시간</div>
            <SketchInput
              name="close_time"
              type="time"
              value={form.close_time}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="22:00"
              error={errors.close_time}
            />
          </div>
        </div>
        
        <div className="input-row">
          <SketchInput
            name="intro"
            value={form.intro}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={get('VENUE_INTRO_PLACEHOLDER')}
            as="textarea"
            rows={2}
            error={errors.intro}
          />
        </div>
        
        <div className="save-btn-row">
          <SketchBtn 
            variant="event" 
            size="medium" 
            style={{ width: '100%' }}
            onClick={handleSave}
            disabled={isSubmitting}
          >
            <HatchPattern opacity={0.8} />
            {isSubmitting ? 'Saving...' : get('VENUE_SAVE_ACTIVATE')}
          </SketchBtn>
        </div>
        
        <div className="info-text">
          * {get('VENUE_EDIT_ANYTIME')}
        </div>
      </div>
    </>
  );
};

export default VenueSetup;