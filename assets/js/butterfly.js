// The butterfly that guides visitors up the boat. It is not a button that is always there: it
// shows up, rests somewhere on each deck, and when you click it, flies to the stairs.
// Its look changes as you climb: ink-paper cut-out, embroidery, glass, points of light, glow.
import * as THREE from 'three';

function wingTex(style) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  // One wing, drawn on the right half; the root of the wing is at the left edge.
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(4, 64);
    ctx.bezierCurveTo(30, 0, 120, -6, 122, 34);
    ctx.bezierCurveTo(124, 60, 80, 66, 60, 66);
    ctx.bezierCurveTo(100, 76, 110, 118, 80, 124);
    ctx.bezierCurveTo(50, 128, 20, 100, 4, 66);
    ctx.closePath();
  };
  shape();
  ctx.save();
  ctx.clip();
  if (style === 'ink') {
    ctx.fillStyle = '#efe6d2';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = 'rgba(26,23,20,0.85)';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#efe6d2';
    for (const [x, y, r] of [[90, 30, 9], [70, 92, 7], [40, 40, 5]]) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === 'embroidery') {
    ctx.fillStyle = '#9e2a26';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#e3b86c';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    for (let r = 14; r < 120; r += 14) {
      ctx.beginPath();
      ctx.arc(4, 64, r, -1.4, 1.4);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.fillStyle = '#4f7a62';
    ctx.beginPath();
    ctx.arc(88, 34, 10, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === 'glass') {
    const g = ctx.createLinearGradient(0, 0, 128, 128);
    g.addColorStop(0, 'rgba(160,220,235,0.9)');
    g.addColorStop(0.5, 'rgba(230,200,255,0.7)');
    g.addColorStop(1, 'rgba(255,230,180,0.9)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    for (let k = 0; k < 6; k++) {
      ctx.beginPath();
      ctx.moveTo(4, 64);
      ctx.lineTo(128, k * 26);
      ctx.stroke();
    }
  } else if (style === 'digital') {
    ctx.fillStyle = 'rgba(10,30,40,0.6)';
    ctx.fillRect(0, 0, 128, 128);
    for (let x = 4; x < 128; x += 8) for (let y = 4; y < 128; y += 8) {
      ctx.fillStyle = (x + y) % 24 ? 'rgba(95,208,196,0.95)' : 'rgba(242,184,75,0.95)';
      ctx.fillRect(x, y, 4, 4);
    }
  } else {
    const g = ctx.createRadialGradient(10, 64, 4, 10, 64, 120);
    g.addColorStop(0, 'rgba(255,255,240,1)');
    g.addColorStop(0.6, 'rgba(255,226,160,0.9)');
    g.addColorStop(1, 'rgba(255,190,120,0.6)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }
  ctx.restore();
  if (style !== 'digital' && style !== 'light') {
    shape();
    ctx.strokeStyle = style === 'ink' ? 'rgba(26,23,20,1)' : style === 'glass' ? 'rgba(255,255,255,0.95)' : '#e3b86c';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const STYLES = ['ink', 'embroidery', 'glass', 'digital', 'light'];

export class Butterfly {
  constructor(scene) {
    this.object = new THREE.Group();
    this.object.userData.interact = 'butterfly';
    this.textures = Object.fromEntries(STYLES.map((s) => [s, wingTex(s)]));
    this.wingMat = new THREE.MeshBasicMaterial({ map: this.textures.ink, transparent: true, side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.05 });
    const geo = new THREE.PlaneGeometry(0.34, 0.34);
    geo.translate(0.17, 0, 0);
    geo.rotateX(-Math.PI / 2);
    this.left = new THREE.Mesh(geo, this.wingMat);
    this.right = new THREE.Mesh(geo, this.wingMat);
    this.right.scale.x = -1;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.012, 0.22, 6), new THREE.MeshBasicMaterial({ color: '#1d1a16' }));
    body.rotation.x = Math.PI / 2;
    this.body = body;
    // A big invisible ball so it is easy to click.
    this.hit = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
    this.hit.userData.interact = 'butterfly';
    this.object.add(this.left, this.right, body, this.hit);
    // A soft glow behind it, so it can be found.
    const glowC = document.createElement('canvas');
    glowC.width = glowC.height = 64;
    const gctx = glowC.getContext('2d');
    const gr = gctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,230,180,0.8)');
    gr.addColorStop(1, 'rgba(255,230,180,0)');
    gctx.fillStyle = gr;
    gctx.fillRect(0, 0, 64, 64);
    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowC), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.6 }));
    this.glow.scale.setScalar(1.3);
    this.object.add(this.glow);
    this.object.scale.setScalar(2.4);
    scene.add(this.object);
    this.t = Math.random() * 10;
    this.home = new THREE.Vector3();
    this.flight = null;
    this.resting = true;
    this.object.visible = false;
  }

  setStyle(style) {
    this.wingMat.map = this.textures[style] || this.textures.light;
    this.wingMat.blending = style === 'light' || style === 'digital' || style === 'glass' ? THREE.AdditiveBlending : THREE.NormalBlending;
    this.wingMat.needsUpdate = true;
    this.body.visible = style !== 'light' && style !== 'digital';
  }

  // Rest at a point (world space), slowly opening and closing.
  perch(pos) {
    this.home.copy(pos);
    this.object.position.copy(pos);
    this.flight = null;
    this.resting = true;
    this.object.visible = true;
  }

  hide() {
    this.object.visible = false;
    this.flight = null;
  }

  // Fly along a gentle arc to a point, then rest there.
  flyTo(pos, done, { dur = 2.2, height = 1.2 } = {}) {
    this.object.visible = true;
    this.resting = false;
    const from = this.object.position.clone();
    const to = pos.clone();
    const mid = from.clone().lerp(to, 0.5);
    mid.y = Math.max(from.y, to.y) + height;
    this.flight = { curve: new THREE.QuadraticBezierCurve3(from, mid, to), t0: performance.now(), dur: dur * 1000, done };
  }

  update(dt) {
    if (!this.object.visible) return;
    this.t += dt;
    const flying = !!this.flight;
    const rate = flying ? 22 : 3.2;
    const amp = flying ? 1.1 : 0.55;
    const a = (Math.sin(this.t * rate) * 0.5 + 0.5) * amp + 0.15;
    this.left.rotation.z = a;
    this.right.rotation.z = -a;
    if (this.flight) {
      const f = this.flight;
      const k = Math.min(1, (performance.now() - f.t0) / f.dur);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      const p = f.curve.getPoint(e);
      const ahead = f.curve.getPoint(Math.min(1, e + 0.02));
      this.object.position.copy(p);
      this.object.position.y += Math.sin(this.t * 9) * 0.05;
      if (ahead.distanceToSquared(p) > 1e-6) this.object.rotation.y = Math.atan2(ahead.x - p.x, ahead.z - p.z);
      if (k === 1) {
        this.flight = null;
        this.home.copy(p);
        this.resting = true;
        f.done && f.done();
      }
    } else {
      // Hover a little around where it rests.
      this.object.position.set(this.home.x + Math.sin(this.t * 0.7) * 0.08, this.home.y + Math.sin(this.t * 1.3) * 0.06, this.home.z + Math.cos(this.t * 0.9) * 0.08);
      this.object.rotation.y += dt * 0.25;
    }
    this.glow.material.opacity = 0.45 + Math.sin(this.t * 2) * 0.15;
  }
}
