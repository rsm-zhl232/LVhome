// Floor plans of the flower boat, one per deck, bottom to top. Units are metres.
// Each deck is centred on the courtyard (天井) at x = 0, z = 0. x runs bow (+) to stern (-),
// z runs from the back wall (-) to the pier side (+), which faces the camera.
//
// size: half-width and half-depth inside the walls. Items:
//   type   which builder in props.js draws it
//   at     [x, z] centre;  rot  turn in quarter turns
//   foot   [w, d] what the walk grid blocks (before turning); omit for things you can walk past
//   id     what clicking it opens (PANELS / LOFT in content.js, or 'flight', 'stairs', 'livy')
//   spot   where the visitor stands to look at it
// After moving anything, check that every spot, the stairs and the arrival point are reachable.

export const BASE = 1.4; // deck 01 floor height above the water
export const H = 3.4; // storey height
export const WALL_H = 3.0; // inside wall height
export const ATRIUM = [1.6, 1.2]; // half-size of the courtyard opening

const stairs = (ax, az) => ({ type: 'stairs', at: [-ax + 1.8, -az + 0.75], foot: [3.0, 1.3], id: 'stairs', spot: [-ax + 3.9, -az + 1.0] });
const arrive = (ax, az) => [-ax + 3.9, -az + 1.9];

