/**
 * MindBridge AI - WebRTC Voice Call Service
 * Enables peer-to-peer live audio calls inside Direct Messages (DMs)
 * over WebSockets using the RTSC signaling protocol.
 */

import { webSocketService, type RtscSignalPayload } from './webSocketService';
import type { StudentProfile } from '../types';

export type CallStatus = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

export interface ActiveCallState {
  status: CallStatus;
  peerId: string;
  peerHandle: string;
  peerName: string;
  peerAvatar?: string;
  isInitiator: boolean;
  isMuted: boolean;
  durationSeconds: number;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

class VoiceCallService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteAudioEl: HTMLAudioElement | null = null;
  private currentCall: ActiveCallState = {
    status: 'idle',
    peerId: '',
    peerHandle: '',
    peerName: '',
    isInitiator: false,
    isMuted: false,
    durationSeconds: 0
  };

  private listeners: Set<(state: ActiveCallState) => void> = new Set();
  private durationTimer: any = null;
  private callTimeoutTimer: any = null;
  private ringtoneInterval: any = null;
  private audioCtx: AudioContext | null = null;
  private currentUserProfile: Partial<StudentProfile> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Ensure audio tag exists for remote playback
      this.remoteAudioEl = document.createElement('audio');
      this.remoteAudioEl.autoplay = true;
      (this.remoteAudioEl as any).playsInline = true;
      document.body.appendChild(this.remoteAudioEl);

