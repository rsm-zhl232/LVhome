// A walk grid over the floor plus A* search. Blocked cells come from furniture and wall footprints,
// grown by the walker's radius so paths keep a little distance from everything.

export class NavGrid {
  constructor(bounds, blockers, { cell = 0.2, radius = 0.3 } = {}) {
    this.cell = cell;
    this.x0 = bounds.x0;
    this.z0 = bounds.z0;
    this.cols = Math.ceil((bounds.x1 - bounds.x0) / cell);
    this.rows = Math.ceil((bounds.z1 - bounds.z0) / cell);
    this.blocked = new Uint8Array(this.cols * this.rows);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const [x, z] = this.center(c, r);
        const edge = x < bounds.x0 + radius || x > bounds.x1 - radius || z < bounds.z0 + radius || z > bounds.z1 - radius;
        const hit = edge || blockers.some(([bx0, bz0, bx1, bz1]) =>
          x > bx0 - radius && x < bx1 + radius && z > bz0 - radius && z < bz1 + radius);
        this.blocked[r * this.cols + c] = hit ? 1 : 0;
      }
    }
  }

  center(c, r) {
    return [this.x0 + (c + 0.5) * this.cell, this.z0 + (r + 0.5) * this.cell];
  }

  cellOf(x, z) {
    return [Math.floor((x - this.x0) / this.cell), Math.floor((z - this.z0) / this.cell)];
  }

  isFree(c, r) {
    return c >= 0 && r >= 0 && c < this.cols && r < this.rows && !this.blocked[r * this.cols + c];
  }

  walkable(x, z) {
    const [c, r] = this.cellOf(x, z);
    return this.isFree(c, r);
  }

  // The free cell closest to (x, z), searched in growing rings.
  nearestFree(x, z) {
    const [c0, r0] = this.cellOf(x, z);
    if (this.isFree(c0, r0)) return [c0, r0];
    for (let ring = 1; ring < 30; ring++) {
      let best = null;
      let bestD = Infinity;
      for (let dc = -ring; dc <= ring; dc++) {
        for (let dr = -ring; dr <= ring; dr++) {
          if (Math.max(Math.abs(dc), Math.abs(dr)) !== ring) continue;
          if (!this.isFree(c0 + dc, r0 + dr)) continue;
          const d = dc * dc + dr * dr;
          if (d < bestD) {
            bestD = d;
            best = [c0 + dc, r0 + dr];
          }
        }
      }
      if (best) return best;
    }
    return null;
  }

  clampToFree(x, z) {
    const cell = this.nearestFree(x, z);
    return cell ? this.center(...cell) : [x, z];
  }

  findPath(fromX, fromZ, toX, toZ) {
    const start = this.nearestFree(fromX, fromZ);
    const goal = this.nearestFree(toX, toZ);
    if (!start || !goal) return null;
    const { cols } = this;
    const idx = (c, r) => r * cols + c;
    const startI = idx(...start);
    const goalI = idx(...goal);
    const g = new Float32Array(this.cols * this.rows).fill(Infinity);
    const came = new Int32Array(this.cols * this.rows).fill(-1);
    const closed = new Uint8Array(this.cols * this.rows);
    const open = new MinHeap();
    const h = (c, r) => Math.hypot(c - goal[0], r - goal[1]);
    g[startI] = 0;
    open.push(startI, h(...start));
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    while (open.size) {
      const cur = open.pop();
      if (cur === goalI) break;
      if (closed[cur]) continue;
      closed[cur] = 1;
      const c = cur % cols;
      const r = (cur - c) / cols;
      for (const [dc, dr] of dirs) {
        const nc = c + dc;
        const nr = r + dr;
        if (!this.isFree(nc, nr)) continue;
        // no corner cutting
        if (dc && dr && (!this.isFree(c + dc, r) || !this.isFree(c, r + dr))) continue;
        const ni = idx(nc, nr);
        const cost = g[cur] + (dc && dr ? Math.SQRT2 : 1);
        if (cost < g[ni]) {
          g[ni] = cost;
          came[ni] = cur;
          open.push(ni, cost + h(nc, nr));
        }
      }
    }
    if (came[goalI] === -1 && goalI !== startI) return null;
    const cells = [];
    for (let i = goalI; i !== -1; i = came[i]) {
      cells.push(i);
      if (i === startI) break;
    }
    cells.reverse();
    const pts = cells.map((i) => this.center(i % cols, Math.floor(i / cols)));
    pts[pts.length - 1] = this.walkable(toX, toZ) ? [toX, toZ] : pts[pts.length - 1];
    return this.smooth([[fromX, fromZ], ...pts.slice(1)]);
  }

  // Drop waypoints that have a clear line of sight past them.
  smooth(pts) {
    if (pts.length < 3) return pts;
    const out = [pts[0]];
    let anchor = 0;
    for (let i = 2; i < pts.length; i++) {
      if (!this.lineFree(pts[anchor], pts[i])) {
        out.push(pts[i - 1]);
        anchor = i - 1;
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  lineFree([ax, az], [bx, bz]) {
    const steps = Math.ceil(Math.hypot(bx - ax, bz - az) / (this.cell * 0.5));
    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      if (!this.walkable(ax + (bx - ax) * t, az + (bz - az) * t)) return false;
    }
    return true;
  }
}

class MinHeap {
  constructor() {
    this.items = [];
    this.prio = [];
  }
  get size() {
    return this.items.length;
  }
  push(item, p) {
    const { items, prio } = this;
    items.push(item);
    prio.push(p);
    let i = items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (prio[parent] <= prio[i]) break;
      [items[i], items[parent]] = [items[parent], items[i]];
      [prio[i], prio[parent]] = [prio[parent], prio[i]];
      i = parent;
    }
  }
  pop() {
    const { items, prio } = this;
    const top = items[0];
    const lastI = items.pop();
    const lastP = prio.pop();
    if (items.length) {
      items[0] = lastI;
      prio[0] = lastP;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < items.length && prio[l] < prio[m]) m = l;
        if (r < items.length && prio[r] < prio[m]) m = r;
        if (m === i) break;
        [items[i], items[m]] = [items[m], items[i]];
        [prio[i], prio[m]] = [prio[m], prio[i]];
        i = m;
      }
    }
    return top;
  }
}
