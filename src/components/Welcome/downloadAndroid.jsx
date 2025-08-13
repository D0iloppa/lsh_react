// src/components/UpdateRequired.jsx

import React from 'react';

const UpdateRequired = () => {
  const downloadUrl = 'https://play.google.com/store/apps/details?id=com.letanton.user'; // 실제 다운로드 링크로 변경하세요


  const handleUpdateClick = () => {
    window.location.href = downloadUrl;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>업데이트 안내</h1>
      <p style={styles.message}>
        더 나은 서비스 제공을 위해 <br />
        앱이 최신 버전으로 업데이트되었습니다. <br />
        지금 바로 최신 버전으로 업데이트 후 이용해 주세요.
      </p>
      <button style={styles.button} onClick={handleUpdateClick}>
        최신 버전으로 업데이트
      </button>
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
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: '30px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  message: {
    fontSize: '17px',
    marginBottom: '28px',
    color: '#444',
    lineHeight: '1.6',
  },
  button: {
    padding: '14px 28px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default UpdateRequired;
