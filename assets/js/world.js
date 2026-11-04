// The scene: night sea, sky with a low moon, the four-storey pavilion on its stone platform,
// the pier with its gate and lanterns, and the boat that brings visitors in.
// Units are metres. The pavilion stands at the origin; the pier and the boat's approach are on +z.
import * as THREE from 'three';

export const H = 4.2; // storey height
export const BASE = 1.2; // top of the stone platform
export const SIZES = [16, 13, 10.5, 8]; // floor widths, bottom to top
const WALL = 0.3;
const EAVE = 1.5;
const PIER = { x: 1.5, z0: 11, z1: 26, y: 1.0 };

export function floorAt(i) {
  const a = SIZES[i] / 2;
  const y = BASE + i * H;
  return { a, y, eye: y + 1.65, inner: a - 0.25 };
}

const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });

function canvasTex(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...repeat);
  tex.anisotropy = 4;
  return tex;
}

// --- Materials ----------------------------------------------------------------------------------

const M = {};
function materials() {
  // Lattice panels (槅扇): paper behind dark-red wooden bars. The paper glows from the lamps inside.
  const lattice = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#ecdcb6';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#5e2420';
    ctx.lineWidth = 7;
    for (let i = 1; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo((i * w) / 8, 0);
      ctx.lineTo((i * w) / 8, h);
      ctx.moveTo(0, (i * h) / 8);
      ctx.lineTo(w, (i * h) / 8);
      ctx.stroke();
    }
    ctx.lineWidth = 22;
    ctx.strokeStyle = '#6e2a24';
    ctx.strokeRect(0, 0, w, h);
  }, [1 / 1.3, 1 / 1.3]);
  M.lattice = mat('#ffffff', { map: lattice, emissiveMap: lattice, emissive: '#ffb766', emissiveIntensity: 0.55, roughness: 0.9 });
  M.wood = mat('#5a2420', { roughness: 0.7 });
  M.red = mat('#9e2a26', { roughness: 0.55 });
  M.beam = mat('#2f5a55', { roughness: 0.6 });
  M.gold = mat('#d8a84e', { roughness: 0.35, metalness: 0.6 });
  const tiles = canvasTex(64, 64, (ctx, w, h) => {
    ctx.fillStyle = '#2c4a4d';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1b3033';
    ctx.fillRect(0, 0, w * 0.22, h);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(w * 0.55, 0, w * 0.18, h);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, h * 0.9, w, h * 0.1);
  });
  M.roof = mat('#ffffff', { map: tiles, roughness: 0.6, side: THREE.DoubleSide });
  M.ridge = mat('#1a2c2e', { roughness: 0.6 });
  M.lining = mat('#ece5d6', { roughness: 0.95, emissive: '#2a241b', emissiveIntensity: 1 });
  M.ceiling = mat('#cdbfa6', { roughness: 0.95, emissive: '#15110c', emissiveIntensity: 1, side: THREE.DoubleSide });
  const planks = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#6d4a32';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `hsl(25, 35%, ${22 + Math.random() * 8}%)`;
      ctx.fillRect(0, (i * h) / 8 + 1, w, h / 8 - 2);
    }
  }, [1 / 2, 1 / 2]);
  M.floor = mat('#ffffff', { map: planks, roughness: 0.7 });
  M.stone = mat('#b9b3a6', { roughness: 0.95 });
  M.marble = mat('#e4dfd4', { roughness: 0.8 });
  M.deck = mat('#5b4432', { roughness: 0.85 });
  M.lantern = new THREE.MeshStandardMaterial({ color: '#c3352a', emissive: '#ff6a32', emissiveIntensity: 1.6, roughness: 0.6 });
  M.dark = mat('#241a15');
}

// --- Roofs ------------------------------------------------------------------------------------------
// A square roof with upturned corners. Each side is a strip running from the eave (u = 0) up to the
// inner edge (u = 1); along the side v runs -1 to 1, and the corners curl up and out where |v| -> 1.

function eaveOf(i) {
  const { a, y } = floorAt(i);
  if (i === SIZES.length - 1) return { rOut: a + EAVE + 0.2, rIn: 0, yOut: y + 3.6, yIn: y + 3.6 + 3.6, lift: 1.15, flare: 0.9 };
  return { rOut: a + EAVE, rIn: floorAt(i + 1).a, yOut: y + 3.5, yIn: floorAt(i + 1).y + 0.2, lift: 0.85, flare: 0.7 };
}

