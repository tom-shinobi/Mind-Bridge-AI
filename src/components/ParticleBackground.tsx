import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  currentAlpha: number;
  pulseSpeed: number;
  pulseAngle: number;
  color: string;
}

const PARTICLE_COLORS = [
  '56, 189, 248',  // Sky / Cyan
  '168, 85, 247', // Purple / Violet
  '244, 114, 182', // Rose / Pink
  '52, 211, 153',  // Emerald / Mint
  '251, 191, 36'   // Amber / Gold
];

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for gentle interactive repelling
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 140
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
    window.addEventListener('resize', handleResize);

    // Particle pool
    const count = Math.min(Math.floor((width * height) / 18000), 75);
    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < count; i++) {
        const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
        const baseAlpha = 0.25 + Math.random() * 0.45;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: 1.2 + Math.random() * 2.2,
          baseAlpha,
          currentAlpha: baseAlpha,
          pulseSpeed: 0.015 + Math.random() * 0.025,
          pulseAngle: Math.random() * Math.PI * 2,
          color
        });
      }
    };

    initParticles();

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw connecting web lines between nearby particles
      const maxDistance = 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.08;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 2. Update and draw particles with glowing halos
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Autonomous drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries smoothly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Subtle mouse dispersion
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * 0.8;
          p.x -= (dx / dist) * force;
          p.y -= (dy / dist) * force;
        }

        // Breathing / twinkling pulse
        p.pulseAngle += p.pulseSpeed;
        p.currentAlpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.15;

        // Glowing outer halo
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius * 3
        );
        gradient.addColorStop(0, `rgba(${p.color}, ${Math.max(0, p.currentAlpha)})`);
        gradient.addColorStop(0.5, `rgba(${p.color}, ${Math.max(0, p.currentAlpha * 0.3)})`);
        gradient.addColorStop(1, `rgba(${p.color}, 0)`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Sharp luminous core
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, p.currentAlpha + 0.2)})`;
        ctx.arc(p.x, p.y, p.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.95 }}
    />
  );
};
