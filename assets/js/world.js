// The scene: night sea, a sky with a low moon, and the flower boat (花船): a hull with five decks
// stacked on it and an open roof garden, a planted courtyard (天井) running up the middle, and a
// pier where the little boat brings visitors in. Units are metres. The flower boat is centred on
// the origin with its bow to +x; the pier and the boat's approach are on +z.
import * as THREE from 'three';
import { PLANS, BASE, H, WALL_H, ATRIUM } from './decks.js';
import { BUILD, box, cyl, ball, leaves } from './props.js';
import { NavGrid } from './nav.js';

const PIER = { x: 1.5, z0: 7.9, z1: 26, y: 1.2 };
const HULL = { x: 13.5, z: 7.6 };

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
let latticeTex;
function materials() {
  // Outside wall: carved teak lattice with coloured glass behind it, lit from inside.
  latticeTex = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#f0c987';
    ctx.fillRect(0, 0, w, h);
    const glass = ['rgba(184,50,42,0.35)', 'rgba(79,122,98,0.35)', 'rgba(47,92,158,0.3)'];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      ctx.fillStyle = glass[(i + j) % 3];
      ctx.fillRect((i * w) / 4 + 6, (j * h) / 4 + 6, w / 4 - 12, h / 4 - 12);
    }
    ctx.strokeStyle = '#4a2a1a';
    ctx.lineWidth = 8;
    for (let i = 1; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo((i * w) / 8, 0);
      ctx.lineTo((i * w) / 8, h);
      ctx.moveTo(0, (i * h) / 8);
      ctx.lineTo(w, (i * h) / 8);
      ctx.stroke();
    }
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 24;
    ctx.strokeStyle = '#5a311d';
    ctx.strokeRect(0, 0, w, h);
  });
  M.wood = mat('#5a311d', { roughness: 0.7 });
  M.teak = mat('#7a4a2a', { roughness: 0.7 });
  M.red = mat('#9e2a26', { roughness: 0.55 });
  M.gold = mat('#d8a84e', { roughness: 0.35, metalness: 0.6 });
  M.green = mat('#2f6b5a', { roughness: 0.6 });
  const tiles = canvasTex(64, 64, (ctx, w, h) => {
    ctx.fillStyle = '#2c4a4d';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1b3033';
    ctx.fillRect(0, 0, w * 0.22, h);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(w * 0.55, 0, w * 0.18, h);
  });
  M.roof = mat('#ffffff', { map: tiles, roughness: 0.6, side: THREE.DoubleSide });
  M.ridge = mat('#1a2c2e', { roughness: 0.6 });
  M.stone = mat('#b9b3a6', { roughness: 0.95 });
  M.deck = mat('#5b4432', { roughness: 0.85 });
  M.lantern = new THREE.MeshStandardMaterial({ color: '#c3352a', emissive: '#ff6a32', emissiveIntensity: 1.6, roughness: 0.6 });
  M.dark = mat('#241a15');
  M.glass = new THREE.MeshStandardMaterial({ color: '#bcd6dc', transparent: true, opacity: 0.25, roughness: 0.05, metalness: 0.2, depthWrite: false });
  M.water = new THREE.MeshStandardMaterial({ color: '#2b5a6a', roughness: 0.12, metalness: 0.4, emissive: '#0c2630', emissiveIntensity: 0.6 });
  M.gauze = new THREE.MeshStandardMaterial({ color: '#fbf6ec', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, roughness: 1 });
}

function planks(color) {
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `rgba(0,0,0,${0.06 + Math.random() * 0.1})`;
      ctx.fillRect(0, (i * h) / 8, w, 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
      ctx.fillRect(0, (i * h) / 8 + 3, w, h / 8 - 5);
    }
  }, [1, 1]);
}

// Inside wall: plain plaster over a coloured dado, with a picture rail.
function innerWallTex(inner, dado) {
  return canvasTex(16, 256, (ctx, w, h) => {
    ctx.fillStyle = inner;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = dado;
    ctx.fillRect(0, h * 0.7, w, h * 0.3);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, h * 0.7 - 3, w, 4);
    ctx.fillRect(0, h * 0.08, w, 3);
    ctx.fillRect(0, h - 8, w, 8);
  });
}

// --- Shared pieces ------------------------------------------------------------------------------

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