function roofPoint(e, u, v, side, drop = 0) {
  const r0 = e.rOut + (e.rIn - e.rOut) * u;
  const k = Math.abs(v) ** 3 * (1 - u) ** 2;
  const r = r0 + e.flare * k;
  const x = v * r;
  const z = r;
  const y = e.yOut + (e.yIn - e.yOut) * u ** 1.8 + e.lift * k - drop;
  const ang = (side * Math.PI) / 2;
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return [x * c + z * s, y, -x * s + z * c, r0];
}

// Roof height straight out from the middle of a side, at distance r from the centre.
function roofY(e, r) {
  const u = THREE.MathUtils.clamp((e.rOut - r) / (e.rOut - e.rIn), 0, 1);
  return e.yOut + (e.yIn - e.yOut) * u ** 1.8;
}

function roofGeo(e, segU = 12, segV = 20) {
  const pos = [];
  const uv = [];
  const index = [];
  for (let side = 0; side < 4; side++) {
    const start = pos.length / 3;
    // Row -1 is the fascia: the same edge dropped down, so the eave has some thickness.
    for (let i = -1; i <= segU; i++) {
      const u = Math.max(0, i) / segU;
      for (let j = 0; j <= segV; j++) {
        const v = -1 + (2 * j) / segV;
        const [x, y, z, r0] = roofPoint(e, u, v, side, i < 0 ? 0.24 : 0);
        pos.push(x, y, z);
        uv.push(v * r0 * 2.4, u * 3);
      }
    }
    for (let i = 0; i < segU + 1; i++) {
      for (let j = 0; j < segV; j++) {
        const a = start + i * (segV + 1) + j;
        const b = a + segV + 1;
        index.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

function lantern(scale = 1) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), M.lantern);
  body.scale.set(1, 1.25, 1);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.06, 10), M.dark);
  cap.position.y = 0.28;
  const foot = cap.clone();
  foot.position.y = -0.28;
  const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, 0.22, 6), M.red);
  tassel.position.y = -0.42;
  g.add(body, cap, foot, tassel);
  g.scale.setScalar(scale);
  return g;
}

function roof(i, group, lanterns) {
  const e = eaveOf(i);
  group.add(new THREE.Mesh(roofGeo(e), M.roof));
  for (let q = 0; q < 4; q++) {
    // Hip ridge along the corner, from the curled tip up to the inner edge.
    const pts = [];
    for (let s = 0; s <= 10; s++) {
      const [x, y, z] = roofPoint(e, s / 10, 1, q);
      pts.push(new THREE.Vector3(x, y + 0.08, z));
    }
    group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.09, 6), M.ridge));
    const [tx, ty, tz] = roofPoint(e, 0, 1, q);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.45, 6), M.ridge);
    tip.position.set(tx, ty + 0.25, tz);
    group.add(tip);
    // A red lantern hanging from each corner.
    const l = lantern(1.1);
    l.position.set(tx * 0.97, ty - 1.05, tz * 0.97);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 4), M.dark);
    cord.position.set(tx * 0.97, ty - 0.5, tz * 0.97);
    group.add(l, cord);
    lanterns.push(l);
  }
  if (e.rIn === 0) {
    // Finial on the very top.
    const tops = [[0.32, 0.35], [0.22, 0.85], [0.14, 1.25]];
    tops.forEach(([r, y]) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), M.gold);
      s.position.y = e.yIn + y;
      group.add(s);
    });
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.7, 8), M.gold);
    spike.position.y = e.yIn + 1.65;
    group.add(spike);
  }
}

// --- Walls ------------------------------------------------------------------------------------------

function wallShape(len, h, hole) {
  const s = new THREE.Shape();
  if (hole && hole.door) {
    const w = hole.door / 2;
    s.moveTo(-len / 2, 0);
    s.lineTo(-w, 0);
    s.lineTo(-w, hole.h);
    s.absarc(0, hole.h, w, Math.PI, 0, true);
    s.lineTo(w, 0);
    s.lineTo(len / 2, 0);
  } else {
    s.moveTo(-len / 2, 0);
    s.lineTo(len / 2, 0);
  }
  s.lineTo(len / 2, h);
  s.lineTo(-len / 2, h);
  s.closePath();
  if (hole && hole.moon) {
    const p = new THREE.Path();
    p.absarc(0, hole.cy, hole.moon, 0, Math.PI * 2, true);
    s.holes.push(p);
  }
  return s;
}

