import React, { useEffect, useRef, useState } from 'react';

const GoogleMapComponent = ({
  places = [],
  onMarkerClick = () => {},
  onMapClick = () => {},
  disableInteraction = false
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const myLocationMarker = useRef(null);
  const [mapReady, setMapReady] = useState(false);

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
      center: { lat: 10.782865, lng: 106.701439 }, // 레탄톤 초기 중심
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

    mapInstance.current.addListener('click', () => {
      onMapClick();
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
  
  // gray.png일 때 opacity 적용
  if (!isReservationAvailable) {
    ctx.globalAlpha = 0.6; // 60% 투명도 (0.0 = 완전 투명, 1.0 = 불투명)
  }
  
  ctx.drawImage(image, 0, 0, baseSize, baseSize);
  
  // opacity 원래대로 복원
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

  useEffect(() => {
    if (!mapReady || !places) return;

    // 기존 마커 제거
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
        onMarkerClick(place);
      });

      markersRef.current.push(marker);
    });
  }, [places, mapReady]);

  // ✅ 내 위치 마커 추가 (베트남 경계 체크 포함)
  useEffect(() => {
    if (!mapReady || !window.google || !mapInstance.current) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        // ✅ 베트남 대략적 경계 판단
        const isInVietnam = latitude >= 8 && latitude <= 24 && longitude >= 102 && longitude <= 110;

        const center = isInVietnam
          ? { lat: latitude, lng: longitude }
          : { lat: 10.7810752, lng: 106.7052086 }; // 레탄톤 거리 중심

        // 지도 중심 이동
        mapInstance.current.setCenter(center);

        // 기존 위치 마커 제거
        if (myLocationMarker.current) {
          myLocationMarker.current.setMap(null);
        }

        // 사람 아이콘 마커 추가
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
