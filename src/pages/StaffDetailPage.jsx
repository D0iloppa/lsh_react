import React, { useState, useEffect, useRef } from 'react';

import RotationDiv from '@components/RotationDiv';
import ImagePlaceholder from '@components/ImagePlaceholderStaff';
import SketchHeader from '@components/SketchHeader';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';
import LoadingScreen from '@components/LoadingScreen';
import ApiClient from '@utils/ApiClient';

import { useMsg } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';
import { usePopup } from '@contexts/PopupContext';


import { Star, Heart, Clock, Users, Phone, CreditCard, MessageCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';


import CountryFlag from 'react-country-flag';

import Swal from 'sweetalert2';

import { getOpeningStatus } from '@utils/VietnamTime'

const FLAG_CODES = {
  kr: 'KR',
  en: 'US',
  vi: 'VN',
  ja: 'JP',
  cn: 'CN',
};

const lastExpireMem = new Map();
const KEY_PREFIX = 'viewcnt:exp:';

function shouldSendView(staffId, ttlMs = 300) {
  const key = `${KEY_PREFIX}${staffId}`;
  const now = Date.now();

  // 1) 메모리 + 세션스토리지에서 만료시각 읽기
  let exp = lastExpireMem.get(key) ?? 0;
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) exp = Math.max(exp, parseInt(raw, 10) || 0);
  } catch {
    // sessionStorage 불가 시 메모리만 사용
  }

  // 2) 아직 만료 전이면 차단
  if (now < exp) return false;

  // 3) 다음 만료시각 갱신(호출 허용)
  const newExp = now + ttlMs;
  lastExpireMem.set(key, newExp);
  try {
    sessionStorage.setItem(key, String(newExp));
  } catch {}

  return true;
}

function clearThrottle(staffId) {
  const key = `${KEY_PREFIX}${staffId}`;
  lastExpireMem.delete(key);
  try { sessionStorage.removeItem(key); } catch {}
}

