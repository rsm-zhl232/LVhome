// Sample artworks drawn on a canvas, so the halls are full before Livy's real works arrive.
// Each style takes a seed, so the same entry in content.js always draws the same picture.

const PAPER = '#efe6d2';
const INK = '26, 23, 20';

function rng(seed) {
  let a = (seed * 9301 + 49297) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paper(ctx, w, h, r, color = PAPER) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < (w * h) / 900; i++) {
    ctx.fillStyle = `rgba(90, 70, 40, ${r() * 0.05})`;
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
}

function seal(ctx, x, y, s, text = 'L') {
  ctx.save();
  ctx.fillStyle = '#b8322a';
  ctx.fillRect(x, y, s, s);
  ctx.fillStyle = PAPER;
  ctx.font = `${s * 0.62}px 'Kaiti SC', STKaiti, KaiTi, 'Songti SC', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + s / 2, y + s / 2 + s * 0.04);
  ctx.restore();
}

// A ridge line by midpoint displacement.
function ridge(r, n, rough) {
  let pts = [0.5, 0.5];
  let amp = 0.5;
  while (pts.length < n) {
    const next = [];
    for (let i = 0; i < pts.length - 1; i++) next.push(pts[i], (pts[i] + pts[i + 1]) / 2 + (r() - 0.5) * amp);
    next.push(pts[pts.length - 1]);
    pts = next;
    amp *= rough;
  }
  return pts;
}

const styles = {
  calligraphy(ctx, w, h, r, art) {
    paper(ctx, w, h, r, '#f2ead8');
    const chars = [...(art.text || '海上')];
    const size = Math.min(w * 0.55, (h * 0.8) / chars.length);
    ctx.fillStyle = `rgb(${INK})`;
    ctx.font = `${size}px 'Kaiti SC', STKaiti, KaiTi, 'Songti SC', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    chars.forEach((c, i) => {
      ctx.save();
      ctx.translate(w / 2 + (r() - 0.5) * size * 0.08, h * 0.1 + size * (i + 0.5));
      ctx.rotate((r() - 0.5) * 0.06);
      ctx.fillText(c, 0, 0);
      ctx.restore();
    });
    ctx.font = `${size * 0.22}px 'Kaiti SC', STKaiti, KaiTi, 'Songti SC', serif`;
    ctx.fillText('Livy 书', w * 0.82, h * 0.1 + size * chars.length + size * 0.1);
    seal(ctx, w * 0.75, h * 0.1 + size * chars.length + size * 0.3, size * 0.32, '丽');
  },

  ink(ctx, w, h, r, art) {
    paper(ctx, w, h, r);
    const layers = 5;
    for (let k = 0; k < layers; k++) {
      const pts = ridge(r, 129, 0.55);
      const base = h * (art.wide ? 0.3 + k * 0.1 : 0.22 + k * 0.12);
      const amp = h * (art.wide ? 0.25 : 0.18) * (1 - k * 0.12);
      const alpha = 0.18 + k * 0.17;
      const top = Math.min(...pts.map((p) => base - p * amp));
      const g = ctx.createLinearGradient(0, top, 0, base + h * 0.22);
      g.addColorStop(0, `rgba(${INK}, ${alpha})`);
      g.addColorStop(1, `rgba(${INK}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, h);
      pts.forEach((p, i) => ctx.lineTo((i / (pts.length - 1)) * w, base - p * amp));
      ctx.lineTo(w, h);
      ctx.fill();
    }
    // A little boat on the mist, and a few birds.
    const bx = w * (0.25 + r() * 0.4);
    const by = h * (art.wide ? 0.82 : 0.86);
    ctx.strokeStyle = `rgba(${INK}, 0.85)`;
    ctx.lineWidth = Math.max(2, w * 0.006);
    ctx.beginPath();
    ctx.moveTo(bx - w * 0.05, by);
    ctx.quadraticCurveTo(bx, by + w * 0.018, bx + w * 0.05, by);
    ctx.moveTo(bx + w * 0.01, by - w * 0.001);
    ctx.lineTo(bx + w * 0.012, by - w * 0.045);
    ctx.stroke();
    ctx.lineWidth = Math.max(1.5, w * 0.003);
    for (let i = 0; i < 3; i++) {
      const x = w * (0.55 + r() * 0.3);
      const y = h * (0.08 + r() * 0.1);
      const s = w * 0.012;
      ctx.beginPath();
      ctx.moveTo(x - s, y);
      ctx.quadraticCurveTo(x - s / 2, y - s * 0.6, x, y);
      ctx.quadraticCurveTo(x + s / 2, y - s * 0.6, x + s, y);
      ctx.stroke();
    }
    seal(ctx, w * 0.08, h * 0.06, w * 0.07);
  },

  waves(ctx, w, h, r, art) {
    paper(ctx, w, h, r, '#f1e7d0');
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.4);
    sky.addColorStop(0, '#e9c9a1');
    sky.addColorStop(1, '#f1e7d0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.4);
    const bands = art.calm ? 6 : 8;
    const blues = ['#9cb7c4', '#6f93a8', '#4b7290', '#2f557a', '#203f66', '#172f52', '#11264a', '#0d1f3e'];
    for (let k = 0; k < bands; k++) {
      const y0 = h * (0.3 + (k / bands) * 0.72);
      const amp = h * (art.calm ? 0.015 : 0.03 + k * 0.012);
      const f = (Math.PI * 2 * (2 + r() * 2)) / w;
      const ph = r() * 7;
      const yAt = (x) => y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 2.7 + ph * 2) * amp * 0.35;
      ctx.fillStyle = blues[Math.min(blues.length - 1, Math.round((k * (blues.length - 1)) / (bands - 1)))];
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 4) ctx.lineTo(x, yAt(x));
      ctx.lineTo(w, h);
      ctx.fill();
      // Foam: white curls along the crest.
      ctx.strokeStyle = 'rgba(250, 246, 236, 0.9)';
      ctx.lineWidth = Math.max(1.5, w * 0.003);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) ctx.lineTo(x, yAt(x) + 2);
      ctx.stroke();
      if (!art.calm) {
        ctx.fillStyle = 'rgba(250, 246, 236, 0.95)';
        for (let x = 0; x < w; x += w * 0.018) {
          if (r() < 0.45) continue;
          ctx.beginPath();
          ctx.arc(x, yAt(x) - 1, w * (0.003 + r() * 0.004), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    if (!art.calm) {
      // One big curling wave on the left, the way woodblock prints like to do it.
      const cx = w * 0.3;
      const cy = h * 0.45;
      const R = Math.min(w, h) * 0.32;
      ctx.fillStyle = '#1b3a63';
      ctx.beginPath();
      ctx.moveTo(cx - R * 1.4, h);
      ctx.quadraticCurveTo(cx - R * 1.1, cy - R * 0.2, cx - R * 0.1, cy - R * 0.9);
      ctx.quadraticCurveTo(cx + R * 0.9, cy - R * 1.1, cx + R * 1.0, cy - R * 0.2);
      ctx.quadraticCurveTo(cx + R * 0.4, cy - R * 0.7, cx - R * 0.1, cy - R * 0.3);
      ctx.quadraticCurveTo(cx - R * 0.5, cy + R * 0.3, cx + R * 0.2, h);
      ctx.fill();
      ctx.fillStyle = 'rgba(250, 246, 236, 0.95)';
      for (let i = 0; i < 40; i++) {
        const a = Math.PI * (1.05 + (i / 40) * 0.95);
        const rr = R * (0.85 + r() * 0.12);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * rr * 0.9 + R * 0.25, cy - R * 0.3 + Math.sin(a) * rr * 0.7, w * (0.004 + r() * 0.006), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    seal(ctx, w * 0.9, h * 0.05, w * 0.045);
  },

  dawn(ctx, w, h, r) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
    sky.addColorStop(0, '#5c6a9a');
    sky.addColorStop(0.55, '#e7a6a0');
    sky.addColorStop(1, '#f6d6a0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    const sx = w * (0.35 + r() * 0.3);
    const horizon = h * 0.62;
    const sun = ctx.createRadialGradient(sx, horizon, 0, sx, horizon, h * 0.35);
    sun.addColorStop(0, 'rgba(255, 236, 190, 1)');
    sun.addColorStop(0.18, 'rgba(255, 220, 160, 0.9)');
    sun.addColorStop(1, 'rgba(255, 200, 150, 0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, w, horizon);
    const sea = ctx.createLinearGradient(0, horizon, 0, h);
    sea.addColorStop(0, '#c99b9a');
    sea.addColorStop(1, '#3d4a72');
    ctx.fillStyle = sea;
    ctx.fillRect(0, horizon, w, h - horizon);
    for (let i = 0; i < 60; i++) {
      const y = horizon + (h - horizon) * Math.pow(r(), 1.3);
      const len = w * (0.02 + r() * 0.08) * (1 + (y - horizon) / h);
      const x = sx + (r() - 0.5) * w * 0.25 * (1 + (y - horizon) / (h - horizon));
      ctx.fillStyle = `rgba(255, 225, 175, ${0.25 + r() * 0.5})`;
      ctx.fillRect(x - len / 2, y, len, Math.max(1, h * 0.004));
    }
  },

  moon(ctx, w, h, r, art) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0d1a34');
    sky.addColorStop(0.6, '#33406e');
    sky.addColorStop(1, '#141e3c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    const horizon = h * (art.tall ? 0.7 : 0.64);
    const mx = w * (art.tall ? 0.5 : 0.3 + r() * 0.4);
    const my = horizon - h * (art.tall ? 0.3 : 0.28);
    const mr = Math.min(w, h) * (art.tall ? 0.22 : 0.14);
    const glow = ctx.createRadialGradient(mx, my, mr, mx, my, mr * 4);
    glow.addColorStop(0, 'rgba(255, 240, 205, 0.4)');
    glow.addColorStop(1, 'rgba(255, 240, 205, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fbf0d2';
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();
    if (art.seed === 31) {
      ctx.fillStyle = '#1b2649';
      ctx.beginPath();
      ctx.arc(mx + mr * 0.55, my - mr * 0.1, mr * 0.95, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#0c1630';
    ctx.fillRect(0, horizon, w, h - horizon);
    for (let i = 0; i < 90; i++) {
      const d = Math.pow(r(), 1.2);
      const y = horizon + 4 + (h - horizon) * d;
      const len = w * (0.01 + r() * 0.05) * (0.6 + d);
      const x = mx + (r() - 0.5) * mr * 2.2 * (0.6 + d);
      ctx.fillStyle = `rgba(251, 236, 200, ${0.25 + r() * 0.6})`;
      ctx.fillRect(x - len / 2, y, len, Math.max(1, h * 0.003));
    }
    if (art.tall) {
      // The moon gate: a dark wall with a round opening.
      ctx.fillStyle = '#e8ddc6';
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.arc(w / 2, h * 0.48, w * 0.38, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.strokeStyle = '#5a2620';
      ctx.lineWidth = w * 0.02;
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.48, w * 0.38, 0, Math.PI * 2);
      ctx.stroke();
      seal(ctx, w * 0.78, h * 0.86, w * 0.1);
    }
  },

  field(ctx, w, h, r, art) {
    const [a, b, c] = art.colors || ['#2b3c5a', '#c9a46a', '#efe3c8'];
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, w, h);
    // Soft-edged blocks of colour, built from many faint layers so it works without canvas filters.
    const block = (color, x, y, bw, bh) => {
      ctx.fillStyle = color;
      for (let i = 0; i < 14; i++) {
        const g = i * Math.min(w, h) * 0.004;
        ctx.globalAlpha = 0.09;
        ctx.fillRect(x + g, y + g, bw - g * 2, bh - g * 2);
      }
      ctx.globalAlpha = 1;
    };
    const split = 0.45 + r() * 0.2;
    block(a, w * 0.08, h * 0.07, w * 0.84, h * (split - 0.1));
    block(b, w * 0.08, h * (split + 0.04), w * 0.84, h * (0.88 - split));
    for (let i = 0; i < (w * h) / 500; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${r() * 0.04})`;
      ctx.fillRect(r() * w, r() * h, 2, 2);
    }
  },
};

// Returns a canvas with the work drawn on it, sized to the work's aspect ratio.
export function paint(art, aspect) {
  const long = 1024;
  const w = Math.round(aspect >= 1 ? long : long * aspect);
  const h = Math.round(aspect >= 1 ? long / aspect : long);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const draw = styles[art.style] || styles.field;
  draw(canvas.getContext('2d'), w, h, rng(art.seed || 1), art);
  return canvas;
}

// Small wall label next to each work.
export function label(title, year) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f7f3ea';
  ctx.fillRect(0, 0, 512, 180);
  ctx.fillStyle = '#26221d';
  ctx.font = "54px 'Songti SC', 'Noto Serif SC', Georgia, serif";
  ctx.fillText(title, 28, 82, 456);
  ctx.fillStyle = '#7a7466';
  ctx.font = "34px 'Songti SC', Georgia, serif";
  ctx.fillText(`Livy · ${year}`, 28, 140);
  return canvas;
}
