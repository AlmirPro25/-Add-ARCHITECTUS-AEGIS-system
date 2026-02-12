
import { useState, useRef, useEffect, useCallback } from 'react';
import { AuthAPI } from '../services/api/auth';
import { TelemetryAPI } from '../services/api/telemetry'; // Still used for snapshots, but not for telemetry stream
import { socketService } from '../services/socket';
import { Device } from '../types';
import { Telemetry } from '../../shared/types'; // Using shared type for payload consistency

/**
 * HOOK: AGENT UPLINK
 * Gerencia a lógica do "Lado do Agente" (Dispositivo Alvo).
 * Responsável por: Registro, Coleta de Sensores, Transmissão via WebSocket, WebRTC.
 */

export function useAgentUplink() {
  const [device, setDevice] = useState<Device | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [batteryLevel, setBatteryLevel] = useState(100);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback((msg: string, level: 'INFO' | 'WARN' | 'CRITICAL' = 'INFO') => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] [${level}] ${msg}`, ...prev].slice(0, 8));
  }, []);

  // 1. Inicialização / Recuperação de Sessão
  useEffect(() => {
    const savedToken = localStorage.getItem('tactical_token');
    const savedId = localStorage.getItem('device_id');
    
    if (savedToken && savedId) {
      addLog('Stored credentials found. Attempting session verification...');
      AuthAPI.verifySession().then(isValid => {
        if (isValid) {
          addLog('Session re-established. Ready for uplink.');
          // Placeholder device info as full device object isn't retrieved by verifySession
          // This should ideally be fetched from the backend or stored with more detail.
          setDevice({ 
            id: savedId, 
            name: `AGENT-${savedId.substring(0,4)}`, 
            type: 'WEB_AGENT', 
            isOnline: false, 
            lastBattery: 0, 
            lastLat: null, 
            lastLng: null, 
            lastIp: null, 
            updatedAt: new Date().toISOString(), 
            createdAt: new Date().toISOString() 
          }); 
        } else {
          addLog('Stored session invalid or expired. Please re-register.', 'CRITICAL');
          localStorage.removeItem('tactical_token');
          localStorage.removeItem('device_id');
          setDevice(null);
          setRegistered(false); // Make sure registration button is visible again
        }
      }).catch(error => {
        addLog(`Error verifying session: ${error.message}`, 'CRITICAL');
        localStorage.removeItem('tactical_token');
        localStorage.removeItem('device_id');
        setDevice(null);
        setRegistered(false);
      });
    } else {
      addLog('No stored agent identity found. Initiate handshake.');
    }
  }, [addLog]);

  // 2. Registro (Handshake)
  const register = async () => {
    try {
      addLog('Initiating secure handshake...');
      const response = await AuthAPI.registerDevice({
        deviceName: `WEB-AGENT-${Math.floor(Math.random() * 9999)}`,
        deviceType: 'WEB_AGENT'
      });

      localStorage.setItem('tactical_token', response.token);
      localStorage.setItem('device_id', response.deviceId);
      
      setDevice(response.device);
      addLog(`Identity Confirmed: ${response.device.id.substring(0,8)}...`);
      return response.device; // Return device for immediate use
    } catch (error) {
      addLog('Handshake Failed. Server unreachable or error during registration.', 'CRITICAL');
      console.error(error);
      throw error; // Re-throw to be handled by UI
    }
  };

  // 3. Loop de Coleta de Dados (Sensores & Telemetria)
  const startTracking = useCallback(() => {
    if (!device) {
      addLog('No device identity. Cannot start tracking.', 'CRITICAL');
      return;
    }
    
    const token = localStorage.getItem('tactical_token');
    if (!token) {
      addLog('Authentication token missing. Please register device.', 'CRITICAL');
      return;
    }

    setIsTracking(true);
    socketService.connect(token);
    addLog('Uplink ACTIVE. Sensors engaged.');

    // Send immediate ONLINE status via WebSocket
    socketService.emitTelemetry('STATUS', { online: true });
    addLog('Initial ONLINE status sent via WebSocket.');


    intervalRef.current = setInterval(() => {
        // A. Simulate Battery Drain
        setBatteryLevel(prev => Math.max(0, prev - (Math.random() > 0.7 ? 1 : 0))); // More frequent random drain
        socketService.emitTelemetry('BATTERY', { level: batteryLevel });

        // B. Collect Real GPS (requires user permission)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const gpsPayload: Telemetry['data'] = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        acc: pos.coords.accuracy
                    };
                    socketService.emitTelemetry('GPS', gpsPayload);
                },
                (err) => addLog(`GPS ERROR: ${err.message}`, 'WARN'),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 } // Request high accuracy
            );
        } else {
            addLog('Geolocation not supported by this browser.', 'WARN');
        }
        
        // C. Simulate other sensor data (e.g., CPU, Memory, Device Orientation)
        const cpu = Math.floor(Math.random() * 20) + 5; // 5-25%
        const mem = Math.floor(Math.random() * 30) + 15; // 15-45%
        socketService.emitTelemetry('SENSOR', { cpu, mem });

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                socketService.emitTelemetry('SENSOR', {
                    alpha: event.alpha, // Z-axis rotation
                    beta: event.beta,   // X-axis rotation
                    gamma: event.gamma  // Y-axis rotation
                });
            }, { once: true }); // Only send once per interval to avoid excessive events
        }

    }, 5000); // Update every 5s

  }, [device, batteryLevel, addLog]);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    socketService.disconnect(); // This cleans up WebRTC as well
    setIsTracking(false);
    addLog('Uplink TERMINATED. Silence mode.');
    
    // Attempt to send final offline status via WebSocket (may fail if socket is already closed)
    socketService.emitTelemetry('STATUS', { online: false });
  }, [addLog]);

  return {
    device,
    isTracking,
    logs,
    batteryLevel,
    register,
    toggleTracking: isTracking ? stopTracking : startTracking,
    addLog, // Expose addLog for external components (e.g., WebRTC UI controls)
  };
}
