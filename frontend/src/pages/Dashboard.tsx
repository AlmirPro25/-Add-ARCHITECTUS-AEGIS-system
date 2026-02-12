
import { useEffect, useRef, useState } from 'react';
import { useMissionStore } from '../stores/missionStore';
import { socketService } from '../services/socket';
import { AuthAPI } from '../services/api/auth';
import DeviceList from '../components/DeviceList';
import TacticalMap from '../components/TacticalMap';
import LogConsole from '../components/LogConsole';
import OsintSearch from '../components/OsintSearch';
import { Activity, ShieldCheck, Wifi, Video, Mic, Screenshare, AlertTriangle, BatteryCharging, CloudOff, Target } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

const MISSION_CONTROL_DEVICE_NAME = 'MISSION_CONTROL_DASHBOARD';

export default function Dashboard() {
  const store = useMissionStore();
  const selectedDevice = store.devices.find(d => d.id === store.selectedDeviceId);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [activeStreamDeviceId, setActiveStreamDeviceId] = useState<string | null>(null);
  const [streamType, setStreamType] = useState<'video' | 'audio' | 'screen' | null>(null);
  const [isWebRtcConnected, setIsWebRtcConnected] = useState(false);
  const [cpuLoad, setCpuLoad] = useState(0); // Mocked for dashboard's internal telemetry
  const [memUsage, setMemUsage] = useState(0); // Mocked for dashboard's internal telemetry

  useEffect(() => {
    // Initialize Auth (for demo, ensure a token exists for dashboard ops)
    const initializeAuthToken = async () => {
        let token = localStorage.getItem('tactical_token');
        let deviceId = localStorage.getItem('device_id');

        if (!token || !deviceId) {
            console.log('[DASHBOARD] No existing Mission Control token. Attempting auto-registration...');
            try {
                // Auto-register a "Mission Control" device with a fixed name and type
                const response = await AuthAPI.registerDevice({
                    deviceName: MISSION_CONTROL_DEVICE_NAME,
                    deviceType: 'MISSION_CONTROL' // A specific type for the dashboard
                });
                token = response.token;
                deviceId = response.deviceId;
                localStorage.setItem('tactical_token', token);
                localStorage.setItem('device_id', deviceId);
                console.log(`[DASHBOARD] Mission Control device auto-registered: ${deviceId}.`);
            } catch (err) {
                console.error('[DASHBOARD] Failed to auto-register Mission Control device. API unreachable?', err);
                // Even without a token, try to proceed, but operations will fail.
                return;
            }
        } else {
            // Verify existing token
            const isValid = await AuthAPI.verifySession();
            if (!isValid) {
                console.warn('[DASHBOARD] Stored Mission Control token invalid. Re-attempting registration...');
                localStorage.removeItem('tactical_token');
                localStorage.removeItem('device_id');
                initializeAuthToken(); // Recursive call to re-register
                return;
            }
            console.log(`[DASHBOARD] Mission Control device found: ${deviceId}. Session verified.`);
        }
        
        // 1. Initial Load of Devices
        store.fetchAssets();

        // 2. Setup Socket Listener
        if (token) {
            socketService.connect(token);
            socketService.subscribeToMissionControl(
                (telemetry) => store.handleTelemetryStream(telemetry),
                (status) => store.handleAgentConnected(status),
                (status) => store.handleAgentDisconnected(status),
            );

            // WebRTC Callbacks
            socketService.onRemoteStream((stream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = stream;
                    setIsWebRtcConnected(true);
                    console.log('[WebRTC] Remote stream received and attached to video element.');
                }
            });

            // No specific webrtc_connection_status event in socket.ts, rely on iceConnectionStateChange
        }
    };

    initializeAuthToken();

    // Mock CPU/MEM data for visualization (dashboard's own internal stats)
    const interval = setInterval(() => {
      setCpuLoad(Math.floor(Math.random() * 30) + 10); // 10-40%
      setMemUsage(Math.floor(Math.random() * 40) + 20); // 20-60%
    }, 3000);


    return () => {
        socketService.disconnect();
        clearInterval(interval);
    };
  }, []); // Run once on mount


  const handleStreamRequest = (deviceId: string) => {
    if (!selectedDevice || selectedDevice.id !== deviceId) {
      store.selectDevice(deviceId); // Select the device if not already
    }
    setActiveStreamDeviceId(deviceId);
    setStreamType('video'); // Default to video streaming
    socketService.startAgentStream(deviceId);
  };

  const handleStopStream = () => {
    socketService.stopAgentStream();
    setActiveStreamDeviceId(null);
    setStreamType(null);
    setIsWebRtcConnected(false);
    if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
    }
  };

  const handleMarkerClick = (deviceId: string) => {
    store.selectDevice(deviceId);
    // Optionally stop active stream if a different device is selected
    if (activeStreamDeviceId && activeStreamDeviceId !== deviceId) {
      handleStopStream();
    }
  };

  return (
    <div className="h-screen w-screen bg-tactical-bg text-tactical-text flex flex-col overflow-hidden font-mono">
      {/* HEADER */}
      <header className="h-14 border-b border-tactical-border bg-tactical-panel flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-tactical-green animate-pulse" />
          <h1 className="text-xl font-bold tracking-[0.2em] text-tactical-green">
            ARCHITECTUS<span className="text-white">AEGIS</span>
          </h1>
          <span className="text-xs bg-tactical-border px-2 py-0.5 rounded text-tactical-muted">v2.0.4-TACTICAL</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
           <div className="flex items-center gap-2">
             {socketService.socket?.connected ? 
                <Wifi size={14} className="text-tactical-green animate-pulse"/> : 
                <CloudOff size={14} className="text-tactical-red"/>
             }
             <span>SYSTEM {socketService.socket?.connected ? 'ONLINE' : 'OFFLINE'}</span>
           </div>
           <div className="text-tactical-blue">
             {format(new Date(), 'HH:mm:ss')} UTC
           </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="flex-1 grid grid-cols-12 gap-0">
        
        {/* LEFT SIDEBAR (Devices) */}
        <aside className="col-span-3 border-r border-tactical-border bg-black/50 flex flex-col">
          <div className="p-3 bg-tactical-panel border-b border-tactical-border">
            <h2 className="text-xs font-bold text-tactical-muted uppercase tracking-widest flex gap-2">
              <Activity size={12}/> Active Field Assets ({store.devices.filter(d => d.type !== 'MISSION_CONTROL').length})
            </h2>
          </div>
          <DeviceList 
            devices={store.devices} 
            selectedId={store.selectedDeviceId}
            onSelect={handleMarkerClick}
            activeStreamDeviceId={activeStreamDeviceId}
            onStreamRequest={handleStreamRequest}
            onStopStream={handleStopStream}
          />
        </aside>

        {/* CENTER (Map & Stream) */}
        <main className="col-span-6 relative bg-gray-900 border-r border-tactical-border">
          <TacticalMap 
            devices={store.devices} 
            selectedId={store.selectedDeviceId} 
            onMarkerClick={handleMarkerClick}
          />
          
          {/* Live Video/Screen Stream Overlay */}
          {(activeStreamDeviceId && selectedDevice) && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
              {isWebRtcConnected ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className="object-contain w-full h-full"
                  />
                  <div className="absolute bottom-4 left-4 text-tactical-green text-sm flex items-center gap-2">
                    <Video size={16} className="animate-pulse" /> LIVE STREAM: {selectedDevice.name.toUpperCase()}
                  </div>
                  <button 
                    onClick={handleStopStream} 
                    className="absolute top-4 right-4 p-2 bg-tactical-red text-white rounded-full hover:bg-tactical-red/80 flex items-center gap-2 text-xs"
                  >
                    <WifiOff size={16}/> TERMINATE STREAM
                  </button>
                </div>
              ) : (
                <div className="text-tactical-muted text-center flex flex-col items-center gap-4 animate-pulse">
                  <AlertTriangle size={36} className="text-yellow-500" />
                  <span>AWAITING LIVE STREAM FROM {selectedDevice.name.toUpperCase()}...</span>
                  <button onClick={handleStopStream} className="mt-4 p-2 bg-tactical-red text-white text-xs">CANCEL</button>
                </div>
              )}
            </div>
          )}

          {/* Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-10"></div>
        </main>

        {/* RIGHT SIDEBAR (Telemetry & Logs / OSINT) */}
        <aside className="col-span-3 flex flex-col bg-black/50">
          <div className="h-1/2 border-b border-tactical-border p-4 flex flex-col">
             <h2 className="text-xs font-bold text-tactical-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <Target size={12}/> Target Telemetry: {selectedDevice?.name.toUpperCase() || 'N/A'}
             </h2>
             {selectedDevice ? (
                <div className="space-y-4 text-sm flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-tactical-green/50 scrollbar-track-transparent">
                   <div className="space-y-1">
                      <div className="flex justify-between text-xs"><span>CPU LOAD</span><span>{cpuLoad}%</span></div>
                      <div className="w-full h-1 bg-gray-800"><div style={{width: `${cpuLoad}%`}} className="h-full bg-tactical-blue transition-all duration-500"></div></div>
                   </div>
                   <div className="space-y-1">
                      <div className="flex justify-between text-xs"><span>MEM USAGE</span><span>{memUsage}%</span></div>
                      <div className="w-full h-1 bg-gray-800"><div style={{width: `${memUsage}%`}} className="h-full bg-tactical-blue transition-all duration-500"></div></div>
                   </div>
                   <div className="p-2 border border-tactical-border bg-black text-xs text-tactical-green mt-4">
                      COORD LOCK ESTABLISHED.<br/>
                      ENCRYPTION: AES-256<br/>
                      IP: {selectedDevice.lastIp || 'UNKNOWN'}<br/>
                      LAST UPLINK: {format(new Date(selectedDevice.updatedAt), 'HH:mm:ss dd-MM-yyyy')}<br/>
                      LATENCY: {Math.floor(Math.random() * 50) + 10}ms
                   </div>
                   <div className="p-2 border border-tactical-border bg-black text-xs text-tactical-green mt-2">
                       {selectedDevice.lastBattery < 20 && <div className="text-tactical-red flex items-center gap-1"><BatteryCharging size={12}/> LOW BATTERY ALERT!</div>}
                       {!selectedDevice.isOnline && <div className="text-yellow-500 flex items-center gap-1"><CloudOff size={12}/> LINK OFFLINE!</div>}
                   </div>
                </div>
             ) : (
                <div className="flex flex-1 items-center justify-center text-tactical-muted text-xs">
                   SELECT A TARGET
                </div>
             )}
          </div>
          <div className="h-1/2 flex flex-col">
             {store.selectedDeviceId ? (
                <LogConsole logs={store.selectedDeviceLogs} title={`Logs for ${selectedDevice?.name.toUpperCase()}`}/>
             ) : (
                <OsintSearch />
             )}
          </div>
        </aside>
      </div>
    </div>
  );
}
