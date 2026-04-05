import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { socket } from '../socket';

// ── GPS → Scene coordinate conversion ────────────────────────────────────────
const ORIG_LAT = 12.9716, ORIG_LNG = 77.5946;
const LAT_S = 111000 / 70, LNG_S = 96500 / 70;
function gps(lat, lng) {
  return { x: (lng - ORIG_LNG) * LNG_S, z: -(lat - ORIG_LAT) * LAT_S };
}

// ── Color palette ─────────────────────────────────────────────────────────────
const C = {
  bg:        0x060c18,
  bgDay:     0xb8d4f0,
  ground:    0x080d1a,
  groundDay: 0xc8c4be,
  grid:      0x0a2a50,
  gridDay:   0x8896a8,
  cyan:      0x00d4ff,
  magenta:   0xff00cc,
  green:     0x00ff88,
  orange:    0xff8800,
  red:       0xff2244,
  yellow:    0xffee00,
};

const BLDG_COLORS_NIGHT = [0x0d2137,0x091728,0x112244,0x0c1f38,0x080f20];
const BLDG_COLORS_DAY   = [0xd6d0c8,0xcbc5be,0xbfb9b2,0xd0cac3,0xe0dbd4];
const GRID = 20, CELL = 6.5;

// ── Build city using InstancedMesh (massive perf gain) ────────────────────────
function buildCity(scene, refs) {
  const rng = (a, b) => Math.random() * (b - a) + a;
  const slots = [];
  for (let gx = -GRID + 1; gx < GRID - 1; gx++) {
    for (let gz = -GRID + 1; gz < GRID - 1; gz++) {
      if (Math.random() < 0.32) continue;
      slots.push({
        x: gx * CELL + rng(-1.2, 1.2),
        z: gz * CELL + rng(-1.2, 1.2),
        w: rng(1.2, 3.2),
        d: rng(1.2, 3.2),
        h: rng(2, rng(5, 26)),
        ci: Math.floor(Math.random() * BLDG_COLORS_NIGHT.length),
      });
    }
  }

  // One InstancedMesh per colour group — greatly reduces draw calls
  const groups = BLDG_COLORS_NIGHT.map(() => []);
  slots.forEach(s => groups[s.ci].push(s));

  const allMeshes = [];
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0.25 });

  groups.forEach((grp, ci) => {
    if (!grp.length) return;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const m = mat.clone();
    m.color.setHex(BLDG_COLORS_NIGHT[ci]);
    m.emissive.setHex(0x050c1a);
    const im = new THREE.InstancedMesh(geo, m, grp.length);
    im.castShadow = true;
    const dummy = new THREE.Object3D();
    grp.forEach((s, i) => {
      dummy.position.set(s.x, s.h / 2, s.z);
      dummy.scale.set(s.w, s.h, s.d);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
    scene.add(im);
    allMeshes.push(im);
  });
  refs.buildings.current = allMeshes;

  // Neon edge wireframes — sample every 3rd building for perf
  const edgeMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.22 });
  slots.filter((_, i) => i % 3 === 0).forEach(s => {
    const geo = new THREE.BoxGeometry(s.w, s.h, s.d);
    const edges = new THREE.EdgesGeometry(geo);
    const color = Math.random() > 0.6 ? C.cyan : (Math.random() > 0.5 ? C.magenta : 0x1e5fa8);
    const em = edgeMat.clone(); em.color.setHex(color);
    const line = new THREE.LineSegments(edges, em);
    line.position.set(s.x, s.h / 2, s.z);
    scene.add(line);
    geo.dispose();
  });

  // Rooftop beacons on tall buildings
  const bGeo = new THREE.SphereGeometry(0.2, 5, 5);
  slots.filter(s => s.h > 12).forEach(s => {
    const bMat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0xff3333 : 0xffaa00,
    });
    const b = new THREE.Mesh(bGeo, bMat);
    b.position.set(s.x, s.h + 0.25, s.z);
    scene.add(b);
  });

  // Ground
  const gGeo = new THREE.PlaneGeometry(GRID * CELL * 2.1, GRID * CELL * 2.1);
  const gMat = new THREE.MeshStandardMaterial({ color: C.ground, roughness: 0.95 });
  const ground = new THREE.Mesh(gGeo, gMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  refs.ground.current = ground;

  // Animated hex-grid ground overlay
  const gridMat = new THREE.LineBasicMaterial({ color: C.grid, transparent: true, opacity: 0.5 });
  const gridLines = [];
  for (let i = -GRID; i <= GRID; i++) {
    const hG = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-GRID * CELL, 0.05, i * CELL),
      new THREE.Vector3(GRID * CELL, 0.05, i * CELL),
    ]);
    const vG = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i * CELL, 0.05, -GRID * CELL),
      new THREE.Vector3(i * CELL, 0.05, GRID * CELL),
    ]);
    const hl = new THREE.Line(hG, gridMat.clone());
    const vl = new THREE.Line(vG, gridMat.clone());
    scene.add(hl); scene.add(vl);
    gridLines.push(hl, vl);
  }
  refs.gridLines.current = gridLines;
}