// A sloped eave skirt around a rectangle with upturned corners. Each side runs from the outer
// edge (u = 0) to the inner edge (u = 1); along the side v runs -1 to 1 and the corners curl.
function eaveGeo(e, segU = 6, segV = 24) {
  const pos = [];
  const uv = [];
  const index = [];
  for (let side = 0; side < 4; side++) {
    const start = pos.length / 3;
    const along = side % 2 ? [e.oz, e.iz] : [e.ox, e.ix];
    const out = side % 2 ? [e.ox, e.ix] : [e.oz, e.iz];
    for (let i = -1; i <= segU; i++) {
      const u = Math.max(0, i) / segU;
      for (let j = 0; j <= segV; j++) {
        const v = -1 + (2 * j) / segV;
        const a = along[0] + (along[1] - along[0]) * u;
        const o = out[0] + (out[1] - out[0]) * u;
        const k = Math.abs(v) ** 4 * (1 - u) ** 2;
        const x = v * (a + e.flare * k);
        const z = o + e.flare * k;
        const y = e.yOut + (e.yIn - e.yOut) * u ** 1.5 + e.lift * k - (i < 0 ? 0.18 : 0);
        const ang = (side * Math.PI) / 2;
        const c = Math.cos(ang);
        const s = Math.sin(ang);
        pos.push(x * c + z * s, y, -x * s + z * c);
        uv.push(v * a * 2.4, u * 2);
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

function eave(e, group, lanterns) {
  group.add(new THREE.Mesh(eaveGeo(e), M.roof));
  for (const [sx, sz] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) {
    const tx = sx * (e.ox + e.flare * 0.95);
    const tz = sz * (e.oz + e.flare * 0.95);
    const ty = e.yOut + e.lift;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.4, 6), M.ridge);
    tip.position.set(tx, ty + 0.15, tz);
    const l = lantern(1.0);
    l.position.set(tx * 0.98, ty - 0.9, tz * 0.98);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 4), M.dark);
    cord.position.set(tx * 0.98, ty - 0.45, tz * 0.98);
    group.add(tip, l, cord);
    lanterns.push(l);
  }
}

// A balustrade along a straight line, with a hand rail and little flower boxes.
function railing(group, x0, z0, x1, z1, y, { color = M.red, flowers = false, h = 0.9 } = {}) {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const g = new THREE.Group();
  g.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
  g.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
  g.add(box(len, 0.07, 0.08, color, 0, h, 0), box(len, 0.05, 0.06, color, 0, 0.12, 0));
  const n = Math.max(2, Math.round(len / 0.45));
  for (let k = 0; k <= n; k++) g.add(box(0.05, h, 0.05, k % 4 ? M.teak : color, -len / 2 + (len * k) / n, h / 2, 0));
  if (flowers) {
    const colors = ['#e0567a', '#f2b84b', '#f4f1ea', '#c2452d'];
    for (let x = -len / 2 + 0.6; x < len / 2 - 0.4; x += 1.6) {
      g.add(box(0.7, 0.18, 0.2, M.teak, x, h + 0.12, 0.12));
      for (let k = 0; k < 4; k++) g.add(ball(0.07, colors[(k + Math.round(x)) & 3], x - 0.25 + k * 0.17, h + 0.28, 0.12));
      // Flowers trailing down the outside.
      g.add(cyl(0.01, 0.01, 0.6, '#3f7a4a', x + 0.2, h - 0.2, 0.18, 4));
    }
  }
  group.add(g);
  return g;
}

// --- The flower boat ----------------------------------------------------------------------------

// Hull outline: half-beam and deck height at x. The bow (+x) narrows and lifts.
const bowT = (x) => Math.max(0, (x - 9) / (HULL.x - 9));
const sternT = (x) => Math.max(0, (-x - 9.5) / (HULL.x - 9.5));
const hullHalf = (x) => HULL.z * (1 - 0.68 * bowT(x) ** 2 - 0.3 * sternT(x) ** 2.5);
const hullLift = (x) => 0.9 * bowT(x) ** 2.5 + 0.45 * sternT(x) ** 2.5;

