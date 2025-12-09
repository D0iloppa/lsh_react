import React from 'react';


// --- 2. 개선된 스타일 정의 (원본 디자인 유지) ---
const styles = {
  couponCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    marginBottom: '15px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    position: 'relative',
    borderLeft: '5px solid',
    transition: 'all 0.2s',
    height: '100px',
  },
  couponCardHover: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
  leftSection: {
    flex: 1,
    paddingRight: '20px',
  },
  couponTitle: {
    fontSize: '1rem',
    margin: '0 0 8px 0',
    fontWeight: 600,
    color: '#333',
  },
  discountAmount: {
    fontSize: '2.2rem',
    fontWeight: 900,
    margin: '5px 0',
    lineHeight: 1,
  },
  couponType: {
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '5px',
  },
  middleSection: {
    flex: 0.8,
    padding: '0 20px',
    borderLeft: '1px dashed #e0e0e0',
    borderRight: '1px dashed #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoItem: {
    fontSize: '0.85rem',
    color: '#555',
  },
  infoLabel: {
    fontWeight: 600,
    marginRight: '6px',
    color: '#333',
  },
  rightSection: {
    flex: 0.8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '10px',
  },
  expiryText: {
    fontSize: '0.8rem',
    color: '#666',
    textAlign: 'right',
  },
  usedText: {
    fontSize: '0.75rem',
    color: '#999',
    marginTop: '5px',
  },
  actionButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: 'white',
  },
  statusIcon: {
    fontSize: '2rem',
  },
  listContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#333',
  },
  // 상태별 색상
  statusColors: {
    USED: { 
      border: '#A9A9A9',
      discount: '#A9A9A9',
      button: '#B0B0B0',
      statusText: '사용완료',
      buttonText: '',
      showButton: false
    },
    ISSUED: { 
      border: '#4CAF50',
      discount: '#4CAF50',
      button: '#4CAF50',
      statusText: '발급됨',
      buttonText: '다운로드',
      showButton: true
    },
    DOWNLOADED: { 
      border: '#2196F3',
      discount: '#2196F3',
      button: '#2196F3',
      statusText: '다운로드 완료',
      buttonText: '',
      showButton: false
    },
  },
};

// --- 3. 상태별 스타일 가져오기 ---
const getStatusInfo = (status) => {
  return styles.statusColors[status] || {
    border: '#FFA500',
    discount: '#FFA500',
    button: '#FFA500',
    statusText: '알 수 없음',
    buttonText: '확인',
    showButton: true
  };
};

// --- 4. 쿠폰 카드 컴포넌트 ---
const CouponCard = ({ coupon }) => {
  const {
    coupon_type,
    discount_value,
    status,
    expired_at,
    coupon_token,
    used_at,
    coupon_id,
  } = coupon;

  const [isHovered, setIsHovered] = React.useState(false);
  const statusInfo = getStatusInfo(status);
  
  const cardStyle = {
    ...styles.couponCard,
    borderColor: statusInfo.border,
    opacity: status === 'USED' ? 0.65 : 1,
    ...(isHovered && status !== 'USED' ? styles.couponCardHover : {}),
  };

  // 할인 금액 포맷
  const discountValue = parseFloat(discount_value).toFixed(0);
  
  // 날짜 포맷
  const formatDate = (dateStr) => {
    if (!dateStr) return '날짜 미정';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleButtonClick = () => {
    if (status === 'ISSUED') {
      alert(`쿠폰 다운로드: ${coupon_token}`);
    } else if (status === 'DOWNLOADED') {
      alert(`쿠폰 사용하기: ${coupon_token}`);
    }
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 왼쪽: 쿠폰 정보 */}
      <div style={styles.leftSection}>
        <h3 style={styles.couponTitle}>
          매장 공통 할인 쿠폰
        </h3>
        <div style={{
          ...styles.discountAmount,
          color: statusInfo.discount
        }}>
          {discountValue}%
        </div>
        <div style={styles.couponType}>
          {coupon_type === 'PERCENT' ? '정률 할인 쿠폰' : '정액 할인 쿠폰'}
        </div>
      </div>

      {/* 오른쪽: 만료일 & 액션 */}
      <div style={styles.rightSection}>
        <div style={styles.expiryText}>
          <strong>유효기간</strong><br />
          ~ {formatDate(expired_at)}
        </div>
        
        {/* 상태 표시 */}
        <div style={{
          fontSize: '0.9rem',
          fontWeight: 'bold',
          color: statusInfo.border,
          padding: '5px 10px',
          backgroundColor: `${statusInfo.border}20`,
          borderRadius: '6px'
        }}>
          {statusInfo.statusText}
        </div>

        {status === 'USED' && used_at && (
          <div style={styles.usedText}>
            사용일: {formatDate(used_at)}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default CouponCard;