function floorBlock(i, scene, lanterns) {
  const f = floorAt(i);
  const e = eaveOf(i);
  const g = new THREE.Group();
  g.position.y = f.y;
  const { a } = f;
  const wallH = roofY(e, a) - f.y + 0.05;
  const front = i === 0 ? { door: 2.4, h: 2.0 } : { moon: 1.25, cy: 1.95 };

  // Four walls: lattice outside, a plain gallery wall inside. Front/back run the full width;
  // the sides fit between them so no faces overlap at the corners.
  const sides = [
    { ang: 0, len: 2 * a + WALL, hole: front },
    { ang: Math.PI, len: 2 * a + WALL },
    { ang: Math.PI / 2, len: 2 * a - WALL },
    { ang: -Math.PI / 2, len: 2 * a - WALL },
  ];
  for (const s of sides) {
    const pivot = new THREE.Group();
    pivot.rotation.y = s.ang;
    const outer = new THREE.Mesh(new THREE.ExtrudeGeometry(wallShape(s.len, wallH, s.hole), { depth: WALL, bevelEnabled: false, curveSegments: 40 }), [M.lattice, M.wood]);
    outer.position.z = a - WALL / 2;
    const innerLen = 2 * (a - WALL / 2) - (s.ang === 0 || s.ang === Math.PI ? 0 : 0.06);
    const inner = new THREE.Mesh(new THREE.ExtrudeGeometry(wallShape(innerLen, 3.6, s.hole), { depth: 0.02, bevelEnabled: false, curveSegments: 40 }), M.lining);
    inner.position.z = a - WALL / 2 - 0.06;
    pivot.add(outer, inner);
    if (s.hole && s.hole.moon) {
      for (const z of [a + WALL / 2 + 0.01, a - WALL / 2 - 0.05]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(s.hole.moon, 0.07, 8, 48), M.wood);
        ring.position.set(0, s.hole.cy, z);
        pivot.add(ring);
      }
    }
    if (s.hole && s.hole.door) {
      const plaque = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.06), M.dark);
      plaque.position.set(0, 3.52, a + WALL / 2 + 0.04);
      pivot.add(plaque);
    }
    g.add(pivot);
  }

  // Floor and ceiling.
  const slab = new THREE.Mesh(new THREE.BoxGeometry(2 * a + WALL, 0.3, 2 * a + WALL), [M.dark, M.dark, M.floor, M.dark, M.dark, M.dark]);
  slab.position.y = -0.14;
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(2 * a - 0.3, 2 * a - 0.3), M.ceiling);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = 3.6;
  g.add(slab, ceil);
  for (const x of [-a / 2, 0, a / 2]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 2 * a - 0.3), M.dark);
    beam.position.set(x, 3.48, 0);
    const cross = new THREE.Mesh(new THREE.BoxGeometry(2 * a - 0.3, 0.2, 0.18), M.dark);
    cross.position.set(0, 3.38, x);
    g.add(beam, cross);
  }
  for (let q = 0; q < 4; q++) {
    const pivot = new THREE.Group();
    pivot.rotation.y = (q * Math.PI) / 2;
    const run = 2 * (a - WALL / 2) - 0.14;
    const base = new THREE.Mesh(new THREE.BoxGeometry(run, 0.16, 0.04), M.dark);
    base.position.set(0, 0.08, a - WALL / 2 - 0.09);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(run, 0.05, 0.04), M.dark);
    rail.position.set(0, 3.1, a - WALL / 2 - 0.09);
    pivot.add(base, rail);
    g.add(pivot);
  }
  // Warm light for the hall, plus two palace lanterns.
  const light = new THREE.PointLight('#ffdcae', 14, 0, 1.4);
  light.position.set(0, 2.3, 0.5);
  g.add(light);
  for (const x of [-a * 0.6, a * 0.6]) {
    const l = lantern(1.3);
    l.position.set(x, 2.95, a * 0.45);
    g.add(l);
  }
  if (a > 5) {
    const bench = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.55), M.wood);
    top.position.y = 0.45;
    bench.add(top);
    for (const x of [-1.05, 1.05]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.48), M.dark);
      leg.position.set(x, 0.21, 0);
      bench.add(leg);
    }
    bench.position.z = -a * 0.3;
    g.add(bench);
  }

  // Colonnade outside the walls with a painted beam on top. Upper floors stand on a balcony.
  const rc = a + 0.55;
  const colH = roofY(e, rc) - f.y - 0.02;
  const n = Math.max(3, Math.round((2 * rc) / 2.8));
  for (let q = 0; q < 4; q++) {
    const pivot = new THREE.Group();
    pivot.rotation.y = (q * Math.PI) / 2;
    for (let k = 0; k < n; k++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, colH, 10), M.red);
      col.position.set(-rc + (2 * rc * k) / n, colH / 2, rc);
      pivot.add(col);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2 * rc + 0.3, 0.3, 0.24), M.beam);
    beam.position.set(0, colH - 0.2, rc);
    pivot.add(beam);
    if (i > 0) {
      const deck = new THREE.Mesh(new THREE.BoxGeometry(2 * rc + 1.0, 0.16, 1.15), M.deck);
      deck.position.set(0, -0.08, a + 0.5);
      pivot.add(deck);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(2 * rc + 1.0, 0.07, 0.07), M.red);
      rail.position.set(0, 0.85, rc + 0.45);
      pivot.add(rail);
      for (let k = 0; k <= n * 2; k++) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.85, 0.06), M.red);
        post.position.set(-rc - 0.45 + ((2 * rc + 0.9) * k) / (n * 2), 0.42, rc + 0.45);
        pivot.add(post);
      }
    }
    g.add(pivot);
  }
  scene.add(g);

  const roofs = new THREE.Group();
  roof(i, roofs, lanterns);
  scene.add(roofs);

  // Invisible block used to click a floor from outside.
  const hit = new THREE.Mesh(new THREE.BoxGeometry(2 * a + 1.2, H, 2 * a + 1.2), new THREE.MeshBasicMaterial());
  hit.position.y = f.y + H / 2;
  hit.visible = false;
  hit.userData.floor = i;
  scene.add(hit);
  return { ...f, hit, light };
}

