import React from 'react';
import HatchPattern from './HatchPattern';

const BookingSummary = ({ displayData, messages }) => {
  return (
    <>
      <style jsx="true">{`
        .booking-summary-box {
          border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
          border: 1px solid #1f2937;
          background-color: #f8fafc;
          padding: 1.5rem;
          margin-bottom: 2rem;
          transform: rotate(-0.3deg);
          box-shadow: 3px 3px 0px #1f2937;
          position: relative;
          overflow: hidden;
        }

        .summary-content {
          position: relative;
          z-index: 10;
        }

        .summary-item {
          font-size: 0.95rem;
          color: #374151;
          margin-bottom: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .summary-item:last-child {
          margin-bottom: 0;
        }

        .summary-label {
          font-weight: bold;
          color: #1f2937;
          min-width: 80px;
          flex-shrink: 0;
        }

        .summary-value {
          color: #4b5563;
          text-align: right;
          flex: 1;
          word-break: break-word;
        }

        .time-range {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .duration-info {
          font-size: 0.85rem;
          color: #6b7280;
          margin-top: 2px;
        }

        .memo-content {
          max-height: 60px;
          overflow-y: auto;
          background-color: #f9fafb;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .no-memo {
          color: #9ca3af;
          font-style: italic;
        }
      `}</style>
      
      <div className="booking-summary-box">
        <HatchPattern opacity={0.4} />
        <div className="summary-content">
          {/* 예약 대상 */}
          <div className="summary-item">
            <span className="summary-label">{messages.targetLabel}:</span>
            <span className="summary-value">{displayData.targetName}</span>
          </div>
          
          {/* 날짜 */}
          <div className="summary-item">
            <span className="summary-label">{messages.dateLabel}:</span>
            <span className="summary-value">{displayData.date}</span>
          </div>
          
          {/* 시간 */}
          <div className="summary-item">
            <span className="summary-label">{messages.timeLabel}:</span>
            <div className="time-range">
              <span className="summary-value">
                {displayData.startTime} - {displayData.endTime}
              </span>
              {displayData.duration && (
                <span className="duration-info">({displayData.duration})</span>
              )}
            </div>
          </div>
          
          {/* 참석자 */}
          <div className="summary-item">
            <span className="summary-label">{messages.attendeeLabel}:</span>
            <span className="summary-value">{displayData.attendee}</span>
          </div>
          
          {/* 메모 */}
          <div className="summary-item">
            <span className="summary-label">{messages.memoLabel}:</span>
            <div className="summary-value">
              {displayData.memo ? (
                <div className="memo-content">{displayData.memo}</div>
              ) : (
                <span className="no-memo">{messages.noMemo}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingSummary; 