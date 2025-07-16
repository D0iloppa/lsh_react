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
import Swal from 'sweetalert2';
import ApiClient from '@utils/ApiClient';

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

    //const result = await login(email, password);

    const result = await login({
      login_id: email,
      passwd: password,
      account_type: 'user',
      login_type: 'email'
    });
    
    if (result.success) {
      setMessage(result.message);
      // 오버레이 모드인지 확인
        if (window.overlayLoginSuccessHandler) {
            // 오버레이 모드 - 전역 함수 실행
            console.log('오버레이 모드에서 Login 성공');
            window.overlayLoginSuccessHandler(result.user); // user 데이터만 전달
        } else {
            // 일반 모드 - 기존 방식
            console.log('일반 모드에서 Login 성공');
            setTimeout(() => {
               navigate('/main');
            }, 300);
        }
    } else {
      setErrors(result.errors);
    }
    
    setIsLoading(false);
  };

  const onForgotPassword = async () => {
    // SweetAlert2를 사용한 이메일 입력 다이얼로그
    const { value: emailForReset } = await Swal.fire({
      title: get('FORGOT_PASSWORD_TITLE') || '비밀번호 찾기',
      input: 'email',
      inputLabel: get('FORGOT_PASSWORD_EMAIL_LABEL') || '암호를 찾고자 하는 이메일을 입력해주세요',
      inputPlaceholder: get('FORGOT_PASSWORD_EMAIL_PLACEHOLDER') || 'example@email.com',
      showCancelButton: true,
      confirmButtonText: get('FORGOT_PASSWORD_CONFIRM') || '전송',
      cancelButtonText: get('FORGOT_PASSWORD_CANCEL') || '취소',
      inputValidator: (value) => {
        if (!value) {
          return get('FORGOT_PASSWORD_EMAIL_REQUIRED') || '이메일을 입력해주세요';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return get('FORGOT_PASSWORD_EMAIL_INVALID') || '올바른 이메일 형식을 입력해주세요';
        }
      }
    });

    if (emailForReset) {
      // 로딩 상태 표시
      Swal.fire({
        title: get('FORGOT_PASSWORD_SENDING') || '전송 중...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        // 실제 API 호출
        const result = await ApiClient.postForm('/api/forgetPassword', {
          account_type: 'user',
          email: emailForReset,
          login_type: 'email'
        });
        
        console.log('Password reset API response:', result);
        
        // 성공 메시지 표시
        Swal.fire({
          title: get('FORGOT_PASSWORD_SUCCESS_TITLE') || '전송 완료',
          text: get('FORGOT_PASSWORD_SUCCESS_MESSAGE') || '암호가 이메일로 전송되었습니다.',
          icon: 'success',
          confirmButtonText: get('FORGOT_PASSWORD_SUCCESS_CONFIRM') || '확인'
        });
        
      } catch (error) {
        console.error('Password reset error:', error);
        
        // 에러 메시지 표시
        Swal.fire({
          title: get('FORGOT_PASSWORD_ERROR_TITLE') || '전송 실패',
          text: get('FORGOT_PASSWORD_ERROR_MESSAGE') || '이메일 전송 중 오류가 발생했습니다. 다시 시도해주세요.',
          icon: 'error',
          confirmButtonText: get('FORGOT_PASSWORD_ERROR_CONFIRM') || '확인'
        });
      }
    }
  };

  return (
    <>
      <h2 className="sketch-title">{ get('Login1.1') }</h2>
      
      <form onSubmit={onSubmit}>
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

        {/* General Error/Success Message */}
        {errors.general && (
          <div className="sketch-error-message" style={{marginTop: '-0.5rem', marginBottom: '0.5rem'}}>
            {(() => {
              const errCode = errors.general || errors.errCode || errors.errMsg;

              const tmp = get(errCode);
              return tmp; // 또는 원하는 JSX 반환
            })()}
          </div>
        )}

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
        
        if (window.overlayRegisterHandler) {
            // 오버레이 모드 - 전역 함수 실행
            console.log('오버레이 모드에서 Register 클릭');
            window.overlayRegisterHandler();
        } else {
            // 일반 모드 - navigate 사용
            console.log('일반 모드에서 Register 클릭');
            navigate('/register');
        }
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