function hull(scene) {
  const geo = new THREE.BoxGeometry(HULL.x * 2, 2.2, HULL.z * 2, 64, 3, 12);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    let z = (p.getZ(i) / HULL.z) * hullHalf(x);
    let y = p.getY(i);
    if (y < 0) z *= 0.8;
    y += hullLift(x);
    p.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  const tex = canvasTex(8, 256, (ctx, w, h) => {
    ctx.fillStyle = '#6b3d22';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#d8a84e';
    ctx.fillRect(0, h * 0.06, w, h * 0.04);
    ctx.fillStyle = '#9e2a26';
    ctx.fillRect(0, h * 0.1, w, h * 0.12);
    ctx.fillStyle = '#d8a84e';
    ctx.fillRect(0, h * 0.22, w, h * 0.03);
    ctx.fillStyle = '#2a1a12';
    ctx.fillRect(0, h * 0.62, w, h * 0.38);
  });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  const side = mat('#ffffff', { map: tex, roughness: 0.7 });
  const top = mat('#ffffff', { map: planks('#5b4432'), roughness: 0.85 });
  top.map.repeat.set(6, 4);
  const m = new THREE.Mesh(geo, [side, side, top, side, side, side]);
  m.position.y = BASE - 1.2;
  scene.add(m);
  // Rails along the edge of the hull (open at the gangway), and a gilded figurehead at the bow.
  for (const sz of [-1, 1]) {
    for (let x = -HULL.x + 0.8; x < HULL.x - 1.2; x += 1.2) {
      const x1 = x + 1.2;
      if (sz > 0 && x1 > -1.4 && x < 1.4) continue;
      const y0 = BASE - 0.1 + hullLift(x);
      railing(scene, x, sz * (hullHalf(x) - 0.25), x1, sz * (hullHalf(x1) - 0.25), y0, { flowers: Math.abs(x) < 8 && Math.round(x / 1.2) % 2 === 0, h: 0.8 });
    }
  }
  const head = new THREE.Group();
  head.add(ball(0.45, M.gold, 0, 0, 0), cyl(0.06, 0.06, 2.2, M.red, -0.6, 0.6, 0));
  head.position.set(HULL.x - 0.3, BASE + 0.2 + hullLift(HULL.x - 0.3), 0);
  scene.add(head);
}

function wallMats(inside, outsideTex, len) {
  const t = outsideTex.clone();
  t.needsUpdate = true;
  t.repeat.set(len / 1.4, WALL_H / 1.4);
  const outer = mat('#ffffff', { map: t, emissiveMap: t, emissive: '#ffb766', emissiveIntensity: 0.55, roughness: 0.9 });
  return { inner: inside, outer, edge: M.wood };
}

