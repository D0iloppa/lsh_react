import React, { forwardRef, useImperativeHandle, useCallback, useEffect, useRef, useState } from 'react';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import {DoorOpen} from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';
import Swal from 'sweetalert2';

const GoogleMapComponent = ({
  places = [],
  onMarkerClick = () => {},
  onMapClick = () => {},
  disableInteraction = false,
  showEntrances = false,
  showNearestEntranceConnection = false,
  disablePOIZoom = false,
  onMyPositionClick = () => {}
}, ref) => {


  const parentRef = useRef(null); // 구글맵/DOM 참조 등



  const apiKey = 'AIzaSyCXOZJxwzKKVlBJPfaDYRv4z_rQ2zOALZk';


  const mapRef = useRef(null);
  const blurOverlayRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const myLocationMarker = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const markerClickFlag = useRef(false); // 마커 클릭 여부 추적
  const entranceMarkersRef = useRef([]);
  const [autoZoomDone, setAutoZoomDone] = useState(false);
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  const isDraggedRef = useRef(false);
 const [isDragged, setIsDragged] = useState(false); // ✅

  const focusMyPosition = useCallback(() => {
    // 내부 로직: 지도 인스턴스 사용 등
    
    isDraggedRef.current = false;
    setIsDragged(false);

    positionToMyPosition();
    
    console.log('child: focus my position', isDraggedRef.current, isDragged);
  }, []);

  useImperativeHandle(ref, () => ({
    focusMyPosition
  }), [focusMyPosition]);


  const { user, isActiveUser } = useAuth();

  const entrances = [
  {
    name: get('ENTRANCE_MARKER_1_1'),
    address: "8A Thái Văn Lung, Bến Nghé, Quận 1, Hồ Chí Minh",
    isEntrance: true,
    latitude: 10.7792315,
    longitude: 106.704617
  },
  {
    name: get('ENTRANCE_MARKER_2_1'),
    address: "15B11 Lê Thánh Tôn, Bến Nghé, Quận 1, Hồ Chí Minh",
    isEntrance: true,
    latitude: 10.7804183,
    longitude: 106.7045508
  }
];


const isInVietnamFnc = (latitude, longitude) =>{

  const BOUNDS = {
    // 베트남 (8~24, 101.8~110.3)
    // https://www.google.com/maps/dir/8.000000,101.800000/24.000000,101.800000/24.000000,110.300000/8.000000,110.300000/16.000000,106.050000
    vietnam: {
      lat: [8.0, 24.0],
      lon: [101.8, 110.3],
    },
  
    // 호치민시
    // https://www.google.com/maps/dir/10.369500,106.354983/11.163114,106.354983/11.163114,107.012085/10.369500,107.012085/10.766307,106.683534
    hcmc: {
      lat: [10.3695, 11.163114],
      lon: [106.354983, 107.012085],
    },
  
    // 호치민 1군 (근사)
    // https://www.google.com/maps/dir/10.763000,106.682000/10.799000,106.682000/10.799000,106.720000/10.763000,106.720000/10.781000,106.701000
    d1: {
      lat: [10.763, 10.799],
      lon: [106.682, 106.720],
    },
  
    // 레탄톤 10km 포괄 BBox(반경 근사)
    // https://www.google.com/maps/dir/10.689607,106.613656/10.870418,106.613656/10.870418,106.796525/10.689607,106.796525/10.7800125,106.7050903
    ltt10km: {
      lat: [10.689607, 10.870418],
      lon: [106.613656, 106.796525],
    },
  
    // 레탄톤 거리 작은 박스
    // https://www.google.com/maps/dir/10.779000,106.704500/10.781000,106.704500/10.781000,106.706000/10.779000,106.706000/10.780000,106.705250
    ltt: {
      lat: [10.7790, 10.7810],
      lon: [106.7045, 106.7060],
    },
  };
  
  const inBBox = (lat, lon, [latMin, latMax], [lonMin, lonMax]) =>
    lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax;
  

  const { lat, lon } = BOUNDS.hcmc;
  return inBBox(latitude, longitude, lat, lon);


} 



useEffect(() => {
  return () => {
    // 입구 마커 정리만
    entranceMarkersRef.current.forEach(marker => marker.setMap(null));
  };
}, []);


useEffect(() => {
  if (!mapReady || !places || places.length === 0 || !showEntrances || autoZoomDone) return;

  const venue = places[0];
  if (!venue || !venue.latitude || !venue.longitude) return;

  const bounds = new window.google.maps.LatLngBounds();
  
  bounds.extend({
    lat: parseFloat(venue.latitude),
    lng: parseFloat(venue.longitude)
  });

  entrances.forEach((entrance) => {
    bounds.extend({
      lat: entrance.latitude,
      lng: entrance.longitude
    });
  });

  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const latSpan = ne.lat() - sw.lat();
  const lngSpan = ne.lng() - sw.lng();
  const maxSpan = Math.max(latSpan, lngSpan);

  let paddingSize;
  if (maxSpan > 0.01) paddingSize = 90;
  else if (maxSpan > 0.007) paddingSize = 70;
  else if (maxSpan > 0.005) paddingSize = 40;
  else paddingSize = 20;

  const padding = {
    top: paddingSize,
    right: paddingSize,
    bottom: paddingSize,
    left: paddingSize
  };

  mapInstance.current.fitBounds(bounds, padding);
  
  const listener = window.google.maps.event.addListener(mapInstance.current, "idle", function() {
    const currentZoom = mapInstance.current.getZoom();
    
    if (currentZoom > 17) { 
      mapInstance.current.setZoom(17);
    }
    
    if (currentZoom < 12) {
      mapInstance.current.setZoom(12);
    }
    
    window.google.maps.event.removeListener(listener);
    setAutoZoomDone(true); // ✅ 자동줌 완료 표시
  });

}, [places, mapReady, showEntrances, autoZoomDone]);




 //현재 언어 설정
 useEffect(() => {
    //window.scrollTo(0, 0);

    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      //window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);

/*
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (document.getElementById('google-maps-script')) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCXOZJxwzKKVlBJPfaDYRv4z_rQ2zOALZk`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);
  */

  // 앞의 loadGoogleMaps 대신 아래 코드 사용
  useEffect(() => {
    let cancelled = false;
  
    const tryInit = () => {
      if (cancelled) return;
  
      // 스크립트 로드 확인
      if (!window.google?.maps) return;
  
      // ref가 붙을 때까지 한 프레임씩 대기
      if (!mapRef.current) {
        requestAnimationFrame(tryInit);
        return;
      }
  
      // 중복 초기화 방지 (StrictMode 대비)
      if (mapInstance.current) return;
  
      initMap();
    };
  
    // 이미 로드되어 있으면 바로 진행
    if (window.google?.maps) {
      requestAnimationFrame(tryInit);
    } else {
      const exist = document.getElementById('google-maps-script');
      if (exist) {
        exist.addEventListener('load', tryInit, { once: true });
      } else {
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = tryInit;
        document.head.appendChild(script);
      }
    }
  
    return () => { cancelled = true; };
  }, []);


  // ON: Frosted + vignette + Liquid Glass plate + Dark glass message card
const applyMapBlur = (opts = {}) => {
  const el = mapRef.current;
  if (!el) return;

  const {
    // 맵 자체는 얕게 (플레이트/카드에서 추가 보정)
    blur = 1.6,
    saturate = 1.02,
    brightness = 1.02,

    // frosted & vignette
    dimWhite = 0.10,          // 0.08~0.12 권장
    vignette = true,
    vignetteInner = 0.62,     // 중앙 투명 비율(0~1)
    vignetteStrength = 0.22,  // 가장자리 어둡게(0~0.35)

    // 글래스 UI
    glass = true,             // 중앙 카드 표시
    message = '',             // 카드 문구
    blockClicks = true,       // 잠금시 클릭 차단
    duration = 220,           // 트랜지션
  } = opts;

  // 1) 맵 필터 (얕게)
  el.style.transition = `filter ${duration}ms ease`;
  el.style.willChange = 'filter';
  el.style.setProperty(
    'filter',
    `blur(${blur}px) saturate(${saturate}) brightness(${brightness})`,
    'important'
  );
  el.style.setProperty('transform', 'translateZ(0)', 'important');

  // 2) 부모에 "리퀴드 글래스 플레이트" 전면 오버레이
  const parent = el.parentElement;
  if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';

  let plate = parent.querySelector('#map-plate');
  if (!plate) {
    plate = document.createElement('div');
    plate.id = 'map-plate';
    Object.assign(plate.style, {
      position: 'absolute',
      inset: 0,
      opacity: '0',
      transition: `opacity ${duration}ms ease`,
      zIndex: 1,
      pointerEvents: blockClicks ? 'auto' : 'none',
      borderRadius: 'inherit',

      // Liquid glass 느낌 (배경 위에 유리판)
      background: `
        linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 100%),
        rgba(255,255,255,${dimWhite})
      `,
      border: '1px solid rgba(255,255,255,0.35)',
      boxShadow: '0 10px 30px rgba(31,38,135,0.25), inset 0 1px 0 rgba(255,255,255,0.35)',
      backdropFilter: 'blur(4px) saturate(1.35) brightness(1.02)',
      WebkitBackdropFilter: 'blur(4px) saturate(1.35) brightness(1.02)',
    });

    // 상단 하이라이트(유리 반사 느낌)
    const glare = document.createElement('div');
    Object.assign(glare.style, {
      position: 'absolute',
      left: '10%',
      right: '10%',
      top: '10px',
      height: '2px',
      background:
        'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)',
      pointerEvents: 'none',
    });
    plate.appendChild(glare);

    parent.appendChild(plate);
  }

  // 비네트(가장자리 어둡게)
  const vignetteBg = vignette
    ? `radial-gradient(circle at 50% 50%,
         rgba(0,0,0,0) ${Math.round(vignetteInner * 100)}%,
         rgba(0,0,0,${Math.min(vignetteStrength, 0.15)}) 100%)`
    : 'transparent';
  plate.style.backgroundImage = `${vignetteBg}, linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 100%)`;
  plate.style.opacity = '1';

  // 3) 중앙 "검은 리퀴드 글래스" 메시지 카드
  const existing = parent.querySelector('#map-glass');
  if (glass) {
    let card = existing;
    if (!card) {
      card = document.createElement('div');
      card.id = 'map-glass';
      Object.assign(card.style, {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        minWidth: '260px',
        maxWidth: 'min(92%, 520px)',
        padding: '14px 16px',
        borderRadius: '16px',
        zIndex: 2,
        pointerEvents: blockClicks ? 'auto' : 'none',
        textAlign: 'center',

        // Dark liquid glass
        background: 'rgba(10,10,12,0.55)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 12px 36px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
        backdropFilter: 'blur(14px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.2)',
        color: '#fff',
      });

      // 라벨
      const label = document.createElement('div');
      label.className = 'map-glass-msg';
      Object.assign(label.style, {
        fontWeight: 600,
        fontSize: '14px',
        lineHeight: 1.45,
        whiteSpace: 'pre-line',
      });
      if (message) label.textContent = message;
      card.appendChild(label);

      parent.appendChild(card);
    } else {
      const label = card.querySelector('.map-glass-msg');
      if (label && message) label.textContent = message;
      card.style.display = 'block';
    }
  } else if (existing) {
    existing.style.display = 'none';
  }
};

// OFF: 모든 오버레이 제거 및 필터 복원
const removeMapBlur = (duration = 220) => {
  const el = mapRef.current;
  if (el) {
    el.style.transition = `filter ${duration}ms ease`;
    el.style.filter = '';
    el.style.transform = '';
  }
  const parent = el?.parentElement;
  const plate = parent?.querySelector('#map-plate');
  if (plate) {
    plate.style.opacity = '0';
    setTimeout(() => plate.remove(), duration);
  }
  parent?.querySelector('#map-glass')?.remove();
};



  const initMap = async () => {
    if (!window.google || !window.google.maps) return;

    const checkActiveUser = await isActiveUser();
    const {isActiveUser:iau, subscription = {} } = checkActiveUser;

    console.log('initMap iau', checkActiveUser, iau);

    const baseOptions = {
      center: { lat: 10.782865, lng: 106.701439 },
      zoom: 18,
      disableDefaultUI: true,
      styles: [
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
        { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#aadaff" }] },
        { featureType: "water", elementType: "labels.text", stylers: [{ visibility: "off" }] },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] }
      ],
      draggable: !disableInteraction,
      scrollwheel: !disableInteraction,
      disableDoubleClickZoom: disableInteraction,
      gestureHandling: disableInteraction ? "none" : "greedy"
    };

    mapInstance.current = new window.google.maps.Map(mapRef.current, baseOptions);
    setMapReady(true);

    // ✅ 지도 클릭 핸들러
    mapInstance.current.addListener('click', () => {
      // 만약 직전에 마커 클릭이 있었으면 무시
      if (markerClickFlag.current) {
        markerClickFlag.current = false; // 플래그 초기화
        return;
      }
      onMapClick(); // 실제 지도 클릭 처리
    });


    mapInstance.current.addListener('drag', () => {
      
    });

   mapInstance.current.addListener('dragend', () => {
    isDraggedRef.current = true;
    setIsDragged(true);
    console.log('drag end', isDraggedRef.current, 'error'); // ✅ 최신 값
  });

    //if (!iau) showBlurOverlay(mapInstance.current);
    
    if (!iau) {
      removeMapBlur();
      //applyMapBlur();
      /*
      applyMapBlur({
        blur: 1.6,
        dimWhite: 0.10,
        vignette: true,
        vignetteInner: 0.60,
        vignetteStrength: 0.22,
        glass: true,
        message: get?.('MAP_PURCHASE_MESSAGE') || '지도 서비스를 이용하려면 이용권을 구매해야 합니다.',
      });
      */
      //showBlurMessage(get?.('MAP_PURCHASE_MESSAGE') || '지도 서비스를 이용하려면 이용권을 구매해야 합니다.');
    } else {
      removeMapBlur();
      //hideBlurMessage();
    }
  };

  const createImageWithText = async (rating, isReservationAvailable = true) => {
    const image = new Image();
    image.src = isReservationAvailable ? '/cdn/map_icon.png' : '/cdn/map_icon_gray.png';
    await image.decode();

    const baseSize = 64;
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = baseSize * scale;
    canvas.height = baseSize * scale;
    const ctx = canvas.getContext('2d');

    ctx.scale(scale, scale);

    if (!isReservationAvailable) {
      ctx.globalAlpha = 0.6;
    }

    ctx.drawImage(image, 0, 0, baseSize, baseSize);
    ctx.globalAlpha = 1.0;

    const text = parseFloat(rating || 0).toFixed(1);
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';
    ctx.strokeText(text, baseSize / 2, 18);
    ctx.fillStyle = '#fff';
    ctx.fillText(text, baseSize / 2, 18);

    return {
      url: canvas.toDataURL(),
      scaledSize: new window.google.maps.Size(baseSize, baseSize),
      anchor: new window.google.maps.Point(baseSize / 2, baseSize),
    };
  };


  //입구 아이콘 생성
const createEntranceIcon = (label) => {
  const baseSize = 35;
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = baseSize * scale;
  canvas.height = baseSize * scale;
  const ctx = canvas.getContext('2d');

  ctx.scale(scale, scale);
  
  // 배경 원 그리기
  ctx.fillStyle = 'rgba(33, 125, 247, 0.9)';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(baseSize / 2, baseSize / 2, baseSize / 2 - 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // ✅ DoorOpen 아이콘 크기 줄임
  const doorIconSize = 10; // ✅ 14에서 10으로 줄임
  const iconX = baseSize / 2 - doorIconSize / 2;
  const iconY = baseSize / 2 - doorIconSize / 2 - 2; // ✅ -3에서 -2로 조정

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2; // ✅ 1.5에서 1.2로 줄임
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  // 문틀
  ctx.rect(iconX + 1, iconY + 1, doorIconSize - 2, doorIconSize - 2); // ✅ 여백 줄임
  // 문짝 (열린 상태)
  ctx.moveTo(iconX + 2, iconY + 1);
  ctx.lineTo(iconX + doorIconSize - 2, iconY + 1);
  ctx.lineTo(iconX + doorIconSize - 1, iconY + 2);
  ctx.lineTo(iconX + doorIconSize - 1, iconY + doorIconSize - 1);
  // 손잡이
  ctx.moveTo(iconX + doorIconSize - 3, iconY + doorIconSize / 2);
  ctx.lineTo(iconX + doorIconSize - 2, iconY + doorIconSize / 2);
  ctx.stroke();

  // 텍스트를 아이콘 아래로 이동
  ctx.font = 'bold 7px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const textY = baseSize / 2 + 7;
  ctx.fillText(label, baseSize / 2, textY);

  return {
    url: canvas.toDataURL(),
    scaledSize: new window.google.maps.Size(baseSize, baseSize),
    anchor: new window.google.maps.Point(baseSize / 2, baseSize),
  };
};

//입구 아이콘 표시
useEffect(() => {
  if (!mapReady || !window.google || !mapInstance.current || !showEntrances) return; 

  // 기존 entrance 마커가 있으면 제거
  entranceMarkersRef.current.forEach(marker => marker.setMap(null));
  entranceMarkersRef.current = [];

  entrances.forEach((entrance) => {
    const icon = createEntranceIcon(entrance.name);
    
    const marker = new window.google.maps.Marker({
      position: {
        lat: entrance.latitude,
        lng: entrance.longitude
      },
      map: mapInstance.current,
      title: entrance.name,
      icon
    });

    marker.addListener("click", () => {
      markerClickFlag.current = true;

      onMarkerClick({
          ...entrance,
          isEntrance: true
        });
    });

    entranceMarkersRef.current.push(marker);
  });
}, [mapReady, showEntrances]);



  useEffect(() => {
    if (!mapReady || !places) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (places.length === 0) return;

    places.forEach(async (place, idx) => {
      if (!place || !place.latitude || !place.longitude) return;

      if (idx === 0) {
        mapInstance.current.setCenter({
          lat: parseFloat(place.latitude),
          lng: parseFloat(place.longitude)
        });
      }

      const icon = await createImageWithText(place.rating, place.is_reservation);

      const marker = new window.google.maps.Marker({
        position: {
          lat: parseFloat(place.latitude),
          lng: parseFloat(place.longitude)
        },
        map: mapInstance.current,
        title: place.name,
        icon
      });

      marker.addListener("click", () => {


        // console.log('marker click', place);
        

        markerClickFlag.current = true; // ✅ 마커 클릭으로 설정
        mapInstance.current.setCenter({
          lat: parseFloat(place.latitude),
          lng: parseFloat(place.longitude)
        });

        if(!disablePOIZoom){      
          // ✅ 줌 레벨을 18로 확대 (또는 원하는 레벨)
          mapInstance.current.setZoom(20);
        }

        onMarkerClick(place);
      });

      markersRef.current.push(marker);
    });
  }, [places, mapReady]);

  
useEffect(() => {
  const init = async () => {
    if (!mapReady || !window.google || !mapInstance.current) return;

     if (disableInteraction) return;

    try {
      // ✅ 1. 내 위치 문자열 받아오기
      const coordString = await getMyLocation(); // 예: "37.2222,127.1232131"
      const [latStr, lngStr] = coordString.split(',');
      const latitude = parseFloat(latStr);
      const longitude = parseFloat(lngStr);

      // ✅ 베트남 여부 판별
      const isInVietnam = isInVietnamFnc(latitude, longitude)
      

      const center = isInVietnam
        ? { lat: latitude, lng: longitude }
        : { lat: 10.7800125, lng: 106.7050903 };

      // 지도 중심 이동
      mapInstance.current.setCenter(center);
      mapInstance.current.setZoom(16);

      // 기존 마커 제거
      if (myLocationMarker.current) {
        myLocationMarker.current.setMap(null);
      }

      // 새 마커 추가
      myLocationMarker.current = new window.google.maps.Marker({
        position: center,
        map: mapInstance.current,
        icon: {
          url: '/cdn/person_icon.png',
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 48),
        },
        title: '내 위치',
      });

      return; // ✅ 내 위치 설정 완료
    } catch (error) {
      console.warn('내 위치 파싱 실패 또는 없음 → 장소로 이동 시도');
    }

    // ✅ 2. 내 위치가 없거나 실패한 경우 → places[0]으로 중심 이동
    if (places.length > 0 && places[0].latitude && places[0].longitude) {
      const fallbackLocation = {
        lat: parseFloat(places[0].latitude),
        lng: parseFloat(places[0].longitude)
      };

      mapInstance.current.setCenter(fallbackLocation);
      mapInstance.current.setZoom(16);
    }
  };

  init();
}, [mapReady, places]);


  const positionToMyPosition = async () => {
    try {
      // ✅ 현재 위치 가져오기
      const coordString = await getMyLocation(); // 예: "37.2222,127.1232131"
      const [latStr, lngStr] = coordString.split(',');
      let latitude = parseFloat(latStr);
      let longitude = parseFloat(lngStr);


      const isInVietnam = isInVietnamFnc(latitude, longitude)

       if ( !isInVietnam  ) {
          latitude=10.780037531310423;
          longitude=106.70517814232926;
         // return;
       }


      // ✅ 랜덤 이동값 (약 ±1.5m 범위)
    
      const latOffset = (Math.random() - 0.5) * 0.00003;
      const lngOffset = (Math.random() - 0.5) * 0.00003;
      /*
      latitude += latOffset;
      longitude += lngOffset;
      */

      const newPos = { lat: latitude, lng: longitude };

      
      
      // 지도 중심 이동 (원하는 경우만)

      if ( isDraggedRef.current  == false ) {
        mapInstance.current.setCenter(newPos);
      }
      
      // 기존 마커 위치 업데이트 (없으면 새로 생성)
      if (myLocationMarker.current) {
        myLocationMarker.current.setPosition(newPos);
      } else {
        myLocationMarker.current = new window.google.maps.Marker({
          position: newPos,
          map: mapInstance.current,
          icon: {
            url: '/cdn/person_icon.png',
            scaledSize: new window.google.maps.Size(48, 48),
            anchor: new window.google.maps.Point(24, 48),
          },
          title: '내 위치',
        });
      }
    } catch (error) {
      console.warn('위치 갱신 실패:', error);
    }
  }

  useEffect(() => {
    if (!mapReady || !window.google || !mapInstance.current) return;
    if (disableInteraction) return;

  const interval = setInterval(async () => {
    positionToMyPosition();
  }, 1000);

  return () => clearInterval(interval);
}, [mapReady, disableInteraction]);


  return <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};



export const getMyLocation = () => {

  return new Promise((resolve, reject) => {
    let resolved = false;

    const handleMessage = (event) => {
      resolved = true;
      window.removeEventListener('message', handleMessage);
      resolve(event.data);
    };

    // iOS WebView
    if (window.webkit?.messageHandlers?.native?.postMessage) {
      window.addEventListener('message', handleMessage);
      window.webkit.messageHandlers.native.postMessage('getLocation');
    }
    // Android WebView
    else if (window.native?.postMessage) {
      window.addEventListener('message', handleMessage);
      window.native.postMessage('getLocation');
    }
    else {
      reject('❌ Native 환경이 아님');
    }

    // 10초 타임아웃 처리
    setTimeout(() => {
      if (!resolved) {
        window.removeEventListener('message', handleMessage);
        reject('⏱ getLocation 수신 타임아웃');
      }
    }, 10000);
  });
};

export default forwardRef(GoogleMapComponent);
