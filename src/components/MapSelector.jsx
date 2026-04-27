import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapSelector = ({ location, onLocationSelect }) => {
  const [position, setPosition] = useState([location?.lat || 22.3039, location?.lng || 70.8022]);

  useEffect(() => {
    if (location) {
      setPosition([location.lat, location.lng]);
    }
  }, [location]);

  const LocationMarker = () => {
    const map = useMap();

    useEffect(() => {
      if (location) {
        map.flyTo([location.lat, location.lng], 15);
      }
    }, [location, map]);

    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onLocationSelect(e.latlng);
      },
    });

    return position === null ? null : (
      <Marker position={position}></Marker>
    );
  };

  useEffect(() => {
    if (!location && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <MapContainer center={[position[0], position[1]]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker />
      </MapContainer>
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-[10px] font-bold text-red-600 shadow-lg border border-red-100 uppercase tracking-wider">
        📍 Tap on map to set location
      </div>
    </div>
  );
};

export default MapSelector;
