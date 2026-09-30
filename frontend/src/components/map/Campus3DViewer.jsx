import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const CAMPUS_LOCATIONS = [
  {
    id: 'sjb-block',
    name: 'Silver Jubilee Block (SJB)',
    teluguName: 'సిల్వర్ జూబ్లీ బ్లాక్',
    category: 'academic',
    categoryLabel: 'Academic & Main Hub',
    badgeColor: '#E91E63',
    position: [-38, 0, -25],
    cameraPos: [-38, 38, 25],
    targetPos: [-38, 5, -25],
    description:
      'The iconic quadrangle block featuring grand lecture halls, landscaped courtyard quad with central dome, and central fest registration desks.',
    festRole: 'Academic & Main Fest Hub — Project Exhibitions, Hackathons, Central Helpdesk',
    highlights: [
      'Inauguration & Keynote Sessions',
      'Technical Paper Presentations',
      'Surrounded by Festival Stalls & Cultural Exhibits',
      'Central Info Desk & Registration Counters',
    ],
    details:
      'Located along Silver Jubilee Block Road with lush green inner gardens and the distinctive central rotunda canopy.',
    roadAccess: 'Silver Jubilee Block Road',
  },
  {
    id: 'cyber-block',
    name: 'Cyber & Hi-Tech Block',
    teluguName: 'సైబర్ & హై-టెక్ బ్లాక్',
    category: 'academic',
    categoryLabel: 'Tech & Computing',
    badgeColor: '#19CFE8',
    position: [-35, 0, 45],
    cameraPos: [-35, 34, 95],
    targetPos: [-35, 5, 45],
    description:
      'Modern multi-tier computing complex with glass facades, solar panels, and star-shaped inner courtyard gardens beside Cyber & Digital Block Road.',
    festRole: 'Tech Flagship Center — Coding Contests, AI Summits & LAN Gaming',
    highlights: [
      '24-Hour Code Clash Hackathon',
      'Web3 & AI Model Showcases',
      'LAN Esports & High-Performance Lab Tournaments',
      'Robotics Demonstration Lab',
    ],
    details:
      'Situated right beside Cyber & Digital Block Road. Features state-of-the-art computer centers and seminar halls.',
    roadAccess: 'Cyber & Digital Block Road',
  },
  {
    id: 'play-ground',
    name: 'Main Play Ground',
    teluguName: 'కాలేజ్ ప్లే గ్రౌండ్',
    category: 'sports',
    categoryLabel: 'Sports & Games Arena',
    badgeColor: '#7ED957',
    position: [32, 0, -28],
    cameraPos: [32, 45, 25],
    targetPos: [32, 0, -28],
    description:
      'Massive college sports arena hosting all outdoor sports, athletic events, games competitions, and evening celebration stage, completely encircled all around by festival & sports stalls.',
    festRole: 'All Sports & Outdoor Games Arena — Ringed all around by 16+ Festival Stalls',
    highlights: [
      'Circled completely by festival & refreshment stalls all around the track',
      'Inter-College Cricket & Football Finals',
      'Athletics, Relay & Tug of War Battles',
      'Festival Open Stage & Evening Pro-Show / DJ Night',
      'Spectator Pavilion & Cheering Arenas',
    ],
    details:
      'Directly across Silver Jubilee Block Road from SJB Block. Features full-sized running track, cricket pitch, and stalls lining the entire ground perimeter.',
    roadAccess: 'Silver Jubilee Block Road (East)',
  },
  {
    id: 'ground-stalls',
    name: 'Play Ground Perimeter Stalls',
    teluguName: 'గ్రౌండ్ చుట్టూ ఉన్న స్టాల్స్',
    category: 'stalls',
    categoryLabel: 'Perimeter Stalls Ring',
    badgeColor: '#19CFE8',
    position: [32, 0, 1],
    cameraPos: [32, 28, 30],
    targetPos: [32, 2, -14],
    description:
      'A continuous 360° ring of festival canopies set up all around the college play ground offering sports refreshments, energy drinks, athletic gear, face paint, penalty shootouts, and quick bites.',
    festRole: '16+ Festival & Refreshment Stalls encircling the entire Ground',
    highlights: [
      'Stalls set up all around the full ground perimeter',
      'Sports Energy Bars, Fresh Juices & Tender Coconut',
      'Official Team Jerseys, Wristbands & Flags',
      'Speed Radar & Penalty Shootout Skill Stalls',
      'Spectator Refreshment & Cheering Hubs',
    ],
    details:
      'Lining the outer perimeter walkway all around the Main Play Ground track.',
    roadAccess: 'Play Ground Outer Loop Track',
  },
  {
    id: 'sportplex-block',
    name: 'Sportplex & Basketball Court',
    teluguName: 'స్పోర్ట్‌ప్లెక్స్ & బాస్కెట్‌బాల్ కోర్ట్',
    category: 'games',
    categoryLabel: 'Carnival Games & Sports',
    badgeColor: '#FF7A00',
    position: [38, 0, 28],
    cameraPos: [38, 30, 68],
    targetPos: [38, 4, 28],
    description:
      'Indoor multi-sport complex and regulation dual-color outdoor basketball court, with surrounding Carnival Game Stalls.',
    festRole: 'Sports Plex & Carnival Game Stalls (G01–G10)',
    highlights: [
      'Carnival Game Stalls (Ring Toss, Balloon Dart, VR Gaming)',
      '3v3 Basketball Tournament',
      'Table Tennis, Badminton & Indoor Chess Matches',
      'VR Gaming & Robotics Arena Booths',
    ],
    details:
      'Adjacent to the College Parking Lot and Play Ground. Vibrant spot with fun game challenges and instant prizes.',
    roadAccess: 'Sports Complex Avenue',
  },
  {
    id: 'parking-lot-food',
    name: 'College Parking Lot — Food Court',
    teluguName: 'కాలేజ్ పార్కింగ్ - ఫుడ్ కోర్ట్',
    category: 'food',
    categoryLabel: 'Faculty & Student Dining',
    badgeColor: '#FFD43B',
    position: [2, 0, 36],
    cameraPos: [2, 28, 72],
    targetPos: [2, 3, 36],
    description:
      'Long covered parking canopies transformed into the Grand Festival Food Court, providing breakfast, lunch, snacks, and dining for faculty and students.',
    festRole: 'Grand Food Court & Dining Pavilion for Faculty & Students',
    highlights: [
      'Faculty Dining Pavilion (Reserved covered seating & buffet)',
      'Student Food Street (F01–F10 stalls & Food Trucks)',
      'Biryani Counters, South Indian Tiffins & Street Chaat',
      'Shakes, Smoothies, Mocktails & Ice Cream Hub',
      'Covered Seating with festival string lights',
    ],
    details:
      'Located directly in the college parking area beside the vehicle bays and bus terminal for easy access.',
    roadAccess: 'Central Parking Boulevard / Cyber Rd link',
  },
  {
    id: 'sjb-stalls',
    name: 'Festival Stalls (SJB Perimeter)',
    teluguName: 'ఫెస్టివల్ స్టాల్స్ (ఎస్.జే.బి చుట్టూ)',
    category: 'stalls',
    categoryLabel: 'Festival Stalls & Expo',
    badgeColor: '#8E44FF',
    position: [-38, 0, -4],
    cameraPos: [-38, 25, 30],
    targetPos: [-38, 2, -4],
    description:
      'Lively ring of festive canopies wrapping around the perimeter of Silver Jubilee Block showcasing clubs, merchandise, arts, crafts, and tech exhibits.',
    festRole: 'Festival Stalls, Merch & Student Startup Booths',
    highlights: [
      'Official COLORIDO 2026 Merchandise & Hoodies',
      'Club Booths, Photography & Art Galleries',
      'Henna / Mehendi, Caricature & DIY Crafts',
      'Student Innovation & IoT Project Demos',
    ],
    details:
      'Arranged along the paved walkway promenade surrounding SJB Block.',
    roadAccess: 'Silver Jubilee Block Outer Promenade',
  },
];

