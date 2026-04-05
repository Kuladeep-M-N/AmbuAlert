import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function MetaverseScene({ sysState }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const elementsRef = useRef({});
  
  // Base coordinate to normalize LatLng directly into 3D Space
  const baseLat = 12.9716;
  const baseLng = 77.5946;
  const SCALE = 700; // Multiplier to turn degrees into ThreeJS units

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617'); // slate-950
    scene.fog = new THREE.FogExp2('#020617', 0.015);
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(30, 45, 60);
    camera.lookAt(0, 0, 0);

    const updateSize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      if (width === 0 || height === 0) return false;
      
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      return true;
    };

    if (!updateSize()) {
      // Retry after layout computes
      setTimeout(updateSize, 100);
    }

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    elementsRef.current.ambientLight = ambientLight;
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const criticalLight = new THREE.PointLight(0xff0000, 0, 100);
    criticalLight.position.set(0, 20, 0);
    scene.add(criticalLight);
    elementsRef.current.criticalLight = criticalLight;

    // 3. Ground & Procedural Cyber-City
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x020617, 
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Pulse Wave Grid
    const gridInner = new THREE.GridHelper(400, 80, 0x1e293b, 0x0f172a);
    gridInner.position.y = 0.05;
    scene.add(gridInner);

    const pulseGrid = new THREE.GridHelper(400, 20, 0x0ea5e9, 0x0ea5e9);
    pulseGrid.position.y = 0.1;
    pulseGrid.material.transparent = true;
    pulseGrid.material.opacity = 0.1;
    scene.add(pulseGrid);
    elementsRef.current.pulseGrid = pulseGrid;

    // Advanced City Generation
    const cityGroup = new THREE.Group();
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    
    for(let i=0; i<300; i++) {
        const x = (Math.random() - 0.5) * 350;
        const z = (Math.random() - 0.5) * 350;
        // Keep center clear for mission focus
        if(Math.sqrt(x*x + z*z) < 20) continue; 

        const h = Math.random() * 15 + 4;
        const w = Math.random() * 4 + 2;
        const d = Math.random() * 4 + 2;
        
        const bCol = new THREE.Color().setHSL(0.6, 0.5, Math.random() * 0.1 + 0.05);
        const bMat = new THREE.MeshStandardMaterial({ color: bCol, roughness: 0.2 });
        const building = new THREE.Mesh(boxGeo, bMat);
        building.position.set(x, h/2, z);
        building.scale.set(w, h, d);
        building.castShadow = true;
        building.receiveShadow = true;
        cityGroup.add(building);

        // Add Window Grids (Neon Emissive)
        if (Math.random() > 0.4) {
            const winMat = new THREE.MeshStandardMaterial({ 
                color: 0x000000, 
                emissive: new THREE.Color().setHSL(Math.random() * 0.1 + 0.5, 0.8, 0.5),
                emissiveIntensity: Math.random() * 0.5
            });
            const windows = new THREE.Mesh(boxGeo, winMat);
            windows.position.set(x, h/2, z);
            windows.scale.set(w + 0.1, h * 0.8, d + 0.1);
            cityGroup.add(windows);
        }
    }
    scene.add(cityGroup);

    // Grid
    const gridSize = 200;
    const gridDivisions = 40;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x334155, 0x0f172a);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
    elementsRef.current.gridHelper = gridHelper;

    // ----- Dynamic Entities -----
    const createAmbulance = () => {
        const ag = new THREE.Group();
        const baseMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 3), baseMat);
        body.position.y = 0.8;
        body.castShadow = true;
        ag.add(body);

        const lightMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000 });
        const siren = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 0.4), lightMat);
        siren.position.set(0, 1.5, 0.8);
        ag.add(siren);
        elementsRef.current.sirenMat = lightMat;

        const ambLight = new THREE.PointLight(0xff0000, 0, 15);
        ambLight.position.set(0, 2, 0);
        ag.add(ambLight);
        elementsRef.current.ambLight = ambLight;

        return ag;
    };
    
    const ambMesh = createAmbulance();
    scene.add(ambMesh);
    ambMesh.visible = false;
    elementsRef.current.ambulance = ambMesh;

    const createCivilianCar = () => {
        const cg = new THREE.Group();
        const colors = [0xffffff, 0xaaaaaa, 0xcc0000, 0x0044cc, 0x222222];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3 });
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });
        
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 2.6), bodyMat);
        chassis.position.y = 0.4;
        chassis.castShadow = true;
        cg.add(chassis);
        
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.4), windowMat);
        cabin.position.y = 0.85;
        cabin.position.z = -0.2;
        cabin.castShadow = true;
        cg.add(cabin);
        
        return {
            mesh: cg,
            dir: (Math.random() > 0.5 ? new THREE.Vector3(1,0,0) : new THREE.Vector3(0,0,1)).multiplyScalar(Math.random() > 0.5 ? 1 : -1),
            speed: Math.random() * 0.05 + 0.05,
            turningLock: 0 
        };
    };

    const cars = [];
    const stepSize = gridSize / gridDivisions;
    for(let i=0; i<30; i++) {
        let carObj = createCivilianCar();
        let sqX = Math.round(((Math.random() - 0.5)*180) / stepSize) * stepSize;
        let sqZ = Math.round(((Math.random() - 0.5)*180) / stepSize) * stepSize;
        carObj.mesh.position.set(sqX, 0, sqZ);
        scene.add(carObj.mesh);
        cars.push(carObj);
    }

    const createHologram = (text) => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, 256, 64);
        ctx.font = 'bold 40px Inter, sans-serif';
        ctx.fillStyle = '#0ea5e9';
        ctx.textAlign = 'center';
        ctx.fillText(text, 128, 45);
        
        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(10, 2.5, 1);
        return sprite;
    };

    const createPerson = () => {
        const pg = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1), mat);
        body.position.y = 0.5;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.25), mat);
        head.position.y = 1.2;
        pg.add(body);
        pg.add(head);
        const alertRing = new THREE.Mesh(
           new THREE.RingGeometry(0.8, 1.2, 16),
           new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide })
        );
        alertRing.rotation.x = Math.PI / 2;
        alertRing.position.y = 0.1;
        pg.add(alertRing);
        return { group: pg, material: mat, ring: alertRing };
    };

    const patObj = createPerson();
    scene.add(patObj.group);
    patObj.group.visible = false;
    elementsRef.current.patient = patObj;
    
    const patLabel = createHologram('PATIENT');
    patLabel.position.y = 3;
    patObj.group.add(patLabel);
    elementsRef.current.patLabel = patLabel;

    const ambLabel = createHologram('AMBULANCE');
    ambLabel.position.y = 4;
    ambMesh.add(ambLabel);
    elementsRef.current.ambLabel = ambLabel;

    const hospGeo = new THREE.BoxGeometry(4, 9, 6);
    const hospMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1d4ed8, emissiveIntensity: 0.1 });
    const hospMesh = new THREE.Mesh(hospGeo, hospMat);
    hospMesh.position.y = 4.5;
    hospMesh.castShadow = true;
    scene.add(hospMesh);
    elementsRef.current.hospital = hospMesh;

    // Animation Loop
    let animationId;
    let clock = new THREE.Clock();
    const trailPoints = [];

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      // Pulse Grid Effect
      if (elementsRef.current.pulseGrid) {
        const s = (Math.sin(time) + 1.2) * 1.5;
        elementsRef.current.pulseGrid.scale.set(s, 1, s);
        elementsRef.current.pulseGrid.material.opacity = (Math.cos(time * 2) + 1) * 0.05;
      }

      // Siren & Vitals
      if (elementsRef.current.sirenMat) {
         let intensity = (Math.sin(time * 15) + 1) / 2;
         elementsRef.current.sirenMat.emissiveIntensity = intensity * 2;
         elementsRef.current.ambLight.intensity = intensity * 15;
      }
      if (elementsRef.current.patient && elementsRef.current.patient.group.visible) {
         let scale = (Math.sin(time * 5) + 1) * 0.5 + 0.5;
         elementsRef.current.patient.ring.scale.set(scale, scale, scale);
      }

      // Cinematic Follow Camera
      const amb = elementsRef.current.ambulance;
      if (amb && amb.visible) {
          // Target position: slightly behind and above the ambulance
          const targetPos = new THREE.Vector3().copy(amb.position).add(new THREE.Vector3(15, 20, 25));
          camera.position.lerp(targetPos, 0.03); // Smooth transition
          camera.lookAt(amb.position);
      } else {
          // Global Command View
          const idlePos = new THREE.Vector3(30, 45, 60);
          camera.position.lerp(idlePos, 0.01);
          camera.lookAt(0, 0, 0);
      }

      cars.forEach(c => {
          c.mesh.position.addScaledVector(c.dir, c.speed);
          c.mesh.lookAt(c.mesh.position.clone().add(c.dir));
          if (c.mesh.position.x > 180) c.mesh.position.x = -180;
          if (c.mesh.position.x < -180) c.mesh.position.x = 180;
          if (c.mesh.position.z > 180) c.mesh.position.z = -180;
          if (c.mesh.position.z < -180) c.mesh.position.z = 180;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      updateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Sync state to 3D positions
  useEffect(() => {
    if (!sysState || !elementsRef.current.ambulance) return;
    const { patient, ambulance, hospital, systemStatus } = sysState;
    if (systemStatus === 'ACTIVE' && patient && ambulance) {
      const toX = (lng) => (lng - baseLng) * SCALE;
      const toZ = (lat) => -(lat - baseLat) * SCALE;
      const pX = toX(patient.location[1]);
      const pZ = toZ(patient.location[0]);
      const patObj = elementsRef.current.patient;
      patObj.group.visible = true;
      patObj.group.position.set(pX, 0, pZ);
      const isCritical = patient.severity === 'CRITICAL';
      if (isCritical) {
        patObj.material.color.setHex(0xff0000);
        patObj.material.emissive.setHex(0xff0000);
        patObj.ring.material.color.setHex(0xff0000);
        elementsRef.current.gridHelper.material.color.setHex(0xef4444);
        elementsRef.current.ambientLight.color.setHex(0xef4444); 
      } else {
        patObj.material.color.setHex(0xeab308); 
        patObj.material.emissive.setHex(0xca8a04);
        patObj.ring.material.color.setHex(0xeab308);
        elementsRef.current.gridHelper.material.color.setHex(0x334155); 
        elementsRef.current.ambientLight.color.setHex(0xffffff);
      }
      const ambMesh = elementsRef.current.ambulance;
      ambMesh.visible = true;
      const aX = toX(ambulance.location[1]);
      const aZ = toZ(ambulance.location[0]);
      ambMesh.position.set(aX, 0, aZ);
      let targetLoc = patient.status === 'AWAITING_AMBULANCE' ? patient.location : hospital.location;
      ambMesh.lookAt(toX(targetLoc[1]), 0, toZ(targetLoc[0]));
      const hospMesh = elementsRef.current.hospital;
      hospMesh.position.set(toX(hospital.location[1]), 4.5, toZ(hospital.location[0]));
      hospMesh.material.emissiveIntensity = 0.5;
    } else {
      elementsRef.current.ambulance.visible = false;
      elementsRef.current.patient.group.visible = false;
      elementsRef.current.hospital.material.emissiveIntensity = 0.1;
      elementsRef.current.gridHelper.material.color.setHex(0x334155);
      elementsRef.current.ambientLight.color.setHex(0xffffff);
    }
  }, [sysState]);

  return <div ref={mountRef} className="w-full h-full" />;
}
