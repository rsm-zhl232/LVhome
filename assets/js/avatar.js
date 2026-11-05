// Copied from Chris's site (lizhuojin.com, assets/js/room/avatar.js) so people look the same on both boats and in both homes.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as sound from './sound.js';

const mat = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.75 });

export function part(geo, color, x, y, z) {
  const m = new THREE.Mesh(geo, mat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

export function limb(w, h, d, color, pivotY, x) {
  const pivot = new THREE.Group();
  pivot.position.set(x, pivotY, 0);
  const m = part(new RoundedBoxGeometry(w, h, d, 2, Math.min(w, d) * 0.45), color, 0, -h / 2, 0);
  pivot.add(m);
  return pivot;
}

// Shared walking behaviour: follow a list of [x, z] waypoints, turning smoothly.
export class Walker {
  constructor(object, speed) {
    this.object = object;
    this.speed = speed;
    this.path = null;
    this.onArrive = null;
    this.moving = false;
    this.heading = 0;
    this.faceTarget = null;
  }

  get x() { return this.object.position.x; }
  get z() { return this.object.position.z; }

  walk(path, onArrive) {
    this.path = path && path.length > 1 ? path.slice(1) : null;
    this.onArrive = onArrive || null;
    if (!this.path) {
      this.moving = false;
      const cb = this.onArrive;
      this.onArrive = null;
      cb && cb();
    }
  }

  stop() {
    this.path = null;
    this.onArrive = null;
    this.moving = false;
  }

  face(x, z) {
    this.faceTarget = [x, z];
  }

  turnTowards(target, dt, rate = 10) {
    let diff = target - this.heading;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    this.heading += diff * Math.min(1, dt * rate);
    this.object.rotation.y = this.heading;
  }

  stepPath(dt) {
    if (!this.path) {
      this.moving = false;
      if (this.faceTarget) {
        const [fx, fz] = this.faceTarget;
        this.turnTowards(Math.atan2(fx - this.x, fz - this.z), dt, 8);
      }
      return;
    }
    const [tx, tz] = this.path[0];
    const dx = tx - this.x;
    const dz = tz - this.z;
    const dist = Math.hypot(dx, dz);
    const step = this.speed * dt;
    this.moving = true;
    this.faceTarget = null;
    this.turnTowards(Math.atan2(dx, dz), dt);
    if (dist <= step) {
      this.object.position.x = tx;
      this.object.position.z = tz;
      this.path.shift();
      if (!this.path.length) {
        this.path = null;
        this.moving = false;
        const cb = this.onArrive;
        this.onArrive = null;
        cb && cb();
      }
    } else {
      this.object.position.x += (dx / dist) * step;
      this.object.position.z += (dz / dist) * step;
    }
  }
}

// What a person looks like. Chris is fixed; visitors pick one of GUEST_LOOKS and a skin tone.
export const CHRIS_LOOK = { skin: '#f1c9a5', hair: '#1f1a17', hairStyle: 'short', top: '#2f3e5c', pants: '#c9b79c', collar: '#f8f6f1' };

export const GUEST_LOOKS = [
  { id: 'hoodie', hair: '#2a211c', hairStyle: 'short', top: '#4a78c2', pants: '#3c4a63', label: { en: 'Blue hoodie', zh: '蓝卫衣' } },
  { id: 'long', hair: '#5a3a28', hairStyle: 'long', top: '#f4f1ea', pants: '#4d6a8f', label: { en: 'Long hair', zh: '长发 · 白T' } },
  { id: 'ponytail', hair: '#1b1714', hairStyle: 'ponytail', top: '#5f8f6a', pants: '#d8c7a8', label: { en: 'Ponytail', zh: '马尾 · 绿毛衣' } },
  { id: 'cap', hair: '#2a211c', hairStyle: 'cap', capColor: '#e07a5f', top: '#f2b84b', pants: '#2b2b30', label: { en: 'Cap & tee', zh: '鸭舌帽' } },
  { id: 'bun', hair: '#7a4a2a', hairStyle: 'bun', top: '#8a6fc4', pants: '#2f3e5c', label: { en: 'Bun', zh: '丸子头' } },
  { id: 'suit', hair: '#1f1a17', hairStyle: 'buzz', top: '#2b2f3a', pants: '#2b2f3a', collar: '#ffffff', tie: '#b5403a', label: { en: 'Suit (recruiters)', zh: '西装（HR 专用）' } },
];

export const SKINS = ['#f6d7bd', '#f1c9a5', '#d9a47c', '#a8714c', '#6e4630'];

function hairParts(look) {
  const h = look.hair;
  const cap = (r = 0.235, cover = 0.55) => part(new THREE.SphereGeometry(r, 24, 18, 0, Math.PI * 2, 0, Math.PI * cover), h, 0, 0.03, -0.015);
  const fringe = () => part(new RoundedBoxGeometry(0.34, 0.08, 0.12, 2, 0.03), h, 0.02, 0.15, 0.14);
  switch (look.hairStyle) {
    case 'buzz':
      return [cap(0.225, 0.42)];
    case 'long':
      return [
        cap(0.232),
        part(new RoundedBoxGeometry(0.44, 0.56, 0.15, 3, 0.06), h, 0, -0.14, -0.12),
        part(new RoundedBoxGeometry(0.08, 0.4, 0.1, 2, 0.035), h, -0.2, -0.13, 0.05),
        part(new RoundedBoxGeometry(0.08, 0.4, 0.1, 2, 0.035), h, 0.2, -0.13, 0.05),
        part(new RoundedBoxGeometry(0.3, 0.07, 0.1, 2, 0.03), h, 0, 0.14, 0.15),
      ];
    case 'ponytail':
      return [cap(), fringe(), part(new THREE.SphereGeometry(0.07, 12, 10), h, 0, 0.08, -0.24), part(new RoundedBoxGeometry(0.1, 0.32, 0.1, 2, 0.045), h, 0, -0.1, -0.27)];
    case 'bun':
      return [cap(), fringe(), part(new THREE.SphereGeometry(0.1, 16, 12), h, 0, 0.24, -0.06)];
    case 'cap':
      return [
        cap(0.236, 0.62),
        part(new THREE.SphereGeometry(0.245, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.42), look.capColor, 0, 0.04, 0),
        part(new RoundedBoxGeometry(0.3, 0.03, 0.18, 2, 0.012), look.capColor, 0, 0.12, 0.2),
      ];
    default:
      return [cap(), fringe()];
  }
}

export class Avatar extends Walker {
  constructor(look = CHRIS_LOOK) {
    const root = new THREE.Group();
    super(root, 2.8);
    this.body = new THREE.Group();
    root.add(this.body);
    this.quiet = false;

    const skin = look.skin;
    this.legL = limb(0.15, 0.52, 0.17, look.pants, 0.56, -0.11);
    this.legR = limb(0.15, 0.52, 0.17, look.pants, 0.56, 0.11);
    for (const leg of [this.legL, this.legR]) {
      leg.add(part(new RoundedBoxGeometry(0.17, 0.08, 0.26, 2, 0.03), '#f8f6f1', 0, -0.52, 0.04));
    }
    const torso = part(new RoundedBoxGeometry(0.48, 0.56, 0.3, 3, 0.1), look.top, 0, 0.84, 0);
    this.armL = limb(0.12, 0.5, 0.13, look.top, 1.08, -0.31);
    this.armR = limb(0.12, 0.5, 0.13, look.top, 1.08, 0.31);
    for (const arm of [this.armL, this.armR]) {
      arm.add(part(new THREE.SphereGeometry(0.065, 12, 10), skin, 0, -0.52, 0));
    }
    this.head = new THREE.Group();
    this.head.position.y = 1.36;
    this.head.add(
      part(new THREE.SphereGeometry(0.22, 24, 18), skin, 0, 0, 0),
      ...hairParts(look),
      part(new THREE.SphereGeometry(0.025, 10, 8), '#1f2430', -0.08, 0.0, 0.2),
      part(new THREE.SphereGeometry(0.025, 10, 8), '#1f2430', 0.08, 0.0, 0.2),
    );
    // little smile
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 6, 12, Math.PI), mat('#8a4b3a'));
    smile.position.set(0, -0.07, 0.205);
    smile.rotation.z = Math.PI;
    this.head.add(smile);
    this.body.add(this.legL, this.legR, torso, this.armL, this.armR, this.head);
    if (look.collar) this.body.add(part(new THREE.CylinderGeometry(0.12, 0.15, 0.06, 16), look.collar, 0, 1.13, 0));
    if (look.tie) this.body.add(part(new RoundedBoxGeometry(0.07, 0.3, 0.03, 2, 0.012), look.tie, 0, 0.92, 0.155));

    this.phase = 0;
    this.lastStepSign = 1;
    this.waveT = 0;
    this.sitT = 0;
  }

  wave() {
    this.waveT = 1.6;
  }

  // Sit on a seat: { x, z, y, heading, stand: [x, z] }. Any walk (or arrow key) stands back up
  // at `stand`, which is a walkable spot in front of the seat.
  sit(seat) {
    this.stop();
    this.seat = seat;
  }

  // While seated, report the stand-up spot so paths are planned from there.
  get x() { return this.seat ? this.seat.stand[0] : this.object.position.x; }
  get z() { return this.seat ? this.seat.stand[1] : this.object.position.z; }

  standUp() {
    if (!this.seat) return;
    const [x, z] = this.seat.stand;
    this.object.position.x = x;
    this.object.position.z = z;
    this.body.position.y = 0;
    this.seat = null;
  }

  walk(path, onArrive) {
    this.standUp();
    super.walk(path, onArrive);
  }

  updateSeated(dt) {
    const s = this.seat;
    const k = Math.min(1, dt * 6);
    const pos = this.object.position;
    pos.x += (s.x - pos.x) * k;
    pos.z += (s.z - pos.z) * k;
    this.turnTowards(s.heading, dt, 8);
    this.body.position.y += (s.y - 0.5 - this.body.position.y) * k;
    for (const leg of [this.legL, this.legR]) leg.rotation.x += (-1.35 - leg.rotation.x) * k;
    for (const arm of [this.armL, this.armR]) arm.rotation.x += (-0.45 - arm.rotation.x) * k;
    this.body.rotation.x += (-0.06 - this.body.rotation.x) * k;
    this.head.rotation.y = Math.sin(performance.now() / 2400) * 0.15;
  }

  // dir: [x, z] world-space direction from the keyboard, or null.
  update(dt, nav, dir) {
    if (dir) this.standUp();
    if (this.seat) {
      this.updateSeated(dt);
      return;
    }
    this.body.rotation.x *= 1 - Math.min(1, dt * 10);
    if (dir) {
      this.path = null;
      this.onArrive = null;
      const len = Math.hypot(dir[0], dir[1]);
      const vx = (dir[0] / len) * this.speed * dt;
      const vz = (dir[1] / len) * this.speed * dt;
      const nx = this.x + vx;
      const nz = this.z + vz;
      if (nav.walkable(nx, nz)) {
        this.object.position.x = nx;
        this.object.position.z = nz;
      } else if (nav.walkable(nx, this.z)) {
        this.object.position.x = nx;
      } else if (nav.walkable(this.x, nz)) {
        this.object.position.z = nz;
      }
      this.turnTowards(Math.atan2(vx, vz), dt);
      this.moving = true;
      this.faceTarget = null;
    } else {
      this.stepPath(dt);
    }

    if (this.moving) {
      this.phase += dt * 11;
      const s = Math.sin(this.phase);
      this.legL.rotation.x = s * 0.6;
      this.legR.rotation.x = -s * 0.6;
      this.armL.rotation.x = -s * 0.5;
      this.armR.rotation.x = s * 0.5;
      this.body.position.y = Math.abs(Math.cos(this.phase)) * 0.05;
      const sign = Math.sign(s);
      if (sign !== this.lastStepSign) {
        this.lastStepSign = sign;
        if (!this.quiet) sound.step();
      }
    } else {
      const k = Math.min(1, dt * 10);
      this.legL.rotation.x *= 1 - k;
      this.legR.rotation.x *= 1 - k;
      this.armL.rotation.x *= 1 - k;
      this.body.position.y = Math.sin(performance.now() / 600) * 0.008;
      if (this.waveT <= 0) this.armR.rotation.x *= 1 - k;
    }

    if (this.waveT > 0) {
      this.waveT -= dt;
      this.armR.rotation.x = -2.6;
      this.armR.rotation.z = Math.sin(this.waveT * 14) * 0.35 - 0.2;
      if (this.waveT <= 0) this.armR.rotation.z = 0;
    }
    this.head.rotation.y = Math.sin(performance.now() / 2400) * 0.12;
  }
}

