// Livy's flower boat. Modes, in the order a visitor meets them:
//   intro   — the title card and boat ticket over a slow view of the sea
//   ride    — the little boat crosses to the pier (skippable)
//   dock    — the camera steps off towards the flower boat
//   inside  — walking a deck, seen from above like Chris's place: click the floor to walk,
//             click things to open them, follow the butterfly upstairs
//   outside — circling the boat; click a deck to go in
import * as THREE from 'three';
import { t, toggleLang, onLang, applyStatic } from './i18n.js';
import { SITE, UI, RIDE, DECKS, TICKET, LIVY } from './content.js';
import { buildWorld } from './world.js';
import { WALL_H } from './decks.js';
import { Avatar, GUEST_LOOKS, SKINS, lookSvg, LivyFigure } from './avatar.js';
import { Butterfly } from './butterfly.js';
import { panel, label, flightClick, email } from './panels.js';
import * as sound from './sound.js';

const $ = (s) => document.querySelector(s);
const touch = matchMedia('(pointer: coarse)').matches;
const params = new URLSearchParams(location.search);
const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch {
      return d;
    }
  },
  set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  },
};

const renderer = new THREE.WebGLRenderer({ canvas: $('#scene'), antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor('#0b1328');
const persp = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
const ortho = new THREE.OrthographicCamera(-10, 10, 7, -7, 0.1, 600);

const world = buildWorld();
const { scene, decks, path } = world;

// Inside, a warm lamp from above replaces the moon as the light that casts shadows.
const lamp = new THREE.DirectionalLight('#ffe6c4', 0);
lamp.castShadow = true;
lamp.shadow.mapSize.set(2048, 2048);
Object.assign(lamp.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 60 });
lamp.shadow.bias = -0.0005;
lamp.shadow.normalBias = 0.03;
scene.add(lamp, lamp.target);

const clock = new THREE.Clock();
let mode = 'intro';
let cur = 0;

// --- The visitor, Livy and the butterfly ------------------------------------------------------

let lookId = store.get('livy.look', null);
if (!GUEST_LOOKS.some((l) => l.id === lookId)) lookId = GUEST_LOOKS[Math.floor(Math.random() * 5)].id;
let skin = store.get('livy.skin', SKINS[1]);
let player = null;
function makePlayer() {
  const keep = player && { x: player.object.position.x, y: player.object.position.y, z: player.object.position.z, h: player.heading };
  if (player) scene.remove(player.object);
  const look = { ...GUEST_LOOKS.find((l) => l.id === lookId), skin };
  player = new Avatar(look);
  player.object.visible = mode === 'inside';
  if (keep) {
    player.object.position.set(keep.x, keep.y, keep.z);
    player.heading = keep.h;
  }
  scene.add(player.object);
}
makePlayer();

const livy = new LivyFigure();
const roof = decks[decks.length - 1];
livy.object.position.set(roof.plan.livy[0], roof.y, roof.plan.livy[1]);
livy.heading = Math.PI / 5;
livy.object.rotation.y = livy.heading;
livy.object.userData.interact = 'livy';
roof.group.parent.add(livy.object);
roof.nav.blocked && blockAround(roof.nav, livy.object.position.x, livy.object.position.z, 0.35);

function blockAround(nav, x, z, r) {
  for (let dz = -r; dz <= r; dz += nav.cell) for (let dx = -r; dx <= r; dx += nav.cell) {
    const [c, rr] = nav.cellOf(x + dx, z + dz);
    if (c >= 0 && rr >= 0 && c < nav.cols && rr < nav.rows) nav.blocked[rr * nav.cols + c] = 1;
  }
}

const butterfly = new Butterfly(scene);
let guide = 'resting'; // resting | leading | waiting (on the stairs)

// --- Cameras ----------------------------------------------------------------------------------

const V = (x, y, z) => new THREE.Vector3(x, y, z);
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

// The view inside: from above and in front, at 45 degrees, like Chris's apartment.
const iso = { az: Math.PI / 4 + 0.08, el: 0.66, target: V(0, 0, 0), zoom: 1, need: { w: 10, h: 7 } };
function fitIso() {
  const [ax, az] = decks[cur].size;
  const diag = (ax + az) * Math.SQRT1_2;
  iso.need = { w: diag + 1.2, h: diag * Math.sin(iso.el) + WALL_H * Math.cos(iso.el) * 0.6 + 1.2 };
  resize();
}
const camRight = new THREE.Vector3();
const camUp = new THREE.Vector3();
function updateIso(dt, snap) {
  const d = decks[cur];
  const desired = V(0, d.y + 0.8, 0);
  const portrait = innerWidth < innerHeight;
  if (portrait && player) {
    const [ax, az] = d.size;
    desired.x = THREE.MathUtils.clamp(player.x, -ax * 0.55, ax * 0.55);
    desired.z = THREE.MathUtils.clamp(player.z, -az * 0.5, az * 0.5);
  }
  camRight.set(Math.cos(iso.az), 0, -Math.sin(iso.az));
  if (panelOpen && focus) {
    desired.copy(focus);
    const pxPerUnit = innerHeight / (ortho.top - ortho.bottom);
    if (innerWidth > 720) desired.addScaledVector(camRight, (panelPx() / 2) / pxPerUnit);
    else {
      camUp.set(0, 1, 0).applyQuaternion(ortho.quaternion);
      desired.addScaledVector(camUp, -(sheetPx() / 2) / pxPerUnit);
    }
  }
  if (snap) iso.target.copy(desired);
  else iso.target.lerp(desired, Math.min(1, dt * 4));
  const dist = 60;
  ortho.position.set(
    iso.target.x + Math.sin(iso.az) * Math.cos(iso.el) * dist,
    iso.target.y + Math.sin(iso.el) * dist,
    iso.target.z + Math.cos(iso.az) * Math.cos(iso.el) * dist,
  );
  ortho.lookAt(iso.target);
  const z = panelOpen && focus ? 1.35 : 1;
  iso.zoom += (z - iso.zoom) * Math.min(1, dt * 4);
  if (Math.abs(ortho.zoom - iso.zoom) > 0.001) {
    ortho.zoom = iso.zoom;
    ortho.updateProjectionMatrix();
  }
  lamp.position.set(iso.target.x + 6, d.y + 16, iso.target.z + 9);
  lamp.target.position.set(iso.target.x, d.y, iso.target.z);
}
const panelPx = () => Math.min(420, innerWidth * 0.42);
const sheetPx = () => innerHeight * 0.5;

function resize() {
  const w = innerWidth;
  const h = innerHeight;
  renderer.setSize(w, h);
  persp.aspect = w / h;
  persp.updateProjectionMatrix();
  const aspect = w / h;
  let halfW = iso.need.w;
  let halfH = iso.need.h;
  if (aspect < 1) {
    // Phones: show part of the deck and follow the visitor.
    halfW = iso.need.w * 0.62;
    halfH = halfW / aspect;
  } else if (halfW / halfH > aspect) halfH = halfW / aspect;
  else halfW = halfH * aspect;
  Object.assign(ortho, { left: -halfW, right: halfW, top: halfH, bottom: -halfH });
  ortho.updateProjectionMatrix();
}
addEventListener('resize', resize);

// --- What is shown on each deck ---------------------------------------------------------------

function showDecks() {
  const inside = mode === 'inside';
  decks.forEach((d, j) => {
    d.group.visible = !inside || j <= cur;
    for (const o of d.upper) o.visible = !inside || j !== cur;
    const lit = !inside || j <= cur;
    d.lights.forEach((l) => (l.visible = lit));
  });
  livy.object.visible = !inside || cur === decks.length - 1;
  world.moonLight.castShadow = !inside;
  lamp.intensity = inside ? 1.4 : 0;
  world.hemi.intensity = inside ? 1.3 : 0.9;
  world.hemi.color.set(inside ? '#ffe9cf' : '#6a78a8');
  world.hemi.groundColor.set(inside ? '#5a4632' : '#1a2430');
  if (player) player.object.visible = inside;
}

// --- Fades and captions -----------------------------------------------------------------------

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

// Speech bubble over Livy's head.
let bubble = null;
function say(text, ms = 3200) {
  bubble = { text, until: performance.now() + ms };
  $('#bubble').textContent = text;
  $('#bubble').hidden = false;
}

// --- Modes ------------------------------------------------------------------------------------

let ride = null;
function leaveIntro() {
  $('#intro').classList.add('gone');
}
addEventListener('pointerdown', () => sound.start(), { once: true, capture: true });

function startRide() {
  leaveIntro();
  closePanel();
  mode = 'ride';
  persp.fov = 50;
  persp.updateProjectionMatrix();
  sound.setInside(false);
  showDecks();
  ride = { t0: performance.now(), shown: 0, nextSplash: 0 };
  const p = path.getPointAt(0);
  const tan = path.getTangentAt(0);
  cam.tween = null;
  cam.pos.copy(p).addScaledVector(tan, -8).add(V(0, 3, 0));
  cam.look.copy(p).addScaledVector(tan, 10);
  butterfly.setStyle('ink');
  butterfly.perch(p.clone().addScaledVector(tan, 6).add(V(0, 2.2, 0)));
  $('#btn-skip').hidden = false;
  renderHUD();
}

const RIDE_SECONDS = 15;
function stepRide(now, time, dt) {
  const k = Math.min(1, (now - ride.t0) / (RIDE_SECONDS * 1000));
  const u = THREE.MathUtils.smootherstep(k, 0, 1);
  const p = path.getPointAt(u);
  const tan = path.getTangentAt(u);
  world.placeBoat(p, Math.atan2(tan.x, tan.z), time, k < 0.95);
  // The butterfly flies a little way ahead of the boat.
  const ahead = path.getPointAt(Math.min(1, u + 0.06)).add(V(Math.sin(time) * 0.6, 2.4 + Math.sin(time * 1.7) * 0.3, 0));
  butterfly.home.lerp(ahead, Math.min(1, dt * 2));
  const s = (now - ride.t0) / 1000;
  while (ride.shown < RIDE.length && s >= RIDE[ride.shown].at) caption(t(RIDE[ride.shown++].text), 3600);
  if (s > ride.nextSplash && k < 0.95) {
    sound.splash();
    ride.nextSplash = s + 2.6;
  }
  const want = p.clone().addScaledVector(tan, -6.5).add(V(0, 2.7 + world.boat.position.y, 0));
  const forward = p.clone().addScaledVector(tan, 14).add(V(0, 1.5, 0));
  const lookWant = forward.lerp(V(0, 7, 0), 0.45 + 0.25 * k);
  const k2 = 1 - Math.exp(-dt * 3);
  cam.pos.lerp(want, k2);
  cam.look.lerp(lookWant, k2);
  if (k === 1) dock();
}

function dock() {
  mode = 'dock';
  $('#btn-skip').hidden = true;
  butterfly.flyTo(V(0, 4.2, 8.2), null, { dur: 3 });
  tweenTo(V(0.8, 2.8, 21), V(0, 6, 0), 1.8, () => {
    tweenTo(V(0, 3.2, 12.5), V(0, 2.6, 0), 2.6, () => goDeck(0, { fromBoat: true }));
  });
}

function skipRide() {
  if (mode !== 'ride' && mode !== 'dock') return;
  parkBoat();
  goDeck(0, { fromBoat: true });
}

function parkBoat(time = clock.elapsedTime) {
  const end = path.getPointAt(1);
  const tan = path.getTangentAt(1);
  world.placeBoat(end, Math.atan2(tan.x, tan.z), time, false);
}

let butterflyTimer = 0;
function goDeck(i, { fromBoat = false, instant = false } = {}) {
  const enter = () => {
    const wasInside = mode === 'inside';
    mode = 'inside';
    cur = i;
    closePanel();
    sound.setInside(true);
    $('#btn-skip').hidden = true;
    $('#caption').classList.remove('on');
    const d = decks[i];
    const P = d.plan;
    player.stop();
    const start = fromBoat && P.door ? [P.door[0], P.door[1] - 0.4] : P.arrive;
    player.object.position.set(start[0], d.y, start[1]);
    player.heading = fromBoat ? Math.PI : Math.PI * 0.75;
    player.object.rotation.y = player.heading;
    if (fromBoat && P.entry) walkTo(P.entry[0], P.entry[1]);
    showDecks();
    fitIso();
    updateIso(0, true);
    // The butterfly shows up a moment later, fluttering in from the courtyard.
    guide = 'resting';
    resetStairs();
    butterfly.setStyle(P.roof ? 'light' : DECKS[i].butterfly);
    butterfly.hide();
    clearTimeout(butterflyTimer);
    butterflyTimer = setTimeout(() => {
      if (mode !== 'inside' || cur !== i) return;
      const [bx, bz, by] = P.butterfly;
      butterfly.perch(V(0, d.y - 1.5, 0));
      butterfly.flyTo(V(bx, d.y + by, bz), null, { dur: 2.4, height: 2 });
    }, wasInside ? 900 : 1600);
    renderHUD();
  };
  if (mode === 'intro') leaveIntro();
  instant ? enter() : fade(enter);
}

function goOutside() {
  fade(() => {
    mode = 'outside';
    closePanel();
    orbit.theta = 0.35;
    orbit.phi = 0.22;
    orbit.r = 58;
    orbit.idle = 0;
    cam.tween = null;
    persp.fov = 45;
    persp.updateProjectionMatrix();
    sound.setInside(false);
    butterfly.hide();
    showDecks();
    renderHUD();
  });
}

const orbit = { theta: 0.35, phi: 0.22, r: 58, idle: 0 };
function stepOrbit(dt) {
  orbit.idle += dt;
  if (orbit.idle > 3) orbit.theta += dt * 0.05;
  const c = V(0, 8, 0);
  cam.pos.set(c.x + Math.sin(orbit.theta) * Math.cos(orbit.phi) * orbit.r, c.y + Math.sin(orbit.phi) * orbit.r, c.z + Math.cos(orbit.theta) * Math.cos(orbit.phi) * orbit.r);
  cam.look.copy(c);
}

// --- Walking and doing things ------------------------------------------------------------------

function walkTo(x, z, done) {
  const nav = decks[cur].nav;
  const p = nav.findPath(player.x, player.z, x, z);
  if (!p) return false;
  player.walk(p, done);
  return true;
}

function spotFor(obj, item) {
  if (item?.spot) return item.spot;
  const wp = obj.getWorldPosition(new THREE.Vector3());
  return decks[cur].nav.clampToFree(wp.x, wp.z);
}

function interact(id, obj) {
  const d = decks[cur];
  if (id === 'butterfly') {
    const p = butterfly.object.position;
    const [sx, sz] = d.nav.clampToFree(p.x, p.z);
    walkTo(sx, sz, () => {
      player.face(p.x, p.z);
      followButterfly();
    });
    return;
  }
  if (id === 'livy') {
    const p = livy.object.position;
    const [sx, sz] = d.nav.clampToFree(p.x - 0.8, p.z + 0.6);
    walkTo(sx, sz, () => {
      player.face(p.x, p.z);
      livy.face(player.x, player.z);
      livy.wave();
      player.wave();
      const lines = LIVY.lines;
      say(t(lines[Math.floor(Math.random() * lines.length)]));
      setTimeout(() => openPanel('mirror-final', livy.object), 900);
    });
    return;
  }
  const item = obj?.userData?.item;
  const [sx, sz] = spotFor(obj, item);
  walkTo(sx, sz, () => {
    const wp = obj.getWorldPosition(new THREE.Vector3());
    player.face(wp.x, wp.z);
    if (id === 'stairs') climb();
    else openPanel(id, obj);
  });
}

// Click the butterfly: it flies to the stairs and they light up, step by step.
function followButterfly() {
  const d = decks[cur];
  sound.chime();
  if (!d.stairs) {
    // On the roof it flies off into the sky, and the last panel opens.
    guide = 'gone';
    butterfly.flyTo(V(-8, d.y + 14, -14), () => butterfly.hide(), { dur: 4, height: 3 });
    setTimeout(() => openPanel('mirror-final', null), 1200);
    return;
  }
  guide = 'leading';
  const top = d.stairs.localToWorld(V(-1.3, 2.1, 0.55));
  butterfly.flyTo(top, () => {
    guide = 'waiting';
    lightStairs();
    caption(t(UI.followUp), 3600);
  });
}

let stairTimers = [];
function lightStairs() {
  const steps = decks[cur].stairs?.userData.steps || [];
  stairTimers.forEach(clearTimeout);
  stairTimers = steps.map((m, k) => setTimeout(() => {
    m.emissiveIntensity = 1.4;
    if (k % 3 === 0) sound.chime([1320 + k * 60]);
  }, k * 110));
}
function resetStairs() {
  stairTimers.forEach(clearTimeout);
  for (const d of decks) for (const m of d.stairs?.userData.steps || []) m.emissiveIntensity = 0;
}

function climb() {
  if (cur >= decks.length - 1) {
    caption(t(UI.topDeck));
    return;
  }
  goDeck(cur + 1);
}

// --- Panel ------------------------------------------------------------------------------------

let panelOpen = null;
let focus = null;
function openPanel(id, obj) {
  const p = panel(id);
  if (!p) return;
  panelOpen = id;
  focus = obj ? obj.getWorldPosition(new THREE.Vector3()).setY(decks[cur].y + 1) : null;
  $('#p-kicker').textContent = p.kicker;
  $('#p-title').textContent = p.title;
  $('#p-body').innerHTML = p.html;
  $('#panel').hidden = false;
  $('#panel').scrollTop = 0;
  document.body.classList.add('panel-open');
}
function closePanel() {
  panelOpen = null;
  focus = null;
  $('#panel').hidden = true;
  document.body.classList.remove('panel-open');
}

$('#panel').addEventListener('click', (e) => {
  if (panelOpen === 'flight' && flightClick(e.target)) {
    const p = panel('flight');
    $('#p-body').innerHTML = p.html;
    sound.chime([660, 990]);
    return;
  }
  const act = e.target.closest('[data-act]');
  if (act) {
    if (act.dataset.act === 'copy') {
      const done = () => (act.textContent = t(UI.copied));
      navigator.clipboard?.writeText(email()).then(done, () => {
        const r = document.createRange();
        r.selectNodeContents($('#p-email'));
        getSelection().removeAllRanges();
        getSelection().addRange(r);
      });
      return;
    }
    openPanel(act.dataset.act, null);
    return;
  }
  const deck = e.target.closest('[data-deck]');
  if (deck) goDeck(Number(deck.dataset.deck));
});
$('#p-close').addEventListener('click', closePanel);

// --- HUD --------------------------------------------------------------------------------------

function renderLooks() {
  $('#looks').innerHTML = GUEST_LOOKS.map((l) => `<button type="button" class="look ${l.id === lookId ? 'on' : ''}" data-look="${l.id}" title="${t(l.label)}" aria-label="${t(l.label)}">${lookSvg({ ...l, skin })}</button>`).join('')
    + `<span class="skins">${SKINS.map((c) => `<button type="button" class="skin ${c === skin ? 'on' : ''}" data-skin="${c}" style="--c:${c}" aria-label="${c}"></button>`).join('')}</span>`;
}
$('#looks').addEventListener('click', (e) => {
  const l = e.target.closest('[data-look]');
  const s = e.target.closest('[data-skin]');
  if (l) lookId = l.dataset.look;
  if (s) skin = s.dataset.skin;
  if (!l && !s) return;
  store.set('livy.look', lookId);
  store.set('livy.skin', skin);
  makePlayer();
  renderLooks();
});

function renderStatic() {
  applyStatic(UI);
  $('#kicker').textContent = t(SITE.kicker);
  $('#title').textContent = t(SITE.title);
  $('#subtitle').textContent = t(SITE.subtitle);
  $('#tagline').textContent = t(SITE.tagline);
  $('#t-vessel').textContent = t(TICKET.vessel);
  $('#t-route').textContent = t(TICKET.route);
  $('#t-dest').textContent = t(TICKET.destination);
  $('#btn-chris').href = SITE.chris;
  document.title = `${t(SITE.title)} · ${SITE.owner}`;
  $('#btn-sound').classList.toggle('off', !sound.isOn());
  $('#decks').innerHTML = DECKS.map((d, i) => `<button data-deck="${i}"><span>${t(d.name)}<small>${t(d.place)}</small></span><b>${d.no.replace('Deck ', '')}</b></button>`).reverse().join('');
  renderLooks();
  renderHUD();
  if (panelOpen) openPanel(panelOpen, null);
}

function renderHUD() {
  const inside = mode === 'inside';
  const shown = inside || mode === 'outside';
  $('#deck-card').hidden = !inside;
  $('#decks').hidden = !shown;
  $('#btn-out').hidden = !inside;
  $('#btn-in').hidden = mode !== 'outside';
  $('#btn-ride').hidden = mode !== 'outside';
  $('#btn-cv').hidden = !shown;
  $('#hint').hidden = !shown;
  if (inside) {
    const d = DECKS[cur];
    $('#deck-kicker').textContent = [d.no, t(d.place), d.years].filter(Boolean).join(' · ');
    $('#deck-name').textContent = t(d.name);
    $('#deck-question').textContent = t(d.question);
    $('#deck-intro').textContent = t(d.intro);
    const card = $('#deck-card');
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';
  }
  $('#hint').textContent = t(mode === 'outside' ? UI.hintOutside : touch ? UI.hintTouch : UI.hint);
  document.querySelectorAll('#decks button').forEach((b) => b.classList.toggle('on', inside && Number(b.dataset.deck) === cur));
}

$('#btn-board').addEventListener('click', startRide);
$('#btn-direct').addEventListener('click', () => {
  parkBoat();
  goDeck(0, { fromBoat: true });
});
$('#btn-skip').addEventListener('click', skipRide);
$('#btn-out').addEventListener('click', goOutside);
$('#btn-in').addEventListener('click', () => goDeck(cur));
$('#btn-ride').addEventListener('click', () => fade(startRide));
$('#btn-cv').addEventListener('click', () => openPanel('cv', null));
$('#btn-lang').addEventListener('click', toggleLang);
$('#btn-sound').addEventListener('click', () => {
  sound.setOn(!sound.isOn());
  $('#btn-sound').classList.toggle('off', !sound.isOn());
});
$('#decks').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) goDeck(Number(b.dataset.deck));
});
onLang(renderStatic);

