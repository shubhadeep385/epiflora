import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { assetUrl } from '../../lib/assets.ts';

export function FarmScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let animationFrameId: number;

    try {
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0xFAF8F3, isMobile ? 0.038 : 0.028);

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 3.2, 8.2);
      camera.lookAt(0, 0.4, 0);

      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        powerPreference: 'high-performance',
        alpha: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL initialization failed, using 2D fallback', e);
      setWebglError(true);
      return;
    }

    // ────────────────────────────────────────────────────────────────────────────
    // 1. Lighting Setup (Natural Warm Sunlight & Sky Bounce)
    // ────────────────────────────────────────────────────────────────────────────
    const skyLight = new THREE.HemisphereLight(0xfffbeb, 0x3d5241, 2.0);
    scene.add(skyLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.6);
    sunLight.position.set(12, 16, 8);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xa7f3d0, 1.2);
    fillLight.position.set(-10, 6, -10);
    scene.add(fillLight);

    // ────────────────────────────────────────────────────────────────────────────
    // 2. Procedural Agricultural Terrain (Rich Natural Earth Soil)
    // ────────────────────────────────────────────────────────────────────────────
    const terrainWidth = 40;
    const terrainHeight = 40;
    const segments = isMobile ? 40 : 80;
    const terrainGeo = new THREE.PlaneGeometry(terrainWidth, terrainHeight, segments, segments);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    if (posAttr) {
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);

        const hill = Math.sin(x * 0.15) * Math.cos(z * 0.15) * 0.65;
        const micro = Math.sin(x * 0.4 + z * 0.3) * 0.18;
        const furrows = Math.sin(x * 1.8) * 0.07;

        posAttr.setY(i, hill + micro + furrows - 0.7);
      }
      terrainGeo.computeVertexNormals();
    }

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x3d3023, // Warm dark fertile loam
      roughness: 0.92,
      metalness: 0.05,
      flatShading: false,
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.position.set(0, -1.2, -4);
    scene.add(terrainMesh);

    // ────────────────────────────────────────────────────────────────────────────
    // 3. Instanced Swaying Crop Rows (Vibrant Natural Foliage)
    // ────────────────────────────────────────────────────────────────────────────
    const cropCountX = isMobile ? 12 : 24;
    const cropCountZ = isMobile ? 25 : 45;
    const totalCrops = cropCountX * cropCountZ;

    const plantGeo = new THREE.ConeGeometry(0.12, 0.65, 5);
    plantGeo.translate(0, 0.32, 0);

    const plantMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d47, // Lush agricultural green
      roughness: 0.65,
      metalness: 0.1,
      flatShading: true,
    });

    const instancedCrops = new THREE.InstancedMesh(plantGeo, plantMat, totalCrops);
    const dummy = new THREE.Object3D();
    const cropPositions: { x: number; y: number; z: number; phase: number }[] = [];

    let index = 0;
    const spacingX = 0.9;
    const spacingZ = 0.65;
    const startX = -(cropCountX * spacingX) / 2;
    const startZ = -16;

    for (let r = 0; r < cropCountX; r++) {
      for (let c = 0; c < cropCountZ; c++) {
        const x = startX + r * spacingX + (Math.random() - 0.5) * 0.08;
        const z = startZ + c * spacingZ + (Math.random() - 0.5) * 0.08;

        const hill = Math.sin(x * 0.15) * Math.cos(z * 0.15) * 0.65;
        const micro = Math.sin(x * 0.4 + z * 0.3) * 0.18;
        const y = hill + micro - 1.4;

        const scale = 0.75 + Math.random() * 0.5;
        dummy.position.set(x, y, z);
        dummy.scale.set(scale, scale * (0.85 + Math.random() * 0.35), scale);
        dummy.rotation.y = Math.random() * Math.PI * 2;
        dummy.updateMatrix();

        instancedCrops.setMatrixAt(index, dummy.matrix);
        cropPositions.push({ x, y, z, phase: Math.random() * Math.PI * 2 });
        index++;
      }
    }
    instancedCrops.instanceMatrix.needsUpdate = true;
    scene.add(instancedCrops);

    // ────────────────────────────────────────────────────────────────────────────
    // 4. Subtle Atmospheric Airborne Nutrient Spores
    // ────────────────────────────────────────────────────────────────────────────
    const particleCount = isMobile ? 100 : 250;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 26;
      const y = -1.0 + Math.random() * 6.5;
      const z = -14 + Math.random() * 20;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      particleSpeeds[i] = 0.002 + Math.random() * 0.005;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x86efac,
      size: isMobile ? 0.06 : 0.08,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ────────────────────────────────────────────────────────────────────────────
    // 5. Parallax & Animation Loop
    // ────────────────────────────────────────────────────────────────────────────
    let targetCameraX = 0;
    let targetCameraY = 3.2;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetCameraX = normX * 0.6;
      targetCameraY = 3.2 + normY * 0.35;
    };

    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      if (!prefersReducedMotion) {
        camera.position.x += (targetCameraX - camera.position.x) * 0.04;
        camera.position.y += (targetCameraY - camera.position.y) * 0.04;
        camera.lookAt(0, 0.6, -1.5);
      }

      // Gentle wind sway
      if (!prefersReducedMotion) {
        for (let i = 0; i < totalCrops; i++) {
          const crop = cropPositions[i];
          if (!crop) continue;

          const wind = Math.sin(elapsedTime * 1.5 + crop.x * 0.5 + crop.z * 0.3) * 0.06;
          dummy.position.set(crop.x, crop.y, crop.z);
          dummy.rotation.z = wind;
          dummy.rotation.x = Math.cos(elapsedTime * 1.0 + crop.phase) * 0.03;
          dummy.rotation.y = crop.phase;
          dummy.updateMatrix();

          instancedCrops.setMatrixAt(i, dummy.matrix);
        }
        instancedCrops.instanceMatrix.needsUpdate = true;
      }

      // Float particles
      const pAttr = particleGeo.attributes.position;
      if (pAttr) {
        const positions = pAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const yIdx = i * 3 + 1;
          const currentY = positions[yIdx] ?? 0;
          const speed = particleSpeeds[i] ?? 0.003;
          positions[yIdx] = currentY + speed;

          if (positions[yIdx]! > 6.0) {
            positions[yIdx] = -1.0;
          }

          const xIdx = i * 3;
          const currentX = positions[xIdx] ?? 0;
          positions[xIdx] = currentX + Math.sin(elapsedTime + i) * 0.0015;
        }
        pAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (!isMobile) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      terrainGeo.dispose();
      terrainMat.dispose();
      plantGeo.dispose();
      plantMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  if (webglError) {
    return (
      <div className="absolute inset-0 bg-[#FAF8F3]">
        <img
          src={assetUrl('/images/farmland_hero.jpg')}
          alt="EpiFlora Living Agricultural Farmland"
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F3] via-transparent to-[#FAF8F3]" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none opacity-85"
      aria-hidden="true"
    />
  );
}
