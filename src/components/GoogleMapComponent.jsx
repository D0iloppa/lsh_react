import React, { useEffect, useRef, useState } from 'react';


const GoogleMapComponent = ({ places = [], onMarkerClick = () => {}, disableInteraction = false }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const infoWindowRef = useRef(null);
  const markersRef = useRef([]);
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
    center: { lat: 10.782865, lng: 106.701439 },
    zoom: 18,
    disableDefaultUI: true,
    styles: [
		  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
		  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
		  { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
		  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
		  { elementType: "labels.icon", stylers: [{ visibility: "off" }] }
		],
    // 🔐 제어 비활성화 조건 추가
    draggable: !disableInteraction,
    scrollwheel: !disableInteraction,
    disableDoubleClickZoom: disableInteraction,
    gestureHandling: disableInteraction ? "none" : "greedy"
  };

  mapInstance.current = new window.google.maps.Map(mapRef.current, baseOptions);
  setMapReady(true);
};
  useEffect(() => {
    if (!mapReady || !places) return;

    // 항상 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (places.length === 0) return;

    console.log("✅ 마커 추가 시작:", places.length, "개");

    places.forEach((place, idx) => {
      if (!place || !place.latitude || !place.longitude) {
        console.warn(`⚠️ 마커 생략 [${idx}]`, place);
        return;
      }

      if (idx === 0) {
        mapInstance.current.setCenter({
          lat: parseFloat(place.latitude),
          lng: parseFloat(place.longitude)
        });
      }

      const marker = new window.google.maps.Marker({
        position: {
          lat: parseFloat(place.latitude),
          lng: parseFloat(place.longitude)
        },
        map: mapInstance.current,
        title: place.name,
        icon: createHeartMarkerSvg(place.rating)
      });

      marker.addListener("click", () => {
        onMarkerClick(place);
      });

      markersRef.current.push(marker);
    });
  }, [places, mapReady]);

  const createHeartMarkerSvg = (rating) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48">
        <path d="M24 42s-1.7-1.6-4.7-4.2c-5.3-4.7-11.3-10-11.3-15.8C8 15.6 12.5 12 17.5 12c2.5 0 4.8 1.1 6.5 2.9C26.7 13.1 29 12 31.5 12 36.5 12 41 15.6 41 22c0 5.8-6 11.1-11.3 15.8C25.7 40.4 24 42 24 42z" fill="#9C74EE"/>
        <text x="24" y="29" font-size="13" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="bold">${rating}</text>
      </svg>`;
    return {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(45, 45),
      anchor: new window.google.maps.Point(32, 32),
      labelOrigin: new window.google.maps.Point(16, 42)
    };
  };

  return <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default GoogleMapComponent;