// Arrow keys walk, relative to the camera, like at Chris's place.
const keys = new Set();
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (panelOpen) closePanel();
    else if (mode === 'ride' || mode === 'dock') skipRide();
    return;
  }
  if (e.target.closest('input, textarea')) return;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key) && mode === 'inside') {
    keys.add(e.key);
    e.preventDefault();
  }
  if (mode === 'inside' && (e.key === 'PageUp' || e.key === ']') && cur < decks.length - 1) goDeck(cur + 1);
  if (mode === 'inside' && (e.key === 'PageDown' || e.key === '[') && cur > 0) goDeck(cur - 1);
});
addEventListener('keyup', (e) => keys.delete(e.key));
addEventListener('blur', () => keys.clear());
function keyDir() {
  let f = 0;
  let r = 0;
  if (keys.has('ArrowUp') || keys.has('w')) f += 1;
  if (keys.has('ArrowDown') || keys.has('s')) f -= 1;
  if (keys.has('ArrowRight') || keys.has('d')) r += 1;
  if (keys.has('ArrowLeft') || keys.has('a')) r -= 1;
  if (!f && !r) return null;
  const fx = -Math.sin(iso.az);
  const fz = -Math.cos(iso.az);
  const rx = Math.cos(iso.az);
  const rz = -Math.sin(iso.az);
  return [fx * f + rx * r, fz * f + rz * r];
}

