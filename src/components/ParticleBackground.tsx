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

import type { AtmosphereTheme } from '../types';

interface ParticleProps {
  theme?: AtmosphereTheme;
}

const THEME_PARTICLE_COLORS: Record<AtmosphereTheme, string[]> = {
  dusk: [
    '251, 191, 36',  // Amber Gold
    '251, 146, 60',  // Solar Tangerine
    '244, 63, 94',   // Sunset Rose
    '192, 132, 252', // Twilight Violet
    '254, 215, 170', // Sunbeam Peach
    '239, 68, 68'    // Crimson Flare
  ],
  nebula: [
    '56, 189, 248',  // Electric Sky Cyan
    '168, 85, 247',  // Deep Violet
    '244, 114, 182', // Neon Pink
    '52, 211, 153',  // Emerald Mint
    '129, 140, 248'  // Indigo
  ],
  cyberpunk: [
    '34, 197, 94',   // Neon Matrix Green
    '163, 230, 53',  // Toxic Lime
    '6, 182, 212',   // Cyber Cyan
    '16, 185, 129',  // Electric Emerald
    '234, 179, 8'    // Acid Yellow
  ],
  supernova: [
    '239, 68, 68',   // Fiery Crimson
    '249, 115, 22',  // Blaze Orange
    '245, 158, 11',  // Supernova Gold
    '225, 29, 72',   // Ruby Flare
    '253, 224, 71'   // Solar Flare White-Yellow
  ],
  ocean_abyss: [
    '6, 182, 212',   // Bioluminescent Aqua
    '59, 130, 246',  // Sapphire Cobalt
    '20, 184, 166',  // Deep Teal
    '56, 189, 248',  // Cayman Sky
    '14, 165, 233'   // Ocean Azure
  ],
  cherry_blossom: [
    '244, 63, 94',   // Sakura Rose
    '236, 72, 153',  // Neon Hot Pink
    '251, 113, 133', // Blossom Coral
    '192, 132, 252', // Lilac Twilight
    '255, 228, 230'  // White Petal
  ],
  aurora_borealis: [
    '52, 211, 153',  // Arctic Mint
    '34, 211, 238',  // Glacial Cyan
    '16, 185, 129',  // Nordic Jade
    '45, 212, 191',  // Shimmering Teal
    '204, 251, 241'  // Frost White
  ],
  royal_amethyst: [
    '168, 85, 247',  // Royal Amethyst
    '192, 132, 252', // Electric Lavender
    '147, 51, 234',  // Imperial Purple
    '129, 140, 248', // Starlight Indigo
    '232, 121, 249'  // Fuchsia Crystal
  ],
  electric_amber: [
    '245, 158, 11',  // Pure Honey Amber
    '234, 179, 8',   // Molten Gold
    '252, 211, 77',  // Sunburst Yellow
    '217, 119, 6',   // Warm Copper
    '251, 146, 60'   // Tangerine
  ],
  midnight_synthwave: [
    '217, 70, 239',  // Laser Fuchsia
    '59, 130, 246',  // Synthwave Blue
    '168, 85, 247',  // Neon Violet
    '244, 63, 94',   // Retro Coral
    '34, 211, 238'   // Laser Cyan
  ]
};

export const ParticleBackground: React.FC<ParticleProps> = ({ theme = 'dusk' }) => {
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

    // Particle pool with higher density and vibrant opacity
    const count = Math.min(Math.floor((width * height) / 14000), 85);
    let particles: Particle[] = [];
    const activePalette = THEME_PARTICLE_COLORS[theme] || THEME_PARTICLE_COLORS.dusk;

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < count; i++) {
        const color = activePalette[Math.floor(Math.random() * activePalette.length)];
        const baseAlpha = 0.35 + Math.random() * 0.5;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.38,
          vy: (Math.random() - 0.5) * 0.38,
          radius: 1.4 + Math.random() * 2.4,
          baseAlpha,
          currentAlpha: baseAlpha,
          pulseSpeed: 0.015 + Math.random() * 0.03,
          pulseAngle: Math.random() * Math.PI * 2,
          color
        });
      }
    };

    initParticles();

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw connecting web lines between nearby particles with matching colors
      const maxDistance = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.16;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${p1.color}, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 2. Update and draw particles with glowing halos & luminous cores
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
          const force = (1 - dist / mouse.radius) * 0.85;
          p.x -= (dx / dist) * force;
          p.y -= (dy / dist) * force;
        }

        // Breathing / twinkling pulse
        p.pulseAngle += p.pulseSpeed;
        p.currentAlpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.2;

        // Glowing outer halo in full theme hue
        const haloRadius = p.radius * 4;
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          haloRadius
        );
        gradient.addColorStop(0, `rgba(${p.color}, ${Math.max(0, p.currentAlpha)})`);
        gradient.addColorStop(0.4, `rgba(${p.color}, ${Math.max(0, p.currentAlpha * 0.45)})`);
        gradient.addColorStop(1, `rgba(${p.color}, 0)`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, haloRadius, 0, Math.PI * 2);
        ctx.fill();

        // Vivid colored luminous core
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color}, ${Math.min(1, p.currentAlpha + 0.3)})`;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // White specular center spark
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, p.currentAlpha * 0.85)})`;
        ctx.arc(p.x, p.y, p.radius * 0.45, 0, Math.PI * 2);
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
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.95 }}
    />
  );
};
