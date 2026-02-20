/* ============================================================
   AUDIO — 8-bit music & SFX via Web Audio API
   ============================================================ */

const Audio8Bit = (() => {
  let audioCtx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let isMuted = false;
  let currentMusic = null;
  let musicNodes = [];
  
  // Note frequencies
  const NOTES = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50,
  };
  
  function init() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(audioCtx.destination);
    
    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.25;
    musicGain.connect(masterGain);
    
    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 0.5;
    sfxGain.connect(masterGain);
  }
  
  function resume() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }
  
  // Play a single 8-bit note
  function playNote(freq, duration, type = 'square', gainNode = sfxGain, startTime = 0) {
    if (!audioCtx || isMuted) return null;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + startTime + duration);
    
    osc.connect(gain);
    gain.connect(gainNode);
    
    osc.start(audioCtx.currentTime + startTime);
    osc.stop(audioCtx.currentTime + startTime + duration);
    
    return osc;
  }
  
  // ── SFX ────────────────────────────────────────────────
  function sfxCollect() {
    if (!audioCtx || isMuted) return;
    playNote(NOTES.E5, 0.08, 'square');
    playNote(NOTES.G5, 0.08, 'square', sfxGain, 0.07);
    playNote(NOTES.C6, 0.15, 'square', sfxGain, 0.14);
  }
  
  function sfxCrystal() {
    if (!audioCtx || isMuted) return;
    playNote(NOTES.C5, 0.06, 'sine');
    playNote(NOTES.E5, 0.06, 'sine', sfxGain, 0.06);
    playNote(NOTES.G5, 0.06, 'sine', sfxGain, 0.12);
    playNote(NOTES.C6, 0.2, 'sine', sfxGain, 0.18);
  }
  
  function sfxShield() {
    if (!audioCtx || isMuted) return;
    playNote(NOTES.D5, 0.1, 'triangle');
    playNote(NOTES.A5, 0.1, 'triangle', sfxGain, 0.08);
    playNote(NOTES.D5, 0.2, 'triangle', sfxGain, 0.16);
  }
  
  function sfxHeart() {
    if (!audioCtx || isMuted) return;
    playNote(NOTES.C5, 0.1, 'sine');
    playNote(NOTES.E5, 0.15, 'sine', sfxGain, 0.1);
  }
  
  function sfxHit() {
    if (!audioCtx || isMuted) return;
    // Noise burst + low tone
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  }
  
  function sfxDeath() {
    if (!audioCtx || isMuted) return;
    playNote(NOTES.B4, 0.15, 'square');
    playNote(NOTES.G3, 0.15, 'square', sfxGain, 0.12);
    playNote(NOTES.E3, 0.15, 'square', sfxGain, 0.24);
    playNote(NOTES.C3, 0.4, 'sawtooth', sfxGain, 0.36);
  }
  
  function sfxLevelUp() {
    if (!audioCtx || isMuted) return;
    const notes = [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6, NOTES.E5, NOTES.G5, NOTES.C6];
    notes.forEach((n, i) => {
      playNote(n, 0.12, 'square', sfxGain, i * 0.08);
    });
  }
  
  function sfxClick() {
    if (!audioCtx || isMuted) return;
    playNote(NOTES.A4, 0.05, 'square');
  }
  
  // ── MUSIC — 8-bit rock loops ───────────────────────────
  // Each "song" is a pattern of notes played in a loop
  
  const MUSIC_PATTERNS = {
    level1: {
      bpm: 140,
      // Melody line
      melody: [
        'E4','E4','_','E4','_','C4','E4','_',
        'G4','_','_','_','G3','_','_','_',
        'C4','_','_','G3','_','_','E3','_',
        '_','A3','_','B3','_','A3#','A3','_',
      ],
      // Bass line
      bass: [
        'C3','_','C3','_','C3','_','C3','_',
        'G3','_','G3','_','G3','_','G3','_',
        'A3','_','A3','_','E3','_','E3','_',
        'F3','_','F3','_','G3','_','G3','_',
      ],
      // Drums (freq doesn't matter, type is noise-like)
      drums: [
        1, 0, 0, 0, 1, 0, 0, 0,
        1, 0, 0, 0, 1, 0, 1, 0,
        1, 0, 0, 0, 1, 0, 0, 0,
        1, 0, 1, 0, 1, 0, 1, 0,
      ],
    },
    level2: {
      bpm: 155,
      melody: [
        'A4','_','C5','_','A4','_','E4','_',
        'D4','_','E4','_','A4','_','_','_',
        'A4','_','C5','_','D5','_','C5','_',
        'A4','_','E4','_','D4','_','_','_',
      ],
      bass: [
        'A2','_','A2','_','E3','_','E3','_',
        'D3','_','D3','_','A2','_','A2','_',
        'A2','_','A2','_','D3','_','D3','_',
        'E3','_','E3','_','E3','_','E3','_',
      ],
      drums: [
        1, 0, 1, 0, 1, 0, 1, 0,
        1, 0, 0, 1, 1, 0, 1, 0,
        1, 0, 1, 0, 1, 0, 1, 0,
        1, 1, 0, 1, 1, 0, 1, 1,
      ],
    },
    level3: {
      bpm: 170,
      melody: [
        'E5','_','D5','_','C5','_','B4','_',
        'A4','_','B4','_','C5','_','D5','_',
        'E5','_','E5','_','D5','_','C5','_',
        'B4','_','A4','_','A4','_','_','_',
      ],
      bass: [
        'E3','_','E3','_','E3','_','E3','_',
        'A2','_','A2','_','A2','_','A2','_',
        'C3','_','C3','_','D3','_','D3','_',
        'E3','_','E3','_','E3','_','E3','_',
      ],
      drums: [
        1, 0, 1, 1, 1, 0, 1, 1,
        1, 0, 1, 1, 1, 1, 1, 0,
        1, 0, 1, 1, 1, 0, 1, 1,
        1, 1, 1, 0, 1, 1, 1, 1,
      ],
    },
  };
  
  // Simple note name to freq resolver
  function noteToFreq(noteName) {
    if (!noteName || noteName === '_') return 0;
    // Handle sharps like A3#
    const clean = noteName.replace('#', '');
    const base = NOTES[clean];
    if (!base) return 0;
    return noteName.includes('#') ? base * 1.0595 : base; // semitone up
  }
  
  let musicInterval = null;
  let musicStep = 0;
  
  function playMusic(trackName) {
    stopMusic();
    if (!audioCtx || isMuted) return;
    
    const pattern = MUSIC_PATTERNS[trackName];
    if (!pattern) return;
    
    currentMusic = trackName;
    musicStep = 0;
    
    const stepDuration = 60 / pattern.bpm / 2; // 8th notes
    
    musicInterval = setInterval(() => {
      if (isMuted || !audioCtx) { stopMusic(); return; }
      
      const i = musicStep % pattern.melody.length;
      
      // Melody
      const melNote = noteToFreq(pattern.melody[i]);
      if (melNote > 0) {
        playNote(melNote, stepDuration * 0.8, 'square', musicGain);
      }
      
      // Bass
      const bassNote = noteToFreq(pattern.bass[i]);
      if (bassNote > 0) {
        playNote(bassNote, stepDuration * 0.9, 'triangle', musicGain);
      }
      
      // Drums
      if (pattern.drums[i]) {
        // Kick-like noise
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.08);
        g.gain.setValueAtTime(0.15, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        osc.connect(g);
        g.connect(musicGain);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      }
      
      musicStep++;
    }, stepDuration * 1000);
  }
  
  function stopMusic() {
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
    currentMusic = null;
  }
  
  function toggleMute() {
    isMuted = !isMuted;
    if (isMuted) {
      stopMusic();
    }
    document.getElementById('sound-toggle').textContent = isMuted ? '🔇' : '🔊';
    return isMuted;
  }
  
  function getMuted() { return isMuted; }
  
  return {
    init, resume, toggleMute, getMuted,
    playMusic, stopMusic,
    sfxCollect, sfxCrystal, sfxShield, sfxHeart,
    sfxHit, sfxDeath, sfxLevelUp, sfxClick,
  };
})();

// Sound toggle button
document.getElementById('sound-toggle').addEventListener('click', (e) => {
  e.stopPropagation();
  Audio8Bit.init();
  Audio8Bit.toggleMute();
});
