import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';
import HatchPattern from '@components/HatchPattern';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';
import { ZoomIn } from 'lucide-react';

const ManagerSettings = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {


  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);

    if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }


  }, [ messages, currentLang]);


  const handleShopDetail = () => {
    navigateToPageWithData(PAGES.VENUE_SETUP, { 
      mode: 'edit', venue_id: user?.venue_id
    });
  }



  const [business, setBusiness] = useState({ name: '', address: '' });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [emailNoti, setEmailNoti] = useState(true);
  const [smsNoti, setSmsNoti] = useState(false);

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
          title="Settings"
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
            <SketchBtn variant="accent" size="small" style={{width: '30%'}}><HatchPattern opacity={0.6} /> Save</SketchBtn>
          </div>
        </SketchDiv>

        <div className="section-title">Change Password</div>
        <SketchDiv className="section-box">
          <div className="input-row">
            <SketchInput
              name="currentPassword"
              value={password.current}
              onChange={e => setPassword(p => ({ ...p, current: e.target.value }))}
              placeholder="Current Password"
              type="password"
            />
          </div>
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
            <SketchBtn variant="accent" size="small"  style={{width: '30%'}}><HatchPattern opacity={0.6} /> Save</SketchBtn>
          </div>
        </SketchDiv>

        <div className="section-title">Notification Preferences</div>
        <SketchDiv className="section-box">
          <div className="noti-row">
            <span>Email Notifications</span>
            <SketchBtn 
              variant={emailNoti ? "green" : "danger"} 
              size="small"  
              style={{width: '30%'}}
            ><HatchPattern opacity={0.6} />
              {emailNoti ? 'On' : 'Off'}
            </SketchBtn>
          </div>
          <div className="noti-row">
            <span>SMS Notifications</span>
            <SketchBtn 
              variant={smsNoti ? "green" : "danger"} 
              size="small"  
              style={{width: '30%'}}
            ><HatchPattern opacity={0.6} />
              {smsNoti ? 'On' : 'Off'}
            </SketchBtn>
          </div>
        </SketchDiv>
        <div className="section-title">Language</div>
        <SketchDiv className="section-box">
          <div className="lang-row">
            <select value={'English'} onChange={(e) => {} } style={{ 
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
              <option>English</option>
              <option>Korean</option>
              <option>Vietnamese</option>
              <option>Japanese</option>
            </select>
            <SketchBtn variant="accent" size="small" style={{width: '30%'}}><HatchPattern opacity={0.6} /> Save</SketchBtn>
          </div>
        </SketchDiv>
      </div>
    </>
  );
};

export default ManagerSettings; 