import React, { useState, useEffect } from 'react';
// import { handleLogin, handleForgotPassword } from './login';

import { useAuth } from '@contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import SketchInput from '@components/SketchInput';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';

import InitFooter from '@components/InitFooter';
import LoadingScreen from '@components/LoadingScreen';

export default function LoginForm() {

const { messages, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 당분간 test계정 바인딩 force
    setEmail('test@test.com');
    setPassword('dnpfzjs1!');
    
  }, []);
  

  const { login, loading } = useAuth(); // ← AuthContext 사용
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage('');

    const result = await login(email, password);
    
    if (result.success) {
      setMessage(result.message);
      // 로그인 성공 시 메인 페이지로 이동
      setTimeout(() => {
        navigate('/main');
      }, 300); // 0.3초 후 이동 (성공 메시지 표시용)
    } else {
      setErrors(result.errors);
    }
    
    setIsLoading(false);
  };

  const onForgotPassword = async () => {
    if (!email) {
      setErrors({ email: 'Please enter your email first' });
      return;
    }

    setIsLoading(true);
    const result = await handleForgotPassword(email);
    
    if (result.success) {
      setMessage(result.message);
      setErrors({});
    } else {
      setErrors({ general: result.error });
    }
    
    setIsLoading(false);
  };

  return (
    <>
      <h2 className="sketch-title">{ get('Login1.1') }</h2>
      
      <form onSubmit={onSubmit}>
        {/* General Error/Success Message */}
        {errors.general && (
          <div className="sketch-error-message">{errors.general}</div>
        )}
        {message && (
          <div className="sketch-success-message">{message}</div>
        )}

        {/* Email Input */}
        <SketchInput
          type="email"
          placeholder={get('title.text.1')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          error={errors.email}
          variant="email"
        />

        {/* Password Input */}
        <SketchInput
          type="password"
          placeholder={get('title.text.2')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          error={errors.password}
          variant="password"
        />

        {/* Login Button */}
        <SketchBtn
          type="submit"
          className="sketch-button"
          variant = 'event' 
          disabled={isLoading}
        >{<HatchPattern opacity={0.8} />}
          { get('Login1.1') }
        </SketchBtn>
      </form>

      {/* Forgot Password */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={onForgotPassword}
          disabled={isLoading}
          className="sketch-btn sketch-btn--secondary"
        >
          { get('Login1.2') }
        </button>
      </div>

      {/* Sign Up Link */}
      <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginTop: '10px' }}>
        { get('Login1.3') }{' '}
        {/* <a href="#" className="sketch-link sketch-link--primary">Sign Up</a> */}
         <a 
          href="#" 
          className="sketch-link sketch-link--primary"
          onClick={(e) => {
            e.preventDefault();
            navigate('/register');
          }}
        >
          { get('Welcome1.4') }
        </a>
      </div>
                          {/* <LoadingScreen 
          variant="cocktail"
          loadingText="Loading..."
          isVisible={isLoading} 
        /> */}

     
    </>
  );
}