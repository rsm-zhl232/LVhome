// Livy's pavilion. Modes, in the order a visitor meets them:
//   intro   — the title card over a slow view of the sea
//   ride    — the boat crosses to the pier (skippable)
//   dock    — the camera steps off and walks up the pier to the door
//   hall    — standing in a hall; drag to look around, click a work
//   work    — close-up on one work, with its card
//   outside — circling the pavilion; click a floor to go in
import * as THREE from 'three';
import { t, getLang, toggleLang, onLang, applyStatic } from './i18n.js';
import { SITE, UI, RIDE, HALLS } from './content.js';
import { buildWorld } from './world.js';
import { hangWorks, relabel } from './gallery.js';
import * as sound from './sound.js';

const $ = (s) => document.querySelector(s);
const touch = matchMedia('(pointer: coarse)').matches;
const params = new URLSearchParams(location.search);

const renderer = new THREE.WebGLRenderer({ canvas: $('#scene'), antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);

const world = buildWorld();
const { scene, floors, path } = world;
const halls = hangWorks(scene, HALLS, floors, renderer);

const clock = new THREE.Clock();
let mode = 'intro';
let hall = 0;
let work = -1;
let fovTarget = 45;

// --- Camera poses and tweens ------------------------------------------------------------------------

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const cam = { pos: V(0, 20, 95), look: V(0, 8, 0), tween: null };
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);

function tweenTo(pos, look, dur, done) {
  cam.tween = { from: { pos: cam.pos.clone(), look: cam.look.clone() }, to: { pos, look }, t0: performance.now(), dur: dur * 1000, done };
}
function stepTween(now) {
  const tw = cam.tween;
  if (!tw) return;
  const k = Math.min(1, (now - tw.t0) / tw.dur);
  const e = ease(k);
  cam.pos.lerpVectors(tw.from.pos, tw.to.pos, e);
  cam.look.lerpVectors(tw.from.look, tw.to.look, e);
  if (k === 1) {
    cam.tween = null;
    tw.done && tw.done();
  }
}

function hallPose(i) {
  const f = floors[i];
  return { pos: V(0, f.eye, f.inner * 0.5), look: V(0, f.eye - 0.05, -f.inner) };
}

function workPose(e) {
  const d = Math.max(e.h * 1.35, e.w * 0.95) + 0.6;
  const narrow = innerWidth < 640;
  // Leave room for the card: on wide screens the work sits left of centre, on phones above it.
  const shift = narrow ? UP.clone().multiplyScalar(-e.h * 0.32 - 0.2) : e.right.clone().multiplyScalar(d * 0.28);
  const look = e.center.clone().add(shift);
  return { pos: look.clone().addScaledVector(e.normal, narrow ? d + 0.6 : d), look };
}
function setPose(p) {
  cam.tween = null;
  cam.pos.copy(p.pos);
  cam.look.copy(p.look);
}

// --- Fades and captions -----------------------------------------------------------------------------

function fade(mid) {
  $('#fade').classList.add('on');
  setTimeout(() => {
    mid();
    requestAnimationFrame(() => $('#fade').classList.remove('on'));
  }, 480);
}

let captionTimer = 0;
function caption(text, ms = 3200) {
  const el = $('#caption');
  el.textContent = text;
  el.classList.add('on');
  clearTimeout(captionTimer);
  captionTimer = setTimeout(() => el.classList.remove('on'), ms);
}

// --- Modes ------------------------------------------------------------------------------------------

let ride = null;

function leaveIntro() {
  $('#intro').classList.add('gone');
}
// Browsers only allow sound after a click, so the sea starts on the first one.
addEventListener('pointerdown', () => sound.start(), { once: true, capture: true });

function startRide() {
  leaveIntro();
  closeCard();
  mode = 'ride';
  fovTarget = 50;
  sound.setInside(false);
  ride = { t0: performance.now(), shown: 0, nextSplash: 0 };
  const p = path.getPointAt(0);
  const tan = path.getTangentAt(0);
  cam.tween = null;
  cam.pos.copy(p).addScaledVector(tan, -8).add(V(0, 3, 0));
  cam.look.copy(p).addScaledVector(tan, 10);
  $('#btn-skip').hidden = false;
  renderHUD();
  render();
}

const RIDE_SECONDS = 15;

