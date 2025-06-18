import React, { useState, useEffect } from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchInput from '@components/SketchInput';
import SketchHeader from '@components/SketchHeader'
import SketchDiv from '@components/SketchDiv'
import '@components/SketchComponents.css';

const SettingsPage = ({ 
  navigateToPageWithData, 
  PAGES,
  ...otherProps 
}) => {
  const [language, setLanguage] = useState('English');
  const [receiveUpdates, setReceiveUpdates] = useState(true);
  const [eventAlerts, setEventAlerts] = useState(false);
  const [email, setEmail] = useState('user@example.com');
  const [phone, setPhone] = useState('+84 123 456 789');
  const [shareLocation, setShareLocation] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    console.log('Back 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.HOME);
  };

  const handleLogout = () => {
    console.log('Logout 클릭');
    // 로그아웃 로직
    navigateToPageWithData && navigateToPageWithData(PAGES.LOGIN);
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
      <style jsx>{`
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
          background-color: #94fff9;
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
          title="Settings"
          showBack={true}
          onBack={() => console.log("뒤로가기")}
          rightButtons={[]}
        />
        

        {/* Settings Content */}
        <div className="settings-content">

          {/* Language Selection */}
          <SketchDiv className="settings-section">
            <HatchPattern opacity={0.4} />
            <div className="section-content">
              <h2 className="section-title">Language Selection</h2>
              <select 
                className="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Vietnamese">Tiếng Việt</option>
                <option value="Korean">한국어</option>
                <option value="Japanese">日本語</option>
              </select>
            </div>
          </SketchDiv>

          {/* Notification Preferences */}
          <SketchDiv className="settings-section">
            <HatchPattern opacity={0.4} />
            <div className="section-content">
              <h2 className="section-title">Notification Preferences</h2>
              <ToggleSwitch 
                checked={receiveUpdates}
                onChange={setReceiveUpdates}
                label="Receive Updates"
              />
              <ToggleSwitch 
                checked={eventAlerts}
                onChange={setEventAlerts}
                label="Event Alerts"
              />
            </div>
          </SketchDiv>

          {/* Account Details */}
          <SketchDiv className="settings-section">
            <HatchPattern opacity={0.4} />
            <div className="section-content">
              <h2 className="section-title">Account Details</h2>
              <div className="form-field">
                <label className="field-label">Email</label>
                <SketchInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="field-label">Phone Number</label>
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
              <h2 className="section-title">Privacy Settings</h2>
              <ToggleSwitch 
                checked={shareLocation}
                onChange={setShareLocation}
                label="Share Location"
              />
              <ToggleSwitch 
                checked={showOnlineStatus}
                onChange={setShowOnlineStatus}
                label="Show Online Status"
              />
            </div>
          </SketchDiv>

          {/* Logout */}
          <div className="logout-section">
            <SketchBtn className="danger" onClick={handleLogout}>
              <HatchPattern opacity={0.8} />
              Logout
            </SketchBtn>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;