// ── Detailed ambulance mesh ───────────────────────────────────────────────────
const TEAM_COLORS = {
  'Team Alpha':   C.yellow,
  'Team Bravo':   C.cyan,
  'Team Charlie': C.magenta,
};

function makeAmbulanceMesh(teamColor) {
  const col = teamColor || C.cyan;
  const group = new THREE.Group();

  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.9, 2.6),
    new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.4, metalness: 0.3 })
  );
  body.position.y = 0.5; body.castShadow = true; group.add(body);

  // Cab roof section
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.38, 0.55, 1.2),
    new THREE.MeshStandardMaterial({ color: 0xe8e8f0, roughness: 0.5 })
  );
  roof.position.set(0, 1.15, 0.55); group.add(roof);

  // Red cross stripe
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.5, 2.62),
    new THREE.MeshStandardMaterial({ color: 0xe60026 })
  );
  stripe.position.set(0, 0.5, 0); group.add(stripe);
  const cross = new THREE.Mesh(
    new THREE.BoxGeometry(1.52, 0.5, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xe60026 })
  );
  cross.position.set(0, 0.5, 0); group.add(cross);

  // Windows (dark tinted)
  const wMat = new THREE.MeshStandardMaterial({ color: 0x1a2a3a, roughness: 0.2, metalness: 0.6 });
  const frontW = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.38, 0.05), wMat);
  frontW.position.set(0, 1.1, -1.31); group.add(frontW);

  // Wheels
  const wGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.18, 14);
  const wMat2 = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
  [[-0.78, -0.9], [0.78, -0.9], [-0.78, 0.9], [0.78, 0.9]].forEach(([wx, wz]) => {
    const w = new THREE.Mesh(wGeo, wMat2);
    w.rotation.z = Math.PI / 2; w.position.set(wx, 0.13, wz); group.add(w);
  });

  // Siren bar on roof
  const sirenGeo = new THREE.BoxGeometry(0.9, 0.14, 0.3);
  const sirenMat = new THREE.MeshStandardMaterial({
    color: col, emissive: new THREE.Color(col), emissiveIntensity: 1.8,
  });
  const siren = new THREE.Mesh(sirenGeo, sirenMat);
  siren.position.set(0, 1.47, 0.4); group.add(siren);

  // Siren point light
  const sirenLight = new THREE.PointLight(col, 4, 10);
  sirenLight.position.set(0, 1.6, 0.4);
  group.add(sirenLight);
  group.userData.sirenLight = sirenLight;
  group.userData.sirenMat   = sirenMat;

  // Status ring on ground
  const ringGeo = new THREE.RingGeometry(1.4, 1.75, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: col, side: THREE.DoubleSide, transparent: true, opacity: 0.45,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
  group.userData.ring = ring;
  group.userData.ringMat = ringMat;

  return group;
}

