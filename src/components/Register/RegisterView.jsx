import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';

// Components
import SketchInput from '@components/SketchInput';
import SketchBtn from '@components/SketchBtn';
import Header from '@components/Header';
import HatchPattern from '@components/HatchPattern';
import InitFooter from '@components/InitFooter';
import SketchHeader from '@components/SketchHeader';
import LoadingScreen from '@components/LoadingScreen';

// Contexts
import { useMsg } from '@contexts/MsgContext';

import Swal from 'sweetalert2';

// Constants
const STORAGE_KEYS = {
  PRIVACY: 'privacy_agreed',
  TERMS: 'terms_agreed',
  FORM_DATA: 'register_formData'
};

const INITIAL_FORM_DATA = {
  email: '',
  password: '',
  rePassword: '',
  nickname: '',
  gender: '',
  birth_date: '',
  phone: ''
};

const INITIAL_AGREEMENTS = {
  privacy: false,
  terms: false
};

export default function RegisterView() {
  const { messages, get, currentLang } = useMsg();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [agreements, setAgreements] = useState(INITIAL_AGREEMENTS);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Utility Functions
  const clearStorage = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(key => {
      sessionStorage.removeItem(key);
    });
  }, []);

  const saveFormData = useCallback((data) => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }, []);

  const loadFormData = useCallback(() => {
    try {
      const savedData = sessionStorage.getItem(STORAGE_KEYS.FORM_DATA);
      return savedData ? JSON.parse(savedData) : INITIAL_FORM_DATA;
    } catch (error) {
      console.error('Failed to load form data:', error);
      return INITIAL_FORM_DATA;
    }
  }, []);

  const saveAgreements = useCallback((privacy, terms) => {
    if (privacy) {
      sessionStorage.setItem(STORAGE_KEYS.PRIVACY, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.PRIVACY);
    }

    if (terms) {
      sessionStorage.setItem(STORAGE_KEYS.TERMS, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.TERMS);
    }
  }, []);

  const loadAgreements = useCallback(() => {
    return {
      privacy: sessionStorage.getItem(STORAGE_KEYS.PRIVACY) === 'true',
      terms: sessionStorage.getItem(STORAGE_KEYS.TERMS) === 'true'
    };
  }, []);

  // Validation Functions
   const validateEmail = (email) => {
    if (!email.trim()) return get('VALIDATION_EMAIL_REQUIRED') || '이메일을 입력해주세요';
    if (!/\S+@\S+\.\S+/.test(email)) return get('VALIDATION_EMAIL_INVALID') || '올바른 이메일 형식을 입력해주세요';
    return null;
  };

  const validatePassword = (password) => {
    if (!password) return get('VALIDATION_PASSWORD_REQUIRED') || '비밀번호를 입력해주세요';
    if (password.length < 6) return get('VALIDATION_PASSWORD_MIN_LENGTH') || '비밀번호는 최소 6자 이상이어야 합니다';
    return null;
  };

  const validateRePassword = (password, rePassword) => {
    if (!rePassword) return get('VALIDATION_RE_PASSWORD_REQUIRED') || '비밀번호 확인을 입력해주세요';
    if (password !== rePassword) return get('VALIDATION_RE_PASSWORD_MISMATCH') || '비밀번호가 일치하지 않습니다';
    return null;
  };

  const validateNickname = (nickname) => {
    if (!nickname.trim()) return get('VALIDATION_NICKNAME_REQUIRED') || '닉네임을 입력해주세요';
    if (nickname.trim().length < 2) return get('VALIDATION_NICKNAME_MIN_LENGTH') || '닉네임은 최소 2자 이상이어야 합니다';
    if (nickname.trim().length > 20) return get('VALIDATION_NICKNAME_MAX_LENGTH') || '닉네임은 20자 이하로 입력해주세요';
    return null;
  };

  const validateBirthDate = (birthDate) => {
    if (!birthDate.trim()) return get('VALIDATION_BIRTH_DATE_REQUIRED') || '생년월일을 입력해주세요';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      return get('VALIDATION_BIRTH_DATE_FORMAT') || '날짜 형식은 YYYY-MM-DD 형태로 입력해주세요 (예: 1988-08-18)';
    }
    
    // Check if date is valid
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
      return get('VALIDATION_BIRTH_DATE_INVALID') || '올바른 날짜를 입력해주세요';
    }
    
    // Check if date is not in the future
    const today = new Date();
    if (date > today) {
      return get('VALIDATION_BIRTH_DATE_FUTURE') || '미래 날짜는 입력할 수 없습니다';
    }
    
    // Check if age is reasonable (not older than 120 years)
    const age = today.getFullYear() - date.getFullYear();
    if (age > 120) {
      return get('VALIDATION_BIRTH_DATE_TOO_OLD') || '올바른 생년월일을 입력해주세요';
    }
    
    // Check if user is at least 19 years old (Korean age requirement)
    const birthYear = date.getFullYear();
    const birthMonth = date.getMonth();
    const birthDay = date.getDate();
    
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    let calculatedAge = currentYear - birthYear;
    
    // If birthday hasn't occurred this year yet, subtract 1 from age
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
      calculatedAge--;
    }
    
    if (calculatedAge < 19) {
      return get('VALIDATION_BIRTH_DATE_UNDER_AGE') || '만 19세 이상만 회원가입이 가능합니다';
    }
    
    return null;
  };

  const validatePhone = (phone) => {
    if (phone && !/^\d{3}-\d{4}-\d{4}$/.test(phone)) {
      return get('VALIDATION_PHONE_FORMAT') || '전화번호 형식은 010-1234-5678로 입력해주세요';
    }
    return null;
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

     const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const rePasswordError = validateRePassword(formData.password, formData.rePassword);
    if (rePasswordError) newErrors.rePassword = rePasswordError;

    const nicknameError = validateNickname(formData.nickname);  
    if (nicknameError) newErrors.nickname = nicknameError;


    formData.birth_date="1980-01-01";
    const birthDateError = validateBirthDate(formData.birth_date);
    if (birthDateError) newErrors.birth_date = birthDateError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    // Agreement validations
    if (!agreements.privacy) {
      newErrors.privacy = get('VALIDATION_PRIVACY_REQUIRED') || '개인정보처리방침에 동의해주세요';
    }

    if (!agreements.terms) {
      newErrors.terms = get('VALIDATION_TERMS_REQUIRED') || '이용약관에 동의해주세요';
    }

    return newErrors;
  }, [formData, agreements, get]);

  // API Functions
  const registerUser = async (userData) => {
    try {
      const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
      
      const response = await axios.post(
        `${API_HOST}/api/register`,
        qs.stringify({
          account_type: "user",
          login_type: "email",
          email: userData.email,
          passwd: userData.password,
          nickname: userData?.nickname || null,
          privacy_agreed: agreements.privacy,
          terms_agreed: agreements.terms
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000 // 10초 타임아웃
        }
      );


      console.log(response);
      const {error = false} = response;
      if(error){
        let errorMessage = get('REGISTER_ERROR_DEFAULT') || '회원가입에 실패했습니다. 다시 시도해주세요.';

        return {
          success: false,
          message: errorMessage,
          errors: errors
        };
      }

      return {
        success: true,
        message: response.data.message || get('REGISTER_SUCCESS') || '회원가입이 완료되었습니다! 로그인해주세요.',
        data: response.data
      };
    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMessage = get('REGISTER_ERROR_DEFAULT') || '회원가입에 실패했습니다. 다시 시도해주세요.';
      let errors = {};

      if (error.response) {
        const { status, data } = error.response;
        
        if (data) {
          errorMessage = data.message || errorMessage;
          errors = data.errors || {};
        }

        // Status code별 에러 처리
        switch (status) {
          case 409:
            errorMessage = get('REGISTER_ERROR_DUPLICATE') || '이미 사용 중인 이메일입니다';
            break;
          case 400:
            errorMessage = get('REGISTER_ERROR_VALIDATION') || '입력 정보가 올바르지 않습니다';
            break;
          case 500:
            errorMessage = get('REGISTER_ERROR_SERVER') || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            break;
        }
      } else if (error.request) {
        errorMessage = get('REGISTER_ERROR_NETWORK') || '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = get('REGISTER_ERROR_TIMEOUT') || '요청 시간이 초과되었습니다. 다시 시도해주세요.';
      }

      return {
        success: false,
        message: errorMessage,
        errors: errors
      };
    }
  };

  // Event Handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      saveFormData(newData);
      return newData;
    });
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors, saveFormData]);

  const handleBack = useCallback(() => {
    clearStorage();
    navigate('/login');
  }, [clearStorage, navigate]);

  const handleAgreementClick = useCallback((type) => {
    const currentPath = '/register';
    const targetPath = type === 'privacy' ? '/privacy' : '/terms';
    
    navigate(`${targetPath}?returnUrl=${encodeURIComponent(currentPath)}&agreementType=${type}`);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevent double submission
    
    setIsLoading(true);
    setErrors({});
    setMessage('');

    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      const result = await registerUser(formData);
      
      if (result.success) {
        // Show success alert
       
        await Swal.fire({
          title: get('REGISTER_SUCCESS_ALERT'),
          icon: 'success',
          confirmButtonText: get('SWAL_CONFIRM_BUTTON')
        });
        
        setMessage(result.message);
        clearStorage(); // Clear storage on success
        
        // Redirect to login page
        navigate('/login');
      } else {
        if (result.errors && Object.keys(result.errors).length > 0) {
          setErrors(result.errors);
        } else {
          setErrors({ general: result.message });
        }
      }
    } else {
      setErrors(validationErrors);
    }
    
    setIsLoading(false);
  };

  // Effects
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Load saved form data
    const savedFormData = loadFormData();
    setFormData(savedFormData);

    // Process URL parameters for agreements
    const urlParams = new URLSearchParams(location.search);
    const privacyParam = urlParams.get('privacy');
    const termsParam = urlParams.get('terms');

    if (privacyParam || termsParam) {
      const currentAgreements = loadAgreements();
      let newPrivacy = currentAgreements.privacy;
      let newTerms = currentAgreements.terms;

      if (privacyParam === 'agreed') {
        newPrivacy = true;
      } else if (privacyParam === 'declined') {
        newPrivacy = false;
      }

      if (termsParam === 'agreed') {
        newTerms = true;
      } else if (termsParam === 'declined') {
        newTerms = false;
      }

      setAgreements({ privacy: newPrivacy, terms: newTerms });
      saveAgreements(newPrivacy, newTerms);

      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      // Load saved agreements
      setAgreements(loadAgreements());
    }
  }, [location.search, loadFormData, loadAgreements, saveAgreements]);

  // Show loading if messages not loaded
  if (!messages || Object.keys(messages).length === 0) {
    return <LoadingScreen variant="cocktail" loadingText="Loading..." isVisible={true} />;
  }

  return (
    <div className="register-container max-w-md mx-auto bg-white border-gray-800 p-6" 
         style={{ paddingBottom: '10px' }}>
      
      <SketchHeader 
        title={get('Menu1.1')}
        showBack={true}
        onBack={handleBack}
        rightButtons={[]}
      />
      
      <div style={{ 
        fontSize: '0.875rem', 
        color: '#6b7280', 
        textAlign: 'start', 
        marginBottom: '5px',
        marginTop: '5px',
        marginLeft: '5px',
        lineHeight: '1.4',
        fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"
      }}>
        {get('Register1.1')}
        {get('Register1.2')}
      </div>

      <div style={{
        color: '#ca1212', 
        margin: '0', 
        textAlign: 'start', 
        fontSize: '13px', 
        fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"
      }}>
        * {get('Intro.description1')}
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '5px' }}>
        {/* Error/Success Messages */}
        {errors.general && (
          <div className="sketch-error-message" style={{ marginBottom: '1rem' }}>
            {errors.general}
          </div>
        )}
        
        {message && (
          <div className="sketch-success-message" style={{ marginBottom: '1rem' }}>
            {message}
          </div>
        )}

        {/* Email Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            margin: '0', 
            fontSize: '13px', 
            marginBottom: '3px',
            fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif",
            display: 'block'
          }}>
            {get('title.text.1')} *
          </label>
          <SketchInput
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
            error={errors.email}
            variant="email" 
            autoComplete="email"
          />
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            margin: '0', 
            fontSize: '13px', 
            marginBottom: '3px',
            fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif",
            display: 'block'
          }}>
            {get('title.text.2')} *
          </label>
          <SketchInput
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
            error={errors.password}
            variant="password"
            autoComplete="new-password"
          />
        </div>

        {/* Confirm Password Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            margin: '0', 
            fontSize: '13px', 
            marginBottom: '3px',
            fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif",
            display: 'block'
          }}>
            {get('title.text.3')} *
          </label>
          <SketchInput
            type="password"
            name="rePassword"
            value={formData.rePassword}
            onChange={handleInputChange}
            disabled={isLoading}
            error={errors.rePassword}
            variant="password"
            autoComplete="new-password"
          />
        </div>

        {/* Nickname Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            margin: '0', 
            fontSize: '13px', 
            marginBottom: '3px',
            fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif",
            display: 'block'
          }}>
            {get('title.text.4')}
          </label>
          <SketchInput
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            disabled={isLoading}
            error={errors.nickname}
            variant="text"
            autoComplete="nickname"
          />
        </div>

        {/* Gender Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            margin: '0', 
            fontSize: '13px', 
            marginBottom: '3px',
            fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif",
            display: 'none'
          }}>
            {get('title.text.5')}
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #666',
              borderRadius: '4px',
              fontSize: '1rem',
              backgroundColor: '#fff',
              display:'none',
              fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"
            }}
          >
            <option value="">{get('title.text.6')}</option>
            <option value="M">{get('title.text.7')}</option>
            <option value="F">{get('title.text.8')}</option>
          </select>
        </div>

        {/* Birth Date Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            margin: '0', 
            fontSize: '13px', 
            marginBottom: '3px',
            fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif",
            display: 'none'
          }}>
            {get('title.text.9')}
          </label>
          <SketchInput
            type="date"
            name="birth_date"
            value={formData.birth_date}
            style={{
              display:'none'
            }}
            onChange={handleInputChange}
            disabled={isLoading}
            error={errors.birth_date}
            variant="text"
            placeholder="1988-08-18"
            
          />
        </div>

        {/* Phone Field */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            margin: '0', 
            display: 'none',
            fontSize: '13px', 
            marginBottom: '3px',
            fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif",
            display: 'block'
          }}>
            {get('title.text.10')}
          </label>
          <SketchInput
            type="tel"
            style={{
              display:'none'
            }}
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={isLoading}
            error={errors.phone}
            variant="text"
            placeholder="010-1234-5678"
            autoComplete="tel"
          />
        </div>

        {/* Agreement Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            margin: '0 0 10px 0', 
            fontSize: '14px', 
            fontWeight: 'bold',
            fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"
          }}>
            {get('REGISTER_AGREEMENTS_TITLE')} *
          </div>

          {/* Privacy Agreement */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '8px',
            padding: '8px',
            border: errors.privacy ? '1px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: agreements.privacy ? '#f0fdf4' : '#ffffff',
            cursor: 'pointer'
            
          }}
          onClick={() => handleAgreementClick('privacy')}>
            <input
              type="checkbox"
              id="privacy-agreement"
              checked={agreements.privacy}
              readOnly
              style={{ 
                marginRight: '8px',
                cursor: 'pointer',
                accentColor: 'rgb(202 255 237)',
                pointerEvents: 'none'
              }}
            />
            <label 
              htmlFor="privacy-agreement"
              style={{ 
                fontSize: '13px',
                fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif",
                cursor: 'pointer',
                flex: 1,
                pointerEvents: 'none'
              }}
            >
               {get('REGISTER_PRIVACY_LABEL') || '개인정보처리방침에 동의합니다'} {agreements.privacy ? '✓' : `(${get('REGISTER_VIEW_CONTENT') || '내용 확인하기'})`}
            </label>
          </div>
          
          {errors.privacy && (
            <div style={{ color: '#ef4444', fontSize: '12px', margin: '0 0 8px 0', fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif", }}>
              {errors.privacy}
            </div>
          )}

          {/* Terms Agreement */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '8px',
            padding: '8px',
            border: errors.terms ? '1px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: agreements.terms ? '#f0fdf4' : '#ffffff',
            fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif",
            cursor: 'pointer'
          }}
          onClick={() => handleAgreementClick('terms')}>
            <input
              type="checkbox"
              id="terms-agreement"
              checked={agreements.terms}
              readOnly
              style={{ 
                marginRight: '8px',
                cursor: 'pointer',
                accentColor: 'rgb(202 255 237)',
                pointerEvents: 'none'
              }}
            />
            <label 
              htmlFor="terms-agreement"
              style={{ 
                fontSize: '13px',
                fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif",
                cursor: 'pointer',
                flex: 1,
                pointerEvents: 'none'
              }}
            >
              {get('REGISTER_TERMS_LABEL') || '이용약관에 동의합니다'} {agreements.terms ? '✓' : `(${get('REGISTER_VIEW_CONTENT') || '내용 확인하기'})`}
            </label>
          </div>
          
          {errors.terms && (
            <div style={{ color: '#ef4444', fontSize: '12px', margin: '0 0 8px 0', fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif", }}>
              {errors.terms}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <SketchBtn
          type="submit"
          className="sketch-button" 
          variant="event"
          disabled={isLoading}
          style={{ width: '100%' }}
        >
          <HatchPattern opacity={0.8} />
          {isLoading ? (get('LOADING_REGISTER') || '회원가입 중...') : (get('title.text.11') || '회원가입')}
        </SketchBtn>
      </form>

      {/* Loading Screen */}
      <LoadingScreen 
        variant="cocktail"
        loadingText={get('loading.register') || "회원가입 처리 중..."}
        isVisible={isLoading} 
      />
    </div>
  );
}