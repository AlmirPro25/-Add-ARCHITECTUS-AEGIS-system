
import { z } from 'zod';
// Import and re-export all shared types and schemas to avoid duplication
export * from '../../../shared/types';
import { Device, MissionLog, Telemetry, OsintSearchResult, AuthResponse } from '../../../shared/types'; // Import for local interface extensions

// Frontend-specific WebRTC Signaling Types
export interface RTCOfferPayload {
  senderId: string;
  offer: RTCSessionDescriptionInit;
}

export interface RTCAnswerPayload {
  senderId: string;
  answer: RTCSessionDescriptionInit;
}

export interface RTCCandidatePayload {
  senderId: string;
  candidate: RTCIceCandidateInit;
}

// Re-declare or extend types if there are frontend-specific additions
// For this project, the shared types are comprehensive enough, so direct re-export is ideal.
// The previous explicit interfaces (Device, MissionLog, etc.) are now implicitly covered by `export *`.
// The only remaining specific types here are the WebRTC payloads which are not shared via Zod schemas.
