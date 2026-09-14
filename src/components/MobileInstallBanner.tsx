import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare } from 'lucide-react';
import { sound } from '../services/soundService';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const MobileInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);

  useEffect(() => {
    // Detect if already installed / running in standalone PWA mode
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isRunningStandalone) {
      setIsStandalone(true);
      return;
    }

    // Check if user dismissed recently
    const dismissed = localStorage.getItem('mba_pwa_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 1000 * 60 * 60 * 24 * 3) {
      return; // don't nag for 3 days
    }

    // Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isAppleMobile);

    // Listen for Chrome / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS, show after a brief delay
    if (isAppleMobile) {
      const timer = setTimeout(() => setShowBanner(true), 3500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    sound.playClick();
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    sound.playClick();
    setShowBanner(false);
    setShowIOSModal(false);
    localStorage.setItem('mba_pwa_dismissed', Date.now().toString());
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Floating Bottom Quick Install Pill */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[92%] sm:w-auto animate-bounce-subtle">
        <div className="bg-[#0b0f19]/90 border border-purple-500/40 backdrop-blur-xl px-4 py-2.5 rounded-full shadow-2xl flex items-center justify-between gap-3 text-slate-200 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <Smartphone className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="truncate">
              <p className="font-semibold text-white truncate">Install Horizon AI App</p>
              <p className="text-[10px] text-purple-300/80 truncate">Instant home screen access & offline study</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md active:scale-95 transition-all text-xs"
            >
              <Download className="w-3 h-3" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Instructions Sheet */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#0d111d] border border-white/20 rounded-2xl max-w-md w-full p-5 space-y-4 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-white text-sm">Add Horizon AI to iPhone / iPad</h3>
              </div>
              <button onClick={() => setShowIOSModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-bold flex-shrink-0">1</span>
                <span>Tap the Safari <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline text-cyan-400 mx-1" /> at the bottom of the screen.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-bold flex-shrink-0">2</span>
                <span>Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-purple-400 mx-1" />.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-bold flex-shrink-0">3</span>
                <span>Tap <strong>Add</strong> in the top-right corner to launch Horizon AI as a standalone app!</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 rounded-xl text-xs transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