// ── Hospital marker ───────────────────────────────────────────────────────────
function makeHospitalMarker(name) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(3, 5, 3),
    new THREE.MeshStandardMaterial({ color: 0x004422, roughness: 0.4, emissive: 0x002211, emissiveIntensity: 0.5 })
  );
  body.position.y = 2.5; body.castShadow = true; g.add(body);

  const crossH = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 0.55), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
  crossH.position.set(1.55, 3.5, 0); g.add(crossH);
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.2, 0.55), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
  crossV.position.set(1.55, 3.5, 0); g.add(crossV);

  const light = new THREE.PointLight(0x00ff88, 6, 22);
  light.position.set(0, 7, 0); g.add(light);
  g.userData.light = light;
  return g;
}

// ── Patient marker ────────────────────────────────────────────────────────────
function makePatientMarker(severity) {
  const col = severity === 'CRITICAL' ? C.red : severity === 'HIGH' ? C.orange : C.yellow;
  const g = new THREE.Group();
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 2.8, 6),
    new THREE.MeshStandardMaterial({ color: col, emissive: new THREE.Color(col), emissiveIntensity: 0.6 })
  );
  cone.position.y = 1.4; g.add(cone);
  const light = new THREE.PointLight(col, 5, 14);
  light.position.y = 3.5; g.add(light);
  g.userData.light = light;
  return g;
}

// ── Trail / polyline helpers ──────────────────────────────────────────────────
function makeTrail(color) {
  const maxPts = 120;
  const positions = new Float32Array(maxPts * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setDrawRange(0, 0);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 });
  const line = new THREE.Line(geo, mat);
  line.userData = { positions, count: 0, maxPts };
  return line;
}

