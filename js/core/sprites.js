/* ============================================================
   SPRITES — SVG sprite generation (themed)
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
  
  // ── Witch (themed by hair/glow/dress colors) ───────────
  function createWitch(theme) {
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
      <!-- Brush handle -->
      <rect x="10" y="32" width="60" height="8" rx="3" fill="url(#brushGrad)"/>
      <!-- Brush bristles -->
      <rect x="2" y="28" width="14" height="16" rx="2" fill="${h1}"/>
      <rect x="3" y="29" width="4" height="14" rx="1" fill="${h2}" opacity="0.7"/>
      <rect x="8" y="29" width="3" height="14" rx="1" fill="${h3}" opacity="0.5"/>
      <!-- Dripping paint -->
      <ellipse cx="6" cy="46" rx="3" ry="4" fill="${h1}" opacity="0.6"/>
      <ellipse cx="12" cy="48" rx="2" ry="3" fill="${h2}" opacity="0.4"/>
      <!-- Metal band -->
      <rect x="14" y="30" width="6" height="12" rx="1" fill="#C0C0C0"/>
      <rect x="15" y="31" width="4" height="2" fill="#E8E8E8"/>
      <rect x="15" y="38" width="4" height="2" fill="#E8E8E8"/>
      <!-- Head -->
      <ellipse cx="45" cy="28" rx="7" ry="8" fill="#FFD5B4"/>
      <!-- Hair -->
      <path d="M38 24 Q32 18 30 26 Q28 32 34 30 Z" fill="url(#hairGrad)"/>
      <path d="M40 20 Q36 10 34 20 Q32 26 38 24 Z" fill="url(#hairGrad)"/>
      <path d="M52 24 Q58 16 56 26 Q54 34 50 28 Z" fill="url(#hairGrad)"/>
      <path d="M50 20 Q56 12 54 22 Q52 28 48 24 Z" fill="${h3}"/>
      <!-- Eyes -->
      <ellipse cx="42" cy="27" rx="2" ry="2.5" fill="#1a1a2e"/>
      <ellipse cx="48" cy="27" rx="2" ry="2.5" fill="#1a1a2e"/>
      <circle cx="42.5" cy="26.5" r="0.8" fill="${glow}"/>
      <circle cx="48.5" cy="26.5" r="0.8" fill="${glow}"/>
      <!-- Smile -->
      <path d="M42 31 Q45 34 48 31" stroke="${hat}" stroke-width="1" fill="none"/>
      <!-- Hat -->
      <polygon points="45,8 36,22 54,22" fill="#1a1a2e"/>
      <polygon points="45,4 42,14 48,14" fill="${dress}"/>
      <rect x="34" y="21" width="22" height="3" rx="1" fill="#1a1a2e"/>
      <circle cx="45" cy="14" r="2" fill="${hat}"/>
      <!-- Dress -->
      <path d="M40 36 L38 44 L52 44 L50 36 Z" fill="${dress}"/>
      <path d="M40 36 L42 44" stroke="${glow}" stroke-width="0.5" opacity="0.5"/>
      <path d="M50 36 L48 44" stroke="${glow}" stroke-width="0.5" opacity="0.5"/>
      <!-- Legs & Boots -->
      <rect x="41" y="44" width="3" height="6" fill="#FFD5B4"/>
      <rect x="47" y="44" width="3" height="6" fill="#FFD5B4"/>
      <rect x="40" y="49" width="5" height="3" rx="1" fill="#1a1a2e"/>
      <rect x="46" y="49" width="5" height="3" rx="1" fill="#1a1a2e"/>
      <!-- Sparkles -->
      <circle cx="8" cy="34" r="1" fill="${glow}" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.6s" repeatCount="indefinite"/>
      </circle>
      <circle cx="4" cy="40" r="0.8" fill="${h2}" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="0.8s" repeatCount="indefinite"/>
      </circle>
    </svg>`, `witch_${theme.name}`);
  }
  
  // ── Potion (+10 bonus) ─────────────────────────────────
  function createPotion() {
    return svgToImg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40">
      <defs>
        <linearGradient id="potGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FF69B4"/>
          <stop offset="100%" stop-color="#FF1493"/>
        </linearGradient>
      </defs>
      <rect x="5" y="14" width="20" height="22" rx="4" fill="url(#potGrad)"/>
      <rect x="7" y="16" width="6" height="18" rx="2" fill="#FF69B4" opacity="0.4"/>
      <rect x="10" y="6" width="10" height="10" rx="2" fill="#FF69B4"/>
      <rect x="8" y="3" width="14" height="5" rx="2" fill="#C0C0C0"/>
      <rect x="10" y="4" width="10" height="1" fill="#E8E8E8"/>
      <rect x="8" y="22" width="14" height="8" rx="1" fill="white" opacity="0.9"/>
      <text x="15" y="28" font-size="4" fill="#FF1493" text-anchor="middle" font-weight="bold" font-family="sans-serif">COLOR</text>
      <ellipse cx="20" cy="18" rx="2" ry="4" fill="white" opacity="0.3"/>
      <circle cx="15" cy="25" r="14" fill="#FF69B4" opacity="0.1"/>
    </svg>`, 'potion');
  }
  
  // ── Crystal (+50 super-bonus) ──────────────────────────
  function createCrystal() {
    return svgToImg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40">
      <defs>
        <linearGradient id="crysGrad" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stop-color="#00FFFF"/>
          <stop offset="50%" stop-color="#0088FF"/>
          <stop offset="100%" stop-color="#8A2BE2"/>
        </linearGradient>
      </defs>
      <polygon points="15,2 26,14 22,38 8,38 4,14" fill="url(#crysGrad)"/>
      <polygon points="15,2 18,14 15,36" fill="#00BFFF" opacity="0.4"/>
      <polygon points="15,2 12,14 15,36" fill="#0055FF" opacity="0.3"/>
      <polygon points="4,14 12,14 8,38" fill="#4400CC" opacity="0.3"/>
      <polygon points="26,14 18,14 22,38" fill="#00DDFF" opacity="0.2"/>
      <polygon points="15,8 20,14 17,32 13,32 10,14" fill="white" opacity="0.15"/>
      <circle cx="13" cy="12" r="1.5" fill="white" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" repeatCount="indefinite"/>
      </circle>
      <ellipse cx="15" cy="20" rx="16" ry="20" fill="#00FFFF" opacity="0.06"/>
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
            fill="url(#shieldGrad)" opacity="0.8" stroke="#00FFFF" stroke-width="1"/>
      <path d="M16 6 L24 10 L24 16 Q24 23 16 26 Q8 23 8 16 L8 10 Z" 
            fill="none" stroke="white" stroke-width="0.5" opacity="0.5"/>
      <text x="16" y="19" font-size="10" fill="white" text-anchor="middle" font-weight="bold" font-family="sans-serif">✦</text>
      <circle cx="16" cy="16" r="15" fill="#00FFFF" opacity="0.08"/>
    </svg>`, 'shield');
  }
  
  // ── Heart (extra life) ─────────────────────────────────
  function createHeart() {
    return svgToImg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
      <defs>
        <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FF4466"/>
          <stop offset="100%" stop-color="#CC0033"/>
        </linearGradient>
      </defs>
      <path d="M14 24 Q4 18 2 11 Q0 4 7 3 Q11 2 14 7 Q17 2 21 3 Q28 4 26 11 Q24 18 14 24 Z" 
            fill="url(#heartGrad)" stroke="#FF6688" stroke-width="0.5"/>
      <path d="M14 20 Q7 16 5 11 Q4 7 8 6 Q10 5 12 8" 
            fill="white" opacity="0.2"/>
      <circle cx="14" cy="14" r="13" fill="#FF4466" opacity="0.1"/>
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
      <rect x="2" y="6" width="32" height="32" rx="3" fill="url(#boxGrad)" stroke="#FF0000" stroke-width="1"/>
      <polygon points="2,6 18,2 34,6" fill="#AA0000"/>
      <ellipse cx="18" cy="20" rx="8" ry="7" fill="#F5F5DC"/>
      <ellipse cx="18" cy="24" rx="5" ry="4" fill="#F5F5DC"/>
      <ellipse cx="14" cy="19" rx="2.5" ry="3" fill="#1a1a1a"/>
      <ellipse cx="22" cy="19" rx="2.5" ry="3" fill="#1a1a1a"/>
      <circle cx="14" cy="18.5" r="0.8" fill="#FF0000"/>
      <circle cx="22" cy="18.5" r="0.8" fill="#FF0000"/>
      <polygon points="17,22 19,22 18,24" fill="#1a1a1a"/>
      <rect x="14" y="26" width="2" height="3" rx="0.5" fill="#F5F5DC" stroke="#1a1a1a" stroke-width="0.3"/>
      <rect x="17" y="26" width="2" height="3" rx="0.5" fill="#F5F5DC" stroke="#1a1a1a" stroke-width="0.3"/>
      <rect x="20" y="26" width="2" height="3" rx="0.5" fill="#F5F5DC" stroke="#1a1a1a" stroke-width="0.3"/>
      <text x="18" y="36" font-size="3.5" fill="#FF4444" text-anchor="middle" font-weight="bold" font-family="sans-serif">TOXIC</text>
    </svg>`, 'boxdye');
  }
  
  // ── Scissors (enemy — sine wave) ───────────────────────
  function createScissors() {
    return svgToImg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 36">
      <defs>
        <linearGradient id="bladeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#E8E8E8"/>
          <stop offset="100%" stop-color="#A0A0A0"/>
        </linearGradient>
      </defs>
      <polygon points="20,14 38,4 40,8 22,18" fill="url(#bladeGrad)" stroke="#808080" stroke-width="0.5"/>
      <polygon points="20,22 38,32 40,28 22,18" fill="url(#bladeGrad)" stroke="#808080" stroke-width="0.5"/>
      <line x1="20" y1="14" x2="39" y2="6" stroke="white" stroke-width="0.3" opacity="0.5"/>
      <line x1="20" y1="22" x2="39" y2="30" stroke="white" stroke-width="0.3" opacity="0.5"/>
      <circle cx="20" cy="18" r="3" fill="#666" stroke="#444" stroke-width="1"/>
      <circle cx="20" cy="18" r="1.5" fill="#888"/>
      <ellipse cx="8" cy="10" rx="7" ry="5" fill="none" stroke="#8A2BE2" stroke-width="2.5"/>
      <ellipse cx="8" cy="26" rx="7" ry="5" fill="none" stroke="#FF00FF" stroke-width="2.5"/>
      <line x1="14" y1="12" x2="20" y2="16" stroke="#666" stroke-width="2"/>
      <line x1="14" y1="24" x2="20" y2="20" stroke="#666" stroke-width="2"/>
      <line x1="30" y1="7" x2="34" y2="5" stroke="white" stroke-width="0.8" opacity="0.7"/>
      <line x1="30" y1="29" x2="34" y2="31" stroke="white" stroke-width="0.8" opacity="0.7"/>
    </svg>`, 'scissors');
  }
  
  // ── Bomb (enemy — level 2+, tracks Y) ──────────────────
  function createBomb() {
    return svgToImg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 38">
      <circle cx="17" cy="22" r="13" fill="#1a1a2e" stroke="#444" stroke-width="1.5"/>
      <circle cx="17" cy="22" r="10" fill="#2a2a3e"/>
      <ellipse cx="13" cy="19" rx="4" ry="5" fill="#3a3a4e" opacity="0.3"/>
      <!-- Fuse -->
      <path d="M17 9 Q20 4 24 2" stroke="#AA8844" stroke-width="2" fill="none"/>
      <!-- Spark -->
      <circle cx="24" cy="2" r="3" fill="#FFD700" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="0.3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="24" cy="2" r="5" fill="#FF6600" opacity="0.3">
        <animate attributeName="r" values="3;6;3" dur="0.4s" repeatCount="indefinite"/>
      </circle>
      <!-- Skull mark -->
      <text x="17" y="26" font-size="10" fill="#FF4444" text-anchor="middle" font-family="sans-serif">☠</text>
    </svg>`, 'bomb');
  }
  
  return {
    createWitch,
    createPotion,
    createCrystal,
    createShield,
    createHeart,
    createBoxDye,
    createScissors,
    createBomb,
  };
})();
