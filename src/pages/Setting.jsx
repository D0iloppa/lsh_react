import React, { useState, useEffect, useMemo, startTransition } from 'react';
import axios from 'axios';

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchInput from '@components/SketchInput';
import SketchHeader from '@components/SketchHeader'
import SketchDiv from '@components/SketchDiv'
import '@components/SketchComponents.css';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';

import { Check, X } from 'lucide-react';
import qs from 'qs';
import LoadingScreen from '@components/LoadingScreen';
import Swal from 'sweetalert2';
import ApiClient from '@utils/ApiClient';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SettingsPage = ({ 
  navigateToPageWithData, 
  PAGES,
  goBack,
  ...otherProps 
}) => {

  const { user, isLoggedIn, verifyPassword } = useAuth();
  const [userInfo, setUserInfo] = useState({});
  const [userSetting, setSetting] = useState([]);
  const API_HOST = import.meta.env.VITE_API_HOST; // ex: https://doil.chickenkiller.com/api
  
  const [language, setLanguage] = useState('ko'); 
  const [receiveUpdates, setReceiveUpdates] = useState(true);
  const [eventAlerts, setEventAlerts] = useState(false);
  const [email, setEmail] = useState('user@example.com');
  const [phone, setPhone] = useState('+84 123 456 789');
  const [shareLocation, setShareLocation] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  // 비밀번호 변경 관련 state
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [showNewPasswordFields, setShowNewPasswordFields] = useState(false);

  const { messages, isLoading, error, get, currentLang, setLanguage: setGlobalLang, availableLanguages, refresh } = useMsg();

  // useEffect 의존성 최적화 - 초기 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // useEffect 의존성 최적화 - 메시지 로딩
  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      console.log('Current language set to:', currentLang);
    }
  }, [messages, currentLang]);

  useEffect(() => {
  if (currentLang) {
    setLanguage(currentLang);
  }
}, [currentLang]);


  // useEffect 의존성 최적화 - 설정 데이터 로딩
  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const response = await axios.post(
          `${API_HOST}/api/selectSetting`,
          qs.stringify({ 
            user_id: user?.user_id || 1,
            user_type: 'user'
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            }
          }
        );

        const data = response.data || {};

        console.log("data.language", data.language)
        console.log(data.update_alert);
        
        setLanguage(data.language || 'ko');
        setReceiveUpdates(data.update_alert ?? true);
        setEventAlerts(data.event_alert ?? false);
        setEmail(data.email || 'user@example.com');
        setPhone(data.phone || '');
        setShareLocation(data.location_sharing ?? false);
        setShowOnlineStatus(data.online_status ?? true);

      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }
    };

    if (user?.user_id) {
      fetchSetting();
    }
  }, [user?.user_id, API_HOST]);


  const handleEventAlertsChange = (newValue) => {
    setEventAlerts(newValue);
    
    // 토글 변경 시 즉시 토스트 표시
    if (newValue) {
      toast.info('이벤트 알림 활성화 모드');
    } else {
      toast.info('이벤트 알림 비활성화 모드');
    }
  };


  // 비밀번호 상태를 메모이제이션으로 최적화
  const passwordState = useMemo(() => ({
    isVerified: isPasswordVerified,
    showFields: showNewPasswordFields,
    isVerifying: isVerifyingPassword
  }), [isPasswordVerified, showNewPasswordFields, isVerifyingPassword]);

  // 언어 변경 핸들러 수정
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang); // 로컬 state
    setGlobalLang(newLang); // 전역 state (body data-lang 변경)
  };

  const handleBack = () => {
    console.log('Back 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.HOME);
  };

  const handleSave = async () => {
    try {
      const payload = {
        user_id: user?.user_id || 1,
        language: language || '',
        update_alert: receiveUpdates,
        event_alert: eventAlerts,
        email: email || '',
        phone: phone || '',
        location_sharing: shareLocation,
        online_status: showOnlineStatus,
        user_type: 'user'
      };

      console.log('저장할 정보:', payload);

      await axios.post(
        `${API_HOST}/api/updateSetting`,
        qs.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );

      if (setGlobalLang && language !== currentLang) {
        setGlobalLang(language);
        console.log('언어 변경됨:', language);
        
        // CSS 변수도 함께 업데이트 (폰트 즉시 적용)
        if (language === 'ja') {
          document.documentElement.style.setProperty('--font-primary', "'NotoSansJP', 'Meiryo', 'Hiragino Kaku Gothic ProN', sans-serif");
        } else {
          document.documentElement.style.setProperty('--font-primary', "'BMHanna', 'Comic Sans MS', cursive, sans-serif");
        }
      }
      
      await Swal.fire({
        title: get('SETTINGS_SAVE_SUCCESS'),
        icon: 'success',
        confirmButtonText: get('SWAL_CONFIRM_BUTTON')
      });

    } catch (error) {
      await Swal.fire({
        title: get('SETTINGS_SAVE_ERROR'),
        icon: 'error',
        confirmButtonText: get('SWAL_CONFIRM_BUTTON')
      });
    }
  };

  // 현재 비밀번호 인증 - 최적화된 버전
  const handleVerifyCurrentPassword = async () => {
    if (!password.current.trim()) {
      Swal.fire({
        title: get('SWAL_ERROR_TITLE'),
        text: get('PASSWORD_ENTER_CURRENT'),
        icon: 'error'
      });
      return;
    }
  
    setIsVerifyingPassword(true);
    try {
      const response = await verifyPassword({
        login_id: user.login_id,
        email: user.login_id,
        passwd: password.current,
        login_type: user.login_type,
        account_type: user.type
      });
      
      console.log('response', response);
  
      const { success = false } = response;
  
      if (success) {
        // React 18의 배치 업데이트를 활용하여 한 번에 업데이트
        startTransition(() => {
          setIsPasswordVerified(true);
          setShowNewPasswordFields(true);
        });
        
        Swal.fire({
          title: get('SWAL_SUCCESS_TITLE'),
          text: get('PASSWORD_VERIFY_SUCCESS'),
          icon: 'success',
          timer: 1500
        });
      } else {
        setIsPasswordVerified(false);
        Swal.fire({
          title: get('SWAL_ERROR_TITLE'),
          text: get('PASSWORD_CURRENT_INCORRECT'),
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('Password verification error:', error);
      setIsPasswordVerified(false);
      Swal.fire({
        title: get('SWAL_ERROR_TITLE'),
        text: get('PASSWORD_VERIFY_FAILED'),
        icon: 'error'
      });
    } finally {
      setIsVerifyingPassword(false);
    }
  };
  
  // 새 비밀번호 저장
  const handleSaveNewPassword = async () => {
    // 1. Current Password vs New Password 체크
    if (password.current === password.new) {
      Swal.fire({
        title: get('SWAL_ERROR_TITLE'),
        text: get('PASSWORD_MUST_BE_DIFFERENT'),
        icon: 'error'
      });
      return;
    }
  
    // 2. New Password vs Confirm Password 체크
    if (password.new !== password.confirm) {
      Swal.fire({
        title: get('SWAL_ERROR_TITLE'),
        text: get('PASSWORD_CONFIRM_MISMATCH'),
        icon: 'error'
      });
      return;
    }
  
    // 3. 새 비밀번호 길이 체크
    if (password.new.length < 6) {
      Swal.fire({
        title: get('SWAL_ERROR_TITLE'),
        text: get('PASSWORD_MIN_LENGTH'),
        icon: 'error'
      });
      return;
    }
  
    try {
      const response = await ApiClient.postForm('/api/UpdatePassword', {
        login_type: user.login_type,
        account_type: user.account_type,
        login_id: user.login_id,
        email: user.login_id,
        passwd: password.new,
        rePasswd: password.confirm,
      });
  
      if (response.success) {
        Swal.fire({
          title: get('SWAL_SUCCESS_TITLE'),
          text: get('PASSWORD_UPDATE_SUCCESS'),
          icon: 'success'
        });
        
        // 폼 초기화
        setPassword({ current: '', new: '', confirm: '' });
        setIsPasswordVerified(false);
        setShowNewPasswordFields(false);
      } else {
        Swal.fire({
          title: get('SWAL_ERROR_TITLE'),
          text: response.message || get('PASSWORD_UPDATE_FAILED'),
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('Password update error:', error);
      Swal.fire({
        title: get('SWAL_ERROR_TITLE'),
        text: get('PASSWORD_UPDATE_FAILED'),
        icon: 'error'
      });
    }
  };
  





  const ToggleSwitch = ({ checked, onChange, label }) => (
    <div className="toggle-container">
      <span className="toggle-label">{label}</span>
      <div 
        className={`toggle-switch ${checked ? 'checked' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <div className="toggle-knob"></div>
      </div>
    </div>
  );

  return (
    <>
      <style jsx="true">{`
        .settings-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;

           font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }


        .page-title {
          
          font-size: 1.3rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .settings-content {
          padding: 1.5rem;
        }

        .settings-section {
          background-color: #f8fafc;
          padding: 1.5rem;
          margin-bottom: 1rem;
          transform: rotate(-0.1deg);
          position: relative;
          overflow: hidden;
        }

        .settings-section:nth-child(even) {
          transform: rotate(0.1deg);
        }

        .section-content {
          position: relative;
          z-index: 10;
        }

        .section-title {
          font-size: 1rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 1rem 0;
        }

        .language-select {
        font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
           border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
          width: 100%;
          height: 50px;
          padding: 0.75rem;
          background-color: white;
          cursor: pointer;
          transform: rotate(0.1deg);
        }

        .toggle-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .toggle-container:last-child {
          margin-bottom: 0;
        }

        .toggle-label {
          font-size: 0.9rem;
          color: #374151;
        }

        .toggle-switch {
          width: 3rem;
          height: 1.5rem;
          background-color: #d1d5db;
          border: 1px solid #1f2937;
          border-radius: 1rem;
          position: relative;
          cursor: pointer;
          transition: all 0.3s;
        }

        .toggle-switch.checked {
          background: linear-gradient(135deg, #00f0ff, #fff0d8);
        }

        .toggle-knob {
          width: 1rem;
          height: 1rem;
          background-color: white;
          border: 1px solid #1f2937;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 0.125rem;
          transform: translateY(-50%);
          transition: all 0.3s;
        }

        .toggle-switch.checked .toggle-knob {
          left: 1.625rem;
        }

        .form-field {
          margin-bottom: 1rem;
        }

        .form-field:last-child {
          margin-bottom: 0;
        }

        .field-label {
          font-size: 0.9rem;
          color: #374151;
          margin-bottom: 0.5rem;
          display: block;
        }

        .logout-section {
          text-align: center;
          padding-bottom: 1rem;
        }

        .logout-button {
          border: 3px solid #1f2937;
          background-color: #f3f4f6;
          padding: 0.75rem 2rem;
          font-weight: bold;
          cursor: pointer;
          transform: rotate(0.2deg);
          box-shadow: 2px 2px 0px #1f2937;
          transition: all 0.2s;
        }

        .logout-button:hover {
          transform: rotate(0.2deg) scale(1.05);
          box-shadow: 3px 3px 0px #1f2937;
        }

        @media (max-width: 480px) {
          .settings-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
        }
      `}</style>

      <div className="settings-container">
        {/* Header */}
        <SketchHeader 
          title={ get('Menu1.3') }
          showBack={true}
          onBack={goBack}
          rightButtons={[]}
        />
        

        {/* Settings Content */}
        <div className="settings-content">

          {/* Language Selection */}
          <SketchDiv className="settings-section" >
            <HatchPattern opacity={0.4} />
            <div className="section-content">
              <h2 className="section-title">{get('Setting1.1')}</h2>
              <select 
                className="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="vi">{get('language.name.vietnamese')}</option>
                <option value="kr">{get('language.name.korean')}</option>
                <option value="en">{get('language.name.english')}</option>
                <option value="ja">{get('language.name.japanese')}</option>  
                <option value="cn">{get('LANGUAGE_CHINESE')}</option>  
              </select>
            </div>
          </SketchDiv>

          {/* Notification Preferences */}
          <SketchDiv className="settings-section">
            <HatchPattern opacity={0.4} />
            <div className="section-content">
              <h2 className="section-title">{get('Setting1.2')}</h2>
              <div style={{display:'none'}}><ToggleSwitch 
                checked={receiveUpdates}
                onChange={setReceiveUpdates}
                label={get('Setting1.5')}
              /></div>
              <ToggleSwitch  
                checked={eventAlerts}
                onChange={handleEventAlertsChange}
                label={get('Setting1.6')}
              />
            </div>
          </SketchDiv>

          {/* Account Details */}
          <SketchDiv className="settings-section">
            <HatchPattern opacity={0.4} />
            <div className="section-content">
              <h2 className="section-title">{get('Setting1.3')}</h2>
             <div className="form-field">
                <label className="field-label">{get('title.text.1')}</label>
                <span style={{ display: 'inline-block', padding: '0.5rem 0' }}>
                  {email || get('PROFILE_NO_EMAIL')}
                </span>
              </div>
              <div className="form-field" style={{display:'none'}}>
                <label className="field-label">{get('title.text.13')}</label>
                <SketchInput
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* 암호 변경 섹션*/}
              <div className="password-section">
                <div className="section-title">
                  {get('Staff.setting.password.title') || get('STAFF_SETTINGS_CHANGE_PASSWORD_TITLE')}
                </div>
                  <div className="input-row" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <div style={{flex: 1}}>
                      <SketchInput
                        name="currentPassword"
                        value={password.current}
                        onChange={e => setPassword(p => ({ ...p, current: e.target.value }))}
                        placeholder={get('Staff.setting.password.current') || get('STAFF_SETTINGS_CURRENT_PASSWORD_PLACEHOLDER')}
                        type="password" style={{fontFamily: 'none', padding:'0.4rem'}}
                        disabled={isPasswordVerified}
                      />
                    </div>
                    {!isPasswordVerified ? (
                      <SketchBtn 
                        variant="accent" 
                        size="small" 
                        onClick={handleVerifyCurrentPassword}
                        disabled={isVerifyingPassword}
                        style={{width: '30%', marginBottom : '0.9rem', padding:'0.5rem 0.75rem'}}
                      >
                        <HatchPattern opacity={0.6} />
                        {isVerifyingPassword 
                          ? get('STAFF_SETTINGS_CHECKING_BUTTON') 
                          : get('STAFF_SETTINGS_CHECK_BUTTON')
                        }
                      </SketchBtn>
                    ) : (
                      <div style={{color: 'green', fontSize: '20px'}}>
                        <Check size={20} />
                      </div>
                    )}
                  </div>
                  
                  {showNewPasswordFields && (
                    <>
                      <div className="input-row">
                        <SketchInput
                          name="newPassword"
                          value={password.new}
                          onChange={e => setPassword(p => ({ ...p, new: e.target.value }))}
                          placeholder={get('Staff.setting.password.new') || get('STAFF_SETTINGS_NEW_PASSWORD_PLACEHOLDER')}
                          type="password" style={{fontFamily: 'none'}}
                        />
                      </div>
                      <div className="input-row">
                        <SketchInput
                          name="confirmPassword"
                          value={password.confirm}
                          onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))}
                          placeholder={get('Staff.setting.password.confirm') || get('STAFF_SETTINGS_CONFIRM_PASSWORD_PLACEHOLDER')}
                          type="password" style={{fontFamily: 'none'}}
                        />
                      </div>
                      <div className="save-btn-row">
                        <SketchBtn 
                          variant="accent" 
                          size="small" 
                          style={{width: '30%'}}
                          onClick={handleSaveNewPassword}
                        >
                          <HatchPattern opacity={0.6} />
                          {get('STAFF_SAVE_BUTTON') || get('STAFF_SETTINGS_SAVE_BUTTON')}
                        </SketchBtn>
                      </div>
                    </>
                  )}
              </div>



            </div>
          </SketchDiv>

          {/* Privacy Settings */}
          <SketchDiv className="settings-section" style={{ display: 'none' }}>
            <HatchPattern opacity={0.4} />
            <div className="section-content">
              <h2 className="section-title">{get('Setting1.4')}</h2>
              <ToggleSwitch 
                checked={shareLocation}
                onChange={setShareLocation}
                label={get('Setting1.7')}
              />
              <ToggleSwitch 
                checked={showOnlineStatus}
                onChange={setShowOnlineStatus}
                label={get('Setting1.8')}
              />
            </div>
          </SketchDiv>





          {/* Logout */}
          <div className="logout-section">
            <SketchBtn className="danger" onClick={handleSave}>
              <HatchPattern opacity={0.8} />
              {get('btn.save.1')}
            </SketchBtn>
          </div>
           <LoadingScreen 
                     variant="cocktail"
                     loadingText="Loading..."
                     isVisible={isLoading} 
                   />
        </div>
      </div>

      <ToastContainer
      position="top-center"
      autoClose={2000}
      hideProgressBar={true}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
       style={{
    top: '65px',   // 100px → 60px로 줄여서 더 아래로
    zIndex: 9999
  }}
    />
    </>
  );
};

export default SettingsPage;