function stepRide(now, time, dt) {
  const k = Math.min(1, (now - ride.t0) / (RIDE_SECONDS * 1000));
  const u = THREE.MathUtils.smootherstep(k, 0, 1);
  const p = path.getPointAt(u);
  const tan = path.getTangentAt(u);
  world.placeBoat(p, Math.atan2(tan.x, tan.z), time, k < 0.95);
  const s = (now - ride.t0) / 1000;
  while (ride.shown < RIDE.length && s >= RIDE[ride.shown].at) caption(t(RIDE[ride.shown++].text), 3600);
  if (s > ride.nextSplash && k < 0.95) {
    sound.splash();
    ride.nextSplash = s + 2.6;
  }
  // Ride behind and above the boat, looking past the bow towards the pavilion.
  const want = p.clone().addScaledVector(tan, -6.5).add(V(0, 2.7 + world.boat.position.y, 0));
  const forward = p.clone().addScaledVector(tan, 14).add(V(0, 1.5, 0));
  const lookWant = forward.lerp(V(0, 8, 0), 0.45 + 0.25 * k);
  const k2 = 1 - Math.exp(-dt * 3);
  cam.pos.lerp(want, k2);
  cam.look.lerp(lookWant, k2);
  if (k === 1) dock();
}

function dock() {
  mode = 'dock';
  $('#btn-skip').hidden = true;
  // Step onto the pier, look up at the pavilion, then walk to the door.
  tweenTo(V(0.6, 2.7, 23.5), V(0, 7, 0), 1.8, () => {
    tweenTo(V(0, 2.75, 9.6), V(0, 2.6, -6), 3.2, () => goHall(0));
  });
}

function skipRide() {
  if (mode !== 'ride' && mode !== 'dock') return;
  parkBoat();
  goHall(0);
}

function parkBoat(time = clock.elapsedTime) {
  const end = path.getPointAt(1);
  const tan = path.getTangentAt(1);
  world.placeBoat(end, Math.atan2(tan.x, tan.z), time, false);
}

function goHall(i, instant) {
  const enter = () => {
    mode = 'hall';
    hall = i;
    work = -1;
    fovTarget = 62;
    camera.fov = 62;
    camera.updateProjectionMatrix();
    setPose(hallPose(i));
    closeCard();
    sound.setInside(true);
    $('#btn-skip').hidden = true;
    $('#caption').classList.remove('on');
    renderHUD();
  };
  if (mode === 'intro') leaveIntro();
  instant ? enter() : fade(enter);
}

function goOutside() {
  fade(() => {
    mode = 'outside';
    work = -1;
    closeCard();
    fovTarget = 45;
    orbit.theta = 0.25;
    orbit.phi = 0.2;
    orbit.r = 52;
    orbit.idle = 0;
    cam.tween = null;
    sound.setInside(false);
    renderHUD();
  });
}

// Orbit around the pavilion (outside mode).
const orbit = { theta: 0.25, phi: 0.2, r: 52, idle: 0 };
function stepOrbit(dt) {
  orbit.idle += dt;
  if (orbit.idle > 3) orbit.theta += dt * 0.05;
  const c = V(0, 9, 0);
  cam.pos.set(c.x + Math.sin(orbit.theta) * Math.cos(orbit.phi) * orbit.r, c.y + Math.sin(orbit.phi) * orbit.r, c.z + Math.cos(orbit.theta) * Math.cos(orbit.phi) * orbit.r);
  cam.look.copy(c);
}

// --- Works ------------------------------------------------------------------------------------------

function openWork(i) {
  const list = halls[hall];
  work = (i + list.length) % list.length;
  mode = 'work';
  const e = list[work];
  const p = workPose(e);
  tweenTo(p.pos, p.look, 1.1);
  renderCard();
  renderHUD();
}

function closeCard() {
  $('#work').hidden = true;
}

function closeWork() {
  if (mode !== 'work') return;
  mode = 'hall';
  work = -1;
  closeCard();
  const p = hallPose(hall);
  tweenTo(p.pos, p.look, 1.0);
  renderHUD();
}

