/* ============================================================
   SPRITES — SVG sprite generation (themed)
   Лут переработан: 3 тира флаконов с контурной обводкой
   ============================================================ */

const Sprites = (() => {
  const cache = {};

  function svgToImg(svgStr, key) {
    if (cache[key]) return cache[key];
    const img = new Image();
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    img.src = URL.createObjectURL(blob);
    cache[key] = img;
    return img;
  }

  // ── Witch (PNG-based, with procedural fallback) ────────
  function createWitch(theme) {
    const pngPrefix = { 'НЕОН': 'neon', 'ТОКСИК': 'toxic', 'ОГОНЬ': 'fire' }[theme.name];
    if (pngPrefix) {
      ['fly', 'hurt', 'idle'].forEach(state => {
        const key = `witch_${theme.name}_${state}`;
        if (!cache[key]) {
          const img = new Image();
          img.src = `sprites/witches/witch-${pngPrefix}-${state}.png`;
          cache[key] = img;
        }
      });
      return cache[`witch_${theme.name}_fly`];
    }

    const h1 = theme.hairColors[0];
    const h2 = theme.hairColors[1];
    const h3 = theme.hairColors[2] || h1;
    const glow = theme.glowColor;
    const hat = theme.hatAccent;
    const dress = theme.dressColor;

    return svgToImg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 60">
      <defs>
        <linearGradient id="brushGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#D2691E"/>
          <stop offset="50%" stop-color="#8B4513"/>
          <stop offset="100%" stop-color="#654321"/>
        </linearGradient>
        <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${h1}"/>
          <stop offset="100%" stop-color="${h2}"/>
        </linearGradient>
      </defs>
      <rect x="10" y="32" width="60" height="8" rx="3" fill="url(#brushGrad)"/>
      <rect x="2" y="28" width="14" height="16" rx="2" fill="${h1}"/>
      <rect x="3" y="29" width="4" height="14" rx="1" fill="${h2}" opacity="0.7"/>
      <rect x="8" y="29" width="3" height="14" rx="1" fill="${h3}" opacity="0.5"/>
      <ellipse cx="6" cy="46" rx="3" ry="4" fill="${h1}" opacity="0.6"/>
      <ellipse cx="12" cy="48" rx="2" ry="3" fill="${h2}" opacity="0.4"/>
      <rect x="14" y="30" width="6" height="12" rx="1" fill="#C0C0C0"/>
      <rect x="15" y="31" width="4" height="2" fill="#E8E8E8"/>
      <rect x="15" y="38" width="4" height="2" fill="#E8E8E8"/>
      <ellipse cx="45" cy="28" rx="7" ry="8" fill="#FFD5B4"/>
      <path d="M38 24 Q32 18 30 26 Q28 32 34 30 Z" fill="url(#hairGrad)"/>
      <path d="M40 20 Q36 10 34 20 Q32 26 38 24 Z" fill="url(#hairGrad)"/>
      <path d="M52 24 Q58 16 56 26 Q54 34 50 28 Z" fill="url(#hairGrad)"/>
      <path d="M50 20 Q56 12 54 22 Q52 28 48 24 Z" fill="${h3}"/>
      <ellipse cx="42" cy="27" rx="2" ry="2.5" fill="#1a1a2e"/>
      <ellipse cx="48" cy="27" rx="2" ry="2.5" fill="#1a1a2e"/>
      <circle cx="42.5" cy="26.5" r="0.8" fill="${glow}"/>
      <circle cx="48.5" cy="26.5" r="0.8" fill="${glow}"/>
      <path d="M42 31 Q45 34 48 31" stroke="${hat}" stroke-width="1" fill="none"/>
      <polygon points="45,8 36,22 54,22" fill="#1a1a2e"/>
      <polygon points="45,4 42,14 48,14" fill="${dress}"/>
      <rect x="34" y="21" width="22" height="3" rx="1" fill="#1a1a2e"/>
      <circle cx="45" cy="14" r="2" fill="${hat}"/>
      <path d="M40 36 L38 44 L52 44 L50 36 Z" fill="${dress}"/>
      <rect x="41" y="44" width="3" height="6" fill="#FFD5B4"/>
      <rect x="47" y="44" width="3" height="6" fill="#FFD5B4"/>
      <rect x="40" y="49" width="5" height="3" rx="1" fill="#1a1a2e"/>
      <rect x="46" y="49" width="5" height="3" rx="1" fill="#1a1a2e"/>
    </svg>`, `witch_${theme.name}`);
  }

  // ════════════════════════════════════════════════════════
  //  ЛУТ — 3 тира. У всех чёрная обводка + светлый внутренний
  //  контур, чтобы читались на любом фоне.
  // ════════════════════════════════════════════════════════

  // ── Тир 1: Розовый флакон с сердечком (+10, частый) ────
  function createPotion() {
    return svgToImg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40">
      <defs>
        <linearGradient id="p1Grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FF8FD0"/>
          <stop offset="100%" stop-color="#FF1493"/>
        </linearGradient>
      </defs>
      <!-- тело флакона: круглое -->
      <path d="M15 13 L15 13 Q9 14 9 22 Q9 34 15 35 Q21 34 21 22 Q21 14 15 13 Z"
            fill="url(#p1Grad)" stroke="#1a0010" stroke-width="2"/>
      <!-- горлышко + пробка -->
      <rect x="12" y="8" width="6" height="7" fill="#FF8FD0" stroke="#1a0010" stroke-width="1.5"/>
      <rect x="11" y="4" width="8" height="5" rx="1.5" fill="#C08B5C" stroke="#1a0010" stroke-width="1.5"/>
      <!-- сердечко внутри -->
      <path d="M15 28 Q11 25 11 22 Q11 19.5 13 20 Q14.5 20.3 15 22 Q15.5 20.3 17 20 Q19 19.5 19 22 Q19 25 15 28 Z"
            fill="#FFFFFF" opacity="0.9"/>
      <!-- блик -->
      <ellipse cx="12" cy="20" rx="1.5" ry="3" fill="white" opacity="0.4"/>
    </svg>`, 'potion');
  }

  // ── Тир 2: Фиолетовый флакон со звёздами (+25, средний) ─
  function createPotionMid() {
    return svgToImg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42">
      <defs>
        <linearGradient id="p2Grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#B266FF"/>
          <stop offset="100%" stop-color="#7B1FA2"/>
        </linearGradient>
      </defs>
      <!-- тело: колба -->
      <path d="M13 14 L13 20 L7 34 Q6 38 11 38 L21 38 Q26 38 25 34 L19 20 L19 14 Z"
            fill="url(#p2Grad)" stroke="#0d0020" stroke-width="2"/>
      <!-- горлышко + пробка -->
      <rect x="13" y="8" width="6" height="7" fill="#B266FF" stroke="#0d0020" stroke-width="1.5"/>
      <rect x="12" y="4" width="8" height="5" rx="1.5" fill="#C08B5C" stroke="#0d0020" stroke-width="1.5"/>
      <!-- звёздочки внутри -->
      <text x="13" y="33" font-size="6" fill="#FFE9A8" font-family="sans-serif">✦</text>
      <text x="18" y="30" font-size="4" fill="#FFFFFF" font-family="sans-serif">✦</text>
      <text x="15" y="37" font-size="3" fill="#FFE9A8" font-family="sans-serif">✦</text>
      <!-- голубой внутренний контур для контраста -->
      <ellipse cx="11" cy="26" rx="1.5" ry="4" fill="#E0BBFF" opacity="0.4"/>
    </svg>`, 'potionMid');
  }

  // ── Тир 3: Кристалл-джекпот (+75, редкий) ──────────────
  function createCrystal() {
    return svgToImg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42">
      <defs>
        <linearGradient id="cGrad" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stop-color="#7DF9FF"/>
          <stop offset="45%" stop-color="#00AAFF"/>
          <stop offset="100%" stop-color="#B026FF"/>
        </linearGradient>
      </defs>
      <!-- крупный самоцвет с чёрной обводкой -->
      <polygon points="16,2 28,15 23,40 9,40 4,15"
               fill="url(#cGrad)" stroke="#06001a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- грани -->
      <polygon points="16,2 19,15 16,38" fill="#BFffff" opacity="0.45"/>
      <polygon points="16,2 13,15 16,38" fill="#0066FF" opacity="0.30"/>
      <polygon points="4,15 13,15 9,40" fill="#5500CC" opacity="0.30"/>
      <polygon points="28,15 19,15 23,40" fill="#00E5FF" opacity="0.25"/>
      <!-- блики/блёстки -->
      <circle cx="13" cy="13" r="1.6" fill="#FFFFFF"/>
      <circle cx="20" cy="22" r="1" fill="#FFF6C0"/>
      <text x="22" y="11" font-size="6" fill="#FFD700" font-family="sans-serif">✦</text>
    </svg>`, 'crystal');
  }

  // ── Shield (bonus) ─────────────────────────────────────
  function createShield() {
    return svgToImg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00FFFF"/>
          <stop offset="100%" stop-color="#0088FF"/>
        </linearGradient>
      </defs>
      <path d="M16 2 L28 8 L28 16 Q28 26 16 30 Q4 26 4 16 L4 8 Z"
            fill="url(#shieldGrad)" opacity="0.9" stroke="#003355" stroke-width="2"/>
      <path d="M16 6 L24 10 L24 16 Q24 23 16 26 Q8 23 8 16 L8 10 Z"
            fill="none" stroke="white" stroke-width="0.8" opacity="0.6"/>
      <text x="16" y="20" font-size="11" fill="white" text-anchor="middle" font-weight="bold" font-family="sans-serif">✦</text>
    </svg>`, 'shield');
  }

  // ── Heart (extra life) — с жирной обводкой ─────────────
  function createHeart() {
    return svgToImg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
      <defs>
        <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FF5C7A"/>
          <stop offset="100%" stop-color="#CC0033"/>
        </linearGradient>
      </defs>
      <path d="M14 25 Q3 18 2 10 Q1 3 8 3 Q12 3 14 8 Q16 3 20 3 Q27 3 26 10 Q25 18 14 25 Z"
            fill="url(#heartGrad)" stroke="#FFFFFF" stroke-width="1.5"/>
      <path d="M14 25 Q3 18 2 10 Q1 3 8 3 Q12 3 14 8 Q16 3 20 3 Q27 3 26 10 Q25 18 14 25 Z"
            fill="none" stroke="#660018" stroke-width="0.5"/>
      <path d="M10 9 Q7 9 7 12" stroke="white" stroke-width="1.5" fill="none" opacity="0.6" stroke-linecap="round"/>
    </svg>`, 'heart');
  }

  // ── Box Dye (enemy — straight) ─────────────────────────
  function createBoxDye() {
    return svgToImg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 40">
      <defs>
        <linearGradient id="boxGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8B0000"/>
          <stop offset="100%" stop-color="#4a0000"/>
        </linearGradient>
      </defs>
      <rect x="2" y="6" width="32" height="32" rx="3" fill="url(#boxGrad)" stroke="#FF3030" stroke-width="2"/>
      <polygon points="2,6 18,2 34,6" fill="#AA0000"/>
      <ellipse cx="18" cy="20" rx="8" ry="7" fill="#F5F5DC"/>
      <ellipse cx="14" cy="19" rx="2.5" ry="3" fill="#1a1a1a"/>
      <ellipse cx="22" cy="19" rx="2.5" ry="3" fill="#1a1a1a"/>
      <circle cx="14" cy="18.5" r="0.8" fill="#FF0000"/>
      <circle cx="22" cy="18.5" r="0.8" fill="#FF0000"/>
      <polygon points="17,22 19,22 18,24" fill="#1a1a1a"/>
      <text x="18" y="36" font-size="3.5" fill="#FF4444" text-anchor="middle" font-weight="bold" font-family="sans-serif">TOXIC</text>
    </svg>`, 'boxdye');
  }

  // ── Scissors (enemy) ───────────────────────────────────
  function createScissors() {
    return svgToImg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 36">
      <defs>
        <linearGradient id="bladeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#E8E8E8"/>
          <stop offset="100%" stop-color="#A0A0A0"/>
        </linearGradient>
      </defs>
      <polygon points="20,14 38,4 40,8 22,18" fill="url(#bladeGrad)" stroke="#505050" stroke-width="0.8"/>
      <polygon points="20,22 38,32 40,28 22,18" fill="url(#bladeGrad)" stroke="#505050" stroke-width="0.8"/>
      <circle cx="20" cy="18" r="3" fill="#666" stroke="#333" stroke-width="1"/>
      <ellipse cx="8" cy="10" rx="7" ry="5" fill="none" stroke="#8A2BE2" stroke-width="2.5"/>
      <ellipse cx="8" cy="26" rx="7" ry="5" fill="none" stroke="#FF00FF" stroke-width="2.5"/>
      <line x1="14" y1="12" x2="20" y2="16" stroke="#666" stroke-width="2"/>
      <line x1="14" y1="24" x2="20" y2="20" stroke="#666" stroke-width="2"/>
    </svg>`, 'scissors');
  }

  // ── Bomb (enemy — explodes) ────────────────────────────
  function createBomb() {
    return svgToImg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 38">
      <circle cx="17" cy="22" r="13" fill="#1a1a2e" stroke="#FF4444" stroke-width="1.5"/>
      <circle cx="17" cy="22" r="10" fill="#2a2a3e"/>
      <ellipse cx="13" cy="19" rx="4" ry="5" fill="#3a3a4e" opacity="0.3"/>
      <path d="M17 9 Q20 4 24 2" stroke="#AA8844" stroke-width="2" fill="none"/>
      <circle cx="24" cy="2" r="3" fill="#FFD700" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="0.3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="24" cy="2" r="5" fill="#FF6600" opacity="0.3">
        <animate attributeName="r" values="3;6;3" dur="0.4s" repeatCount="indefinite"/>
      </circle>
      <text x="17" y="26" font-size="10" fill="#FF4444" text-anchor="middle" font-family="sans-serif">☠</text>
    </svg>`, 'bomb');
  }

  function getWitchSprite(theme, state) {
    const pngPrefix = { 'НЕОН': 'neon', 'ТОКСИК': 'toxic', 'ОГОНЬ': 'fire' }[theme.name];
    if (pngPrefix) {
      return cache[`witch_${theme.name}_${state}`] || cache[`witch_${theme.name}_fly`];
    }
    return cache[`witch_${theme.name}`];
  }

  return {
    createWitch,
    getWitchSprite,
    createPotion,
    createPotionMid,
    createCrystal,
    createShield,
    createHeart,
    createBoxDye,
    createScissors,
    createBomb,
  };
})();
