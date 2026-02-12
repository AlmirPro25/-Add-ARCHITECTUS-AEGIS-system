
import { useEffect } from 'react';
import { useMissionStore } from '../stores/missionStore';
import { socketService } from '../services/socket';
import { AuthAPI } from '../services/api/auth'; // Import AuthAPI for token check

/**
 * HOOK: DASHBOARD DATA
 * Conecta a Store global aos eventos de WebSocket.
 * Garante que o Dashboard esteja sempre sincronizado.
 */

const MISSION_CONTROL_DEVICE_NAME = 'MISSION_CONTROL_DASHBOARD'; // Consistent name

export function useDashboardData() {
  const store = useMissionStore();

  useEffect(() => {
    const setupDashboard = async () => {
      let token = localStorage.getItem('tactical_token');
      let deviceId = localStorage.getItem('device_id');

      // Ensure Mission Control has a valid token
      if (!token || !deviceId) {
        console.log('[DASHBOARD HOOK] No Mission Control token found. Attempting auto-registration...');
        try {
          const response = await AuthAPI.registerDevice({
            deviceName: MISSION_CONTROL_DEVICE_NAME,
            deviceType: 'MISSION_CONTROL'
          });
          token = response.token;
          deviceId = response.deviceId;
          localStorage.setItem('tactical_token', token);
          localStorage.setItem('device_id', deviceId);
          console.log(`[DASHBOARD HOOK] Mission Control auto-registered with ID: ${deviceId}.`);
        } catch (err) {
          console.error('[DASHBOARD HOOK] Failed to auto-register Mission Control. Dashboard might not function correctly.', err);
          return; // Cannot proceed without a token
        }
      } else {
        const isValid = await AuthAPI.verifySession();
        if (!isValid) {
          console.warn('[DASHBOARD HOOK] Stored token is invalid or expired. Re-attempting Mission Control registration.');
          localStorage.removeItem('tactical_token');
          localStorage.removeItem('device_id');
          setupDashboard(); // Re-run to get a new token
          return;
        }
        console.log(`[DASHBOARD HOOK] Mission Control session verified for ID: ${deviceId}.`);
      }

      // 1. Initial Load of Devices
      store.fetchAssets();

      // 2. Setup Real-time Listeners
      if (token) {
        socketService.connect(token);
        
        // Bind Socket Events to Store Actions
        socketService.subscribeToMissionControl(
          (telemetryPayload) => store.handleTelemetryStream(telemetryPayload),
          (agentConnectedPayload) => store.handleAgentConnected(agentConnectedPayload),
          (agentDisconnectedPayload) => store.handleAgentDisconnected(agentDisconnectedPayload),
        );
      } else {
        console.error('[DASHBOARD HOOK] Critical: No tactical token available for socket connection.');
      }
    };

    setupDashboard();

    // Cleanup
    return () => {
      socketService.disconnect();
    };
  }, []); // Run once on mount

  return {
    devices: store.devices,
    selectedDevice: store.devices.find(d => d.id === store.selectedDeviceId),
    logs: store.logs, // Global logs
    selectedDeviceLogs: store.selectedDeviceLogs, // Specific device logs
    isLoading: store.isLoading,
    currentOsintResults: store.currentOsintResults,
    isOsintLoading: store.isOsintLoading,
  };
}
