import React, { useState } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import HatchPattern from '@components/HatchPattern'
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';

const roleOptions = [
  { value: 'hostess', label: 'Hostess' },
  { value: 'manager', label: 'Manager' },
  { value: 'other', label: 'Other' },
];

const CreateStaff = ({ navigateToPage, navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    contact: '',
    role: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

    const handleAddStaff = () => {
   navigateToPage(PAGES.STAFF_MANAGEMENT)
  };


  return (
    <>
      <style jsx="true">{`
        .create-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 95vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .form-title {
          position:relative;
          font-size: 1.3rem;
          font-weight: 600;
          padding: 0.3rem;
          margin: 1.2rem 0 0.2rem 0;
          text-align: left;
        }
        .form-box {
          padding: 1.1rem 1.2rem 1.2rem 1.2rem;
        }
        .form-label {
          font-size: 1rem;
          margin-bottom: 0.2rem;
          font-weight: 500;
        }
        .form-field {
          margin-bottom: 0.7rem;
        }
        .role-row {
          display: flex;
          gap: 1.2rem;
          margin: 0.7rem 0 1.1rem 0;
        }
        .role-radio {
          margin-right: 0.3rem;
        }
        .form-actions {
          display: flex;
          gap: 0.7rem;
          justify-content: flex-end;
          margin-top: 1.1rem;
        }
      `}</style>
      <div className="create-container">
        <SketchHeader
          title="Create New Staff"
          showBack={true}
          onBack={goBack}
        />
        <div className="form-title">Create New Staff Account</div>
        <SketchDiv className="form-box">
          <HatchPattern opacity={0.4} />
          <div className="form-field">
            <div className="form-label">Staff Member's Name</div>
            <SketchInput
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter name"
            />
          </div>
          <div className="form-field">
            <div className="form-label">Unique ID (Username)</div>
            <SketchInput
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
            />
          </div>
          <div className="form-field">
            <div className="form-label">Temporary Password</div>
            <SketchInput
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter temporary password"
              type="password"
            />
          </div>
          <div className="form-field">
            <div className="form-label">Contact Information</div>
            <SketchInput
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="Phone or Email"
            />
          </div>
          <div className="form-label" style={{marginBottom: '0.3rem'}}>Select Staff Role</div>
          <div className="role-row">
            {roleOptions.map(opt => (
              <label key={opt.value}>
                <input
                  type="radio"
                  name="role"
                  value={opt.value}
                  checked={form.role === opt.value}
                  onChange={handleChange}
                  className="role-radio"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <div className="form-actions">
            <SketchBtn variant="event" size="small">Save</SketchBtn>
            <SketchBtn variant="danger" size="small" onClick={handleAddStaff}>Cancel</SketchBtn>
          </div>
        </SketchDiv>
      </div>
    </>
  );
};

export default CreateStaff; 