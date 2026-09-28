import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import bricsGeoData from './bricsGeoData.json';
import { assetUrl } from '../../lib/assets.ts';

export interface HubNode {
  id: string;
  name: string;
  countryCode: string;
  flag: string;
  city: string;
  lat: number;
  lon: number;
  focus: string;
  telemetry: string;
  colorHex: string;
  colorNum: number;
  patterns: number;
  latencyMs: number;
  tier: 'core' | 'member' | 'partner';
}

export const BRICS_HUBS: HubNode[] = [
  // ─── Core Founding Five ───────────────────────────────────────────────────
  {
    id: 'india',
    name: 'India',
    countryCode: 'IND',
    flag: '🇮🇳',
    city: 'Nagpur / New Delhi Hub',
    lat: 20.5937,
    lon: 78.9629,
    focus: 'Smallholder Agronomy & Multilingual AI Edge Synthesis',
    telemetry: 'Syncing localized pest vector weights & monsoonal soil moisture forecasts across 14 languages.',
    colorHex: '#22C55E',
    colorNum: 0x22c55e,
    patterns: 1420,
    latencyMs: 12,
    tier: 'core',
  },
  {
    id: 'brazil',
    name: 'Brazil',
    countryCode: 'BRA',
    flag: '🇧🇷',
    city: 'Cerrado / Brasília Hub',
    lat: -14.235,
    lon: -51.9253,
    focus: 'Tropical Soil Carbon Sequestration & Deep Root Biomass',
    telemetry: 'Exchanging deep horizon carbon saturation models with zero farm boundary data exposure.',
    colorHex: '#10B981',
    colorNum: 0x10b981,
    patterns: 980,
    latencyMs: 24,
    tier: 'core',
  },
  {
    id: 'south-africa',
    name: 'South Africa',
    countryCode: 'ZAF',
    flag: '🇿🇦',
    city: 'Cape Town / Pretoria Hub',
    lat: -30.5595,
    lon: 22.9375,
    focus: 'Arid Zone Drought Resistance & Evaporative Stress AI',
    telemetry: 'Streaming semi-arid drought tolerance federated gradients across Karoo monitoring stations.',
    colorHex: '#F59E0B',
    colorNum: 0xf59e0b,
    patterns: 760,
    latencyMs: 32,
    tier: 'core',
  },
  {
    id: 'china',
    name: 'China',
    countryCode: 'CHN',
    flag: '🇨🇳',
    city: 'Zhengzhou / Beijing Hub',
    lat: 35.8617,
    lon: 104.1954,
    focus: 'Precision Greenhouse Multi-Spectral & Canopy Health Fleet',
    telemetry: 'Benchmarking hyperspectral disease signature libraries across distributed horticultural clusters.',
    colorHex: '#38BDF8',
    colorNum: 0x38bdf8,
    patterns: 2150,
    latencyMs: 14,
    tier: 'core',
  },
  {
    id: 'russia',
    name: 'Russia',
    countryCode: 'RUS',
    flag: '🇷🇺',
    city: 'Samara / Moscow Hub',
    lat: 55.7558,
    lon: 37.6173,
    focus: 'Chernozem Black Soil Fertility & Cold Hardiness Genetics',
    telemetry: 'Federating sub-zero spring thaw germination models with Eurasian agronomy nodes.',
    colorHex: '#A78BFA',
    colorNum: 0xa78bfa,
    patterns: 1130,
    latencyMs: 22,
    tier: 'core',
  },

  // ─── New Full Members (BRICS+) ───────────────────────────────────────────
  {
    id: 'egypt',
    name: 'Egypt',
    countryCode: 'EGY',
    flag: '🇪🇬',
    city: 'Cairo / Nile Delta Hub',
    lat: 26.8206,
    lon: 30.8025,
    focus: 'Precision Nile Basin Irrigation & Soil Salinity Management',
    telemetry: 'Exchanging hyper-arid river basin moisture models and solar desalinisation soil thresholds.',
    colorHex: '#FBBF24',
    colorNum: 0xfbbf24,
    patterns: 640,
    latencyMs: 28,
    tier: 'member',
  },
  {
    id: 'ethiopia',
    name: 'Ethiopia',
    countryCode: 'ETH',
    flag: '🇪🇹',
    city: 'Addis Ababa / Oromia Highlands Hub',
    lat: 9.145,
    lon: 40.4897,
    focus: 'Highland Agroforestry, Teff & Arabica Coffee Genetic Resilience',
    telemetry: 'Synthesising micro-elevation climatic adaptation data for ancient cereal landraces.',
    colorHex: '#34D399',
    colorNum: 0x34d399,
    patterns: 520,
    latencyMs: 34,
    tier: 'member',
  },
  {
    id: 'iran',
    name: 'Iran',
    countryCode: 'IRN',
    flag: '🇮🇷',
    city: 'Isfahan / Tehran Hub',
    lat: 32.4279,
    lon: 53.688,
    focus: 'Subterranean Qanat Water Harvesting & Saffron/Pistachio Agronomy',
    telemetry: 'Harmonising ancestral gravity-fed qanat irrigation algorithms with modern soil sensor telemetry.',
    colorHex: '#60A5FA',
    colorNum: 0x60a5fa,
    patterns: 590,
    latencyMs: 31,
    tier: 'member',
  },
  {
    id: 'saudi-arabia',
    name: 'Saudi Arabia',
    countryCode: 'SAU',
    flag: '🇸🇦',
    city: 'Riyadh / Al-Ahsa Oasis Hub',
    lat: 23.8859,
    lon: 45.0792,
    focus: 'Controlled Environment Agriculture & Desalinated Fertigation',
    telemetry: 'Benchmarking closed-loop hydroponic water recycling and date palm microbiome biodiversity.',
    colorHex: '#4ADE80',
    colorNum: 0x4ade80,
    patterns: 480,
    latencyMs: 19,
    tier: 'member',
  },
  {
    id: 'uae',
    name: 'UAE',
    countryCode: 'ARE',
    flag: '🇦🇪',
    city: 'Abu Dhabi / Al Ain Hub',
    lat: 23.4241,
    lon: 53.8478,
    focus: 'Agri-Tech Vertical Farming & Salt-Tolerant Halophyte Crop Cultivation',
    telemetry: 'Streaming desert edge energy-neutral greenhouse climate control weights.',
    colorHex: '#2DD4BF',
    colorNum: 0x2dd4bf,
    patterns: 510,
    latencyMs: 16,
    tier: 'member',
  },
  {
    id: 'indonesia',
    name: 'Indonesia',
    countryCode: 'IDN',
    flag: '🇮🇩',
    city: 'Jakarta / Central Java Volcanic Hub',
    lat: -0.7893,
    lon: 113.9213,
    focus: 'Volcanic Andosol Bio-fertility & Tropical Multi-Stratum Agroforestry',
    telemetry: 'Disseminating equatorial humid pathogen spore dispersal alerts and organic volcanic biochar data.',
    colorHex: '#F87171',
    colorNum: 0xf87171,
    patterns: 840,
    latencyMs: 26,
    tier: 'member',
  },

  // ─── Partner Countries ────────────────────────────────────────────────────
  {
    id: 'vietnam',
    name: 'Vietnam',
    countryCode: 'VNM',
    flag: '🇻🇳',
    city: 'Mekong Delta / Hanoi Hub',
    lat: 14.0583,
    lon: 108.2772,
    focus: 'Deltaic Low-Methane Alternate Wetting & Drying (AWD) Rice',
    telemetry: 'Monitoring tidal salinity intrusion and AWD carbon-offset credit verifications.',
    colorHex: '#F43F5E',
    colorNum: 0xf43f5e,
    patterns: 620,
    latencyMs: 22,
    tier: 'partner',
  },
  {
    id: 'thailand',
    name: 'Thailand',
    countryCode: 'THA',
    flag: '🇹🇭',
    city: 'Chao Phraya / Bangkok Hub',
    lat: 15.87,
    lon: 100.9925,
    focus: 'Precision Jasmine Rice & Tropical Agro-Bioeconomy Models',
    telemetry: 'Integrating monsoonal floodwater dissipation modeling with bio-circular farming matrices.',
    colorHex: '#FBBF24',
    colorNum: 0xfbbf24,
    patterns: 530,
    latencyMs: 24,
    tier: 'partner',
  },
  {
    id: 'malaysia',
    name: 'Malaysia',
    countryCode: 'MYS',
    flag: '🇲🇾',
    city: 'Kuala Lumpur / Borneo Hub',
    lat: 4.2105,
    lon: 101.9758,
    focus: 'Rainforest Soil Microbiome & Regenerative Plantation Stratum',
    telemetry: 'Sharing biodiversity corridor edge sensors and fungal root inoculation telemetry.',
    colorHex: '#10B981',
    colorNum: 0x10b981,
    patterns: 450,
    latencyMs: 25,
    tier: 'partner',
  },
  {
    id: 'nigeria',
    name: 'Nigeria',
    countryCode: 'NGA',
    flag: '🇳🇬',
    city: 'Abuja / Kano Savannah Hub',
    lat: 9.082,
    lon: 8.6753,
    focus: 'Sub-Saharan Cassava, Sorghum & Smallholder Dryland Adaptation',
    telemetry: 'Deploying offline-first mobile agronomy inference weights across semi-arid smallholders.',
    colorHex: '#22C55E',
    colorNum: 0x22c55e,
    patterns: 490,
    latencyMs: 46,
    tier: 'partner',
  },
  {
    id: 'kazakhstan',
    name: 'Kazakhstan',
    countryCode: 'KAZ',
    flag: '🇰🇿',
    city: 'Astana / Kostanay Steppe Hub',
    lat: 48.0196,
    lon: 66.9237,
    focus: 'Eurasian Spring Wheat Steppes & Wind Erosion Zero-Till',
    telemetry: 'Correlating continental permafrost boundary changes with spring wheat tillering rates.',
    colorHex: '#38BDF8',
    colorNum: 0x38bdf8,
    patterns: 410,
    latencyMs: 38,
    tier: 'partner',
  },
  {
    id: 'belarus',
    name: 'Belarus',
    countryCode: 'BLR',
    flag: '🇧🇾',
    city: 'Minsk / Polesie Lowlands Hub',
    lat: 53.7098,
    lon: 27.9534,
    focus: 'Peatland Moisture Balance & Cold-Resistant Flax/Potato Agronomy',
    telemetry: 'Transmitting northern bog moisture buffer capacities and organic humic acid profiles.',
    colorHex: '#818CF8',
    colorNum: 0x818cf8,
    patterns: 320,
    latencyMs: 36,
    tier: 'partner',
  },
  {
    id: 'bolivia',
    name: 'Bolivia',
    countryCode: 'BOL',
    flag: '🇧🇴',
    city: 'Altiplano / Santa Cruz Hub',
    lat: -16.2902,
    lon: -63.5887,
    focus: 'High-Altitude Quinoa Biodiversity & Andean Soil Regeneration',
    telemetry: 'Exchanging frost-hardy quinoa variety gene bank profiles and terrace water retention metrics.',
    colorHex: '#FB923C',
    colorNum: 0xfb923c,
    patterns: 290,
    latencyMs: 54,
    tier: 'partner',
  },
  {
    id: 'cuba',
    name: 'Cuba',
    countryCode: 'CUB',
    flag: '🇨🇺',
    city: 'Havana / Organopónicos Hub',
    lat: 21.5218,
    lon: -77.7812,
    focus: 'Urban Agroecology, Biopesticides & Zero-Chemicals Permaculture',
    telemetry: 'Broadcasting biological pest parasitoid formulas and organic organopónicos yield multipliers.',
    colorHex: '#38BDF8',
    colorNum: 0x38bdf8,
    patterns: 260,
    latencyMs: 48,
    tier: 'partner',
  },
  {
    id: 'uganda',
    name: 'Uganda',
    countryCode: 'UGA',
    flag: '🇺🇬',
    city: 'Kampala / Lake Victoria Basin Hub',
    lat: 1.3733,
    lon: 32.2903,
    focus: 'Intercropped Banana-Coffee Microclimate & Regenerative Composting',
    telemetry: 'Streaming equatorial agroforestry canopy temperature attenuation ratios.',
    colorHex: '#FBBF24',
    colorNum: 0xfbbf24,
    patterns: 310,
    latencyMs: 42,
    tier: 'partner',
  },
  {
    id: 'uzbekistan',
    name: 'Uzbekistan',
    countryCode: 'UZB',
    flag: '🇺🇿',
    city: 'Tashkent / Fergana Valley Hub',
    lat: 41.3775,
    lon: 64.5853,
    focus: 'Precision Drip-Irrigated Cotton & Aral Basin Soil Desalination',
    telemetry: 'Calibrating micro-drip saline flushing intervals with satellite soil conductance indices.',
    colorHex: '#34D399',
    colorNum: 0x34d399,
    patterns: 380,
    latencyMs: 35,
    tier: 'partner',
  },
];