// --- Pointer ----------------------------------------------------------------------------------

const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let down = null;
const activeCam = () => (mode === 'inside' ? ortho : persp);

function findInteract(o) {
  for (let n = o; n; n = n.parent) if (n.userData.interact) return n;
  return null;
}

function pick(x, y) {
  ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, activeCam());
  if (mode === 'inside') {
    const d = decks[cur];
    const targets = [d.group, butterfly.object];
    if (livy.object.visible) targets.push(livy.object);
    const hits = ray.intersectObjects(targets, true);
    for (const h of hits) {
      if (!h.object.visible && !h.object.userData.interact) continue;
      if (h.object.material?.transparent && h.object.material.opacity < 0.3 && !findInteract(h.object)) continue;
      const it = findInteract(h.object);
      if (it) {
        if (it === butterfly.object && !butterfly.object.visible) continue;
        return { id: it.userData.interact, obj: it };
      }
      if (h.object.userData.floor === cur) return { floor: h.point };
      if (!isHidden(h.object)) return null;
    }
    return null;
  }
  if (mode === 'outside') {
    const hits = ray.intersectObjects(decks.map((dd) => dd.hit));
    return hits[0] ? { deck: hits[0].object.userData.deck } : null;
  }
  return null;
}
function isHidden(o) {
  for (let n = o; n; n = n.parent) if (!n.visible) return true;
  return false;
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
    if (down.moved && mode === 'outside') {
      orbit.theta -= dx * 0.005;
      orbit.phi = THREE.MathUtils.clamp(orbit.phi + dy * 0.003, 0.04, 0.9);
      orbit.idle = 0;
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
  if (!hit) return;
  if (hit.deck != null) goDeck(hit.deck);
  else if (hit.id) interact(hit.id, hit.obj);
  else if (hit.floor) {
    if (panelOpen) closePanel();
    walkTo(hit.floor.x, hit.floor.z);
    ping(hit.floor);
  }
});
canvas.addEventListener('wheel', (e) => {
  if (mode === 'outside') {
    orbit.r = THREE.MathUtils.clamp(orbit.r + e.deltaY * 0.03, 30, 120);
    orbit.idle = 0;
  }
}, { passive: true });

