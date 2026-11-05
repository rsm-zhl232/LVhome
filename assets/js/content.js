// All site copy lives here. Every visible string is { en, zh }. Text is in Livy's own voice ("I").
// Source: her curatorial brief 《梦蝶之后：一艘驶向自我的花船》 and her CV (Nov 2026).
// Anything marked TODO is a draft or a gap waiting for Livy.

export const SITE = {
  owner: 'Livy',
  title: { en: 'After the Butterfly Dream', zh: '梦蝶之后' },
  subtitle: { en: 'A Boat Toward Becoming Livy', zh: '一艘驶向自我的花船' },
  kicker: { en: "Livy's floating museum", zh: 'Livy 的水上博物馆' },
  tagline: {
    en: 'This is not a portfolio of what I have done. It is a voyage through the places, choices and identities that have made me.',
    zh: '这不是一份履历，而是一场关于“我如何成为我”的航行。',
  },
  chris: 'https://lizhuojin.com',
};

export const PROFILE = {
  name: { en: 'Qiyuan (Livy) Li', zh: 'Livy · Qiyuan Li' },
  // Assembled at runtime so the address is not sitting in the page for scrapers.
  emailParts: ['liqiyuanlivy', 'outlook.com'],
  // TODO: LinkedIn URL (the CV has the word but no link).
  linkedin: '',
};

// The boat ticket on the opening screen.
export const TICKET = {
  vessel: { en: 'Vessel · The Livy', zh: '船名 · Livy 号' },
  route: { en: 'Route · From Memory to Becoming', zh: '航线 · 从记忆到成为' },
  destination: { en: 'Destination · Identity', zh: '目的地 · 自我' },
};

export const UI = {
  board: { en: 'Board the boat', zh: '登船' },
  direct: { en: 'Go straight aboard', zh: '直接上船' },
  pickLook: { en: 'Who is boarding?', zh: '谁来登船？' },
  skip: { en: 'Skip', zh: '跳过' },
  outside: { en: 'Step outside', zh: '出船看看' },
  inside: { en: 'Go back in', zh: '回到船里' },
  ride: { en: 'Take the boat again', zh: '再坐一次船' },
  lang: { en: '中文', zh: 'EN' },
  sound: { en: 'Sound', zh: '声音' },
  chris: { en: 'Visit Chris', zh: '去 Chris 家' },
  cv: { en: 'CV', zh: '简历' },
  close: { en: 'Close', zh: '关闭' },
  up: { en: 'Upstairs', zh: '上楼' },
  down: { en: 'Downstairs', zh: '下楼' },
  hint: { en: 'Click the floor to walk · click things to look closer · follow the butterfly upstairs', zh: '点地板走路 · 点物件看详情 · 跟着蝴蝶上楼' },
  hintTouch: { en: 'Tap the floor to walk · tap things · follow the butterfly', zh: '点地板走路 · 点物件 · 跟着蝴蝶' },
  hintOutside: { en: 'Drag to circle the boat · click a deck to go in', zh: '拖动绕船一圈 · 点任意一层进去' },
  followUp: { en: 'The stairs are lit. Follow the butterfly up.', zh: '楼梯亮了，跟着蝴蝶上楼。' },
  stairsUp: { en: 'Stairs up', zh: '上楼的楼梯' },
  topDeck: { en: 'This is the top. Use the deck map to go anywhere.', zh: '已经到顶了，可以用右边的楼层图去任意一层。' },
  experience: { en: 'Experience', zh: '经历' },
  summary: { en: 'Professional summary', zh: '简历版' },
  email: { en: 'Email me', zh: '给我写信' },
  copy: { en: 'Copy', zh: '复制' },
  copied: { en: 'Copied', zh: '已复制' },
  returnTo: { en: 'Return to any deck', zh: '回到任意一层' },
  viewCv: { en: 'View my CV', zh: '看我的简历' },
  contact: { en: 'Contact Livy', zh: '联系 Livy' },
  soon: { en: 'Coming soon', zh: '即将展出' },
};

