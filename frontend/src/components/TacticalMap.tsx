
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Device } from '../types';

// Fix Leaflet Icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  devices: Device[];
  selectedId: string | null;
  onMarkerClick: (deviceId: string) => void;
}

// Component to fly to selected device
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current) {
      map.setView(center, 13);
      initialLoad.current = false;
    } else {
      map.flyTo(center, 13, { animate: true, duration: 1 });
    }
  }, [center, map]);
  return null;
}

export default function TacticalMap({ devices, selectedId, onMarkerClick }: Props) {
  // Default to a neutral location if no devices
  const defaultCenter: [number, number] = [40.7128, -74.0060]; // New York City
  
  const activeDevice = devices.find(d => d.id === selectedId);
  const mapCenter = (activeDevice?.lastLat && activeDevice?.lastLng) 
    ? [activeDevice.lastLat, activeDevice.lastLng] as [number, number]
    : defaultCenter;

  return (
    <div id="tactical-map" className="h-full w-full relative z-0 bg-tactical-panel">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false} // Hide default Leaflet attribution for cleaner tactical UI
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // Filter to create a 'tactical' map look
          className="leaflet-container"
        />
        
        <MapUpdater center={mapCenter} />

        {devices.filter(d => d.type !== 'MISSION_CONTROL').map(device => ( // Filter out Mission Control from map
          (device.lastLat && device.lastLng) && (
            <Marker 
              key={device.id} 
              position={[device.lastLat, device.lastLng]}
              eventHandlers={{ click: () => onMarkerClick(device.id) }}
            >
              <Popup className="tactical-popup bg-tactical-panel border border-tactical-green text-tactical-text rounded-none p-2 shadow-lg">
                <div className="font-mono text-xs">
                  <strong className="text-tactical-green">{device.name.toUpperCase()}</strong><br/>
                  <span className="text-tactical-muted">Type: {device.type}</span><br/>
                  <span className="flex items-center gap-1">
                    Battery: <span className={device.lastBattery < 20 ? 'text-tactical-red' : 'text-tactical-green'}>{device.lastBattery}%</span>
                  </span><br/>
                  <span className="flex items-center gap-1">
                    Status: <span className={device.isOnline ? 'text-tactical-green' : 'text-tactical-red'}>{device.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                  </span>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
      
      {/* Map Overlay Grid for HUD effect */}
      <div className="absolute inset-0 pointer-events-none z-[1000] border-2 border-tactical-green/20 opacity-50 grid grid-cols-4 grid-rows-4">
          {[...Array(16)].map((_, i) => (
             <div key={i} className="border border-tactical-green/5"></div> 
          ))}
      </div>
    </div>
  );
}