// Flat little portrait of a look, for the picker on the ticket (same as Chris's concierge).
export function lookSvg(look) {
  const h = look.hair;
  const hair = {
    short: `<path d="M17 25a13 13 0 0 1 26 0v-2c-3-4-8-6-13-6s-10 2-13 6z" fill="${h}"/><rect x="17" y="14" width="26" height="9" rx="4.5" fill="${h}"/>`,
    buzz: `<path d="M17.5 23a12.5 12.5 0 0 1 25 0c-3-3-7-5-12.5-5s-9.5 2-12.5 5z" fill="${h}"/>`,
    long: `<rect x="15" y="15" width="30" height="30" rx="10" fill="${h}"/><rect x="18" y="14" width="24" height="8" rx="4" fill="${h}"/>`,
    ponytail: `<rect x="17" y="14" width="26" height="9" rx="4.5" fill="${h}"/><rect x="40" y="18" width="7" height="20" rx="3.5" fill="${h}"/>`,
    bun: `<circle cx="30" cy="10" r="6" fill="${h}"/><rect x="17" y="14" width="26" height="9" rx="4.5" fill="${h}"/>`,
    cap: `<path d="M16 22a14 12 0 0 1 28 0z" fill="${look.capColor}"/><rect x="28" y="19" width="20" height="4" rx="2" fill="${look.capColor}"/>`,
  }[look.hairStyle] || '';
  const back = look.hairStyle === 'long' ? hair : '';
  const front = look.hairStyle === 'long' ? `<rect x="18" y="14" width="24" height="8" rx="4" fill="${h}"/>` : hair;
  return `<svg viewBox="0 0 60 80" aria-hidden="true">
    ${back}
    <rect x="21" y="60" width="8" height="16" rx="3" fill="${look.pants}"/><rect x="31" y="60" width="8" height="16" rx="3" fill="${look.pants}"/>
    <rect x="15" y="40" width="30" height="24" rx="8" fill="${look.top}"/>
    ${look.tie ? `<path d="M30 41l-2.5 3 2.5 13 2.5-13z" fill="${look.tie}"/>` : ''}
    <circle cx="30" cy="26" r="13" fill="${look.skin || SKINS[1]}"/>
    ${front}
    <circle cx="25.5" cy="27" r="1.6" fill="#1f2430"/><circle cx="34.5" cy="27" r="1.6" fill="#1f2430"/>
    <path d="M27 32q3 2.4 6 0" stroke="#8a4b3a" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// Livy herself, built exactly like she is when she drops by Chris's place (his livy.js):
// long dark hair with a red clip, cream knit, white shorts. Here she is the host and waits on the roof.
export class LivyFigure extends Walker {
  constructor() {
    const root = new THREE.Group();
    super(root, 2.5);
    this.body = new THREE.Group();
    this.body.scale.setScalar(0.94);
    root.add(this.body);
    const skin = '#f3cfb1';
    const hair = '#3a2620';
    const knit = '#f2e6d8';
    const shorts = '#f7f5f0';
    this.legL = limb(0.12, 0.52, 0.14, skin, 0.56, -0.1);
    this.legR = limb(0.12, 0.52, 0.14, skin, 0.56, 0.1);
    for (const leg of [this.legL, this.legR]) {
      leg.add(part(new RoundedBoxGeometry(0.17, 0.16, 0.19, 2, 0.05), shorts, 0, -0.06, 0));
      leg.add(part(new RoundedBoxGeometry(0.15, 0.08, 0.24, 2, 0.03), '#f8f6f1', 0, -0.52, 0.04));
    }
    const hips = part(new RoundedBoxGeometry(0.4, 0.16, 0.25, 2, 0.06), shorts, 0, 0.62, 0);
    const torso = part(new RoundedBoxGeometry(0.42, 0.46, 0.27, 3, 0.1), knit, 0, 0.88, 0);
    this.armL = limb(0.11, 0.46, 0.12, knit, 1.07, -0.28);
    this.armR = limb(0.11, 0.46, 0.12, knit, 1.07, 0.28);
    for (const arm of [this.armL, this.armR]) arm.add(part(new THREE.SphereGeometry(0.06, 12, 10), skin, 0, -0.48, 0));
    this.head = new THREE.Group();
    this.head.position.y = 1.33;
    const blush = (x) => {
      const m = part(new THREE.SphereGeometry(0.035, 10, 8), '#f4a3a8', x, -0.04, 0.18);
      m.scale.set(1, 0.6, 0.4);
      return m;
    };
    this.head.add(
      part(new THREE.SphereGeometry(0.21, 24, 18), skin, 0, 0, 0),
      part(new THREE.SphereGeometry(0.228, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0, 0.03, -0.012),
      part(new RoundedBoxGeometry(0.42, 0.56, 0.15, 3, 0.06), hair, 0, -0.14, -0.12),
      part(new RoundedBoxGeometry(0.08, 0.4, 0.1, 2, 0.035), hair, -0.19, -0.13, 0.05),
      part(new RoundedBoxGeometry(0.08, 0.4, 0.1, 2, 0.035), hair, 0.19, -0.13, 0.05),
      part(new RoundedBoxGeometry(0.3, 0.07, 0.1, 2, 0.03), hair, 0, 0.14, 0.15),
      part(new THREE.SphereGeometry(0.035, 10, 8), '#e07a5f', 0.15, 0.15, 0.12),
      part(new THREE.SphereGeometry(0.024, 10, 8), '#1f2430', -0.075, 0.0, 0.195),
      part(new THREE.SphereGeometry(0.024, 10, 8), '#1f2430', 0.075, 0.0, 0.195),
      blush(-0.12),
      blush(0.12),
    );
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 6, 12, Math.PI), new THREE.MeshStandardMaterial({ color: '#b5545c' }));
    smile.position.set(0, -0.07, 0.198);
    smile.rotation.z = Math.PI;
    this.head.add(smile);
    this.body.add(this.legL, this.legR, hips, torso, this.armL, this.armR, this.head);
    this.waveT = 0;
    this.hopT = 0;
  }

  wave() {
    this.waveT = 1.6;
    this.hopT = 0.5;
  }

  update(dt) {
    this.stepPath(dt);
    const now = performance.now();
    this.body.position.y = Math.sin(now / 700) * 0.01;
    if (this.hopT > 0) {
      this.hopT -= dt;
      this.body.position.y += Math.sin((this.hopT / 0.5) * Math.PI) * 0.18;
    }
    if (this.waveT > 0) {
      this.waveT -= dt;
      this.armR.rotation.x = -2.6;
      this.armR.rotation.z = Math.sin(this.waveT * 14) * 0.35 - 0.2;
      if (this.waveT <= 0) this.armR.rotation.set(0, 0, 0);
    }
    this.head.rotation.y = Math.sin(now / 2100) * 0.18;
  }
}
