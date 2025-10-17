import React, { useEffect, useState } from 'react';

const Block = () => {
  const [lang, setLang] = useState('ko'); // 기본 언어: 한국어

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const messages = {
  ko: {
    title: '서비스 이용이 제한되었습니다.',
    desc: (
      <>
        최근 <strong>고객님의 비정상적인 이용 행위(잦은 예약 취소)</strong>가 <br />
        확인되어 서비스 정책에 따라 이용이 제한되었습니다. <br />
        <br />
        서비스의 안정적인 운영과 다른 이용자분들의 <br />
        원활한 예약을 위한 조치입니다. <br />
        양해 부탁드립니다.
      </>
    ),
  },
  en: {
    title: 'Service Access Restricted',
    desc: (
      <>
        Due to <strong>frequent reservation cancellations</strong> recently, <br />
        your access has been restricted in accordance with our policy. <br />
        <br />
        This measure ensures stable service operation <br />
        and a smooth booking experience for all users. <br />
        We appreciate your understanding.
      </>
    ),
  },
  vi: {
    title: 'Tạm khóa dịch vụ',
    desc: (
      <>
        Gần đây, hệ thống phát hiện <strong>bạn hủy đặt chỗ nhiều lần</strong>, <br />
        vì vậy quyền sử dụng của bạn bị giới hạn theo chính sách dịch vụ. <br />
        <br />
        Biện pháp này nhằm đảm bảo hệ thống hoạt động ổn định <br />
        và giúp mọi người đặt chỗ thuận lợi hơn. <br />
        Rất mong bạn thông cảm.
      </>
    ),
  },
  ja: {
    title: '一時的に利用制限中',
    desc: (
      <>
        最近、<strong>頻繁な予約キャンセル</strong>が確認されたため、 <br />
        サービス方針に基づきご利用を一時的に制限しています。 <br />
        <br />
        安定した運営と他のお客様の円滑な予約のための措置です。 <br />
        ご理解とご協力をお願いいたします。
      </>
    ),
  },
  cn: {
    title: '服务使用受限',
    desc: (
      <>
        由于您最近<strong>多次取消预约</strong>， <br />
        根据服务政策，您的使用权限已被暂时限制。 <br />
        <br />
        此措施旨在确保服务稳定运行 <br />
        并为其他用户提供顺畅的预约体验。 <br />
        感谢您的理解与配合。
      </>
    ),
  },
};


  return (
    <div style={styles.container}>
      {/* 언어 선택 */}
      <div style={styles.langSelector}>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          style={styles.select}
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="vi">Tiếng Việt</option>
          <option value="ja">日本語</option>
          <option value="cn">中文</option>
        </select>
      </div>

      {/* 본문 */}
      <div style={styles.iconContainer}>
        <div style={styles.icon}>🚫</div>
      </div>
      <h1 style={styles.title}>{messages[lang].title}</h1>
      <p style={styles.message}>{messages[lang].desc}</p>
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
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
  },
  langSelector: {
    position: 'absolute',
    top: '20px',
    right: '20px',
  },
  select: {
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    backgroundColor: '#fff',
  },
  iconContainer: { marginBottom: '24px' },
  icon: { fontSize: '120px', animation: 'gentlePulse 2.5s infinite' },
  title: { fontSize: '30px', fontWeight: 'bold', marginBottom: '16px', color: '#1e293b' },
  message: { fontSize: '17px', color: '#475569', lineHeight: '1.7' },
};

// 부드러운 아이콘 애니메이션
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes gentlePulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
`;
document.head.appendChild(styleSheet);

export default Block;
