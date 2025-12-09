// src/utils/QrUtil.js
import QRCode from 'qrcode';

// QR 코드 생성 옵션 (필요에 따라 수정 가능)
const QR_OPTIONS = {
  width: 200,
  margin: 2,
  color: {
    dark: '#333333', // QR 코드 색상 (프로젝트 테마에 맞춰 진한 회색)
    light: '#ffffff', // 배경색
  },
};

/**
 * 토큰을 받아 QR 코드 데이터 URL을 반환하는 함수
 * @param {string} token - 쿠폰 토큰
 * @returns {Promise<string>} - QR 코드 이미지 Data URL (base64)
 */
export const genQR = async (token) => {
  if (!token) return null;

  // 생성할 타겟 URL
  const url = `https://letantonsheriff.com/app_qr?coupon_token=${token}`;

  try {
    // toDataURL은 Promise를 반환합니다.
    const dataUrl = await QRCode.toDataURL(url, QR_OPTIONS);
    return dataUrl;
  } catch (err) {
    console.error('QR Code generation failed:', err);
    return null;
  }
};