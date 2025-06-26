// ToggleRadio.jsx
import React, { useState, useEffect } from 'react';
import './ToggleRadio.css'; // CSS 파일 import

const ToggleRadio = ({ 
  className = '', 
  checked = false,          // 외부에서 받는 체크 상태
  onChange = null,          // 외부에서 받는 onChange 핸들러
  disabled = false          // 비활성화 상태
}) => {
  const [isOn, setIsOn] = useState(checked);

  // 외부에서 받은 checked 값이 변경되면 내부 상태 업데이트
  useEffect(() => {
    setIsOn(checked);
  }, [checked]);

  const handleToggle = () => {
    if (disabled) return;
    
    const newState = !isOn;
    setIsOn(newState);
    
    // 외부 onChange 핸들러가 있으면 호출
    if (onChange) {
      onChange(newState);
    }
  };

  return (
    <div className={`toggle-radio ${className}`} style={{ opacity: disabled ? 0.6 : 1 }}>
      <label className="toggle-radio-label">
        <input
          type="checkbox"
          checked={isOn}
          onChange={handleToggle}
          disabled={disabled}
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