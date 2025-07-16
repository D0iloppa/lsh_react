import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import ApiClient from '@utils/ApiClient';

// Context 생성
const MsgContext = createContext();

// Provider 컴포넌트
export const MsgProvider = ({ children }) => {
  const [messages, setMessages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLang, setCurrentLang] = useState('vi'); // 기본 언어

  // API에서 메시지 데이터 가져오기
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      

      const response = await ApiClient.get('/api/getMsgCodeMap', {});

      let { data = {} } = response;
      console.log('[fetched] messages:', data);

      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 동기화
  const syncMsg = () => {
      ApiClient.get('/api/msgCodeReload', {}).then((res)=>{
        console.log(res);
      });  
  };


  // 컴포넌트 마운트시 데이터 로드
  useEffect(() => {
    // messages가 비어있을 때만 fetch
    if (Object.keys(messages).length === 0) {
        console.log('messages is empty, fetching...');
        fetchMessages();
      } else {
        console.log('messages already loaded, skipping fetch');
        setIsLoading(false); // 이미 데이터가 있으면 로딩 상태 해제
      }
  }, []);

  let messageFetchErrorCount = 0; 

  // 메시지 가져오기 함수
 const get = useCallback((code, lang = currentLang) => {
  // messages가 없으면 코드 반환
  if (!messages || typeof messages !== 'object') {
    return code;
  }

  // 해당 코드가 없으면 sync 후 코드 반환  
  if (!messages[code] || typeof messages[code] !== 'object') {
    console.warn(`Message code '${code}' not found`);

    messageFetchErrorCount += 1;

    // 100번마다 한 번만 fetchMessages 호출
    if (messageFetchErrorCount % 100 === 0) {
      console.log('[get] Triggering fetchMessages due to error count:', messageFetchErrorCount);
      fetchMessages();
    }
    
    return code;
  }

  const messageKey = `msg_${lang}`;
  const fallbackKey = `msg_ko`; // 기본 언어로 fallback

  // 요청한 언어 메시지가 있으면 반환
  if (messages[code][messageKey]) {
    return messages[code][messageKey];
  }

  // 요청한 언어가 없으면 기본 언어로 fallback
  if (lang !== 'ko' && messages[code][fallbackKey]) {
    console.warn(`Message '${code}' not found for '${lang}', using Korean fallback`);
    return messages[code][fallbackKey];
  }

  // 모든 경우에 실패하면 코드 반환
  console.warn(`Message '${code}' not found for any language`);

  // 메시지 동기화 요청
  ApiClient.get('/api/msgCodeReload', {}).then((res) => {
    console.log('[syncMsg] Triggered due to fallback fail:', code, res);
  });

  return code;
}, [messages, currentLang]);

  // 언어 변경 함수
  const setLanguage = useCallback((lang) => {
    setCurrentLang(lang);
  }, [messages]);

  // 사용 가능한 언어 목록
  const availableLanguages = Object.keys(messages);

  // 데이터 새로고침 함수
  const refresh = useCallback(() => {
    fetchMessages();
  }, []);

  const value = {
    messages,
    isLoading,
    error,
    currentLang,
    get,
    setLanguage,
    availableLanguages,
    refresh
  };

  return (
    <MsgContext.Provider value={value}>
      {children}
    </MsgContext.Provider>
  );
};

// Custom Hook
export const useMsg = () => {
  const context = useContext(MsgContext);
  
  if (!context) {
    throw new Error('useMsg must be used within a MsgProvider');
  }
  
  return context;
};

// 편의 함수들
export const useMsgGet = () => {
  const { get } = useMsg();
  return get;
};

export const useMsgLang = () => {
  const { currentLang, setLanguage, availableLanguages } = useMsg();
  return { currentLang, setLanguage, availableLanguages };
};

export const useMsgSync = () => {  // msgSync → useMsgSync로 수정
    const { syncMsg } = useMsg();
    return syncMsg;
};