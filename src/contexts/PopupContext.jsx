// PopupContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const PopupContext = createContext();

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
      id: 'ad-reward',
      type: 'premium-tabs',
      title: '광고 시청 완료!',
      content: '3번의 광고를 시청하셨습니다. 보상을 받으세요!',
      resetAfterShow: true
    }
  }  
};

export const PopupProvider = ({ children }) => {
  const [state, dispatch] = useReducer(popupReducer, initialState);

  // 이벤트 조건 체크
  useEffect(() => {
    Object.entries(EVENT_CONDITIONS).forEach(([eventType, condition]) => {
      const currentCount = state.events[eventType];
      
      if (currentCount >= condition.threshold) {
        // 이미 같은 팝업이 활성화되어 있는지 체크
        const isAlreadyActive = state.activePopups.some(
          popup => popup.id === condition.popup.id
        );
        
        if (!isAlreadyActive) {
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
    dispatch({ type: 'EMIT_EVENT', eventType });
  };

  const closePopup = (popupId) => {
    dispatch({ type: 'CLOSE_POPUP', popupId });
  };

  const resetEvent = (eventType) => {
    dispatch({ type: 'RESET_EVENT', eventType });
  };


  // useEffect(() => {
  //   window.testPopup = {
  //       emit: emitEvent,
  //       reset: resetEvent,
  //       showEvents: () => console.log('Current events:', state.events),
  //       showPopups: () => console.log('Active popups:', state.activePopups)
  //     };
  // }, [state.events, state.activePopups]);

  return (
    <PopupContext.Provider value={{
      ...state,
      emitEvent,
      closePopup,
      resetEvent
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