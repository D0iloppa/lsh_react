// PopupContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import ApiClient from '@utils/ApiClient';

import Block from '@components/Welcome/Block';

const PopupContext = createContext();

// shouldShowPopup 함수를 여기서 정의
const shouldShowPopup = () => {
  const today = new Date().toDateString();
  const closedDate = localStorage.getItem('popupClosedDate');
  return closedDate !== today;
};

// 마지막 팝업 시간 체크 함수 - Context 내부 변수 사용
const shouldShowPopupByTime = (lastPopupTime) => {
  if (!lastPopupTime) return true; // 처음이면 팝업 표시
  
  const now = new Date();
  const lastTime = new Date(lastPopupTime);
  const timeDiff = now.getTime() - lastTime.getTime();
  const timeGap = 5 * 60 * 1000; // 5분을 밀리초로
  //const timeGap = 10 * 1000;
  
  return timeDiff >= timeGap; // 5분 이상 지났으면 팝업 표시
};

const initialState = {
  userState:{
  },
  events: {
    adViewCount: 0,
    loginAttempts: 0,
    lastAction: new Date()
    // 다른 이벤트 카운터들...
  },
  activePopups: [],
  popupQueue: [],
  // 팝업 시간 추적을 위한 새로운 상태
  popupTracking: {
    totalPopupsShown: 0,
    totalPopupTime: 0, // 총 팝업 표시 시간 (밀리초)
    lastPopupTime: null, // Context 내부에서 관리
    popupHistory: [], // 팝업 히스토리
    currentPopupStartTime: null // 현재 열린 팝업의 시작 시간
  }
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
      const now = new Date();
      const popupWithTime = {
        ...action.popup,
        startTime: now.toISOString(),
        id: action.popup.id || `popup-${Date.now()}`
      };
      
      return {
        ...state,
        activePopups: [...state.activePopups, popupWithTime],
        popupTracking: {
          ...state.popupTracking,
          totalPopupsShown: state.popupTracking.totalPopupsShown + 1,
          lastPopupTime: now.toISOString(), // Context 내부에서 관리
          currentPopupStartTime: now.toISOString()
        }
      };

    case 'UPDATE_USER_STATE':
      return {
        ...state,
        userState: {
          ...state.userState,
          ...action.payload
        }
      };
    
    case 'CLOSE_POPUP':
      const closedPopup = state.activePopups.find(popup => popup.id === action.popupId);
      const popupEndTime = new Date();
      
      let popupDuration = 0;
      let popupHistoryEntry = null;
      
      if (closedPopup && closedPopup.startTime) {
        const startTime = new Date(closedPopup.startTime);
        popupDuration = popupEndTime.getTime() - startTime.getTime();
        
        popupHistoryEntry = {
          id: closedPopup.id,
          type: closedPopup.type,
          startTime: closedPopup.startTime,
          endTime: popupEndTime.toISOString(),
          duration: popupDuration,
          title: closedPopup.title
        };
      }
      
      return {
        ...state,
        activePopups: state.activePopups.filter(popup => popup.id !== action.popupId),
        popupTracking: {
          ...state.popupTracking,
          totalPopupTime: state.popupTracking.totalPopupTime + popupDuration,
          currentPopupStartTime: null,
          popupHistory: popupHistoryEntry 
            ? [...state.popupTracking.popupHistory, popupHistoryEntry]
            : state.popupTracking.popupHistory
        }
      };
    
    case 'RESET_EVENT':
      return {
        ...state,
        events: {
          ...state.events,
          [action.eventType]: 0
        }
      };
    
    case 'RESET_POPUP_TRACKING':
      return {
        ...state,
        popupTracking: {
          totalPopupsShown: 0,
          totalPopupTime: 0,
          lastPopupTime: null,
          popupHistory: [],
          currentPopupStartTime: null
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

  const { user, isActiveUser} = useAuth();

  


  // 앱 시작 시 localStorage 클리어 (앱을 껐다 키면 초기화)
  useEffect(() => {


    const loadUserActiveStatus = async () => {
      try {
        console.log('🔄 사용자 활성 상태 확인 중...');
        
        const {isActiveUser:isActive = false, subscription = {}} = await isActiveUser();
        
        // userState에 활성 상태 설정
        dispatch({ 
          type: 'UPDATE_USER_STATE', 
          payload: { 
            isActive: isActive,
            lastChecked: new Date().toISOString()
          } 
        });
        
      } catch (error) {
        console.error('❌ 사용자 활성 상태 확인 실패:', error);
        
        // 에러 시 기본값으로 설정
        dispatch({ 
          type: 'UPDATE_USER_STATE', 
          payload: { 
            isActive: false,
            lastChecked: new Date().toISOString(),
            error: error.message
          } 
        });
      }
    };



    loadUserActiveStatus();



    // 앱 시작 시 localStorage에서 팝업 관련 데이터 클리어
    localStorage.removeItem('lastPopupTime');
    console.log('🔄 앱 시작: 팝업 시간 데이터 초기화');
  }, [isActiveUser]);


  

  // 이벤트 조건 체크 (오늘 하루 닫기 설정 + 시간 조건 포함)
  useEffect(() => {
    Object.entries(EVENT_CONDITIONS).forEach(async ([eventType, condition]) => {
      const currentCount = state.events[eventType];


      const updateUserStateIfNeeded = async () => {
        const _userState = state.userState;
        const today = new Date().toDateString();
        const lastCheckedDate = _userState?.lastChecked 
          ? new Date(_userState.lastChecked).toDateString() 
          : null;
        
        // 날짜가 바뀌었거나 처음 확인하는 경우
        if (!lastCheckedDate || lastCheckedDate !== today) {
          console.log('�� 날짜가 변경되어 사용자 상태를 재확인합니다.');
          
          try {
            const {isActiveUser:isActive = false, subscription = {}} = await isActiveUser();
            
            dispatch({ 
              type: 'UPDATE_USER_STATE', 
              payload: { 
                isActive: isActive,
                subscription: subscription,
                lastChecked: new Date().toISOString()
              } 
            });
            
            console.log('✅ 사용자 상태 업데이트 완료:', { isActive, subscription });
            return { isActive, subscription };
            
          } catch (error) {
            console.error('❌ 사용자 상태 확인 실패:', error);
            
            dispatch({ 
              type: 'UPDATE_USER_STATE', 
              payload: { 
                isActive: false,
                lastChecked: new Date().toISOString(),
                error: error.message
              } 
            });
            return { isActive: false, subscription: {} };
          }
        }
        
        return { isActive: _userState?.isActive, subscription: _userState?.subscription };
      };

      
      if (eventType == 'adViewCount') {
          const currentUrl = window.location.href;

          // 이미 block 페이지라면 이동하지 않음
          if (currentUrl.includes('/block')) {
            console.log('이미 block 페이지입니다. 이동하지 않습니다.');
            return;
          }

          try {
            const response = await ApiClient.postForm('/api/getSubscriptionInfo', { 
              user_id: user.user_id
            });

            console.log('adViewCount 응답:', response);

            // response가 존재하고, userState가 blocked일 때만 이동
            if (response && response.userState === 'blocked') {
              console.log('사용자 상태가 blocked입니다. block 페이지로 이동합니다.');
              window.location.href = './block';
              return;
            }

            console.log('한시적 adViewCount 팝업 미호출 (userState:', response?.userState, ')');
          } catch (error) {
            console.error('getSubscriptionInfo 호출 중 오류 발생:', error);
          }

          return;
        }
    

      const { isActive } = await updateUserStateIfNeeded();

      if(isActive){
         if(eventType == 'adViewCount'){
            console.log('티켓 구매자. 팝업 미호출');
            return;
         }
      }

      if(!user){
         if(eventType == 'adViewCount'){
            console.log('로그인 하지 않음');
            return;
         }
      }




      if (currentCount >= condition.threshold) {
        // 🔥 오늘 하루 닫기 설정 확인
        if (!shouldShowPopup()) {
          console.log(`오늘 하루 팝업 닫기 설정으로 인해 ${eventType} 팝업이 열리지 않습니다.`);
          return;
        }

        // 🔥 마지막 팝업 시간 + 5분 조건 확인 (Context 내부 변수 사용)
        if (!shouldShowPopupByTime(state.popupTracking.lastPopupTime)) {
          if (state.popupTracking.lastPopupTime) {
            const now = new Date();
            const lastTime = new Date(state.popupTracking.lastPopupTime);
            const timeDiff = now.getTime() - lastTime.getTime();
            const remainingTime = Math.ceil((5 * 60 * 1000 - timeDiff) / 1000 / 60);
            
            console.log(`⏰ 시간 조건으로 인해 ${eventType} 팝업이 열리지 않습니다. (${remainingTime}분 후 가능)`);
          }
          return;
        }

        // 추가조건



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
  }, [state.events, state.popupTracking.lastPopupTime]);

  const emitEvent = (eventType) => {
    // console.log(`📡 이벤트 발생: ${eventType}`);
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

  const closedPopup = state.activePopups.find(p => p.id === popupId);

  // 👇 onClose 콜백이 있으면 실행
  if (closedPopup?.onClose && typeof closedPopup.onClose === 'function') {
    closedPopup.onClose();
  }

  

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

  // 팝업 추적 관련 함수들
  const getPopupStats = () => {
    const { popupTracking } = state;
    const now = new Date();
    
    // 현재 열린 팝업이 있다면 현재까지의 시간도 계산
    let currentPopupDuration = 0;
    if (popupTracking.currentPopupStartTime) {
      const startTime = new Date(popupTracking.currentPopupStartTime);
      currentPopupDuration = now.getTime() - startTime.getTime();
    }
    
    return {
      totalPopupsShown: popupTracking.totalPopupsShown,
      totalPopupTime: popupTracking.totalPopupTime + currentPopupDuration,
      averagePopupTime: popupTracking.totalPopupsShown > 0 
        ? Math.floor((popupTracking.totalPopupTime + currentPopupDuration) / popupTracking.totalPopupsShown)
        : 0,
      lastPopupTime: popupTracking.lastPopupTime,
      currentPopupStartTime: popupTracking.currentPopupStartTime,
      popupHistory: popupTracking.popupHistory
    };
  };

  const getPopupHistory = (count = 10) => {
    return state.popupTracking.popupHistory.slice(-count);
  };

  const resetPopupTracking = () => {
    console.log('🔄 팝업 추적 데이터 리셋');
    dispatch({ type: 'RESET_POPUP_TRACKING' });
  };

  const updateUserState = (payload) => {
    console.log(`👤 사용자 상태 업데이트:`, payload);
    dispatch({ type: 'UPDATE_USER_STATE', payload });
  };

  const getCurrentPopupDuration = () => {
    if (!state.popupTracking.currentPopupStartTime) return 0;
    
    const startTime = new Date(state.popupTracking.currentPopupStartTime);
    const now = new Date();
    return now.getTime() - startTime.getTime();
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
      },
      
      // 팝업 추적 관련 함수들
      getPopupStats: () => {
        const stats = getPopupStats();
        console.log('📊 팝업 통계:', stats);
        return stats;
      },
      
      getPopupHistory: (count = 10) => {
        const history = getPopupHistory(count);
        console.log('📋 팝업 히스토리:', history);
        return history;
      },
      
      resetPopupTracking: () => {
        resetPopupTracking();
        console.log('🔄 팝업 추적 데이터가 리셋되었습니다.');
      },
      
      getCurrentPopupDuration: () => {
        const duration = getCurrentPopupDuration();
        console.log('⏱️ 현재 팝업 지속 시간:', duration, 'ms');
        return duration;
      },
      
              // 시간 조건 관련 함수들
        checkTimeCondition: () => {
          const result = shouldShowPopupByTime(state.popupTracking.lastPopupTime);
          const lastPopupTime = state.popupTracking.lastPopupTime;
        
        if (lastPopupTime) {
          const now = new Date();
          const lastTime = new Date(lastPopupTime);
          const timeDiff = now.getTime() - lastTime.getTime();
          const remainingTime = Math.ceil((5 * 60 * 1000 - timeDiff) / 1000 / 60);
          
          console.log('⏰ 시간 조건 체크:', {
            canShow: result,
            lastPopupTime: new Date(lastPopupTime).toLocaleTimeString(),
            timeDiff: Math.floor(timeDiff / 1000 / 60) + '분',
            remainingTime: remainingTime > 0 ? remainingTime + '분' : '즉시 가능'
          });
        } else {
          console.log('⏰ 시간 조건 체크: 처음이므로 팝업 가능');
        }
        
        return result;
      },
      
      resetLastPopupTime: () => {
        dispatch({ type: 'RESET_POPUP_TRACKING' });
        console.log('⏰ 마지막 팝업 시간이 초기화되었습니다.');
      },
      
              forceEmitWithTimeCheck: (eventType) => {
          console.log(`🚨 강제 이벤트 발생 (시간 조건 체크 포함): ${eventType}`);
          
          if (!shouldShowPopupByTime(state.popupTracking.lastPopupTime)) {
            if (state.popupTracking.lastPopupTime) {
              const now = new Date();
              const lastTime = new Date(state.popupTracking.lastPopupTime);
              const timeDiff = now.getTime() - lastTime.getTime();
              const remainingTime = Math.ceil((5 * 60 * 1000 - timeDiff) / 1000 / 60);
              
              console.log(`⏰ 시간 조건으로 인해 팝업이 열리지 않습니다. (${remainingTime}분 후 가능)`);
              return false;
            }
          }
        
        // 기존 이벤트 조건을 무시하고 직접 팝업 표시
        const condition = EVENT_CONDITIONS[eventType];
        if (condition) {
          dispatch({ type: 'SHOW_POPUP', popup: condition.popup });
          return true;
        }
        
        return false;
      }
    };
  }, [state.events, state.activePopups, state.popupTracking]);

  return (
    <PopupContext.Provider value={{
      ...state,
      emitEvent,
      closePopup,
      resetEvent,
      showPopup,
      forceShowPopup,
      shouldShowPopup, // 다른 컴포넌트에서도 사용 가능
      // 팝업 추적 관련 함수들
      getPopupStats,
      getPopupHistory,
      resetPopupTracking,
      getCurrentPopupDuration,
      updateUserState
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