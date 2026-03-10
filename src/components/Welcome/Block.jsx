import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

const Block = () => {
  const [lang, setLang] = useState('ko');
  const navigate = useNavigate();

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  /*
  const messages = {
    ko: {
      title: '서비스 준비 중입니다',
      desc: (
        <>
          더 나은 서비스를 제공하기 위해 <br />
          <strong>시스템 개편이 진행 중입니다.</strong> <br />
          <br />
          향상된 서비스로 다시 찾아뵙겠습니다. <br />
          감사합니다.
        </>
      ),
      btn: '오픈채팅'
    },
    en: {
      title: 'Service Under Preparation',
      desc: (
        <>
          We are currently performing <br />
          <strong>system improvements</strong> to provide better service. <br />
          <br />
          We will return soon with an improved experience. <br />
          Thank you.
        </>
      ),
      btn: 'Open Chat'
    },
    vi: {
      title: 'Đang chuẩn bị dịch vụ',
      desc: (
        <>
          Hệ thống đang được <strong>nâng cấp</strong> <br />
          để mang đến dịch vụ tốt hơn. <br />
          <br />
          Chúng tôi sẽ sớm quay lại với phiên bản mới. <br />
          Xin cảm ơn.
        </>
      ),
      btn: 'Chat'
    },
    ja: {
      title: 'サービス準備中',
      desc: (
        <>
          より良いサービス提供のため <br />
          <strong>システム改編作業</strong>を行っています。 <br />
          <br />
          新しいサービスでまもなく戻ってきます。 <br />
          ありがとうございます。
        </>
      ),
      btn: 'チャット'
    },
    cn: {
      title: '服务准备中',
      desc: (
        <>
          为了提供更好的服务体验， <br />
          当前正在进行<strong>系统升级</strong>。 <br />
          <br />
          我们将很快以更好的服务再次与您见面。 <br />
          感谢您的理解。
        </>
      ),
      btn: '在线聊天'
    },
  };
  */


  const messages = {
    ko: {
      title: '서비스 종료 안내',
      desc: (
        <>
          그동안의 성원에 감사드립니다. <br />
          더 나은 가치를 제공해 드리기 위해, <br />
          기존 서비스는 여기서 마침표를 찍게 되었습니다. <br />
          <br />
          감사합니다.
        </>
      ),
      btn: '오픈채팅'
    },
    en: {
      title: 'Service Termination Notice',
      desc: (
        <>
          Thank you for your support. <br />
          To provide better value, <br />
          we are ending our current service. <br />
          <br />
          Thank you.
        </>
      ),
      btn: 'Open Chat'
    },
    vi: {
      title: 'Thông báo kết thúc dịch vụ',
      desc: (
        <>
          Cảm ơn sự ủng hộ của bạn. <br />
          Để mang lại giá trị tốt hơn, <br />
          dịch vụ hiện tại xin được kết thúc tại đây. <br />
          <br />
          Xin cảm ơn.
        </>
      ),
      btn: 'Chat'
    },
    ja: {
      title: 'サービス終了のご案内',
      desc: (
        <>
          これまでのご愛顧에感謝いたします。 <br />
          より良い価値を提供するため、 <br />
          現行サービスはここで終了させていただくこととなりました。 <br />
          <br />
          ありがとうございます。
        </>
      ),
      btn: 'チャット'
    },
    cn: {
      title: '服务终止通知',
      desc: (
        <>
          感谢您一直以来的支持。 <br />
          为了提供更好的价值， <br />
          现行服务将在此画上句号。 <br />
          <br />
          谢谢。
        </>
      ),
      btn: '在线聊天'
    },
  };

  const openChat = () => {
    navigate('/openchat');
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

      {/* 아이콘 */}
      <div style={styles.iconContainer}>
        <div style={styles.icon}>🚧</div>
      </div>

      {/* 제목 */}
      <h1 style={styles.title}>{messages[lang].title}</h1>

      {/* 메시지 */}
      <p style={styles.message}>{messages[lang].desc}</p>

      {/* 버튼 */}
      <button style={styles.button} onClick={openChat}>
        {messages[lang].btn}
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
  iconContainer: {
    marginBottom: '24px'
  },
  icon: {
    fontSize: '110px',
    animation: 'gentlePulse 2.5s infinite'
  },
  title: {
    fontSize: '30px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#1e293b'
  },
  message: {
    fontSize: '17px',
    color: '#475569',
    lineHeight: '1.7',
    marginBottom: '30px'
  },
  button: {
    display: 'none',
    padding: '12px 28px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#f59e0b',
    color: '#fff',
    cursor: 'pointer'
  }
};

// 아이콘 애니메이션
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes gentlePulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
`;
document.head.appendChild(styleSheet);

export default Block;