const StaffDetailPage = ({ pageHistory, navigateToPageWithData, goBack, PAGES, showAdWithCallback, ...otherProps }) => {

  console.log('sd', pageHistory);

  // 이미지 확대 여부
  const [noImagePopup, setNoImagePopup] = useState(true);


  const [viewCntUpdated, setViewCntUpdated] = useState(false);
  const [date, setDate] = useState('');
  const [partySize, setPartySize] = useState('');
  const [availCnt, setAvailCnt] = useState(0);
  const [vnScheduleStatus, setVnScheduleStatus] = useState('');
  const [openingStatus, setOpeningStatus] = useState({});
  const [isLoadingAvailCnt, setIsLoadingAvailCnt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [girl, setGirl] = useState(otherProps || {});
  const [catId, setCatId] = useState(1);
  const [images, setImages] = useState([]);

  const didOpenIOSViewerRef = useRef(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  const { get, currentLang, messages } = useMsg();
  const { user, isActiveUser, iauMasking } = useAuth();
  const { showPopup, closePopup } = usePopup();


  const isAndroid = !!window.native;
  const isIOS = !!window.webkit?.messageHandlers?.native?.postMessage;

  const [isFavorite, setIsFavorite] = useState(false);

// StaffDetailPage 내부

// 공통 함수: 네이티브/버튼 양쪽에서 사용
const applyFavorite = async (newFavorite) => {
  const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';

  // UI 즉시 반영
  setIsFavorite(newFavorite);


  

  try {
    const url = `${API_HOST}/api/${newFavorite ? 'insertFavorite' : 'deleteFavorite'}`;

    //Swal.fire('UUID 에러', url+newFavorite, 'error');

    await ApiClient.get(url, {
      params: {
        user_id: user?.user_id || 1,
        target_type: 'staff',
        target_id: girl.staff_id,
      },
    });
  } catch (error) {
    console.error("즐겨찾기 API 호출 실패:", error);
    // 실패 시 롤백
    setIsFavorite(!newFavorite);
  }
};

// 버튼 클릭 → 기존 토글 동작
const toggleFavorite = () => {
  applyFavorite(!isFavorite);
};

// 네이티브 메시지 수신 → 받은 값 그대로 적용
useEffect(() => {
  const handleMessage = (event) => {
    console.log("📩 받은 메시지:", event.data);

    let data;
    try {
      data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    } catch (e) {
      console.warn("메시지 파싱 실패:", e);
      return;
    }

    if (data.type === "toggleFavorite") {
      console.log("네이티브에서 보낸 isFavorite:", data.is_favorite);
      applyFavorite(!!data.is_favorite);
    }
  };

  document.addEventListener("message", handleMessage);
  window.addEventListener("message", handleMessage);

  return () => {
    document.removeEventListener("message", handleMessage);
    window.removeEventListener("message", handleMessage);
  };
}, []);



  const renderStars = (rating = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let color = '#d1d5db'; // 기본 회색 (gray-300)
      if (rating >= i) {
        color = '#fbbf24'; // 노란색 (yellow-400)
      } else if (rating >= i - 0.5) {
        color = '#fde68a'; // 연노란색 (yellow-200)
      }

      stars.push(
        <span key={i}>
          <Star color={color} fill={color} size={20} />
        </span>
      );
    }
    return stars;
  };



//  const isIOS = false;
  const openIOSImageViewer = (images = [], startIndex = 0) => {
    try {

      if(noImagePopup) return;

      hideIOSImageViewer();

        window.webkit.messageHandlers.native.postMessage(
          JSON.stringify({
            type: 'showImageViewer',
            images: images,
            startIndex: 0
          })
        );
      } catch (e) {
        console.error('iOS 메시지 전송 실패:', e);
      }
  };

  const hideIOSImageViewer = () => {
  if (isIOS) {
    postIOS({ type: "deleteImageViewer" });
    didOpenIOSViewerRef.current = false; // 다시 띄울 수 있도록 reset
  }
};

const showIOSImageViewer = async () => {
  if (!isIOS) return;

  const valid = (images || []).filter(Boolean);
  if (valid.length === 0) return;

  const rect = getViewportRect(rotationHostRef.current);
  if (!rect) return;

  try {
    const iau = await isActiveUser(); // ✅ async 호출
    const iauValue = iau?.isActiveUser ? 1 : 0;

     let girlname = girl?.name;

      if (girlname?.props?.className === "masked-text-wrapper") {
  const children = girlname.props.children || [];

  const firstCharObj = children.find(
    (c) => c?.props?.className === "first-char"
  );
  const dotsObj = children.find(
    (c) => c?.props?.className === "masking-dots"
  );

  const firstChar = firstCharObj?.props?.children || "";
  const maskingDots = dotsObj?.props?.children || "";

  girlname = firstChar + maskingDots;
}

hideIOSImageViewer();
    postIOS({
      type: "showImageViewer",
      images: valid,
      startIndex: currentIndex,
      noImagePopup,
      staffInfo: JSON.stringify({
        name: girlname+"(🏪"+girl.venue_name+")" || 'Unknown Staff',
        languages: girl?.languages || "",
        description: girl?.description || "",
        msg1: get("LANGUAGES_LABEL"),
        is_favorite: girl?.is_favorite || 0,
        avg_rating: girl?.avg_rating || 0.0,
        iau: iauValue,
        availCnt,
        vnScheduleStatus,
        photoDesc: get("STAFF_PHOTO_DESC"),
      }),
      rect,
    });

    didOpenIOSViewerRef.current = true;
  } catch (err) {
    console.error("isActiveUser 체크 실패:", err);
  }
};


  const IOSImageViewer = ({ images = [] }) => {
    const validImages = (images || []).filter(Boolean);
    const slides = validImages.length > 0 ? validImages : [null];

    return (
      <div className="profile-rotation ios-native-image-viewer" style={{ padding: '0 16px' }}>
        {slides.map((imageUrl, index) => (
          <div key={index} className="profile-slide">
            <div className="dual-image-container">
              <div className="image-left">
                <img
                  src={imageUrl || '/img/no-image.png'}
                  alt={`staff-${index}`}
                  className="profile-image"
                  onClick={() => openIOSImageViewer(validImages, index)}
                  // iOS에서 네이티브 띄울 거라 로테이션/줌 없이 단순 이미지
                  draggable={false}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
};


  const getAgeFromBirthYear = (birthYear) => {
    const currentYear = new Date().getFullYear();
    
    return birthYear ? currentYear - parseInt(birthYear, 10) : null;
  };

    // 텍스트 줄바꿈 처리 함수
    const formatTextWithLineBreaks = (text) => {
      if (!text) return '';
      
      return text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    };

    // 플리킹 감지를 위한 useRef 선언
     /* const touchStartXRef = useRef(null);
      const touchEndXRef = useRef(null);

       
      const handleTouchStart = (e) => {

        const isIgnoredArea = e.target.closest('.profile-rotation');
  if (isIgnoredArea) return;

  
      if (e.touches.length === 1) {
        touchStartXRef.current = e.touches[0].clientX;
      }
    };
    
    // 터치 종료
    const handleTouchEnd = (e) => {

       const isIgnoredArea = e.target.closest('.profile-rotation');
  if (isIgnoredArea) return;

      if (e.changedTouches.length === 1) {
        touchEndXRef.current = e.changedTouches[0].clientX;
        const deltaX = touchEndXRef.current - touchStartXRef.current;
    
        if (deltaX > 80) { // ← 플리킹 감지 (좌 → 우)
          console.log('플리킹: 좌에서 우로 → 뒤로가기');
          goBack(); // 또는 navigate(-1);
        }
      }
    };
*/
  const handleBack = () => {
    if (isIOS) {
      hideIOSImageViewer();    
    }

    goBack();
  };

  useEffect(() => {
  return () => {
    // ✅ 페이지에서 벗어날 때 실행됨
    if (isIOS) {
      hideIOSImageViewer();
    }
  };
}, []);


  const handleReserve = async () => {
    try {

      hideIOSImageViewer();

      // 구독 상태 확인
      const { isActiveUser: isActive = false } = await isActiveUser();

      if (isActive || true) {
        // Active User: 예약 페이지로 이동

        navigateToPageWithData(PAGES.RESERVATION, {
          target: 'staff',
          id: girl.staff_id || 123,
          venue_id:girl.venue_id,
          staff: girl,
          cat_id:catId
        });


      } else {

        // 팝업띄우고 막음
         // Inactive User: 구독 필요 팝업 표시
         showPopup({
          id: 'subscription-required',
          type: 'premium-tabs',
          title: '구독이 필요한 서비스입니다',
          content: '예약 서비스를 이용하시려면 구독이 필요합니다.',
          onClose: () => {
            setTimeout(() => {
              console.log('on-close', pageHistory);
              showIOSImageViewer();
            }, 100);
          
        }
          /*
          onTodayTrial: () => {

            console.log('hi');
            closePopup('subscription-required');
            // navigateToPageWithData(PAGES.SUBSCRIPTION_PAY, {});
            // hidePopup();
          },
          */
        });


          /*
          // Inactive User: 광고 시청 후 예약 페이지로 이동
          showAdWithCallback(
            // 광고 완료 시 콜백
            () => {
              navigateToPageWithData(PAGES.RESERVATION, {
                target: 'staff',
                id: girl.staff_id || 123,
                staff: girl
              });
            },
            // fallback 콜백 (광고 실패 시)
            () => {
              navigateToPageWithData(PAGES.RESERVATION, {
                target: 'staff',
                id: girl.staff_id || 123,
                staff: girl
              });
            },
            4000 // 4초 타임아웃
          );
          */
        }
    } catch (error) {
      console.error('구독 상태 확인 실패:', error);
      // 에러 시 기본적으로 예약 페이지로 이동
      navigateToPageWithData(PAGES.RESERVATION, {
        target: 'staff',
        id: girl.staff_id,
        venue_id:girl.venue_id,
        staff: girl,
        cat_id:catId
      });
    }
  };



  const staffViewCntUpsert = async () => {

    console.log('viewCntUpdated', viewCntUpdated);
    if(viewCntUpdated) return;
    

    console.log('viewCountUpsert-deprecated', girl);

    /*
    await ApiClient.postForm('/api/viewCountUpsert', {
      target_type: 'staff',
      target_id: girl.staff_id,
      venue_id: girl.venue_id,
    });
    */
    
    setViewCntUpdated(true);
  }

  useEffect(() => {
    const fetchStaffData = async () => {
      if (otherProps.fromReview && otherProps.staff_id) {
        setLoading(true);
        try {

          const iau = await isActiveUser();
          iau.onlyMasking = true;

          const response = await ApiClient.get('/api/getStaffProfile', {
            params: {
              user_id: user?.user_id || 1, 
              staff_id: otherProps.staff_id,
              lang:currentLang
             }
          });

          const apiDataArray = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : [];

          const basicInfo = apiDataArray.length > 0 ? apiDataArray[0] : {};

          const vn_response = await ApiClient.get(`/api/getVenue`, {
            params: { venue_id: girl.venue_id
              ,lang:currentLang
            },
          });

          const venue_name = vn_response.name;
          const opening_status = getOpeningStatus({
            open_time : vn_response.open_time, 
            close_time : vn_response.close_time, 
            schedule_status : vn_response.schedule_status
          })

          setOpeningStatus(opening_status);

          const _girl ={
            ...otherProps,
            ...basicInfo,
            venue_name:venue_name,
            opening_status: opening_status
          }

          _girl.rating = parseFloat(basicInfo.avg_rating || 0);

          _girl.is_favorite = basicInfo.is_favorite || 0;

          _girl.name = iauMasking(iau, _girl.name || '');

          console.log('girl-detail', _girl);

          setGirl(_girl);
          console.log("2345", _girl);
          

          setIsFavorite(_girl.is_favorite === 1);


        } catch (error) {
          console.error('Staff 정보 로딩 실패:', error);
          setGirl(otherProps);
        } finally {
          setLoading(false);
        }
      } else {
        setGirl(otherProps);
        if (otherProps.is_favorite !== undefined) {
          setIsFavorite(otherProps.is_favorite === 1);
        }
      }
    };

    fetchStaffData();

  }, [otherProps.fromReview, otherProps.staff_id]);

  // 이미지 가져오기
  useEffect(() => {

    //staffViewCntUpsert();

  const fetchStaffPhotos = async () => {
    if (!otherProps.staff_id) return;

    try {

      const activeUser = await isActiveUser();
      const { isActiveUser:iau = false} = activeUser;

      console.log('noImagePopup-chk', iau);
      // iau true -> 이미지 팝업, iau false -> 이미지 팝업 안함
      setNoImagePopup(!iau);


      const res = await ApiClient.get('/api/getStaffPhotos', {
        params: { staff_id: otherProps.staff_id }
      });

      console.log('사진 응답:', res);

      const baseUrl = ''; // ⚠️ 실제 CDN 도메인으로 교체
      const photos = Array.isArray(res?.data) ? res.data : [];

      const urls = photos
        .map(p => p?.url?.startsWith('/') ? baseUrl + p.url : p.url)
        .filter(img => typeof img === 'string' && img.trim() !== '');

      setImages(urls);
    } catch (err) {
      console.error('사진 로딩 실패:', err);
      setImages([]);
    }
  };

  fetchStaffPhotos();
}, [otherProps.staff_id]);


useEffect(() => {
  const staffId = otherProps.staff_id ?? girl.staff_id;
  const venueId = otherProps.venue_id ?? girl.venue_id;
  if (!staffId || !venueId) return;

  

  if (!shouldSendView(staffId, 3000)) return; // 3초 TTL

  /*
  ApiClient.postForm('/api/viewCountUpsert', {
    target_type: 'staff',
    target_id: staffId,
    venue_id: venueId,
  }).catch((e) => {
    // 실패 시 즉시 재시도 가능하도록 롤백(선택)
    clearThrottle(staffId);
    console.error(e);
  });
  */

}, [otherProps.staff_id, otherProps.venue_id, girl.staff_id, girl.venue_id]);



// RotationDiv가 올라갈 자리 요소
const rotationHostRef = useRef(null);

// viewport 기준 rect 반환
const getViewportRect = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    x: r.left,
    y: r.top,
    width: r.width,
    height: r.height,
    dpr: window.devicePixelRatio || 1,
  };
};

// iOS로 안전하게 postMessage
const postIOS = (payload) => {
  try {
    window.webkit?.messageHandlers?.native?.postMessage(JSON.stringify(payload));
  } catch (e) {
    console.error('iOS postMessage 실패:', e);
  }
};
useEffect(() => {
  if (!isIOS) return;

  hideIOSImageViewer();

  const run = async () => {
    const valid = (images || []).filter(Boolean);
    if (valid.length === 0) return;

    // staff 정보가 준비되지 않았다면 skip
    if (!girl?.name && !girl?.description) return;

    const rect = getViewportRect(rotationHostRef.current);
    if (!rect) return;

    try {
      const iau = await isActiveUser(); // ✅ async 호출은 여기서
      const iauValue = iau?.isActiveUser ? 1 : 0;  

      let girlname = girl?.name;

      if (girlname?.props?.className === "masked-text-wrapper") {
  const children = girlname.props.children || [];

  const firstCharObj = children.find(
    (c) => c?.props?.className === "first-char"
  );
  const dotsObj = children.find(
    (c) => c?.props?.className === "masking-dots"
  );

  const firstChar = firstCharObj?.props?.children || "";
  const maskingDots = dotsObj?.props?.children || "";

  girlname = firstChar + maskingDots;
}

hideIOSImageViewer();
      postIOS({
        type: 'showImageViewer',
        images: valid,
        startIndex: 0,
        noImagePopup,
        staffInfo: JSON.stringify({
          name: girlname+"(🏪"+girl.venue_name+")" || 'Unknown Staff',
          languages: girl?.languages || '',
          description: girl?.description || '',
          msg1: get('LANGUAGES_LABEL'),
          is_favorite: girl?.is_favorite || 0,
        avg_rating: girl?.avg_rating || 0.0,
          iau:iauValue,
          availCnt,
          vnScheduleStatus,
          photoDesc: get('STAFF_PHOTO_DESC')
        }),
        rect,
      });

      // ✅ 필요하다면 다시 열도록 reset
      didOpenIOSViewerRef.current = true;
    } catch (err) {
      console.error("isActiveUser 체크 실패:", err);
    }
  };

  run();
}, [
  isIOS,
  images,
  girl?.name,
  girl?.languages,
  girl?.description,
  availCnt,
  vnScheduleStatus,
  noImagePopup,
  get
]);




  // availCnt 가져오기
  useEffect(() => {
    const fetchStaffAvailCnt = async () => {
      if (!girl.staff_id) return;
      setIsLoadingAvailCnt(true);

      try {

        let vn_schedule_status = girl?.vn_schedule_status || false;


        const vn_response = await ApiClient.get(`/api/getVenue`, {
          params: { venue_id: girl.venue_id
            ,lang:currentLang
           },
        });
        
        vn_schedule_status = vn_response.schedule_status;
        setCatId(vn_response.cat_id || 1);

        /*
        if(!vn_schedule_status){
          const response = await ApiClient.get(`/api/getVenue`, {
            params: { venue_id: girl.venue_id
              ,lang:currentLang
             },
          });

          console.log('venue-info', response);
          vn_schedule_status = response.schedule_status;
        }
        */


        let openTime = vn_response.open_time || false;
        let closeTime = vn_response.close_time || false;

        const opening_status = getOpeningStatus({
          open_time : vn_response.open_time, 
          close_time : vn_response.close_time, 
          schedule_status : vn_response.schedule_status
        })

        setOpeningStatus(opening_status);

        console.log('venue-info', vn_response, openTime, closeTime);

        let isPreOpen = false;

        function getNowInVietnam() {
          const now = new Date();
        
          // 베트남 타임존 offset은 UTC+7
          const utc = now.getTime() + now.getTimezoneOffset() * 60000;
          const vnTime = new Date(utc + 7 * 60 * 60000); // +7시간
          return vnTime;
        }



        if (openTime) {
          
          const nowVN = getNowInVietnam();

        
          // openTime 예: "09:00" 형태라고 가정
          const [openH, openM] = openTime.split(':').map(Number);
          const openAbs = new Date(nowVN);
          openAbs.setHours(openH, openM, 0, 0);
        
          // 오픈 30분 전 시각 계산
          const preOpenStart = new Date(openAbs.getTime() - 30 * 60 * 1000);
        
          // 현재 시간이 오픈 30분 전 이후 ~ 오픈 시각 이전이면 true
          if (nowVN >= preOpenStart && nowVN < openAbs) {
            isPreOpen = true;

            vn_schedule_status = 'preOpen';
          }
        
          console.log('[PreOpen 체크]', { nowVN, openAbs, preOpenStart, isPreOpen });
        }



        const vnData = vn_response?.data || vn_response;

      

        // ✅ venue_name 추가
        setGirl(prev => ({
          ...prev,
          venue_name: vnData.name || ''
        }));

        console.log("1234", girl)

        if(vn_schedule_status === 'closed' && !isPreOpen){
          setAvailCnt(0);
          setVnScheduleStatus(vn_schedule_status);
          setIsLoadingAvailCnt(false);
          return;
        }



        setVnScheduleStatus(vn_schedule_status);
        
        const response = await ApiClient.get('/api/staffAvailCnt', {
          params: { staff_id: girl.staff_id }
        });

        if (Array.isArray(response) && response.length > 0) {
          setAvailCnt(response[0]?.availcnt || 0);
        } else {
          setAvailCnt(0);
        }

      } catch (error) {
        console.error('availCnt 로딩 실패:', error);
        setAvailCnt(0);
      } finally {
        setIsLoadingAvailCnt(false);
      }
    };

    fetchStaffAvailCnt();
  }, [girl.staff_id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [messages, currentLang]);


/*
  useEffect(() => {
  const container = document.querySelector('.staff-detail-container');
  if (!container) return;

  container.addEventListener('touchstart', handleTouchStart, { passive: true });
  container.addEventListener('touchend', handleTouchEnd, { passive: true });

  return () => {
    container.removeEventListener('touchstart', handleTouchStart);
    container.removeEventListener('touchend', handleTouchEnd);
  };
}, []);
*/


  // 예약 버튼 상태 계산 함수
  const getReserveButtonState = (girl, availCnt, vnScheduleStatus, openingStatus, get) => {

    console.log('staff reservation status check', girl, availCnt, openingStatus, vnScheduleStatus);







    if (vnScheduleStatus === 'closed') {
      return {
        disabled: true,
        label: get('DiscoverPage1.1.disable') || '예약 마감',
      };
    }

    if (availCnt > 0) {
      return {
        disabled: false,
        label: get('DiscoverPage1.1') || '예약하기',
      };
    }

    return {
      disabled: true,
      label: get('DiscoverPage1.1.disable') || '예약 마감',
    };
  }





  return (
    <>
      <style jsx="true">{`
        .staff-detail-container {
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .profile-images-section {
          margin-bottom: 1rem;
        }
        .dual-image-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .image-left {
          width: 100%;
          max-width: 300px;
        }

        .rotation-div{height: 300px;}

        .profile-image {
            margin-top: 20px;
            width: 100%;
            max-height: 300px;
            height: 350px; /* 추가: height도 고정해야 중앙정렬 가능 */
            object-fit: contain; /* ✅ 이미지 비율 유지 + 여백 생기면 중앙 정렬 */
            object-position: center center; /* ✅ 상하좌우 중앙 정렬 */
            display: block;
            border-radius: 1rem;
          }
        .staff-info-section {
          text-align: center;
          margin-top: 1rem;
        }
        .staff-name {
          font-size: 1.5rem;
          font-weight: bold;
        }
        .staff-age {
          font-size: 1.1rem;
          margin-top: 0.25rem;
        }
        .staff-specialty {
          font-size: 1rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        .staff-description {
          margin-top: 0.75rem;
          font-size: 0.95rem;
          color: #4b5563;
          margin: 1rem;
        }
        .booking-form-section {
          margin-top: 2rem;
          padding-bottom: 20px;
          margin: 1rem;
        }
          .staff-languages {
          font-size: 0.9rem;
          margin-top: 0.5rem;
          color: #555;
        }
.fixed-bottom {
  position: fixed;
  bottom: 65px;              /* 항상 화면 최하단에 붙음 */
  left: -15px;
  width: 100%;
  background: #fff;       /* 버튼 영역 배경 (스크롤 겹침 방지) */

  display: flex;
  justify-content: center;
  z-index: 100;           /* 다른 요소 위로 */
}

.fixed-bottom .sketch-button {
  width: 90%;             /* 버튼 크기 */
  max-width: 500px;       /* (선택) 너무 커지지 않게 제한 */
}

.top-sum {
  padding: 0px 20px;
  margin-top: 25px; display: flex; justify-content: space-between; border-bottom: 1px solid #cecece;
  }



      `}</style>

      <div className="staff-detail-container">
        <SketchHeader
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{get('Menu1.2')}</span>
              {!isLoadingAvailCnt && (



                <div>
                  {/* 영업 상태 */}
                  {console.log('render-chk', girl, openingStatus)}
                  <span
                    style={{
                      backgroundColor: openingStatus.opening_status === 'open' 
                            ? 'rgb(11, 199, 97)' 
                            : 'rgb(107, 107, 107)',
                      color: 'white',
                      display:'none',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      marginLeft: '2px',
                      fontSize: '10px',
                    }}
                  >
                    {get(openingStatus.msg_code)}
                  </span>



                   {/* 예약 가능 여부 */}
                   <span
                    style={{
                      backgroundColor: 
                        vnScheduleStatus === 'closed' 
                          ? 'rgb(107, 107, 107)' 
                          : availCnt > 0 
                            ? 'rgb(11, 199, 97)' 
                            : 'rgb(107, 107, 107)',
                      color: 'white',
                      padding: '2px 6px',
                      display:'none',
                      borderRadius: '3px',
                      marginLeft: '2px',
                      fontSize: '10px',
                    }}
                  >
                    {vnScheduleStatus === 'closed'
                      ? get('DiscoverPage1.1.disable')
                      : availCnt > 0 
                        ? get('DiscoverPage1.1.able') 
                        : get('DiscoverPage1.1.disable')}
                  </span>


                </div>
              )}
            </div>
          }
          showBack={true}
          onBack={handleBack}
          rightButtons={[]}
        />
<div className="profile-images-section">
  <div
    ref={rotationHostRef}                // ← 이 ref가 iOS 네이티브가 붙을 "자리"
    className="profile-rotation"
    style={{ position: 'relative' }}
  >
    {isIOS ? (
      // iOS: 웹 이미지는 렌더링하지 않고, 자리만 유지(높이는 기존 이미지 높이와 동일하게)
      <div style={{ width: '100%', height: 530 }} />
    ) : (
      <RotationDiv
        interval={50000000}
        swipeThreshold={50}
        showIndicators={true}
        pauseOnHover={true}
        className="profile-rotation"
      >
        {(() => {
          const validImages = images.filter(img => img && img.trim() !== '');
          const slides = validImages.length > 0 ? validImages : [null];



          return slides.map((imageUrl, index) => (
            <div key={index} className="profile-slide">
              <div className="dual-image-container">
                <div className="image-left">
                  <ImagePlaceholder
                    noPopup={noImagePopup}
                    src={imageUrl}
                    fullList={images}
                    initialIndex={index}
                    placeholder={true}
                    className="profile-image"
                     onClick={() => {
                      setCurrentIndex(index);
                      if (isIOS) showIOSImageViewer();
                    }}
                  />
                </div>
              </div>
            </div>
          ));
        })()}
      </RotationDiv>
    )}
  </div>
</div>


{!isIOS && (
        <div className="staff-info-section">
          <div className="staff-photo-description" style={{display:noImagePopup ? 'block' : 'none', fontSize:'0.8rem'}}>
              {`(${get('STAFF_PHOTO_DESC')})`}
          </div>
          <div 
            className="staff-name"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'   // 이름과 하트 사이 간격
            }}
          >
            <span>{girl.name +"(🏪"+girl.venue_name+")" || 'Unknown Staff'}</span>

            {/* 즐겨찾기 버튼 */}
            <button
              onClick={toggleFavorite}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                marginTop:'7px'
              }}
            >
              <Heart
                size={22}
                color={isFavorite ? 'red' : '#999'}
                fill={isFavorite ? 'red' : 'none'}
              />
            </button>
          </div>
          
          {/* ⭐ 별점 + 즐겨찾기 */}
<div style={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '12px',
  marginTop: '0.5rem'
}}>
  {/* 별점 */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
    {renderStars(girl.rating)}   {/* ✅ avg_rating 기반 별표 */}
    <span style={{ fontSize: '0.9rem', color: '#555' }}>
      ({girl.rating ? girl.rating.toFixed(1) : '0.0'})
    </span>
  </div>


</div>

          {girl.languages && (
            
            <div
              className="staff-languages"
              style={{
                marginTop: '0.5rem',
                fontSize: '0.9rem',
                color: '#555',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                flexWrap: 'wrap'
              }}
            >
              <span>{get('LANGUAGES_LABEL')}:</span>
              {girl.languages.split(',').map((lang) => {
                const code = FLAG_CODES[lang.trim()];
                return code ? (
                  <CountryFlag
                    key={lang}
                    countryCode={code}
                    svg
                    style={{
                      fontSize: '1.5rem',
                      height:'auto',
                      border: '1px solid #ccc',       // 테두리 추가       
                      lineHeight: '1.5rem'
                    }}
                    title={lang}
                  />
                ) : null;
              })}
            </div>
          )}

        <div className="top-sum" style={{display:'none'}}>
            <div className="stars">
              {renderStars(5)}
              <span style={{
                 position: 'relative',
                 top: '-3px',
                 left: '6px'
              }}>
                {/* 리뷰 건수*/}
                {`5.0 (${1})`}
              </span>
            </div>
            <div
              style={{
                color: girl?.reviewCount > 0 ? '#0072ff' : '#999999',
                cursor: girl?.reviewCount > 0 ? 'pointer' : 'default'
              }}
              onClick={async () => {
                if (girl?.reviewCount > 0) {

                  showAdWithCallback(
                    // 광고 완료 시 콜백
                    () => {
                      navigateToPageWithData(PAGES.VIEWREVIEWDETAIL, { venueId });
                    },
                    // fallback 콜백 (광고 응답 없을 때)
                    () => {
                      navigateToPageWithData(PAGES.VIEWREVIEWDETAIL, { venueId });
                    },
                    1000 // 1초 타임아웃
                  );
                }
              }}
            >
              {get('nav.review.1')} <span className='reviewCnt'>{1}</span>{get('text.cnt.1')} {get('text.cnt.2')} &gt;
            </div>
          </div>


          {/*
          <div className="staff-age">
            {girl.birth_year ? `Age ${getAgeFromBirthYear(girl.birth_year)}` : 'Age N/A'}
          </div>
          */}
          <div className="staff-description">
            { 
              formatTextWithLineBreaks(girl.description || 'No description available.')
            }
          </div>
        </div>
)}
         <div className="booking-form-section fixed-bottom">
          {/*
  <SketchBtn
    className="sketch-button enter-button"
    variant="event"
    disabled={availCnt <= 0 || vnScheduleStatus === 'closed'}
    onClick={handleReserve}
  >
    <HatchPattern opacity={0.8} />
    {vnScheduleStatus === 'closed'
      ? get('DiscoverPage1.1.disable') || '예약 마감'
      : availCnt > 0
        ? get('DiscoverPage1.1') || '예약하기'
        : get('DiscoverPage1.1.disable') || '예약 마감'}
  </SketchBtn>
  */}
    {(() => {
      const state = getReserveButtonState(girl, availCnt, vnScheduleStatus, openingStatus, get);
      return (
        <SketchBtn
          className="sketch-button enter-button"
          variant="event"
          disabled={state.disabled}
          onClick={handleReserve}
        >
          <HatchPattern opacity={0.8} />
          {state.label}
        </SketchBtn>
      );
    })()}

</div>



        <LoadingScreen
          variant="cocktail"
          loadingText="Loading..."
          isVisible={loading}
        />
      </div>
    </>
  );
};

const getLanguageFlagImages = (langStr) => {
  if (!langStr) return [];

  const flagMap = {
    kr: '/flags/kr.png',
    en: '/flags/us.png',
    vi: '/flags/vn.png',
    ja: '/flags/jp.png',
    cn: '/flags/cn.png',
  };

  return langStr
    .split(',')
    .map(l => l.trim())
    .filter(l => flagMap[l])
    .map(l => ({ lang: l, src: flagMap[l] }));
};


export default StaffDetailPage;
