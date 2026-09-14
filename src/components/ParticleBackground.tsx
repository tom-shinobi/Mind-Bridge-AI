import React, { useEffect, useRef } from 'react';
import type { AtmosphereTheme } from '../types';

interface ParticleProps {
  theme?: AtmosphereTheme;
}

const THEME_PARTICLE_COLORS: Record<AtmosphereTheme, string[]> = {
  surrealist_editorial: [
    '226, 249, 82',  // Neon Acid Lime (#E2F952)
    '255, 255, 230', // Cream Paper White
    '34, 197, 94',   // Lush Botanical Green
    '255, 133, 161', // Velvet Peach Rose
    '254, 240, 138'  // Warm Sunlight Gold
  ],
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

interface StardustMote {
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

interface MetaphysicalOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  pulseAngle: number;
  pulseSpeed: number;
  depth: number;
}

interface AtmosphericCloud {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

export const ParticleBackground: React.FC<ParticleProps> = ({ theme = 'surrealist_editorial' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for gentle gravitational lensing
    const mouse = {
      x: -2000,
      y: -2000,
      targetX: -2000,
      targetY: -2000,
      radius: 200
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -2000;
      mouse.targetY = -2000;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      mouse.targetX = -2000;
      mouse.targetY = -2000;
    };

    let stardust: StardustMote[] = [];
    let orbs: MetaphysicalOrb[] = [];
    let clouds: AtmosphericCloud[] = [];

    const activePalette = THEME_PARTICLE_COLORS[theme] || THEME_PARTICLE_COLORS.surrealist_editorial;

    const initEntities = () => {
      // 1. Metaphysical Celestial Spheres (Inspired by Giorgio de Chirico & René Magritte)
      const orbCount = Math.max(4, Math.min(Math.floor(width / 220), 8));
      orbs = [];
      for (let i = 0; i < orbCount; i++) {
        const color = activePalette[i % activePalette.length];
        const nextColor = activePalette[(i + 1) % activePalette.length];
        const radius = 14 + Math.random() * 26; // 14px to 40px
        orbs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18, // Slow, serene cosmic drift
          vy: (Math.random() - 0.5) * 0.18,
          radius,
          color,
          glowColor: nextColor,
          pulseAngle: Math.random() * Math.PI * 2,
          pulseSpeed: 0.008 + Math.random() * 0.012,
          depth: 0.4 + Math.random() * 0.6
        });
      }

      // 2. Drifting Celestial Stardust Motes
      const moteCount = Math.min(Math.floor((width * height) / 12000), 75);
      stardust = [];
      for (let i = 0; i < moteCount; i++) {
        const color = activePalette[Math.floor(Math.random() * activePalette.length)];
        const baseAlpha = 0.25 + Math.random() * 0.5;
        stardust.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          radius: 1.0 + Math.random() * 2.2,
          baseAlpha,
          currentAlpha: baseAlpha,
          pulseSpeed: 0.012 + Math.random() * 0.024,
          pulseAngle: Math.random() * Math.PI * 2,
          color
        });
      }

      // 3. Surrealist Atmospheric Mist & Twilight Clouds
      clouds = [
        {
          x: width * 0.25,
          y: height * 0.35,
          vx: 0.05,
          vy: -0.02,
          radius: Math.min(width, height) * 0.45,
          color: activePalette[0],
          alpha: 0.045
        },
        {
          x: width * 0.75,
          y: height * 0.65,
          vx: -0.04,
          vy: 0.03,
          radius: Math.min(width, height) * 0.5,
          color: activePalette[1 % activePalette.length],
          alpha: 0.04
        }
      ];
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initEntities();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
    window.addEventListener('resize', handleResize);

    initEntities();

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // 1. Draw Subtle Atmospheric Twilight Clouds (Metaphysical Depth)
      for (const cloud of clouds) {
        cloud.x += cloud.vx;
        cloud.y += cloud.vy;
        if (cloud.x < -cloud.radius) cloud.x = width + cloud.radius;
        if (cloud.x > width + cloud.radius) cloud.x = -cloud.radius;
        if (cloud.y < -cloud.radius) cloud.y = height + cloud.radius;
        if (cloud.y > height + cloud.radius) cloud.y = -cloud.radius;

        const grad = ctx.createRadialGradient(
          cloud.x,
          cloud.y,
          0,
          cloud.x,
          cloud.y,
          cloud.radius
        );
        grad.addColorStop(0, `rgba(${cloud.color}, ${cloud.alpha})`);
        grad.addColorStop(0.5, `rgba(${cloud.color}, ${cloud.alpha * 0.4})`);
        grad.addColorStop(1, `rgba(${cloud.color}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Floating Metaphysical Spheres / Orbs (Surrealism signature)
      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Wrap around borders seamlessly
        const margin = orb.radius * 2;
        if (orb.x < -margin) orb.x = width + margin;
        if (orb.x > width + margin) orb.x = -margin;
        if (orb.y < -margin) orb.y = height + margin;
        if (orb.y > height + margin) orb.y = -margin;

        // Subtle gravitational curvature around mouse cursor
        const dx = mouse.x - orb.x;
        const dy = mouse.y - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius * 1.5 && dist > 10) {
          const force = (1 - dist / (mouse.radius * 1.5)) * 0.4;
          orb.x -= (dx / dist) * force;
          orb.y -= (dy / dist) * force;
        }

        orb.pulseAngle += orb.pulseSpeed;
        const scale = 1 + Math.sin(orb.pulseAngle) * 0.05;
        const currentR = orb.radius * scale;

        // Ethereal Outer Glow Corona
        const glowRadius = currentR * 2.6;
        const auraGrad = ctx.createRadialGradient(
          orb.x,
          orb.y,
          currentR * 0.8,
          orb.x,
          orb.y,
          glowRadius
        );
        auraGrad.addColorStop(0, `rgba(${orb.glowColor}, 0.22)`);
        auraGrad.addColorStop(0.5, `rgba(${orb.glowColor}, 0.08)`);
        auraGrad.addColorStop(1, `rgba(${orb.glowColor}, 0)`);

        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // 3D Spherical Volume with Specular Highlight (Giorgio de Chirico light angle)
        const lightOffsetX = orb.x - currentR * 0.32;
        const lightOffsetY = orb.y - currentR * 0.32;
        const sphereGrad = ctx.createRadialGradient(
          lightOffsetX,
          lightOffsetY,
          currentR * 0.08,
          orb.x,
          orb.y,
          currentR
        );
        sphereGrad.addColorStop(0, 'rgba(255, 255, 255, 0.92)'); // Specular sunlight reflection
        sphereGrad.addColorStop(0.25, `rgba(${orb.color}, 0.75)`);
        sphereGrad.addColorStop(0.7, `rgba(${orb.color}, 0.4)`);
        sphereGrad.addColorStop(1, 'rgba(3, 7, 18, 0.85)'); // Metaphysical shadow terminus

        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, currentR, 0, Math.PI * 2);
        ctx.fill();

        // Subtle soft rim light
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + Math.sin(orb.pulseAngle) * 0.08})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }

      // 3. Draw Celestial Stardust (Twinkling cosmic motes)
      for (const p of stardust) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Gravitational lens deflection
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * 0.65;
          p.x -= (dx / dist) * force;
          p.y -= (dy / dist) * force;
        }

        p.pulseAngle += p.pulseSpeed;
        p.currentAlpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.22;

        // Soft halo
        const haloRadius = p.radius * 3.5;
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          haloRadius
        );
        gradient.addColorStop(0, `rgba(${p.color}, ${Math.max(0, p.currentAlpha * 0.6)})`);
        gradient.addColorStop(0.5, `rgba(${p.color}, ${Math.max(0, p.currentAlpha * 0.2)})`);
        gradient.addColorStop(1, `rgba(${p.color}, 0)`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, haloRadius, 0, Math.PI * 2);
        ctx.fill();

        // Luminous core
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color}, ${Math.min(1, p.currentAlpha + 0.25)})`;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Stardust center spark
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, p.currentAlpha * 0.9)})`;
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
