import React, { useEffect, useRef, useState } from 'react';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import {DoorOpen} from 'lucide-react';

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
  if (!mapReady || !places || places.length === 0 || !showEntrances) return;

  const venue = places[0];
  if (!venue || !venue.latitude || !venue.longitude) return;

  const bounds = new window.google.maps.LatLngBounds();
  
  // 베뉴 위치 추가
  bounds.extend({
    lat: parseFloat(venue.latitude),
    lng: parseFloat(venue.longitude)
  });

  // 입구 위치들 추가
  entrances.forEach((entrance) => {
    bounds.extend({
      lat: entrance.latitude,
      lng: entrance.longitude
    });
  });

  // 패딩 설정 (더 확대된 효과)
  const padding = {
    top: 15,     
    right: 15,   
    bottom: 15,  
    left: 15     
  };

  // 패딩과 함께 범위 조정
  mapInstance.current.fitBounds(bounds, padding);
  
  // 줌 제한 설정
  const listener = window.google.maps.event.addListener(mapInstance.current, "idle", function() {
    const currentZoom = mapInstance.current.getZoom();
    
    if (currentZoom > 17) { 
      mapInstance.current.setZoom(17);
    }
    
    if (currentZoom < 15) {
      mapInstance.current.setZoom(15);
    }
    
    window.google.maps.event.removeListener(listener);
  });

}, [places, mapReady, showEntrances]);



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
  const baseSize = 30;
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = baseSize * scale;
  canvas.height = baseSize * scale;
  const ctx = canvas.getContext('2d');

  ctx.scale(scale, scale);
  
  // 배경 원 그리기
  ctx.fillStyle = 'rgba(57, 143, 255, 0.6)';
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
        onMarkerClick(place);
      });

      markersRef.current.push(marker);
    });
  }, [places, mapReady]);

  useEffect(() => {
    if (!mapReady || !window.google || !mapInstance.current) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        const isInVietnam = latitude >= 8 && latitude <= 24 && longitude >= 102 && longitude <= 110;

        const center = isInVietnam
          ? { lat: latitude, lng: longitude }
          : { lat: 10.7810752, lng: 106.7052086 };

        mapInstance.current.setCenter(center);

        if (myLocationMarker.current) {
          myLocationMarker.current.setMap(null);
        }

        myLocationMarker.current = new window.google.maps.Marker({
          position: center,
          map: mapInstance.current,
          icon: {
            url: '/cdn/person_icon.png',
            scaledSize: new window.google.maps.Size(48, 48),
            anchor: new window.google.maps.Point(24, 48)
          },
          title: '내 위치'
        });
      });
    }
  }, [mapReady]);

  return <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default GoogleMapComponent;
