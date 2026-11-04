// All site copy lives here. Every visible string is { en, zh }.
// The works are samples drawn in code (art.js) until Livy sends her own: give a work
// `image: 'assets/art/xxx.jpg'` and it is hung instead of the drawn sample.

export const SITE = {
  owner: 'Livy',
  // TODO: Livy's wording was 海上青楼. 青楼 also reads as "brothel" in modern Chinese, so the draft
  // uses 海上楼阁 until she confirms which she wants.
  title: { en: 'A Pavilion on the Sea', zh: '海上楼阁' },
  kicker: { en: "Livy's gallery", zh: 'Livy 的画展' },
  tagline: { en: 'Four floors, four halls. You arrive by boat.', zh: '四层楼，四个展厅。要坐船进去。' },
  chris: 'https://lizhuojin.com',
};

export const UI = {
  board: { en: 'Board the boat', zh: '登船' },
  ticket: { en: 'One way · to the pavilion', zh: '单程 · 往海上楼阁' },
  direct: { en: 'Go straight in', zh: '直接进楼' },
  skip: { en: 'Skip', zh: '跳过' },
  outside: { en: 'Step outside', zh: '出楼观海' },
  ride: { en: 'Take the boat again', zh: '再坐一次船' },
  lang: { en: '中文', zh: 'EN' },
  sound: { en: 'Sound', zh: '声音' },
  chris: { en: 'Visit Chris', zh: '去 Chris 家' },
  hintHall: { en: 'Drag to look around · click a work to look closer · ↑ ↓ floors', zh: '拖动环顾 · 点画作近看 · ↑ ↓ 换楼层' },
  hintHallTouch: { en: 'Drag to look around · tap a work to look closer', zh: '拖动环顾 · 点画作近看' },
  hintOutside: { en: 'Drag to circle the pavilion · click a floor to go in', zh: '拖动绕楼一圈 · 点任意一层进去' },
  prev: { en: 'Previous', zh: '上一件' },
  next: { en: 'Next', zh: '下一件' },
  close: { en: 'Back to the hall', zh: '回到展厅' },
  up: { en: 'Upstairs', zh: '上楼' },
  down: { en: 'Downstairs', zh: '下楼' },
};

// Lines shown while the boat crosses; `at` is seconds into the ride.
export const RIDE = [
  { at: 0.8, text: { en: 'Calm sea tonight. Sit tight.', zh: '今晚风平浪静，坐稳了。' } },
  { at: 5.5, text: { en: 'Through the mist —', zh: '穿过薄雾——' } },
  { at: 10.5, text: { en: 'There it is.', zh: '楼到了。' } },
];

