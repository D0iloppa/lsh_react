import React from 'react';
import SketchBtn from './SketchBtn';
import SketchDiv from './SketchDiv';
import HatchPattern from './HatchPattern';
import { CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';

// 주차별 섹션 컴포넌트
const WeekSection = ({
  weekTitle,
  schedules = [],
  usingFolding = true,
  folded = false,
  onToggleFold = () => {},
  isPastWeek = false,
  get = (k) => k,
  handleEditSchedule = () => {},
  handleCheckInOut = () => {},
  handleCreateSchedule = () => {},
  formatDate = (d) => d,
  formatTimeToAMPM = (t) => t,
  getStatusText = (s) => s
}) => {
  return (
    <SketchDiv className={`week-section${folded ? ' folded' : ''}${isPastWeek ? ' past-week' : ''}`} style={{marginBottom: '0.7rem', padding: '0.3rem 0.8rem'}}>
      <div className="week-section-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',minHeight:'2.2rem'}}>
        <span className="week-section-title">{weekTitle}</span>
        {usingFolding && (
          <SketchBtn size="small" style={{width:'5rem',minWidth:'5rem',padding:'0.2rem 0',display:'flex',justifyContent:'center',alignItems:'center'}} onClick={onToggleFold}>
            {folded ? <ChevronDown size={20} color="#222" /> : <ChevronUp size={20} color="#222" />}
          </SketchBtn>
        )}
      </div>
      {(!usingFolding || !folded) && (
        <div className="week-section-list">
          {schedules.map((schedule, index) => {
            const dateInfo = formatDate(new Date(schedule.work_date));
            const status = schedule.status || 'no-schedule';
            let actions = [];
            switch (status) {
              case 'pending':
              case 'rejected':
              case 'dayoff':
                actions = [
                  { label: get('WORK_SCHEDULE_REQUEST_CHANGE'), handler: () => handleEditSchedule(schedule) }
                ]; break;
              case 'available': {
                const isCheckedIn = schedule.check_in && !schedule.check_out;
                const isCheckedOut = !!schedule.check_out;
                actions = [
                  {
                    label: isCheckedOut ? get('WORK_SCHEDULE_END') : isCheckedIn ? get('WORK_SCHEDULE_CHECK_OUT') : get('WORK_SCHEDULE_CHECK_IN'),
                    handler: () => handleCheckInOut(schedule, isCheckedIn, isCheckedOut),
                    ...(isCheckedOut && { variant: 'violet' })
                  }
                ]; break;
              }
              case 'no-schedule':
              default:
                actions = [
                  { label: get('WORK_SCHEDULE_APPLY_SCHEDULE'), handler: () => handleCreateSchedule() }
                ]; break;
            }
            return (
              <div key={`schedule-${schedule.schedule_id || schedule.work_date || index}`} className={`schedule-row${schedule.check_out ? ' check-outed' : ''}`} style={{marginBottom:'0.2rem'}}>
                <div className="schedule-day">{dateInfo.day}</div>
                <div className="schedule-time">
                  {status === 'no-schedule' || status === 'dayoff' || !schedule.start_time ?
                    <span className={status === 'dayoff' ? 'schedule-time-dayoff' : status === 'no-schedule' ? 'schedule-time-no-schedule' : ''}>
                      {getStatusText(status)}
                    </span> :
                    <>
                      <span className="schedule-time-text">{`${formatTimeToAMPM(schedule.start_time)} - ${formatTimeToAMPM(schedule.end_time)}`}</span>
                      {schedule.check_out && <><CheckCircle size={14} color="#7c3aed" style={{marginLeft: '0.5em', verticalAlign: 'middle'}} /><span className="checked-out-badge">{get('WORK_SCHEDULE_CHECKED_OUT')}</span></>}
                    </>
                  }
                </div>
                <div className="schedule-actions">
                  {actions.map((action, actionIndex) => (
                    <SketchBtn key={`${schedule.schedule_id || schedule.work_date || index}-${action.label}-${actionIndex}`} size="small" className="schedule-action-btn" style={{minWidth:'unset',padding:'0.2rem 0.7rem',fontSize:'0.95rem'}} onClick={action.handler}>
                      <HatchPattern opacity={0.6} />
                      {action.label}
                    </SketchBtn>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SketchDiv>
  );
};

export default WeekSection; 