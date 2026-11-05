// Furniture and fittings for the decks, one builder per `type` in decks.js.
// Each builder returns a Group standing on y = 0 and facing +z (towards the camera); decks.js
// places and turns it. Wall pieces are drawn flat against a wall at local z = 0.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { paint } from './art.js';

const cache = new Map();
export function mat(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (!cache.has(key)) cache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...o }));
  return cache.get(key);
}

export function box(w, h, d, m, x = 0, y = 0, z = 0, r = 0) {
  const g = r ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(g, typeof m === 'string' ? mat(m) : m);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
function cyl(rt, rb, h, m, x = 0, y = 0, z = 0, seg = 12) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof m === 'string' ? mat(m) : m);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}
function ball(r, m, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), typeof m === 'string' ? mat(m) : m);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}
function group(...kids) {
  const g = new THREE.Group();
  g.add(...kids);
  return g;
}

export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
function plane(w, h, tex, o = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, ...o }));
  return m;
}
function rng(seed) {
  let a = seed * 7919 + 17;
  return () => ((a = (a * 16807) % 2147483647) / 2147483647);
}

const TEAK = '#6b4228';
const DARK = '#3a2519';
const BRASS = mat('#c89b4c', { roughness: 0.35, metalness: 0.7 });

function leaves(r, color, n, spread, y, seed = 1) {
  const g = new THREE.Group();
  const rand = rng(seed);
  for (let i = 0; i < n; i++) {
    const s = ball(r * (0.6 + rand() * 0.6), color, (rand() - 0.5) * spread, y + (rand() - 0.3) * spread * 0.6, (rand() - 0.5) * spread);
    s.scale.y = 0.75;
    g.add(s);
  }
  return g;
}

// --- Shared ---------------------------------------------------------------------------------

function stairs() {
  const g = new THREE.Group();
  const steps = [];
  const n = 10;
  for (let i = 0; i < n; i++) {
    const glow = new THREE.MeshStandardMaterial({ color: '#7a4b2c', roughness: 0.7, emissive: '#ffb45e', emissiveIntensity: 0 });
    const x = 1.35 - (i * 2.7) / (n - 1);
    const h = 0.17 * (i + 1);
    g.add(box(0.3, h, 1.1, mat('#4a2e1e'), x, h / 2, 0));
    const tread = box(0.32, 0.04, 1.12, glow, x, h + 0.02, 0);
    g.add(tread);
    steps.push(glow);
  }
  // Banister on the open side, rising with the steps.
  const rail = box(3.1, 0.06, 0.06, mat('#8e2f2a'), 0, 1.84, 0.58);
  rail.rotation.z = -Math.atan2(1.53, 2.7);
  g.add(rail);
  for (let i = 0; i < n; i += 3) {
    const x = 1.35 - (i * 2.7) / (n - 1);
    g.add(box(0.05, 0.9, 0.05, mat('#8e2f2a'), x, 0.17 * (i + 1) + 0.45, 0.58));
  }
  g.userData.steps = steps;
  return g;
}

function pottedPlant(item) {
  const g = group(cyl(0.24, 0.18, 0.4, '#b5654a', 0, 0.2, 0), cyl(0.035, 0.035, 0.6, '#5a4632', 0, 0.6, 0));
  g.add(leaves(0.28, '#3f7a4a', 7, 0.6, 1.05, item.at[0] * 3 + 7));
  return g;
}

// --- Deck 01 · Guangzhou ---------------------------------------------------------------------