// --- Platform, pier, gate ---------------------------------------------------------------------------

function platform(scene, lanterns) {
  const S = 11;
  const base = new THREE.Mesh(new THREE.BoxGeometry(2 * S, 2.4, 2 * S), M.stone);
  base.position.y = BASE - 1.2;
  scene.add(base);
  // Marble balustrade, open at the front where the pier meets it.
  const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.8, 0.16), M.marble, 200);
  let n = 0;
  const m4 = new THREE.Matrix4();
  for (let q = 0; q < 4; q++) {
    const ang = (q * Math.PI) / 2;
    for (let x = -S + 0.2; x <= S - 0.2; x += 1.1) {
      if (q === 0 && Math.abs(x) < PIER.x + 0.3) continue;
      const px = Math.cos(ang) * x + Math.sin(ang) * (S - 0.15);
      const pz = -Math.sin(ang) * x + Math.cos(ang) * (S - 0.15);
      posts.setMatrixAt(n++, m4.makeTranslation(px, BASE + 0.4, pz));
    }
    for (const [x0, x1] of q === 0 ? [[-S, -PIER.x - 0.3], [PIER.x + 0.3, S]] : [[-S, S]]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.1, 0.12), M.marble);
      const mid = (x0 + x1) / 2;
      rail.position.set(Math.cos(ang) * mid + Math.sin(ang) * (S - 0.15), BASE + 0.78, -Math.sin(ang) * mid + Math.cos(ang) * (S - 0.15));
      rail.rotation.y = ang;
      scene.add(rail);
    }
  }
  posts.count = n;
  scene.add(posts);

  // Pier.
  const len = PIER.z1 - PIER.z0;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(PIER.x * 2, 0.16, len), M.deck);
  deck.position.set(0, PIER.y, (PIER.z0 + PIER.z1) / 2);
  scene.add(deck);
  for (let z = PIER.z0 + 1; z <= PIER.z1; z += 3) {
    for (const x of [-PIER.x - 0.05, PIER.x + 0.05]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 2.6, 8), M.dark);
      post.position.set(x, PIER.y - 0.8, z);
      scene.add(post);
    }
  }
  for (let z = PIER.z0 + 4; z <= PIER.z1; z += 6) {
    for (const x of [-PIER.x + 0.15, PIER.x - 0.15]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.7, 6), M.dark);
      pole.position.set(x, PIER.y + 0.85, z);
      const l = lantern(0.8);
      l.position.set(x, PIER.y + 1.95, z);
      scene.add(pole, l);
      lanterns.push(l);
    }
  }
  const pierLight = new THREE.PointLight('#ff9a5a', 22, 18, 1.8);
  pierLight.position.set(0, 3, PIER.z0 + 7);
  scene.add(pierLight);

  // Gate (牌坊) where the pier reaches the platform.
  const gate = new THREE.Group();
  for (const x of [-2.1, 2.1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 4.4, 10), M.red);
    post.position.set(x, 2.2, 0);
    gate.add(post);
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.32, 0.32), M.beam);
  lintel.position.y = 3.9;
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 0.08), M.dark);
  board.position.set(0, 3.35, 0.12);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.22, 1.0), M.ridge);
  cap.position.y = 4.55;
  const capTop = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.22, 0.5), M.ridge);
  capTop.position.y = 4.75;
  gate.add(lintel, board, cap, capTop);
  for (const x of [-3.0, 3.0]) {
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 6), M.ridge);
    tip.position.set(x, 4.85, 0);
    tip.rotation.z = x > 0 ? -0.5 : 0.5;
    gate.add(tip);
  }
  gate.position.set(0, PIER.y, PIER.z0 + 1.2);
  scene.add(gate);
}

