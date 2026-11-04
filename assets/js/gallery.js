// Hangs each hall's works on its walls: framed canvases, or hanging scrolls for tall ink works,
// each with a soft pool of light behind it and a small wall label.
import * as THREE from 'three';
import { paint, label } from './art.js';
import { t } from './i18n.js';

const UP = new THREE.Vector3(0, 1, 0);

// Wall positions in the order they are filled: the back wall first, then the sides, then the
// front wall either side of the door or the moon window.
function slots(inner, count) {
  const L = inner * 2;
  const back = (x) => ({ pos: [x, -inner], normal: [0, 1] });
  const left = (z) => ({ pos: [-inner, z], normal: [1, 0] });
  const right = (z) => ({ pos: [inner, z], normal: [-1, 0] });
  const front = (x) => ({ pos: [x, inner], normal: [0, -1] });
  const list = count <= 3
    ? [back(0), left(-L / 8), right(-L / 8)]
    : count === 4
      ? [back(-L / 6), back(L / 6), left(-L / 8), right(-L / 8)]
      : [back(0), left(-L / 6), right(-L / 6), left(L / 6), right(L / 6), front(-inner * 0.62), front(inner * 0.62)];
  const spacing = count === 4 ? L / 3 : L / 3.2;
  return list.slice(0, count).map((s) => ({ ...s, maxW: Math.min(2.2, spacing * 0.85) }));
}

let washTex;
function wash() {
  if (washTex) return washTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 54, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255, 228, 180, 0.75)');
  g.addColorStop(0.55, 'rgba(255, 220, 170, 0.25)');
  g.addColorStop(1, 'rgba(255, 220, 170, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  washTex = new THREE.CanvasTexture(c);
  washTex.colorSpace = THREE.SRGBColorSpace;
  return washTex;
}

function artTexture(work, aspect, renderer) {
  let tex;
  if (work.image) {
    tex = new THREE.TextureLoader().load(work.image);
  } else {
    tex = new THREE.CanvasTexture(paint(work.art || {}, aspect));
  }
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

const frameMat = new THREE.MeshStandardMaterial({ color: '#2a201a', roughness: 0.6 });
const silkMat = new THREE.MeshStandardMaterial({ color: '#cbb48b', roughness: 0.9 });
const rodMat = new THREE.MeshStandardMaterial({ color: '#3a2a20', roughness: 0.5 });

export function hangWorks(scene, halls, floors, renderer) {
  return halls.map((hall, h) => {
    const f = floors[h];
    const list = slots(f.inner, hall.works.length);
    return hall.works.map((work, k) => {
      const s = list[k];
      let [w, ht] = work.size;
      const scale = Math.min(1, s.maxW / w, 2.3 / ht);
      w *= scale;
      ht *= scale;
      const scroll = ht / w > 1.6;
      const g = new THREE.Group();
      const center = new THREE.Vector3(s.pos[0], f.y + (scroll ? 1.95 : 1.75), s.pos[1]);
      const normal = new THREE.Vector3(s.normal[0], 0, s.normal[1]);
      g.position.copy(center).addScaledVector(normal, 0.02);
      g.lookAt(g.position.clone().add(normal));

      const light = new THREE.Mesh(new THREE.PlaneGeometry(w * 2 + 1.2, ht * 1.7 + 0.8), new THREE.MeshBasicMaterial({ map: wash(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.3 }));
      light.position.set(0, 0.25, -0.005);
      g.add(light);

      if (scroll) {
        const mount = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, ht + 0.5, 0.01), silkMat);
        mount.position.set(0, 0.05, 0.005);
        g.add(mount);
        for (const [y, r] of [[ht / 2 + 0.3, 0.022], [-ht / 2 - 0.2, 0.035]]) {
          const rod = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w + 0.3, 12), rodMat);
          rod.rotation.z = Math.PI / 2;
          rod.position.set(0, y, 0.03);
          g.add(rod);
        }
      } else {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, ht + 0.12, 0.05), frameMat);
        frame.position.z = 0.02;
        g.add(frame);
      }
      const canvas = new THREE.Mesh(new THREE.PlaneGeometry(w, ht), new THREE.MeshBasicMaterial({ map: artTexture(work, w / ht, renderer) }));
      canvas.position.z = scroll ? 0.012 : 0.05;
      canvas.userData = { hall: h, index: k };
      g.add(canvas);

      const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.105), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(label(t(work.title), work.year)) }));
      tag.material.map.colorSpace = THREE.SRGBColorSpace;
      tag.position.set(w / 2 + 0.3, -Math.min(ht / 2, 0.6) + 0.1, 0.01);
      g.add(tag);
      scene.add(g);

      // Where the camera stands to look at it.
      const right = new THREE.Vector3().crossVectors(normal.clone().negate(), UP).normalize();
      return { hall: h, index: k, work, canvas, tag, center, normal, right, w, h: ht };
    });
  });
}

// Wall labels are drawn in the current language; redraw them when it changes.
export function relabel(halls) {
  halls.flat().forEach((e) => {
    e.tag.material.map.dispose();
    e.tag.material.map = new THREE.CanvasTexture(label(t(e.work.title), e.work.year));
    e.tag.material.map.colorSpace = THREE.SRGBColorSpace;
  });
}
