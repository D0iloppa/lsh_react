import React from 'react';

/**
 * 텍스트의 줄바꿈(\n)을 React JSX 요소로 변환하는 함수
 * @param {string} text - 처리할 텍스트
 * @returns {React.ReactNode} 줄바꿈이 처리된 JSX 요소
 */
export const formatTextWithLineBreaks = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  // \n을 기준으로 텍스트를 분할하고 각 줄을 JSX 요소로 변환
  return text.split('\n').map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));
};

/**
 * 텍스트의 줄바꿈을 CSS white-space로 처리하는 함수 (성능 최적화용)
 * @param {string} text - 처리할 텍스트
 * @returns {string} 원본 텍스트 (CSS로 처리)
 */
export const preserveLineBreaks = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text;
};

/**
 * 텍스트를 특정 길이로 자르고 말줄임표를 추가하는 함수
 * @param {string} text - 처리할 텍스트
 * @param {number} maxLength - 최대 길이
 * @param {boolean} preserveBreaks - 줄바꿈 보존 여부
 * @returns {React.ReactNode} 처리된 텍스트
 */
export const truncateText = (text, maxLength = 100, preserveBreaks = true) => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) {
    return preserveBreaks ? formatTextWithLineBreaks(text) : text;
  }
  
  const truncated = text.substring(0, maxLength) + '...';
  return preserveBreaks ? formatTextWithLineBreaks(truncated) : truncated;
}; 