// Lines shown while the little boat crosses to the flower boat; `at` is seconds into the ride.
export const RIDE = [
  { at: 0.8, text: { en: 'Calm water tonight. Keep your ticket.', zh: '今晚水很静，船票拿好。' } },
  { at: 5.5, text: { en: 'A butterfly is flying ahead of us —', zh: '前面有一只蝴蝶在飞——' } },
  { at: 10.5, text: { en: 'There she is: the flower boat.', zh: '花船到了。' } },
];

// One entry per deck, bottom to top. `butterfly` is how the butterfly looks on that deck.
export const DECKS = [
  {
    id: 'origin',
    no: 'Deck 01',
    name: { en: 'Origin', zh: '起点' },
    place: { en: 'Guangzhou', zh: '广州' },
    years: '2013–2016',
    question: { en: 'Where did I begin?', zh: '我从哪里开始？' },
    intro: {
      en: 'The lowest deck, closest to the water. Wooden windows, rain, the shade of banyan trees: this is where I started.',
      zh: '船的最底层，离水最近。木窗、雨声、榕树的影子：我从这里开始。',
    },
    butterfly: 'ink',
  },
  {
    id: 'passage',
    no: 'Deck 02',
    name: { en: 'Passage', zh: '离岸' },
    place: { en: 'Oxford', zh: '牛津' },
    years: '2016–2021',
    question: { en: 'Leaving, adapting, remaking myself.', zh: '离开、适应、重新塑造自己。' },
    intro: {
      en: 'Grey-green, rain, stone and glass. A boarding-school corridor, a greenhouse, a library and my first design table.',
      zh: '灰绿色、雨水、石墙和玻璃。寄宿学校的走廊、温室、图书馆，还有我的第一张设计台。',
    },
    butterfly: 'embroidery',
  },
  {
    id: 'convergence',
    no: 'Deck 03',
    name: { en: 'Convergence', zh: '汇合' },
    place: { en: 'The University of Hong Kong', zh: '香港大学' },
    years: '2021–2025',
    question: { en: 'How value is created, and how it is perceived.', zh: '价值如何被创造，又如何被看见。' },
    intro: {
      en: 'Two rooms around one courtyard: the Market Room on one side, the Image Room on the other. Start from either; they meet in the middle.',
      zh: '一个天井，两间屋：一边是市场之屋，一边是图像之屋。从哪边开始都行，最后都会在中间汇合。',
    },
    butterfly: 'glass',
  },
  {
    id: 'observatory',
    no: 'Deck 04',
    name: { en: 'Observatory', zh: '远望' },
    place: { en: 'Penn · and my work', zh: '宾大 · 职业' },
    years: '2025–2026',
    question: { en: 'From markets to systems.', zh: '从市场，看向制度。' },
    intro: {
      en: 'A research room built on a classical boat: glass, maps, policy papers. At the back is the Flight Room, where my working life is kept.',
      zh: '一间建在古典花船上的研究观察室：玻璃墙、地图、政策文件。后面是飞行舱，放着我的职业档案。',
    },
    butterfly: 'digital',
  },
  {
    id: 'loft',
    no: 'Deck 05',
    name: { en: "The Maker's Loft", zh: '创作阁楼' },
    place: { en: 'What I make', zh: '我做的东西' },
    years: '',
    question: { en: 'How I create, observe and express.', zh: '我如何创造、观察和表达。' },
    intro: {
      en: 'The brightest, most private room. Sketches, fabric, a mirror and a rail of clothes. Open the drawers.',
      zh: '最明亮、最私人的一层。草图、布料、镜子和一排衣架。拉开抽屉看看。',
    },
    butterfly: 'light',
  },
  {
    id: 'mirror',
    no: 'Roof',
    name: { en: 'The Water Mirror', zh: '水镜台' },
    place: { en: 'An unfinished identity', zh: '未完成的身份' },
    years: '',
    question: { en: 'Where the butterfly flies out.', zh: '蝴蝶从这里飞出去。' },
    intro: {
      en: 'Open sky, still water, low flowers. From here you can look back down at every deck.',
      zh: '开阔的天空、静止的水面、低矮的花。从这里可以回望整艘船的每一层。',
    },
    butterfly: 'light',
  },
];