// Builds one deck: floor, walls, eave, courtyard, furniture, light and walk grid.
function buildDeck(i, scene, lanterns) {
  const P = PLANS[i];
  const [ax, az] = P.size;
  const y = BASE + i * H;
  const group = new THREE.Group();
  group.position.y = y;
  scene.add(group);
  const upper = []; // hidden while you are inside this deck, so the camera can see in
  const floors = [];
  const hits = [];

  // Floor: planks, with the courtyard opening cut out on the middle decks.
  const ft = planks(P.walls.floor);
  const floorMat = mat('#ffffff', { map: ft, roughness: 0.75 });
  const [hx, hz] = ATRIUM;
  const fx = ax + 0.2;
  const fz = az + 0.2;
  const slab = (x0, z0, x1, z1) => {
    const m = box(x1 - x0, 0.26, z1 - z0, [M.dark, M.dark, floorMat, M.dark, M.dark, M.dark], (x0 + x1) / 2, -0.13, (z0 + z1) / 2);
    m.userData.floor = i;
    group.add(m);
    floors.push(m);
  };
  const open = P.atrium === 'rail' || P.atrium === 'glass';
  if (open) {
    slab(-fx, -fz, fx, -hz);
    slab(-fx, hz, fx, fz);
    slab(-fx, -hz, -hx, hz);
    slab(hx, -hz, fx, hz);
  } else {
    slab(-fx, -fz, fx, fz);
  }

  // Balcony: the part of this deck's floor that sticks out past the walls, over the deck below.
  if (i > 0) {
    const [bx, bz] = PLANS[i - 1].size;
    const ox = bx + 0.25;
    const oz = bz + 0.25;
    const ring = new THREE.Group();
    for (const [x0, z0, x1, z1] of [[-ox, -oz, ox, -fz], [-ox, fz, ox, oz], [-ox, -fz, -fx, fz], [fx, -fz, ox, fz]]) {
      ring.add(box(x1 - x0, 0.22, z1 - z0, M.deck, (x0 + x1) / 2, -0.12, (z0 + z1) / 2));
    }
    if (!P.roof) {
      railing(ring, -ox, oz - 0.05, ox, oz - 0.05, 0, { flowers: true });
      railing(ring, ox - 0.05, -oz, ox - 0.05, oz, 0, { flowers: true });
      railing(ring, -ox, -oz + 0.05, ox, -oz + 0.05, 0, { flowers: true });
      railing(ring, -ox + 0.05, -oz, -ox + 0.05, oz, 0, { flowers: true });
    }
    group.add(ring);
    upper.push(ring);
  }

  // Walls. Back walls (-z, -x) stay up; front walls (+z, +x) keep only their lower part when
  // you are inside, like the cut-away rooms at Chris's place.
  if (!P.roof) {
    const innerT = innerWallTex(P.walls.inner, P.walls.dado);
    const inside = mat('#ffffff', { map: innerT, roughness: 0.9 });
    const T = 0.2;
    const low = 0.95;
    const glassFront = P.walls.glass;
    const wall = (len, h, faceIn, faceOut, x, yy, z, alongX, front) => {
      const w = wallMats(inside, latticeTex, len);
      const mats = [w.edge, w.edge, w.edge, w.edge, w.edge, w.edge];
      mats[faceIn] = front && yy > 0 && glassFront ? M.glass : w.inner;
      mats[faceOut] = front && yy > 0 && glassFront ? M.glass : w.outer;
      const m = box(alongX ? len : T, h, alongX ? T : len, mats, x, yy + h / 2, z);
      group.add(m);
      return m;
    };
    // back walls
    wall(2 * ax + 2 * T, WALL_H, 4, 5, 0, 0, -az - T / 2, true);
    wall(2 * az, WALL_H, 0, 1, -ax - T / 2, 0, 0, false);
    // front walls, in two layers
    const door = P.door;
    if (door) {
      const dw = 1.1;
      const segL = ax + T - dw;
      wall(segL, low, 5, 4, -dw - segL / 2, 0, az + T / 2, true, true);
      wall(segL, low, 5, 4, dw + segL / 2, 0, az + T / 2, true, true);
      upper.push(wall(segL, WALL_H - low, 5, 4, -dw - segL / 2, low, az + T / 2, true, true));
      upper.push(wall(segL, WALL_H - low, 5, 4, dw + segL / 2, low, az + T / 2, true, true));
      upper.push(wall(2 * dw, WALL_H - 2.4, 5, 4, 0, 2.4, az + T / 2, true, true));
      // Door frame and a name board above it.
      const frame = new THREE.Group();
      frame.add(box(0.16, 2.4, 0.3, M.red, -dw, 1.2, az + T / 2), box(0.16, 2.4, 0.3, M.red, dw, 1.2, az + T / 2), box(1.4, 0.4, 0.06, M.dark, 0, 2.75, az + T + 0.04));
      group.add(frame);
      upper.push(frame);
    } else {
      wall(2 * ax + 2 * T, low, 5, 4, 0, 0, az + T / 2, true, true);
      upper.push(wall(2 * ax + 2 * T, WALL_H - low, 5, 4, 0, low, az + T / 2, true, true));
    }
    wall(2 * az, low, 1, 0, ax + T / 2, 0, 0, false, true);
    upper.push(wall(2 * az, WALL_H - low, 1, 0, ax + T / 2, low, 0, false, true));
    // Corner posts outside.
    for (const [sx, sz] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) {
      const post = box(0.34, WALL_H + 0.3, 0.34, M.red, sx * (ax + T), (WALL_H + 0.3) / 2, sz * (az + T));
      group.add(post);
      if (sx > 0 || sz > 0) upper.push(post);
    }

    // Eave skirt hanging out under the next deck's balcony (or a full roof on the loft).
    const e = new THREE.Group();
    const top = i === PLANS.length - 2;
    eave({ ox: ax + 1.4, oz: az + 1.4, ix: ax + 0.15, iz: az + 0.15, yOut: WALL_H - 0.25, yIn: WALL_H + 0.3, lift: 0.55, flare: 0.5 }, e, lanterns);
    if (top) e.add(box(2 * ax + 0.5, 0.12, 2 * az + 0.5, M.wood, 0, WALL_H + 0.36, 0));
    group.add(e);
    upper.push(e);
  }

  // The courtyard through the middle.
  const court = new THREE.Group();
  if (P.atrium === 'pond') {
    court.add(box(2 * hx + 0.3, 0.3, 2 * hz + 0.3, M.stone, 0, 0.15, 0));
    const water = new THREE.Mesh(new THREE.PlaneGeometry(2 * hx - 0.1, 2 * hz - 0.1), M.water);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.28;
    court.add(water);
    for (const [x, z] of [[-0.8, 0.4], [0.5, -0.5], [0.9, 0.6], [-0.3, -0.7]]) {
      const pad = cyl(0.25, 0.25, 0.02, '#3f7a4a', x, 0.3, z, 14);
      court.add(pad, ball(0.08, '#f4a3b8', x + 0.1, 0.38, z));
    }
    court.add(leaves(0.3, '#2f6b45', 8, 0.9, 0.6, 33));
  } else if (P.atrium === 'rail') {
    const r = 0.12;
    railing(court, -hx - r, hz + r, hx + r, hz + r, 0, { color: M.red });
    railing(court, -hx - r, -hz - r, hx + r, -hz - r, 0, { color: M.red });
    railing(court, -hx - r, -hz - r, -hx - r, hz + r, 0, { color: M.red });
    railing(court, hx + r, -hz - r, hx + r, hz + r, 0, { color: M.red });
    // Vines hanging down through the opening, and gauze curtains.
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      const len = 1.6 + (k % 3) * 0.7;
      const vx = Math.cos(a) * (hx - 0.1);
      const vz = Math.sin(a) * (hz - 0.1);
      court.add(cyl(0.015, 0.015, len, '#3f7a4a', vx, -len / 2, vz, 4));
      court.add(leaves(0.07, '#467a4a', 3, 0.15, -len, k + 50).translateX(vx).translateZ(vz));
    }
    for (const [x, z, ry] of [[-hx + 0.1, 0, Math.PI / 2], [hx - 0.1, 0, Math.PI / 2]]) {
      const g = new THREE.Mesh(new THREE.PlaneGeometry(2 * hz - 0.2, 2.6), M.gauze);
      g.position.set(x, -1.0, z);
      g.rotation.y = ry;
      court.add(g);
    }
    for (const [x, z] of [[-hx - 0.4, hz + 0.4], [hx + 0.4, -hz - 0.4]]) {
      court.add(cyl(0.2, 0.15, 0.35, '#b5654a', x, 0.18, z), leaves(0.22, '#3f8a52', 5, 0.45, 0.6, x * 7));
    }
  } else if (P.atrium === 'glass') {
    const glass = box(2 * hx, 0.05, 2 * hz, M.glass, 0, -0.02, 0);
    glass.castShadow = false;
    glass.userData.floor = i;
    floors.push(glass);
    court.add(glass, box(2 * hx + 0.1, 0.06, 0.08, BRASSY(), 0, 0.01, hz), box(2 * hx + 0.1, 0.06, 0.08, BRASSY(), 0, 0.01, -hz), box(0.08, 0.06, 2 * hz, BRASSY(), hx, 0.01, 0), box(0.08, 0.06, 2 * hz, BRASSY(), -hx, 0.01, 0));
  } else if (P.atrium === 'mirror') {
    court.add(box(2 * hx + 0.3, 0.25, 2 * hz + 0.3, M.stone, 0, 0.12, 0));
    const water = new THREE.Mesh(new THREE.PlaneGeometry(2 * hx - 0.1, 2 * hz - 0.1), new THREE.MeshStandardMaterial({ color: '#9fb7d0', metalness: 0.95, roughness: 0.04, emissive: '#3b4f7a', emissiveIntensity: 0.5 }));
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.26;
    court.add(water);
  }
  if (P.atrium !== 'glass') {
    court.traverse((o) => {
      if (o.isMesh) o.userData.interact = P.atrium === 'mirror' ? 'mirror-final' : 'atrium';
    });
    court.userData.interact = P.atrium === 'mirror' ? 'mirror-final' : 'atrium';
  }
  group.add(court);

  // The roof garden: an open deck with a low rail, corner lanterns and a little canopy.
  if (P.roof) {
    railing(group, -ax - 0.1, az + 0.1, ax + 0.1, az + 0.1, 0, { color: M.gold, h: 0.7 });
    railing(group, ax + 0.1, -az - 0.1, ax + 0.1, az + 0.1, 0, { color: M.gold, h: 0.7 });
    railing(group, -ax - 0.1, -az - 0.1, ax + 0.1, -az - 0.1, 0, { color: M.gold, h: 0.7 });
    railing(group, -ax - 0.1, -az - 0.1, -ax - 0.1, az + 0.1, 0, { color: M.gold, h: 0.7 });
    for (const [sx, sz] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) {
      group.add(cyl(0.06, 0.06, 2.4, M.red, sx * ax, 1.2, sz * az));
      const l = lantern(0.9);
      l.position.set(sx * ax, 2.6, sz * az);
      group.add(l);
      lanterns.push(l);
    }
    // Strings of little lights between the posts.
    const bulbs = new THREE.Group();
    const bulbMat = new THREE.MeshStandardMaterial({ color: '#fff2c8', emissive: '#ffd27a', emissiveIntensity: 1.5 });
    const corners = [[ax, az], [-ax, az], [-ax, -az], [ax, -az], [ax, az]];
    for (let c = 0; c < 4; c++) {
      const [x0, z0] = corners[c];
      const [x1, z1] = corners[c + 1];
      for (let k = 1; k < 12; k++) {
        const u = k / 12;
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), bulbMat);
        b.position.set(x0 + (x1 - x0) * u, 2.3 - Math.sin(u * Math.PI) * 0.4, z0 + (z1 - z0) * u);
        bulbs.add(b);
      }
    }
    group.add(bulbs);
  }

  // Furniture.
  const items = [];
  const blockers = [];
  let stairs = null;
  for (const item of P.items) {
    const build = BUILD[item.type];
    if (!build) continue;
    const obj = build(item);
    obj.position.set(item.at[0], 0, item.at[1]);
    obj.rotation.y = ((item.rot || 0) * Math.PI) / 2;
    if (item.id) {
      obj.userData.interact = item.id;
      obj.userData.item = item;
    }
    group.add(obj);
    items.push({ item, obj });
    if (item.type === 'stairs') stairs = obj;
    if (item.foot) {
      const [w, d] = item.rot % 2 ? [item.foot[1], item.foot[0]] : item.foot;
      blockers.push([item.at[0] - w / 2, item.at[1] - d / 2, item.at[0] + w / 2, item.at[1] + d / 2]);
    }
  }
  if (P.atrium && P.atrium !== 'glass') blockers.push([-hx - 0.2, -hz - 0.2, hx + 0.2, hz + 0.2]);
  const nav = new NavGrid({ x0: -ax, z0: -az, x1: ax, z1: az }, blockers, { cell: 0.2, radius: 0.32 });

  // Warm light for the deck. Only the deck you are on and the ones below it stay lit.
  const light = new THREE.PointLight('#ffd6a0', P.roof ? 10 : 22, 0, 1.3);
  light.position.set(ax * 0.35, 2.5, az * 0.2);
  group.add(light);
  const light2 = new THREE.PointLight('#ffe2b8', P.roof ? 0 : 12, 0, 1.4);
  light2.position.set(-ax * 0.5, 2.4, -az * 0.2);
  group.add(light2);

  // Invisible block for clicking a deck from outside.
  const hit = new THREE.Mesh(new THREE.BoxGeometry(2 * ax + 1, H, 2 * az + 1), new THREE.MeshBasicMaterial());
  hit.position.y = y + H / 2;
  hit.visible = false;
  hit.userData.deck = i;
  scene.add(hit);
  hits.push(hit);

  return { i, y, size: P.size, plan: P, group, upper, floors, items, nav, stairs, lights: [light, light2], hit };
}

