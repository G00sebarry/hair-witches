/* ============================================================
   CONSTANTS — All game configuration
   ============================================================ */

const GAME_STATE = {
  START: 'start',
  SELECT: 'select',      // Witch selection screen
  PLAYING: 'playing',
  LEVELUP: 'levelup',    // Level transition screen
  GAMEOVER: 'gameover',
  VICTORY: 'victory',    // Level 1 time-based win screen
  CASTLE_INTRO: 'castle_intro', // Castle fly-in animation before victory
};

// ── Color Palette ──────────────────────────────────────────
const COL = {
  bg: '#0a0a12',
  purple: '#8A2BE2',
  fuchsia: '#FF00FF',
  lime: '#39FF14',
  cyan: '#00FFFF',
  pink: '#FF69B4',
  orange: '#FF6600',
  red: '#FF4444',
  darkPurple: '#2a0845',
  neonPurple: '#b026ff',
  gold: '#FFD700',
  white: '#FFFFFF',
};

// ── Witch Themes ───────────────────────────────────────────
const WITCH_THEMES = {
  neon: {
    name: 'НЕОН',
    desc: 'Фиолетовое свечение',
    hairColors: ['#b026ff', '#FF00FF', '#8A2BE2'],
    trailColors: ['#b026ff', '#FF00FF', '#8A2BE2', '#FF69B4'],
    glowColor: '#b026ff',
    outlineColor: '#00FFFF',
    hatAccent: '#FF00FF',
    dressColor: '#2a0845',
    icon: '💜',
  },
  toxic: {
    name: 'ТОКСИК',
    desc: 'Ядовитый зелёный',
    hairColors: ['#39FF14', '#00FF41', '#7FFF00'],
    trailColors: ['#39FF14', '#00FF41', '#7FFF00', '#ADFF2F'],
    glowColor: '#39FF14',
    outlineColor: '#FFFFFF', 
    hatAccent: '#00FF41',
    dressColor: '#0a2a0a',
    icon: '💚',
  },
  fire: {
    name: 'ОГОНЬ',
    desc: 'Пламенный стиль',
    hairColors: ['#FF6600', '#FF4400', '#FFD700'],
    trailColors: ['#FF6600', '#FF4400', '#FFD700', '#FF0000'],
    glowColor: '#FF6600',
    outlineColor: '#00FFFF', 
    hatAccent: '#FFD700',
    dressColor: '#2a1000',
    icon: '🔥',
  },
};

// ── Level Configuration ────────────────────────────────────
const LEVELS = [
  {
    id: 1,
    name: 'Улицы Неона',
    subtitle: 'Ночной город',
    targetScore: Infinity,  // Level 1 ends by time (90s), not score
    baseSpeed: 2.5,
    spawnInterval: 1.4,
    speedGrowth: 0.08,      // 8% per 15s
    speedGrowthInterval: 15,
    enemyChance: 0.25,      // 25% enemies
    crystalChance: 0.08,    // 8% crystals
    shieldChance: 0.04,     // 4% shields
    heartChance: 0.03,     // 1.5% hearts (rare)
    bgHue: 270,             // Purple sky
    bgColors: ['#050510', '#100025', '#0a0a12'],
    music: 'level1',
  },
  {
    id: 2,
    name: 'Токсичные Крыши',
    subtitle: 'Опасная зона',
    targetScore: 500,
    baseSpeed: 3.2,
    spawnInterval: 1.1,
    speedGrowth: 0.10,
    speedGrowthInterval: 12,
    enemyChance: 0.38,
    crystalChance: 0.10,
    shieldChance: 0.03,
    heartChance: 0.01,
    bgHue: 120,             // Green tint
    bgColors: ['#020f05', '#0a2510', '#050f08'],
    music: 'level2',
  },
  {
    id: 3,
    name: 'Огненный Финал',
    subtitle: 'Верховная ведьма',
    targetScore: Infinity,  // Endless - survive as long as you can
    baseSpeed: 4.0,
    spawnInterval: 0.85,
    speedGrowth: 0.12,
    speedGrowthInterval: 10,
    enemyChance: 0.48,
    crystalChance: 0.12,
    shieldChance: 0.025,
    heartChance: 0.008,
    bgHue: 15,              // Orange/red sky
    bgColors: ['#100505', '#250a05', '#0f0805'],
    music: 'level3',
  },
];

// ── Promo Tiers ────────────────────────────────────────────
const PROMO_TIERS = [
  {
    minScore: 0,
    title: 'Ведьма-новичок',
    sub: 'Неплохой первый полёт!',
    code: 'WITCH5',
    discount: '5%',
    color: COL.pink,
  },
  {
    minScore: 800,
    title: '★ Опытная колдунья',
    sub: 'Отличная работа!',
    code: 'WITCH10',
    discount: '10%',
    color: COL.cyan,
  },
  {
    minScore: 2000,
    title: '✦ ВЕРХОВНАЯ ВЕДЬМА ✦',
    sub: 'Ты — мастер цвета!',
    code: 'WITCH15',
    discount: '15%',
    color: COL.lime,
  },
];

// ── Player Physics ─────────────────────────────────────────
const PLAYER_CONFIG = {
  gravity: 650,
  lift: -520,
  maxFall: 450,
  maxRise: -380,
  width: 80,
  height: 60,
  startX: 0.12,   // fraction of screen width
  startY: 0.45,   // fraction of screen height
  hitboxShrink: { x: 12, y: 8, w: 24, h: 16 },
  maxLives: 3,
  shieldDuration: 4,  // seconds
  invincibleDuration: 1.5,  // after taking hit
};

// ── Object Sizes ───────────────────────────────────────────
const OBJ_SIZE = {
  potion:    { w: 30, h: 40 },
  potionMid: { w: 32, h: 42 },   // новый средний флакон +25
  crystal:   { w: 32, h: 42 },
  shield:    { w: 32, h: 32 },
  heart:     { w: 28, h: 28 },
  boxdye:    { w: 36, h: 40 },
  scissors:  { w: 40, h: 36 },
  bomb:      { w: 34, h: 38 },
};