// --- Sea and sky ------------------------------------------------------------------------------------

export function waveY(x, z, t) {
  const fade = 1 - THREE.MathUtils.smoothstep(Math.hypot(x, z), 70, 118);
  return (
    (Math.sin(x * 0.16 + t * 0.8) * 0.22 + Math.sin(z * 0.21 - t * 0.65) * 0.18 + Math.sin((x + z) * 0.45 + t * 1.7) * 0.07) * fade
  );
}

function sea(scene) {
  const geo = new THREE.PlaneGeometry(240, 240, 96, 96);
  geo.rotateX(-Math.PI / 2);
  const water = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#1c4658', roughness: 0.28, metalness: 0.15, flatShading: true }));
  scene.add(water);
  const far = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.MeshStandardMaterial({ color: '#1c4658', roughness: 0.3, metalness: 0.15 }));
  far.rotation.x = -Math.PI / 2;
  far.position.y = -0.02;
  scene.add(far);
  // Leave a hole-free inner sea: the far plane sits just under the near one.
  const base = geo.attributes.position.array.slice();
  return { water, update: (t) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, waveY(base[i * 3], base[i * 3 + 2], t));
    p.needsUpdate = true;
  } };
}

const col = (hex) => new THREE.Color(hex);

function sky(scene) {
  const top = '#060e22';
  const mid = '#1b2a52';
  const horizon = '#6e6490';
  const g = new THREE.SphereGeometry(900, 32, 16);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { top: { value: col(top) }, mid: { value: col(mid) }, horizon: { value: col(horizon) } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; varying vec3 vDir;
      void main(){ float h = vDir.y; vec3 c = mix(horizon, mid, smoothstep(0.0, 0.16, h)); c = mix(c, top, smoothstep(0.14, 0.65, h));
      gl_FragColor = vec4(c, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`,
  });
  scene.add(new THREE.Mesh(g, m));
  scene.fog = new THREE.Fog(horizon, 45, 330);

  // Moon low over the sea, behind the pavilion as seen from the pier.
  const dir = new THREE.Vector3(-0.32, 0.13, -1).normalize();
  const moon = new THREE.Mesh(new THREE.CircleGeometry(16, 48), new THREE.MeshBasicMaterial({ color: '#fff2d2', fog: false }));
  moon.position.copy(dir).multiplyScalar(600);
  moon.lookAt(0, 0, 0);
  const glowTex = canvasTex(128, 128, (ctx) => {
    const gr = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,240,210,0.55)');
    gr.addColorStop(0.3, 'rgba(255,230,200,0.18)');
    gr.addColorStop(1, 'rgba(255,230,200,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, 128, 128);
  });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  glow.position.copy(dir).multiplyScalar(680);
  glow.scale.setScalar(170);
  scene.add(moon, glow);

  const stars = new THREE.BufferGeometry();
  const pts = [];
  for (let i = 0; i < 700; i++) {
    const th = Math.random() * Math.PI * 2;
    const y = 0.08 + Math.random() * 0.92;
    const r = Math.sqrt(1 - y * y);
    pts.push(Math.cos(th) * r * 800, y * 800, Math.sin(th) * r * 800);
  }
  stars.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: '#dfe6ff', size: 1.4, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 })));

  // Ink-wash islands on the horizon.
  const isl = mat('#1d2943', { roughness: 1 });
  [[-170, -260, 60, 34], [-60, -300, 90, 26], [120, -280, 70, 40], [240, -160, 50, 22], [-260, -80, 60, 28], [200, 40, 45, 18]].forEach(([x, z, w, h]) => {
    const m2 = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 7), isl);
    m2.scale.set(w, h, w * 0.5);
    m2.position.set(x, h / 2 - 2, z);
    scene.add(m2);
  });

  // The moon casts shadows so it lights the outside of the pavilion but not the halls inside.
  const moonLight = new THREE.DirectionalLight('#c9d4ff', 1.5);
  moonLight.position.copy(dir).multiplyScalar(60);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048);
  Object.assign(moonLight.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 140 });
  moonLight.shadow.bias = -0.0008;
  moonLight.shadow.normalBias = 0.04;
  scene.add(moonLight, new THREE.HemisphereLight('#6a78a8', '#1a2430', 0.9));
}

// --- Boat -------------------------------------------------------------------------------------------
// A small wooden boat with a black arched awning (乌篷船), a boatman with an oar and a bow lantern.
// Its forward direction is local +z.

function boat(scene) {
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(1.3, 0.55, 4.6, 6, 2, 28);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = p.getZ(i) / 2.3;
    let x = p.getX(i) * (1 - 0.78 * t * t);
    const y = p.getY(i) + 0.38 * t ** 4;
    if (p.getY(i) < 0) x *= 0.62;
    p.setXYZ(i, x, y, p.getZ(i));
  }
  geo.computeVertexNormals();
  const hull = new THREE.Mesh(geo, mat('#6e4b30', { roughness: 0.75 }));
  hull.position.y = 0.12;
  const inside = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.05, 3.2), mat('#4a3221'));
  inside.position.y = 0.36;
  const awning = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.7, 16, 1, true, Math.PI / 2, Math.PI), mat('#2a2522', { side: THREE.DoubleSide, roughness: 0.9 }));
  awning.rotation.x = Math.PI / 2;
  awning.position.set(0, 0.4, 0.1);
  g.add(hull, inside, awning);

  // Boatman at the stern.
  const man = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.85, 10), mat('#3c4a5c'));
  body.position.y = 0.42;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), mat('#c99a78'));
  head.position.y = 0.98;
  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.18, 16), mat('#c6a46a'));
  hat.position.y = 1.12;
  man.add(body, head, hat);
  man.position.set(0, 0.38, -1.7);
  const oarPivot = new THREE.Group();
  oarPivot.position.set(0.2, 1.05, -1.75);
  const oar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 2.8), mat('#8a6a48'));
  oar.position.z = -1.3;
  oarPivot.add(oar);
  oarPivot.rotation.x = 0.5;
  g.add(man, oarPivot);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 6), M.dark);
  pole.position.set(0, 0.95, 2.05);
  const l = lantern(0.6);
  l.position.set(0, 1.65, 2.1);
  const glow = new THREE.PointLight('#ffa060', 6, 10, 1.6);
  glow.position.set(0, 1.6, 2.2);
  g.add(pole, l, glow);
  scene.add(g);
  return { group: g, oar: oarPivot };
}

// --- Build ------------------------------------------------------------------------------------------

export function buildWorld() {
  materials();
  const scene = new THREE.Scene();
  const lanterns = [];
  sky(scene);
  const { update: updateSea, water } = sea(scene);
  platform(scene, lanterns);
  const floors = SIZES.map((_, i) => floorBlock(i, scene, lanterns));
  const b = boat(scene);
  scene.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial && !o.material.isMeshBasicMaterial) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  water.castShadow = false;

  // The boat's route in from the open sea, ending alongside the end of the pier.
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-46, 0, 120),
    new THREE.Vector3(-22, 0, 84),
    new THREE.Vector3(10, 0, 52),
    new THREE.Vector3(5.5, 0, 33),
    new THREE.Vector3(3.3, 0, 23.5),
  ]);

  const tmp = new THREE.Vector3();
  function placeBoat(pos, heading, t, rowing) {
    b.group.position.set(pos.x, waveY(pos.x, pos.z, t) - 0.05, pos.z);
    b.group.rotation.set(Math.sin(t * 1.3) * 0.03, heading, Math.sin(t * 0.9) * 0.04, 'YXZ');
    b.oar.rotation.y = rowing ? Math.sin(t * 2.4) * 0.35 : 0;
  }

  function update(t) {
    updateSea(t);
    lanterns.forEach((l, i) => {
      l.rotation.z = Math.sin(t * 1.1 + i) * 0.05;
    });
    M.lantern.emissiveIntensity = 1.5 + Math.sin(t * 7) * 0.05 + Math.sin(t * 13.3) * 0.04;
  }

  return { scene, floors, path, placeBoat, update, boat: b.group, tmp };
}
