import React, { useState, useEffect} from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import ToggleRadio from '@components/ToggleRadio';
import '@components/SketchComponents.css';

const mockStaffs = [
  {
    id: 1,
    name: 'Nguyen Thi Hoa',
    rating: 4,
    img: '',
  },
  {
    id: 2,
    name: 'Tran van Binh',
    rating: 3,
    img: '',
  },
  {
    id: 3,
    name: 'Le Minh Tuan',
    rating: 5,
    img: '',
  },
];

const StaffManagement = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {

  return (
    <>
      <style jsx="true">{`
        .staff-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .add-btn-row {
          display: flex;
          justify-content: flex-end;
          margin: 0.7rem 0 1.1rem 0;
        }
        .staff-list {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .staff-card {
          position: relative;
          background: #fff;
          padding: 0.7rem 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }
        .staff-img {
          width: 60px;
          height: 60px;
          background: #f3f4f6;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.1rem;
          color: #bbb;
        }
        .staff-info {
          flex: 1;
        }
        .staff-name {
          font-size: 1.02rem;
          font-weight: 600;
          margin-bottom: 0.1rem;
        }
        .staff-rating {
          font-size: 0.92rem;
          color: #222;
        }
        .staff-actions {
          display: flex;
          align-items: center;
        }
        .action-btn {
          min-width: 38px;
          font-size: 1.1rem;
          padding: 0.18rem 0.5rem;
        }
      `}</style>
      <div className="staff-container">
        <SketchHeader
          title="Staff Management"
          showBack={true}
          onBack={goBack}
        />
        <div className="add-btn-row">
          <SketchBtn variant="primary" size="normal" style={{width: '118px', fontSize: '14px', height: '37px'}}>+ Add Staff
            <HatchPattern opacity={0.8} /></SketchBtn>
        </div>
        <div className="staff-list">
          {mockStaffs.map(staff => (
            <SketchDiv key={staff.id} className="staff-card"><HatchPattern opacity={0.4} />
              <div className="staff-img">{staff.img || <span>🖼️</span>}</div>
              <div className="staff-info">
                <div className="staff-name">{staff.name}</div>
                <div className="staff-rating">
                  Rating {' '}
                  {[1,2,3,4,5].map(i => (
                    <span key={i}>{i <= staff.rating ? '★' : '☆'}</span>
                  ))}
                </div>
              </div>
              <div className="staff-actions">
                <ToggleRadio />
              </div>
            </SketchDiv>
          ))}
        </div>
      </div>
    </>
  );
};

export default StaffManagement;