function memoryWindow(item) {
  const seed = item.seed || 1;
  const tex = canvasTex(256, 320, (ctx, w, h) => {
    const r = rng(seed);
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#3f5a66');
    sky.addColorStop(1, '#8fa39a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    // Blurred city across the river.
    ctx.filter = 'blur(3px)';
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = `rgba(30,40,46,${0.35 + r() * 0.3})`;
      const bw = 14 + r() * 30;
      const bh = 40 + r() * 120;
      ctx.fillRect(r() * w, h * 0.72 - bh, bw, bh);
    }
    ctx.fillStyle = 'rgba(255,214,150,0.6)';
    for (let i = 0; i < 40; i++) ctx.fillRect(r() * w, h * 0.35 + r() * h * 0.35, 3, 3);
    ctx.filter = 'none';
    ctx.fillStyle = '#5a7066';
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
    // Banyan leaves in the foreground.
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(28,52,36,${0.5 + r() * 0.4})`;
      ctx.beginPath();
      ctx.ellipse((seed % 2 ? 0 : w) + (r() - 0.5) * w * 0.7, r() * h * 0.4, 12 + r() * 18, 7 + r() * 8, r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Rain.
    ctx.strokeStyle = 'rgba(230,240,240,0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 90; i++) {
      const x = r() * w;
      const y = r() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 3, y + 14);
      ctx.stroke();
    }
  });
  const g = new THREE.Group();
  const pane = plane(1.5, 1.8, tex, { emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.45 });
  pane.position.set(0, 1.7, 0.03);
  g.add(pane);
  const fw = mat(TEAK);
  g.add(box(1.7, 0.1, 0.1, fw, 0, 2.65, 0.05), box(1.7, 0.12, 0.16, fw, 0, 0.77, 0.08), box(0.1, 1.9, 0.1, fw, -0.8, 1.7, 0.05), box(0.1, 1.9, 0.1, fw, 0.8, 1.7, 0.05));
  g.add(box(0.05, 1.8, 0.05, fw, 0, 1.7, 0.06), box(1.5, 0.05, 0.05, fw, 0, 1.95, 0.06));
  // Half-open shutters.
  for (const s of [-1, 1]) {
    const sh = box(0.75, 1.8, 0.04, mat('#55361f'), s * 1.2, 1.7, 0.25);
    sh.rotation.y = s * -0.7;
    g.add(sh);
  }
  return g;
}

function schoolDesk() {
  const g = new THREE.Group();
  g.add(box(1.2, 0.06, 0.65, '#a9774a', 0, 0.76, 0, 0.01));
  g.add(box(1.1, 0.2, 0.55, '#8b5e3a', 0, 0.62, 0));
  for (const [x, z] of [[-0.52, -0.26], [0.52, -0.26], [-0.52, 0.26], [0.52, 0.26]]) g.add(box(0.05, 0.74, 0.05, '#3e4a52', x, 0.37, z));
  // Textbooks and a pencil case.
  const colors = ['#c84b3c', '#3c6fa3', '#e2c05a', '#4f8a5b'];
  colors.forEach((c, i) => g.add(box(0.42, 0.05, 0.3, c, -0.3, 0.82 + i * 0.05, -0.05 + (i % 2) * 0.03)));
  g.add(box(0.36, 0.02, 0.26, '#f3ecd8', 0.25, 0.8, 0.05));
  g.add(box(0.22, 0.05, 0.06, '#2f6b8f', 0.3, 0.82, -0.2, 0.02));
  // Chair.
  g.add(box(0.45, 0.05, 0.42, '#a9774a', 0, 0.45, 0.6), box(0.45, 0.4, 0.04, '#a9774a', 0, 0.75, 0.82));
  for (const [x, z] of [[-0.2, 0.42], [0.2, 0.42], [-0.2, 0.8], [0.2, 0.8]]) g.add(box(0.04, 0.45, 0.04, '#3e4a52', x, 0.22, z));
  return g;
}

function uniform() {
  const g = new THREE.Group();
  g.add(cyl(0.025, 0.025, 1.7, '#3a2a20', 0, 0.85, 0), cyl(0.22, 0.25, 0.04, '#3a2a20', 0, 0.02, 0), box(0.5, 0.04, 0.04, '#3a2a20', 0, 1.62, 0));
  // School tracksuit jacket: white with blue sleeves and a red collar line.
  g.add(box(0.44, 0.58, 0.16, '#f4f2ec', 0, 1.3, 0, 0.05));
  for (const s of [-1, 1]) g.add(box(0.1, 0.5, 0.12, '#2f5c9e', s * 0.27, 1.32, 0, 0.04));
  g.add(box(0.3, 0.05, 0.17, '#c23b32', 0, 1.56, 0));
  return g;
}

function banyan() {
  const g = new THREE.Group();
  g.add(cyl(0.7, 0.6, 0.5, '#8a8178', 0, 0.25, 0, 16));
  const trunk = cyl(0.14, 0.24, 1.8, '#6b5643', 0, 1.3, 0, 8);
  g.add(trunk);
  // Aerial roots hanging from the branches.
  const rand = rng(5);
  for (let i = 0; i < 9; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.3 + rand() * 0.45;
    g.add(cyl(0.012, 0.012, 1.0 + rand() * 0.6, '#7a6650', Math.cos(a) * r, 1.6, Math.sin(a) * r, 4));
  }
  g.add(leaves(0.42, '#2f5e3a', 16, 1.5, 2.6, 3), leaves(0.3, '#467a4a', 10, 1.3, 2.9, 9));
  return g;
}

function rattanBench() {
  const g = new THREE.Group();
  const rattan = mat('#c9a46a', { roughness: 0.9 });
  g.add(box(1.9, 0.1, 0.55, rattan, 0, 0.42, 0, 0.03), box(1.9, 0.45, 0.06, rattan, 0, 0.7, -0.25, 0.02));
  for (const x of [-0.85, 0.85]) g.add(box(0.06, 0.42, 0.5, '#8a6a3e', x, 0.21, 0));
  g.add(box(0.5, 0.1, 0.4, '#b8322a', -0.5, 0.52, 0.02, 0.04), box(0.5, 0.1, 0.4, '#4f7a62', 0.4, 0.52, 0.02, 0.04));
  return g;
}

function lowTable() {
  const g = group(box(1.1, 0.06, 0.7, TEAK, 0, 0.4, 0, 0.01));
  for (const [x, z] of [[-0.48, -0.28], [0.48, -0.28], [-0.48, 0.28], [0.48, 0.28]]) g.add(box(0.06, 0.38, 0.06, DARK, x, 0.19, z));
  // A tea set.
  g.add(cyl(0.08, 0.1, 0.12, '#e9efe9', -0.15, 0.5, 0), ball(0.05, '#e9efe9', -0.15, 0.58, 0));
  for (const x of [0.15, 0.3]) g.add(cyl(0.04, 0.03, 0.05, '#e9efe9', x, 0.46, 0.1));
  return g;
}

// --- Deck 02 · Oxford -----------------------------------------------------------------------

function bookshelf() {
  const g = new THREE.Group();
  const wood = mat('#3b2a1f');
  g.add(box(3.6, 2.6, 0.5, wood, 0, 1.3, 0));
  const spines = ['#7b2d26', '#2e4a3a', '#1f3350', '#8a6a3e', '#5b4a6e', '#a9774a', '#3d3d3d'];
  const rand = rng(11);
  for (let s = 0; s < 5; s++) {
    const y = 0.15 + s * 0.5;
    g.add(box(3.5, 0.04, 0.48, mat('#2a1d15'), 0, y, 0.02));
    let x = -1.68;
    while (x < 1.6) {
      const w = 0.05 + rand() * 0.06;
      const h = 0.3 + rand() * 0.12;
      g.add(box(w, h, 0.32, spines[Math.floor(rand() * spines.length)], x + w / 2, y + 0.02 + h / 2, 0.08));
      x += w + 0.008;
    }
  }
  return g;
}

function readingTable() {
  const g = group(box(1.3, 0.06, 0.8, '#3b2a1f', 0, 0.76, 0));
  for (const [x, z] of [[-0.58, -0.33], [0.58, -0.33], [-0.58, 0.33], [0.58, 0.33]]) g.add(box(0.07, 0.74, 0.07, '#2a1d15', x, 0.37, z));
  g.add(box(0.5, 0.03, 0.36, '#f0e6cc', -0.2, 0.8, 0), cyl(0.02, 0.02, 0.4, BRASS, 0.4, 0.98, -0.2), ball(0.11, mat('#2f5e3a', { emissive: '#e9c87a', emissiveIntensity: 0.6 }), 0.4, 1.2, -0.2));
  return g;
}

function greenhouse() {
  const g = new THREE.Group();
  const frame = mat('#e8e4da', { roughness: 0.5 });
  const glass = new THREE.MeshStandardMaterial({ color: '#cfe6dc', transparent: true, opacity: 0.22, roughness: 0.1, depthWrite: false });
  const W = 3.8;
  const D = 2.2;
  g.add(box(W, 0.25, D, '#8a8178', 0, 0.12, 0));
  const walls = box(W - 0.05, 1.9, D - 0.05, glass, 0, 1.2, 0);
  walls.castShadow = false;
  g.add(walls);
  for (const x of [-W / 2, -W / 4, 0, W / 4, W / 2]) for (const z of [-D / 2, D / 2]) g.add(box(0.05, 1.95, 0.05, frame, x, 1.2, z));
  for (const z of [-D / 2, D / 2]) g.add(box(W, 0.05, 0.05, frame, 0, 2.15, z));
  // Pitched glass roof.
  for (const s of [-1, 1]) {
    const roof = box(W, 0.03, D * 0.58, glass, 0, 2.45, s * D * 0.25);
    roof.rotation.x = s * 0.5;
    roof.castShadow = false;
    g.add(roof);
  }
  g.add(box(W, 0.06, 0.06, frame, 0, 2.72, 0));
  // Tropical plants inside, from somewhere warmer.
  const greens = ['#2f6b45', '#3f8a52', '#517d3a', '#2a5a48'];
  for (let i = 0; i < 6; i++) {
    const x = -W / 2 + 0.4 + i * ((W - 0.8) / 5);
    g.add(cyl(0.16, 0.12, 0.3, '#b5654a', x, 0.4, (i % 2 ? 0.4 : -0.4)));
    const l = leaves(0.25, greens[i % 4], 6, 0.6, 1.0 + (i % 3) * 0.25, i + 20);
    l.position.set(x, 0, i % 2 ? 0.4 : -0.4);
    g.add(l);
  }
  g.add(ball(0.06, '#e0567a', -0.6, 1.25, 0.3), ball(0.06, '#f2b84b', 0.9, 1.4, -0.3), ball(0.06, '#e0567a', 1.3, 1.1, 0.4));
  return g;
}

function designTable() {
  const g = group(box(2.1, 0.06, 0.9, '#d9c7a4', 0, 0.9, 0));
  for (const [x, z] of [[-0.98, -0.4], [0.98, -0.4], [-0.98, 0.4], [0.98, 0.4]]) g.add(box(0.06, 0.88, 0.06, '#5a4632', x, 0.44, z));
  // Paper patterns, scissors and a sewing machine.
  g.add(box(0.8, 0.01, 0.55, '#f3ead6', -0.4, 0.94, 0.05), box(0.5, 0.01, 0.4, '#e8d3b0', -0.55, 0.95, -0.1));
  const machine = new THREE.Group();
  machine.add(box(0.5, 0.12, 0.24, '#f1ede4', 0, 0.06, 0, 0.03), box(0.12, 0.28, 0.2, '#f1ede4', 0.18, 0.24, 0, 0.03), box(0.42, 0.1, 0.18, '#f1ede4', 0, 0.38, 0, 0.03), cyl(0.012, 0.012, 0.14, '#888', -0.17, 0.27, 0.02));
  machine.position.set(0.55, 0.93, 0);
  g.add(machine);
  g.add(box(0.5, 0.04, 0.3, '#7d97a6', 0.1, 0.95, 0.25), cyl(0.05, 0.05, 0.08, '#b8322a', -0.85, 0.97, 0.3));
  return g;
}

function dressForm() {
  const g = new THREE.Group();
  g.add(cyl(0.2, 0.22, 0.04, '#3a2a20', 0, 0.02, 0), cyl(0.025, 0.025, 1.0, '#3a2a20', 0, 0.5, 0));
  const torso = cyl(0.2, 0.15, 0.55, '#e9dcc4', 0, 1.28, 0, 16);
  torso.scale.z = 0.7;
  const hips = cyl(0.15, 0.22, 0.25, '#e9dcc4', 0, 0.9, 0, 16);
  hips.scale.z = 0.7;
  g.add(torso, hips, ball(0.06, '#3a2a20', 0, 1.6, 0));
  // A half-finished skirt pinned on.
  const skirt = cyl(0.23, 0.38, 0.5, mat('#9e2a26', { side: THREE.DoubleSide }), 0, 0.82, 0, 18);
  skirt.scale.z = 0.8;
  g.add(skirt);
  return g;
}

function stoneArch() {
  const g = new THREE.Group();
  const stone = mat('#9c9a90', { roughness: 0.95 });
  g.add(box(0.4, 2.3, 0.18, stone, -1.0, 1.15, 0.09), box(0.4, 2.3, 0.18, stone, 1.0, 1.15, 0.09));
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.2, 8, 20, Math.PI), stone);
  arch.position.set(0, 2.3, 0.09);
  arch.scale.z = 0.45;
  g.add(arch);
  // A rainy window under the arch.
  const tex = canvasTex(128, 192, (ctx, w, h) => {
    ctx.fillStyle = '#7f9289';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(240,245,245,0.5)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 2, y + 10);
      ctx.stroke();
    }
    ctx.strokeStyle = '#2a2a28';
    ctx.lineWidth = 4;
    ctx.strokeRect(w / 2 - 1, 0, 2, h);
    ctx.strokeRect(0, h / 2 - 1, w, 2);
  });
  const win = plane(1.5, 2.1, tex, { emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.35 });
  win.position.set(0, 1.4, 0.02);
  g.add(win);
  return g;
}

// --- Deck 03 · HKU --------------------------------------------------------------------------

function chartTex(seed, dark = false) {
  return canvasTex(256, 160, (ctx, w, h) => {
    const r = rng(seed);
    ctx.fillStyle = dark ? '#0f1a24' : '#f7f3ea';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = dark ? 'rgba(120,180,200,0.25)' : 'rgba(0,0,0,0.08)';
    for (let y = 20; y < h; y += 28) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();
    }
    const lines = dark ? ['#5fd0c4', '#f2b84b', '#e0567a'] : ['#b8322a', '#1f3350', '#4f7a62'];
    lines.forEach((c) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 3;
      ctx.beginPath();
      let y = h * (0.3 + r() * 0.4);
      for (let x = 10; x <= w - 10; x += 12) {
        y = Math.min(h - 12, Math.max(12, y + (r() - 0.5) * 22));
        x === 10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
    if (!dark) {
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = lines[i % 3];
        const bh = 10 + r() * 30;
        ctx.fillRect(w - 80 + i * 11, h - 10 - bh, 8, bh);
      }
    }
  });
}

function marketDesk() {
  const g = group(box(2.1, 0.06, 0.85, '#2f2620', 0, 0.76, 0));
  for (const x of [-0.98, 0.98]) g.add(box(0.06, 0.74, 0.8, '#1f1915', x, 0.37, 0));
  [-0.6, 0, 0.6].forEach((x, i) => {
    g.add(box(0.06, 0.25, 0.06, '#222', x, 0.92, -0.2));
    const scr = box(0.58, 0.36, 0.03, '#111', x, 1.2, -0.22);
    scr.rotation.y = -x * 0.35;
    g.add(scr);
    const p = plane(0.54, 0.32, chartTex(i + 3, true), { emissive: '#ffffff', emissiveMap: chartTex(i + 3, true), emissiveIntensity: 0.9 });
    p.position.set(x, 1.2, -0.2);
    p.rotation.y = -x * 0.35;
    g.add(p);
  });
  g.add(box(0.45, 0.02, 0.15, '#333', 0, 0.8, 0.2), box(0.3, 0.02, 0.4, '#f3ecd8', -0.75, 0.8, 0.15));
  // Chair.
  g.add(cyl(0.25, 0.25, 0.08, '#1f3350', 0, 0.48, 0.65, 16), box(0.45, 0.45, 0.06, '#1f3350', 0, 0.78, 0.88), cyl(0.03, 0.03, 0.44, '#555', 0, 0.22, 0.65));
  return g;
}

function chartBoard() {
  const g = new THREE.Group();
  [[-0.75, 1.9], [0.75, 1.9], [0, 1.0]].forEach(([x, y], i) => {
    g.add(box(1.35, 0.85, 0.04, '#2f2620', x, y, 0.02));
    const p = plane(1.25, 0.75, chartTex(i + 10));
    p.position.set(x, y, 0.05);
    g.add(p);
  });
  return g;
}

function screen() {
  // A folding screen with lattice panels, half separating the two rooms.
  const g = new THREE.Group();
  const tex = canvasTex(64, 128, (ctx, w, h) => {
    ctx.fillStyle = '#efe3c8';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#6e2a24';
    ctx.lineWidth = 3;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo((i * w) / 4, 0);
      ctx.lineTo((i * w) / 4, h);
      ctx.stroke();
    }
    for (let i = 1; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (i * h) / 8);
      ctx.lineTo(w, (i * h) / 8);
      ctx.stroke();
    }
  });
  for (let i = 0; i < 3; i++) {
    const p = box(0.58, 1.7, 0.04, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), -0.6 + i * 0.6, 0.95, (i % 2) * 0.12);
    p.rotation.y = i % 2 ? 0.3 : -0.3;
    g.add(p);
  }
  return g;
}

function paintings() {
  const g = new THREE.Group();
  const works = [
    { art: { style: 'moon', seed: 4 }, w: 1.1, h: 0.8, x: -1.3, y: 1.75 },
    { art: { style: 'calligraphy', text: '梦蝶' }, w: 0.5, h: 1.3, x: 0, y: 1.6 },
    { art: { style: 'waves', seed: 2 }, w: 1.1, h: 0.8, x: 1.3, y: 1.75 },
  ];
  for (const k of works) {
    const tex = new THREE.CanvasTexture(paint(k.art, k.w / k.h));
    tex.colorSpace = THREE.SRGBColorSpace;
    g.add(box(k.w + 0.1, k.h + 0.1, 0.05, '#2a201a', k.x, k.y, 0.03));
    const p = new THREE.Mesh(new THREE.PlaneGeometry(k.w, k.h), new THREE.MeshBasicMaterial({ map: tex }));
    p.position.set(k.x, k.y, 0.06);
    g.add(p);
  }
  return g;
}

function catalogueTable() {
  const g = group(box(1.7, 0.06, 0.95, '#8e5b3a', 0, 0.74, 0, 0.01));
  for (const [x, z] of [[-0.78, -0.4], [0.78, -0.4], [-0.78, 0.4], [0.78, 0.4]]) g.add(box(0.06, 0.72, 0.06, DARK, x, 0.36, z));
  const covers = ['#1f3350', '#b8322a', '#efe3c8', '#2a2a2a', '#c9a46a'];
  covers.forEach((c, i) => {
    const b = box(0.32, 0.03 + (i % 2) * 0.02, 0.42, c, -0.6 + i * 0.3, 0.79, (i % 2 ? 0.15 : -0.1));
    b.rotation.y = (i - 2) * 0.12;
    g.add(b);
  });
  // An open catalogue.
  const tex = new THREE.CanvasTexture(paint({ style: 'field', seed: 5, colors: ['#d7dde0', '#7d97a6', '#f4f1ea'] }, 1.4));
  tex.colorSpace = THREE.SRGBColorSpace;
  const page = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.42), new THREE.MeshBasicMaterial({ map: tex }));
  page.rotation.x = -Math.PI / 2;
  page.position.set(0.3, 0.81, 0.2);
  g.add(page);
  return g;
}

function longTable() {
  const g = group(box(3.5, 0.08, 0.7, '#6b3a24', 0, 0.76, 0, 0.02));
  for (const x of [-1.6, 1.6]) g.add(box(0.1, 0.74, 0.6, DARK, x, 0.37, 0));
  // One side business, the other art: a ledger and a calculator, a brush and an ink stone.
  g.add(box(0.5, 0.04, 0.35, '#1f3350', -1.1, 0.82, 0), box(0.18, 0.03, 0.26, '#333', -0.6, 0.82, 0.05));
  g.add(box(0.3, 0.04, 0.2, '#222', 0.9, 0.82, 0), cyl(0.012, 0.012, 0.3, '#8a6a3e', 1.2, 0.82, 0.05));
  g.add(cyl(0.12, 0.1, 0.18, '#efe3c8', 0, 0.89, 0), leaves(0.08, '#e0567a', 5, 0.18, 1.05, 4));
  for (const x of [-1.2, -0.4, 0.4, 1.2]) for (const z of [-0.6, 0.6]) {
    const stool = cyl(0.17, 0.15, 0.45, '#8e5b3a', x, 0.22, z, 10);
    g.add(stool);
  }
  return g;
}

// --- Deck 04 · Penn and the Flight Room ------------------------------------------------------

function researchTable() {
  const g = group(box(1.9, 0.05, 1.0, '#2b2b2f', 0, 0.76, 0));
  for (const [x, z] of [[-0.88, -0.44], [0.88, -0.44], [-0.88, 0.44], [0.88, 0.44]]) g.add(box(0.04, 0.74, 0.04, '#9aa0a6', x, 0.37, z));
  // Policy papers, a map and a laptop.
  for (let i = 0; i < 4; i++) {
    const p = box(0.3, 0.01, 0.4, '#f7f3ea', -0.6 + i * 0.12, 0.79 + i * 0.006, -0.1 + i * 0.03);
    p.rotation.y = (i - 1.5) * 0.15;
    g.add(p);
  }
  g.add(box(0.36, 0.02, 0.25, '#c8ccd0', 0.5, 0.8, 0.1), box(0.36, 0.24, 0.02, '#c8ccd0', 0.5, 0.92, -0.02));
  // Chairs.
  for (const x of [-0.45, 0.45]) g.add(box(0.42, 0.05, 0.42, '#5a3c2a', x, 0.46, 0.72), box(0.42, 0.4, 0.05, '#5a3c2a', x, 0.7, 0.92), box(0.04, 0.45, 0.04, '#9aa0a6', x, 0.22, 0.72));
  return g;
}

function projection() {
  const g = new THREE.Group();
  const tex = chartTex(42, true);
  const p = plane(2.2, 1.35, tex, { emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.85 });
  p.position.set(0, 1.75, 0.03);
  g.add(p, box(2.35, 0.06, 0.08, '#444', 0, 2.47, 0.04));
  return g;
}

function cityMap() {
  const tex = canvasTex(320, 200, (ctx, w, h) => {
    ctx.fillStyle = '#e9e4d6';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#c9c1ac';
    ctx.lineWidth = 2;
    for (let x = 0; x < w; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 30, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y - 10);
      ctx.stroke();
    }
    ctx.strokeStyle = '#7fa6b8';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.bezierCurveTo(90, 80, 30, 120, 70, 200);
    ctx.stroke();
    // Route pins: Guangzhou, Oxford, Hong Kong, Philadelphia.
    [[250, 120], [120, 50], [240, 140], [60, 70]].forEach(([x, y], i) => {
      ctx.fillStyle = '#b8322a';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      if (i) {
        ctx.strokeStyle = 'rgba(184,50,42,0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        const prev = [[250, 120], [120, 50], [240, 140], [60, 70]][i - 1];
        ctx.moveTo(...prev);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  });
  const g = new THREE.Group();
  const p = plane(2.6, 1.6, tex);
  p.position.set(0, 1.7, 0.03);
  g.add(p, box(2.7, 1.7, 0.03, '#2a201a', 0, 1.7, 0.01));
  return g;
}

function flightConsole() {
  const g = new THREE.Group();
  // Brass-and-glass console under a curved window that shows where the boat is "flying".
  g.add(box(2.8, 0.9, 0.8, '#4a2e1e', 0, 0.45, 0, 0.04));
  const top = box(2.8, 0.08, 0.9, '#2b2b2f', 0, 0.95, 0.05);
  top.rotation.x = 0.25;
  g.add(top);
  for (let i = 0; i < 5; i++) {
    const dial = cyl(0.12, 0.12, 0.03, BRASS, -1.0 + i * 0.5, 1.02, 0.05, 20);
    dial.rotation.x = Math.PI / 2 + 0.25 - Math.PI / 2;
    g.add(dial);
    const face = cyl(0.095, 0.095, 0.035, mat('#f4efe2', { emissive: '#ffe2a8', emissiveIntensity: 0.4 }), -1.0 + i * 0.5, 1.03, 0.05, 20);
    g.add(face);
  }
  // Ship's wheel.
  const wheel = new THREE.Group();
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.03, 8, 32), mat('#8a5a32')));
  for (let k = 0; k < 8; k++) {
    const spoke = box(0.03, 0.95, 0.03, mat('#8a5a32'), 0, 0, 0);
    spoke.rotation.z = (k * Math.PI) / 8;
    wheel.add(spoke);
  }
  wheel.add(cyl(0.07, 0.07, 0.08, BRASS, 0, 0, 0));
  wheel.children.at(-1).rotation.x = Math.PI / 2;
  wheel.position.set(0, 1.35, 0.5);
  wheel.rotation.x = -0.3;
  g.add(wheel);
  g.userData.wheel = wheel;
  // Projection window behind the console.
  const tex = canvasTex(256, 128, (ctx, w, h) => {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0d1a3a');
    sky.addColorStop(1, '#3a4f7a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(242,184,75,0.8)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, 100);
    ctx.quadraticCurveTo(128, 10, 236, 80);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f2b84b';
    for (const [x, y] of [[20, 100], [100, 42], [170, 40], [236, 80]]) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  const win = plane(2.8, 1.3, tex, { emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.9 });
  win.position.set(0, 2.05, -0.62);
  g.add(win, box(3.0, 0.08, 0.1, BRASS, 0, 2.72, -0.6), box(3.0, 0.08, 0.1, BRASS, 0, 1.4, -0.6));
  return g;
}

function captainChair() {
  return group(cyl(0.28, 0.28, 0.1, '#7a2a24', 0, 0.5, 0, 16), box(0.5, 0.5, 0.08, '#7a2a24', 0, 0.82, 0.25, 0.03), cyl(0.04, 0.04, 0.45, BRASS, 0, 0.23, 0), cyl(0.25, 0.25, 0.03, BRASS, 0, 0.02, 0));
}

function globe() {
  const tex = canvasTex(128, 64, (ctx, w, h) => {
    ctx.fillStyle = '#7fa6b8';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#d9c7a4';
    const r = rng(8);
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.ellipse(r() * w, 10 + r() * (h - 20), 6 + r() * 14, 4 + r() * 9, r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 16), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }));
  earth.position.y = 1.05;
  earth.rotation.z = 0.4;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.015, 6, 32), BRASS);
  ring.position.y = 1.05;
  ring.rotation.y = Math.PI / 2;
  const g = group(cyl(0.05, 0.22, 0.75, '#4a2e1e', 0, 0.38, 0), earth, ring);
  earth.userData.keep = true;
  g.userData.spin = earth;
  return g;
}

// --- Deck 05 · The Maker's Loft --------------------------------------------------------------

function drawers() {
  const g = group(box(1.7, 1.0, 0.6, '#d8c3a0', 0, 0.5, 0, 0.02));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
    const open = r === 1 && c === 0;
    g.add(box(0.78, 0.27, 0.04, '#c4ab84', -0.41 + c * 0.82, 0.2 + r * 0.31, 0.31 + (open ? 0.18 : 0)));
    g.add(ball(0.025, BRASS, -0.41 + c * 0.82, 0.2 + r * 0.31, 0.34 + (open ? 0.18 : 0)));
    if (open) g.add(box(0.7, 0.02, 0.3, '#f7f1e6', -0.41, 0.28, 0.4));
  }
  g.add(box(0.5, 0.02, 0.35, '#f7f1e6', 0.3, 1.02, 0), box(0.4, 0.02, 0.3, '#efe3c8', 0.4, 1.035, 0.05));
  g.add(cyl(0.08, 0.06, 0.2, '#e9efe9', -0.5, 1.1, 0), leaves(0.07, '#e0567a', 5, 0.16, 1.25, 2));
  return g;
}

function fabricLine() {
  const g = new THREE.Group();
  for (const x of [-1.2, 1.2]) g.add(cyl(0.03, 0.03, 2.2, '#8a6a3e', x, 1.1, 0));
  g.add(cyl(0.012, 0.012, 2.4, '#ddd', 0, 2.1, 0));
  g.children.at(-1).rotation.z = Math.PI / 2;
  const cloths = ['#9e2a26', '#efe3c8', '#2f5c9e', '#c9a46a', '#4f7a62'];
  cloths.forEach((c, i) => {
    const cloth = box(0.4, 0.9 + (i % 2) * 0.3, 0.02, mat(c, { side: THREE.DoubleSide, roughness: 0.95 }), -0.9 + i * 0.45, 1.6 - (i % 2) * 0.15, 0);
    cloth.rotation.y = (i % 2 ? 0.15 : -0.15);
    g.add(cloth);
  });
  return g;
}

function standingMirror(item) {
  const big = item.big;
  const g = new THREE.Group();
  const H2 = big ? 2.0 : 1.7;
  g.add(box(0.9, 0.06, 0.4, '#8a6a3e', 0, 0.03, 0));
  for (const x of [-0.42, 0.42]) g.add(box(0.05, H2, 0.05, '#8a6a3e', x, H2 / 2, 0));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.76, H2 - 0.3), new THREE.MeshStandardMaterial({ color: '#cfe0ea', metalness: 0.9, roughness: 0.08, emissive: '#7f9fc0', emissiveIntensity: 0.25 }));
  glass.position.set(0, H2 / 2 + 0.05, 0.03);
  g.add(glass, box(0.84, 0.05, 0.06, '#8a6a3e', 0, H2 - 0.05, 0), box(0.84, 0.05, 0.06, '#8a6a3e', 0, 0.25, 0));
  return g;
}

function clothesRack() {
  const g = new THREE.Group();
  for (const x of [-1.0, 1.0]) g.add(cyl(0.025, 0.025, 1.7, '#3a2a20', x, 0.85, 0), box(0.06, 0.04, 0.5, '#3a2a20', x, 0.02, 0));
  const bar = cyl(0.02, 0.02, 2.05, '#3a2a20', 0, 1.68, 0);
  bar.rotation.z = Math.PI / 2;
  g.add(bar);
  const looks = [['#efe3c8', 1.0], ['#9e2a26', 1.2], ['#1f3350', 0.9], ['#c9a46a', 1.1], ['#f2e6d8', 1.25]];
  looks.forEach(([c, len], i) => {
    const x = -0.75 + i * 0.37;
    g.add(box(0.3, 0.03, 0.02, '#8a6a3e', x, 1.6, 0));
    const dress = cyl(0.12, 0.22, len, mat(c, { roughness: 0.95 }), x, 1.58 - len / 2, 0, 10);
    dress.scale.z = 0.5;
    g.add(dress);
  });
  return g;
}

function easel() {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const leg = box(0.05, 1.7, 0.05, '#a07a4a', s * 0.3, 0.85, 0);
    leg.rotation.z = s * -0.12;
    g.add(leg);
  }
  const back = box(0.05, 1.6, 0.05, '#a07a4a', 0, 0.8, -0.3);
  back.rotation.x = 0.3;
  g.add(back, box(0.75, 0.05, 0.1, '#a07a4a', 0, 0.75, 0.04));
  const tex = new THREE.CanvasTexture(paint({ style: 'ink', seed: 15, wide: true }, 0.8));
  tex.colorSpace = THREE.SRGBColorSpace;
  const canvas = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.82, 0.03), [mat('#eee'), mat('#eee'), mat('#eee'), mat('#eee'), new THREE.MeshBasicMaterial({ map: tex }), mat('#eee')]);
  canvas.position.set(0, 1.2, 0.05);
  canvas.rotation.x = -0.08;
  g.add(canvas);
  return g;
}

function rattanChair() {
  const rattan = mat('#c9a46a', { roughness: 0.9 });
  const seat = cyl(0.35, 0.3, 0.12, rattan, 0, 0.42, 0, 16);
  const back = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 8, 24, Math.PI), rattan);
  back.position.set(0, 0.75, -0.15);
  back.rotation.x = -0.3;
  return group(seat, back, cyl(0.04, 0.2, 0.36, rattan, 0, 0.18, 0), cyl(0.3, 0.3, 0.06, '#f2e6d8', 0, 0.5, 0, 16));
}

// --- Roof · The Water Mirror -----------------------------------------------------------------

function hatch() {
  const g = group(box(1.5, 0.5, 0.9, '#5a3c2a', 0, 0.25, 0));
  const lid = box(1.5, 0.05, 0.9, '#7a4b2c', 0, 0.55, -0.35);
  lid.rotation.x = -1.2;
  g.add(lid);
  return g;
}

function ticketStand() {
  const tex = canvasTex(256, 128, (ctx, w, h) => {
    ctx.fillStyle = '#f4ede0';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(29,26,22,0.3)';
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(w * 0.72, 8);
    ctx.lineTo(w * 0.72, h - 8);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#b8322a';
    ctx.font = "28px Georgia, 'Songti SC', serif";
    ctx.fillText('Livy', 20, 44);
    ctx.fillStyle = 'rgba(29,26,22,0.25)';
    for (let i = 0; i < 3; i++) ctx.fillRect(20, 64 + i * 18, 120, 2);
  });
  const ticket = plane(0.6, 0.3, tex);
  ticket.position.set(0, 1.12, 0.06);
  ticket.rotation.x = -0.4;
  return group(cyl(0.025, 0.025, 1.0, BRASS, 0, 0.5, 0), cyl(0.18, 0.2, 0.04, BRASS, 0, 0.02, 0), box(0.66, 0.36, 0.04, '#3a2519', 0, 1.1, 0.03), ticket);
}

function planter(item) {
  const len = item.foot[0];
  const g = group(box(len, 0.4, 0.45, '#8a6a3e', 0, 0.2, 0));
  const rand = rng(len * 13);
  const flowers = ['#e0567a', '#f2b84b', '#f4f1ea', '#c2452d', '#b48ad6'];
  for (let x = -len / 2 + 0.2; x < len / 2 - 0.1; x += 0.22) {
    g.add(ball(0.13, '#3f7a4a', x, 0.48, (rand() - 0.5) * 0.15));
    g.add(ball(0.05, flowers[Math.floor(rand() * flowers.length)], x + (rand() - 0.5) * 0.1, 0.6, (rand() - 0.5) * 0.2));
  }
  return g;
}

export const BUILD = {
  stairs, pottedPlant,
  memoryWindow, schoolDesk, uniform, banyan, rattanBench, lowTable,
  bookshelf, readingTable, greenhouse, designTable, dressForm, stoneArch,
  marketDesk, chartBoard, screen, paintings, catalogueTable, longTable,
  researchTable, projection, cityMap, flightConsole, captainChair, globe,
  drawers, fabricLine, standingMirror, clothesRack, easel, rattanChair,
  hatch, ticketStand, planter,
};

export { leaves, ball, cyl, group, rng };
