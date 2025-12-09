import React, { useState, useEffect } from 'react';
import { genQR } from '@utils/QrUtil';
import { Download, AlertCircle } from 'lucide-react'; // 아이콘 추가

const QrCodeDisplay = ({ token, title, get = (key) => key }) => {
  const [qrSrc, setQrSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generate = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        const url = await genQR(token);
        setQrSrc(url);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [token]);

  // 다운로드 핸들러
  const handleDownload = () => {
    if (!qrSrc) return;

    const link = document.createElement('a');
    link.href = qrSrc;
    link.download = `coupon_qr_${token}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!token) return null;

  return (
    <div className="qr-container">
      <style jsx="true">{`
        .qr-container {
          background: white;
          border: 2px solid #333;
          border-radius: 8px 12px 6px 10px;
          padding: 25px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 5px 5px 0px rgba(0,0,0,0.1);
          transform: rotate(-0.5deg);
          max-width: 340px; /* 안내 문구가 들어가므로 폭을 살짝 넓힘 */
          margin: 0 auto;
          position: relative;
        }

        .qr-title {
          font-weight: 800;
          margin-bottom: 20px;
          color: #333;
          font-size: 1.2rem;
          text-align: center;
          width: 100%;
          border-bottom: 2px dashed #eee;
          padding-bottom: 10px;
        }

        .qr-image-wrapper {
          background: white;
          padding: 10px;
          border: 1px solid #eee;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .qr-image {
          display: block;
          max-width: 100%;
          width: 200px;
          height: 200px;
        }

        .download-btn {
          background: #333;
          color: white;
          border: 2px solid #333;
          border-top-left-radius: 255px 15px;
          border-top-right-radius: 15px 225px;
          border-bottom-right-radius: 225px 15px;
          border-bottom-left-radius: 15px 255px;
          padding: 12px 24px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          width: 100%;
          justify-content: center;
          box-shadow: 2px 2px 0px rgba(0,0,0,0.2);
          margin-bottom: 20px; /* 하단 안내 문구와 간격 추가 */
        }

        .download-btn:hover {
          transform: translateY(-2px) scale(1.02);
          background: #444;
          box-shadow: 4px 4px 0px rgba(0,0,0,0.2);
        }

        .download-btn:active {
          transform: translateY(1px);
          box-shadow: 1px 1px 0px rgba(0,0,0,0.2);
        }

        /* 안내 문구 영역 스타일 */
        .qr-notice-area {
          width: 100%;
          background-color: #f8f9fa;
          border: 1px dashed #bbb;
          border-radius: 6px;
          padding: 12px;
          text-align: left;
        }

        .notice-item {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 6px;
          line-height: 1.4;
          display: flex;
          align-items: flex-start;
          gap: 6px;
          word-break: keep-all; /* 단어 단위 줄바꿈 */
        }

        .notice-item:last-child {
          margin-bottom: 0;
        }

        .notice-icon {
          min-width: 14px;
          margin-top: 3px;
          color: #888;
        }

        /* 강조 텍스트 스타일 (두 번째 문구) */
        .highlight-text {
          color: #e53935; /* 붉은색 계열로 강조 */
          font-weight: 600;
        }

        .loading-text {
          width: 200px; 
          height: 200px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #999;
          font-size: 0.9rem;
        }
      `}</style>
      
      <div className="qr-title">
          {title || get('COUPON_QR_TITLE') || "Coupon QR"}
      </div>

      <div className="qr-image-wrapper">
        {loading ? (
          <div className="loading-text">{get('QR_GENERATING') || 'QR 코드 생성 중...'}</div>
        ) : (
          qrSrc && <img src={qrSrc} alt="Coupon QR" className="qr-image" />
        )}
      </div>

      <button className="download-btn" onClick={handleDownload}>
        <Download size={18} />
        {'Download'}
      </button>

      {/* 안내 문구 영역 추가 */}
      <div className="qr-notice-area">
        <div className="notice-item">
          <AlertCircle size={14} className="notice-icon" />
          <span>{get('coupon_desc_1') || '본 쿠폰은 자동으로 적용되지 않습니다.'}</span>
        </div>
        <div className="notice-item">
          <AlertCircle size={14} className="notice-icon" style={{color: '#e53935'}} />
          <span className="highlight-text">{get('coupon_desc_2') || '결제 시, 본 QR코드를 매니저에게 제시해주세요!'}</span>
        </div>
      </div>

    </div>
  );
};

export default QrCodeDisplay;