/**
 * Converts (lat, lon) to 3D Cartesian coordinates matching Three.js equirectangular UV mapping
 */
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

/**
 * Calculates upright quaternion to rotate the globe so a country (lat, lon) is centered and upright (North pointing UP)
 */
function getUprightCountryQuaternion(lat: number, lon: number): THREE.Quaternion {
  const v = latLonToVector3(lat, lon, 1);
  // Azimuthal rotation around Y axis to bring longitude to the X=0, Z>0 meridian
  const rotY = -Math.atan2(v.x, v.z);
  // Polar tilt around X axis to position country at comfortable viewing height while keeping North Pole UP
  const targetTilt = 0.12;
  const rotX = (lat * Math.PI) / 180 - targetTilt;

  const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
  const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), rotX);
  return new THREE.Quaternion().multiplyQuaternions(qX, qY);
}

/**
 * Creates 3D curved Great-Circle arc points between two coordinates
 */
function createCurvedArc(v1: THREE.Vector3, v2: THREE.Vector3, elevation = 1.3): THREE.Vector3[] {
  const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
  const distance = v1.distanceTo(v2);
  mid.normalize().multiplyScalar(v1.length() + Math.min(distance * 0.35 * elevation, 1.4));

  const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
  return curve.getPoints(50);
}

