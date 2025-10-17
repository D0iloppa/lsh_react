import React, { useEffect } from 'react';

const Block = () => {

  useEffect(() => {
    // 현재 페이지 상태를 push하여 뒤로가기를 막음
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
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
        <div style={styles.icon}>⚠️</div>
      </div>
      <h1 style={styles.title}>이용이 제한되었습니다</h1>
      <p style={styles.message}>
        최근 <strong>예약 취소가 지나치게 빈번</strong>하게 발생하여 <br />
        서비스 이용 정책에 따라 <strong>일시적으로 제한</strong>되었습니다. <br />
        <br />
        계정 보호와 공정한 이용 환경 유지를 위한 조치이오니, <br />
        불편을 드려 죄송합니다.
      </p>

      <div style={styles.dateBox}>
        <div style={styles.dateLabel}>제한 해제 예정일</div>
        <div style={styles.date}>2025. 10. 31</div>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          문의사항이 있으신 경우 <br />
          고객센터(<a href="mailto:support@example.com" style={styles.link}>support@example.com</a>)로 연락해 주세요.
        </p>
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
    backgroundColor: '#fef2f2',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  iconContainer: {
    marginBottom: '24px',
  },
  icon: {
    fontSize: '64px',
    animation: 'pulse 1.5s infinite',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#b91c1c',
  },
  message: {
    fontSize: '18px',
    marginBottom: '32px',
    color: '#374151',
    lineHeight: '1.7',
  },
  dateBox: {
    backgroundColor: '#fff',
    padding: '20px 32px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: '32px',
    border: '2px solid #fecaca',
  },
  dateLabel: {
    fontSize: '14px',
    color: '#991b1b',
    marginBottom: '8px',
    fontWeight: '500',
  },
  date: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#dc2626',
  },
  footer: {
    marginTop: '20px',
  },
  footerText: {
    fontSize: '15px',
    color: '#6b7280',
    lineHeight: '1.5',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
  },
};

// 경고 애니메이션
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;
document.head.appendChild(styleSheet);

export default Block;
