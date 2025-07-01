import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';
import HatchPattern from '@components/HatchPattern';
import { MessageCircle, Mail, User } from 'lucide-react';
import Swal from 'sweetalert2';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';
import { ZoomIn, Check, X } from 'lucide-react';

import ApiClient from '@utils/ApiClient';

const ManagerSettings = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {


  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const { user, verifyPassword, logout } = useAuth();
  const [venueData, setVenueData] = useState({});

  // 비밀번호 변경 관련 state
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [showNewPasswordFields, setShowNewPasswordFields] = useState(false);

  const [tempLang, setTempLang] = useState(currentLang);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchVenue = async () => {
      try {
        const vd = await ApiClient.get('/api/getVenue', {
          params: { venue_id: user?.venue_id }
        });
        console.log('vd', vd);
        setVenueData(prev => ({
          ...prev,
          ...vd
        }));
      } catch (e) {
        console.error('Venue data fetch error:', e);
      }
    };

    fetchVenue();


    if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }


  }, [ messages, currentLang ]);


  const handleShopDetail = () => {
    navigateToPageWithData(PAGES.VENUE_SETUP, { 
      mode: 'edit', venue_id: user?.venue_id
    });
  }

// 컴포넌트 상단에 추가 (useTranslation import가 있다고 가정)
const handleSaveBusinessInfo = () => {
  ApiClient.postForm('/api/venueEdit', {
    venue_id: venueData?.venue_id,
    name: business.name,
    address: business.address
  }).then(res=>{
    console.log('res', res);
    Swal.fire({
      title: get('SWAL_SUCCESS_TITLE'),
      text: get('BUSINESS_INFO_UPDATE_SUCCESS'),
      icon: 'success'
    });
  });
}

const handleLogout = async () => {
    console.log('logout')
    await logout();
    navigate('/login'); 
}

