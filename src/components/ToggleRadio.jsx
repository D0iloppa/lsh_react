// ToggleRadio.jsx
import React, { useState } from 'react';
import './ToggleRadio.css'; // CSS 파일 import

const ToggleRadio = ({ className = '' }) => {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    setIsOn(!isOn);
  };

  return (
    <div className={`toggle-radio ${className}`}>
      <label className="toggle-radio-label">
        <input
          type="checkbox"
          checked={isOn}
          onChange={handleToggle}
          className="toggle-radio-input"
        />
        <span className="toggle-radio-slider">
          <span className="toggle-radio-button"></span>
        </span>
      </label>
    </div>
  );
};

export default ToggleRadio;