function pushTrailPoint(trail, x, z) {
  const { positions, maxPts } = trail.userData;
  let { count } = trail.userData;
  if (count >= maxPts) {
    positions.copyWithin(0, 3);
    count = maxPts - 1;
  }
  positions[count * 3]     = x;
  positions[count * 3 + 1] = 0.12;
  positions[count * 3 + 2] = z;
  count++;
  trail.userData.count = count;
  trail.geometry.setDrawRange(0, count);
  trail.geometry.attributes.position.needsUpdate = true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── HUD OVERLAY ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function CmdHUD({ ambulances, incidents, isDayMode, onToggleMode, fps }) {
  const ambs = ambulances || [];
  const incs = incidents  || [];

  const isActive = a =>
    ['DISPATCHED','EN_ROUTE','PICKUP','IN_TRANSIT'].includes(a.status) ||
    ['DISPATCHED','PICKUP','IN_TRANSIT'].includes(a.phase);

  const hudBase = isDayMode
    ? 'bg-white/90 border-blue-200/60 text-slate-800'
    : 'bg-[#060c18]/88 border-cyan-900/50 text-white';
  const accent  = isDayMode ? 'text-blue-600'  : 'text-cyan-400';
  const muted   = isDayMode ? 'text-slate-500' : 'text-slate-500';
  const cardBg  = isDayMode ? 'bg-slate-100 border-slate-200' : 'bg-[#0a1628]/70 border-cyan-900/30';
  const scanCls = isDayMode ? '' : 'before:absolute before:inset-0 before:bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,212,255,0.012)_2px,rgba(0,212,255,0.012)_4px)] before:pointer-events-none before:z-0';

  return (
    <div className={`absolute inset-0 pointer-events-none z-10 flex flex-col justify-between overflow-hidden ${scanCls}`}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div className={`${hudBase} backdrop-blur-xl border-b px-5 py-3 flex justify-between items-center pointer-events-auto shadow-xl relative z-10`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full animate-ping absolute ${isDayMode ? 'bg-blue-500' : 'bg-cyan-400'} opacity-75`} />
            <div className={`w-2.5 h-2.5 rounded-full ${isDayMode ? 'bg-blue-500' : 'bg-cyan-400'}`} />
          </div>
          <div>
            <div className={`text-[11px] font-black tracking-[0.3em] uppercase ${accent}`}>AmbuAlert</div>
            <div className={`text-lg font-black tracking-widest uppercase ${isDayMode ? 'text-slate-800' : 'text-white'} leading-tight`}>
              Metaverse <span className={accent}>Operations</span>
            </div>
            <div className={`text-[9px] ${muted} font-bold tracking-widest uppercase`}>
              3D Real-Time Command Center · {isDayMode ? 'Day Mode' : 'Night Mode'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* FPS counter */}
          <div className={`text-[10px] font-mono px-2.5 py-1.5 rounded border ${fps >= 55 ? 'text-green-400 border-green-900 bg-green-900/20' : fps >= 30 ? 'text-yellow-400 border-yellow-900 bg-yellow-900/20' : 'text-red-400 border-red-900 bg-red-900/20'}`}>
            {fps} FPS
          </div>

          <button
            onClick={onToggleMode}
            className={`px-4 py-2 text-xs font-bold rounded border transition-all duration-200 flex items-center gap-2 ${
              isDayMode
                ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                : 'bg-[#0a1628] border-cyan-800 text-cyan-300 hover:border-cyan-500 hover:text-white'
            }`}
          >
            {isDayMode ? '🌞' : '🌙'}
            <span className={`inline-flex w-8 h-4 rounded-full relative transition-colors duration-300 ${isDayMode ? 'bg-amber-400' : 'bg-slate-700'}`}>
              <span className={`absolute top-0.5 w-3 h-3 rounded-full shadow transition-all duration-300 ${isDayMode ? 'translate-x-4 bg-white' : 'translate-x-0.5 bg-slate-300'}`} />
            </span>
          </button>
        </div>
      </div>

      {/* ── LEFT PANEL ──────────────────────────────────────────────────────── */}
      <div className="absolute top-20 left-4 w-72 flex flex-col gap-3 pointer-events-auto">
        {/* Incidents */}
        <div className={`${hudBase} ${cardBg} rounded-xl border backdrop-blur-xl p-4 shadow-2xl`}>
          <div className={`text-[10px] font-black tracking-[0.2em] uppercase ${accent} mb-3 flex justify-between`}>
            Active Incidents
            <span className={`w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-black ${incs.length > 0 ? 'bg-red-500 text-white' : isDayMode ? 'bg-slate-200 text-slate-500' : 'bg-slate-800 text-slate-400'}`}>
              {incs.length}
            </span>
          </div>
          {incs.length === 0 ? (
            <div className={`text-xs ${muted} italic`}>No active emergencies</div>
          ) : incs.map(inc => (
            <div key={inc.id} className={`rounded-lg p-2.5 mb-2 border text-xs ${isDayMode ? 'bg-red-50 border-red-200' : 'bg-red-900/15 border-red-800/40'}`}>
              <div className="flex justify-between items-center">
                <span className={`font-black text-sm ${isDayMode ? 'text-red-700' : 'text-red-400'}`}>PAT-{inc.id}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest ${
                  inc.severity === 'CRITICAL' ? 'bg-red-500 text-white' :
                  inc.severity === 'HIGH'     ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-black'
                }`}>{inc.severity}</span>
              </div>
            </div>
          ))}

          {/* System Status */}
          <div className={`border-t ${isDayMode ? 'border-slate-200' : 'border-slate-700/50'} mt-3 pt-3`}>
            <div className={`text-[9px] font-black tracking-[0.2em] uppercase ${muted} mb-2`}>System Status</div>
            {[
              { label: 'Network',   val: 'ONLINE',   ok: true },
              { label: 'Coverage',  val: '99.8%',    ok: true },
              { label: 'Avg Resp',  val: '3.2 min',  ok: true },
              { label: 'Uptime',    val: '99.96%',   ok: true },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center py-0.5">
                <span className={`text-[10px] ${muted}`}>{r.label}</span>
                <span className={`text-[10px] font-bold ${r.ok ? (isDayMode ? 'text-green-600' : 'text-green-400') : 'text-red-400'}`}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────────── */}
      <div className="absolute top-20 right-4 w-76 flex flex-col gap-3 pointer-events-auto" style={{width:'300px'}}>
        <div className={`${hudBase} ${cardBg} rounded-xl border backdrop-blur-xl p-4 shadow-2xl`}>
          <div className={`text-[10px] font-black tracking-[0.2em] uppercase ${isDayMode ? 'text-blue-600' : 'text-sky-400'} mb-3 flex justify-between`}>
            Fleet Deployment
            <span className={`w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-black ${isDayMode ? 'bg-blue-100 text-blue-700' : 'bg-sky-900/50 text-sky-300'}`}>
              {ambs.length}
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
            {ambs.map(amb => {
              const active = isActive(amb);
              const teamColor = amb.team === 'Team Alpha'   ? '#ffee00'
                              : amb.team === 'Team Bravo'   ? '#00d4ff'
                              : amb.team === 'Team Charlie' ? '#ff00cc' : '#00d4ff';
              const statusLabel = amb.phase === 'PICKUP' ? 'PICKING UP'
                                : amb.phase === 'IN_TRANSIT' ? 'IN TRANSIT'
                                : amb.status || 'STANDBY';
              const pct = amb.eta > 0 ? Math.max(5, Math.min(95, 100 - (amb.eta / 300) * 100)) : (active ? 95 : 10);

              return (
                <div key={amb.id} className={`rounded-lg p-3 border transition-all duration-300 ${
                  active
                    ? isDayMode ? 'bg-blue-50 border-blue-300' : 'bg-cyan-900/15 border-cyan-700/50'
                    : isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-700/30'
                }`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: teamColor, boxShadow: `0 0 6px ${teamColor}` }} />
                      <span className={`font-black text-sm ${isDayMode ? 'text-slate-800' : 'text-white'}`}>{amb.id}</span>
                      <span className={`text-[9px] ${muted}`}>{amb.team}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest border ${
                      active
                        ? isDayMode ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50'
                        : isDayMode ? 'bg-slate-100 text-slate-500 border-slate-300' : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>{statusLabel}</span>
                  </div>

                  {active && amb.eta > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between mb-1">
                        <span className={`text-[9px] ${muted}`}>ETA</span>
                        <span className={`text-[10px] font-mono font-bold ${isDayMode ? 'text-blue-700' : 'text-cyan-300'}`}>{amb.eta}s</span>
                      </div>
                      <div className={`h-1 rounded-full overflow-hidden ${isDayMode ? 'bg-slate-200' : 'bg-slate-800'}`}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: teamColor, boxShadow: `0 0 6px ${teamColor}` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ──────────────────────────────────────────────────────── */}
      <div className={`${isDayMode ? 'bg-gradient-to-t from-sky-100 to-transparent' : 'bg-gradient-to-t from-[#060c18] to-transparent'} px-5 pb-3 pt-8 flex justify-between items-end pointer-events-auto`}>
        <div className={`${hudBase} ${cardBg} border rounded-lg px-4 py-2.5 backdrop-blur-xl text-[10px]`}>
          <div className={`font-black tracking-widest uppercase ${accent} mb-1`}>Orbital Camera</div>
          <div className={`${muted} space-y-0.5`}>
            <div>🖱️ <b>Drag</b> Orbit &nbsp;&nbsp; 📜 <b>Scroll</b> Zoom</div>
            <div>🖱️ <b>Right-drag</b> Pan &nbsp;&nbsp; ⌨️ <b>Space</b> Reset</div>
          </div>
        </div>

        <div className={`${hudBase} ${cardBg} border rounded-lg px-4 py-2.5 backdrop-blur-xl text-center`}>
          <div className={`text-[9px] ${muted} uppercase tracking-widest`}>Scene Mode</div>
          <div className={`text-sm font-black ${accent}`}>{isDayMode ? '☀️ Day' : '🌃 Night'}</div>
        </div>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function Metaverse() {
  const canvasRef = useRef(null);

  // Three.js core refs
  const sceneRef    = useRef(null);
  const cameraRef   = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const clockRef    = useRef(new THREE.Clock());
  const frameRef    = useRef(null);

  // Scene object refs
  const ambRefs  = useRef({}); // id → { group, trail, data:{targetX,targetZ} }
  const incRefs  = useRef({});
  const hospRef  = useRef(null);
  const routeRef = useRef(null);

  // Recolouring refs
  const sceneRefs = {
    buildings: useRef([]),
    ground:    useRef(null),
    gridLines: useRef([]),
  };
  const ambientRef = useRef(null);
  const dirLightRef = useRef(null);

  // State
  const [ambulances, setAmbulances] = useState([]);
  const [incidents,  setIncidents]  = useState([]);
  const [isDayMode,  setIsDayMode]  = useState(false);
  const [fps,        setFps]        = useState(60);

  const prevDispatchRef = useRef(null);

  // ── Init Three.js scene ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(C.bg);
    scene.fog = new THREE.Fog(C.bg, 65, 210);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(52, canvas.clientWidth / canvas.clientHeight, 0.1, 600);
    camera.position.set(0, 38, 58);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    rendererRef.current = renderer;

    // Lighting
    const ambient = new THREE.AmbientLight(0x0a1a2e, 7);
    scene.add(ambient); ambientRef.current = ambient;

    const dir = new THREE.DirectionalLight(0x4488cc, 2.5);
    dir.position.set(35, 70, 25); dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    Object.assign(dir.shadow.camera, { near:1, far:220, left:-90, right:90, top:90, bottom:-90 });
    scene.add(dir); dirLightRef.current = dir;

    scene.add(new THREE.HemisphereLight(0x0a1a40, 0x000010, 1.5));

    // Controls
    const controls = new OrbitControls(camera, canvas);
    Object.assign(controls, {
      enableDamping: true, dampingFactor: 0.065,
      maxPolarAngle: Math.PI / 2.05, minDistance: 6, maxDistance: 200,
    });
    controlsRef.current = controls;

    // Build city
    buildCity(scene, sceneRefs);

    // FPS tracking
    let frameCount = 0, lastFpsTime = performance.now();

    // Animation loop
    let sirenPhase = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const dt = Math.min(clockRef.current.getDelta(), 0.05);
      sirenPhase += dt;

      // FPS calc
      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime > 500) {
        setFps(Math.round(frameCount / ((now - lastFpsTime) / 1000)));
        frameCount = 0; lastFpsTime = now;
      }

      // Ambulance smooth movement + siren flicker
      Object.values(ambRefs.current).forEach(({ group, trail, data }) => {
        if (!group) return;
        const lerp = Math.min(1, 7 * dt);
        group.position.x += (data.targetX - group.position.x) * lerp;
        group.position.z += (data.targetZ - group.position.z) * lerp;

        const dx = data.targetX - group.position.x;
        const dz = data.targetZ - group.position.z;
        if (Math.abs(dx) + Math.abs(dz) > 0.04) {
          group.rotation.y = Math.atan2(dx, dz);
        }

        // Push trail point periodically
        if (trail && data.isActive && frameCount % 4 === 0) {
          pushTrailPoint(trail, group.position.x, group.position.z);
        }

        // Siren alternating red/blue
        const sl = group.userData.sirenLight;
        const sm = group.userData.sirenMat;
        if (sl && data.isActive) {
          const isRed = Math.floor(sirenPhase * 2.5) % 2 === 0;
          const col = isRed ? C.red : C.cyan;
          sl.color.setHex(col);
          sl.intensity = 4 + Math.sin(sirenPhase * 10) * 1.5;
          if (sm) { sm.color.setHex(col); sm.emissive.setHex(col); }
        }

        // Ring pulse
        const rm = group.userData.ringMat;
        if (rm) rm.opacity = 0.3 + Math.sin(sirenPhase * 3) * 0.15;
      });

      // Patient marker pulse
      Object.values(incRefs.current).forEach(({ group }) => {
        const l = group?.userData?.light;
        if (l) l.intensity = 4 + Math.sin(sirenPhase * 5) * 2;
      });

      // Hospital light pulse
      if (hospRef.current?.userData?.light) {
        hospRef.current.userData.light.intensity = 5 + Math.sin(sirenPhase * 2) * 1.5;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Space bar → reset camera
    const onKey = (e) => {
      if (e.code === 'Space') {
        camera.position.set(0, 38, 58);
        controls.target.set(0, 0, 0);
        controls.update();
      }
    };
    window.addEventListener('keydown', onKey);

    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
    };
  }, []);

  // ── Sync ambulances to Three.js ────────────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    ambulances.forEach(amb => {
      if (!amb?.location) return;
      const sc = gps(amb.location[0], amb.location[1]);
      const active = ['DISPATCHED','EN_ROUTE','PICKUP','IN_TRANSIT'].includes(amb.status)
                  || ['DISPATCHED','PICKUP','IN_TRANSIT'].includes(amb.phase);
      const teamCol = TEAM_COLORS[amb.team] || C.cyan;

      if (ambRefs.current[amb.id]) {
        const r = ambRefs.current[amb.id];
        r.data.targetX  = sc.x;
        r.data.targetZ  = sc.z;
        r.data.isActive = active;
      } else {
        const group = makeAmbulanceMesh(teamCol);
        group.position.set(sc.x, 0, sc.z);
        scene.add(group);

        const trail = makeTrail(teamCol);
        scene.add(trail);

        ambRefs.current[amb.id] = {
          group, trail,
          data: { targetX: sc.x, targetZ: sc.z, isActive: active },
        };
      }
    });

    // Auto camera fly to dispatched amb
    const dispatched = ambulances.find(a =>
      ['DISPATCHED','PICKUP','IN_TRANSIT'].includes(a.phase)
    );
    if (dispatched && dispatched.id !== prevDispatchRef.current) {
      prevDispatchRef.current = dispatched.id;
      const sc = gps(dispatched.location[0], dispatched.location[1]);
      const cam = cameraRef.current, ctrl = controlsRef.current;
      if (cam && ctrl) {
        ctrl.target.set(sc.x, 0, sc.z);
        cam.position.set(sc.x + 10, 28, sc.z + 35);
      }
    }
  }, [ambulances]);

  // ── Sync incidents to Three.js ─────────────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    incidents.forEach(inc => {
      if (!inc?.location || incRefs.current[inc.id]) return;
      const sc = gps(inc.location[0], inc.location[1]);
      const group = makePatientMarker(inc.severity);
      group.position.set(sc.x, 0, sc.z);
      scene.add(group);
      incRefs.current[inc.id] = { group };
    });

    // Remove resolved
    Object.keys(incRefs.current).forEach(id => {
      if (!incidents.find(i => String(i.id) === id)) {
        sceneRef.current?.remove(incRefs.current[id].group);
        delete incRefs.current[id];
      }
    });
  }, [incidents]);

  // ── system_update: hospital + route polyline ───────────────────────────────
  useEffect(() => {
    const onUpdate = (state) => {
      const scene = sceneRef.current;
      if (!scene) return;

      if (state.hospital?.location && !hospRef.current) {
        const sc = gps(state.hospital.location[0], state.hospital.location[1]);
        const group = makeHospitalMarker(state.hospital.name);
        group.position.set(sc.x, 0, sc.z);
        scene.add(group);
        hospRef.current = group;
      }

      // Route line
      if (routeRef.current) { scene.remove(routeRef.current); routeRef.current = null; }
      if (state.routes?.length > 0) {
        const best = state.routes[0];
        if (best?.coordinates?.length > 1) {
          const pts = best.coordinates.map(([lng, lat]) => {
            const sc = gps(lat, lng);
            return new THREE.Vector3(sc.x, 0.35, sc.z);
          });
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          const mat = new THREE.LineBasicMaterial({ color: C.cyan, transparent: true, opacity: 0.75 });
          const line = new THREE.Line(geo, mat);
          scene.add(line);
          routeRef.current = line;
        }
      }

      if (state.systemStatus === 'IDLE') {
        if (hospRef.current) { scene.remove(hospRef.current); hospRef.current = null; }
        prevDispatchRef.current = null;
        // Reset ambulance trails
        Object.values(ambRefs.current).forEach(({ trail }) => {
          if (trail) { trail.userData.count = 0; trail.geometry.setDrawRange(0, 0); }
        });
      }
    };
    socket.on('system_update', onUpdate);
    return () => socket.off('system_update', onUpdate);
  }, []);

  // ── Socket: live positions ─────────────────────────────────────────────────
  useEffect(() => {
    socket.emit('metaverse_enter', { view: 'standard' });
    socket.on('metaverse_position_update', d => {
      setAmbulances(d.ambulances || []);
      setIncidents(d.incidents  || []);
    });
    return () => socket.off('metaverse_position_update');
  }, []);

  // ── Day / Night scene recolouring ─────────────────────────────────────────
  useEffect(() => {
    const scene    = sceneRef.current;
    const renderer = rendererRef.current;
    if (!scene || !renderer) return;

    if (isDayMode) {
      scene.background    = new THREE.Color(C.bgDay);
      scene.fog           = new THREE.Fog(C.bgDay, 90, 270);
      renderer.toneMappingExposure = 1.35;
      if (ambientRef.current)  { ambientRef.current.color.setHex(0xfff5e0); ambientRef.current.intensity = 9; }
      if (dirLightRef.current) { dirLightRef.current.color.setHex(0xfff8e7); dirLightRef.current.intensity = 4.5; }
      if (sceneRefs.ground.current)  sceneRefs.ground.current.material.color.setHex(C.groundDay);
      sceneRefs.gridLines.current.forEach(l => l.material.color.setHex(C.gridDay));
      sceneRefs.buildings.current.forEach((im, i) => {
        im.material.color.setHex(BLDG_COLORS_DAY[i % BLDG_COLORS_DAY.length]);
        im.material.emissive.setHex(0x000000);
      });
    } else {
      scene.background    = new THREE.Color(C.bg);
      scene.fog           = new THREE.Fog(C.bg, 65, 210);
      renderer.toneMappingExposure = 0.85;
      if (ambientRef.current)  { ambientRef.current.color.setHex(0x0a1a2e); ambientRef.current.intensity = 7; }
      if (dirLightRef.current) { dirLightRef.current.color.setHex(0x4488cc); dirLightRef.current.intensity = 2.5; }
      if (sceneRefs.ground.current)  sceneRefs.ground.current.material.color.setHex(C.ground);
      sceneRefs.gridLines.current.forEach(l => l.material.color.setHex(C.grid));
      sceneRefs.buildings.current.forEach((im, i) => {
        im.material.color.setHex(BLDG_COLORS_NIGHT[i % BLDG_COLORS_NIGHT.length]);
        im.material.emissive.setHex(0x050c1a);
      });
    }
  }, [isDayMode]);

  return (
    <div className="relative w-full bg-[#060c18]" style={{ height: 'calc(100vh - 52px)' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <CmdHUD
        ambulances={ambulances}
        incidents={incidents}
        isDayMode={isDayMode}
        onToggleMode={() => setIsDayMode(v => !v)}
        fps={fps}
      />
    </div>
  );
}