function renderCard() {
  if (work < 0) return;
  const e = halls[hall][work];
  const w = e.work;
  $('#work-kicker').textContent = `${HALLS[hall].floor} · ${t(HALLS[hall].name)} · ${t(HALLS[hall].theme)}`;
  $('#work-title').textContent = t(w.title);
  $('#work-meta').textContent = [w.year, t(w.medium), `${w.size[0]} × ${w.size[1]} m`].filter(Boolean).join(' · ');
  $('#work-note').textContent = t(w.note);
  $('#work-count').textContent = `${work + 1} / ${halls[hall].length}`;
  $('#work').hidden = false;
}

// --- HUD --------------------------------------------------------------------------------------------

function renderStatic() {
  applyStatic(UI);
  $('#kicker').textContent = t(SITE.kicker);
  $('#title').textContent = t(SITE.title);
  $('#tagline').textContent = t(SITE.tagline);
  $('#btn-chris').href = SITE.chris;
  document.title = `${t(SITE.title)} · ${SITE.owner}`;
  $('#btn-sound').classList.toggle('off', !sound.isOn());
  $('#floors').innerHTML = HALLS.map((h, i) => `<button data-floor="${i}"><span>${t(h.name)} · ${t(h.theme)}</span><b>${h.floor}</b></button>`).reverse().join('');
  renderHUD();
  renderCard();
}

function renderHUD() {
  const inside = mode === 'hall' || mode === 'work';
  const shown = inside || mode === 'outside';
  $('#hall-card').hidden = mode !== 'hall';
  $('#floors').hidden = !shown;
  $('#btn-out').hidden = !inside;
  $('#btn-ride').hidden = mode !== 'outside';
  $('#hint').hidden = !shown;
  if (inside) {
    const h = HALLS[hall];
    $('#hall-kicker').textContent = `${h.floor} · ${t(h.name)}`;
    $('#hall-theme').textContent = t(h.theme);
    $('#hall-intro').textContent = t(h.intro);
    // Replay the card's entrance animation.
    const card = $('#hall-card');
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';
  }
  $('#hint').textContent = t(mode === 'outside' ? UI.hintOutside : touch ? UI.hintHallTouch : UI.hintHall);
  document.querySelectorAll('#floors button').forEach((b) => b.classList.toggle('on', inside && Number(b.dataset.floor) === hall));
}

$('#btn-board').addEventListener('click', startRide);
$('#btn-direct').addEventListener('click', () => {
  parkBoat();
  goHall(0);
});
$('#btn-skip').addEventListener('click', skipRide);
$('#btn-out').addEventListener('click', goOutside);
$('#btn-ride').addEventListener('click', () => fade(startRide));
$('#btn-lang').addEventListener('click', toggleLang);
$('#btn-sound').addEventListener('click', () => {
  sound.setOn(!sound.isOn());
  $('#btn-sound').classList.toggle('off', !sound.isOn());
});
$('#floors').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) goHall(Number(b.dataset.floor));
});
$('#work-prev').addEventListener('click', () => openWork(work - 1));
$('#work-next').addEventListener('click', () => openWork(work + 1));
$('#work-close').addEventListener('click', closeWork);
onLang(() => {
  renderStatic();
  relabel(halls);
});

addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (mode === 'work') closeWork();
    else if (mode === 'ride' || mode === 'dock') skipRide();
  } else if (mode === 'work' && e.key === 'ArrowRight') openWork(work + 1);
  else if (mode === 'work' && e.key === 'ArrowLeft') openWork(work - 1);
  else if ((mode === 'hall' || mode === 'work') && e.key === 'ArrowUp' && hall < HALLS.length - 1) goHall(hall + 1);
  else if ((mode === 'hall' || mode === 'work') && e.key === 'ArrowDown' && hall > 0) goHall(hall - 1);
});

// --- Pointer: drag to look / orbit, click to pick ---------------------------------------------------

const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let down = null;

function pick(x, y) {
  ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  if (mode === 'hall' || mode === 'work') {
    const hit = ray.intersectObjects(halls[hall].map((e) => e.canvas))[0];
    return hit ? { work: hit.object.userData.index } : null;
  }
  if (mode === 'outside') {
    const hits = ray.intersectObjects(floors.map((f) => f.hit));
    return hits[0] ? { floor: hits[0].object.userData.floor } : null;
  }
  return null;
}

function look(dx, dy) {
  const dir = cam.look.clone().sub(cam.pos);
  const s = new THREE.Spherical().setFromVector3(dir);
  s.theta -= dx * 0.0042;
  s.phi = THREE.MathUtils.clamp(s.phi - dy * 0.003, Math.PI / 2 - 0.45, Math.PI / 2 + 0.5);
  cam.look.copy(cam.pos).add(new THREE.Vector3().setFromSpherical(s));
}

