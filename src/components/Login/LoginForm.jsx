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
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);

  // 개발용
  /*
  const [email, setEmail] = useState('manager@lsh.com');
  const [password, setPassword] = useState('webdnpfzjs1!');
  */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [accountType, setAccountType] = useState('manager');
  // setStatus가 props로 전달된다고 가정 (없으면 주석처리)
  // const { setStatus } = props;

  const { login, user, loading, setLoginType: setAuthLoginType } = useAuth(); // ← AuthContext의 setLoginType 추가
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage('');


    let login_type = (accountType === 'manager') ? 'email' : 'id';
    
    const result = await login({
      login_id: email,
      passwd: password,
      account_type: accountType,
      login_type: login_type
    });
    
    if (result.success) {

        
      setMessage(result.message);
      // AuthContext에 accountType 저장
      setAuthLoginType(accountType);
    
    setTimeout(() => {
      if (accountType === 'manager') {
      
        const venueId = result.user.venue_id;
        //const venueId = 0;
        
        if (!venueId || venueId == 0 || venueId == null) {
          // venue_id가 null, 0, 또는 없으면 튜토리얼로 이동












          navigate('/managerTuto');
        } else {
          // venue_id가 있으면 메인으로 이동
          navigate('/manager');
        }
      } else if (accountType === 'staff') {
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

       // Swal을 사용한 폼 다이얼로그
    const { value: formValues } = await Swal.fire({
      title: get('INQUIRY_TITLE'),
      html: `
          <div style="text-align: left;">
              <div style="margin-bottom: 15px;">
                  <label style="display: block; margin-bottom: 5px; font-weight: bold;">${get('INQUIRY_TYPE_LABEL')}</label>
                  <select id="swal-inquiry-type" style="width: 95%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                      <option value="">${get('INQUIRY_TYPE_PLACEHOLDER')}</option>
                      <option value="account">${get('INQUIRY_TYPE_ACCOUNT')}</option>
                      <option value="password">${get('INQUIRY_TYPE_PASSWORD')}</option>
                  </select>
              </div>
              
              <div style="margin-bottom: 15px;">
                  <label style="display: block; margin-bottom: 5px; font-weight: bold;">${get('VENUE_NAME_LABEL')}</label>
                  <input id="swal-venue-name" type="text" placeholder="${get('VENUE_NAME_PLACEHOLDER')}" 
                        style="width: 90%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
              
              <div style="margin-bottom: 15px;">
                  <label style="display: block; margin-bottom: 5px; font-weight: bold;">${get('INQUIRER_LABEL')}</label>
                  <input id="swal-email" type="email" placeholder="${get('INQUIRER_PLACEHOLDER')}" 
                        style="width: 90%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
              
              <div style="margin-bottom: 15px;">
                  <label style="display: block; margin-bottom: 5px; font-weight: bold;">${get('INQUIRY_CONTENT_LABEL')}</label>
                  <textarea id="swal-inquiry-content" placeholder="${get('INQUIRY_CONTENT_PLACEHOLDER')}" 
                            style="width: 90%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; height: 100px; resize: vertical;"></textarea>
              </div>
          </div>
      `,
      showCancelButton: true,
      confirmButtonText: get('INQUIRY_SUBMIT'),
      cancelButtonText: get('INQUIRY_CANCEL'),
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      focusConfirm: false,
      preConfirm: () => {
          // 폼 데이터 수집
          const inquiryType = document.getElementById('swal-inquiry-type').value;
          const venueName = document.getElementById('swal-venue-name').value;
          const email = document.getElementById('swal-email').value;
          const inquiryContent = document.getElementById('swal-inquiry-content').value;
          
          // 유효성 검사
          if (!inquiryType) {
              Swal.showValidationMessage(get('INQUIRY_VALIDATION_TYPE'));
              return false;
          }
          if (!venueName.trim()) {
              Swal.showValidationMessage(get('INQUIRY_VALIDATION_VENUE'));
              return false;
          }
          if (!email.trim()) {
              Swal.showValidationMessage(get('INQUIRY_VALIDATION_EMAIL'));
              return false;
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              Swal.showValidationMessage(get('INQUIRY_VALIDATION_EMAIL_FORMAT'));
              return false;
          }
          if (!inquiryContent.trim()) {
              Swal.showValidationMessage(get('INQUIRY_VALIDATION_CONTENT'));
              return false;
          }
          
          return {
              inquiryType,
              venueName: venueName.trim(),
              email: email.trim(),
              inquiryContent: inquiryContent.trim()
          };
      }
  });

  if (formValues) {
      try {
          // 로딩 표시
          Swal.fire({
              title: get('INQUIRY_SENDING'),
              allowOutsideClick: false,
              didOpen: () => {
                  Swal.showLoading();
              }
          });

          // API 호출
          const response = await ApiClient.postForm('/api/insertSupport', {
              user_id : 1,
              email: formValues.email,
              name: formValues.email,
              contents: JSON.stringify({
                inquiry_type: formValues.inquiryType,
                venue_name: formValues.venueName,
                inquiry_content: formValues.inquiryContent
              })
          });

          // 성공 메시지
          Swal.fire({
              title: get('INQUIRY_SUCCESS_TITLE'),
              text: get('INQUIRY_SUCCESS_MESSAGE'),
              icon: 'success',
              confirmButtonText: get('INQUIRY_CONFIRM'),
              confirmButtonColor: '#3085d6'
          });

      } catch (error) {
          console.error('문의 전송 실패:', error);
          
          // 에러 메시지
          Swal.fire({
              title: get('INQUIRY_ERROR_TITLE'),
              text: get('INQUIRY_ERROR_MESSAGE'),
              icon: 'error',
              confirmButtonText: get('INQUIRY_CONFIRM'),
              confirmButtonColor: '#d33'
          });
      }
  }



    /*
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
    */
  };

  return (
    <>
      <h2 style={{display: 'none'}} className="sketch-title">{ get('Login1.1') } </h2>


    {/* Account Type Radio Buttons */}
    <div style={{ margin: '1rem 0', textAlign: 'center' }}>
            <label>
              <input
                type="radio"
                name="accountType"
                value="manager"
                checked={accountType === 'manager'}
                onChange={() => {
                  setAccountType('manager');
                  setAuthLoginType('manager'); // AuthContext에도 즉시 저장
                  if (typeof setStatus === 'function') setStatus({ accountType: 'manager' });
                }}
              />
              {get('BOOKING_MANAGER_CHAT')}
            </label>
            <label style={{ marginLeft: '1rem' }}>
              <input
                type="radio"
                name="accountType"
                value="staff"
                checked={accountType === 'staff'}
                onChange={() => {
                  setAccountType('staff');
                  setAuthLoginType('staff'); // AuthContext에도 즉시 저장
                  if (typeof setStatus === 'function') setStatus({ accountType: 'staff' });
                }}
              />
              {get('title.text.16')}
            </label>
          </div>

      
      <form onSubmit={onSubmit}>
        
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
        {message && (
          <div className="sketch-success-message" style={{marginTop: '-0.5rem', marginBottom: '0.5rem'}}>{message}</div>
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



      </form>





      <LoadingScreen  isVisible={isLoading}  
        // loadingText="Loading" 
      />
    </>
  );
}