const Campus3DViewer = forwardRef(function Campus3DViewer(
  {
    selectedLocationId,
    onSelectLocation,
    isNightMode,
    isAutoRotate,
    isTourActive,
  },
  ref
) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const pinsGroupRef = useRef(null);
  const nightLightsGroupRef = useRef(null);
  const dayLightsGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const balloonGroupRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Camera tween target
  const tweenRef = useRef({
    active: false,
    startTime: 0,
    duration: 1100,
    fromCam: new THREE.Vector3(),
    toCam: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
  });

  // Expose focusLocation via ref
  useImperativeHandle(ref, () => ({
    focusLocation: (locId) => {
      const loc = CAMPUS_LOCATIONS.find((l) => l.id === locId);
      if (!loc || !cameraRef.current || !controlsRef.current) return;

      tweenRef.current = {
        active: true,
        startTime: performance.now(),
        duration: 1100,
        fromCam: cameraRef.current.position.clone(),
        toCam: new THREE.Vector3(...loc.cameraPos),
        fromTarget: controlsRef.current.target.clone(),
        toTarget: new THREE.Vector3(...loc.targetPos),
      };
    },
    resetCamera: () => {
      if (!cameraRef.current || !controlsRef.current) return;
      tweenRef.current = {
        active: true,
        startTime: performance.now(),
        duration: 1200,
        fromCam: cameraRef.current.position.clone(),
        toCam: new THREE.Vector3(0, 68, 78),
        fromTarget: controlsRef.current.target.clone(),
        toTarget: new THREE.Vector3(0, 0, 0),
      };
    },
  }));

  // Handle camera transition when selectedLocationId changes
  useEffect(() => {
    if (!selectedLocationId) return;
    const loc = CAMPUS_LOCATIONS.find((l) => l.id === selectedLocationId);
    if (!loc || !cameraRef.current || !controlsRef.current) return;

    tweenRef.current = {
      active: true,
      startTime: performance.now(),
      duration: 1100,
      fromCam: cameraRef.current.position.clone(),
      toCam: new THREE.Vector3(...loc.cameraPos),
      fromTarget: controlsRef.current.target.clone(),
      toTarget: new THREE.Vector3(...loc.targetPos),
    };
  }, [selectedLocationId]);

  // Handle day/night lighting changes
  useEffect(() => {
    if (!sceneRef.current) return;

    if (isNightMode) {
      sceneRef.current.background = new THREE.Color(0x0c0f1d);
      sceneRef.current.fog = new THREE.FogExp2(0x0c0f1d, 0.007);
      if (dayLightsGroupRef.current) dayLightsGroupRef.current.visible = false;
      if (nightLightsGroupRef.current) nightLightsGroupRef.current.visible = true;
    } else {
      sceneRef.current.background = new THREE.Color(0xdcecf8);
      sceneRef.current.fog = new THREE.FogExp2(0xdcecf8, 0.005);
      if (dayLightsGroupRef.current) dayLightsGroupRef.current.visible = true;
      if (nightLightsGroupRef.current) nightLightsGroupRef.current.visible = false;
    }
  }, [isNightMode]);

  // Handle auto-rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotate;
      controlsRef.current.autoRotateSpeed = 1.0;
    }
  }, [isAutoRotate]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xdcecf8);
    scene.fog = new THREE.FogExp2(0xdcecf8, 0.005);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 600);
    camera.position.set(0, 68, 78);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // --- 2. Orbit Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't dip below ground
    controls.minDistance = 15;
    controls.maxDistance = 220;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // --- 3. Lighting Systems ---
    // A) Daytime Lighting
    const dayLights = new THREE.Group();
    dayLightsGroupRef.current = dayLights;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.85);
    dayLights.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff6e5, 1.4);
    sunLight.position.set(70, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 280;
    sunLight.shadow.camera.left = -90;
    sunLight.shadow.camera.right = 90;
    sunLight.shadow.camera.top = 90;
    sunLight.shadow.camera.bottom = -90;
    sunLight.shadow.bias = -0.0005;
    dayLights.add(sunLight);

    const dayFill = new THREE.DirectionalLight(0xbbe1fa, 0.45);
    dayFill.position.set(-60, 40, -50);
    dayLights.add(dayFill);
    scene.add(dayLights);

    // B) Night / Festival Mode Lighting
    const nightLights = new THREE.Group();
    nightLightsGroupRef.current = nightLights;
    nightLights.visible = false;

    const nightAmbient = new THREE.AmbientLight(0x192138, 0.9);
    nightLights.add(nightAmbient);

    const moonLight = new THREE.DirectionalLight(0x5588cc, 0.5);
    moonLight.position.set(-50, 90, -40);
    moonLight.castShadow = true;
    nightLights.add(moonLight);

    // Playground floodlights (4 high poles)
    const floodColors = [0xffffff, 0xffeedd];
    const floodlightPositions = [
      [15, 24, -45],
      [49, 24, -45],
      [15, 24, -11],
      [49, 24, -11],
    ];
    floodlightPositions.forEach((pos, idx) => {
      const flood = new THREE.PointLight(floodColors[idx % 2], 2.2, 45, 1.2);
      flood.position.set(...pos);
      nightLights.add(flood);
    });

    // SJB Dome Uplight (Golden Fest Glow)
    const sjbUplight = new THREE.PointLight(0xffaa22, 2.5, 35, 1.3);
    sjbUplight.position.set(-38, 12, -25);
    nightLights.add(sjbUplight);

    // Cyber Block Neon Cyan Glow
    const cyberGlow = new THREE.PointLight(0x00f0ff, 2.8, 40, 1.4);
    cyberGlow.position.set(-35, 10, 45);
    nightLights.add(cyberGlow);

    // Food Court Warm Fairy Lights Glow
    const foodGlow = new THREE.PointLight(0xffaa44, 2.6, 45, 1.2);
    foodGlow.position.set(2, 8, 36);
    nightLights.add(foodGlow);

    // Sportplex & Games Festive Purple/Pink Glow
    const gamesGlow = new THREE.PointLight(0xee33bb, 2.2, 38, 1.3);
    gamesGlow.position.set(38, 9, 28);
    nightLights.add(gamesGlow);

    scene.add(nightLights);

    // --- 4. Campus Ground & Terrain ---
    // Main terrain base
    const terrainGeo = new THREE.PlaneGeometry(190, 190);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x6e8f52, // Lush campus lawn green
      roughness: 0.88,
      metalness: 0.05,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.rotation.x = -Math.PI / 2;
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // Outer border boundary (earth/campus perimeter)
    const borderGeo = new THREE.BoxGeometry(192, 0.4, 192);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x475638, roughness: 0.9 });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.y = -0.22;
    scene.add(borderMesh);

    // --- 5. Road Network ---
    const roadsGroup = new THREE.Group();
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x33373d, roughness: 0.85 });
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, roughness: 0.7 });
    const roadMarkMat = new THREE.MeshBasicMaterial({ color: 0xf3f3f3 });

    // Road helper
    const createRoad = (width, length, x, z, rotY = 0, name = '') => {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(width, length), roadMat);
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = rotY;
      road.position.set(x, 0.03, z);
      road.receiveShadow = true;
      roadsGroup.add(road);

      // Curbs on sides
      const curbLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, length), curbMat);
      curbLeft.rotation.y = rotY;
      curbLeft.position.set(x - (width / 2) * Math.cos(rotY), 0.05, z - (width / 2) * Math.sin(rotY));
      roadsGroup.add(curbLeft);

      const curbRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, length), curbMat);
      curbRight.rotation.y = rotY;
      curbRight.position.set(x + (width / 2) * Math.cos(rotY), 0.05, z + (width / 2) * Math.sin(rotY));
      roadsGroup.add(curbRight);

      // Dashed center markings
      const dashCount = Math.floor(length / 4);
      for (let i = -dashCount / 2; i <= dashCount / 2; i++) {
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 1.8), roadMarkMat);
        dash.rotation.x = -Math.PI / 2;
        dash.rotation.z = rotY;
        const dx = -i * 3.8 * Math.sin(rotY);
        const dz = i * 3.8 * Math.cos(rotY);
        dash.position.set(x + dx, 0.035, z + dz);
        roadsGroup.add(dash);
      }
    };

    // 1. "Silver Jubilee Block Road" (running between SJB Block and Play Ground)
    createRoad(7.5, 110, -8, -12, 0, 'Silver Jubilee Block Rd');

    // 2. "Cyber & Digital Block Road" (running in front of Cyber Block)
    createRoad(7.5, 130, -5, 20, Math.PI / 2, 'Cyber & Digital Block Rd');

    // 3. East Connector Road (leading towards Parking & Sportplex)
    createRoad(6.5, 95, 60, 0, 0, 'East Campus Ave');

    // 4. North Connector
    createRoad(6, 120, 0, -68, Math.PI / 2, 'North Perimeter Rd');

    // 5. South Perimeter
    createRoad(6, 120, 0, 68, Math.PI / 2, 'South Perimeter Rd');

    scene.add(roadsGroup);

    // --- 6. ARCHITECTURAL 3D MODELS ---

    // ==========================================
    // A) SILVER JUBILEE BLOCK (SJB) MODEL
    // Quadrangle shape with inner courtyard & dome
    // ==========================================
    const sjbGroup = new THREE.Group();
    sjbGroup.position.set(-38, 0, -25);

    const sjbWallMat = new THREE.MeshStandardMaterial({
      color: 0xe6d7b8, // Light sandstone / warm cream
      roughness: 0.75,
    });
    const sjbTrimMat = new THREE.MeshStandardMaterial({
      color: 0x9e3328, // Terracotta red accent trim
      roughness: 0.6,
    });
    const sjbRoofMat = new THREE.MeshStandardMaterial({
      color: 0x5a5550, // Dark roof
      roughness: 0.8,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x3a6073,
      metalness: 0.85,
      roughness: 0.15,
      transparent: true,
      opacity: 0.85,
    });

    // SJB Base Plinth
    const sjbPlinth = new THREE.Mesh(new THREE.BoxGeometry(42, 0.6, 38), sjbTrimMat);
    sjbPlinth.position.y = 0.3;
    sjbPlinth.castShadow = true;
    sjbPlinth.receiveShadow = true;
    sjbGroup.add(sjbPlinth);

    // 4 Wings of SJB Quad: North, South, East, West
    const wingN = new THREE.Mesh(new THREE.BoxGeometry(40, 8.5, 7.5), sjbWallMat);
    wingN.position.set(0, 4.8, -14.5);
    wingN.castShadow = true;
    sjbGroup.add(wingN);

    const wingS = new THREE.Mesh(new THREE.BoxGeometry(40, 8.5, 7.5), sjbWallMat);
    wingS.position.set(0, 4.8, 14.5);
    wingS.castShadow = true;
    sjbGroup.add(wingS);

    const wingW = new THREE.Mesh(new THREE.BoxGeometry(7.5, 8.5, 23), sjbWallMat);
    wingW.position.set(-16.2, 4.8, 0);
    wingW.castShadow = true;
    sjbGroup.add(wingW);

    const wingE = new THREE.Mesh(new THREE.BoxGeometry(7.5, 8.5, 23), sjbWallMat);
    wingE.position.set(16.2, 4.8, 0);
    wingE.castShadow = true;
    sjbGroup.add(wingE);

    // Terracotta roof rims
    const roofRimGeo = new THREE.BoxGeometry(41, 0.4, 8.5);
    const roofN = new THREE.Mesh(roofRimGeo, sjbRoofMat);
    roofN.position.set(0, 9.2, -14.5);
    sjbGroup.add(roofN);
    const roofS = new THREE.Mesh(roofRimGeo, sjbRoofMat);
    roofS.position.set(0, 9.2, 14.5);
    sjbGroup.add(roofS);

    // Entrance Portico with pillars
    const porticoRoof = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 5), sjbTrimMat);
    porticoRoof.position.set(0, 5.5, 18.5);
    sjbGroup.add(porticoRoof);
    for (let p = -3.5; p <= 3.5; p += 2.3) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5.5), sjbWallMat);
      pillar.position.set(p, 2.75, 20.2);
      sjbGroup.add(pillar);
    }

    // Windows rows on SJB wings
    const addWindows = (width, height, count, posX, posY, posZ, rotY = 0) => {
      for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * 3.4;
        const win = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.8), glassMat);
        win.rotation.y = rotY;
        if (rotY === 0) win.position.set(posX + offset, posY, posZ);
        else win.position.set(posX, posY, posZ + offset);
        sjbGroup.add(win);
      }
    };
    addWindows(1.4, 1.8, 8, 0, 3.5, 18.3);
    addWindows(1.4, 1.8, 8, 0, 6.5, 18.3);
    addWindows(1.4, 1.8, 8, 0, 3.5, -18.3, Math.PI);
    addWindows(1.4, 1.8, 8, 0, 6.5, -18.3, Math.PI);

    // Central SJB Courtyard Quadrangle (Garden Lawn)
    const quadLawn = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 21),
      new THREE.MeshStandardMaterial({ color: 0x4d7c2f, roughness: 0.9 })
    );
    quadLawn.rotation.x = -Math.PI / 2;
    quadLawn.position.set(0, 0.62, 0);
    sjbGroup.add(quadLawn);

    // Walkway cross paths in courtyard
    const quadPath1 = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 21),
      new THREE.MeshStandardMaterial({ color: 0xd2c7b5, roughness: 0.8 })
    );
    quadPath1.rotation.x = -Math.PI / 2;
    quadPath1.position.set(0, 0.63, 0);
    sjbGroup.add(quadPath1);

    const quadPath2 = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 3.5),
      new THREE.MeshStandardMaterial({ color: 0xd2c7b5, roughness: 0.8 })
    );
    quadPath2.rotation.x = -Math.PI / 2;
    quadPath2.position.set(0, 0.63, 0);
    sjbGroup.add(quadPath2);

    // Iconic SJB Golden Central Dome / Rotunda
    const domeCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.8, 2.2, 16),
      new THREE.MeshStandardMaterial({ color: 0xe0d0b0, roughness: 0.5 })
    );
    domeCylinder.position.set(0, 1.7, 0);
    sjbGroup.add(domeCylinder);

    const domeHemisphere = new THREE.Mesh(
      new THREE.SphereGeometry(3.6, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({
        color: 0xe5a93b, // Golden metallic dome
        metalness: 0.7,
        roughness: 0.25,
      })
    );
    domeHemisphere.position.set(0, 2.8, 0);
    sjbGroup.add(domeHemisphere);

    // SJB 3D Signboard
    const sjbSignMat = new THREE.MeshBasicMaterial({ color: 0x9e3328 });
    const sjbSign = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 0.2), sjbSignMat);
    sjbSign.position.set(0, 8.8, 18.5);
    sjbGroup.add(sjbSign);

    scene.add(sjbGroup);

    // ==========================================
    // B) FESTIVAL STALLS (AROUND SJB BLOCK)
    // Decorated canopies with striped awnings
    // ==========================================
    const stallColors = [
      [0xe91e63, 0xffffff], // Pink / White
      [0xff7a00, 0xffd43b], // Orange / Yellow
      [0x19cfe8, 0x121217], // Cyan / Dark
      [0x8e44ff, 0xffffff], // Purple / White
      [0x7ed957, 0x121217], // Green / Dark
      [0xe91e63, 0xffd43b], // Pink / Yellow
      [0x00bcd4, 0xffffff], // Cyan / White
      [0xff5722, 0xffeb3b], // Deep Orange / Light Yellow
    ];

    const createStall = (x, z, rotY = 0, stallIndex = 0, name = '') => {
      const stallGroup = new THREE.Group();
      stallGroup.position.set(x, 0, z);
      stallGroup.rotation.y = rotY;

      // Platform
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.25, 2.8),
        new THREE.MeshStandardMaterial({ color: 0x4a4a50, roughness: 0.8 })
      );
      base.position.y = 0.125;
      stallGroup.add(base);

      // 4 Steel Poles
      const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.5);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7 });
      [
        [-1.5, -1.2],
        [1.5, -1.2],
        [-1.5, 1.2],
        [1.5, 1.2],
      ].forEach(([px, pz]) => {
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(px, 1.25, pz);
        stallGroup.add(pole);
      });

      // Colorful Festival Canopy (Pyramid / Tent)
      const [colA] = stallColors[stallIndex % stallColors.length];
      const canopyGeo = new THREE.ConeGeometry(2.4, 1.2, 4);
      const canopyMat = new THREE.MeshStandardMaterial({
        color: colA,
        roughness: 0.4,
      });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(0, 2.85, 0);
      canopy.rotation.y = Math.PI / 4;
      canopy.castShadow = true;
      stallGroup.add(canopy);

      // Counter desk
      const desk = new THREE.Mesh(
        new THREE.BoxGeometry(3.0, 0.9, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xd9c5a0 })
      );
      desk.position.set(0, 0.55, 0.6);
      stallGroup.add(desk);

      // Mini fairy light under canopy
      const stallLight = new THREE.PointLight(colA, 0.8, 6, 1.8);
      stallLight.position.set(0, 2.2, 0);
      nightLights.add(stallLight);

      scene.add(stallGroup);
    };

    // Stalls wrapping around SJB Block (User requested: "stalls are kept around that block")
    const sjbStallsPositions = [
      [-14, -8, -Math.PI / 2, 'Merchandise Stall'],
      [-14, -15, -Math.PI / 2, 'Robotics Demo'],
      [-14, -22, -Math.PI / 2, 'Colorido Fest Swag'],
      [-14, -29, -Math.PI / 2, 'Art & Craft Stall'],
      [-14, -36, -Math.PI / 2, 'Photo Booth & Polaroids'],
      [-22, -3, 0, 'Cultural Club Booth'],
      [-30, -3, 0, 'Literary & Quiz Stall'],
      [-40, -3, 0, 'Student Startup Hub'],
    ];

    sjbStallsPositions.forEach(([sx, sz, sRot, sName], idx) => {
      createStall(sx, sz, sRot, idx, sName);
    });

    // ==========================================
    // C) CYBER BLOCK & HI-TECH BLOCK MODEL
    // Beside Cyber & Digital Block Rd
    // ==========================================
    const cyberGroup = new THREE.Group();
    cyberGroup.position.set(-35, 0, 45);

    const cyberWallMat = new THREE.MeshStandardMaterial({
      color: 0xdcd8d0, // Modern light architectural concrete
      roughness: 0.5,
    });
    const cyberDarkMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d, // Sleek slate charcoal
      roughness: 0.35,
    });
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x15294e, // Solar cell dark indigo
      metalness: 0.9,
      roughness: 0.1,
    });

    // Cyber Wing 1 (Main Hi-Tech building)
    const cyberWing1 = new THREE.Mesh(new THREE.BoxGeometry(38, 9.5, 14), cyberWallMat);
    cyberWing1.position.set(0, 5.2, -6);
    cyberWing1.castShadow = true;
    cyberGroup.add(cyberWing1);

    // Cyber Wing 2 (Connected Cyber & Digital Wing)
    const cyberWing2 = new THREE.Mesh(new THREE.BoxGeometry(34, 9.5, 12), cyberWallMat);
    cyberWing2.position.set(-2, 5.2, 11);
    cyberWing2.castShadow = true;
    cyberGroup.add(cyberWing2);

    // Large Ribbon Glass Facade (Tech aesthetic)
    const cyberGlass1 = new THREE.Mesh(new THREE.PlaneGeometry(32, 2.5), glassMat);
    cyberGlass1.position.set(0, 4.2, 1.1);
    cyberGroup.add(cyberGlass1);

    const cyberGlass2 = new THREE.Mesh(new THREE.PlaneGeometry(32, 2.5), glassMat);
    cyberGlass2.position.set(0, 7.5, 1.1);
    cyberGroup.add(cyberGlass2);

    // Solar Panel Arrays on Cyber Roof
    for (let sx = -12; sx <= 12; sx += 6) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.2, 8), solarMat);
      panel.position.set(sx, 10.2, -6);
      panel.rotation.x = 0.08;
      cyberGroup.add(panel);
    }

    // Star-shaped geometric courtyard lawn (as seen in satellite map)
    const starLawn = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshStandardMaterial({ color: 0x3d7025, roughness: 0.9 })
    );
    starLawn.rotation.x = -Math.PI / 2;
    starLawn.position.set(0, 0.52, 2);
    cyberGroup.add(starLawn);

    // Connecting glass skybridge
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 6), cyberDarkMat);
    bridge.position.set(12, 6, 2);
    cyberGroup.add(bridge);

    // Cyber Block Neon Roof Accent
    const cyberNeonBar = new THREE.Mesh(
      new THREE.BoxGeometry(22, 0.4, 0.4),
      new THREE.MeshBasicMaterial({ color: 0x19cfe8 })
    );
    cyberNeonBar.position.set(0, 10.1, 1.1);
    cyberGroup.add(cyberNeonBar);

    scene.add(cyberGroup);

    // Parked College Buses along Cyber Road (Yellow Buses from image 1)
    const busMat = new THREE.MeshStandardMaterial({ color: 0xffc107, roughness: 0.4 });
    const busWheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    for (let b = 0; b < 4; b++) {
      const bus = new THREE.Group();
      bus.position.set(-6 + b * 5, 0.9, 60);
      bus.rotation.y = Math.PI / 2;

      const busBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 6.2), busMat);
      busBody.castShadow = true;
      bus.add(busBody);

      const busWindows = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.6, 5.2), glassMat);
      busWindows.position.y = 0.3;
      bus.add(busWindows);

      // Wheels
      [
        [-1.15, -0.65, 1.8],
        [1.15, -0.65, 1.8],
        [-1.15, -0.65, -1.8],
        [1.15, -0.65, -1.8],
      ].forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12), busWheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, wy, wz);
        bus.add(wheel);
      });

      scene.add(bus);
    }

    // ==========================================
    // D) MAIN PLAY GROUND (SPORTS & GAMES)
    // User: "ground here contain all spots and games"
    // ==========================================
    const groundGroup = new THREE.Group();
    groundGroup.position.set(32, 0, -28);

    // Running Track (Terracotta / Red clay oval)
    const trackGeo = new THREE.RingGeometry(18, 25, 32);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0xa94b38, roughness: 0.85 });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.rotation.x = -Math.PI / 2;
    track.position.y = 0.04;
    track.receiveShadow = true;
    groundGroup.add(track);

    // Track Lanes (White lines)
    const laneGeo = new THREE.RingGeometry(21.4, 21.6, 32);
    const laneMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lane = new THREE.Mesh(laneGeo, laneMat);
    lane.rotation.x = -Math.PI / 2;
    lane.position.y = 0.045;
    groundGroup.add(lane);

    // Football / Cricket Center Turf
    const pitchTurf = new THREE.Mesh(
      new THREE.CircleGeometry(18, 32),
      new THREE.MeshStandardMaterial({ color: 0x4a7e32, roughness: 0.9 })
    );
    pitchTurf.rotation.x = -Math.PI / 2;
    pitchTurf.position.y = 0.05;
    pitchTurf.receiveShadow = true;
    groundGroup.add(pitchTurf);

    // Cricket Pitch Strip
    const cricketStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 14),
      new THREE.MeshStandardMaterial({ color: 0xc8b282, roughness: 0.8 })
    );
    cricketStrip.rotation.x = -Math.PI / 2;
    cricketStrip.position.y = 0.06;
    groundGroup.add(cricketStrip);

    // Football Goalposts
    const goalMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const createGoal = (zPos) => {
      const gGroup = new THREE.Group();
      gGroup.position.set(0, 0, zPos);
      const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2), goalMat);
      postL.position.set(-2.5, 1.1, 0);
      gGroup.add(postL);
      const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2), goalMat);
      postR.position.set(2.5, 1.1, 0);
      gGroup.add(postR);
      const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5.0), goalMat);
      cross.rotation.z = Math.PI / 2;
      cross.position.set(0, 2.2, 0);
      gGroup.add(cross);
      return gGroup;
    };
    groundGroup.add(createGoal(-13));
    groundGroup.add(createGoal(13));

    // Sports Pavilion Canopy & Spectator Seating
    const pavilion = new THREE.Mesh(
      new THREE.BoxGeometry(16, 4.5, 5),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    pavilion.position.set(0, 2.3, -24);
    pavilion.castShadow = true;
    groundGroup.add(pavilion);

    const festBanner = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 1.2),
      new THREE.MeshBasicMaterial({ color: 0x7ed957 })
    );
    festBanner.position.set(0, 3.8, -21.4);
    groundGroup.add(festBanner);

    scene.add(groundGroup);

    // ==========================================
    // FESTIVAL STALLS ALL AROUND THE PLAY GROUND
    // User: "in that ground keep stalls all around the ground"
    // ==========================================
    const groundCenter = { x: 32, z: -28 };
    const groundStallRadius = 28.8; // Encircles the running track (radius 25)
    const numGroundStalls = 16;

    const groundStallNames = [
      'Sports Refreshments & Hydration Hub',
      'Energy Drinks & Electrolyte Bar',
      'Athletic Gear & Fest Jerseys',
      'Cheerleading & Face Paint Booth',
      'Fast-Bowling Speed Radar Kiosk',
      'Football Penalty Shootout Stall',
      'Fitness & Arm Wrestling Booth',
      'Colorido Caps & Headbands',
      'Snack Shack & Hot Corn',
      'Fresh Juices & Tender Coconut',
      'Ice Cream & Popsicle Stand',
      'Badminton & Table Tennis Desk',
      'First Aid & Sports Physio Station',
      'Tug-of-War Registration Booth',
      'Mini-Golf & Putting Challenge',
      'Festival Sports Live Radio Desk',
    ];

    const groundBuntingPoints = [];

    for (let i = 0; i < numGroundStalls; i++) {
      const angle = (i / numGroundStalls) * Math.PI * 2;

      // Skip the exact spot directly behind the pavilion center (angle ~ 1.5 * PI)
      if (Math.abs(angle - 1.5 * Math.PI) < 0.22) {
        continue;
      }

      const sx = groundCenter.x + groundStallRadius * Math.cos(angle);
      const sz = groundCenter.z + groundStallRadius * Math.sin(angle);

      // Rotate stall so it faces inward toward the ground center
      const sRot = Math.atan2(groundCenter.x - sx, groundCenter.z - sz);

      // Create stall with alternating vibrant festive colors
      createStall(sx, sz, sRot, (i + 2) % stallColors.length, groundStallNames[i]);

      groundBuntingPoints.push(new THREE.Vector3(sx, 2.9, sz));
    }

    // Connect all ground stalls with festive pennant bunting string lights
    if (groundBuntingPoints.length > 2) {
      groundBuntingPoints.push(groundBuntingPoints[0].clone()); // Close the ring
      const buntingGeo = new THREE.BufferGeometry().setFromPoints(groundBuntingPoints);
      const buntingMat = new THREE.LineBasicMaterial({
        color: 0xffd43b,
        linewidth: 2,
        transparent: true,
        opacity: 0.85,
      });
      const groundBuntingLine = new THREE.Line(buntingGeo, buntingMat);
      scene.add(groundBuntingLine);
    }
    // E) SPORTPLEX & BASKETBALL COURT + GAME STALLS
    // User: "near sportplex block game stalls are kept"
    // ==========================================
    const sportplexGroup = new THREE.Group();
    sportplexGroup.position.set(38, 0, 28);

    // Sportplex Indoor Stadium Building (Barrel/curved roof)
    const plexBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(22, 8.5, 18),
      new THREE.MeshStandardMaterial({ color: 0xd6d0c4, roughness: 0.6 })
    );
    plexBuilding.position.set(0, 4.25, 0);
    plexBuilding.castShadow = true;
    sportplexGroup.add(plexBuilding);

    // Curved Sportplex Roof
    const plexRoof = new THREE.Mesh(
      new THREE.CylinderGeometry(11.2, 11.2, 22.4, 24, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x2b3848, roughness: 0.4 })
    );
    plexRoof.rotation.z = Math.PI / 2;
    plexRoof.position.set(0, 8.5, 0);
    sportplexGroup.add(plexRoof);

    // Outdoor Basketball Court (Painted green/orange as seen in Image 3)
    const bballGroup = new THREE.Group();
    bballGroup.position.set(22, 0, 0);

    // Green Court Perimeter
    const bballBase = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 26),
      new THREE.MeshStandardMaterial({ color: 0x298056, roughness: 0.7 })
    );
    bballBase.rotation.x = -Math.PI / 2;
    bballBase.position.y = 0.05;
    bballBase.receiveShadow = true;
    bballGroup.add(bballBase);

    // Terracotta-orange inner key & court area
    const bballInner = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 22),
      new THREE.MeshStandardMaterial({ color: 0xd35400, roughness: 0.75 })
    );
    bballInner.rotation.x = -Math.PI / 2;
    bballInner.position.y = 0.055;
    bballGroup.add(bballInner);

    // White court boundary lines
    const courtBorder = new THREE.Mesh(
      new THREE.PlaneGeometry(12.2, 22.2),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    );
    courtBorder.rotation.x = -Math.PI / 2;
    courtBorder.position.y = 0.06;
    bballGroup.add(courtBorder);

    // Basketball Hoops & Backboards
    const hoopPoleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.8);
    const hoopPoleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const backboardMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });
    [-11, 11].forEach((bz) => {
      const hoopPole = new THREE.Mesh(hoopPoleGeo, hoopPoleMat);
      hoopPole.position.set(0, 1.9, bz);
      bballGroup.add(hoopPole);

      const board = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.08), backboardMat);
      board.position.set(0, 3.2, bz - (bz > 0 ? 0.3 : -0.3));
      bballGroup.add(board);

      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.04, 8, 16),
        new THREE.MeshBasicMaterial({ color: 0xff3b30 })
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.set(0, 2.9, bz - (bz > 0 ? 0.6 : -0.6));
      bballGroup.add(rim);
    });

    sportplexGroup.add(bballGroup);
    scene.add(sportplexGroup);

    // CARNIVAL GAME STALLS (User: "near sportplex block game stalls are kept")
    const gameStallsPositions = [
      [24, 18, 0, 'G01: Ring Toss Challenge'],
      [30, 18, 0, 'G02: Balloon Dart Arena'],
      [36, 18, 0, 'G03: VR Meta Quest Booth'],
      [42, 18, 0, 'G04: Robo Soccer Battles'],
      [48, 18, 0, 'G05: Arcade & E-Sports'],
      [54, 18, 0, 'G06: Nerf Blaster & Archery'],
    ];

    gameStallsPositions.forEach(([gx, gz, gRot, gName], idx) => {
      createStall(gx, gz, gRot, (idx + 3) % stallColors.length, gName);
    });

    // ==========================================
    // F) COLLEGE PARKING LOT — GRAND FOOD COURT
    // User: "in college parking lot food is provided for faculty and students"
    // ==========================================
    const parkingLotGroup = new THREE.Group();
    parkingLotGroup.position.set(2, 0, 36);

    // Tarmac ground for parking lot
    const parkTarmac = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 38),
      new THREE.MeshStandardMaterial({ color: 0x3d4148, roughness: 0.85 })
    );
    parkTarmac.rotation.x = -Math.PI / 2;
    parkTarmac.position.y = 0.04;
    parkTarmac.receiveShadow = true;
    parkingLotGroup.add(parkTarmac);

    // Long Covered Parking Sheds (Metal Corrugated Roof as seen in image 3)
    const shedRoofMat = new THREE.MeshStandardMaterial({
      color: 0x8a9ba8, // Silver/galvanized sheet metal
      metalness: 0.6,
      roughness: 0.35,
    });
    const shedTrussMat = new THREE.MeshStandardMaterial({ color: 0x444444 });

    for (let s = -12; s <= 12; s += 8) {
      // Slanted parking bay shed
      const shedRoof = new THREE.Mesh(new THREE.BoxGeometry(22, 0.25, 6.5), shedRoofMat);
      shedRoof.position.set(0, 4.2, s);
      shedRoof.rotation.x = -0.06;
      shedRoof.castShadow = true;
      parkingLotGroup.add(shedRoof);

      // Steel support pillars
      for (let px = -10; px <= 10; px += 5) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.2), shedTrussMat);
        pillar.position.set(px, 2.1, s);
        parkingLotGroup.add(pillar);
      }
    }

    // FESTIVAL FOOD COURT TRANSFORMATION (Under parking lot sheds)
    // 1. "Faculty Dining Pavilion" (Left bays)
    const facultySign = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.8, 0.2),
      new THREE.MeshBasicMaterial({ color: 0xffd43b })
    );
    facultySign.position.set(-6, 3.8, -12);
    parkingLotGroup.add(facultySign);

    // 2. "Student Food Court & Boulevard" (Center & Right bays)
    const studentFoodSign = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.8, 0.2),
      new THREE.MeshBasicMaterial({ color: 0xff7a00 })
    );
    studentFoodSign.position.set(6, 3.8, -12);
    parkingLotGroup.add(studentFoodSign);

    // Food Counters / Buffet lines
    const foodDeskMat = new THREE.MeshStandardMaterial({ color: 0xe85d04 });
    for (let fd = -10; fd <= 10; fd += 4.5) {
      const counter = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 1.2), foodDeskMat);
      counter.position.set(fd, 0.45, -4);
      counter.castShadow = true;
      parkingLotGroup.add(counter);

      // Steaming buffet chafing dish
      const dish = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12),
        new THREE.MeshStandardMaterial({ color: 0xd0d0d0, metalness: 0.8 })
      );
      dish.position.set(fd, 1.05, -4);
      parkingLotGroup.add(dish);
    }

    // Festive Dining Tables & Umbrellas for Faculty & Students
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 });
    const umbrellaColors = [0xe91e63, 0xff7a00, 0x19cfe8, 0x7ed957, 0xffd43b];

    const diningTablePositions = [
      [-6, 4],
      [-6, 11],
      [0, 4],
      [0, 11],
      [6, 4],
      [6, 11],
    ];

    diningTablePositions.forEach(([tx, tz], idx) => {
      // Table
      const table = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.1, 16), tableMat);
      table.position.set(tx, 0.8, tz);
      parkingLotGroup.add(table);

      const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8), tableMat);
      tableLeg.position.set(tx, 0.4, tz);
      parkingLotGroup.add(tableLeg);

      // Colorful Festive Umbrella
      const umbrella = new THREE.Mesh(
        new THREE.ConeGeometry(1.8, 0.7, 8),
        new THREE.MeshStandardMaterial({
          color: umbrellaColors[idx % umbrellaColors.length],
          roughness: 0.3,
        })
      );
      umbrella.position.set(tx, 2.6, tz);
      parkingLotGroup.add(umbrella);

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 2.6),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
      );
      pole.position.set(tx, 1.3, tz);
      parkingLotGroup.add(pole);
    });

    scene.add(parkingLotGroup);

    // ==========================================
    // G) CAMPUS TREES & GREENERY LANDSCAPING
    // ==========================================
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.9 });
    const foliageMatA = new THREE.MeshStandardMaterial({ color: 0x2d6a2e, roughness: 0.8 });
    const foliageMatB = new THREE.MeshStandardMaterial({ color: 0x3d8236, roughness: 0.8 });

    const createTree = (x, z, scale = 1) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);
      tree.scale.set(scale, scale, scale);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2.2), trunkMat);
      trunk.position.y = 1.1;
      trunk.castShadow = true;
      tree.add(trunk);

      // Layered crown
      const crown1 = new THREE.Mesh(
        new THREE.SphereGeometry(1.4, 8, 8),
        scale % 2 === 0 ? foliageMatA : foliageMatB
      );
      crown1.position.y = 2.8;
      crown1.castShadow = true;
      tree.add(crown1);

      const crown2 = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 8, 8),
        scale % 2 === 0 ? foliageMatB : foliageMatA
      );
      crown2.position.y = 3.8;
      crown2.castShadow = true;
      tree.add(crown2);

      scene.add(tree);
    };

    // Tree avenues along Silver Jubilee Rd & Cyber Rd
    const treePositions = [
      // Along SJB Road
      [-12, -45, 1.1],
      [-12, -35, 1.0],
      [-12, -25, 1.2],
      [-12, -15, 0.9],
      [-12, -5, 1.1],
      [-12, 5, 1.0],
      [-4, -45, 1.0],
      [-4, -35, 1.2],
      [-4, -25, 0.9],
      [-4, -15, 1.1],
      [-4, -5, 1.0],
      [-4, 5, 1.2],

      // Cyber Block perimeter
      [-14, 28, 1.1],
      [-14, 38, 1.0],
      [-14, 48, 1.2],
      [-14, 58, 0.9],
      [-56, 28, 1.0],
      [-56, 42, 1.1],
      [-56, 56, 1.2],

      // Playground perimeter
      [12, -52, 1.2],
      [24, -52, 1.0],
      [36, -52, 1.1],
      [48, -52, 1.3],
      [56, -42, 1.0],
      [56, -30, 1.1],
      [56, -18, 1.2],

      // Parking & Sportsplex divider
      [18, 22, 1.1],
      [18, 32, 1.0],
      [18, 42, 1.2],
      [18, 52, 0.9],
    ];

    treePositions.forEach(([tx, tz, ts]) => createTree(tx, tz, ts));

    // ==========================================
    // H) FESTIVE BALLOONS & CELEBRATION PARTICLES
    // Floating gently in the campus sky
    // ==========================================
    const balloonGroup = new THREE.Group();
    balloonGroupRef.current = balloonGroup;

    const balloonColors = [0xe91e63, 0xff7a00, 0x19cfe8, 0xffd43b, 0x8e44ff, 0x7ed957];
    const balloonObjs = [];

    for (let i = 0; i < 28; i++) {
      const bColor = balloonColors[i % balloonColors.length];
      const bMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 12, 12),
        new THREE.MeshStandardMaterial({
          color: bColor,
          roughness: 0.2,
          metalness: 0.1,
        })
      );
      const bx = (Math.random() - 0.5) * 120;
      const by = 14 + Math.random() * 16;
      const bz = (Math.random() - 0.5) * 120;
      bMesh.position.set(bx, by, bz);
      balloonGroup.add(bMesh);

      balloonObjs.push({
        mesh: bMesh,
        origY: by,
        speed: 0.008 + Math.random() * 0.012,
        phase: Math.random() * Math.PI * 2,
      });
    }
    scene.add(balloonGroup);

    // ==========================================
    // I) INTERACTIVE 3D LOCATION PINS
    // Glowing markers hovering over each landmark
    // ==========================================
    const pinsGroup = new THREE.Group();
    pinsGroupRef.current = pinsGroup;

    CAMPUS_LOCATIONS.forEach((loc) => {
      const pinHolder = new THREE.Group();
      pinHolder.position.set(loc.position[0], 0, loc.position[2]);
      pinHolder.userData = { locationId: loc.id };

      // Pin Needle (Cone pointing down)
      const pinNeedle = new THREE.Mesh(
        new THREE.ConeGeometry(0.8, 2.2, 16),
        new THREE.MeshStandardMaterial({
          color: loc.badgeColor,
          roughness: 0.2,
          metalness: 0.4,
        })
      );
      pinNeedle.rotation.x = Math.PI;
      pinNeedle.position.y = 8.8;
      pinNeedle.userData = { locationId: loc.id };
      pinHolder.add(pinNeedle);

      // Pin Head (Sphere)
      const pinHead = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 18, 18),
        new THREE.MeshStandardMaterial({
          color: loc.badgeColor,
          roughness: 0.2,
          metalness: 0.3,
        })
      );
      pinHead.position.y = 10.4;
      pinHead.userData = { locationId: loc.id };
      pinHolder.add(pinHead);

      // Glowing Inner Core
      const pinCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      pinCore.position.y = 10.4;
      pinCore.userData = { locationId: loc.id };
      pinHolder.add(pinCore);

      // Pulsing Ground Ring
      const groundRing = new THREE.Mesh(
        new THREE.RingGeometry(2.4, 2.8, 24),
        new THREE.MeshBasicMaterial({
          color: loc.badgeColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65,
        })
      );
      groundRing.rotation.x = -Math.PI / 2;
      groundRing.position.y = 0.08;
      pinHolder.add(groundRing);

      pinsGroup.add(pinHolder);
    });

    scene.add(pinsGroup);

    // ==========================================
    // 7. CLICK & RAYCASTING INTERACTION
    // ==========================================
    const handleClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(pinsGroup.children, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.userData?.locationId && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.locationId) {
          onSelectLocation(obj.userData.locationId);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // ==========================================
    // 8. RESIZE LISTENER
    // ==========================================
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // ==========================================
    // 9. ANIMATION LOOP
    // ==========================================
    const animStartTime = performance.now();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - animStartTime) * 0.001;

      // Controls update
      controls.update();

      // Camera tweening animation
      if (tweenRef.current.active) {
        const now = performance.now();
        const progress = Math.min((now - tweenRef.current.startTime) / tweenRef.current.duration, 1);
        // Smooth easeOutCubic
        const ease = 1 - Math.pow(1 - progress, 3);

        camera.position.lerpVectors(tweenRef.current.fromCam, tweenRef.current.toCam, ease);
        controls.target.lerpVectors(tweenRef.current.fromTarget, tweenRef.current.toTarget, ease);

        if (progress >= 1) {
          tweenRef.current.active = false;
        }
      }

      // Animate Pins (gentle floating bob + ground ring pulsation)
      if (pinsGroupRef.current) {
        pinsGroupRef.current.children.forEach((holder, idx) => {
          const needle = holder.children[0];
          const head = holder.children[1];
          const core = holder.children[2];
          const ring = holder.children[3];

          const bob = Math.sin(elapsedTime * 2.5 + idx * 0.8) * 0.6;
          if (needle) needle.position.y = 8.8 + bob;
          if (head) head.position.y = 10.4 + bob;
          if (core) core.position.y = 10.4 + bob;

          if (ring) {
            const pulse = 1 + 0.15 * Math.sin(elapsedTime * 3 + idx * 0.8);
            ring.scale.set(pulse, pulse, 1);
            ring.material.opacity = 0.5 + 0.3 * Math.sin(elapsedTime * 3 + idx * 0.8);
          }
        });
      }

      // Animate Festive Balloons
      balloonObjs.forEach((b) => {
        b.mesh.position.y = b.origY + Math.sin(elapsedTime * 1.5 + b.phase) * 1.4;
        b.mesh.rotation.y += b.speed;
      });

      renderer.render(scene, camera);
    };

    animate();

    // ==========================================
    // CLEANUP
    // ==========================================
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('click', handleClick);
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing outline-none" />
    </div>
  );
});

export default Campus3DViewer;