/**
 * Generates high-res equirectangular canvas texture with glowing highlighted BRICS country territories
 */
function drawBricsHighlightCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  activeCountryName: string,
  activeTier: 'all' | 'core' | 'member' | 'partner' = 'all',
) {
  ctx.clearRect(0, 0, width, height);

  // If user selected member or partner tier, don't draw core highlight fills
  if (activeTier !== 'all' && activeTier !== 'core') {
    return;
  }

  const countryColorMap: Record<string, { fill: string; stroke: string; activeFill: string; activeStroke: string }> = {
    India: {
      fill: 'rgba(34, 197, 94, 0.38)',
      stroke: 'rgba(74, 222, 128, 0.95)',
      activeFill: 'rgba(34, 197, 94, 0.72)',
      activeStroke: 'rgba(134, 239, 172, 1.0)',
    },
    Brazil: {
      fill: 'rgba(16, 185, 129, 0.38)',
      stroke: 'rgba(52, 211, 153, 0.95)',
      activeFill: 'rgba(16, 185, 129, 0.72)',
      activeStroke: 'rgba(110, 231, 183, 1.0)',
    },
    'South Africa': {
      fill: 'rgba(245, 158, 11, 0.38)',
      stroke: 'rgba(251, 191, 36, 0.95)',
      activeFill: 'rgba(245, 158, 11, 0.72)',
      activeStroke: 'rgba(253, 230, 138, 1.0)',
    },
    China: {
      fill: 'rgba(56, 189, 248, 0.38)',
      stroke: 'rgba(125, 211, 252, 0.95)',
      activeFill: 'rgba(56, 189, 248, 0.72)',
      activeStroke: 'rgba(186, 230, 253, 1.0)',
    },
    Russia: {
      fill: 'rgba(167, 139, 250, 0.35)',
      stroke: 'rgba(196, 181, 253, 0.95)',
      activeFill: 'rgba(167, 139, 250, 0.68)',
      activeStroke: 'rgba(221, 214, 254, 1.0)',
    },
  };

  (bricsGeoData as any[]).forEach((feature) => {
    const name: string = feature.properties?.NAME || feature.properties?.ADMIN || '';
    const style = countryColorMap[name] || {
      fill: 'rgba(42, 213, 139, 0.38)',
      stroke: 'rgba(42, 213, 139, 0.95)',
      activeFill: 'rgba(42, 213, 139, 0.70)',
      activeStroke: 'rgba(42, 213, 139, 1.0)',
    };
    const isActive = name.toLowerCase() === activeCountryName.toLowerCase();

    ctx.save();
    ctx.fillStyle = isActive ? style.activeFill : style.fill;
    ctx.strokeStyle = isActive ? style.activeStroke : style.stroke;
    ctx.lineWidth = isActive ? 5.0 : 2.5;
    ctx.shadowColor = isActive ? style.activeStroke : style.stroke;
    ctx.shadowBlur = isActive ? 24 : 10;

    const drawRing = (coords: number[][]) => {
      if (!coords.length) return;
      ctx.beginPath();
      coords.forEach((coord, index) => {
        const lon = coord[0];
        const lat = coord[1];
        if (lon === undefined || lat === undefined) return;
        const x = ((lon + 180) / 360) * width;
        const y = ((90 - lat) / 180) * height;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    if (feature.geometry.type === 'Polygon') {
      feature.geometry.coordinates.forEach((ring: number[][]) => drawRing(ring));
    } else if (feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates.forEach((poly: number[][][]) => {
        poly.forEach((ring: number[][]) => drawRing(ring));
      });
    }

    ctx.restore();
  });
}

interface ThreeGlobeProps {
  activeHubIndex: number;
  onSelectHub?: (index: number) => void;
  activeTier?: 'all' | 'core' | 'member' | 'partner';
}

export function ThreeGlobe({
  activeHubIndex = 0,
  onSelectHub,
  activeTier = 'all',
}: ThreeGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredHub, setHoveredHub] = useState<HubNode | null>(null);

  const sceneStateRef = useRef<{
    globeGroup: THREE.Group;
    targetQuaternion: THREE.Quaternion;
    isTransitioning: boolean;
    activeIdx: number;
    activeTier: 'all' | 'core' | 'member' | 'partner';
    highlightCanvas: HTMLCanvasElement;
    highlightTexture: THREE.CanvasTexture;
    borderLines: { line: THREE.Line; name: string }[];
    pinObjects: {
      mesh: THREE.Mesh;
      lightBeam: THREE.Mesh;
      ring1: THREE.Mesh;
      ring2: THREE.Mesh;
      hub: HubNode;
      index: number;
    }[];
    arcLines: { line: THREE.Line; pair: [number, number] }[];
    packetMeshes: {
      mesh: THREE.Mesh;
      points: THREE.Vector3[];
      progress: number;
      speed: number;
      pair: [number, number];
    }[];
  } | null>(null);

  // Smooth fly-to when activeHubIndex or activeTier changes
  useEffect(() => {
    if (!sceneStateRef.current) return;
    const state = sceneStateRef.current;
    state.activeIdx = activeHubIndex;
    state.activeTier = activeTier;
    const hub = BRICS_HUBS[activeHubIndex] ?? BRICS_HUBS[0]!;

    // Calculate exact upright quaternion (North Pole always pointing UP)
    const uprightQuat = getUprightCountryQuaternion(hub.lat, hub.lon);
    state.targetQuaternion.copy(uprightQuat);
    state.isTransitioning = true;

    // Filter pin objects by tier
    state.pinObjects.forEach((p) => {
      const isVisible = activeTier === 'all' || p.hub.tier === activeTier;
      p.mesh.visible = isVisible;
      p.lightBeam.visible = isVisible;
      p.ring1.visible = isVisible;
      p.ring2.visible = isVisible;
    });

    // Filter arcs and packets by tier
    state.arcLines.forEach(({ line, pair: [idx1, idx2] }) => {
      const h1 = BRICS_HUBS[idx1];
      const h2 = BRICS_HUBS[idx2];
      if (!h1 || !h2) return;
      const isArcActive =
        activeTier === 'all' ||
        (activeTier === 'core'
          ? h1.tier === 'core' && h2.tier === 'core'
          : activeTier === 'member'
          ? h1.tier === 'member' || h2.tier === 'member'
          : h1.tier === 'partner' || h2.tier === 'partner');
      line.visible = isArcActive;
    });

    state.packetMeshes.forEach(({ mesh, pair: [idx1, idx2] }) => {
      const h1 = BRICS_HUBS[idx1];
      const h2 = BRICS_HUBS[idx2];
      if (!h1 || !h2) return;
      const isArcActive =
        activeTier === 'all' ||
        (activeTier === 'core'
          ? h1.tier === 'core' && h2.tier === 'core'
          : activeTier === 'member'
          ? h1.tier === 'member' || h2.tier === 'member'
          : h1.tier === 'partner' || h2.tier === 'partner');
      mesh.visible = isArcActive;
    });

    // Update highlight canvas texture
    const ctx = state.highlightCanvas.getContext('2d');
    if (ctx) {
      drawBricsHighlightCanvas(ctx, state.highlightCanvas.width, state.highlightCanvas.height, hub.name, activeTier);
      state.highlightTexture.needsUpdate = true;
    }

    // Update border line styles
    state.borderLines.forEach(({ line, name }) => {
      const isCoreActive = activeTier === 'all' || activeTier === 'core';
      line.visible = isCoreActive;
      if (isCoreActive) {
        const isSelected = name.toLowerCase() === hub.name.toLowerCase();
        const mat = line.material as THREE.LineBasicMaterial;
        mat.opacity = isSelected ? 1.0 : 0.75;
      }
    });
  }, [activeHubIndex, activeTier]);

  // Persistent Scene Mount
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // ────────────────────────────────────────────────────────────────────────────
    // Scene, Camera & Renderer Setup
    // ────────────────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    const globeRadius = 2.45;
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // ────────────────────────────────────────────────────────────────────────────
    // Dynamic Lighting
    // ────────────────────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x283b30, 2.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
    sunLight.position.set(6, 3, 5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(-6, -2, -4);
    scene.add(rimLight);

    // ────────────────────────────────────────────────────────────────────────────
    // 1. Realistic NASA Blue Marble Earth Sphere
    // ────────────────────────────────────────────────────────────────────────────
    const textureLoader = new THREE.TextureLoader();

    const earthDayMap = textureLoader.load(assetUrl('/images/earth/earth_day_2048.jpg'));
    const earthNormalMap = textureLoader.load(assetUrl('/images/earth/earth_normal_2048.jpg'));
    const earthSpecularMap = textureLoader.load(assetUrl('/images/earth/earth_specular_2048.jpg'));
    const earthCloudsMap = textureLoader.load(assetUrl('/images/earth/earth_clouds_1024.png'));
    const earthLightsMap = textureLoader.load(assetUrl('/images/earth/earth_lights_2048.png'));

    earthDayMap.colorSpace = THREE.SRGBColorSpace;
    earthLightsMap.colorSpace = THREE.SRGBColorSpace;
    earthCloudsMap.colorSpace = THREE.SRGBColorSpace;

    const sphereSegments = isMobile ? 48 : 64;
    const earthGeo = new THREE.SphereGeometry(globeRadius, sphereSegments, sphereSegments);

    const earthMat = new THREE.MeshStandardMaterial({
      map: earthDayMap,
      normalMap: earthNormalMap,
      normalScale: new THREE.Vector2(0.7, 0.7),
      roughnessMap: earthSpecularMap,
      roughness: 0.6,
      metalness: 0.1,
      emissiveMap: earthLightsMap,
      emissive: new THREE.Color(0xfff3cc),
      emissiveIntensity: 0.3,
      depthWrite: true,
      depthTest: true,
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // ────────────────────────────────────────────────────────────────────────────
    // 2. Highlight Canvas Layer for BRICS Countries
    // ────────────────────────────────────────────────────────────────────────────
    const highlightCanvas = document.createElement('canvas');
    highlightCanvas.width = 2048;
    highlightCanvas.height = 1024;
    const currentActiveHub = BRICS_HUBS[activeHubIndex] ?? BRICS_HUBS[0]!;
    const highlightCtx = highlightCanvas.getContext('2d');
    if (highlightCtx) {
      drawBricsHighlightCanvas(highlightCtx, 2048, 1024, currentActiveHub.name);
    }

    const highlightTexture = new THREE.CanvasTexture(highlightCanvas);
    highlightTexture.colorSpace = THREE.SRGBColorSpace;

    const highlightGeo = new THREE.SphereGeometry(globeRadius + 0.008, sphereSegments, sphereSegments);
    const highlightMat = new THREE.MeshBasicMaterial({
      map: highlightTexture,
      transparent: true,
      opacity: 0.95,
      blending: THREE.NormalBlending,
      side: THREE.FrontSide,
      depthWrite: false,
      depthTest: true,
    });
    const highlightMesh = new THREE.Mesh(highlightGeo, highlightMat);
    globeGroup.add(highlightMesh);

    // ────────────────────────────────────────────────────────────────────────────
    // 3. Glowing 3D Vector Boundary Lines for BRICS Countries
    // ────────────────────────────────────────────────────────────────────────────
    const borderGroup = new THREE.Group();
    globeGroup.add(borderGroup);
    const borderLinesList: { line: THREE.Line; name: string }[] = [];

    (bricsGeoData as any[]).forEach((feature) => {
      const name: string = feature.properties?.NAME || feature.properties?.ADMIN || '';
      const isSelected = name.toLowerCase() === currentActiveHub.name.toLowerCase();

      const hub = BRICS_HUBS.find((h) => h.name.toLowerCase() === name.toLowerCase());
      const color = hub ? hub.colorNum : 0x2ad58b;

      const lineMaterial = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: isSelected ? 1.0 : 0.75,
        depthWrite: false,
        depthTest: true,
      });

      const processRing = (coords: number[][]) => {
        const points: THREE.Vector3[] = [];
        coords.forEach((coord) => {
          const lon = coord[0];
          const lat = coord[1];
          if (lon !== undefined && lat !== undefined) {
            points.push(latLonToVector3(lat, lon, globeRadius + 0.014));
          }
        });
        if (points.length > 1) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeo, lineMaterial);
          borderGroup.add(line);
          borderLinesList.push({ line, name });
        }
      };

      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates.forEach((ring: number[][]) => processRing(ring));
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach((poly: number[][][]) => {
          poly.forEach((ring: number[][]) => processRing(ring));
        });
      }
    });

    // ────────────────────────────────────────────────────────────────────────────
    // 4. Photorealistic Atmospheric Clouds Layer
    // ────────────────────────────────────────────────────────────────────────────
    const cloudsGeo = new THREE.SphereGeometry(globeRadius + 0.026, sphereSegments, sphereSegments);
    const cloudsMat = new THREE.MeshBasicMaterial({
      map: earthCloudsMap,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    globeGroup.add(cloudsMesh);

    // ────────────────────────────────────────────────────────────────────────────
    // 5. Rayleigh Atmosphere Glow Halo
    // ────────────────────────────────────────────────────────────────────────────
    const atmosphereGeo = new THREE.SphereGeometry(globeRadius + 0.16, 48, 48);
    const atmosphereMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        glowColor: { value: new THREE.Color(0x38bdf8) },
        innerGlow: { value: new THREE.Color(0x2ad58b) },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 glowColor;
        uniform vec3 innerGlow;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
          vec3 mixedColor = mix(innerGlow, glowColor, 0.65);
          gl_FragColor = vec4(mixedColor, intensity * 0.95);
        }
      `,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // ────────────────────────────────────────────────────────────────────────────
    // 6. Holographic Beacons & Sonar Pulse Rings
    // ────────────────────────────────────────────────────────────────────────────
    const hubPositions: THREE.Vector3[] = [];
    const pinObjects: {
      mesh: THREE.Mesh;
      lightBeam: THREE.Mesh;
      ring1: THREE.Mesh;
      ring2: THREE.Mesh;
      hub: HubNode;
      index: number;
    }[] = [];

    BRICS_HUBS.forEach((hub, idx) => {
      const pos = latLonToVector3(hub.lat, hub.lon, globeRadius + 0.02);
      hubPositions.push(pos);

      const normal = pos.clone().normalize();

      // Holographic Light Beam
      const beamHeight = 0.55;
      const beamGeo = new THREE.CylinderGeometry(0.016, 0.005, beamHeight, 16, 1, true);
      beamGeo.translate(0, beamHeight / 2, 0);
      beamGeo.rotateX(Math.PI / 2);

      const beamMat = new THREE.MeshBasicMaterial({
        color: hub.colorNum,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.copy(pos);
      beamMesh.lookAt(pos.clone().add(normal));
      globeGroup.add(beamMesh);

      // Sonar Pulse Ring 1
      const ring1Geo = new THREE.RingGeometry(0.03, 0.07, 24);
      const ring1Mat = new THREE.MeshBasicMaterial({
        color: hub.colorNum,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      });
      const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
      ring1.position.copy(pos);
      ring1.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(ring1);

      // Sonar Pulse Ring 2
      const ring2Geo = new THREE.RingGeometry(0.08, 0.13, 24);
      const ring2Mat = new THREE.MeshBasicMaterial({
        color: hub.colorNum,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      });
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2.position.copy(pos);
      ring2.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(ring2);

      // Core Beacon Pin
      const pinGeo = new THREE.SphereGeometry(0.055, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        depthWrite: true,
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.04)));
      (pin as any).hubData = hub;
      (pin as any).hubIndex = idx;
      globeGroup.add(pin);

      pinObjects.push({
        mesh: pin,
        lightBeam: beamMesh,
        ring1,
        ring2,
        hub,
        index: idx,
      });
    });

    // ────────────────────────────────────────────────────────────────────────────
    // 7. Great-Circle Arcs & Traveling Energy Packets
    // ────────────────────────────────────────────────────────────────────────────
    const arcPairs: [number, number][] = [
      // Core Founding Mesh
      [0, 1], // India ↔ Brazil
      [0, 2], // India ↔ South Africa
      [0, 3], // India ↔ China
      [0, 4], // India ↔ Russia
      [1, 2], // Brazil ↔ South Africa
      [3, 4], // China ↔ Russia
      [2, 3], // South Africa ↔ China

      // Full Member Bridges
      [0, 8],  // India ↔ Saudi Arabia
      [0, 9],  // India ↔ UAE
      [0, 10], // India ↔ Indonesia
      [5, 6],  // Egypt ↔ Ethiopia
      [5, 7],  // Egypt ↔ Iran
      [7, 8],  // Iran ↔ Saudi Arabia
      [8, 9],  // Saudi Arabia ↔ UAE
      [3, 10], // China ↔ Indonesia
      [2, 6],  // South Africa ↔ Ethiopia

      // Partner Country Bridges
      [3, 11], // China ↔ Vietnam
      [10, 12], // Indonesia ↔ Thailand
      [10, 13], // Indonesia ↔ Malaysia
      [2, 14], // South Africa ↔ Nigeria
      [4, 15], // Russia ↔ Kazakhstan
      [4, 16], // Russia ↔ Belarus
      [1, 17], // Brazil ↔ Bolivia
      [1, 18], // Brazil ↔ Cuba
      [6, 19], // Ethiopia ↔ Uganda
      [4, 20], // Russia ↔ Uzbekistan
    ];

    const arcLinesList: { line: THREE.Line; pair: [number, number] }[] = [];
    const packetMeshes: {
      mesh: THREE.Mesh;
      points: THREE.Vector3[];
      progress: number;
      speed: number;
      pair: [number, number];
    }[] = [];

    arcPairs.forEach(([idx1, idx2], pairIdx) => {
      const v1 = hubPositions[idx1];
      const v2 = hubPositions[idx2];
      if (!v1 || !v2) return;

      const curvePoints = createCurvedArc(v1, v2);

      const arcGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0x2ad58b,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(arcLine);
      arcLinesList.push({ line: arcLine, pair: [idx1, idx2] });

      const packetGeo = new THREE.SphereGeometry(0.04, 12, 12);
      const packetMat = new THREE.MeshBasicMaterial({
        color: 0x6ee7b7,
        depthWrite: false,
      });
      const packet = new THREE.Mesh(packetGeo, packetMat);
      globeGroup.add(packet);

      packetMeshes.push({
        mesh: packet,
        points: curvePoints,
        progress: (pairIdx * 0.17) % 1,
        speed: 0.0045 + (pairIdx % 3) * 0.0015,
        pair: [idx1, idx2],
      });
    });

    // Apply initial tier visibility
    pinObjects.forEach((p) => {
      const isVisible = activeTier === 'all' || p.hub.tier === activeTier;
      p.mesh.visible = isVisible;
      p.lightBeam.visible = isVisible;
      p.ring1.visible = isVisible;
      p.ring2.visible = isVisible;
    });

    arcLinesList.forEach(({ line, pair: [idx1, idx2] }) => {
      const h1 = BRICS_HUBS[idx1];
      const h2 = BRICS_HUBS[idx2];
      if (!h1 || !h2) return;
      const isArcActive =
        activeTier === 'all' ||
        (activeTier === 'core'
          ? h1.tier === 'core' && h2.tier === 'core'
          : activeTier === 'member'
          ? h1.tier === 'member' || h2.tier === 'member'
          : h1.tier === 'partner' || h2.tier === 'partner');
      line.visible = isArcActive;
    });

    packetMeshes.forEach(({ mesh, pair: [idx1, idx2] }) => {
      const h1 = BRICS_HUBS[idx1];
      const h2 = BRICS_HUBS[idx2];
      if (!h1 || !h2) return;
      const isArcActive =
        activeTier === 'all' ||
        (activeTier === 'core'
          ? h1.tier === 'core' && h2.tier === 'core'
          : activeTier === 'member'
          ? h1.tier === 'member' || h2.tier === 'member'
          : h1.tier === 'partner' || h2.tier === 'partner');
      mesh.visible = isArcActive;
    });

    // ────────────────────────────────────────────────────────────────────────────
    // 8. Distant Multidimensional Starfield
    // ────────────────────────────────────────────────────────────────────────────
    const starCount = isMobile ? 120 : 260;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 24;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 24 - 4;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMat = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ────────────────────────────────────────────────────────────────────────────
    // Initial Target Orientation (Upright)
    // ────────────────────────────────────────────────────────────────────────────
    const initialHub = BRICS_HUBS[activeHubIndex] ?? BRICS_HUBS[0]!;
    const targetQuaternion = getUprightCountryQuaternion(initialHub.lat, initialHub.lon);
    globeGroup.quaternion.copy(targetQuaternion);

    sceneStateRef.current = {
      globeGroup,
      targetQuaternion,
      isTransitioning: false,
      activeIdx: activeHubIndex,
      activeTier,
      highlightCanvas,
      highlightTexture,
      borderLines: borderLinesList,
      pinObjects,
      arcLines: arcLinesList,
      packetMeshes,
    };

    // ────────────────────────────────────────────────────────────────────────────
    // 9. Interactive Dragging, Raycasting & Render Loop
    // ────────────────────────────────────────────────────────────────────────────
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let velocity = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getCanvasRelativeCoords = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((clientY - rect.top) / rect.height) * 2 - 1),
      };
    };

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      if (sceneStateRef.current) sceneStateRef.current.isTransitioning = false;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      velocity = { x: 0, y: 0 };
    };

    const onPointerMove = (e: MouseEvent) => {
      const coords = getCanvasRelativeCoords(e.clientX, e.clientY);
      mouse.x = coords.x;
      mouse.y = coords.y;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        const targetVelX = deltaX * 0.0045;
        const targetVelY = deltaY * 0.0045;

        // Exponential smoothing on drag velocity for fluid inertia
        velocity.x = velocity.x * 0.4 + targetVelX * 0.6;
        velocity.y = velocity.y * 0.4 + targetVelY * 0.6;

        // Apply horizontal rotation around world Y axis (preserves upright orientation)
        const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), velocity.x);
        // Apply vertical rotation around world X axis
        const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), velocity.y);
        globeGroup.quaternion.premultiply(qX).premultiply(qY);

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerUp = () => {
      if (isDragging && Math.abs(velocity.x) < 0.002 && Math.abs(velocity.y) < 0.002) {
        raycaster.setFromCamera(mouse, camera);
        const clickableMeshes = pinObjects.filter((p) => p.mesh.visible).map((p) => p.mesh);
        const intersects = raycaster.intersectObjects(clickableMeshes);
        if (intersects.length > 0) {
          const hit = intersects[0]?.object as any;
          if (hit && hit.hubIndex !== undefined && onSelectHub) {
            onSelectHub(hit.hubIndex);
          }
        }
      }
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1 && e.touches[0]) {
        isDragging = true;
        if (sceneStateRef.current) sceneStateRef.current.isTransitioning = false;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        velocity = { x: 0, y: 0 };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1 && e.touches[0]) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - previousMousePosition.x;
        const deltaY = touch.clientY - previousMousePosition.y;

        const targetVelX = deltaX * 0.0055;
        const targetVelY = deltaY * 0.0055;

        velocity.x = velocity.x * 0.4 + targetVelX * 0.6;
        velocity.y = velocity.y * 0.4 + targetVelY * 0.6;

        const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), velocity.x);
        const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), velocity.y);
        globeGroup.quaternion.premultiply(qX).premultiply(qY);

        previousMousePosition = { x: touch.clientX, y: touch.clientY };
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const canvasElem = renderer.domElement;
    canvasElem.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    canvasElem.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    let animId: number;
    const startTime = performance.now();
    let lastTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastTime) * 0.001, 0.05); // Frame-rate independent delta time clamped to max 50ms
      lastTime = now;
      const elapsed = (now - startTime) * 0.001;
      const state = sceneStateRef.current;

      // Ultra-Smooth Upright Fly-to rotation with exponential decay
      if (state && state.isTransitioning) {
        const slerpFactor = 1 - Math.exp(-6.8 * dt);
        globeGroup.quaternion.slerp(state.targetQuaternion, slerpFactor);
        if (globeGroup.quaternion.angleTo(state.targetQuaternion) < 0.002) {
          globeGroup.quaternion.copy(state.targetQuaternion);
          state.isTransitioning = false;
        }
      } else if (!isDragging) {
        // Natural fluid inertia damping around world axes
        if (Math.abs(velocity.x) > 0.00002 || Math.abs(velocity.y) > 0.00002) {
          const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), velocity.x);
          const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), velocity.y);
          globeGroup.quaternion.premultiply(qX).premultiply(qY);
          const decay = Math.exp(-4.2 * dt);
          velocity.x *= decay;
          velocity.y *= decay;
        }

        // Silky slow idle rotation around world Y axis (keeps North Pole permanently UP)
        if (!prefersReducedMotion && Math.abs(velocity.x) < 0.0004 && (!state || !state.isTransitioning)) {
          const idleAngle = 0.0012 * dt * 60;
          const qIdle = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), idleAngle);
          globeGroup.quaternion.premultiply(qIdle);
        }
      }

      // Rotate Clouds layer with gentle continuous atmospheric drift
      cloudsMesh.rotation.y = elapsed * 0.006;

      // Continuous Sub-Pixel Gliding for Data Flow Packets (no stepped stutter)
      packetMeshes.forEach((item) => {
        if (!item.mesh.visible) return;
        item.progress = (item.progress + item.speed * dt * 60) % 1;

        const totalSteps = item.points.length - 1;
        const exactPos = item.progress * totalSteps;
        const idx0 = Math.floor(exactPos);
        const idx1 = Math.min(idx0 + 1, totalSteps);
        const frac = exactPos - idx0;
        const p0 = item.points[idx0];
        const p1 = item.points[idx1];
        if (p0 && p1) {
          item.mesh.position.lerpVectors(p0, p1, frac);
        }
      });

      // Harmonic Sinusoidal Pulse Waves for Sonar Rings & Beacons
      pinObjects.forEach(({ mesh, lightBeam, ring1, ring2, index }) => {
        if (!mesh.visible) return;
        const currentActive = state ? state.activeIdx : activeHubIndex;
        const isHighlight = index === currentActive;
        const scaleBase = isHighlight ? 1.32 : 1.0;

        // Smooth continuous pin pulse
        const pinScale = scaleBase + Math.sin(elapsed * 2.8 + index * 1.2) * 0.12;
        mesh.scale.set(pinScale, pinScale, pinScale);

        // Continuous harmonic sonar rings (zero linear jump)
        const ring1Phase = (elapsed * 0.75 + index * 0.35) % 1;
        const ring1Ease = Math.sin(ring1Phase * Math.PI * 0.5);
        const ring1Scale = 1.0 + ring1Ease * 1.7;
        const ring1Opacity = Math.cos(ring1Phase * Math.PI * 0.5) * (isHighlight ? 0.9 : 0.45);
        ring1.scale.set(ring1Scale, ring1Scale, ring1Scale);
        (ring1.material as THREE.MeshBasicMaterial).opacity = ring1Opacity;

        const ring2Phase = (elapsed * 0.75 + index * 0.35 + 0.5) % 1;
        const ring2Ease = Math.sin(ring2Phase * Math.PI * 0.5);
        const ring2Scale = 1.0 + ring2Ease * 1.9;
        const ring2Opacity = Math.cos(ring2Phase * Math.PI * 0.5) * (isHighlight ? 0.65 : 0.3);
        ring2.scale.set(ring2Scale, ring2Scale, ring2Scale);
        (ring2.material as THREE.MeshBasicMaterial).opacity = ring2Opacity;

        // Atmospheric beacon stalk pulse
        (lightBeam.material as THREE.MeshBasicMaterial).opacity = isHighlight
          ? 0.75 + Math.sin(elapsed * 3.2 + index) * 0.2
          : 0.32;
      });

      // Check hover state on pins
      if (!isDragging) {
        raycaster.setFromCamera(mouse, camera);
        const clickableMeshes = pinObjects.filter((p) => p.mesh.visible).map((p) => p.mesh);
        const intersects = raycaster.intersectObjects(clickableMeshes);
        if (intersects.length > 0) {
          const hit = intersects[0]?.object as any;
          if (hit && hit.hubData) {
            setHoveredHub(hit.hubData);
            container.style.cursor = 'pointer';
          }
        } else {
          setHoveredHub(null);
          container.style.cursor = isDragging ? 'grabbing' : 'grab';
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvasElem.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      canvasElem.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      earthGeo.dispose();
      earthMat.dispose();
      earthDayMap.dispose();
      earthNormalMap.dispose();
      earthSpecularMap.dispose();
      earthCloudsMap.dispose();
      earthLightsMap.dispose();

      highlightGeo.dispose();
      highlightMat.dispose();
      highlightTexture.dispose();

      cloudsGeo.dispose();
      cloudsMat.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      starGeo.dispose();
      starMat.dispose();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      sceneStateRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[560px] flex items-center justify-center">
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D Photorealistic BRICS Earth Knowledge Globe"
      />

      {/* Floating Active/Hovered Hub Badge */}
      {hoveredHub && (
        <div className="absolute top-4 left-4 z-20 pointer-events-none rounded-xl border border-white/20 bg-black/80 p-3 text-white backdrop-blur-md shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xl">{hoveredHub.flag}</span>
            <div>
              <p className="text-xs font-bold text-white">{hoveredHub.name} Hub</p>
              <p className="text-[10px] font-mono text-[#2AD58B]">{hoveredHub.city}</p>
            </div>
          </div>
          <p className="mt-1 text-[11px] text-white/80 max-w-[220px]">{hoveredHub.focus}</p>
        </div>
      )}
    </div>
  );
}
