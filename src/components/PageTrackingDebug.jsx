// src/components/PageTrackingDebug.jsx
import React, { useState } from 'react';
import { usePageTracking } from '@contexts/PageTrackingContext';

const PageTrackingDebug = () => {
  const { 
    navigationStats, 
    getSessionStats, 
    getPageVisitCount, 
    getRecentNavigations, 
    resetSession 
  } = usePageTracking();
  
  const [isVisible, setIsVisible] = useState(false);

  const sessionStats = getSessionStats();

  if (!isVisible) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999
      }}>
        <button
          onClick={() => setIsVisible(true)}
          style={{
            background: '#007bff',
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
          📊
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
      maxWidth: '400px',
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
        <h3 style={{ margin: 0 }}>📊 페이지 추적 통계</h3>
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
        <h4>📈 세션 통계</h4>
        <div>총 이동 횟수: <strong>{sessionStats.totalNavigations}</strong></div>
        <div>세션 시간: <strong>{sessionStats.sessionDuration}초</strong></div>
        <div>평균 이동 간격: <strong>{sessionStats.averageTimeBetweenNavigations}초</strong></div>
        <div>마지막 이동: <strong>{sessionStats.lastNavigationPage || '없음'}</strong></div>
        <div>마지막 이동 시간: <strong>{sessionStats.lastNavigationTime ? new Date(sessionStats.lastNavigationTime).toLocaleTimeString() : '없음'}</strong></div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4>🏆 가장 많이 방문한 페이지</h4>
        {sessionStats.mostVisitedPages.map((page, index) => (
          <div key={page.page} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '2px 0'
          }}>
            <span>{index + 1}. {page.page}</span>
            <span style={{ fontWeight: 'bold' }}>{page.count}회</span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4>🕒 최근 이동 기록 (최대 10개)</h4>
        <div style={{ maxHeight: '150px', overflow: 'auto' }}>
          {getRecentNavigations(10).map((record, index) => (
            <div key={index} style={{
              border: '1px solid #eee',
              padding: '5px',
              margin: '2px 0',
              borderRadius: '3px',
              fontSize: '11px'
            }}>
              <div><strong>{record.page}</strong></div>
              <div>시간: {new Date(record.timestamp).toLocaleTimeString()}</div>
              <div>이전 이동과의 간격: {record.timeFromLastNavigation}ms</div>
              {record.data && (
                <div>데이터: {JSON.stringify(record.data).substring(0, 50)}...</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'center'
      }}>
        <button
          onClick={resetSession}
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
          🔄 세션 리셋
        </button>
        
        <button
          onClick={() => {
            console.log('📊 전체 네비게이션 통계:', navigationStats);
            console.log('📈 세션 통계:', sessionStats);
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

export default PageTrackingDebug; 