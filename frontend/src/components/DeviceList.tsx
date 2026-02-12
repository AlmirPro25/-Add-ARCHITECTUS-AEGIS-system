
import { Device } from '../types';
import { Smartphone, Laptop, Signal, Battery, BatteryWarning, WifiOff, Video } from 'lucide-react';
import { clsx } from 'clsx';
import { formatDistanceToNowStrict } from 'date-fns';

interface Props {
  devices: Device[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeStreamDeviceId: string | null;
  onStreamRequest: (deviceId: string) => void;
  onStopStream: () => void;
}

export default function DeviceList({ devices, selectedId, onSelect, activeStreamDeviceId, onStreamRequest, onStopStream }: Props) {
  // Filter out the 'MISSION_CONTROL' device from the list
  const fieldDevices = devices.filter(d => d.type !== 'MISSION_CONTROL');

  return (
    <div className="flex flex-col gap-2 p-2 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-tactical-green/50 scrollbar-track-tactical-panel">
      {fieldDevices.length === 0 && (
         <div className="text-tactical-muted text-center mt-10 text-xs">
            NO ACTIVE FIELD ASSETS FOUND
         </div>
      )}
      
      {fieldDevices.map(device => (
        <div
          key={device.id}
          className={clsx(
            "p-3 border transition-all duration-200 group relative",
            "hover:bg-tactical-greenDim hover:border-tactical-green",
            selectedId === device.id 
              ? "bg-tactical-greenDim border-tactical-green" 
              : "bg-tactical-panel border-tactical-border"
          )}
        >
          <div onClick={() => onSelect(device.id)} className="cursor-pointer">
            <div className="flex justify-between items-center mb-1">
              <span className={clsx(
                  "font-bold text-sm tracking-wider",
                  selectedId === device.id ? "text-tactical-green" : "text-white"
              )}>
                {device.name.toUpperCase()}
              </span>
              {device.type === 'WEB_AGENT' ? <Laptop size={14} className="text-tactical-muted"/> : <Smartphone size={14} className="text-tactical-muted"/>}
            </div>

            <div className="flex justify-between items-end text-xs text-tactical-muted">
               <div className="flex items-center gap-2">
                  <span className={clsx(
                      "w-2 h-2 rounded-full",
                      device.isOnline ? "bg-tactical-green animate-pulse-fast" : "bg-tactical-red"
                  )} />
                  {device.isOnline ? 'SIGNAL LOCK' : 'LOST LINK'}
               </div>
               
               <div className="flex items-center gap-1">
                  {device.lastBattery < 20 ? <BatteryWarning size={14} className="text-tactical-red"/> : <Battery size={14} />}
                  <span>{device.lastBattery}%</span>
               </div>
            </div>
          </div>
          
          {/* Last Updated Timestamp */}
          <div className="text-[10px] text-tactical-muted mt-1 text-right">
              Updated {formatDistanceToNowStrict(new Date(device.updatedAt), { addSuffix: true })}
          </div>

          {/* Stream Controls */}
          <div className="absolute top-1 right-1 flex items-center gap-1">
              {activeStreamDeviceId === device.id ? (
                  <button 
                      onClick={onStopStream}
                      title="Stop Live Stream"
                      className="p-1 text-tactical-red hover:bg-tactical-red/20 rounded-full"
                  >
                      <WifiOff size={16} />
                  </button>
              ) : (
                  device.isOnline && (
                      <button 
                          onClick={() => onStreamRequest(device.id)}
                          title="Request Live Stream (Video, Audio, Screen)"
                          className="p-1 text-tactical-blue hover:bg-tactical-blue/20 rounded-full"
                      >
                          <Video size={16} />
                      </button>
                  )
              )}
          </div>
        </div>
      ))}
    </div>
  );
}
