import React, { useState } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';
import { User } from 'lucide-react';

const EditProfile = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [form, setForm] = useState({
    nickname: '',
    age: '',
    nationality: '',
    languages: '',
    intro: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <style jsx="true">{`
        .editprofile-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .profile-row {
          display: flex;
          gap: 1.2rem;
          margin-bottom: 1.2rem;
        }
        .profile-photo {
          flex: 1.2;
          background: #f3f4f6;
          border-radius: 6px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          color: #bbb;
          flex-direction: column;
        }
        .gallery-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .gallery-title {
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.3rem;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.3rem;
        }
        .gallery-img {
          background: #f3f4f6;
          border-radius: 6px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: #bbb;
        }
        .gallery-delete {
          margin-top: 0.3rem;
          width: 100%;
        }
        .input-row {
          margin-bottom: 0.7rem;
        }
        .save-btn-row {
          margin: 1.2rem 0 0.7rem 0;
        }
      `}</style>
      <div className="editprofile-container">
        <SketchHeader
          title={<><User size={20} style={{marginRight:'7px',marginBottom:'-3px'}}/>Edit Profile</>}
          showBack={true}
          onBack={goBack}
        />
        <div className="profile-row">
          <div className="profile-photo">
            🖼️
            <SketchBtn variant="event" size="small" style={{marginTop:'0.5rem'}}>Upload Photo</SketchBtn>
          </div>
          <div className="gallery-col">
            <div className="gallery-title">Photo Gallery</div>
            <div className="gallery-grid">
              <div className="gallery-img">🖼️</div>
              <div className="gallery-img">🖼️</div>
              <div className="gallery-img">🖼️</div>
              <div className="gallery-img">🖼️</div>
            </div>
            <SketchBtn variant="event" size="small" className="gallery-delete">Delete</SketchBtn>
          </div>
        </div>
        <div className="input-row">
          <div>Nickname</div>
          <SketchInput
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            placeholder="Enter your nickname"
          />
        </div>
        <div className="input-row">
          <div>Age</div>
          <SketchInput
            name="age"
            value={form.age}
            onChange={handleChange}
            placeholder="Enter your age"
            type="number"
          />
        </div>
        <div className="input-row">
          <div>Nationality</div>
          <SketchInput
            name="nationality"
            value={form.nationality}
            onChange={handleChange}
            placeholder="Enter your nationality"
          />
        </div>
        <div className="input-row">
          <div>Languages</div>
          <SketchInput
            name="languages"
            value={form.languages}
            onChange={handleChange}
            placeholder="Enter languages you speak"
          />
        </div>
        <div className="input-row">
          <div>Self-Introduction</div>
          <SketchInput
            name="intro"
            value={form.intro}
            onChange={handleChange}
            placeholder="Write something about yourself"
            as="textarea"
            rows={3}
          />
        </div>
        <div className="save-btn-row">
          <SketchBtn variant="primary" size="medium" style={{ width: '100%' }}>Save Changes</SketchBtn>
        </div>
      </div>
    </>
  );
};

export default EditProfile; 