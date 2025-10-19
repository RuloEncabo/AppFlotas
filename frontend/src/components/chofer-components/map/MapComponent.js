import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({setSelectedPoint,selectedPoint}) => {
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
  const mapRef = useRef(null); // Referencia al contenedor del mapa
  const mapInstanceRef = useRef(null); // Referencia a la instancia del mapa de Leaflet

  // Icono personalizado
  const customIcon = new L.Icon({
    iconUrl: '/images/geoIcon.png',
    iconSize: [38, 38],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76]
  });

  // Efecto para obtener la ubicación actual del dispositivo
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        setCurrentLocation({
          lat: selectedPoint.lat !== 0 ? selectedPoint.lat : position.coords.latitude,
          lng: selectedPoint.lng !== 0 ? selectedPoint.lng : position.coords.longitude,
        })
      });
    } else {
      alert("Geolocation is not available");
    }
  }, []);

  // Efecto para inicializar el mapa
  useEffect(() => {
    if (currentLocation.lat !== 0 && currentLocation.lat !== null && currentLocation.lng !== null && currentLocation.lng !== 0 && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([currentLocation.lat, currentLocation.lng], 13);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Usando divIcon para tener un marcador personalizado que mantiene su tamaño visual
      const customDivIcon = L.divIcon({
        className: 'custom-div-icon',
        html: "<img src='/images/geoIcon.png' style='width:38px;height:38px;'/></img>",
        iconSize: [38, 38],
        iconAnchor: [19, 19] // Ajusta esto según necesites para centrar tu icono correctamente
      });

      const marker = L.marker([currentLocation.lat, currentLocation.lng], {icon: customDivIcon}).addTo(map);

      map.on('click', function(e) {
        if (marker) marker.setLatLng(e.latlng);

        setSelectedPoint({"lat":e.latlng.lat,"lng":e.latlng.lng});
      });
    }

    // Limpieza al desmontar
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentLocation]);


  return <div ref={mapRef} style={{ height: '400px', width: '100%' }}></div>;
};

export default MapComponent;
