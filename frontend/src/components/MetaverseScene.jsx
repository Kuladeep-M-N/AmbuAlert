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

    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(20, 30, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

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

    // 3. Ground & Procedural City
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // City Blocks
    const bldgGroup = new THREE.Group();
    const bldgGeo = new THREE.BoxGeometry(1, 1, 1);
    const bldgMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: 0x0a1929, emissiveIntensity: 0.1 }),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x112240, emissiveIntensity: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0x020c1b, emissiveIntensity: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0x223344, emissive: 0x12243d, emissiveIntensity: 0.15 })
    ];
    
    // Generate scattered buildings with variable colors
    for(let i=0; i<150; i++) {
        let x = (Math.random() - 0.5) * 100;
        let z = (Math.random() - 0.5) * 100;
        if(Math.abs(x) < 5 && Math.abs(z) < 5) continue; // Keep center clear
        let h = Math.random() * 8 + 2;
        if(Math.random() > 0.8) h += 15; // Skyscrapers
        
        let mat = bldgMaterials[Math.floor(Math.random() * bldgMaterials.length)];
        let mesh = new THREE.Mesh(bldgGeo, mat);
        mesh.position.set(x, h/2, z);
        mesh.scale.set(Math.random() * 3 + 2, h, Math.random() * 3 + 2);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        bldgGroup.add(mesh);
    }
    scene.add(bldgGroup);

    // Grid (Roads)
    const gridSize = 200;
    const gridDivisions = 40;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x334155, 0x0f172a);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
    elementsRef.current.gridHelper = gridHelper;

    // ----- Dynamic Entities -----

    // Function to create ambulance (improved models)
    const createAmbulance = () => {
        const ag = new THREE.Group();
        const baseMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
        
        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 3), baseMat);
        body.position.y = 0.8;
        body.castShadow = true;
        ag.add(body);

        // Lights
        const lightMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000 });
        const siren = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 0.4), lightMat);
        siren.position.set(0, 1.5, 0.8);
        ag.add(siren);
        elementsRef.current.sirenMat = lightMat;

        // Add a PointLight attached to ambulance
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

    // Create Civilian Vehicles
    const createCivilianCar = () => {
        const cg = new THREE.Group();
        const colors = [0xffffff, 0xaaaaaa, 0xcc0000, 0x0044cc, 0x222222, 0x118833];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3 });
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });
        
        // Chassis
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 2.6), bodyMat);
        chassis.position.y = 0.4;
        chassis.castShadow = true;
        cg.add(chassis);
        
        // Cabin
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.4), windowMat);
        cabin.position.y = 0.85;
        cabin.position.z = -0.2;
        cabin.castShadow = true;
        cg.add(cabin);
        
        // Return object wrapping the group and state
        return {
            mesh: cg,
            dir: (Math.random() > 0.5 ? new THREE.Vector3(1,0,0) : new THREE.Vector3(0,0,1)).multiplyScalar(Math.random() > 0.5 ? 1 : -1),
            speed: Math.random() * 0.05 + 0.05,
            turningLock: 0 // cooldown to prevent spinning
        };
    };

    const cars = [];
    const stepSize = gridSize / gridDivisions; // 5 units per grid cell
    for(let i=0; i<30; i++) {
        let carObj = createCivilianCar();
        // Snap cars to grid lines (roads) at start
        let sqX = Math.round(((Math.random() - 0.5)*180) / stepSize) * stepSize;
        let sqZ = Math.round(((Math.random() - 0.5)*180) / stepSize) * stepSize;
        carObj.mesh.position.set(sqX, 0, sqZ);
        scene.add(carObj.mesh);
        cars.push(carObj);
    }

    // Create Patient / Civilian Area
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

    // Create Hospital
    const hospGeo = new THREE.BoxGeometry(4, 9, 6);
    const hospMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1d4ed8, emissiveIntensity: 0.1 });
    const hospMesh = new THREE.Mesh(hospGeo, hospMat);
    hospMesh.position.y = 4.5;
    hospMesh.castShadow = true;
    scene.add(hospMesh);
    elementsRef.current.hospital = hospMesh;

    // 5. Animation Loop
    let animationId;
    let clock = new THREE.Clock();
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      let time = clock.getElapsedTime();

      // Flashing siren effect
      if (elementsRef.current.sirenMat) {
         let intensity = (Math.sin(time * 15) + 1) / 2;
         elementsRef.current.sirenMat.emissiveIntensity = intensity * 2;
         elementsRef.current.ambLight.intensity = intensity * 15;
      }
      
      // Patient ring pulsing
      if (elementsRef.current.patient && elementsRef.current.patient.group.visible) {
         let scale = (Math.sin(time * 5) + 1) * 0.5 + 0.5;
         elementsRef.current.patient.ring.scale.set(scale, scale, scale);
      }

      // Procedural Traffic movements along grid roads
      cars.forEach(c => {
          c.mesh.position.addScaledVector(c.dir, c.speed);
          
          // Face forward
          let target = c.mesh.position.clone().add(c.dir);
          c.mesh.lookAt(target);

          // Wrap around edges
          if (c.mesh.position.x > 95) c.mesh.position.x = -95;
          if (c.mesh.position.x < -95) c.mesh.position.x = 95;
          if (c.mesh.position.z > 95) c.mesh.position.z = -95;
          if (c.mesh.position.z < -95) c.mesh.position.z = 95;

          // Turning logic at intersections (multiples of 5)
          if (c.turningLock > 0) c.turningLock--;
          
          let remX = Math.abs(c.mesh.position.x % stepSize);
          let remZ = Math.abs(c.mesh.position.z % stepSize);
          
          // If close to grid intersection, possibly turn 90 degrees
          if (c.turningLock === 0 && (remX < 0.2 || remX > stepSize - 0.2) && (remZ < 0.2 || remZ > stepSize - 0.2)) {
              if (Math.random() < 0.2) { // 20% chance to turn
                  // swap directions
                  let nextDir = new THREE.Vector3();
                  if (Math.abs(c.dir.x) > 0) {
                      nextDir.z = Math.random() > 0.5 ? 1 : -1;
                      nextDir.x = 0;
                  } else {
                      nextDir.x = Math.random() > 0.5 ? 1 : -1;
                      nextDir.z = 0;
                  }
                  c.dir.copy(nextDir);
                  
                  // Snap slightly to intersection center to keep alignment
                  c.mesh.position.x = Math.round(c.mesh.position.x / stepSize) * stepSize;
                  c.mesh.position.z = Math.round(c.mesh.position.z / stepSize) * stepSize;
                  
                  c.turningLock = 60; // 60 frames before can turn again
              }
          }
      });

      renderer.render(scene, camera);
    };
    animate();

    // 6. Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
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

      // Patient
      const pX = toX(patient.location[1]);
      const pZ = toZ(patient.location[0]);
      
      const patObj = elementsRef.current.patient;
      patObj.group.visible = true;
      patObj.group.position.set(pX, 0, pZ);
      
      const isCritical = patient.severity === 'CRITICAL';
      if (isCritical) {
        patObj.material.color.setHex(0xff0000); // Glow Red
        patObj.material.emissive.setHex(0xff0000);
        patObj.ring.material.color.setHex(0xff0000);
        elementsRef.current.gridHelper.material.color.setHex(0xef4444); // Roads turn red
        elementsRef.current.ambientLight.color.setHex(0xef4444); 
      } else {
        patObj.material.color.setHex(0xeab308); 
        patObj.material.emissive.setHex(0xca8a04);
        patObj.ring.material.color.setHex(0xeab308);
        elementsRef.current.gridHelper.material.color.setHex(0x334155); 
        elementsRef.current.ambientLight.color.setHex(0xffffff);
      }

      // Ambulance
      const ambMesh = elementsRef.current.ambulance;
      ambMesh.visible = true;
      
      const aX = toX(ambulance.location[1]);
      const aZ = toZ(ambulance.location[0]);
      
      ambMesh.position.set(aX, 0, aZ);
      
      // Face direction of movement
      let targetLoc = patient.status === 'AWAITING_AMBULANCE' ? patient.location : hospital.location;
      let tX = toX(targetLoc[1]);
      let tZ = toZ(targetLoc[0]);
      ambMesh.lookAt(tX, 0, tZ);

      // Hospital
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
