import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SketchInput from '@components/SketchInput';
import SketchBtn from '@components/SketchBtn';
import Header from '@components/Header';
import HatchPattern from '@components/HatchPattern';
import InitFooter2 from '@components/InitFooter2';
import SketchHeader from '@components/SketchHeader';
import LoadingScreen from '@components/LoadingScreen';

import qs from 'qs';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';


export default function RegisterView() {

  const { messages, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();  
  
  useEffect(() => {
  window.scrollTo(0, 0);
      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }
    }, [messages, currentLang]);

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

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

   const validateNickname = (nickname) => {
    if (!nickname.trim()) return get('VALIDATION_NICKNAME_REQUIRED') || '닉네임을 입력해주세요';
    if (nickname.trim().length < 2) return get('VALIDATION_NICKNAME_MIN_LENGTH') || '닉네임은 최소 2자 이상이어야 합니다';
    if (nickname.trim().length > 20) return get('VALIDATION_NICKNAME_MAX_LENGTH') || '닉네임은 20자 이하로 입력해주세요';
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
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

     const nicknameError = validateNickname(formData.nickname);  
    if (nicknameError) newErrors.nickname = nicknameError;

    // Optional fields validation (format check only if provided)
    if (formData.birth_date && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birth_date)) {
      newErrors.birth_date = 'Date format should be YYYY-MM-DD (e.g., 1988-08-18)';
    }

    if (formData.phone && !/^\d{3}-\d{4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Phone format should be 010-1234-5678';
    }
    
    return newErrors;
  };

  const registerUser = async (userData) => {
    try {
      // API 호스트 설정 (환경변수나 설정에서 가져오기)
      const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';

      console.log(API_HOST);
      
      const response = await axios.post(
        `${API_HOST}/api/register`,
        qs.stringify({
          account_type: "user",
          login_type: "email",
          email: userData.email,
          passwd: userData.password
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
        // 서버에서 응답을 받은 경우
        if (error.response.data) {
          errorMessage = error.response.data.message || errorMessage;
          errors = error.response.data.errors || {};
        }
      } else if (error.request) {
        // 요청이 만들어졌지만 응답을 받지 못한 경우
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
        // 회원가입 성공 시 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login');
        }, 2000); // 2초 후 이동 (성공 메시지 표시용)
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
    // 소셜 로그인 처리
    console.log(`${provider} 로그인 시도`);
    // 실제 구현 시 OAuth 처리
  };

  return (
    <div className="register-container max-w-md mx-auto bg-white border-gray-800 p-6">
      <SketchHeader 
        title={  get('Menu1.1') }
        showBack={true}
        onBack={() => navigate(-1)}
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

      <form onSubmit={onSubmit} style={{padding: '5px'}}>
        {/* General Error/Success Message */}
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

        {/* Nickname Input (Optional) */}
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

        {/* Gender Select (Optional) */}
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

        {/* Birth Date Input (Optional) */}
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

        {/* Phone Input (Optional) */}
        <p style={{ margin:'0', fontSize: '13px', marginBottom: '3px',fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"}}>{get('title.text.10')}</p>
        <SketchInput style={{ fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif" }}
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          disabled={isLoading}
          error={errors.phone}
          variant="text"
          placeholder="010-1234-5678"
        />

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
      <div style={{ textAlign: 'center', marginTop: '10px' , fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"}}>
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
      </div>

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

      {/* 푸터 */}
      <InitFooter2 />

        <LoadingScreen 
        isVisible={isLoading} 
        // loadingText="Loading" 
/>
    </div>
  );
}