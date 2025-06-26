import React, { useState } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';

const typeOptions = [
  { value: 'discount', label: 'Discount' },
  { value: 'event', label: 'Event' },
  { value: 'special', label: 'Special Offer' },
];

const CreatePromotion = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [form, setForm] = useState({
    title: '',
    desc: '',
    type: '',
    image: '',
    startDate: '',
    endDate: '',
    time: '',
    details: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <style jsx="true">{`
        .create-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .form-label {
          font-size: 1rem;
          margin-bottom: 0.2rem;
          font-weight: 500;
        }
        .form-field {
          margin-bottom: 0.9rem;
        }
        .type-row {
          display: flex;
          gap: 1.2rem;
          margin: 0.7rem 0 1.1rem 0;
        }
        .type-radio {
          margin-right: 0.3rem;
        }
        .date-row {
          display: flex;
          gap: 0.7rem;
          margin-bottom: 0.9rem;
        }
        .date-field {
          flex: 1;
        }
        .form-actions {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          margin-top: 1.1rem;
        }
      `}</style>
      <div className="create-container">
        <SketchHeader
          title="Create New Promotion"
          showBack={true}
          onBack={goBack}
        />
        <div className="form-field">
          <div className="form-label">Promotion Title</div>
          <SketchInput
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter title"
          />
        </div>
        <div className="form-field">
          <div className="form-label">Short Description</div>
          <SketchInput
            name="desc"
            value={form.desc}
            onChange={handleChange}
            placeholder="Enter description"
            as="textarea"
            rows={2}
          />
        </div>
        <div className="form-label" style={{marginBottom: '0.3rem'}}>Promotion Type</div>
        <div className="type-row">
          {typeOptions.map(opt => (
            <label key={opt.value}>
              <input
                type="radio"
                name="type"
                value={opt.value}
                checked={form.type === opt.value}
                onChange={handleChange}
                className="type-radio"
              />
              {opt.label}
            </label>
          ))}
        </div>
        <div className="form-field">
          <div className="form-label">Upload a Cover Image</div>
          <SketchInput
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Image URL or upload"
          />
        </div>
        <div className="form-label">Promotion Dates</div>
        <div className="date-row">
          <div className="date-field">
            <div className="form-label" style={{fontWeight:400}}>Start Date</div>
            <SketchInput
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              placeholder="YYYY-MM-DD"
              type="date"
            />
          </div>
          <div className="date-field">
            <div className="form-label" style={{fontWeight:400}}>End Date</div>
            <SketchInput
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              placeholder="YYYY-MM-DD"
              type="date"
            />
          </div>
        </div>
        <div className="form-field">
          <div className="form-label">Applicable Days/Times</div>
          <SketchInput
            name="time"
            value={form.time}
            onChange={handleChange}
            placeholder="e.g. weekdays, 6 PM - 9 PM"
          />
        </div>
        <div className="form-field">
          <div className="form-label">Optional Details</div>
          <SketchInput
            name="details"
            value={form.details}
            onChange={handleChange}
            placeholder="e.g. Minimum spend, target customers"
            as="textarea"
            rows={2}
          />
        </div>
        <div className="form-actions">
          <SketchBtn variant="event" size="medium" style={{ width: '100%' }}>Preview Promotion</SketchBtn>
          <SketchBtn variant="primary" size="medium" style={{ width: '100%' }}>Save and Activate</SketchBtn>
        </div>
      </div>
    </>
  );
};

export default CreatePromotion; 