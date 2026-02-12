
import { io, Socket } from 'socket.io-client';
import { Telemetry, RTCOfferPayload, RTCAnswerPayload, RTCCandidatePayload } from '../types';
import adapter from 'webrtc-adapter'; // Ensure adapter is imported for WebRTC compatibility

// For dev, Vite proxies /socket.io to backend.
// For production, the client needs to connect directly to the public WebSocket endpoint.
const URL = import.meta.env.PROD ? window.location.origin : 'http://localhost:3000'; // Adjust for production deployment


class SocketService {
  socket: Socket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private targetDeviceId: string | null = null;

  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onDataChannelMessageCallback: ((message: string) => void) | null = null;
  private onAgentConnectedCallback: ((data: { deviceId: string; type: string }) => void) | null = null;
  private onAgentDisconnectedCallback: ((data: { deviceId: string }) => void) | null = null;


  connect(token: string) {
    if (this.socket && this.socket.connected) {
      console.log('[TACTICAL] Socket already connected.');
      return;
    }

    console.log(`[TACTICAL] Attempting to establish uplink to ${URL}`);
    this.socket = io(URL, {
      auth: { token },
      transports: ['websocket'],
      upgrade: true, // Allow upgrade from HTTP long-polling if needed
    });

    this.socket.on('connect', () => {
      console.log('[TACTICAL] Secure uplink established.');
    });

    this.socket.on('disconnect', (reason) => {
      console.warn(`[TACTICAL] Uplink severed. Reason: ${reason}`);
      this.cleanupWebRTC();
    });

    this.socket.on('connect_error', (err) => {
      console.error(`[TACTICAL] Uplink connection error: ${err.message}`);
    });

    // Handle agent connection/disconnection events (for dashboard)
    this.socket.on('agent_connected', (data: { deviceId: string; type: string }) => {
      console.log(`[TACTICAL] Agent ${data.deviceId} connected.`);
      this.onAgentConnectedCallback?.(data);
    });

    this.socket.on('agent_disconnected', (data: { deviceId: string }) => {
      console.log(`[TACTICAL] Agent ${data.deviceId} disconnected.`);
      this.onAgentDisconnectedCallback?.(data);
      // If the disconnected agent was the one we were streaming from, clean up WebRTC
      if (this.targetDeviceId === data.deviceId) {
        this.cleanupWebRTC();
      }
    });

    // WebRTC Signaling Listeners
    this.socket.on('webrtc_offer', async (senderId: string, offer: RTCSessionDescriptionInit) => {
      console.log(`[WebRTC] Received OFFER from ${senderId}`);
      // Ensure peerConnection is created/reset for this new offer
      if (!this.peerConnection || this.targetDeviceId !== senderId) {
        await this.createPeerConnection(senderId, true); // Agent answers, so it's the receiver/answerer but creates the connection here.
      }
      
      try {
        await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peerConnection!.createAnswer();
        await this.peerConnection!.setLocalDescription(answer);
        this.socket?.emit('webrtc_answer', senderId, answer);
        console.log(`[WebRTC] Sent ANSWER to ${senderId}`);
      } catch (e) {
        console.error('[WebRTC] Error processing offer:', e);
      }
    });

    this.socket.on('webrtc_answer', async (senderId: string, answer: RTCSessionDescriptionInit) => {
      console.log(`[WebRTC] Received ANSWER from ${senderId}`);
      try {
        if (this.peerConnection && this.peerConnection.signalingState !== 'closed') {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        } else {
          console.warn('[WebRTC] Peer connection not active or closed, cannot set remote answer.');
        }
      } catch (e) {
        console.error('[WebRTC] Error processing answer:', e);
      }
    });

    this.socket.on('webrtc_candidate', async (senderId: string, candidate: RTCIceCandidateInit) => {
      console.log(`[WebRTC] Received ICE CANDIDATE from ${senderId}`);
      try {
        if (this.peerConnection && this.peerConnection.signalingState !== 'closed' && candidate) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          console.warn('[WebRTC] Peer connection not active or closed, cannot add ICE candidate.');
        }
      } catch (e) {
        console.error('[WebRTC] Error adding received ICE candidate:', e);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.cleanupWebRTC();
  }

  emitTelemetry(type: Telemetry['type'], data: Telemetry['data']) {
    if (!this.socket) {
      console.warn('[TACTICAL] Socket not connected, cannot emit telemetry.');
      return;
    }
    this.socket.emit('telemetry', { type, data });
  }

  // Subscribe to Dashboard Events (for Mission Control)
  subscribeToMissionControl(
    onTelemetry: (data: any) => void,
    onAgentConnected: (data: { deviceId: string; type: string }) => void,
    onAgentDisconnected: (data: { deviceId: string }) => void,
  ) {
    if (!this.socket) return;
    this.socket.on('telemetry_update', onTelemetry);
    this.onAgentConnectedCallback = onAgentConnected;
    this.onAgentDisconnectedCallback = onAgentDisconnected;
  }

  // --- WebRTC Methods ---
  async createPeerConnection(targetDeviceId: string, isInitiator: boolean = false) {
    if (this.peerConnection && this.peerConnection.signalingState !== 'closed' && this.targetDeviceId === targetDeviceId) {
      console.log('[WebRTC] Reusing existing peer connection for the same target.');
      return;
    }

    if (this.peerConnection) {
      console.warn('[WebRTC] Peer connection already exists for a different target or is being reset. Cleaning up before creating a new one.');
      this.cleanupWebRTC();
    }

    this.targetDeviceId = targetDeviceId;
    const configuration = { 
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] 
    };
    this.peerConnection = new RTCPeerConnection(configuration);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit('webrtc_candidate', this.targetDeviceId, event.candidate.toJSON());
      }
    };

    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Received remote stream track!', event.streams[0]);
      this.remoteStream = event.streams[0];
      this.onRemoteStreamCallback?.(this.remoteStream);
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE connection state changed: ${this.peerConnection?.iceConnectionState}`);
      if (this.peerConnection?.iceConnectionState === 'failed' || this.peerConnection?.iceConnectionState === 'disconnected' || this.peerConnection?.iceConnectionState === 'closed') {
        console.warn('[WebRTC] Peer connection lost or failed. Attempting cleanup.');
        this.cleanupWebRTC();
      }
    };

    this.peerConnection.ondatachannel = (event) => {
        console.log('[WebRTC] Data channel received:', event.channel.label);
        this.dataChannel = event.channel;
        this.dataChannel.onmessage = (msg) => this.onDataChannelMessageCallback?.(msg.data);
        this.dataChannel.onopen = () => console.log('[WebRTC] Data channel is open!');
        this.dataChannel.onclose = () => console.warn('[WebRTC] Data channel closed!');
        this.dataChannel.onerror = (err) => console.error('[WebRTC] Data channel error:', err);
    };

    if (isInitiator) {
      // If this side is the initiator (e.g., agent wanting to send data channel commands to dashboard)
      // Or dashboard initiating a data channel. For this app, only agent opens it proactively
      // when it receives an offer and sets up stream.
      // Current architecture: agent is only answering, dashboard is only receiving.
      // So initiator:true here means agent is preparing its local stream and data channel.
      this.dataChannel = this.peerConnection.createDataChannel("agent-status-updates");
      this.dataChannel.onopen = () => console.log('[WebRTC] Initiator Data channel "agent-status-updates" is open!');
      this.dataChannel.onmessage = (msg) => console.log('[WebRTC] Initiator Data channel message:', msg.data);
      this.dataChannel.onclose = () => console.warn('[WebRTC] Initiator Data channel "agent-status-updates" closed!');
      this.dataChannel.onerror = (err) => console.error('[WebRTC] Initiator Data channel error:', err);
    }

    console.log(`[WebRTC] Peer connection created for ${targetDeviceId}. Initiator: ${isInitiator}`);
  }

  async startLocalStream(video: boolean, audio: boolean, screen: boolean = false): Promise<MediaStream | null> {
    this.cleanupLocalStream(); // Clean up any existing local stream

    try {
      let stream: MediaStream | null = null;
      if (screen) {
        stream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: { mediaSource: "screen" },
          audio: true // Requesting audio with screen share (browser dependent)
        });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ video, audio });
      }
      
      this.localStream = stream;
      
      console.log(`[WebRTC] Local stream started with video=${video}, audio=${audio}, screen=${screen}.`);
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream!);
        }
      });
      return this.localStream;
    } catch (e) {
      console.error('[WebRTC] Error starting local stream:', e);
      return null;
    }
  }

  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
        // Remove tracks from peer connection if they were added
        this.peerConnection?.getSenders().forEach(sender => {
          if (sender.track === track) {
            this.peerConnection?.removeTrack(sender);
          }
        });
      });
      this.localStream = null;
      console.log('[WebRTC] Local stream stopped.');
    }
  }

  cleanupWebRTC() {
    this.stopLocalStream();
    if (this.dataChannel) {
        this.dataChannel.close();
        this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.targetDeviceId = null;
    console.log('[WebRTC] WebRTC connection cleaned up.');
  }

  // Callbacks for UI
  onRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }

  onDataChannelMessage(callback: (message: string) => void) {
    this.onDataChannelMessageCallback = callback;
  }

  // Methods to emit WebRTC signaling
  async sendOffer(targetDeviceId: string) {
    if (!this.peerConnection || !this.socket) {
      console.error('[WebRTC] Cannot send offer: PeerConnection or Socket not ready.');
      return;
    }
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.socket.emit('webrtc_offer', targetDeviceId, offer);
      console.log(`[WebRTC] Sent OFFER to ${targetDeviceId}`);
    } catch (e) {
      console.error('[WebRTC] Error creating or sending offer:', e);
    }
  }

  // Dashboard specific: Start streaming from a selected agent
  async startAgentStream(agentId: string) {
    if (!this.socket) {
      console.error('[WebRTC] Socket not connected.');
      return;
    }
    await this.createPeerConnection(agentId, false); // Dashboard is not the initiator in terms of media stream (agent sends it)
    this.sendOffer(agentId); // Dashboard sends offer to agent to request stream
    console.log(`[WebRTC] Requesting stream from agent ${agentId}`);
  }

  // Dashboard specific: Stop streaming
  stopAgentStream() {
    this.cleanupWebRTC();
    console.log('[WebRTC] Stopped streaming from agent.');
  }
}

export const socketService = new SocketService();
```

<script type="text/plain" data-path="frontend/src/stores/missionStore.ts">
import { create } from 'zustand';
import { Device, MissionLog, Telemetry, OsintSearchResult } from '../types'; // Using re-exported types
import { SurveillanceAPI } from '../services/api/surveillance';
import { OsintAPI } from '../services/api/osint';
import { format } from 'date-fns';

/**
 * ZUSTAND GLOBAL STORE
 * Gerenciamento de estado reativo para o Dashboard de Controle.
 */

interface MissionState {
  // Data State
  devices: Device[];
  logs: MissionLog[];
  selectedDeviceId: string | null;
  selectedDeviceLogs: MissionLog[];
  currentOsintResults: OsintSearchResult[];
  
