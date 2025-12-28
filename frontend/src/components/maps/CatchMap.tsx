"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { CatchLog } from "@/types/api";

interface CatchMapProps {
  data: CatchLog[];
}


export default function CatchMap({ data }: CatchMapProps) {
  // Default center: if data exists, center on first point; else fallback
  const center: [number, number] = data.length
    ? [data[0].latitude, data[0].longitude]
    : [0, 0];

  // Custom marker icon (optional)
  const fishIcon = new L.Icon({
    iconUrl:
      "https://cdn-icons-png.flaticon.com/512/2271/2271030.png", // small fish icon
    iconSize: [25, 25],
    iconAnchor: [12, 25],

  });

  return (
    <MapContainer center={center} zoom={5} scrollWheelZoom style={{ height: 500 }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {data.map((c) => (
        <Marker
          key={c.id}
          position={[c.latitude, c.longitude]}
          icon={fishIcon}
        >
          <Popup>
            <strong>{c.species_name}</strong>
            <br />
            Vessel: {c.vessel_name}
            <br />
            Weight: {c.weight_kg} kg
            <br />
            Date: {c.catch_date}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
