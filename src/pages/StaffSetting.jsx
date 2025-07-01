import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';
import HatchPattern from '@components/HatchPattern';
import { MessageCircle, Mail, Calendar,Settings, Clock, MapPin, User, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

import Swal from 'sweetalert2';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';
import { Check, X } from 'lucide-react';

import ApiClient from '@utils/ApiClient';

const StaffSetting = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const { user, verifyPassword, logout } = useAuth();
  const [staffData, setStaffData] = useState({});

  // 비밀번호 변경 관련 state
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [showNewPasswordFields, setShowNewPasswordFields] = useState(false);

  const [tempLang, setTempLang] = useState(currentLang);
  const [emailNoti, setEmailNoti] = useState(true);
  const [smsNoti, setSmsNoti] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchStaffData = async () => {
      try {
        const sd = await ApiClient.get('/api/getStaffInfo', {
          params: { staff_id: user?.staff_id }
        });
        console.log('staff data', sd);
        setStaffData(prev => ({
          ...prev,
          ...sd
        }));
      } catch (e) {
        console.error('Staff data fetch error:', e);
      }
    };

    fetchStaffData();

    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang, user?.staff_id]);

  const handleEditProfile = () => {
    navigateToPageWithData(PAGES.STAFF_EDIT_PROFILE, { 
      mode: 'edit', staff_id: user?.staff_id
    });
  };

  const handleLogout = async () => {
    console.log('logout');
    await logout();
    navigate('/login'); 
  };

  // 현재 비밀번호 인증
  const handleVerifyCurrentPassword = async () => {
    if (!password.current.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter your current password',
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
        setIsPasswordVerified(true);
        setShowNewPasswordFields(true);
        Swal.fire({
          title: 'Success',
          text: 'Password verified successfully',
          icon: 'success',
          timer: 1500
        });
      } else {
        setIsPasswordVerified(false);
        Swal.fire({
          title: 'Error',
          text: 'Current password is incorrect',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('Password verification error:', error);
      setIsPasswordVerified(false);
      Swal.fire({
        title: 'Error',
        text: 'Failed to verify password',
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
        title: 'Error',
        text: 'New password must be different from current password',
        icon: 'error'
      });
      return;
    }

    // 2. New Password vs Confirm Password 체크
    if (password.new !== password.confirm) {
      Swal.fire({
        title: 'Error',
        text: 'New password and confirm password do not match',
        icon: 'error'
      });
      return;
    }

    // 3. 새 비밀번호 길이 체크
    if (password.new.length < 6) {
      Swal.fire({
        title: 'Error',
        text: 'New password must be at least 6 characters long',
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
          title: 'Success',
          text: 'Password updated successfully',
          icon: 'success'
        });
        
        // 폼 초기화
        setPassword({ current: '', new: '', confirm: '' });
        setIsPasswordVerified(false);
        setShowNewPasswordFields(false);
      } else {
        Swal.fire({
          title: 'Error',
          text: response.message || 'Failed to update password',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('Password update error:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update password',
        icon: 'error'
      });
    }
  };

  // 언어 저장 버튼 클릭 시 호출
  const handleSaveLanguage = () => {
    setLanguage(tempLang);
    Swal.fire({
      title: 'Success',
      text: 'Language updated successfully',
      icon: 'success',
      timer: 1500
    });
  };

  return (
    <>
      <style jsx="true">{`
        .settings-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
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
        <div className="section-title">{get('Staff.setting.profile.title') || 'Edit Profile'}</div>
        <SketchDiv className="section-box" style={{marginBottom:'1.2rem'}}>
          <SketchBtn 
            variant="primary" 
            size="medium" 
            style={{ width: '100%' }}
            onClick={handleEditProfile}
          >
            <HatchPattern opacity={0.6} />
            <Edit size={14}/> {get('Staff.setting.profile.edit') || 'Edit Personal Info'}
          </SketchBtn>
        </SketchDiv>

        <div className="password-section">
          <div className="section-title">{get('Staff.setting.password.title') || 'Change Password'}</div>
          <SketchDiv className="section-box">
            <div className="input-row" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <div style={{flex: 1}}>
                <SketchInput
                  name="currentPassword"
                  value={password.current}
                  onChange={e => setPassword(p => ({ ...p, current: e.target.value }))}
                  placeholder={get('Staff.setting.password.current') || 'Current Password'}
                  type="password"
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
                    placeholder={get('Staff.setting.password.new') || 'New Password'}
                    type="password"
                  />
                </div>
                <div className="input-row">
                  <SketchInput
                    name="confirmPassword"
                    value={password.confirm}
                    onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))}
                    placeholder={get('Staff.setting.password.confirm') || 'Confirm Password'}
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

        <div className="section-title">{get('Staff.setting.notification.title') || 'Notification Preferences'}</div>
        <SketchDiv className="section-box">
          <div className="noti-row">
            <span><Mail size={14}/> {get('Staff.setting.notification.email') || 'Email Notifications'}</span>
            <SketchBtn 
              variant={emailNoti ? "green" : "danger"} 
              size="small"  
              style={{width: '30%'}}
              onClick={() => setEmailNoti(!emailNoti)}
            >
              <HatchPattern opacity={0.6} />
               {emailNoti ? 'On' : 'Off'}
            </SketchBtn>
          </div>
          <div className="noti-row">
            <span><MessageCircle size={14}/> {get('Staff.setting.notification.sms') || 'SMS Notifications'}</span>
            <SketchBtn 
              variant={smsNoti ? "green" : "danger"} 
              size="small"  
              style={{width: '30%'}}
              onClick={() => setSmsNoti(!smsNoti)}
            >
              <HatchPattern opacity={0.6} />
              {smsNoti ? 'On' : 'Off'}
            </SketchBtn>
          </div>
        </SketchDiv>

        <div className="section-title">{get('Staff.setting.language.title') || 'Language'}</div>
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
            <SketchBtn variant="accent" size="small" style={{width: '30%'}} onClick={handleSaveLanguage}>
              <HatchPattern opacity={0.6} /> Save
            </SketchBtn>
          </div>
        </SketchDiv>

        <div className="section-title" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <SketchBtn variant="" size="small" style={{width: '100%'}} onClick={handleLogout}>
            <HatchPattern opacity={0.6} /> {get('Staff.setting.logout') || 'Logout'}
          </SketchBtn>
        </div>
      </div>
    </>
  );
};

export default StaffSetting; 