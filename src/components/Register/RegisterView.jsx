import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import SketchInput from '@components/SketchInput';
import SketchBtn from '@components/SketchBtn';
import Header from '@components/Header';
import HatchPattern from '@components/HatchPattern';
import InitFooter from '@components/InitFooter';
import SketchHeader from '@components/SketchHeader';
import LoadingScreen from '@components/LoadingScreen';

import qs from 'qs';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

export default function RegisterView() {
  const { messages, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();  
  const navigate = useNavigate();
  const location = useLocation();

  // 동의 체크박스 상태
  const [agreements, setAgreements] = useState({
    privacy: false,
    terms: false
  });

  useEffect(() => {
  window.scrollTo(0, 0);
  
  if (messages && Object.keys(messages).length > 0) {
    console.log('✅ Messages loaded:', messages);
    console.log('Current language set to:', currentLang);
    window.scrollTo(0, 0);
  }

  // URL 파라미터에서 동의 상태 확인
  const urlParams = new URLSearchParams(location.search);
  const privacyParam = urlParams.get('privacy');
  const termsParam = urlParams.get('terms');

  // URL 파라미터가 있을 때만 처리
  if (privacyParam || termsParam) {
    // 현재 sessionStorage 상태를 기반으로 시작
    const currentPrivacy = sessionStorage.getItem('privacy_agreed') === 'true';
    const currentTerms = sessionStorage.getItem('terms_agreed') === 'true';
    
    let newPrivacy = currentPrivacy;
    let newTerms = currentTerms;
    
    // URL 파라미터에 따라 업데이트
    if (privacyParam === 'agreed') {
      newPrivacy = true;
      sessionStorage.setItem('privacy_agreed', 'true');
    } else if (privacyParam === 'declined') {
      newPrivacy = false;
      sessionStorage.removeItem('privacy_agreed');
    }
    
    if (termsParam === 'agreed') {
      newTerms = true;
      sessionStorage.setItem('terms_agreed', 'true');
    } else if (termsParam === 'declined') {
      newTerms = false;
      sessionStorage.removeItem('terms_agreed');
    }
    
    setAgreements({
      privacy: newPrivacy,
      terms: newTerms
    });

    // URL 파라미터 제거
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  } else {
    // URL 파라미터가 없을 때는 sessionStorage에서만 읽기
    const storedPrivacy = sessionStorage.getItem('privacy_agreed') === 'true';
    const storedTerms = sessionStorage.getItem('terms_agreed') === 'true';
    
    setAgreements({
      privacy: storedPrivacy,
      terms: storedTerms
    });
  }
}, [messages, currentLang, location.search]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rePassword: '',
    nickname: '',
    gender: '',
    birth_date: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

const handleBack = () => {
  // sessionStorage 정리 (체크박스 초기화)
  sessionStorage.removeItem('privacy_agreed');
  sessionStorage.removeItem('terms_agreed');
  
  navigate('/login'); 
};

    const handleAgreementClick = (type) => {
    // 현재 페이지 정보를 저장하고 해당 페이지로 이동
    const currentPath = '/register';
    const targetPath = type === 'privacy' ? '/privacy' : '/terms';
    
    // 동의 페이지로 이동 (return URL 포함)
    navigate(`${targetPath}?returnUrl=${encodeURIComponent(currentPath)}&agreementType=${type}`);
  };


  const validateForm = () => {
    const newErrors = {};
    
    // 기존 validation...
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.rePassword) {
      newErrors.rePassword = 'Please confirm your password';
    } else if (formData.password !== formData.rePassword) {
      newErrors.rePassword = 'Passwords do not match';
    }

    if (formData.birth_date && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birth_date)) {
      newErrors.birth_date = 'Date format should be YYYY-MM-DD (e.g., 1988-08-18)';
    }

    if (formData.phone && !/^\d{3}-\d{4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Phone format should be 010-1234-5678';
    }

    // 동의 체크박스 validation
    if (!agreements.privacy) {
      newErrors.privacy = '개인정보처리방침에 동의해주세요';
    }
    
    if (!agreements.terms) {
      newErrors.terms = '이용약관에 동의해주세요';
    }
    
    return newErrors;
  };

  const registerUser = async (userData) => {
    try {
      const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';

      console.log(API_HOST);
      
      const response = await axios.post(
        `${API_HOST}/api/register`,
        qs.stringify({
          account_type: "user",
          login_type: "email",
          email: userData.email,
          passwd: userData.password,
          privacy_agreed: agreements.privacy,
          terms_agreed: agreements.terms
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        success: true,
        message: response.data.message || 'Registration successful! Please login.',
        data: response.data
      };
    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMessage = 'Registration failed. Please try again.';
      let errors = {};

      if (error.response) {
        if (error.response.data) {
          errorMessage = error.response.data.message || errorMessage;
          errors = error.response.data.errors || {};
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }

      return {
        success: false,
        message: errorMessage,
        errors: errors
      };
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage('');

    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      const result = await registerUser(formData);
      
      if (result.success) {
        setMessage(result.message);

        // 회원가입 성공 시 sessionStorage 정리
        sessionStorage.removeItem('privacy_agreed');
        sessionStorage.removeItem('terms_agreed');

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        if (result.errors && Object.keys(result.errors).length > 0) {
          setErrors(result.errors);
        } else {
          setErrors({ general: result.message });
        }
      }
    } else {
      setErrors(newErrors);
    }
    
    setIsLoading(false);
  };

  const handleSocialLogin = (provider) => {
    console.log(`${provider} 로그인 시도`);
  };

  return (
    <div className="register-container max-w-md mx-auto bg-white border-gray-800 p-6" style={{paddingBottom: '10px'}}>
      <SketchHeader 
        title={get('Menu1.1')}
        showBack={true}
        onBack={handleBack}
        rightButtons={[]}
      />
      
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

      <p className="description" style={{color:'#ca1212', margin: '0', textAlign: 'start', fontSize: '13px', fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"}}>
        * {get('Intro.description1')}
      </p>

      <form onSubmit={onSubmit} style={{padding: '5px'}}>
        {errors.general && (
          <div className="sketch-error-message">{errors.general}</div>
        )}
        {message && (
          <div className="sketch-success-message">{message}</div>
        )}

        {/* Email Input */}
        <p style={{ margin:'0', fontSize: '13px', marginBottom: '3px',fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"}}>{get('title.text.1')} *</p>
        <SketchInput
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isLoading}
          error={errors.email}
          variant="email" 
          style={{ marginBottom: '-8px' }} 
        />

        {/* Password Input */}
        <p style={{ margin:'0', fontSize: '13px', marginBottom: '3px',fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"}}>{get('title.text.2')} *</p>
        <SketchInput
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          disabled={isLoading}
          error={errors.password}
          variant="password"
          style={{ marginBottom: '-8px' }} 
        />

        {/* Re-Password Input */}
        <p style={{ margin:'0', fontSize: '13px', marginBottom: '3px',fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"}}>{get('title.text.3')} *</p>
        <SketchInput
          type="password"
          name="rePassword"
          value={formData.rePassword}
          onChange={handleInputChange}
          disabled={isLoading}
          error={errors.rePassword}
          variant="password"
          style={{ marginBottom: '-8px' }} 
        />

        {/* Nickname Input */}
        <p style={{ margin:'0', fontSize: '13px', marginBottom: '3px',fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"}}>{get('title.text.4')}</p>
        <SketchInput
          type="text"
          name="nickname"
          value={formData.nickname}
          onChange={handleInputChange}
          disabled={isLoading}
          error={errors.nickname}
          variant="text"
          style={{ marginBottom: '-8px' }} 
        />

        {/* Gender Select */}
        <p style={{ margin:'0', fontSize: '13px', marginBottom: '3px',fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"}}>{get('title.text.5')}</p>
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
            marginBottom: '1rem',
            backgroundColor: '#fff',
            fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"
          }}
        >
          <option value="">{get('title.text.6')}</option>
          <option value="M">{get('title.text.7')}</option>
          <option value="F">{get('title.text.8')}</option>
        </select>

        {/* Birth Date Input */}
        <p style={{ margin:'0', fontSize: '13px', marginBottom: '3px',fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"}}>{get('title.text.9')}</p>
        <SketchInput
          type="date"
          name="birth_date"
          value={formData.birth_date}
          onChange={handleInputChange}
          disabled={isLoading}
          error={errors.birth_date}
          variant="text"
          placeholder="1988-08-18"
          style={{ marginBottom: '-8px' }} 
        />

        {/* Phone Input */}
        <p style={{ margin:'0', fontSize: '13px', marginBottom: '3px',fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"}}>{get('title.text.10')}</p>
        <SketchInput
          style={{ fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif" }}
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          disabled={isLoading}
          error={errors.phone}
          variant="text"
          placeholder="010-1234-5678"
        />

        {/* 동의 체크박스 섹션 */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
          <p style={{ 
            margin: '0 0 10px 0', 
            fontSize: '14px', 
            fontWeight: 'bold',
            fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"
          }}>
            필수 동의사항 *
          </p>

          {/* 개인정보처리방침 동의 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '8px',
            padding: '8px',
            border: errors.privacy ? '1px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: agreements.privacy ? '#f0fdf4' : '#ffffff'
          }}>
           <input
              type="checkbox"
              id="privacy-agreement"
              checked={agreements.privacy}
              readOnly
              onClick={() => handleAgreementClick('privacy')} // 추가
              style={{ 
                marginRight: '8px',
                cursor: 'pointer',
                accentColor: 'rgb(202 255 237)'
              }}
            />
            <label 
              htmlFor="privacy-agreement"
              style={{ 
                fontSize: '13px',
                fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif",
                cursor: 'pointer',
                flex: 1
              }}
              onClick={() => handleAgreementClick('privacy')}
            >
              개인정보처리방침에 동의합니다 {agreements.privacy ? '✓' : '(내용 확인하기)'}
            </label>
          </div>
          {errors.privacy && (
            <p style={{ color: '#ef4444', fontSize: '12px', margin: '0 0 8px 0' }}>
              {errors.privacy}
            </p>
          )}

          {/* 이용약관 동의 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '8px',
            padding: '8px',
            border: errors.terms ? '1px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: agreements.terms ? '#f0fdf4' : '#ffffff'
          }}>
            <input
              type="checkbox"
              id="terms-agreement"
              checked={agreements.terms}
              readOnly
              onClick={() => handleAgreementClick('terms')} // 추가
              style={{ 
                marginRight: '8px',
                cursor: 'pointer',
                accentColor: 'rgb(202 255 237)'
              }}
            />
            <label 
              htmlFor="terms-agreement"
              style={{ 
                fontSize: '13px',
                fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif",
                cursor: 'pointer',
                flex: 1
              }}
              onClick={() => handleAgreementClick('terms')}
            >
              이용약관에 동의합니다 {agreements.terms ? '✓' : '(내용 확인하기)'}
            </label>
          </div>
          {errors.terms && (
            <p style={{ color: '#ef4444', fontSize: '12px', margin: '0 0 8px 0' }}>
              {errors.terms}
            </p>
          )}
        </div>

        {/* Sign Up Button */}
        <SketchBtn
          type="submit"
          className="sketch-button" 
          variant="event"
          disabled={isLoading}
        >
          <HatchPattern opacity={0.8} />
          {get('title.text.11')}
        </SketchBtn>
      </form>

      {/* 소셜 로그인 */}
      {/* <div style={{ textAlign: 'center', marginTop: '10px', fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"}}>
        <p style={{marginBottom: '0', fontSize: '0.875rem', color: '#6b7280' }}>
          {get('title.text.12')}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center'}}>
          <button 
            className="sketch-button sketch-button--secondary"
            onClick={() => handleSocialLogin('facebook')}
            style={{ width: '3rem', height: '3rem', borderRadius: '50%', padding: '0' }}
            aria-label="Sign up with Facebook"
          >
            f
          </button>
          
          <button 
            className="sketch-button sketch-button--secondary"
            onClick={() => handleSocialLogin('google')}
            style={{ width: '3rem', height: '3rem', borderRadius: '50%', padding: '0' }}
            aria-label="Sign up with Google"
          >
            G
          </button>
          
          <button 
            className="sketch-button sketch-button--secondary"
            onClick={() => handleSocialLogin('twitter')}
            style={{ width: '3rem', height: '3rem', borderRadius: '50%', padding: '0' }}
            aria-label="Sign up with Twitter"
          >
            🐦
          </button>
        </div>
      </div> */}

      {/* Login Link */}
      <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
        Already have an account?{' '}
        <a 
          href="#" 
          className="sketch-link sketch-link--primary"
          onClick={(e) => {
            e.preventDefault();
            navigate('/login');
          }}
        >
          Login
        </a>
      </div>

      <InitFooter 
                  className="custom-footer"
                  privacyHref="/privacy"
                  termsHref="/terms"
                />

      <LoadingScreen 
        variant="cocktail"
        loadingText="Loading..."
        isVisible={isLoading} 
      />
    </div>
  );
}