// src/components/PopupTrackingDebug.jsx
import React, { useState, useEffect } from 'react';
import { usePopup } from '@contexts/PopupContext';

const PopupTrackingDebug = () => {
  const { 
    popupTracking,
    getPopupStats, 
    getPopupHistory, 
    resetPopupTracking,
    getCurrentPopupDuration,
    activePopups
  } = usePopup();
  
  const [isVisible, setIsVisible] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [timeConditionInfo, setTimeConditionInfo] = useState(null);

  // 현재 팝업 지속 시간을 실시간으로 업데이트
  useEffect(() => {
    if (activePopups.length > 0) {
      const interval = setInterval(() => {
        setCurrentDuration(getCurrentPopupDuration());
      }, 1000); // 1초마다 업데이트

      return () => clearInterval(interval);
    } else {
      setCurrentDuration(0);
    }
  }, [activePopups, getCurrentPopupDuration]);

  // 시간 조건 정보 업데이트
  useEffect(() => {
    const updateTimeCondition = () => {
      const lastPopupTime = localStorage.getItem('lastPopupTime');
      if (lastPopupTime) {
        const now = new Date();
        const lastTime = new Date(lastPopupTime);
        const timeDiff = now.getTime() - lastTime.getTime();
        const fiveMinutes = 5 * 60 * 1000;
        const remainingTime = Math.ceil((fiveMinutes - timeDiff) / 1000 / 60);
        
        setTimeConditionInfo({
          lastPopupTime: new Date(lastPopupTime).toLocaleTimeString(),
          timeDiff: Math.floor(timeDiff / 1000 / 60),
          canShow: timeDiff >= fiveMinutes,
          remainingTime: remainingTime > 0 ? remainingTime : 0
        });
      } else {
        setTimeConditionInfo({
          lastPopupTime: '없음',
          timeDiff: 0,
          canShow: true,
          remainingTime: 0
        });
      }
    };

    updateTimeCondition();
    const interval = setInterval(updateTimeCondition, 1000); // 1초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  const stats = getPopupStats();

  if (!isVisible) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        zIndex: 9999
      }}>
        <button
          onClick={() => setIsVisible(true)}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
        >
          ⏱️
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      border: '2px solid #333',
      borderRadius: '10px',
      padding: '20px',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 10000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        borderBottom: '1px solid #ccc',
        paddingBottom: '10px'
      }}>
        <h3 style={{ margin: 0 }}>⏱️ 팝업 추적 통계</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '5px 10px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4>📊 팝업 통계</h4>
        <div>총 팝업 표시 횟수: <strong>{stats.totalPopupsShown}</strong></div>
        <div>총 팝업 표시 시간: <strong>{Math.floor(stats.totalPopupTime / 1000)}초</strong></div>
        <div>평균 팝업 지속 시간: <strong>{Math.floor(stats.averagePopupTime / 1000)}초</strong></div>
        <div>마지막 팝업 시간: <strong>{stats.lastPopupTime ? new Date(stats.lastPopupTime).toLocaleTimeString() : '없음'}</strong></div>
        
        {/* 시간 조건 정보 */}
        {timeConditionInfo && (
          <div style={{ 
            background: timeConditionInfo.canShow ? '#d4edda' : '#f8d7da', 
            padding: '10px', 
            borderRadius: '5px', 
            marginTop: '10px',
            border: `1px solid ${timeConditionInfo.canShow ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            <div><strong>⏰ 시간 조건:</strong></div>
            <div>마지막 팝업: {timeConditionInfo.lastPopupTime}</div>
            <div>경과 시간: {timeConditionInfo.timeDiff}분</div>
            <div>팝업 가능: <strong>{timeConditionInfo.canShow ? '✅ 가능' : '❌ 불가능'}</strong></div>
            {!timeConditionInfo.canShow && (
              <div>남은 시간: <strong>{timeConditionInfo.remainingTime}분</strong></div>
            )}
          </div>
        )}
        
        {activePopups.length > 0 && (
          <div style={{ 
            background: '#fff3cd', 
            padding: '10px', 
            borderRadius: '5px', 
            marginTop: '10px',
            border: '1px solid #ffeaa7'
          }}>
            <div><strong>🟡 현재 열린 팝업:</strong></div>
            {activePopups.map((popup, index) => (
              <div key={popup.id} style={{ marginTop: '5px' }}>
                <div>ID: {popup.id}</div>
                <div>제목: {popup.title}</div>
                <div>시작 시간: {new Date(popup.startTime).toLocaleTimeString()}</div>
                <div>지속 시간: <strong>{Math.floor(currentDuration / 1000)}초</strong></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4>📋 최근 팝업 히스토리 (최대 10개)</h4>
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          {getPopupHistory(10).map((record, index) => (
            <div key={index} style={{
              border: '1px solid #eee',
              padding: '8px',
              margin: '5px 0',
              borderRadius: '5px',
              fontSize: '11px',
              background: '#f8f9fa'
            }}>
              <div><strong>{record.title || record.id}</strong></div>
              <div>시작: {new Date(record.startTime).toLocaleTimeString()}</div>
              <div>종료: {new Date(record.endTime).toLocaleTimeString()}</div>
              <div>지속 시간: <strong>{Math.floor(record.duration / 1000)}초</strong></div>
              <div>타입: {record.type}</div>
            </div>
          ))}
          {getPopupHistory(10).length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              color: '#6c757d', 
              fontStyle: 'italic',
              padding: '20px'
            }}>
              팝업 히스토리가 없습니다.
            </div>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={resetPopupTracking}
          style={{
            background: '#ffc107',
            color: '#333',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 15px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔄 추적 데이터 리셋
        </button>
        
        <button
          onClick={() => {
            localStorage.removeItem('lastPopupTime');
            console.log('⏰ 마지막 팝업 시간이 초기화되었습니다.');
            alert('마지막 팝업 시간이 초기화되었습니다!');
          }}
          style={{
            background: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 15px',
            cursor: 'pointer'
          }}
        >
          ⏰ 시간 조건 리셋
        </button>
        
        <button
          onClick={() => {
            console.log('📊 전체 팝업 통계:', stats);
            console.log('📋 팝업 히스토리:', getPopupHistory());
            console.log('🟡 현재 활성 팝업:', activePopups);
            console.log('⏰ 시간 조건 정보:', timeConditionInfo);
            alert('콘솔에서 전체 통계를 확인하세요!');
          }}
          style={{
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 15px',
            cursor: 'pointer'
          }}
        >
          📋 콘솔 출력
        </button>
      </div>
    </div>
  );
};

export default PopupTrackingDebug; 