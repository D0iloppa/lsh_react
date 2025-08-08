/**
 * 베트남 호치민시 시간대(UTC+7) 기준으로 현재 시간을 가져오는 유틸리티
 */

/**
 * 베트남 시간 기준으로 현재 시간 정보를 가져옵니다
 * @returns {Object} 베트남 시간 정보
 */
export const getVietnamTime = () => {
  const now = new Date();
  
  try {
    // Intl.DateTimeFormat을 사용한 방법 (권장)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    
    return {
      year: parts.find(p => p.type === 'year').value,
      month: parts.find(p => p.type === 'month').value,
      day: parts.find(p => p.type === 'day').value,
      hour: parseInt(parts.find(p => p.type === 'hour').value),
      minute: parseInt(parts.find(p => p.type === 'minute').value),
      second: parseInt(parts.find(p => p.type === 'second').value),
      date: `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`,
      time: `${parts.find(p => p.type === 'hour').value}:${parts.find(p => p.type === 'minute').value}:${parts.find(p => p.type === 'second').value}`
    };
  } catch (error) {
    console.warn('Intl.DateTimeFormat not supported, using UTC+7 calculation');
    
    // 폴백: UTC+7 직접 계산
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const vietnamTime = new Date(utcTime + (7 * 3600000)); // UTC+7
    
    const year = vietnamTime.getFullYear();
    const month = String(vietnamTime.getMonth() + 1).padStart(2, '0');
    const day = String(vietnamTime.getDate()).padStart(2, '0');
    const hour = vietnamTime.getHours();
    const minute = vietnamTime.getMinutes();
    const second = vietnamTime.getSeconds();
    
    return {
      year: String(year),
      month,
      day,
      hour,
      minute,
      second,
      date: `${year}-${month}-${day}`,
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
    };
  }
};

/**
 * 베트남 시간 기준으로 현재 날짜만 가져옵니다 (YYYY-MM-DD 형식)
 * @returns {string} 베트남 기준 오늘 날짜
 */
export const getVietnamDate = () => {
  return getVietnamTime().date;
};

/**
 * 베트남 시간 기준으로 현재 시간만 가져옵니다 (HH 형식)
 * @returns {number} 베트남 기준 현재 시간 (0-23)
 */
export const getVietnamHour = () => {
  return getVietnamTime().hour;
};

/**
 * 베트남 시간 기준으로 현재 시간을 Date 객체로 가져옵니다
 * @returns {Date} 베트남 시간 기준 Date 객체
 */
export const getVietnamDateObject = () => {
  const vietnamTime = getVietnamTime();
  return new Date(`${vietnamTime.date}T${vietnamTime.time}`);
};

/**
 * 베트남 시간대가 현재 시간인지 확인합니다
 * @param {string} dateString - 확인할 날짜 (YYYY-MM-DD 형식)
 * @returns {boolean} 베트남 기준 오늘인지 여부
 */
export const isVietnamToday = (dateString) => {
  return dateString === getVietnamDate();
}; 


const formatYMDInTZ = (date, timeZone = 'Asia/Ho_Chi_Minh') => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date); // 'YYYY-MM-DD'
};

// 타임존 기준으로 Date를 "해당 지역 시간"으로 보정한 사본 생성
const toTZDate = (date, timeZone = 'Asia/Ho_Chi_Minh') =>
  new Date(date.toLocaleString('en-US', { timeZone }));

const tzNoonFromYMD = (y, m /*1~12*/, d) =>
  new Date(Date.UTC(y, m - 1, d, 12, 0, 0)); // UTC 정오 → 어떤 TZ로 보나 날짜가 안전

const TZ = 'Asia/Ho_Chi_Minh';

export const vnNow = () => {
  const f = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const p = f.formatToParts(new Date()).reduce((o, x) => (o[x.type] = x.value, o), {});
  // 예: 2025-08-08T01:04:25+07:00
  return new Date(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}+07:00`);
};

// 'HH:mm' -> {h,m}
export const parseHHMM = (hhmm) => {
  const [h, m = '0'] = hhmm.split(':');
  return { h: parseInt(h, 10), m: parseInt(m, 10) };
};

// YYYY-MM-DD + HH:mm (+dayOffset) => 베트남시간의 절대 Date
export const buildVNDateTime = (ymd, hhmm, dayOffset = 0) => {
  const { h, m } = parseHHMM(hhmm); // "HH:mm" 또는 "HH:mm:ss" 모두 처리된다고 가정
  let extra = Math.floor(h / 24);       // 24:00, 25:00 ... 처리
  const hour = h % 24;

  // 베트남(+07:00) 기준 앵커 생성
  const base = new Date(`${ymd}T${String(hour).padStart(2,'0')}:${String(m).padStart(2,'0')}:00+07:00`);

  // 하루 단위는 ms로 더해서 타임존/로컬 DST 의존성 제거
  const daysToAdd = (dayOffset + extra);
  const result = new Date(base.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  return result;
};