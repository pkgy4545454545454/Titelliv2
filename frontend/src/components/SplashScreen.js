import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [logoScale, setLogoScale] = useState(0.5);

  // 3 second splash screen
  const SPLASH_DURATION = 3000;
  const PROGRESS_INTERVAL = SPLASH_DURATION / 100;

  useEffect(() => {
    // Logo zoom animation
    const zoomTimeout = setTimeout(() => {
      setLogoScale(1);
    }, 100);

    // Progress bar animation (3 seconds)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, PROGRESS_INTERVAL);

    // Complete after 3 seconds
    const completeTimeout = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, SPLASH_DURATION);

    return () => {
      clearTimeout(zoomTimeout);
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div 
      className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'opacity 0.5s ease-out',
        opacity: fadeOut ? 0 : 1,
      }}
    >
      {/* Background glow */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(0,71,171,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'breathe 2s ease-in-out infinite',
        }}
      />

      {/* Logo only - zoom effect */}
      <div 
        style={{
          marginBottom: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${logoScale})`,
          transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <img 
          src="/logo_titelli.png" 
          alt="Titelli"
          style={{
            width: '150px',
            height: '150px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 30px rgba(212, 175, 55, 0.4))',
          }}
        />
      </div>

      {/* Loading bar */}
      <div 
        style={{
          width: '250px',
          maxWidth: '70%',
        }}
      >
        <div 
          style={{
            height: '3px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div 
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #0047AB 0%, #D4AF37 50%, #0047AB 100%)',
              backgroundSize: '200% 100%',
              animation: 'gradient-shift 2s linear infinite',
              borderRadius: '3px',
              transition: 'width 0.1s linear',
              boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
            }}
          />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .splash-screen.fade-out {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