let brassMat;
function BRASSY() {
  brassMat ||= mat('#c89b4c', { roughness: 0.35, metalness: 0.7 });
  return brassMat;
}

// --- Pier and gate --------------------------------------------------------------------------------

function pier(scene, lanterns) {
  const len = PIER.z1 - PIER.z0;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(PIER.x * 2, 0.16, len), M.deck);
  deck.position.set(0, PIER.y, (PIER.z0 + PIER.z1) / 2);
  scene.add(deck);
  // Gangway up to the boat.
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 1.2), M.teak);
  ramp.position.set(0, (PIER.y + BASE) / 2, PIER.z0 - 0.3);
  ramp.rotation.x = 0.15;
  scene.add(ramp);
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
  pierLight.position.set(0, 3, PIER.z0 + 8);
  scene.add(pierLight);

  // A flower arch where the pier meets the gangway.
  const gate = new THREE.Group();
  for (const x of [-1.9, 1.9]) gate.add(cyl(0.12, 0.14, 3.6, M.red, x, 1.8, 0));
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.12, 8, 24, Math.PI), M.red);
  arch.position.y = 3.6;
  gate.add(arch);
  const colors = ['#e0567a', '#f2b84b', '#f4f1ea', '#c2452d', '#b48ad6'];
  for (let k = 0; k <= 16; k++) {
    const a = (k / 16) * Math.PI;
    gate.add(ball(0.13, colors[k % 5], Math.cos(a) * 1.9, 3.6 + Math.sin(a) * 1.9, 0.1));
    gate.add(ball(0.11, '#3f7a4a', Math.cos(a + 0.1) * 1.95, 3.6 + Math.sin(a + 0.1) * 1.95, -0.05));
  }
  gate.position.set(0, PIER.y, PIER.z0 + 2.2);
  scene.add(gate);
}

