import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';
import HatchPattern from '@components/HatchPattern';
import { MessageCircle, Mail, User, Settings } from 'lucide-react';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';
import { ZoomIn, Check, X } from 'lucide-react';

import ApiClient from '@utils/ApiClient';

const ManagerSettings = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {


  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const { user, verifyPassword, logout, updateUserLang } = useAuth();
  const [venueData, setVenueData] = useState({});

  // 비밀번호 변경 관련 state
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [showNewPasswordFields, setShowNewPasswordFields] = useState(false);

  const [scheduleStatus, setScheduleStatus] = useState('before_open');

  const [tempLang, setTempLang] = useState(currentLang);

  const statusMap = {
    before_open: {
      text: get('VENUE_STATUS_BEFORE_OPEN'),
      variant: 'secondary'
    },
    available: {
      text: get('VENUE_STATUS_OPERATING'),
      variant: 'green'
    },
    closed: {
      text: get('VENUE_STATUS_CLOSED'),
      variant: 'danger'
    }
  };

  const VenueStatusButton = () => (
    <SketchBtn
      variant={statusMap[scheduleStatus]?.variant || 'secondary'}
      size="small"
      style={{ width: '30%' }}
      onClick={handleVenueStatusUpdate}
    >
      <HatchPattern opacity={0.6} />
      {statusMap[scheduleStatus]?.text ?? get('VENUE_STATUS_UNKNOWN')}
    </SketchBtn>
  );



  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchVenue = async () => {
      try {
        const vd = await ApiClient.get('/api/getVenue', {
          params: { venue_id: user?.venue_id }
        });
        console.log('vd', vd);

        const {schedule_status} = vd;

        setScheduleStatus(schedule_status);

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


  useEffect(() => {
    // 스케쥴 상태가 반영된 경우 컴포넌트 재렌더링
    console.log('scheduleStatus!', scheduleStatus);


  }, [ scheduleStatus ]);


  


  const handleShopDetail = () => {
    navigateToPageWithData(PAGES.VENUE_SETUP, { 
      mode: 'edit', venue_id: user?.venue_id
    });
  }



  // 매장 상태 업데이트 함수
const handleVenueStatusUpdate = async () => {
  console.log("현재 scheduleStatus:", scheduleStatus);
  
  // 상태 변경 로직: before_open -> available -> closed -> available
  const statusFlow = {
    before_open: 'available',
    available: 'closed', 
    closed: 'available'
  };
  
  const newStatus = statusFlow[scheduleStatus];
  const currentStatusText = statusMap[scheduleStatus]?.text;
  const newStatusText = statusMap[newStatus]?.text;

  console.log("newStatus", newStatus)
  
  // 확인창 표시
  const result = await Swal.fire({
    title: get('WORK_SCHEDULE_REQUEST_CHANGE'),
    text: `"${currentStatusText}" ${get('VENUE_STATUS_CHANGE_CONFIRM')} "${newStatusText}"${get('VENUE_STATUS_CHANGE_QUESTION')}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: get('SETTINGS_CHECK_BUTTON'),
    cancelButtonText: get('Common.Cancel'),
    confirmButtonColor: newStatus === 'available' ? '#10b981' : newStatus === 'closed' ? '#ef4444' : '#6b7280',
    cancelButtonColor: '#6b7280'
  });

  // 취소 버튼을 눌렀다면 함수 종료
  if (!result.isConfirmed) {
    console.log('매장 상태 변경이 취소되었습니다.');
    return;
  }

  try {
    console.log('매장 상태 변경 요청:', {
      venue_id: user.venue_id,
      status: newStatus,
      current_scheduleStatus: scheduleStatus
    });

    const response = await ApiClient.postForm('/api/venueStatusUpdate', {
      venue_id: user.venue_id,
      status: newStatus,
      open_time: venueData.open_time,
      close_time: venueData.close_time
    });

    console.log('매장 상태 변경 응답:', response);

    // 성공 시 로컬 상태 업데이트
    if (response > 0) {
      setScheduleStatus(newStatus); // scheduleStatus 업데이트
      
      console.log(`✅ 매장 상태가 "${newStatusText}"로 변경되었습니다.`);
      
      // 성공 알림
      Swal.fire({
        title: get('WORK_SCHEDULE_END'),
        text: `${get('VENUE_STATUS_CHANGE_SUCCESS')} "${newStatusText}"${get('VENUE_STATUS_CHANGE_SUCCESS_SUFFIX')}`,
        icon: 'success', 
        confirmButtonText: get('SETTINGS_CHECK_BUTTON'),
        confirmButtonColor: '#10b981'
      });
      
    } else {
      throw new Error('API 응답이 성공을 나타내지 않습니다.');
    }
    
  } catch (error) {
    console.error('매장 상태 변경 실패:', error);
  }
};

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
  const handleSaveLanguage = async () => {

    try {
   
       const response = await ApiClient.postForm('/api/updateLanguageSetting', {
           user_id: user?.manager_id, 
           language: tempLang
        });

        if(response > 0) {
          setLanguage(tempLang);

          updateUserLang(tempLang);



          
          await Swal.fire({
              title: get('SWAL_SUCCESS_TITLE'),
              text: get('LANGUAGE_UPDATE_SUCCESS'),
              icon: 'success',
              timer: 1500
            });
          
        }

    }catch (error) {

     await Swal.fire({
          title: get('SETTINGS_SAVE_ERROR'),
          icon: 'error',
          confirmButtonText: get('SWAL_CONFIRM_BUTTON')
        });

    }

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
          gap: 10px;
        }
          .venue-onOff {     
            display: flex;
            justify-content: space-between;
            margin-top: 1rem;
            margin-bottom: 0.3rem;
         }
          
      `}</style>
      
              <SketchHeader
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings size={18} />
            {get('SETTINGS_PAGE_TITLE')}
          </span>
        }
        showBack={true}
        onBack={goBack}
      />
      <div className="settings-container">
        <div className="section-title">{get('SETTINGS_MANAGE_SHOP_DETAIL')}</div>
        
        <div className='venue-onOff'>
          <div style={{lineHeight: '1.8'}}>{get('MANAGER_VENUE_SETTING')} </div>
          <VenueStatusButton />
          </div>
             
        <SketchDiv className="section-box" style={{marginBottom:'1.2rem'}}>
          <SketchBtn 
            variant="primary" 
            size="medium" 
            style={{ width: '100%' }}
            onClick={handleShopDetail}
          >
            <HatchPattern opacity={0.6} />
            <ZoomIn size={14} style={{marginRight: '5px'}}/>
            {get('SETTINGS_SHOP_DETAIL_BUTTON')}
          </SketchBtn>
        </SketchDiv>
      {/*
        <div className="section-title">{get('SETTINGS_UPDATE_BUSINESS_INFO')}</div>
        <SketchDiv className="section-box">
          <div className="input-row">
            <SketchInput
              name="businessName"
              value={business.name}
              onChange={e => setBusiness(b => ({ ...b, name: e.target.value }))}
              placeholder={get('SETTINGS_BUSINESS_NAME_PLACEHOLDER')}
            />
          </div>
          <div className="input-row">
            <SketchInput
              name="businessAddress"
              value={business.address}
              onChange={e => setBusiness(b => ({ ...b, address: e.target.value }))}
              placeholder={get('SETTINGS_BUSINESS_ADDRESS_PLACEHOLDER')}
            />
          </div>
          <div className="save-btn-row">
            <SketchBtn 
              onClick={handleSaveBusinessInfo}
              variant="accent" 
              size="small" 
              style={{width: '30%'}}
            >
              <HatchPattern opacity={0.6} />
              {get('SETTINGS_SAVE_BUTTON')}
            </SketchBtn>
          </div>
        </SketchDiv>
        */}

        <div className="password-section">
          <div className="section-title">{get('SETTINGS_CHANGE_PASSWORD')}</div>
          <SketchDiv className="section-box">
            <div className="input-row" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <div style={{flex: 1}}>
                <SketchInput
                  name="currentPassword"
                  value={password.current}
                  onChange={e => setPassword(p => ({ ...p, current: e.target.value }))}
                  placeholder={get('SETTINGS_CURRENT_PASSWORD_PLACEHOLDER')}
                  type="password" 
                  style={{fontFamily: 'none', Height: '30px', padding:'0.4rem'}}
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
                  {isVerifyingPassword ? get('SETTINGS_CHECKING_BUTTON') : get('SETTINGS_CHECK_BUTTON')}
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
                    placeholder={get('SETTINGS_NEW_PASSWORD_PLACEHOLDER')}
                    type="password" style={{fontFamily: 'none'}}
                  />
                </div>
                <div className="input-row">
                  <SketchInput
                    name="confirmPassword"
                    value={password.confirm}
                    onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))}
                    placeholder={get('SETTINGS_CONFIRM_PASSWORD_PLACEHOLDER')}
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
                    {get('SETTINGS_SAVE_BUTTON')}
                  </SketchBtn>
                </div>
              </>
            )}
          </SketchDiv> 
        </div>

        {/* <div className="section-title">{get('SETTINGS_NOTIFICATION_PREFERENCES')}</div>
        <SketchDiv className="section-box">
          <div className="noti-row">
               <span><Mail size={14}/> {get('Staff.setting.notification.email') || 'Email Notifications'}</span>
            <SketchBtn 
              variant={emailNoti ? "green" : "danger"} 
              size="small"  
              style={{width: '30%'}}
            ><HatchPattern opacity={0.6} />
              {emailNoti ? get('SETTINGS_ON') : get('SETTINGS_OFF')}
            </SketchBtn>
          </div>
          <div className="noti-row">
            <span><MessageCircle size={14}/> {get('Staff.setting.notification.sms') || 'SMS Notifications'}</span>
            <SketchBtn 
              variant={smsNoti ? "green" : "danger"} 
              size="small"  
              style={{width: '30%'}}
            ><HatchPattern opacity={0.6} />
               {smsNoti ? get('SETTINGS_ON') : get('SETTINGS_OFF')}
            </SketchBtn>
          </div>
        </SketchDiv> */}

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
                          width: '67%',
                          border: '0.8px solid #666'
                        }}>
              <option value="en">{get('language.name.english')}</option>
              <option value="kr">{get('language.name.korean')}</option>
              <option value="vi">{get('language.name.vietnamese')}</option>
              <option value="ja">{get('language.name.japanese')}</option>
              <option value="cn">{get('LANGUAGE_CHINESE')}</option>
            </select>
            <SketchBtn variant="accent" size="small" style={{width: '30%'}} onClick={handleSaveLanguage}><HatchPattern opacity={0.6} /> {get('VENUE_STATUS_CHANGE_BUTTON')}</SketchBtn>
          </div>
        </SketchDiv>
        <div className="section-title" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <SketchBtn variant="" size="small" style={{width: '100%'}} onClick={handleLogout}>
            <HatchPattern opacity={0.6} /> {get('Staff.setting.logout')}
          </SketchBtn>
        </div>
      </div>
    </>
  );
};

export default ManagerSettings; 