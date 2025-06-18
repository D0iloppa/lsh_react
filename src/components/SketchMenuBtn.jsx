import React from 'react';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';

const SketchMenuBtn = ({
  icon,
  name,
  hasArrow = false,
  onClick = () => {},
  className = '',
  showHatch = true,
}) => {
  return (
    <>
      <style jsx="true">{`
        .menu-item {
          position: relative;
          padding: 0.75rem 1rem;
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 12px 10px 8px 14px;
          transform: rotate(0.4deg);
          transition: background-color 0.2s;
          cursor: pointer;
          box-sizing: border-box;
        }

        .menu-item:hover {
          background-color: #f9fafb;
        }

        .menu-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .menu-icon {
          margin-right: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-name {
          flex: 1;
          font-weight: 500;
          font-size: 1rem;
          color: #374151;

          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        .menu-arrow {
          font-size: 1.25rem;
          color: #9ca3af;
          margin-left: 0.5rem;
        }
      `}</style>

      <SketchDiv
        className={`menu-item ${className}`}
        onClick={onClick}
      >
        {showHatch && <HatchPattern opacity={0.3} />}

        <div className="menu-content">
          <div className="menu-icon">{icon}</div>
          <div className="menu-name">{name}</div>
          {hasArrow && <div className="menu-arrow">→</div>}
        </div>
      </SketchDiv>
    </>
  );
};

export default SketchMenuBtn;
