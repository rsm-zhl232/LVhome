// The side panel (a bottom sheet on phones) that opens when you click something on the boat.
// Content comes from content.js; this file only turns it into HTML.
import { t } from './i18n.js';
import { PANELS, LOFT, CAREER, DECKS, UI, PROFILE, SKILLS } from './content.js';
import { paint } from './art.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const email = () => PROFILE.emailParts.join('@');

function blocks(list) {
  return list.map((b) => {
    if (b.p) return `<p>${esc(t(b.p))}</p>`;
    if (b.h) return `<h4>${esc(t(b.h))}</h4>`;
    if (b.meta) return `<p class="meta">${esc(t(b.meta))}</p>`;
    if (b.quote) return `<blockquote>${esc(t(b.quote))}</blockquote>`;
    if (b.list) return `<ul>${t(b.list).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    if (b.soon) return `<p class="soon">${esc(t(UI.soon))}</p>`;
    if (b.final) return finalButtons();
    return '';
  }).join('');
}

function finalButtons() {
  return `<div class="p-actions">
      <button class="pill solid" data-act="cv">${esc(t(UI.viewCv))}</button>
      <button class="pill" data-act="contact">${esc(t(UI.contact))}</button>
    </div>
    <h4>${esc(t(UI.returnTo))}</h4>
    <div class="p-decks">${DECKS.map((d, i) => `<button class="pill" data-deck="${i}">${esc(d.no)} · ${esc(t(d.name))}</button>`).join('')}</div>`;
}

const artCache = new Map();
function artUrl(art, aspect) {
  const key = JSON.stringify(art) + aspect;
  if (!artCache.has(key)) artCache.set(key, paint(art, aspect).toDataURL('image/jpeg', 0.85));
  return artCache.get(key);
}

// The Flight Room keeps which heading and which view you picked while the panel is open.
const flight = { job: 0, view: 'story' };

function flightPanel() {
  const job = CAREER[flight.job];
  const compass = CAREER.map((c, i) => `<button class="dir ${i === flight.job ? 'on' : ''}" data-job="${i}"><b>${esc(t(c.dir))}</b><span>${esc(t(c.org))}</span></button>`).join('');
  const body = flight.view === 'story'
    ? `<p class="memory">${esc(t(job.memory))}</p><p>${esc(t(job.story))}</p>`
    : `<ul>${t(job.bullets).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  return {
    kicker: { en: 'Deck 04 · The Flight Room', zh: '第四层 · 飞行舱' },
    title: { en: 'Push the wheel to a heading', zh: '把舵轮推向一个方向' },
    html: `<p>${esc(t({ en: 'This is where my working life is kept. Each heading opens one place.', zh: '这里存放着我的职业档案。每个方向打开一个地方。' }))}</p>
      <div class="compass">${compass}</div>
      <div class="job">
        <p class="kicker">${esc(t(job.place))} · ${esc(job.period)}</p>
        <h3>${esc(t(job.org))}</h3>
        <p class="meta">${esc(t(job.role))}</p>
        <div class="seg"><button data-view="story" class="${flight.view === 'story' ? 'on' : ''}">${esc(t(UI.experience))}</button><button data-view="summary" class="${flight.view === 'summary' ? 'on' : ''}">${esc(t(UI.summary))}</button></div>
        ${body}
      </div>`,
  };
}

function loftPanel(id) {
  const l = LOFT[id];
  return {
    kicker: { en: "Deck 05 · The Maker's Loft", zh: '第五层 · 创作阁楼' },
    title: l.title,
    html: `<p class="meta">${esc(t(l.hint))}</p>
      <p>${esc(t(l.text))}</p>
      <figure class="sample"><img src="${artUrl(l.art, 1.3)}" alt="" /><figcaption>${esc(t({ en: 'A placeholder until my own pieces are up.', zh: '先放一张示意图，我的作品很快就挂上来。' }))}</figcaption></figure>
      <p class="soon">${esc(t(UI.soon))}</p>`,
  };
}

function cvPanel() {
  const edu = [
    { org: { en: 'University of Pennsylvania', zh: '宾夕法尼亚大学' }, what: { en: 'International Master of Public Administration', zh: '国际公共管理硕士' }, when: 'Jun 2025 – Jun 2026', where: { en: 'Philadelphia, PA', zh: '美国费城' } },
    { org: { en: 'The University of Hong Kong', zh: '香港大学' }, what: { en: 'Bachelor of Economics · Minors in Marketing and Arts History', zh: '经济学学士 · 辅修市场营销与艺术史' }, when: 'Sept 2021 – Jun 2025', where: { en: 'Hong Kong', zh: '香港' } },
    { org: { en: 'Headington School', zh: 'Headington School' }, what: { en: 'GCSE · A-Level', zh: 'GCSE · A-Level' }, when: '2016 – 2021', where: { en: 'Oxford, UK', zh: '英国牛津' } },
  ];
  const work = CAREER.slice(0, 3);
  return {
    kicker: { en: 'CV', zh: '简历' },
    title: PROFILE.name,
    html: `<p class="meta">${esc(email())}</p>
      <h4>${esc(t({ en: 'Education', zh: '教育' }))}</h4>
      ${edu.map((e) => `<div class="cv-row"><b>${esc(t(e.org))}</b><span>${esc(e.when)}</span><em>${esc(t(e.what))} · ${esc(t(e.where))}</em></div>`).join('')}
      <h4>${esc(t({ en: 'Experience', zh: '工作经历' }))}</h4>
      ${work.map((c) => `<div class="cv-row"><b>${esc(t(c.org))}</b><span>${esc(c.period)}</span><em>${esc(t(c.role))} · ${esc(t(c.place))}</em><ul>${t(c.bullets).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}
      <h4>${esc(t({ en: 'Research and projects', zh: '研究与项目' }))}</h4>
      <ul>${t(CAREER[3].bullets).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <h4>${esc(t({ en: 'Skills', zh: '技能' }))}</h4>
      <p>${esc(t(SKILLS).join(' · '))}</p>
      <div class="p-actions"><button class="pill" data-act="contact">${esc(t(UI.contact))}</button></div>`,
  };
}

function contactPanel() {
  const addr = email();
  return {
    kicker: { en: 'Contact', zh: '联系' },
    title: { en: 'Write to me', zh: '给我写信' },
    html: `<p>${esc(t({ en: 'The quickest way to reach me is email.', zh: '找我最快的方式是发邮件。' }))}</p>
      <p class="email"><span id="p-email">${esc(addr)}</span> <button class="pill" data-act="copy">${esc(t(UI.copy))}</button></p>
      <div class="p-actions"><a class="pill solid" href="mailto:${esc(addr)}">${esc(t(UI.email))}</a></div>`,
  };
}

// Returns { kicker, title, html } for a panel id, or null.
export function panel(id) {
  let p;
  if (id === 'flight') p = flightPanel();
  else if (id === 'cv') p = cvPanel();
  else if (id === 'contact') p = contactPanel();
  else if (LOFT[id]) p = loftPanel(id);
  else if (PANELS[id]) p = { kicker: PANELS[id].kicker, title: PANELS[id].title, html: blocks(PANELS[id].body) };
  if (!p) return null;
  return { kicker: t(p.kicker), title: t(p.title), html: p.html };
}

// Short name for the hover tooltip.
export function label(id) {
  if (id === 'flight') return t({ en: 'The Flight Room', zh: '飞行舱' });
  if (id === 'stairs') return t(UI.stairsUp);
  if (id === 'butterfly') return t({ en: 'The butterfly', zh: '蝴蝶' });
  if (id === 'livy') return 'Livy';
  if (LOFT[id]) return t(LOFT[id].title);
  if (PANELS[id]) return t(PANELS[id].title);
  return '';
}

// Clicks inside the flight panel change its state; returns true if it should re-render.
export function flightClick(target) {
  const job = target.closest('[data-job]');
  if (job) {
    flight.job = Number(job.dataset.job);
    return true;
  }
  const view = target.closest('[data-view]');
  if (view) {
    flight.view = view.dataset.view;
    return true;
  }
  return false;
}