// What each object on the boat opens. Body blocks: { p }, { h }, { list }, { quote }, { meta }.
// The id matches `id` on the object in decks.js.
export const PANELS = {
  // --- Deck 01 · Guangzhou -----------------------------------------------------------------
  'gz-window': {
    kicker: { en: 'Deck 01 · Guangzhou · 2013–2016', zh: '第一层 · 广州 · 2013–2016' },
    title: { en: 'Rain on wooden windows', zh: '木窗上的雨' },
    body: [
      { p: { en: 'Before I travelled anywhere, there was Guangzhou: humid air, rain on the windows, banyan shade across the street, the city blurred in the water.', zh: '在去任何地方之前，先有广州：潮湿的空气，打在窗上的雨，街对面榕树的影子，倒映在水里、看不太清的城市。' } },
      { p: { en: 'Each window on this deck holds a memory. This is the question the whole boat starts from: where did I begin?', zh: '这一层的每扇窗都是一段记忆。整艘船从这个问题开始：我从哪里开始？' } },
      // TODO: Livy's own Guangzhou memories (one per window).
    ],
  },
  'gz-desk': {
    kicker: { en: 'Deck 01 · Guangzhou', zh: '第一层 · 广州' },
    title: { en: 'An old school desk', zh: '一张旧课桌' },
    body: [
      { p: { en: 'A school uniform, a pile of textbooks, a desk with years of pencil marks. My school days in Guangzhou, 2013 to 2016.', zh: '一件校服、一摞课本、一张写满铅笔印的课桌。2013 到 2016 年，我在广州的上学时光。' } },
      // TODO: school name and what Livy wants to say about these years.
    ],
  },
  'atrium': {
    kicker: { en: 'The courtyard', zh: '中央天井' },
    title: { en: 'Zhuangzi dreamed he was a butterfly', zh: '庄周梦蝶' },
    body: [
      { p: { en: 'Zhuangzi dreamed he was a butterfly, and woke unsure whether he was a man who had dreamed of being a butterfly, or a butterfly now dreaming of being a man.', zh: '庄周梦见自己变成了蝴蝶，醒来以后，不知道是庄周梦见了蝴蝶，还是蝴蝶梦见了庄周。' } },
      { p: { en: 'I have kept changing between cities, schools and identities. So which one is really me? Am I myself, or a dream made of all of these?', zh: '我一直在不同的城市、学校和身份之间变化。那么哪一个才是真正的我？我是我自己，还是由这些经历共同构成的一个梦？' } },
      { p: { en: 'This courtyard runs through the whole boat. Plants hang down it, water sits at the bottom, and from every deck you can see where you are.', zh: '这个天井贯穿整艘船。植物从上面垂下来，最底下是水，从每一层都能看到自己在哪里。' } },
    ],
  },

  // --- Deck 02 · Oxford --------------------------------------------------------------------
  'ox-library': {
    kicker: { en: 'Deck 02 · Oxford · 2016–2021', zh: '第二层 · 牛津 · 2016–2021' },
    title: { en: 'Headington School', zh: 'Headington School' },
    body: [
      { meta: { en: 'Oxford, UK · GCSE · A-Level', zh: '英国牛津 · GCSE · A-Level' } },
      { p: { en: 'I left home for a boarding school in Oxford. Stone walls, long corridors, rain, a library with dark wood shelves.', zh: '我离开家，去了牛津的一所寄宿学校。石墙、长长的走廊、雨，还有深色木书架的图书馆。' } },
      { p: { en: 'This is where I did my GCSEs and A-Levels, and learned to grow up between two cultures.', zh: '我在这里读完了 GCSE 和 A-Level，也在这里学会了在两种文化之间长大。' } },
      // TODO: subjects / grades if Livy wants them here.
    ],
  },
  'ox-greenhouse': {
    kicker: { en: 'Deck 02 · Oxford', zh: '第二层 · 牛津' },
    title: { en: 'The greenhouse', zh: '温室' },
    body: [
      { p: { en: 'A Nanyang greenhouse inside an English school. Plants from somewhere warm, growing behind glass in a cold, wet place: that was how those years felt.', zh: '英式学校里的一间南洋温室。来自温暖地方的植物，在一个又冷又湿的地方、隔着玻璃生长：那几年就是这种感觉。' } },
      { p: { en: 'Leaving, adapting, remaking myself.', zh: '离开、适应、重新塑造自己。' } },
    ],
  },
  'ox-design': {
    kicker: { en: 'Deck 02 · Oxford', zh: '第二层 · 牛津' },
    title: { en: 'My first design table', zh: '我的第一张设计台' },
    body: [
      { p: { en: 'A dress form, a sewing machine, pinned paper patterns. In Oxford I started designing clothes, and these are my early pieces.', zh: '一个人台、一台缝纫机、别着针的纸样。我在牛津开始做服装设计，这里放的是我早期的作品。' } },
      { soon: true },
      // TODO: photos of Livy's early fashion work.
    ],
  },

  // --- Deck 03 · HKU -----------------------------------------------------------------------
  'hku-market': {
    kicker: { en: 'Deck 03 · The Market Room', zh: '第三层 · 市场之屋' },
    title: { en: 'Economics, marketing, finance', zh: '经济、市场、金融' },
    body: [
      { meta: { en: 'The University of Hong Kong · Bachelor of Economics · Sept 2021 – Jun 2025', zh: '香港大学 · 经济学学士 · 2021 年 9 月 – 2025 年 6 月' } },
      { p: { en: 'In Hong Kong I studied economics, with a minor in Marketing: how markets work, and how companies create value.', zh: '在香港，我读经济学，辅修市场营销：市场怎么运转，公司怎么创造价值。' } },
      { h: { en: 'Coursework', zh: '相关课程' } },
      { list: { en: ['Intermediate Macroeconomics', 'Intermediate Microeconomics', 'Corporate Finance', 'Portfolio Management'], zh: ['中级宏观经济学', '中级微观经济学', '公司金融', '投资组合管理'] } },
    ],
  },
  'hku-image': {
    kicker: { en: 'Deck 03 · The Image Room', zh: '第三层 · 图像之屋' },
    title: { en: 'Art history and visual culture', zh: '艺术史与视觉文化' },
    body: [
      { meta: { en: 'The University of Hong Kong · Minor in Arts History', zh: '香港大学 · 辅修艺术史' } },
      { p: { en: 'On the other side of the courtyard: exhibition catalogues, paintings, brands and images. My second minor was Arts History.', zh: '天井的另一边：展览图录、绘画、品牌和图像。我的第二个辅修是艺术史。' } },
      { p: { en: 'My earlier exhibition idea was about butterflies: how short life is, and how it changes and transforms. This boat grew out of it.', zh: '我之前做过一个关于蝴蝶的策展：生命的短暂、变化和转化。这艘船就是从那里长出来的。' } },
    ],
  },
  'hku-table': {
    kicker: { en: 'Deck 03 · Where the rooms meet', zh: '第三层 · 两间屋的交汇处' },
    title: { en: 'The long table', zh: '中央长桌' },
    body: [
      { quote: { en: 'I became interested in both how value is created and how value is perceived.', zh: '我开始同时关心两件事：价值如何被创造，以及价值如何被看见。' } },
      { p: { en: 'This deck is where my identity took shape: someone who understands economics and business, and art and culture, at the same time.', zh: '这一层是我身份形成的中心：一个同时理解经济、商业、艺术和文化的我。' } },
    ],
  },

  // --- Deck 04 · Penn + Flight Room --------------------------------------------------------
  'penn-desk': {
    kicker: { en: 'Deck 04 · The research room', zh: '第四层 · 研究室' },
    title: { en: 'University of Pennsylvania', zh: '宾夕法尼亚大学' },
    body: [
      { meta: { en: 'International Master of Public Administration · Philadelphia · Jun 2025 – Jun 2026', zh: '国际公共管理硕士 · 费城 · 2025 年 6 月 – 2026 年 6 月' } },
      { p: { en: 'At Penn my view widened from companies and markets to institutions, policy and whole social systems.', zh: '在宾大，我的视角从公司和市场，扩大到了制度、政策和整个社会系统。' } },
      { h: { en: 'Coursework', zh: '相关课程' } },
      { list: { en: ['Strategic Economic Analysis', 'Strategic Management', 'Quantitative Decision-Making'], zh: ['战略经济分析', '战略管理', '量化决策'] } },
    ],
  },
  'mirror-final': {
    kicker: { en: 'Roof · The Water Mirror', zh: '船顶 · 水镜台' },
    title: { en: 'An unfinished identity', zh: '未完成的身份' },
    body: [
      { quote: { en: 'I entered this boat looking for a fixed identity. I leave with a constellation of places, disciplines and unfinished questions.', zh: '我登上这艘船，是想找到一个固定的身份。离开时，我带走的是一片由地点、学科和未完成的问题组成的星座。' } },
      { final: true },
    ],
  },
  'mirror-ticket': {
    kicker: { en: 'Roof · The Water Mirror', zh: '船顶 · 水镜台' },
    title: { en: 'A blank ticket', zh: '一张空白船票' },
    body: [
      { p: { en: 'No route, no destination yet. The next part of the voyage is still to be written.', zh: '还没有航线，也还没有目的地。下一段航程还没写。' } },
      { final: true },
    ],
  },
};