// One hall per floor, bottom to top. `size` is the work's size on the wall in metres.
// art.style: calligraphy | ink | waves | dawn | moon | field
export const HALLS = [
  {
    floor: '1F',
    name: { en: 'Prologue', zh: '序厅' },
    theme: { en: 'Into the Sea', zh: '入海' },
    intro: {
      en: 'Welcome ashore. This little tower floats on the sea — one hall per floor. Take your time going up.',
      zh: '欢迎上岸。这座小楼漂在海上，一层一个展厅，慢慢往上看。',
    },
    works: [
      { title: { en: 'The Moon Rises over the Sea', zh: '海上生明月' }, year: '2026', medium: { en: 'Ink on paper, hanging scroll', zh: '纸本水墨 · 立轴' }, size: [0.9, 2.2], art: { style: 'calligraphy', text: '海上生明月' }, note: { en: 'A line by Zhang Jiuling, hung by the door to welcome you in.', zh: '张九龄的句子，挂在门口，迎你进来。' } },
      { title: { en: 'Estuary', zh: '入海口' }, year: '2025', medium: { en: 'Acrylic on canvas', zh: '布面丙烯' }, size: [1.6, 1.2], art: { style: 'field', seed: 3, colors: ['#1f3b4d', '#c9a46a', '#e9dcc0'] }, note: { en: 'Where the river gives up and becomes the sea.', zh: '河流在这里放下自己，变成海。' } },
      { title: { en: 'First Light', zh: '初光' }, year: '2025', medium: { en: 'Oil on canvas', zh: '布面油画' }, size: [1.6, 1.2], art: { style: 'dawn', seed: 8 }, note: { en: 'The sea just before anyone else is awake.', zh: '所有人醒来之前的海。' } },
      { title: { en: 'Boat Ticket', zh: '船票' }, year: '2026', medium: { en: 'Mixed media', zh: '综合材料' }, size: [1.0, 1.3], art: { style: 'field', seed: 11, colors: ['#a3262a', '#efe3c8', '#2a2a2a'] }, note: { en: 'Kept from the crossing you just made.', zh: '你刚坐过的那趟船，留下的票根。' } },
    ],
  },
  {
    floor: '2F',
    name: { en: 'Hall One', zh: '第一展厅' },
    theme: { en: 'Tides', zh: '潮' },
    intro: { en: 'The sea never says the same thing twice.', zh: '海从来不说同一句话。' },
    works: [
      { title: { en: 'Great Wave', zh: '大浪' }, year: '2025', medium: { en: 'Woodblock-style print', zh: '木刻风版画' }, size: [2.0, 1.3], art: { style: 'waves', seed: 2 }, note: { en: 'For everyone who has stood on a pier in bad weather.', zh: '献给每个在坏天气里站过码头的人。' } },
      { title: { en: 'Low Tide', zh: '退潮' }, year: '2025', medium: { en: 'Print', zh: '版画' }, size: [1.3, 1.0], art: { style: 'waves', seed: 9, calm: true }, note: { en: 'What the water leaves behind.', zh: '水退下去以后留下的东西。' } },
      { title: { en: 'Salt', zh: '盐' }, year: '2024', medium: { en: 'Acrylic on canvas', zh: '布面丙烯' }, size: [1.3, 1.0], art: { style: 'field', seed: 5, colors: ['#d7dde0', '#7d97a6', '#f4f1ea'] }, note: { en: 'The colour of skin after a day at sea.', zh: '在海上待一整天之后，皮肤的颜色。' } },
      { title: { en: 'Morning Tide', zh: '晨潮' }, year: '2026', medium: { en: 'Oil on canvas', zh: '布面油画' }, size: [1.5, 1.1], art: { style: 'dawn', seed: 21 }, note: { en: 'Pink, then gold, then just water again.', zh: '先是粉，后是金，然后又只剩下水。' } },
      { title: { en: 'Undertow', zh: '暗流' }, year: '2024', medium: { en: 'Print', zh: '版画' }, size: [1.2, 1.6], art: { style: 'waves', seed: 14 }, note: { en: 'Calm on top. Not underneath.', zh: '上面平静，底下不是。' } },
    ],
  },
  {
    floor: '3F',
    name: { en: 'Hall Two', zh: '第二展厅' },
    theme: { en: 'Moon', zh: '月' },
    intro: { en: 'Upstairs the windows are round, so the moon has somewhere to sit.', zh: '楼上的窗是圆的，好让月亮有地方坐。' },
    works: [
      { title: { en: 'Moonrise', zh: '月出' }, year: '2025', medium: { en: 'Oil on canvas', zh: '布面油画' }, size: [1.8, 1.2], art: { style: 'moon', seed: 4 }, note: { en: 'The road the moon lays across the water.', zh: '月亮铺在海面上的那条路。' } },
      { title: { en: 'Moon Gate', zh: '月门' }, year: '2026', medium: { en: 'Ink on silk, hanging scroll', zh: '绢本水墨 · 立轴' }, size: [0.8, 1.9], art: { style: 'moon', seed: 12, tall: true }, note: { en: 'A round door you can only walk through at night.', zh: '一扇只有夜里才能穿过去的圆门。' } },
      { title: { en: 'Lantern', zh: '灯' }, year: '2025', medium: { en: 'Acrylic on canvas', zh: '布面丙烯' }, size: [1.1, 1.1], art: { style: 'field', seed: 7, colors: ['#1a1d33', '#c2452d', '#f0b763'] }, note: { en: 'Somebody left a light on for you.', zh: '有人为你留了一盏灯。' } },
      { title: { en: 'Half Moon', zh: '半月' }, year: '2024', medium: { en: 'Oil on canvas', zh: '布面油画' }, size: [1.1, 1.1], art: { style: 'moon', seed: 31 }, note: { en: 'Halfway is still a moon.', zh: '一半也还是月亮。' } },
    ],
  },
  {
    floor: '4F',
    name: { en: 'Hall Three', zh: '第三展厅' },
    theme: { en: 'Distant Hills', zh: '远山' },
    intro: { en: 'The top floor. From here the coast is only a line of ink.', zh: '顶楼。从这里看，海岸只剩一笔墨。' },
    works: [
      { title: { en: 'Distant Hills', zh: '远山' }, year: '2026', medium: { en: 'Ink on paper, hanging scroll', zh: '纸本水墨 · 立轴' }, size: [0.85, 2.1], art: { style: 'ink', seed: 6 }, note: { en: 'Mountains you can only see on very clear days.', zh: '只有很晴的日子才看得见的山。' } },
      { title: { en: 'Homeward Boat', zh: '归舟' }, year: '2025', medium: { en: 'Ink on paper', zh: '纸本水墨' }, size: [1.7, 1.0], art: { style: 'ink', seed: 15, wide: true }, note: { en: 'Every boat out here is going home.', zh: '这片海上的船，都在回家。' } },
      { title: { en: 'Mist', zh: '雾' }, year: '2024', medium: { en: 'Ink on paper, hanging scroll', zh: '纸本水墨 · 立轴' }, size: [0.85, 2.1], art: { style: 'ink', seed: 27 }, note: { en: 'Most of the painting is what is not painted.', zh: '画的大半，是没有画的地方。' } },
    ],
  },
];
