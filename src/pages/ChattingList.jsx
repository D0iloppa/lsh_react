import React, { useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import '@components/SketchComponents.css';

const mockStaffs = [
  {
    id: 1,
    name: 'Nguyen Thi Hoa',
    lastMessage: '나를 데리러오시오',
    lastTime: '10:24',
    isNew: 2,
    img: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 2,
    name: 'Tran van Binh',
    lastMessage: '출근 완료했습니다',
    lastTime: '09:15',
    isNew: 0,
    img: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    id: 3,
    name: 'Le Minh Tuan',
    lastMessage: '잠시 외출 중입니다',
    lastTime: '08:42',
    isNew: 1,
    img: '/cdn/content/1.png',
  },
  {
    id: 4,
    name: 'Le Minh Tuan',
    lastMessage: '잠시 외출 중입니다',
    lastTime: '08:42',
    isNew: 1,
    img: '/cdn/content/1.png',
  },
  {
    id: 5,
    name: 'Le Minh Tuan',
    lastMessage: '잠시 외출 중입니다',
    lastTime: '08:42',
    isNew: 1,
    img: '/cdn/content/1.png',
  },
  {
    id: 6,
    name: 'Le Minh Tuan',
    lastMessage: '잠시 외출 중입니다',
    lastTime: '08:42',
    isNew: 1,
    img: '/cdn/content/1.png',
  },
  {
    id: 7,
    name: 'Le Minh Tuan',
    lastMessage: '잠시 외출 중입니다',
    lastTime: '08:42',
    isNew: 1,
    img: '/cdn/content/1.png',
  },
];

const StaffManagement = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        .staff-list {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          padding: 1rem;
        }
        .staff-card {
          position: relative;
          background: #fff;
          padding: 0.7rem 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .staff-img {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          background: #f3f4f6;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: #bbb;
          flex-shrink: 0;
        }
        .staff-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .staff-info {
          flex: 1;
        }
        .staff-name {
          font-size: 1.02rem;
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        .staff-rating {
          font-size: 0.9rem;
          color: #555;
        }
        .staff-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          gap: 0.4rem;
          min-width: 50px;
        }
        .last-time {
          font-size: 0.75rem;
          color: #999;
        }
        .new-badge {
          background-color: red;
          color: white;
          font-size: 0.72rem;
          font-weight: bold;
          width: 1.4rem;
          height: 1.4rem;
          line-height: 1.4rem;
          border-radius: 50%;
          text-align: center;
        }
      `}</style>

      <div className="staff-container">
        <SketchHeader
          title="Chatting List"
          showBack={true}
          onBack={goBack}
        />
        <div className="staff-list">
          {mockStaffs.map((staff) => (
            <SketchDiv key={staff.id} className="staff-card">
              <HatchPattern opacity={0.4} />
              <div className="staff-img">
                {staff.img ? (
                  <img src={staff.img} alt={staff.name} />
                ) : (
                  <span>🖼️</span>
                )}
              </div>
              <div className="staff-info">
                <div className="staff-name">{staff.name}</div>
                <div className="staff-rating">{staff.lastMessage}</div>
              </div>
              <div className="staff-actions">
                <div className="last-time">{staff.lastTime}</div>
                {staff.isNew > 0 && (
                  <div className="new-badge">{staff.isNew}</div>
                )}
              </div>
            </SketchDiv>
          ))}
        </div>
      </div>
    </>
  );
};

export default StaffManagement;