// The Maker's Loft. Each piece of furniture opens one part of the design work.
// TODO: Livy's sketches, fabrics and finished pieces (images go in assets/art/).
export const LOFT = {
  'loft-drawers': {
    title: { en: 'Sketches', zh: '草图' },
    hint: { en: 'Pull open the drawers', zh: '拉开抽屉' },
    text: { en: 'My high-school fashion sketches live in these drawers.', zh: '高中时的服装设计草图，都放在这几个抽屉里。' },
    art: { style: 'ink', seed: 6 },
  },
  'loft-fabric': {
    title: { en: 'Fabric and inspiration', zh: '布料与灵感' },
    hint: { en: 'Touch the fabric', zh: '摸摸布料' },
    text: { en: 'The fabrics I chose, and where the ideas came from.', zh: '我选的布料，还有灵感从哪里来。' },
    art: { style: 'field', seed: 11, colors: ['#a3262a', '#efe3c8', '#2a2a2a'] },
  },
  'loft-mirror': {
    title: { en: 'Finished pieces', zh: '成品' },
    hint: { en: 'Look in the mirror', zh: '照照镜子' },
    text: { en: 'What the sketches became.', zh: '草图最后变成的样子。' },
    art: { style: 'dawn', seed: 8 },
  },
  'loft-rack': {
    title: { en: 'Notes on each piece', zh: '作品说明' },
    hint: { en: 'Look along the rail', zh: '看看衣架' },
    text: { en: 'What each piece is, and what I would still like to make.', zh: '每件作品是什么，还有我以后还想做的东西。' },
    art: { style: 'moon', seed: 4 },
  },
};

