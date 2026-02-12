
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken, TokenPayload } from './utils/jwt';
import { TelemetryService } from './services/telemetry.service';
import { DeviceService } from './services/device.service';
import { Logger } from './utils/logger';
import { TelemetrySchema } from './models/schemas'; // Import schema for validation

const telemetryService = new TelemetryService();
const deviceService = new DeviceService();

export const initializeSocketIO = (io: SocketIOServer) => {
  // Middleware for Socket Auth
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) {
      Logger.warn('Socket connection denied: No token provided.');
      return next(new Error('Authentication error: Token missing.'));
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      Logger.warn('Socket connection denied: Invalid or expired token.', { ip: socket.handshake.address });
      return next(new Error('Authentication error: Invalid token.'));
    }
    
    socket.data.user = payload;
    next();
  });

  io.on('connection', async (socket: Socket) => {
    const { deviceId, type } = socket.data.user as TokenPayload;
    
    Logger.tactical(`Socket Connection: ${deviceId} [${type}]`);

    let isAgent = false;
    // Determine client type and join appropriate rooms
    if (['WEB_AGENT', 'ANDROID', 'IOS'].includes(type)) {
      socket.join('field-agents'); // Agents send data
      io.to('mission-control').emit('agent_connected', { deviceId, type }); // Notify dashboard
      await deviceService.updateStatus(deviceId, true);
      isAgent = true;
    } else if (type === 'MISSION_CONTROL') { // Explicit type for dashboard
      socket.join('mission-control'); // Dashboard receives data
      // Mission control doesn't need status update on connect as it's not a 'field device'
    } else {
      Logger.warn(`Unknown device type "${type}" connected to socket. Joining mission-control as default.`);
      socket.join('mission-control'); // Fallback for unknown types
    }
    
    // --- Telemetry Handling ---
    socket.on('telemetry', async (payload) => {
      // Only agents should emit raw telemetry for storage
      if (!isAgent) {
        Logger.warn(`Non-agent client (${deviceId}) attempted to send telemetry.`);
        socket.emit('error', 'Unauthorized: Only field agents can send telemetry data.');
        return;
      }

      try {
        // Validate incoming telemetry payload
        const parsedPayload = TelemetrySchema.parse(payload);
        
        await telemetryService.processTelemetry(deviceId, parsedPayload.type, parsedPayload.data);
        
        // Relay to dashboard immediately, including the deviceId
        io.to('mission-control').emit('telemetry_update', {
          deviceId,
          type: parsedPayload.type,
          data: parsedPayload.data,
          timestamp: new Date()
        });
      } catch (err) {
        Logger.error(`Telemetry processing/validation error from ${deviceId}`, err);
        socket.emit('error', 'Failed to process telemetry due to invalid data.');
      }
    });

    // --- WebRTC Signaling Handling ---
    // These events forward WebRTC negotiation messages between two specific sockets
    socket.on('webrtc_offer', (targetDeviceId: string, offer: RTCSessionDescriptionInit) => {
      Logger.info(`WebRTC Offer from ${deviceId} to ${targetDeviceId}`);
      // Find the socket of the target device in the mission-control room
      const targetSocket = Array.from(io.sockets.sockets.values()).find(s => s.data.user?.deviceId === targetDeviceId);
      if (targetSocket) {
        targetSocket.emit('webrtc_offer', deviceId, offer); // Forward offer to target
      } else {
        Logger.warn(`WebRTC Offer: Target device ${targetDeviceId} not found for offer from ${deviceId}.`);
      }
    });

    socket.on('webrtc_answer', (targetDeviceId: string, answer: RTCSessionDescriptionInit) => {
      Logger.info(`WebRTC Answer from ${deviceId} to ${targetDeviceId}`);
      const targetSocket = Array.from(io.sockets.sockets.values()).find(s => s.data.user?.deviceId === targetDeviceId);
      if (targetSocket) {
        targetSocket.emit('webrtc_answer', deviceId, answer); // Forward answer to target
      } else {
        Logger.warn(`WebRTC Answer: Target device ${targetDeviceId} not found for answer from ${deviceId}.`);
      }
    });

    socket.on('webrtc_candidate', (targetDeviceId: string, candidate: RTCIceCandidateInit) => {
      Logger.info(`WebRTC ICE Candidate from ${deviceId} to ${targetDeviceId}`);
      const targetSocket = Array.from(io.sockets.sockets.values()).find(s => s.data.user?.deviceId === targetDeviceId);
      if (targetSocket) {
        targetSocket.emit('webrtc_candidate', deviceId, candidate); // Forward candidate to target
      } else {
        Logger.warn(`WebRTC ICE Candidate: Target device ${targetDeviceId} not found for candidate from ${deviceId}.`);
      }
    });

    // --- Disconnect Handling ---
    socket.on('disconnect', async () => {
      Logger.tactical(`Socket Disconnect: ${deviceId}`);
      if (isAgent) { // Only update status for field agents
        await deviceService.updateStatus(deviceId, false);
        io.to('mission-control').emit('agent_disconnected', { deviceId }); // Notify dashboard
      }
    });
  });
};