export const PLANS = [
  // Deck 01 · Origin · Guangzhou
  {
    size: [10, 6],
    walls: { inner: '#e9dcc0', dado: '#4f7a62', floor: '#6d4a32' },
    atrium: 'pond',
    door: [0, 6],
    entry: [0, 4.6],
    arrive: arrive(10, 6),
    butterfly: [2.6, -5.5, 2.0],
    items: [
      stairs(10, 6),
      { type: 'memoryWindow', at: [0, -5.9], id: 'gz-window', spot: [0, -4.5], seed: 1 },
      { type: 'memoryWindow', at: [2.6, -5.9], id: 'gz-window', spot: [2.6, -4.5], seed: 2 },
      { type: 'memoryWindow', at: [5.2, -5.9], id: 'gz-window', spot: [5.2, -4.5], seed: 3 },
      { type: 'schoolDesk', at: [-7.4, 1.6], foot: [1.3, 0.8], id: 'gz-desk', spot: [-7.4, 2.9] },
      { type: 'uniform', at: [-8.9, 0.1], foot: [0.6, 0.5], id: 'gz-desk', spot: [-7.6, 0.1] },
      { type: 'banyan', at: [7.6, -3.6], foot: [1.6, 1.6] },
      { type: 'rattanBench', at: [-3.6, 4.9], foot: [2.0, 0.6] },
      { type: 'pottedPlant', at: [9.2, 5.2], foot: [0.6, 0.6] },
      { type: 'pottedPlant', at: [-9.2, 5.2], foot: [0.6, 0.6] },
      { type: 'lowTable', at: [4.6, 3.0], foot: [1.2, 0.8] },
    ],
  },
  // Deck 02 · Passage · Oxford
  {
    size: [9, 5.4],
    walls: { inner: '#c9cfc4', dado: '#6e7b6c', floor: '#3e3229' },
    atrium: 'rail',
    arrive: arrive(9, 5.4),
    butterfly: [5.6, -4.1, 1.6],
    items: [
      stairs(9, 5.4),
      { type: 'bookshelf', at: [-8.7, 1.0], rot: 1, foot: [3.6, 0.55], id: 'ox-library', spot: [-7.3, 1.0] },
      { type: 'readingTable', at: [-5.6, 1.4], foot: [1.4, 0.9], id: 'ox-library', spot: [-5.6, 2.8] },
      { type: 'greenhouse', at: [5.6, -4.1], foot: [4.0, 2.4], id: 'ox-greenhouse', spot: [5.6, -2.0] },
      { type: 'designTable', at: [5.4, 3.0], foot: [2.2, 1.0], id: 'ox-design', spot: [5.4, 1.6] },
      { type: 'dressForm', at: [7.9, 3.4], foot: [0.6, 0.6], id: 'ox-design', spot: [7.6, 2.2] },
      { type: 'stoneArch', at: [0, -5.3] },
      { type: 'pottedPlant', at: [-1.2, 4.8], foot: [0.6, 0.6] },
    ],
  },
  // Deck 03 · Convergence · HKU
  {
    size: [8, 4.9],
    walls: { inner: '#efe6d4', dado: '#8e2f2a', floor: '#5a3c2a' },
    atrium: 'rail',
    arrive: arrive(8, 4.9),
    butterfly: [0.6, 2.8, 1.2],
    items: [
      stairs(8, 4.9),
      { type: 'marketDesk', at: [-5.4, 1.4], foot: [2.2, 0.9], id: 'hku-market', spot: [-5.4, 2.8] },
      { type: 'chartBoard', at: [-7.85, 1.4], rot: 1, id: 'hku-market', spot: [-6.6, 3.2] },
      { type: 'screen', at: [-2.6, -3.6], rot: 1, foot: [1.8, 0.2] },
      { type: 'screen', at: [2.6, -3.6], rot: 1, foot: [1.8, 0.2] },
      { type: 'paintings', at: [5.2, -4.8], id: 'hku-image', spot: [5.2, -3.0] },
      { type: 'catalogueTable', at: [5.2, 1.6], foot: [1.8, 1.0], id: 'hku-image', spot: [5.2, 3.0] },
      { type: 'longTable', at: [0, 2.85], foot: [3.6, 0.7], id: 'hku-table', spot: [0, 4.0] },
    ],
  },
  // Deck 04 · Observatory · Penn and the Flight Room
  {
    size: [7.2, 4.5],
    walls: { inner: '#dcd8cf', dado: '#2f3a44', floor: '#3a2e27', glass: true },
    atrium: 'rail',
    arrive: arrive(7.2, 4.5),
    butterfly: [4.4, -3.3, 1.5],
    items: [
      stairs(7.2, 4.5),
      { type: 'researchTable', at: [-4.6, 1.9], foot: [2.0, 1.1], id: 'penn-desk', spot: [-4.6, 3.3] },
      { type: 'projection', at: [-7.15, 1.9], rot: 1, id: 'penn-desk', spot: [-5.9, 0.3] },
      { type: 'cityMap', at: [0, -4.45], id: 'penn-desk', spot: [0, -3.0] },
      { type: 'flightConsole', at: [4.4, -3.4], foot: [3.0, 1.4], id: 'flight', spot: [4.4, -1.8] },
      { type: 'captainChair', at: [4.4, -2.35] },
      { type: 'globe', at: [5.9, 2.9], foot: [0.8, 0.8], id: 'flight', spot: [4.8, 2.9] },
    ],
  },
  // Deck 05 · The Maker's Loft
  {
    size: [6, 4],
    walls: { inner: '#f7f1e6', dado: '#c9b08a', floor: '#a88560' },
    atrium: 'glass',
    arrive: arrive(6, 4),
    butterfly: [0, 0, 2.4],
    items: [
      stairs(6, 4),
      { type: 'drawers', at: [0.8, -3.6], foot: [1.8, 0.7], id: 'loft-drawers', spot: [0.8, -2.4] },
      { type: 'fabricLine', at: [4.0, -3.4], foot: [2.6, 0.5], id: 'loft-fabric', spot: [4.0, -2.2] },
      { type: 'standingMirror', at: [-5.6, 1.2], rot: 1, foot: [0.9, 0.5], id: 'loft-mirror', spot: [-4.4, 1.2] },
      { type: 'clothesRack', at: [3.7, 2.6], foot: [2.2, 0.6], id: 'loft-rack', spot: [3.7, 1.5] },
      { type: 'easel', at: [-2.6, 2.8], foot: [0.9, 0.7], id: 'loft-drawers', spot: [-2.6, 1.7] },
      { type: 'rattanChair', at: [-4.4, 3.1], foot: [0.8, 0.8] },
      { type: 'pottedPlant', at: [5.5, 0.2], foot: [0.6, 0.6] },
    ],
  },
  // Roof · The Water Mirror
  {
    size: [6, 4],
    walls: { floor: '#8c7a64' },
    roof: true,
    atrium: 'mirror',
    arrive: [-3.2, -1.9],
    butterfly: [0, 0, 1.2],
    items: [
      { type: 'hatch', at: [-4.6, -3.2], foot: [1.6, 1.0] },
      { type: 'standingMirror', at: [-2.4, -3.4], foot: [0.9, 0.5], id: 'mirror-final', spot: [-2.4, -2.2], big: true },
      { type: 'ticketStand', at: [3.4, -3.3], foot: [0.6, 0.5], id: 'mirror-ticket', spot: [3.4, -2.2] },
      { type: 'planter', at: [0, 3.55], foot: [5.0, 0.5] },
      { type: 'planter', at: [5.55, 0], rot: 1, foot: [4.6, 0.5] },
      { type: 'planter', at: [-5.55, 1.2], rot: 1, foot: [2.2, 0.5] },
    ],
    livy: [2.4, 1.9],
  },
];
