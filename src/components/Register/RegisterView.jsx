import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';

import SketchInput from '@components/SketchInput';
import SketchBtn from '@components/SketchBtn';
import Header from '@components/Header';
import HatchPattern from '@components/HatchPattern';
import InitFooter2 from '@components/InitFooter2';
import SketchHeader from '@components/SketchHeader';
import LoadingScreen from '@components/LoadingScreen';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import Swal from 'sweetalert2';

// Constants
const STORAGE_KEYS = {
  PRIVACY: 'manager_privacy_agreed',
  TERMS: 'manager_terms_agreed',
  FORM_DATA: 'manager_register_formData'
};

const INITIAL_FORM_DATA = {
  email: '',
  password: '',
  rePassword: '',
  nickname: ''
};

const INITIAL_AGREEMENTS = {
  privacy: false,
  terms: false
};

export default function RegisterView() {
  const { messages, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
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
  const validateNickname = (nickname) => {
    if (!nickname.trim()) return get('VALIDATION_ZALO_REQUIRED') || '닉네임을 입력해주세요';
    if (nickname.trim().length < 2) return get('VALIDATION_ZALO_MIN_LENGTH') || '닉네임은 최소 2자 이상이어야 합니다';
    if (nickname.trim().length > 40) return get('VALIDATION_ZALO_MAX_LENGTH') || '닉네임은 20자 이하로 입력해주세요';
    return null;
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.email.trim()) {
      newErrors.email = get('VALIDATION_EMAIL_REQUIRED') || 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = get('VALIDATION_EMAIL_INVALID') || 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = get('VALIDATION_PASSWORD_REQUIRED') || 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = get('VALIDATION_PASSWORD_MIN_LENGTH') || 'Password must be at least 6 characters';
    }
    
    if (!formData.rePassword) {
      newErrors.rePassword = get('VALIDATION_RE_PASSWORD_REQUIRED') || 'Please confirm your password';
    } else if (formData.password !== formData.rePassword) {
      newErrors.rePassword = get('VALIDATION_RE_PASSWORD_MISMATCH') || 'Passwords do not match';
    }

    const nicknameError = validateNickname(formData.nickname);  
    if (nicknameError) newErrors.nickname = nicknameError;

    // Agreement validations
    if (!agreements.privacy) {
      newErrors.privacy = get('VALIDATION_PRIVACY_REQUIRED') || '개인정보처리방침에 동의해주세요';
    }

    if (!agreements.terms) {
      newErrors.terms = get('VALIDATION_TERMS_REQUIRED') || '이용약관에 동의해주세요';
    }
    
    return newErrors;
  }, [formData, agreements, get]);

  // Event Handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      saveFormData(newData);
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors, saveFormData]);

  const handleAgreementClick = useCallback((type) => {
    const currentPath = '/register';
    const targetPath = type === 'privacy' ? '/privacy' : '/terms';
    
    navigate(`${targetPath}?returnUrl=${encodeURIComponent(currentPath)}&agreementType=${type}`);
  }, [navigate]);

  const registerUser = async (userData) => {
    try {
      const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
      
      try {
        const response = await axios.post(
          `${API_HOST}/api/register`,
          qs.stringify({
            account_type: "manager",
            login_type: "email",
            login_id: userData.email,
            nickname:userData.nickname,
            email: userData.email,
            passwd: userData.password,
            privacy_agreed: agreements.privacy,
            terms_agreed: agreements.terms
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 10000
          }
        );

        // 에러 응답 처리
        if (response.data.error) {

          await Swal.fire({
            title: get('REGISTER_ERROR_DUPLICATE') || '이미 사용 중인 이메일입니다',
            icon: 'error',
            confirmButtonText: get('SWAL_CONFIRM_BUTTON')
          });
          setIsLoading(false);
          return; // 현재 자리에 머무름
        }

        return {
          success: true,
          message: response.data.message || get('REGISTER_SUCCESS') || '회원가입이 완료되었습니다! 로그인해주세요.',
          data: response.data
        };
      } catch (error) {
        await Swal.fire({
            title: get('REGISTER_ERROR_SERVER') || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            icon: 'error',
            confirmButtonText: get('SWAL_CONFIRM_BUTTON')
          });
        console.error('회원가입 요청 중 오류:', error);
      }

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

    const handleBack = useCallback(() => {
      clearStorage();
      navigate('/login');
    }, [clearStorage, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    setErrors({});
    setMessage('');

    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      const result = await registerUser(formData);
      
      if (result.success) {
        await Swal.fire({
          title: get('REGISTER_SUCCESS_ALERT'),
          icon: 'success',
          confirmButtonText: get('SWAL_CONFIRM_BUTTON')
        });
        
        setMessage(result.message);
        clearStorage();
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
    
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }

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
  }, [messages, currentLang, location.search, loadFormData, loadAgreements, saveAgreements]);

  // Show loading if messages not loaded
  if (!messages || Object.keys(messages).length === 0) {
    return <LoadingScreen variant="cocktail" loadingText="Loading..." isVisible={true} />;
  }

  return (
    <div className="register-container max-w-md mx-auto bg-white border-gray-800 p-6">
      <SketchHeader 
        title={'MANAGER ' + get('Menu1.1')}
        showBack={true}
        onBack={handleBack}
        rightButtons={[]}
      />
      
      <div className='registerContainer' style={{padding: '1rem'}}>
        
        <p style={{ 
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
        </p>

        <div style={{
          color: '#ca1212', 
          margin: '0', 
          textAlign: 'start', 
          fontSize: '13px', 
          fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif",
          marginBottom: '1rem'
        }}>
          * {get('Intro.description1')}
        </div>

        <form onSubmit={onSubmit} style={{paddingBottom: '2rem'}}>
          {/* General Error/Success Message */}
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

          {/* Email Input */}
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

          {/* Password Input */}
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

          {/* Re-Password Input */}
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

          {/* Nickname Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              margin: '0', 
              fontSize: '13px', 
              marginBottom: '3px',
              fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif",
              display: 'block'
            }}>
              {get('INQUIRER_LABEL')} *
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
              <div style={{ color: '#ef4444', fontSize: '12px', margin: '0 0 8px 0', fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif" }}>
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
              <div style={{ color: '#ef4444', fontSize: '12px', margin: '0 0 8px 0', fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif" }}>
                {errors.terms}
              </div>
            )}
          </div>

          {/* Sign Up Button */}
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

      </div>

      {/* 푸터 */}
      <InitFooter2 />

      {/* Loading Screen */}
      <LoadingScreen 
        variant="cocktail"
        loadingText={get('loading.register') || "회원가입 처리 중..."}
        isVisible={isLoading} 
      />
    </div>
  );
}