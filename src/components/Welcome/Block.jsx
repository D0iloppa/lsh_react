import React, { useEffect, useState } from 'react';

const Block = () => {

  useEffect(() => {
    // 현재 상태를 강제로 push
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      // 뒤로가기를 눌러도 같은 주소로 다시 push
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.iconContainer}>
        <div style={styles.icon}>🚀</div>
      </div>
      <h1 style={styles.title}>서비스 준비 중</h1>
      <p style={styles.message}>
        더 나은 서비스를 위해 열심히 준비하고 있습니다. <br />
        <strong>2025년 8월 17일</strong>에 정식 오픈 예정입니다. <br />
        조금만 기다려 주세요!
      </p>
      <div style={styles.dateBox}>
        <div style={styles.dateLabel}>오픈 예정일</div>
        <div style={styles.date}>2025. 08. 17</div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  iconContainer: {
    marginBottom: '24px',
  },
  icon: {
    fontSize: '60px',
    animation: 'bounce 2s infinite',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#1e293b',
  },
  message: {
    fontSize: '18px',
    marginBottom: '32px',
    color: '#475569',
    lineHeight: '1.6',
  },
  dateBox: {
    backgroundColor: '#ffffff',
    padding: '20px 32px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: '32px',
    border: '2px solid #e2e8f0',
  },
  dateLabel: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '8px',
    fontWeight: '500',
  },
  date: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  footer: {
    marginTop: '20px',
  },
  footerText: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: '1.5',
  },
};

// CSS 애니메이션을 위한 스타일 추가
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0, -15px, 0);
    }
    70% {
      transform: translate3d(0, -7px, 0);
    }
    90% {
      transform: translate3d(0, -2px, 0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default Block;