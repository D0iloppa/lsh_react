// PopupContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const PopupContext = createContext();

// shouldShowPopup 함수를 여기서 정의
const shouldShowPopup = () => {
  const today = new Date().toDateString();
  const closedDate = localStorage.getItem('popupClosedDate');
  return closedDate !== today;
};

const initialState = {
  events: {
    adViewCount: 0,
    loginAttempts: 0,
    // 다른 이벤트 카운터들...
  },
  activePopups: [],
  popupQueue: []
};

const popupReducer = (state, action) => {
  switch (action.type) {
    case 'EMIT_EVENT':
      const newEvents = {
        ...state.events,
        [action.eventType]: state.events[action.eventType] + 1
      };
      return {
        ...state,
        events: newEvents
      };
    
    case 'SHOW_POPUP':
      return {
        ...state,
        activePopups: [...state.activePopups, action.popup]
      };
    
    case 'CLOSE_POPUP':
      return {
        ...state,
        activePopups: state.activePopups.filter(popup => popup.id !== action.popupId)
      };
    
    case 'RESET_EVENT':
      return {
        ...state,
        events: {
          ...state.events,
          [action.eventType]: 0
        }
      };
    
    default:
      return state;
  }
};

// 이벤트 조건 정의
const EVENT_CONDITIONS = {
  adViewCount: {
    threshold: 3,
    popup: {
      id: 'todayTrial',
      type: 'premium-tabs',
      title: '광고 시청 완료!',
      content: '3번의 광고를 시청하셨습니다. 보상을 받으세요!',
      resetAfterShow: true
    }
  }  
};

export const PopupProvider = ({ children }) => {
  const [state, dispatch] = useReducer(popupReducer, initialState);

  // 이벤트 조건 체크 (오늘 하루 닫기 설정 포함)
  useEffect(() => {
    Object.entries(EVENT_CONDITIONS).forEach(([eventType, condition]) => {
      const currentCount = state.events[eventType];
      
      if (currentCount >= condition.threshold) {
        // 🔥 오늘 하루 닫기 설정 확인
        if (!shouldShowPopup()) {
          console.log(`오늘 하루 팝업 닫기 설정으로 인해 ${eventType} 팝업이 열리지 않습니다.`);
          return;
        }

        // 이미 같은 팝업이 활성화되어 있는지 체크
        const isAlreadyActive = state.activePopups.some(
          popup => popup.id === condition.popup.id
        );
        
        if (!isAlreadyActive) {
          console.log(`🎉 ${eventType} 조건 달성! 팝업을 표시합니다.`);
          dispatch({ type: 'SHOW_POPUP', popup: condition.popup });
          
          // resetAfterShow가 true면 카운터 리셋
          if (condition.resetAfterShow) {
            dispatch({ type: 'RESET_EVENT', eventType });
          }
        }
      }
    });
  }, [state.events]);

  const emitEvent = (eventType) => {
    console.log(`📡 이벤트 발생: ${eventType}`);
    dispatch({ type: 'EMIT_EVENT', eventType });
  };
/*
  const closePopup = (popupId) => {
    console.log(`❌ 팝업 닫기: ${popupId}`);
    dispatch({ type: 'CLOSE_POPUP', popupId });
  };
*/

const closePopup = (popupId) => {
  console.log(`❌ 팝업 닫기: ${popupId}`);
  dispatch({ type: 'CLOSE_POPUP', popupId });

  if (popupId === 'todayTrial') {
    // ✅ 오늘의 체험권 인앱결제 실행
    const payload = JSON.stringify({ action: 'buyItem' });

    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.buyItem) {
      // iOS WebView
      window.webkit.messageHandlers.buyItem.postMessage(null);
    } else if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      // Android WebView
      window.ReactNativeWebView.postMessage(payload);
    } else {
      // alert('IAP 연동이 되어 있지 않거나, 플랫폼을 인식하지 못했습니다.');
    }
  }
};


  const resetEvent = (eventType) => {
    console.log(`🔄 이벤트 리셋: ${eventType}`);
    dispatch({ type: 'RESET_EVENT', eventType });
  };

  // 수동으로 팝업 표시하는 함수 (오늘 하루 닫기 설정 체크 포함)
  const showPopup = (popupConfig) => {
    if (!shouldShowPopup()) {
      console.log('오늘 하루 팝업 닫기 설정으로 인해 수동 팝업이 열리지 않습니다.');
      return false;
    }
    
    const popup = {
      ...popupConfig,
      id: popupConfig.id || `popup-${Date.now()}`
    };
    
    dispatch({ type: 'SHOW_POPUP', popup });
    return true;
  };

  // 강제로 팝업 표시 (테스트/디버깅용)
  const forceShowPopup = (popupConfig) => {
    const popup = {
      ...popupConfig,
      id: popupConfig.id || `force-popup-${Date.now()}`
    };
    
    console.log('🚨 강제 팝업 표시:', popup.id);
    dispatch({ type: 'SHOW_POPUP', popup });
    return true;
  };

  // 이벤트 emitter (개발자 콘솔용)
  useEffect(() => {
    window.testPopup = {
      emit: emitEvent,
      reset: resetEvent,
      showEvents: () => console.log('Current events:', state.events),
      showPopups: () => console.log('Active popups:', state.activePopups),
      
      // 🔥 추가된 테스트 함수들
      forceEmit: (eventType) => {
        console.log(`🚨 강제 이벤트 발생: ${eventType}`);
        // 기존 이벤트 조건을 무시하고 직접 팝업 표시
        const condition = EVENT_CONDITIONS[eventType];
        if (condition) {
          dispatch({ type: 'SHOW_POPUP', popup: condition.popup });
        }
      },
      
      checkTodayClose: () => {
        const result = shouldShowPopup();
        console.log('오늘 하루 닫기 설정:', result ? '비활성' : '활성');
        return result;
      },
      
      resetTodayClose: () => {
        localStorage.removeItem('popupClosedDate');
        console.log('✅ 오늘 하루 닫기 설정이 초기화되었습니다.');
      }
    };
  }, [state.events, state.activePopups]);

  return (
    <PopupContext.Provider value={{
      ...state,
      emitEvent,
      closePopup,
      resetEvent,
      showPopup,
      forceShowPopup,
      shouldShowPopup // 다른 컴포넌트에서도 사용 가능
    }}>
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within PopupProvider');
  }
  return context;
};

// shouldShowPopup 함수를 외부에서도 사용할 수 있도록 export
export { shouldShowPopup };