import React, { useState } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';

const VenueSetup = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [form, setForm] = useState({
    logo: '',
    cover: '',
    name: '',
    address: '',
    phone: '',
    hours: '',
    intro: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <style jsx="true">{`
        .venue-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .section-title {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 1.2rem 0 0.7rem 0;
        }
        .img-row {
          display: flex;
          gap: 1.2rem;
          margin-bottom: 1.2rem;
        }
        .img-upload {
          flex: 1;
          background: #f3f4f6;
          border-radius: 6px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          color: #bbb;
          flex-direction: column;
        }
        .img-label {
          font-size: 0.97rem;
          color: #222;
          margin-top: 0.3rem;
        }
        .input-row {
          margin-bottom: 0.7rem;
        }
        .save-btn-row {
          margin: 1.2rem 0 0.7rem 0;
        }
        .info-text {
          font-size: 0.97rem;
          color: #888;
          text-align: center;
          margin-top: 1.2rem;
        }
      `}</style>
      <div className="venue-container">
        <SketchHeader
          title="Complete Your venue Setup"
          showBack={true}
          onBack={goBack}
        />
        <div className="section-title">Upload venue Images</div>
        <div className="img-row">
          <div className="img-upload">
            🖼️
            <div className="img-label">venue Logo</div>
          </div>
          <div className="img-upload">
            🖼️
            <div className="img-label">Cover Photo</div>
          </div>
        </div>
        <div className="section-title">venue Information</div>
        <div className="input-row">
          <SketchInput
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="venue Name"
          />
        </div>
        <div className="input-row">
          <SketchInput
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
          />
        </div>
        <div className="input-row">
          <SketchInput
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
          />
        </div>
        <div className="input-row">
          <SketchInput
            name="hours"
            value={form.hours}
            onChange={handleChange}
            placeholder="Business Hours"
          />
        </div>
        <div className="input-row">
          <SketchInput
            name="intro"
            value={form.intro}
            onChange={handleChange}
            placeholder="Short Introduction"
            as="textarea"
            rows={2}
          />
        </div>
        <div className="save-btn-row">
          <SketchBtn variant="primary" size="medium" style={{ width: '100%' }}>Save and Activate</SketchBtn>
        </div>
        <div className="info-text">
          You can edit this information anytime from Settings.
        </div>
      </div>
    </>
  );
};

export default VenueSetup; 