  // UI State
  isLoading: boolean;
  isOsintLoading: boolean;
  lastUpdated: Date;

  // Actions
  fetchAssets: () => Promise<void>;
  fetchDeviceSpecificLogs: (deviceId: string) => Promise<void>;
  selectDevice: (id: string | null) => void;
  performOsintSearch: (query: string) => Promise<void>;
  
  // Socket/Real-time Handlers
  handleAgentConnected: (payload: { deviceId: string; type: string }) => void;
  handleAgentDisconnected: (payload: { deviceId: string }) => void;
  handleTelemetryStream: (telemetry: Telemetry & { deviceId: string, timestamp: Date }) => void; // Telemetry from socket includes deviceId
}

export const useMissionStore = create<MissionState>((set, get) => ({
  devices: [],
  logs: [], // Global mission logs
  selectedDeviceId: null,
  selectedDeviceLogs: [], // Logs for the currently selected device
  currentOsintResults: [],
  isLoading: false,
  isOsintLoading: false,
  lastUpdated: new Date(),

  fetchAssets: async () => {
    set({ isLoading: true });
    try {
      const devices = await SurveillanceAPI.getDevices();
      set({ devices, isLoading: false, lastUpdated: new Date() });
    } catch (error) {
      console.error('[STORE] Failed to sync assets:', error);
      set({ isLoading: false });
    }
  },

  fetchDeviceSpecificLogs: async (deviceId: string) => {
    set({ isLoading: true });
    try {
      const logs = await SurveillanceAPI.getLogs(deviceId, 100);
      set({ selectedDeviceLogs: logs, isLoading: false });
    } catch (error) {
      console.error(`[STORE] Failed to fetch logs for device ${deviceId}:`, error);
      set({ isLoading: false });
    }
  },

  selectDevice: (id) => {
    set({ selectedDeviceId: id, selectedDeviceLogs: [] }); // Clear logs when selecting a new device
    if (id) {
      get().fetchDeviceSpecificLogs(id); // Fetch logs for selected device
    }
  },

  performOsintSearch: async (query: string) => {
    set({ isOsintLoading: true, currentOsintResults: [] });
    try {
      const results = await OsintAPI.search(query);
      set({ currentOsintResults: results, isOsintLoading: false });
    } catch (error) {
      console.error('[STORE] OSINT search failed:', error);
      set({ isOsintLoading: false, currentOsintResults: [] });
    }
  },

  // Socket Handlers
  handleAgentConnected: (payload) => {
    set((state) => {
      const existingDevice = state.devices.find(d => d.id === payload.deviceId);
      const newLogs = [{
        id: crypto.randomUUID(),
        deviceId: payload.deviceId,
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: `Agent ${existingDevice?.name || payload.deviceId.substring(0, 8)} connected. Status: ONLINE`
      }, ...state.logs].slice(0, 500); // Keep max 500 global logs

      return {
        devices: state.devices.map(d =>
          d.id === payload.deviceId ? { ...d, isOnline: true, updatedAt: new Date().toISOString() } : d
        ),
        logs: newLogs
      };
    });
  },

  handleAgentDisconnected: (payload) => {
    set((state) => {
      const existingDevice = state.devices.find(d => d.id === payload.deviceId);
      const newLogs = [{
        id: crypto.randomUUID(),
        deviceId: payload.deviceId,
        timestamp: new Date().toISOString(),
        level: 'WARN',
        message: `Agent ${existingDevice?.name || payload.deviceId.substring(0, 8)} disconnected. Status: OFFLINE`
      }, ...state.logs].slice(0, 500);

      return {
        devices: state.devices.map(d =>
          d.id === payload.deviceId ? { ...d, isOnline: false, updatedAt: new Date().toISOString() } : d
        ),
        logs: newLogs
      };
    });
  },

  handleTelemetryStream: (payload) => set((state) => {
    const updatedDevices = state.devices.map(d => {
      if (d.id === payload.deviceId) {
        const updates: Partial<Device> = {};
        if (payload.type === 'BATTERY' && payload.data.level !== undefined) {
          updates.lastBattery = Math.max(0, Math.min(100, payload.data.level));
        }
        if (payload.type === 'GPS' && payload.data.lat !== undefined && payload.data.lng !== undefined) {
          updates.lastLat = payload.data.lat;
          updates.lastLng = payload.data.lng;
        }
        if (payload.type === 'STATUS' && payload.data.online !== undefined) {
          updates.isOnline = payload.data.online;
        }
        return { ...d, ...updates, updatedAt: new Date().toISOString() };
      }
      return d;
    });

    const newLogs = [...state.logs];
    // Add significant telemetry updates to global logs
    if (payload.type === 'STATUS' || payload.type === 'NETWORK' || (payload.type === 'BATTERY' && payload.data.level !== undefined && payload.data.level < 20)) {
        newLogs.unshift({
            id: crypto.randomUUID(),
            deviceId: payload.deviceId,
            timestamp: new Date().toISOString(),
            level: (payload.type === 'BATTERY' && payload.data.level !== undefined && payload.data.level < 20) ? 'WARN' : 'INFO',
            message: `Telemetry from ${updatedDevices.find(d => d.id === payload.deviceId)?.name || payload.deviceId.substring(0,8)}: ${payload.type} - ${JSON.stringify(payload.data)}`
        });
    }

    // Also add to device-specific logs if the device is currently selected
    const newSelectedDeviceLogs = [...state.selectedDeviceLogs];
    if (state.selectedDeviceId === payload.deviceId) {
      newSelectedDeviceLogs.unshift({
        id: crypto.randomUUID(),
        deviceId: payload.deviceId,
        timestamp: new Date().toISOString(),
        level: (payload.type === 'BATTERY' && payload.data.level !== undefined && payload.data.level < 20) ? 'WARN' : 'INFO',
        message: `Telemetry: ${payload.type} - ${JSON.stringify(payload.data)}`
      });
    }


    return {
      devices: updatedDevices,
      logs: newLogs.slice(0, 500),
      selectedDeviceLogs: newSelectedDeviceLogs.slice(0, 100), // Keep last 100 for selected device
      lastUpdated: new Date()
    };
  })
}));