// --- Sea and sky ------------------------------------------------------------------------------------

export function waveY(x, z, t) {
  const fade = 1 - THREE.MathUtils.smoothstep(Math.hypot(x, z), 70, 118);
  const calm = THREE.MathUtils.smoothstep(Math.hypot(x / 1.6, z), 6, 16);
  return (
    (Math.sin(x * 0.16 + t * 0.8) * 0.22 + Math.sin(z * 0.21 - t * 0.65) * 0.18 + Math.sin((x + z) * 0.45 + t * 1.7) * 0.07) * fade * (0.35 + 0.65 * calm)
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
  scene.fog = new THREE.Fog(horizon, 60, 330);

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
    const yy = 0.08 + Math.random() * 0.92;
    const r = Math.sqrt(1 - yy * yy);
    pts.push(Math.cos(th) * r * 800, yy * 800, Math.sin(th) * r * 800);
  }
  stars.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: '#dfe6ff', size: 1.4, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 })));

  const isl = mat('#1d2943', { roughness: 1 });
  [[-170, -260, 60, 34], [-60, -300, 90, 26], [120, -280, 70, 40], [240, -160, 50, 22], [-260, -80, 60, 28], [200, 40, 45, 18]].forEach(([x, z, w, h]) => {
    const m2 = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 7), isl);
    m2.scale.set(w, h, w * 0.5);
    m2.position.set(x, h / 2 - 2, z);
    scene.add(m2);
  });

  // The moon lights the outside of the boat. Inside, a warm lamp takes over (see main.js).
  const moonLight = new THREE.DirectionalLight('#c9d4ff', 1.5);
  moonLight.position.copy(dir).multiplyScalar(60);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048);
  Object.assign(moonLight.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 140 });
  moonLight.shadow.bias = -0.0008;
  moonLight.shadow.normalBias = 0.04;
  const hemi = new THREE.HemisphereLight('#6a78a8', '#1a2430', 0.9);
  scene.add(moonLight, hemi);
  return { moonLight, hemi };
}