const canvas = renderer.domElement;
canvas.addEventListener('pointerdown', (e) => {
  down = { x: e.clientX, y: e.clientY, moved: false };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (down) {
    const dx = e.clientX - down.x;
    const dy = e.clientY - down.y;
    if (!down.moved && Math.hypot(dx, dy) > 6) down.moved = true;
    if (down.moved) {
      if (mode === 'hall' || mode === 'work') {
        cam.tween = null;
        look(dx, dy);
      } else if (mode === 'outside') {
        orbit.theta -= dx * 0.005;
        orbit.phi = THREE.MathUtils.clamp(orbit.phi + dy * 0.003, 0.04, 0.9);
        orbit.idle = 0;
      }
      down.x = e.clientX;
      down.y = e.clientY;
    }
    $('#tip').hidden = true;
    return;
  }
  hover(e.clientX, e.clientY);
});
canvas.addEventListener('pointerup', (e) => {
  const d = down;
  down = null;
  if (!d || d.moved) return;
  const hit = pick(e.clientX, e.clientY);
  if (hit && hit.work != null) openWork(hit.work);
  else if (hit && hit.floor != null) goHall(hit.floor);
  else if (mode === 'work') closeWork();
});
canvas.addEventListener('wheel', (e) => {
  if (mode === 'outside') {
    orbit.r = THREE.MathUtils.clamp(orbit.r + e.deltaY * 0.03, 26, 110);
    orbit.idle = 0;
  }
}, { passive: true });

function hover(x, y) {
  const hit = touch ? null : pick(x, y);
  const tip = $('#tip');
  canvas.style.cursor = hit ? 'pointer' : mode === 'hall' || mode === 'work' || mode === 'outside' ? 'grab' : '';
  if (!hit) {
    tip.hidden = true;
    return;
  }
  const h = hit.floor != null ? HALLS[hit.floor] : null;
  tip.textContent = h ? `${h.floor} · ${t(h.name)} · ${t(h.theme)}` : t(halls[hall][hit.work].work.title);
  tip.style.left = `${x}px`;
  tip.style.top = `${y}px`;
  tip.hidden = false;
}

// --- Loop -------------------------------------------------------------------------------------------

function resize() {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

function render() {
  camera.position.copy(cam.pos);
  camera.lookAt(cam.look);
  renderer.render(scene, camera);
}

function frame() {
  const dt = Math.min(clock.getDelta(), 0.5);
  const time = clock.elapsedTime;
  const now = performance.now();
  world.update(time);
  if (mode === 'intro') {
    const a = 0.42 + time * 0.012;
    cam.pos.set(Math.sin(a) * 92, 16, Math.cos(a) * 92);
    if (innerWidth > innerHeight) {
      const right = V(Math.cos(a), 0, -Math.sin(a));
      cam.look.set(0, 8, 0).addScaledVector(right, -17);
    } else {
      cam.look.set(0, 2, 0);
    }
    const p = path.getPointAt(0.02);
    const tan = path.getTangentAt(0.02);
    world.placeBoat(p, Math.atan2(tan.x, tan.z), time, false);
  } else if (mode === 'ride') {
    stepRide(now, time, dt);
  } else if (mode === 'outside') {
    stepOrbit(dt);
  } else {
    parkBoat(time);
    stepTween(now);
  }
  if (Math.abs(camera.fov - fovTarget) > 0.05) {
    camera.fov += (fovTarget - camera.fov) * Math.min(1, dt * 3);
    camera.updateProjectionMatrix();
  }
  render();
  requestAnimationFrame(frame);
}

renderStatic();
const start = Number(params.get('hall'));
if (params.has('hall') && HALLS[start]) {
  parkBoat();
  goHall(start, true);
  // ?hall=1&work=2 opens a work directly.
  const w = Number(params.get('work'));
  if (params.has('work') && halls[start][w]) {
    openWork(w);
    const p = workPose(halls[start][w]);
    setPose(p);
  }
} else if (params.has('ride')) {
  startRide();
} else if (params.has('outside')) {
  leaveIntro();
  mode = 'outside';
  renderHUD();
}
requestAnimationFrame(frame);