// The Flight Room console: one heading per part of my working life.
export const CAREER = [
  {
    dir: { en: 'North', zh: '北' },
    org: { en: 'Financial Street Securities', zh: '金融街证券' },
    role: { en: 'Investment Research Intern, Asset Management Division', zh: '资产管理部 · 投资研究实习生' },
    place: { en: 'Beijing', zh: '北京' },
    period: 'Dec 2025 – Jan 2026',
    memory: { en: 'Beijing: portfolios and sector weights', zh: '北京：投资组合与行业权重' },
    story: {
      en: 'In Beijing I sat with an asset management team and watched an equity portfolio week by week: which sectors were winning, where the drawdowns were, which earnings were coming. My job was to turn all of that into something a senior investor could read in a few minutes and decide on.',
      zh: '在北京，我跟着资产管理团队，一周一周地盯一个股票组合：哪些行业在跑赢，回撤在哪里，接下来有哪些业绩催化剂。我的工作是把这些整理成资深投资人几分钟就能看完、能拿来做决定的东西。',
    },
    bullets: {
      en: [
        'Monitored equity portfolio performance across technology, consumer, industrials and financials, tracking benchmark returns, sector allocation, drawdowns and earnings catalysts for weekly portfolio reviews.',
        'Ran relative-value analysis on listed holdings using valuation multiples, earnings revisions, margin trends and peer benchmarking, identifying 12% upside across outperforming sectors for tactical allocation views.',
        'Built portfolio exposure summaries by sector, market cap and theme, analysing concentration risk, factor sensitivity and benchmark deviation; improved risk-return review efficiency by 25%.',
        'Prepared investment committee materials on equity allocation, turning fundamentals, valuation signals, catalysts and downside scenarios into concise recommendations.',
      ],
      zh: [
        '跟踪科技、消费、工业和金融板块的股票组合表现，监测基准收益、行业配置、回撤和业绩催化剂，支持每周组合复盘。',
        '用估值倍数、盈利预测调整、利润率趋势和同业对比，对持仓做相对价值分析，在跑赢的板块中找到 12% 的上行空间，支持战术配置观点。',
        '按行业、市值和投资主题做组合敞口汇总，分析集中度风险、因子敏感度和基准偏离，使风险收益复盘效率提升 25%。',
        '为投委会准备股票配置材料，把基本面、估值信号、催化剂和下行情景整理成简明的建议。',
      ],
    },
  },
  {
    dir: { en: 'West', zh: '西' },
    org: { en: 'GF Securities', zh: '广发证券' },
    role: { en: 'Equity Research Intern, Machinery Group', zh: '机械组 · 行业研究实习生' },
    place: { en: 'Shanghai', zh: '上海' },
    period: 'Jan 2024 – Apr 2024',
    memory: { en: 'Shanghai: energy research and oil data', zh: '上海：能源研究与油气数据' },
    story: {
      en: 'In Shanghai I followed US shale oil from a long way off: rigs, drilled-but-uncompleted wells, production guidance, how productive each well was. Out of the numbers came a view that supply was tighter than it looked.',
      zh: '在上海，我隔着很远去看美国页岩油：钻机数量、已钻未完井、产量指引、单井产能。从这些数字里，我得出了供给比看上去更紧的判断。',
    },
    bullets: {
      en: [
        'Assessed US shale oil supply by tracking drilling activity, DUC inventory, production guidance and well productivity, identifying structural tightness that supported 5% upside in earnings visibility.',
        'Benchmarked listed shale producers on production growth, lifting cost, reserve life, leverage and free-cash-flow yield to identify outperformers for sector allocation.',
        'Built research summaries on oilfield services and shale operators, analysing the capex cycle, rig demand, margin expansion and commodity price sensitivity; improved portfolio review efficiency by 20%.',
        'Developed sector outlook materials on shale oil covering supply-demand, crude price scenarios, cost inflation and downside risks for energy allocation decisions.',
      ],
      zh: [
        '跟踪钻井活动、DUC 库存、产量指引和单井产能，评估美国页岩油供给，发现结构性偏紧，支撑盈利可见度 5% 的上行空间。',
        '从产量增速、开采成本、储量寿命、杠杆和自由现金流收益率等维度对比上市页岩油公司，筛选跑赢标的，支持行业配置。',
        '撰写油服和页岩油公司研究摘要，分析资本开支周期、钻机需求、利润率扩张和大宗价格敏感度，使组合复盘效率提升 20%。',
        '制作页岩油行业展望材料，涵盖供需、油价情景、成本通胀和下行风险，支持能源板块配置决策。',
      ],
    },
  },
  {
    dir: { en: 'South', zh: '南' },
    org: { en: 'Deloitte', zh: '德勤' },
    role: { en: 'Strategy Consulting Intern', zh: '战略咨询实习生' },
    place: { en: 'Beijing', zh: '北京' },
    period: 'Jun 2023 – Sept 2023',
    memory: { en: 'Beijing: policy and strategy', zh: '北京：政策与战略研究' },
    story: {
      en: 'At Deloitte two of my worlds met. I read more than two hundred papers and reports on intangible cultural heritage, looking at how culture becomes a business, and I read national policy to see where the money and attention were going.',
      zh: '在德勤，我的两个世界碰到了一起。我读了两百多篇关于非物质文化遗产的论文和报告，看文化怎样变成生意；也读国家政策，看资金和注意力在往哪里去。',
    },
    bullets: {
      en: [
        'Synthesised 200+ academic articles and industry reports on intangible cultural heritage, identifying commercialisation trends, policy support and investable themes across consumer, tourism and digital content.',
        "Analysed China's 14th Five-Year Plan and high-quality development policies, identifying AI, quantum computing and semiconductor opportunities, with R&D spending rising 7% a year across strategic emerging industries.",
        'Built thematic investment frameworks mapping policy priorities, growth drivers, competitive landscapes and commercialisation paths into sector allocation insights for client discussions.',
        'Prepared executive research materials on policy-driven opportunities: market size, regulatory catalysts, funding support and downside risks.',
      ],
      zh: [
        '梳理 200 多篇关于非物质文化遗产的学术论文和行业报告，总结消费、文旅和数字内容领域的商业化趋势、政策支持机制和可投资主题。',
        '分析“十四五”规划和高质量发展相关政策，识别人工智能、量子计算和半导体领域的机会；战略性新兴产业研发投入年均增长 7%。',
        '搭建主题投资框架，把政策重点、行业增长动力、竞争格局和商业化路径转化为行业配置观点，用于客户讨论。',
        '为管理层准备政策驱动型投资机会的研究材料，涵盖市场规模、监管催化剂、资金支持和下行风险。',
      ],
    },
  },
  {
    dir: { en: 'East', zh: '东' },
    org: { en: 'Independent research', zh: '个人研究' },
    role: { en: 'Gold · Costco · China’s money market', zh: '黄金 · Costco · 中国货币市场' },
    place: { en: 'My own work', zh: '我自己的研究' },
    period: '2024 – 2026',
    memory: { en: 'My own desk: gold, Costco, the money market', zh: '我自己的书桌：黄金、Costco、货币市场' },
    story: {
      en: 'Some questions I chased on my own: what gold is really worth when the dollar matters less, why Costco can live on such thin margins, and what thirty-six years of China’s money market look like when you draw them. The last one became a published paper.',
      zh: '有些问题是我自己追着去研究的：当美元的分量变轻，黄金到底值多少；Costco 为什么能靠那么薄的利润活得这么好；把中国货币市场三十多年的数据画出来，会是什么样子。最后这个成了一篇发表的论文。',
    },
    bullets: {
      en: [
        'Money Market Insights in China: Evidence from Visual Analytics Approach (Feb – Apr 2024). Used Tableau, Python and R to analyse China’s money market from 1984 to 2020: money supply, deposit flows and exchange rates. Co-authored paper published by Forum for Economic and Financial Studies.',
        'Gold macro strategy (Dec 2025 – Jan 2026). Built a fair-value framework for gold as both monetary hedge and commodity amid de-dollarisation; a tactical long thesis on dovish Fed expectations and haven demand, projecting 15–20% upside with stop-loss discipline.',
        'Costco financial analysis (Aug – Dec 2025). Ratio analysis against Walmart, Sears and BJ’s; linked membership fees, pricing discipline, inventory turnover and Kirkland to margin resilience; compared sustainable growth with actual expansion for an investment recommendation.',
      ],
      zh: [
        '《中国货币市场洞察：基于可视化分析的证据》（2024 年 2–4 月）。用 Tableau、Python 和 R 分析 1984–2020 年中国货币市场的货币供应、存款流动和汇率变化；合著论文发表于 Forum for Economic and Financial Studies。',
        '黄金宏观策略（2025 年 12 月 – 2026 年 1 月）。在去美元化背景下，把黄金同时作为货币对冲工具和大宗商品，建立公允价值框架；基于美联储偏鸽预期和避险需求提出战术做多观点，预计 15–20% 上行空间，并设定止损纪律。',
        'Costco 财务分析（2025 年 8–12 月）。与沃尔玛、Sears 和 BJ’s 做比率对比；把会员费、定价纪律、库存周转和 Kirkland 自有品牌与利润率韧性联系起来；对比可持续增长率与实际扩张速度，给出投资建议。',
      ],
    },
  },
];

export const SKILLS = {
  en: ['Excel', 'PowerPoint', 'Python', 'R', 'Tableau', 'Bloomberg Terminal', 'FactSet', 'Capital IQ'],
  zh: ['Excel', 'PowerPoint', 'Python', 'R', 'Tableau', 'Bloomberg 终端', 'FactSet', 'Capital IQ'],
};

// Lines Livy says when you find her on the roof.
export const LIVY = {
  lines: [
    { en: 'You made it all the way up!', zh: '你一路走到顶啦！' },
    { en: 'Thanks for coming aboard.', zh: '谢谢你来我的船上。' },
    { en: 'The butterfly always ends up here.', zh: '蝴蝶最后总会飞到这里。' },
  ],
};
