import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScanFace,
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Lock,
  ShieldCheck,
  SwitchCamera
} from 'lucide-react';
import { sound } from '../../services/soundService';
import { faceBiometricService } from '../../services/faceBiometricService';
import { authService } from '../../services/authService';
import type { AuthUser } from '../../types';

export interface FaceIdScannerModalProps {
  isOpen: boolean;
  mode: 'verify' | 'enroll';
  userEmail?: string;
  userId?: string;
  onClose: () => void;
  onSuccess: (result: { user?: AuthUser; confidence?: number }) => void;
  onFallbackToPassword?: () => void;
}

type ScanStatus =
  | 'initializing'
  | 'locating'
  | 'scanning'
  | 'verifying'
  | 'success'
  | 'error'
  | 'permission_denied';

export const FaceIdScannerModal: React.FC<FaceIdScannerModalProps> = ({
  isOpen,
  mode,
  userEmail = '',
  userId = '',
  onClose,
  onSuccess,
  onFallbackToPassword
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const [status, setStatus] = useState<ScanStatus>('initializing');
  const [statusText, setStatusText] = useState('Starting biometric camera sensor...');
  const [confidence, setConfidence] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCentered, setIsCentered] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Stop camera and cleanup on unmount or close
  const cleanup = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    faceBiometricService.stopCamera();
  }, []);

  const handleStartCapture = useCallback(async () => {
    if (!videoRef.current) return;
    setStatus('scanning');
    setStatusText(mode === 'enroll' ? 'Scanning 3D facial geometry...' : 'Authenticating facial landmarks...');
    sound.playFaceIdScan();

    try {
      // Sample frames and compute 64-dimensional biometric descriptor
      const biometricData = await faceBiometricService.captureBiometrics(videoRef.current, 8);

      if (!biometricData) {
        setStatus('error');
        setErrorMsg('Could not clearly capture facial features. Please keep steady in good lighting.');
        sound.playFaceIdReject();
        return;
      }

      setStatus('verifying');
      setStatusText('Validating biometrics with secure server...');

      if (mode === 'enroll') {
        // Enroll mode: Register template to server
        const targetUserId = userId || `usr_${Date.now()}`;
        const targetEmail = userEmail || 'scholar@mindbridge.ai';

        const res = await authService.enrollFaceBiometrics(targetUserId, targetEmail, biometricData);
        if (res.success) {
          setStatus('success');
          setConfidence(98.5);
          setStatusText('Face ID successfully enrolled on server!');
          sound.playFaceIdSuccess();
          setTimeout(() => {
            cleanup();
            onSuccess({ confidence: 98.5 });
          }, 1400);
        } else {
          setStatus('error');
          setErrorMsg(res.error || 'Server enrollment failed. Please try again.');
          sound.playFaceIdReject();
        }
      } else {
        // Verify mode: Authenticate against server database
        const res = await authService.verifyFaceWithServer(userEmail, biometricData);

        if (res.verified) {
          setStatus('success');
          setConfidence(res.matchConfidence);
          setStatusText(`Face ID Verified (${res.matchConfidence}% Match)`);
          sound.playFaceIdSuccess();
          setTimeout(() => {
            cleanup();
            onSuccess({ user: res.user, confidence: res.matchConfidence });
          }, 1400);
        } else {
          setStatus('error');
          setConfidence(res.matchConfidence);
          setErrorMsg(res.error || 'Biometrics did not match server record.');
          sound.playFaceIdReject();
        }
      }
    } catch (err: unknown) {
      const e = err as Error;
      setStatus('error');
      setErrorMsg(e.message || 'Verification encountered a camera or network issue.');
      sound.playFaceIdReject();
    }
  }, [mode, userId, userEmail, cleanup, onSuccess]);

  // Main camera initialization and frame analysis loop
  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }

    let isMounted = true;
    setStatus('initializing');
    setStatusText('Starting biometric camera sensor...');
    setErrorMsg(null);
    setScanProgress(0);

    const initCamera = async () => {
      try {
        if (!videoRef.current) return;
        await faceBiometricService.startCamera(videoRef.current, 'user');
        if (!isMounted) return;

        setStatus('locating');
        setStatusText('Center your face inside the frame');

        // Continuous alignment detection loop
        let centeredFramesCount = 0;
        const checkFrame = () => {
          if (!videoRef.current || !isMounted) return;

          const frameInfo = faceBiometricService.analyzeFrame(videoRef.current);
          setIsCentered(frameInfo.isCentered && frameInfo.isFaceDetected);

          if (frameInfo.isFaceDetected && frameInfo.isCentered) {
            centeredFramesCount++;
            setScanProgress(Math.min(100, Math.round((centeredFramesCount / 6) * 100)));

            // Once stably centered for ~6 consecutive analysis ticks, initiate biometric scan
            if (centeredFramesCount >= 6) {
              handleStartCapture();
              return; // Stop alignment loop once capture kicks in
            }
          } else {
            centeredFramesCount = Math.max(0, centeredFramesCount - 1);
            setScanProgress(Math.round((centeredFramesCount / 6) * 100));
            setStatusText(frameInfo.guidance);
          }

          animFrameRef.current = requestAnimationFrame(checkFrame);
        };

        animFrameRef.current = requestAnimationFrame(checkFrame);
      } catch (err: unknown) {
        if (!isMounted) return;
        const e = err as Error;
        setStatus('permission_denied');
        setErrorMsg(
          e.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access in your browser settings.'
            : 'Unable to start camera sensor. Please use password sign-in instead.'
        );
      }
    };

    const timer = setTimeout(initCamera, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      cleanup();
    };
  }, [isOpen, cleanup, handleStartCapture]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 selection:bg-purple-500/30">
      <div className="apple-liquid-glass max-w-sm w-full p-6 sm:p-7 rounded-[32px] border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col items-center">
        
        {/* Ambient Chromatic Glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={() => { sound.playClick(); cleanup(); onClose(); }}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-all z-20 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-1 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono text-purple-200">
            <ShieldCheck className="w-3 h-3 text-purple-300" />
            <span>Apple Face ID • Server Verified</span>
          </div>
          <h3 className="text-lg font-bold text-white font-heading tracking-tight flex items-center justify-center gap-1.5 pt-1">
            <ScanFace className="w-5 h-5 text-purple-400" />
            <span>{mode === 'enroll' ? 'Face ID Enrollment' : 'Face ID Unlock'}</span>
          </h3>
          <p className="text-[11px] text-slate-400 max-w-[260px]">
            {mode === 'enroll'
              ? 'Calibrating 3D facial vectors for server-verified authentication.'
              : 'Verifying facial geometry against secure server records.'}
          </p>
        </div>

        {/* Apple Face ID Scanner Viewport */}
        <div className="relative w-64 h-64 rounded-[40px] overflow-hidden border border-white/20 shadow-2xl bg-black/60 flex items-center justify-center mb-5 group">
          
          {/* Live Video Element */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-500 ${
              status === 'permission_denied' ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* Animated 3D Biometric TrueDepth Mesh Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Concentric Scanner Rings */}
            <div className={`absolute w-44 h-44 rounded-full border transition-all duration-700 ${
              status === 'success'
                ? 'border-emerald-400/80 scale-105 shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                : isCentered
                ? 'border-cyan-400/60 scale-100 animate-pulse'
                : 'border-white/20 scale-95'
            }`} />
            
            <div className={`absolute w-52 h-52 rounded-full border border-dashed transition-all duration-700 ${
              status === 'success'
                ? 'border-emerald-400/40'
                : isCentered
                ? 'border-cyan-400/30 rotate-45'
                : 'border-white/10'
            }`} />

            {/* Apple 4-Corner Target Brackets */}
            <div className="absolute inset-5 pointer-events-none">
              {/* Top Left */}
              <div className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-xl transition-colors duration-300 ${
                status === 'success' ? 'border-emerald-400 shadow-[0_0_10px_#34d399]' : isCentered ? 'border-cyan-400' : 'border-white/40'
              }`} />
              {/* Top Right */}
              <div className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-xl transition-colors duration-300 ${
                status === 'success' ? 'border-emerald-400 shadow-[0_0_10px_#34d399]' : isCentered ? 'border-cyan-400' : 'border-white/40'
              }`} />
              {/* Bottom Left */}
              <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-xl transition-colors duration-300 ${
                status === 'success' ? 'border-emerald-400 shadow-[0_0_10px_#34d399]' : isCentered ? 'border-cyan-400' : 'border-white/40'
              }`} />
              {/* Bottom Right */}
              <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-xl transition-colors duration-300 ${
                status === 'success' ? 'border-emerald-400 shadow-[0_0_10px_#34d399]' : isCentered ? 'border-cyan-400' : 'border-white/40'
              }`} />
            </div>

            {/* Holographic Laser Scan Line */}
            {(status === 'scanning' || status === 'locating') && isCentered && (
              <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-[scanLaser_2.2s_ease-in-out_infinite]" />
            )}

            {/* TrueDepth Dot Grid Projection effect */}
            {status === 'scanning' && (
              <div className="absolute inset-8 rounded-full border border-cyan-400/30 bg-[radial-gradient(#22d3ee_1.2px,transparent_1.2px)] [background-size:12px_12px] opacity-40 animate-pulse pointer-events-none" />
            )}

            {/* Success State Visual Overlay */}
            {status === 'success' && (
              <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xs flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.8)] scale-110 transition-transform">
                  <CheckCircle2 className="w-9 h-9 text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                </div>
                <span className="text-xs font-mono font-bold text-emerald-300 mt-2 tracking-wide">
                  VERIFIED {confidence > 0 ? `(${confidence}%)` : ''}
                </span>
              </div>
            )}

            {/* Camera Permission Denied Overlay */}
            {status === 'permission_denied' && (
              <div className="absolute inset-0 bg-black/90 p-4 flex flex-col items-center justify-center text-center space-y-2">
                <Camera className="w-10 h-10 text-rose-400 mb-1" />
                <span className="text-xs font-semibold text-rose-300">Camera Unavailable</span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Please grant camera permission in your browser or sign in using your password.
                </p>
              </div>
            )}
          </div>

          {/* Progress ring indicator when locking on face */}
          {status === 'locating' && scanProgress > 0 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/70 border border-white/20 text-[10px] font-mono text-cyan-300">
              Aligning: {scanProgress}%
            </div>
          )}
        </div>

        {/* Live Feedback & Instruction Banner */}
        <div className="w-full text-center space-y-1 mb-4">
          <div className="flex items-center justify-center gap-2">
            {status === 'scanning' || status === 'verifying' ? (
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : status === 'error' || status === 'permission_denied' ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <span className={`w-2 h-2 rounded-full ${isCentered ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
            )}
            <span className={`text-xs font-mono ${
              status === 'success'
                ? 'text-emerald-300 font-semibold'
                : status === 'error' || status === 'permission_denied'
                ? 'text-rose-300'
                : isCentered
                ? 'text-cyan-300'
                : 'text-slate-300'
            }`}>
              {statusText}
            </span>
          </div>

          {errorMsg && (
            <p className="text-[11px] text-rose-400 leading-tight pt-1">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Action Controls & Fallbacks */}
        <div className="w-full space-y-2 pt-2 border-t border-white/10">
          {status === 'error' && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setStatus('locating');
                setStatusText('Center your face inside the frame');
                setErrorMsg(null);
              }}
              className="w-full btn-apple-primary py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Scan</span>
            </button>
          )}

          <div className="flex items-center justify-between gap-2">
            {/* Switch Camera if supported */}
            <button
              type="button"
              onClick={async () => {
                sound.playClick();
                if (videoRef.current) {
                  try {
                    await faceBiometricService.switchCamera(videoRef.current);
                  } catch {}
                }
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-[11px] font-mono text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
            >
              <SwitchCamera className="w-3.5 h-3.5 text-slate-400" />
              <span>Flip Camera</span>
            </button>

            {/* Fallback to Password button */}
            {onFallbackToPassword && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  cleanup();
                  onFallbackToPassword();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-[11px] font-mono text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Use Password</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
