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

  // 개발용
  const [email, setEmail] = useState('manager@lsh.com');
  const [password, setPassword] = useState('webdnpfzjs1!');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [loginType, setLoginType] = useState('manager');
  // setStatus가 props로 전달된다고 가정 (없으면 주석처리)
  // const { setStatus } = props;

  const { login, user, loading, setLoginType: setAuthLoginType } = useAuth(); // ← AuthContext의 setLoginType 추가
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage('');

    const result = await login(email, password, loginType);
    
    if (result.success) {
      setMessage(result.message);
      // AuthContext에 loginType 저장
      setAuthLoginType(loginType);
    
    setTimeout(() => {
      if (loginType === 'manager') {
      
        const venueId = user?.venue_id;
      
        if (!venueId || venueId == 0 || venueId == null) {
          // venue_id가 null, 0, 또는 없으면 튜토리얼로 이동
          navigate('/managerTuto');
        } else {
          // venue_id가 있으면 메인으로 이동
          navigate('/manager');
        }
      } else if (loginType === 'staff') {
        navigate('/staff');
      } else {
        navigate('/manager'); // 기본값
      }
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
      <h2 className="sketch-title">{ get('Login1.1') } </h2>


    {/* Login Type Radio Buttons */}
    <div style={{ margin: '1rem 0', textAlign: 'center' }}>
            <label>
              <input
                type="radio"
                name="loginType"
                value="manager"
                checked={loginType === 'manager'}
                onChange={() => {
                  setLoginType('manager');
                  setAuthLoginType('manager'); // AuthContext에도 즉시 저장
                  if (typeof setStatus === 'function') setStatus({ loginType: 'manager' });
                }}
              />
              MANAGER
            </label>
            <label style={{ marginLeft: '1rem' }}>
              <input
                type="radio"
                name="loginType"
                value="staff"
                checked={loginType === 'staff'}
                onChange={() => {
                  setLoginType('staff');
                  setAuthLoginType('staff'); // AuthContext에도 즉시 저장
                  if (typeof setStatus === 'function') setStatus({ loginType: 'staff' });
                }}
              />
              STAFF
            </label>
          </div>

      
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
          type="text"
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
      <div style={{ display: 'none', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginTop: '10px' }}>
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
          { get('Menu1.1') }
        </a>
      </div>
                          <LoadingScreen 
        isVisible={isLoading} 
        // loadingText="Loading" 
/>

     
    </>
  );
}