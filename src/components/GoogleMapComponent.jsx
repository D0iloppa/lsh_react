import React, { useEffect, useRef, useState } from 'react';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import {DoorOpen} from 'lucide-react';
import Swal from 'sweetalert2';

const GoogleMapComponent = ({
  places = [],
  onMarkerClick = () => {},
  onMapClick = () => {},
  disableInteraction = false,
  showEntrances = false,
  showNearestEntranceConnection = false
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const myLocationMarker = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const markerClickFlag = useRef(false); // 마커 클릭 여부 추적
  const entranceMarkersRef = useRef([]);
  const [autoZoomDone, setAutoZoomDone] = useState(false);
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

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

  const initMap = () => {
    if (!window.google || !window.google.maps) return;

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
        markerClickFlag.current = true; // ✅ 마커 클릭으로 설정
         mapInstance.current.setCenter({
        lat: parseFloat(place.latitude),
        lng: parseFloat(place.longitude)
      });
      
      // ✅ 줌 레벨을 18로 확대 (또는 원하는 레벨)
      mapInstance.current.setZoom(20);
      
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
      const isInVietnam = latitude >= 8 && latitude <= 24 && longitude >= 102 && longitude <= 110;

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

export default GoogleMapComponent;