// --- The little boat ------------------------------------------------------------------------------
// A small wooden boat with a black arched awning (乌篷船), a boatman and a bow lantern. Forward is +z.

function boat(scene) {
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(1.3, 0.55, 4.6, 6, 2, 28);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = p.getZ(i) / 2.3;
    let x = p.getX(i) * (1 - 0.78 * t * t);
    const yy = p.getY(i) + 0.38 * t ** 4;
    if (p.getY(i) < 0) x *= 0.62;
    p.setXYZ(i, x, yy, p.getZ(i));
  }
  geo.computeVertexNormals();
  const hullM = new THREE.Mesh(geo, mat('#6e4b30', { roughness: 0.75 }));
  hullM.position.y = 0.12;
  const inside = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.05, 3.2), mat('#4a3221'));
  inside.position.y = 0.36;
  const awning = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.7, 16, 1, true, Math.PI / 2, Math.PI), mat('#2a2522', { side: THREE.DoubleSide, roughness: 0.9 }));
  awning.rotation.x = Math.PI / 2;
  awning.position.set(0, 0.4, 0.1);
  g.add(hullM, inside, awning);

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
  const glowL = new THREE.PointLight('#ffa060', 6, 10, 1.6);
  glowL.position.set(0, 1.6, 2.2);
  g.add(pole, l, glowL);
  scene.add(g);
  return { group: g, oar: oarPivot };
}