      // Listen for incoming RTSC WebRTC voice signaling
      webSocketService.onRtscSignal((payload: RtscSignalPayload) => {
        this.handleIncomingSignal(payload);
      });
    }
  }

  public setCurrentUser(profile: Partial<StudentProfile>) {
    this.currentUserProfile = profile;
  }

  public getCallState(): ActiveCallState {
    return { ...this.currentCall };
  }

  public onCallStateChange(cb: (state: ActiveCallState) => void): () => void {
    this.listeners.add(cb);
    cb(this.getCallState());
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    const copy = this.getCallState();
    this.listeners.forEach((cb) => {
      try {
        cb(copy);
      } catch (e) {
        console.warn('Call state listener error:', e);
      }
    });
  }

  // =========================================================================
  // CALL CONTROLS: START, ACCEPT, DECLINE, END
  // =========================================================================

  public async startCall(
    peer: { id: string; handle: string; name: string; avatarUrl?: string },
    myProfile: StudentProfile
  ): Promise<boolean> {
    this.setCurrentUser(myProfile);

    // Prevent initiating call if already in one
    if (this.currentCall.status !== 'idle') return false;

    try {
      this.currentCall = {
        status: 'calling',
        peerId: peer.id,
        peerHandle: peer.handle || `@${peer.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        peerName: peer.name,
        peerAvatar: peer.avatarUrl,
        isInitiator: true,
        isMuted: false,
        durationSeconds: 0
      };
      this.notify();
      this.playOutgoingTone();

      // Acquire microphone
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      this.peerConnection = this.createPeerConnection(peer.id, peer.handle);

      // Add local audio tracks to peer connection
      this.localStream.getAudioTracks().forEach((track) => {
        if (this.localStream && this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Create offer SDP
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      await this.peerConnection.setLocalDescription(offer);

      // Send call offer via WebSocket RTSC
      webSocketService.sendRtscSignal(peer.id, {
        action: 'voice_offer',
        sdp: offer,
        callerId: myProfile.id,
        callerHandle: myProfile.handle || `@${myProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        callerName: myProfile.name,
        callerAvatar: myProfile.avatarUrl,
        targetHandle: peer.handle
      });

      // Timeout after 35s if no answer
      this.callTimeoutTimer = setTimeout(() => {
        if (this.currentCall.status === 'calling') {
          this.endCall('No answer');
        }
      }, 35000);

      return true;
    } catch (err: any) {
      console.error('Failed to start voice call:', err);
      this.stopRingtone();
      this.cleanup();
      this.currentCall.status = 'ended';
      this.notify();
      setTimeout(() => {
        this.currentCall.status = 'idle';
        this.notify();
      }, 1500);
      return false;
    }
  }

  public async acceptCall(myProfile: StudentProfile): Promise<boolean> {
    this.setCurrentUser(myProfile);
    if (this.currentCall.status !== 'incoming') return false;

    this.stopRingtone();

    try {
      // Acquire microphone
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      if (!this.peerConnection) {
        this.peerConnection = this.createPeerConnection(this.currentCall.peerId, this.currentCall.peerHandle);
      }

      this.localStream.getAudioTracks().forEach((track) => {
        if (this.localStream && this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // Send answer signal
      webSocketService.sendRtscSignal(this.currentCall.peerId, {
        action: 'voice_answer',
        sdp: answer,
        targetHandle: this.currentCall.peerHandle
      });

      this.currentCall.status = 'connected';
      this.startDurationTimer();
      this.notify();
      return true;
    } catch (err) {
      console.error('Failed to accept voice call:', err);
      this.endCall();
      return false;
    }
  }

  public declineCall() {
    if (this.currentCall.status === 'incoming') {
      webSocketService.sendRtscSignal(this.currentCall.peerId, {
        action: 'voice_declined',
        targetHandle: this.currentCall.peerHandle
      });
    }
    this.stopRingtone();
    this.cleanup();
    this.currentCall.status = 'ended';
    this.notify();
    setTimeout(() => {
      this.currentCall.status = 'idle';
      this.notify();
    }, 1200);
  }

  public endCall(_reason?: string) {
    if (this.currentCall.status !== 'idle') {
      webSocketService.sendRtscSignal(this.currentCall.peerId, {
        action: 'voice_ended',
        targetHandle: this.currentCall.peerHandle
      });
    }
    this.stopRingtone();
    this.cleanup();
    this.currentCall.status = 'ended';
    this.notify();
    setTimeout(() => {
      this.currentCall.status = 'idle';
      this.notify();
    }, 1200);
  }

  public toggleMute(): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.currentCall.isMuted = !audioTrack.enabled;
      this.notify();
      return this.currentCall.isMuted;
    }
    return false;
  }

  // =========================================================================
  // PEER CONNECTION & SIGNAL ROUTING
  // =========================================================================

  private createPeerConnection(peerId: string, peerHandle: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        webSocketService.sendRtscSignal(peerId, {
          action: 'voice_ice_candidate',
          candidate: event.candidate,
          targetHandle: peerHandle
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        if (this.remoteAudioEl) {
          this.remoteAudioEl.srcObject = event.streams[0];
          this.remoteAudioEl.play().catch(() => {});
        }
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        this.stopRingtone();
        this.currentCall.status = 'connected';
        this.startDurationTimer();
        this.notify();
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        this.endCall('Connection interrupted');
      }
    };

    return pc;
  }

  private async handleIncomingSignal(payload: RtscSignalPayload) {
    const signal = payload.signalData;
    if (!signal || !signal.action) return;

    // Check if this signal is meant for the current user
    const myHandle = this.currentUserProfile?.handle?.replace('@', '').toLowerCase();
    const targetHandle = (signal.targetHandle || '').replace('@', '').toLowerCase();

    if (targetHandle && myHandle && targetHandle !== myHandle) {
      // Not addressed to us
      return;
    }

    switch (signal.action) {
      case 'voice_offer': {
        if (this.currentCall.status !== 'idle') {
          // Already in a call - send busy signal
          webSocketService.sendRtscSignal(signal.callerId, {
            action: 'voice_busy',
            targetHandle: signal.callerHandle
          });
          return;
        }

        this.currentCall = {
          status: 'incoming',
          peerId: signal.callerId,
          peerHandle: signal.callerHandle || '@scholar',
          peerName: signal.callerName || 'Campus Scholar',
          peerAvatar: signal.callerAvatar,
          isInitiator: false,
          isMuted: false,
          durationSeconds: 0
        };
        this.notify();
        this.playIncomingTone();

        // Prepare Peer Connection with remote offer SDP
        this.peerConnection = this.createPeerConnection(signal.callerId, signal.callerHandle);
        try {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        } catch (e) {
          console.warn('Error setting remote description:', e);
        }
        break;
      }

      case 'voice_answer': {
        if (this.currentCall.status === 'calling' && this.peerConnection) {
          try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            this.stopRingtone();
            this.currentCall.status = 'connected';
            this.startDurationTimer();
            this.notify();
          } catch (e) {
            console.warn('Error setting answer SDP:', e);
          }
        }
        break;
      }

      case 'voice_ice_candidate': {
        if (this.peerConnection && signal.candidate) {
          try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } catch (e) {
            console.warn('Error adding ICE candidate:', e);
          }
        }
        break;
      }

      case 'voice_declined':
      case 'voice_busy': {
        if (this.currentCall.status === 'calling') {
          this.playBusyTone();
          this.endCall('Declined');
        }
        break;
      }

      case 'voice_ended': {
        if (this.currentCall.status !== 'idle') {
          this.cleanup();
          this.currentCall.status = 'ended';
          this.notify();
          setTimeout(() => {
            this.currentCall.status = 'idle';
            this.notify();
          }, 1200);
        }
        break;
      }
    }
  }

  // =========================================================================
  // TIMERS & CLEANUP
  // =========================================================================

  private startDurationTimer() {
    if (this.durationTimer) clearInterval(this.durationTimer);
    this.currentCall.durationSeconds = 0;
    this.durationTimer = setInterval(() => {
      this.currentCall.durationSeconds++;
      this.notify();
    }, 1000);
  }

  private cleanup() {
    if (this.callTimeoutTimer) {
      clearTimeout(this.callTimeoutTimer);
      this.callTimeoutTimer = null;
    }
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch {}
      this.peerConnection = null;
    }
    if (this.remoteAudioEl) {
      this.remoteAudioEl.srcObject = null;
    }
  }

  // =========================================================================
  // WEB AUDIO SYNTHESIZED RINGTONES (ZERO EXTERNAL ASSETS NEEDED)
  // =========================================================================

  private getAudioContext(): AudioContext | null {
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  private playOutgoingTone() {
    this.stopRingtone();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const playBeep = () => {
      try {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.frequency.setValueAtTime(440, ctx.currentTime);
        osc2.frequency.setValueAtTime(480, ctx.currentTime);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 1.6);
        osc2.stop(ctx.currentTime + 1.6);
      } catch {}
    };

    playBeep();
    this.ringtoneInterval = setInterval(playBeep, 3500);
  }

  private playIncomingTone() {
    this.stopRingtone();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const playChime = () => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
      } catch {}
    };

    playChime();
    this.ringtoneInterval = setInterval(playChime, 2000);
  }

  private playBusyTone() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }

  private stopRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }
}

export const voiceCallService = new VoiceCallService();
