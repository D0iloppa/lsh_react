import React, { useState } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import { Menu } from 'lucide-react';

const LANGS = [
  { label: 'vietnamese', value: 'vi' },
  { label: 'English', value: 'en' },
  { label: 'Korean', value: 'ko' },
];

const StaffSetting = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [lang, setLang] = useState('en');
  const [noti, setNoti] = useState(true);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });

  return (
    <>
      <style jsx="true">{`
        .staffsetting-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.5rem 0 1.1rem 0.2rem;
        }
        .lang-row {
          display: flex;
          gap: 2.2rem;
          margin: 0.7rem 0 1.2rem 0.2rem;
        }
        .lang-radio {
          display: flex;
          align-items: center;
          font-size: 1.15rem;
        }
        .lang-radio input {
          width: 1.5rem;
          height: 1.5rem;
          margin-right: 0.5rem;
        }
        .noti-row {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          margin: 0.7rem 0 1.2rem 0.2rem;
        }
        .switch {
          width: 3.2rem;
          height: 2rem;
          border: 2.5px solid #222;
          border-radius: 1.2rem;
          background: #fff;
          position: relative;
          cursor: pointer;
        }
        .switch-knob {
          width: 1.5rem;
          height: 1.5rem;
          background: #fff;
          border: 2.5px solid #222;
          border-radius: 50%;
          position: absolute;
          top: 0.15rem;
          left: 0.2rem;
          transition: left 0.2s;
        }
        .switch.on .switch-knob {
          left: 1.5rem;
          background: #b2f2c8;
        }
        .pw-row {
          margin: 1.2rem 0 0.7rem 0.2rem;
        }
        .pw-input {
          width: 100%;
          font-size: 1.1rem;
          border: 2.5px solid #222;
          border-radius: 7px;
          padding: 0.7rem 1rem;
          margin-bottom: 0.7rem;
          background: #fff;
        }
        .pw-btn-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1.5rem;
        }
        .account-section {
          margin: 2.2rem 0 1.2rem 0.2rem;
        }
        .account-btn {
          width: 100%;
          font-size: 1.15rem;
          border: 2.5px solid #222;
          border-radius: 7px;
          padding: 0.9rem 1rem;
          margin-bottom: 1.1rem;
          background: #f8f8f8;
          text-align: left;
        }
        .account-btn:last-child {
          background: #fff0f0;
          color: #d22;
        }
        .bottom-nav {
          position: fixed;
          left: 0; right: 0; bottom: 0;
          width: 100vw;
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          border-top: 2.5px solid #222;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0.7rem 0 0.3rem 0;
          z-index: 10;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 1.1rem;
        }
      `}</style>
      <div className="staffsetting-container">
        <SketchHeader
          title={<><Menu size={22} style={{marginRight:'7px',marginBottom:'-3px'}}/>Settings</>}
          showBack={true}
          onBack={goBack}
        />
        <div className="section-title">Manage Preferences</div>
        <div style={{marginLeft:'0.2rem',fontSize:'1.13rem',marginBottom:'0.3rem'}}>Change Language</div>
        <div className="lang-row">
          {LANGS.map(l => (
            <label className="lang-radio" key={l.value}>
              <input type="radio" checked={lang===l.value} onChange={()=>setLang(l.value)} />
              {l.label}
            </label>
          ))}
        </div>
        <div style={{marginLeft:'0.2rem',fontSize:'1.13rem',marginBottom:'0.3rem'}}>Notification Settings</div>
        <div className="noti-row">
          <span>Receive Notifications</span>
          <div className={`switch${noti ? ' on' : ''}`} onClick={()=>setNoti(v=>!v)}>
            <div className="switch-knob" />
          </div>
        </div>
        <div className="section-title" style={{fontSize:'1.25rem'}}>Change Password</div>
        <div className="pw-row">
          <input className="pw-input" type="password" placeholder="Current Password" value={pw.current} onChange={e=>setPw(pw=>({...pw,current:e.target.value}))} />
          <input className="pw-input" type="password" placeholder="New Password" value={pw.next} onChange={e=>setPw(pw=>({...pw,next:e.target.value}))} />
          <input className="pw-input" type="password" placeholder="Confirm Password" value={pw.confirm} onChange={e=>setPw(pw=>({...pw,confirm:e.target.value}))} />
        </div>
        <div className="pw-btn-row">
          <SketchBtn variant="primary" size="medium">Change</SketchBtn>
        </div>
        <div className="section-title" style={{fontSize:'1.25rem',marginTop:'2.5rem'}}>Account Management</div>
        <div className="account-section">
          <button className="account-btn">Edit Personal Info</button>
          <button className="account-btn">Log out</button>
          <button className="account-btn">Delete Account</button>
        </div>
        <div style={{height:'5.5rem'}}></div>
        <div className="bottom-nav">
          <div className="nav-item">
            <span style={{fontSize:'2rem'}}>📅</span>
            <span>Bookings</span>
          </div>
          <div className="nav-item">
            <span style={{fontSize:'2rem'}}>👥</span>
            <span>Chatting</span>
          </div>
          <div className="nav-item">
            <span style={{fontSize:'2rem'}}>⚙️</span>
            <span>Settings</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffSetting; 