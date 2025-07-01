import React, { useState, useEffect } from 'react';
import axios from 'axios';

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchInput from '@components/SketchInput';
import SketchHeader from '@components/SketchHeader'
import SketchDiv from '@components/SketchDiv'
import '@components/SketchComponents.css';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '../contexts/AuthContext';
import qs from 'qs';
import LoadingScreen from '@components/LoadingScreen';


const SettingsPage = ({ 
  navigateToPageWithData, 
  PAGES,
  goBack,
  ...otherProps 
}) => {


  const { user, isLoggedIn } = useAuth();
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

  const languageMap = {
    kr: '한국어',
    en: 'English',
    ja: '日本語',
    vi: 'Tiếng Việt',
  };
const { messages, isLoading, error, get, currentLang, availableLanguages, refresh } = useMsg();
  useEffect(() => {
    window.scrollTo(0, 0);

     if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }

     const fetchSetting = async () => {
      try {


        const response = await axios.post(
          `${API_HOST}/api/selectSetting`,
          qs.stringify({ user_id: user?.user_id || 1 }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            }
          }
        );

        const data = response.data || {};

        console.log(data.update_alert);
        setLanguage(data.language || 'ko');
        setReceiveUpdates(data.update_alert ?? true); // boolean은 null check
        setEventAlerts(data.event_alert ?? false);
        setEmail(data.email || 'user@example.com');
        setPhone(data.phone || '');
        setShareLocation(data.location_sharing ?? false);
        setShowOnlineStatus(data.online_status ?? true);

      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }
    };


  fetchSetting();


  }, [user, messages, currentLang]);

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
        online_status: showOnlineStatus
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

        alert(get('SETTINGS_SAVE_SUCCESS'));
        } catch (error) {
          console.error(get('SETTINGS_SAVE_ERROR_LOG'), error);
          alert(get('SETTINGS_SAVE_ERROR'));
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
          <SketchDiv className="settings-section">
            <HatchPattern opacity={0.4} />
            <div className="section-content">
              <h2 className="section-title">{get('Setting1.1')}</h2>
              <select 
                className="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="vi">Tiếng Việt</option>
                <option value="kr">한국어</option>
                <option value="en">English</option>
              </select>
            </div>
          </SketchDiv>

          {/* Notification Preferences */}
          <SketchDiv className="settings-section">
            <HatchPattern opacity={0.4} />
            <div className="section-content">
              <h2 className="section-title">{get('Setting1.2')}</h2>
              <ToggleSwitch 
                checked={receiveUpdates}
                onChange={setReceiveUpdates}
                label={get('Setting1.5')}
              />
              <ToggleSwitch 
                checked={eventAlerts}
                onChange={setEventAlerts}
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
              <div className="form-field">
                <label className="field-label">{get('title.text.13')}</label>
                <SketchInput
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </SketchDiv>

          {/* Privacy Settings */}
          <SketchDiv className="settings-section">
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
    </>
  );
};

export default SettingsPage;