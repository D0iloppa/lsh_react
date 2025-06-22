import React, { useEffect, useRef, useState } from 'react';

const GoogleMapComponent = ({
  places = [],
  onMarkerClick = () => {},
  onMapClick = () => {},   // ✅ 1. 지도 클릭 콜백 추가
  disableInteraction = false
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
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

    // ✅ 2. 지도 클릭 시 콜백 호출
    mapInstance.current.addListener('click', () => {
      onMapClick();
    });
  };

  const createImageWithText = async (rating) => {
    const image = new Image();
    image.src = '/cdn/map_icon.png';
    await image.decode();

    const baseSize = 64;
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = baseSize * scale;
    canvas.height = baseSize * scale;
    const ctx = canvas.getContext('2d');

    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0, baseSize, baseSize);

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

      const icon = await createImageWithText(place.rating);

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

  return <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default GoogleMapComponent;