// A small ring where you clicked the floor.
const ringMesh = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.26, 24), new THREE.MeshBasicMaterial({ color: '#fff3d6', transparent: true, opacity: 0, depthWrite: false }));
ringMesh.rotation.x = -Math.PI / 2;
scene.add(ringMesh);
let ringT = 0;
function ping(p) {
  ringMesh.position.set(p.x, decks[cur].y + 0.02, p.z);
  ringT = 0.6;
}

function hover(x, y) {
  const tip = $('#tip');
  if (touch) return;
  const hit = pick(x, y);
  const name = hit?.id ? label(hit.id) : hit?.deck != null ? `${DECKS[hit.deck].no} · ${t(DECKS[hit.deck].name)}` : '';
  canvas.style.cursor = name ? 'pointer' : mode === 'outside' ? 'grab' : '';
  if (!name) {
    tip.hidden = true;
    return;
  }
  tip.textContent = name;
  tip.style.left = `${x}px`;
  tip.style.top = `${y}px`;
  tip.hidden = false;
}

// --- Loop -------------------------------------------------------------------------------------

const tmpV = new THREE.Vector3();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.1);
  const time = clock.elapsedTime;
  const now = performance.now();
  world.update(time);
  butterfly.update(dt);
  livy.update(dt);
  if (mode === 'intro') {
    const a = 0.42 + time * 0.012;
    cam.pos.set(Math.sin(a) * 92, 16, Math.cos(a) * 92);
    if (innerWidth > innerHeight) {
      const right = V(Math.cos(a), 0, -Math.sin(a));
      cam.look.set(0, 7, 0).addScaledVector(right, -17);
    } else cam.look.set(0, -9, 0); // phones: the boat sits in the top half, above the ticket
    const p = path.getPointAt(0.02);
    const tan = path.getTangentAt(0.02);
    world.placeBoat(p, Math.atan2(tan.x, tan.z), time, false);
  } else if (mode === 'ride') {
    stepRide(now, time, dt);
  } else if (mode === 'outside') {
    parkBoat(time);
    stepOrbit(dt);
  } else if (mode === 'dock') {
    parkBoat(time);
    stepTween(now);
  } else if (mode === 'inside') {
    parkBoat(time);
    player.update(dt, decks[cur].nav, keyDir());
    updateIso(dt);
  }
  if (ringT > 0) {
    ringT -= dt;
    ringMesh.material.opacity = Math.max(0, ringT / 0.6) * 0.8;
    ringMesh.scale.setScalar(1 + (0.6 - ringT) * 1.5);
  }
  if (bubble) {
    if (now > bubble.until || !livy.object.visible) {
      bubble = null;
      $('#bubble').hidden = true;
    } else {
      tmpV.copy(livy.object.position).add(V(0, 2.1, 0)).project(activeCam());
      $('#bubble').style.left = `${(tmpV.x * 0.5 + 0.5) * innerWidth}px`;
      $('#bubble').style.top = `${(-tmpV.y * 0.5 + 0.5) * innerHeight}px`;
    }
  }
  if (mode !== 'inside') {
    persp.position.copy(cam.pos);
    persp.lookAt(cam.look);
  }
  renderer.render(scene, activeCam());
  requestAnimationFrame(frame);
}

renderStatic();
resize();
const deckParam = params.has('deck') ? params.get('deck') : params.get('hall');
if (deckParam != null && decks[Number(deckParam)]) {
  parkBoat();
  goDeck(Number(deckParam), { instant: true });
  if (params.has('panel')) openPanel(params.get('panel'), null);
} else if (params.has('ride')) {
  startRide();
} else if (params.has('outside')) {
  leaveIntro();
  mode = 'outside';
  showDecks();
  renderHUD();
} else {
  showDecks();
}
requestAnimationFrame(frame);