// --- Merging -------------------------------------------------------------------------------------
// The boat is built from thousands of little boxes. Meshes that never move or get clicked on their
// own are merged per material, so phones draw a few hundred things instead of thousands.
// `skip(child)` leaves a whole subtree alone (it is merged on its own, or must stay separate).
function mergeStatic(root, skip = () => false) {
  root.updateMatrixWorld(true);
  const inv = root.matrixWorld.clone().invert();
  const buckets = new Map();
  const walk = (o) => {
    for (const c of o.children) {
      if (skip(c)) continue;
      const g = c.geometry;
      if (c.isMesh && !Array.isArray(c.material) && !c.userData.floor && !c.userData.keep && g.attributes.uv && g.attributes.normal && c.matrixWorld.determinant() > 0) {
        const key = c.material.uuid + (c.castShadow ? 1 : 0) + (c.receiveShadow ? 1 : 0);
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(c);
      }
      walk(c);
    }
  };
  walk(root);
  const m4 = new THREE.Matrix4();
  for (const list of buckets.values()) {
    if (list.length < 2) continue;
    const parts = list.map((mesh) => {
      const g = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      g.applyMatrix4(m4.multiplyMatrices(inv, mesh.matrixWorld));
      return g;
    });
    const n = parts.reduce((a, g) => a + g.attributes.position.count, 0);
    const pos = new Float32Array(n * 3);
    const nor = new Float32Array(n * 3);
    const uv = new Float32Array(n * 2);
    let k = 0;
    for (const g of parts) {
      pos.set(g.attributes.position.array, k * 3);
      nor.set(g.attributes.normal.array, k * 3);
      uv.set(g.attributes.uv.array, k * 2);
      k += g.attributes.position.count;
      g.dispose();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.computeBoundingSphere();
    const merged = new THREE.Mesh(geo, list[0].material);
    merged.castShadow = list[0].castShadow;
    merged.receiveShadow = list[0].receiveShadow;
    for (const mesh of list) mesh.parent.remove(mesh);
    root.add(merged);
  }
}

// --- Build ------------------------------------------------------------------------------------------

export function buildWorld() {
  materials();
  const scene = new THREE.Scene();
  const lanterns = [];
  const { moonLight, hemi } = sky(scene);
  const { update: updateSea, water } = sea(scene);
  hull(scene);
  pier(scene, lanterns);
  const decks = PLANS.map((_, i) => buildDeck(i, scene, lanterns));
  const b = boat(scene);
  scene.traverse((o) => {
    if (o.isMesh && !o.material.isShaderMaterial && !o.material.isMeshBasicMaterial && !o.material.transparent) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  water.castShadow = false;

  // Merge what can be merged: each deck's moving parts (front walls, eaves, balconies),
  // each clickable thing and the courtyard on their own, then everything else on the deck.
  for (const d of decks) {
    for (const o of d.upper) {
      if (o.isGroup) mergeStatic(o);
    }
    for (const { obj } of d.items) mergeStatic(obj);
    const keep = new Set([...d.upper, ...d.items.map((x) => x.obj)]);
    d.group.children.forEach((c) => {
      if (c.userData.interact && !keep.has(c)) mergeStatic(c);
    });
    mergeStatic(d.group, (c) => keep.has(c) || c.userData.interact || c.isLight);
  }
  mergeStatic(scene, (c) => c === b.group || c === water || decks.some((d) => d.group === c || d.hit === c) || c.isLight || c.isPoints || c.isSprite || c.material?.isShaderMaterial);

  // The little boat's route in from the open sea, ending alongside the end of the pier.
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-46, 0, 120),
    new THREE.Vector3(-22, 0, 84),
    new THREE.Vector3(10, 0, 52),
    new THREE.Vector3(5.5, 0, 33),
    new THREE.Vector3(3.3, 0, 23.5),
  ]);

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
    for (const d of decks) {
      for (const { obj } of d.items) {
        if (obj.userData.spin) obj.userData.spin.rotation.y = t * 0.3;
      }
    }
  }

  return { scene, decks, path, placeBoat, update, boat: b.group, moonLight, hemi, pierEnd: new THREE.Vector3(0, PIER.y, PIER.z0 + 3) };
}