// 현재 비밀번호 인증
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
    // 비밀번호 검증 전용 함수 사용 (navigate 없음)
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
      setIsPasswordVerified(true);
      setShowNewPasswordFields(true);
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
    // API 호출 (백엔드에서 구현 예정)
    const response = await ApiClient.postForm('/api/UpdatePassword', {
      // 인자는 백엔드에서 결정
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

  const [business, setBusiness] = useState({ name: '', address: '' });
  const [emailNoti, setEmailNoti] = useState(true);
  const [smsNoti, setSmsNoti] = useState(false);

  useEffect(() => {
    if (venueData?.name || venueData?.address) {
      setBusiness({
        name: venueData.name || '',
        address: venueData.address || ''
      });
    }
  }, [venueData]);

  // 언어 저장 버튼 클릭 시 호출
  const handleSaveLanguage = () => {
    setLanguage(tempLang);
  };

  return (
    <>
      <style jsx="true">{`
        .settings-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          padding: 1rem;
        }
        .section-title {
          font-size: 1.15rem;
          font-weight: 600;
        }
        .section-box {
          border: none;
          background: #fff;
          padding: 0.7rem 0rem;
          margin-bottom: 1.1rem;
        }
        .input-row {
          margin-bottom: 0.7rem;
        }
        .save-btn-row {
          display: flex;
          justify-content: flex-end;
        }
        .noti-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.7rem;
        }
        .lang-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
      `}</style>
      
        <SketchHeader
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={18} />
              {get('Mng.menu.3') || 'Settings'}
            </span>
          }
          showBack={true}
          onBack={goBack}
        />
        <div className="settings-container">
        <div className="section-title">Manage Shop Detail</div>
        <SketchDiv className="section-box" style={{marginBottom:'1.2rem'}}>
          <SketchBtn 
          variant="primary" 
          size="medium" 
          style={{ width: '100%' }}
          onClick={handleShopDetail}
          ><HatchPattern opacity={0.6} /><ZoomIn size={14} style={{marginRight: '5px'}}/> Shop Detail </SketchBtn>
        </SketchDiv>

        <div className="section-title">Update Business Info</div>
        <SketchDiv className="section-box">
          <div className="input-row">
            <SketchInput
              name="businessName"
              value={business.name}
              onChange={e => setBusiness(b => ({ ...b, name: e.target.value }))}
              placeholder="Business Name"
            />
          </div>
          <div className="input-row">
            <SketchInput
              name="businessAddress"
              value={business.address}
              onChange={e => setBusiness(b => ({ ...b, address: e.target.value }))}
              placeholder="Business Address"
            />
          </div>
          <div className="save-btn-row">
            <SketchBtn 
              onClick={handleSaveBusinessInfo}
              variant="accent" size="small" style={{width: '30%'}}><HatchPattern opacity={0.6} /> Save</SketchBtn>
          </div>
        </SketchDiv>

        <div className="password-section">
          <div className="section-title">Change Password</div>
          <SketchDiv className="section-box">
            <div className="input-row" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <div style={{flex: 1}}>
                <SketchInput
                  name="currentPassword"
                  value={password.current}
                  onChange={e => setPassword(p => ({ ...p, current: e.target.value }))}
                  placeholder="Current Password"
                  type="password" style={{fontFamily: 'none', Height: '30px'}}
                  disabled={isPasswordVerified}
                />
              </div>
              {!isPasswordVerified ? (
                <SketchBtn 
                  variant="accent" 
                  size="small" 
                  onClick={handleVerifyCurrentPassword}
                  disabled={isVerifyingPassword}
                  style={{width: '80px', marginBottom : '0.7rem', padding:'0.3rem 0.5rem'}}
                >
                  <HatchPattern opacity={0.6} />
                  {isVerifyingPassword ? 'Checking...' : 'Check'}
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
                    placeholder="New Password"
                    type="password"
                  />
                </div>
                <div className="input-row">
                  <SketchInput
                    name="confirmPassword"
                    value={password.confirm}
                    onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))}
                    placeholder="Confirm Password"
                    type="password"
                  />
                </div>
                <div className="save-btn-row">
                  <SketchBtn 
                    variant="accent" 
                    size="small" 
                    style={{width: '30%'}}
                    onClick={handleSaveNewPassword}
                  >
                    <HatchPattern opacity={0.6} /> Save
                  </SketchBtn>
                </div>
              </>
            )}
          </SketchDiv> 
        </div>

        <div className="section-title">Notification Preferences (아직 미구현)</div>
        <SketchDiv className="section-box">
          <div className="noti-row">
               <span><Mail size={14}/> {get('Staff.setting.notification.email') || 'Email Notifications'}</span>
            <SketchBtn 
              variant={emailNoti ? "green" : "danger"} 
              size="small"  
              style={{width: '30%'}}
            ><HatchPattern opacity={0.6} />
              {emailNoti ? 'On' : 'Off'}
            </SketchBtn>
          </div>
          <div className="noti-row">
            <span><MessageCircle size={14}/> {get('Staff.setting.notification.sms') || 'SMS Notifications'}</span>
            <SketchBtn 
              variant={smsNoti ? "green" : "danger"} 
              size="small"  
              style={{width: '30%'}}
            ><HatchPattern opacity={0.6} />
              {smsNoti ? 'On' : 'Off'}
            </SketchBtn>
          </div>
        </SketchDiv>
        <div className="section-title">{get('Staff.setting.language.title')}</div>
        <SketchDiv className="section-box">
          <div className="lang-row">
            <select value={tempLang} 
                    onChange={(e) => {
                      setTempLang(e.target.value);
                    }} 
                    style={{ 
                          fontSize: '1rem', 
                          padding: '0.3rem 1.2rem 0.3rem 0.5rem', 
                          background: '#fff',
                          borderTopLeftRadius: '6px 8px',
                          borderTopRightRadius: '10px 5px',
                          borderBottomRightRadius: '8px 12px',
                          borderBottomLeftRadius: '12px 6px',
                          transform: 'rotate(0.2deg)',
                          fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif",
                          width: '212px'
                        }}>
              <option value="en">English</option>
              <option value="kr">Korean</option>
              <option value="vi">Vietnamese</option>
              <option value="ja">Japanese</option>
            </select>
            <SketchBtn variant="accent" size="small" style={{width: '30%'}} onClick={handleSaveLanguage}><HatchPattern opacity={0.6} /> Save</SketchBtn>
          </div>
        </SketchDiv>
        <div className="section-title" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <SketchBtn variant="" size="small" style={{width: '100%'}} onClick={handleLogout}>
            <HatchPattern opacity={0.6} /> Logout
          </SketchBtn>
        </div>
      </div>
    </>
  );
};

export default ManagerSettings; 