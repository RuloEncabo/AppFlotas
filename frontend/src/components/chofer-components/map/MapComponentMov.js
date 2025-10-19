import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponentMov = ({setSelectedPoint,selectedPoint}) => {
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
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    } else {
      alert("Geolocation is not available");
    }
  }, []);

  // Efecto para inicializar el mapa
  useEffect(() => {
    if (currentLocation.lat !== 0 && currentLocation.lng !== 0 && !mapInstanceRef.current) {
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

      const customDivIcon2 = L.divIcon({
        className: 'custom-div-icon',
        html: "<img src='/images/geoIcon2.png' style='width:38px;height:38px;'/></img>",
        iconSize: [38, 38],
        iconAnchor: [19, 19] // Ajusta esto según necesites para centrar tu icono correctamente
      });

      const marker = L.marker([currentLocation.lat, currentLocation.lng], {icon: customDivIcon}).addTo(map);

      map.on('click', function(e) {
        if (marker) marker.setLatLng(e.latlng);

        setSelectedPoint({"lat":e.latlng.lat,"lng":e.latlng.lng});
      });


    if (selectedPoint) {
      // Dibujar un marcador en el punto seleccionado
      const selectedPointmarker = L.marker([selectedPoint.lat, selectedPoint.lng], {icon: customDivIcon2}).addTo(map);
    }

      // Limpieza al desmontar
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };

    }

    // Limpieza al desmontar
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentLocation]);


  return <div ref={mapRef} style={{ height: '330px', width: '100%' }}></div>;
};

export default MapComponentMov;
