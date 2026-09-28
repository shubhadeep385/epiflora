import { useEffect, useRef } from 'react';
import { assetUrl } from '../../lib/assets.ts';

export function AnimatedWheatVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Load base photo of the lush wheat field
    const img = new Image();
    img.src = assetUrl('/images/wheat_field_hero.jpg');
    let imageLoaded = false;
    img.onload = () => {
      imageLoaded = true;
    };

    // Sunlit pollen / dust motes
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.2) * 0.0008,
      speedY: -(Math.random() * 0.0012 + 0.0004),
      opacity: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetMouseX = (e.clientX - rect.left) / rect.width;
      targetMouseY = (e.clientY - rect.top) / rect.height;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let startTime = performance.now();
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) * 0.001, 0.05);
      lastTime = now;
      const elapsed = (now - startTime) * 0.001;

      // Silky smooth mouse interpolation
      const mouseDamping = 1 - Math.exp(-6.0 * dt);
      mouseX += (targetMouseX - mouseX) * mouseDamping;
      mouseY += (targetMouseY - mouseY) * mouseDamping;

      ctx.clearRect(0, 0, width, height);

      if (imageLoaded && img.naturalWidth > 0) {
        // Draw base image with gentle wind breathing & parallax pan
        const scale = 1.05 + Math.sin(elapsed * 0.35) * 0.012;
        const panX = (mouseX - 0.5) * 18;
        const panY = (mouseY - 0.5) * 12;

        // Calculate aspect fill
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = width / height;
        let renderW = width * scale;
        let renderH = height * scale;

        if (canvasAspect > imgAspect) {
          renderW = width * scale;
          renderH = (width / imgAspect) * scale;
        } else {
          renderH = height * scale;
          renderW = (height * imgAspect) * scale;
        }

        const offsetX = (width - renderW) / 2 + panX;
        const offsetY = (height - renderH) / 2 + panY;

        ctx.save();

        // Subtle wind wave deformation using layered slice draws for realistic wheat sway
        const slices = 12;
        const sliceH = renderH / slices;

        for (let i = 0; i < slices; i++) {
          const progress = i / slices;
          // Bottom slices (wheat heads) sway more with wind
          const swayWeight = Math.pow(progress, 1.8);
          const windWave =
            Math.sin(elapsed * 1.5 + i * 0.4) * 6 * swayWeight +
            Math.cos(elapsed * 0.8 + i * 0.22) * 3 * swayWeight;

          const sy = (i * img.naturalHeight) / slices;
          const sH = img.naturalHeight / slices;
          const dy = offsetY + i * sliceH;

          ctx.drawImage(
            img,
            0,
            sy,
            img.naturalWidth,
            sH,
            offsetX + windWave,
            dy,
            renderW,
            sliceH + 1,
          );
        }

        ctx.restore();
      } else {
        // High-fidelity fallback agricultural gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#5ea8db');
        bgGrad.addColorStop(0.38, '#b2dbf2');
        bgGrad.addColorStop(0.55, '#6b9e38');
        bgGrad.addColorStop(1, '#2f571b');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Golden sunlight flare overlay
      const sunX = width * (0.75 + (mouseX - 0.5) * 0.04);
      const sunY = height * (0.18 + (mouseY - 0.5) * 0.04);
      const sunRadius = Math.max(width, height) * 0.7;

      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
      const sunPulse = 0.26 + Math.sin(elapsed * 0.6) * 0.03;
      sunGrad.addColorStop(0, `rgba(255, 248, 220, ${sunPulse + 0.12})`);
      sunGrad.addColorStop(0.2, `rgba(254, 240, 138, ${sunPulse * 0.5})`);
      sunGrad.addColorStop(0.5, `rgba(163, 230, 53, ${sunPulse * 0.18})`);
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, height);

      // Light beam god-rays
      ctx.save();
      ctx.translate(sunX, sunY);
      ctx.rotate(elapsed * 0.025);
      for (let r = 0; r < 4; r++) {
        const rayAngle = (r * Math.PI) / 2 + Math.sin(elapsed * 0.18 + r) * 0.08;
        const rayGrad = ctx.createLinearGradient(0, 0, Math.cos(rayAngle) * width, Math.sin(rayAngle) * height);
        rayGrad.addColorStop(0, 'rgba(255, 255, 230, 0.10)');
        rayGrad.addColorStop(0.6, 'rgba(255, 255, 200, 0.02)');
        rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, width * 0.9, rayAngle - 0.15, rayAngle + 0.15);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Floating sun pollen / atmospheric motes with dt normalization
      for (const p of particles) {
        p.x += p.speedX * dt * 60;
        p.y += p.speedY * dt * 60;
        p.pulse += 0.025 * dt * 60;

        if (p.y < -0.05) {
          p.y = 1.05;
          p.x = Math.random();
        }
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;

        const currentOpacity = p.opacity * (0.65 + Math.sin(p.pulse) * 0.35);
        const px = p.x * width;
        const py = p.y * height;

        ctx.fillStyle = `rgba(254, 240, 138, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full object-cover block" />
    </div>
  );
}
