/**
 * STATE.JS - Centralized State Management, Game Modes & LocalStorage Persistence
 */

export const WINNING_COMBOS_3X3 = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const WINNING_COMBOS_4X4 = [
  // Rows
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
  // Columns
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
  // Diagonals
  [0, 5, 10, 15], [3, 6, 9, 12]
];

export const ACHIEVEMENTS_LIST = [
  // --- COMBAT & STREAKS ---
  { id: 'FIRST_WIN', icon: '⚡', title: 'Первая кровь', desc: 'Одержите первую победу в любом режиме' },
  { id: 'STREAK_3', icon: '🔥', title: 'Серийный взломщик', desc: 'Выиграйте 3 матча подряд без поражений' },
  { id: 'STREAK_5', icon: '👑', title: 'Неудержимый киборг', desc: 'Выиграйте 5 матчей подряд без единого поражения' },
  { id: 'MATCHES_5', icon: '🎖️', title: 'Боевое крещение', desc: 'Сыграйте 5 кибер-матчей на арене' },
  { id: 'MATCHES_10', icon: '🎮', title: 'Опытный нетраннер', desc: 'Завершите 10 кибер-матчей' },
  { id: 'MATCHES_25', icon: '🏆', title: 'Легенда Найт-Сити', desc: 'Проведите 25 матчей и докажите статус' },
  
  // --- TACTICS & GEOMETRY ---
  { id: 'DIAGONAL_WIN', icon: '🗡️', title: 'Лазерный крест', desc: 'Одержите победу по диагонали' },
  { id: 'ROW_WIN', icon: '⚡', title: 'Горизонтальный разрез', desc: 'Соберите победный горизонтальный ряд' },
  { id: 'COL_WIN', icon: '🛡️', title: 'Вертикальный протокол', desc: 'Соберите победный вертикальный ряд' },
  { id: 'PEACEFUL_TIE', icon: '⚖️', title: 'Квантовое равновесие', desc: 'Завершите раунд вничью' },

  // --- CYBER AI BATTLES ---
  { id: 'AI_EASY', icon: '🤖', title: 'Калибровка оптики', desc: 'Одержите победу над ИИ на сложности «Новичок»' },
  { id: 'AI_MEDIUM', icon: '💻', title: 'Взлом фаервола', desc: 'Переиграйте ИИ на сложности «Тактик»' },
  { id: 'NEUROMANCER', icon: '🧠', title: 'Нейромант', desc: 'Победите кибер-ИИ на максимальной сложности «Мастер»' },

  // --- SPECIAL GAME MODES ---
  { id: 'BLITZ_SPEED', icon: '⏱️', title: 'Кибер-молния', desc: 'Выиграйте матч в режиме Блиц 5с' },
  { id: 'BLITZ_CLUTCH', icon: '⏳', title: 'На грани сгорания', desc: 'Выиграйте в Блице с остатком времени < 1.0 сек' },
  { id: 'INFINITY_SURVIVOR', icon: '♾️', title: 'Квантовый парадокс', desc: 'Сделайте 8 ходов в одном раунде Infinity XO' },
  { id: 'INFINITY_MASTER', icon: '🌀', title: 'Хозяин сингулярности', desc: 'Победите в Infinity XO после растворения ≥ 3 меток' },
  { id: 'GRID_ARCHITECT', icon: '📐', title: 'Архитектор 4×4', desc: 'Соберите победную линию из 4 клеток' },
  { id: 'ALL_MODES', icon: '🌐', title: 'Мультиверс', desc: 'Сыграйте во всех 4 игровых режимах' },

  // --- MULTIPLAYER & NETWORKING ---
  { id: 'P2P_GHOST', icon: '📡', title: 'Сетевой призрак', desc: 'Одержите победу в онлайн P2P дуэли' },
  { id: 'P2P_SIGNAL', icon: '💬', title: 'Шифрованный сигнал', desc: 'Отправьте кибер-реакцию в онлайн-матче' },
  { id: 'P2P_REMATCH', icon: '🔄', title: 'Реваншист', desc: 'Сыграйте онлайн-реванш со сменой сторон' },

  // --- CYBER COMBAT PERKS ---
  { id: 'EMP_SABOTEUR', icon: '⚡', title: 'ЭМИ-диверсант', desc: 'Уничтожьте метку соперника с помощью EMP-удара' },
  { id: 'CRYO_LOCK', icon: '❄️', title: 'Абсолютный ноль', desc: 'Заблокируйте тактическую клетку крио-хаком' },
  { id: 'OVERDRIVE_WIN', icon: '🚀', title: 'Сингулярность', desc: 'Победите в раунде, совершив победный ход с Овердрайвом' },

  // --- SYSTEM & CUSTOMIZATION ---
  { id: 'THEME_COLLECTOR', icon: '🎨', title: 'Хроматический спектр', desc: 'Опробуйте все 4 неоновые визуальные темы' },
  { id: 'CRT_NOSTALGIA', icon: '📺', title: 'Ретро-хакер', desc: 'Активируйте аналоговый режим кинескопа CRT FX' },
  { id: 'SYNTHWAVE_VIBE', icon: '🎵', title: 'Синтетический пульс', desc: 'Включите фоновый Synthwave саундтрек' }
];

export const CYBER_RANKS = [
  { level: 1, title: 'SCRIPT KIDDIE', minXp: 0, icon: '👾' },
  { level: 2, title: 'GLITCH ROOKIE', minXp: 150, icon: '⚡' },
  { level: 3, title: 'CYBER RUNNER', minXp: 400, icon: '🏃' },
  { level: 4, title: 'NEON PHANTOM', minXp: 800, icon: '👻' },
  { level: 5, title: 'STREET SAMURAI', minXp: 1400, icon: '🗡️' },
  { level: 7, title: 'GRID HACKER', minXp: 2200, icon: '💻' },
  { level: 10, title: 'NETRUNNER MASTER', minXp: 3500, icon: '🧠' },
  { level: 15, title: 'NEUROMANCER PRO', minXp: 5500, icon: '👑' },
  { level: 20, title: 'MATRIX OVERLORD', minXp: 8500, icon: '🌌' }
];

export const SKINS_X = [
  { id: 'classic_x', name: 'Лазерный X', icon: '✕', desc: 'Классический двойной фотонный луч', unlockReq: 'Открыто изначально' },
  { id: 'katanas_x', name: 'Плазменные клинки', icon: '⚔️', desc: 'Скрещенные катаны уличного самурая', reqWins: 5, unlockReq: '5 побед' },
  { id: 'lightning_x', name: 'Кибер-молния', icon: '⚡', desc: 'Высоковольтный неоновый разряд', reqLevel: 3, unlockReq: 'Уровень 3' },
  { id: 'skull_x', name: 'Череп взломщика', icon: '💀', desc: 'Голографический череп нетраннера', reqAch: 'NEUROMANCER', unlockReq: 'Победа над Нейромантом' }
];

export const SKINS_O = [
  { id: 'classic_o', name: 'Плазменный круг', icon: '◯', desc: 'Классическое фотонное кольцо', unlockReq: 'Открыто изначально' },
  { id: 'shield_o', name: 'Силовой щит', icon: '🛡️', desc: 'Гексагональное защитное поле', reqLevel: 2, unlockReq: 'Уровень 2' },
  { id: 'eye_o', name: 'Кибер-око', icon: '👁️', desc: 'Оптический сканер корпорации', reqMatches: 10, unlockReq: '10 матчей' },
  { id: 'portal_o', name: 'Сингулярность', icon: '🌀', desc: 'Квантовый гравитационный портал', reqLevel: 5, unlockReq: 'Уровень 5' }
];

const STORAGE_KEYS = {
  SCORES: 'cyber_xo_scores',
  MODE: 'cyber_xo_mode',
  TYPE: 'cyber_xo_game_type',
  DIFF: 'cyber_xo_diff',
  THEME: 'cyber_xo_theme',
  CRT: 'cyber_xo_crt',
  STATS: 'cyber_xo_stats',
  ACHIEVEMENTS: 'cyber_xo_achievements',
  XP: 'cyber_xo_xp',
  SKIN_X: 'cyber_xo_skin_x',
  SKIN_O: 'cyber_xo_skin_o',
  PERKS: 'cyber_xo_perks'
};

class GameState {
  constructor() {
    this.gameType = localStorage.getItem(STORAGE_KEYS.TYPE) || 'classic'; // 'classic' | 'infinity' | 'blitz' | 'grid4'
    this.gameMode = localStorage.getItem(STORAGE_KEYS.MODE) || 'pve';     // 'pvp' | 'pve' | 'p2p'
    this.aiDifficulty = localStorage.getItem(STORAGE_KEYS.DIFF) || 'unbeatable'; // 'easy' | 'medium' | 'unbeatable'
    this.theme = localStorage.getItem(STORAGE_KEYS.THEME) || 'cyber';     // 'cyber' | 'matrix' | 'outrun' | 'blood'
    this.isCrt = localStorage.getItem(STORAGE_KEYS.CRT) === 'true';

    this.gridSize = this.gameType === 'grid4' ? 4 : 3;
    const totalCells = this.gridSize * this.gridSize;
    this.board = Array(totalCells).fill(null);
    
    this.currentPlayer = 'X';
    this.scores = this.loadScores();
    this.stats = this.loadStats();
    this.achievements = this.loadAchievements();
    this.xp = this.loadXp();
    this.skinX = localStorage.getItem(STORAGE_KEYS.SKIN_X) || 'classic_x';
    this.skinO = localStorage.getItem(STORAGE_KEYS.SKIN_O) || 'classic_o';
    this.perksEnabled = localStorage.getItem(STORAGE_KEYS.PERKS) === 'true';
    this.playerPerks = {
      X: { emp: 1, cryo: 1, overdrive: 1 },
      O: { emp: 1, cryo: 1, overdrive: 1 }
    };
    this.frozenCells = {};
    this.overdriveTurnsLeft = 0;
    this.usedOverdriveThisRound = false;
    this.p2pPlayerSymbol = 'X';
    this.roundMoveCount = 0;
    this.roundDissolveCount = 0;

    // Track active mode & theme in stats
    if (!this.stats.modesPlayed.includes(this.gameType)) {
      this.stats.modesPlayed.push(this.gameType);
      this.saveStats();
    }
    if (!this.stats.themesTried.includes(this.theme)) {
      this.stats.themesTried.push(this.theme);
      this.saveStats();
    }

    this.isGameOver = false;
    this.winner = null;
    this.winningLine = null;
    this.isAiThinking = false;
    this.moveHistory = [];
    
    // Ghost marks tracking for Infinity XO
    this.ghostMoves = { X: [], O: [] };

    // Blitz timer parameters
    this.blitzDuration = 5; // 5 seconds per turn
    this.blitzTimeRemaining = 5;
  }

  getWinningCombos() {
    return this.gridSize === 4 ? WINNING_COMBOS_4X4 : WINNING_COMBOS_3X3;
  }

  loadScores() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCORES);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          X: Number(parsed.X) || 0,
          O: Number(parsed.O) || 0,
          ties: Number(parsed.ties) || 0
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved scores:', e);
    }
    return { X: 0, O: 0, ties: 0 };
  }

  saveScores() {
    try {
      localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(this.scores));
    } catch (e) {
      console.warn('Failed to save scores:', e);
    }
  }

  setGameType(type) {
    if (['classic', 'infinity', 'blitz', 'grid4'].includes(type)) {
      this.gameType = type;
      localStorage.setItem(STORAGE_KEYS.TYPE, type);
      this.gridSize = type === 'grid4' ? 4 : 3;
      if (!this.stats.modesPlayed.includes(type)) {
        this.stats.modesPlayed.push(type);
        this.saveStats();
      }
      this.resetRound();
    }
  }

  setGameMode(mode) {
    if (mode === 'pvp' || mode === 'pve' || mode === 'p2p') {
      this.gameMode = mode;
      localStorage.setItem(STORAGE_KEYS.MODE, mode);
    }
  }

  setDifficulty(diff) {
    if (['easy', 'medium', 'unbeatable'].includes(diff)) {
      this.aiDifficulty = diff;
      localStorage.setItem(STORAGE_KEYS.DIFF, diff);
    }
  }

  setTheme(theme) {
    if (['cyber', 'matrix', 'outrun', 'blood'].includes(theme)) {
      this.theme = theme;
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      if (!this.stats.themesTried.includes(theme)) {
        this.stats.themesTried.push(theme);
        this.saveStats();
      }
    }
    return this.theme;
  }

  toggleCrt() {
    this.isCrt = !this.isCrt;
    localStorage.setItem(STORAGE_KEYS.CRT, this.isCrt.toString());
    return this.isCrt;
  }

  /**
   * Returns the cell index that is next in line to dissolve for player (if any)
   */
  getExpiringGhostCell(player = this.currentPlayer) {
    if (this.gameType === 'infinity' && this.ghostMoves[player].length === 3) {
      return this.ghostMoves[player][0];
    }
    return null;
  }

  makeMove(index, player) {
    if (this.board[index] !== null || this.isGameOver) {
      return { success: false, dissolved: null };
    }

    let dissolvedCell = null;

    // Infinity XO rule: max 3 marks per player
    if (this.gameType === 'infinity') {
      if (this.ghostMoves[player].length >= 3) {
        dissolvedCell = this.ghostMoves[player].shift();
        this.board[dissolvedCell] = null;
        this.roundDissolveCount++;
      }
      this.ghostMoves[player].push(index);
    }

    this.board[index] = player;
    this.roundMoveCount++;
    this.moveHistory.push({ index, player, dissolved: dissolvedCell });
    return { success: true, dissolved: dissolvedCell };
  }

  switchTurn() {
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    this.blitzTimeRemaining = this.blitzDuration;
    return this.currentPlayer;
  }

  checkGameEnd() {
    const combos = this.getWinningCombos();

    // Check win condition
    for (const line of combos) {
      const first = this.board[line[0]];
      if (first && line.every(idx => this.board[idx] === first)) {
        this.isGameOver = true;
        this.winner = first;
        this.winningLine = line;
        this.scores[this.winner]++;
        this.saveScores();
        return { status: 'win', winner: this.winner, line };
      }
    }

    // Check tie condition (in Infinity XO, ties are virtually eliminated)
    if (this.board.every(cell => cell !== null)) {
      this.isGameOver = true;
      this.winner = 'tie';
      this.winningLine = null;
      this.scores.ties++;
      this.saveScores();
      return { status: 'tie', winner: 'tie', line: null };
    }

    return null; // Game continues
  }

  loadStats() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          totalMatches: Number(parsed.totalMatches) || 0,
          wins: Number(parsed.wins) || 0,
          losses: Number(parsed.losses) || 0,
          ties: Number(parsed.ties) || 0,
          currentStreak: Number(parsed.currentStreak) || 0,
          maxStreak: Number(parsed.maxStreak) || 0,
          modesPlayed: Array.isArray(parsed.modesPlayed) ? parsed.modesPlayed : ['classic'],
          themesTried: Array.isArray(parsed.themesTried) ? parsed.themesTried : ['cyber'],
          p2pReactionsSent: Number(parsed.p2pReactionsSent) || 0
        };
      }
    } catch (e) {}
    return {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      currentStreak: 0,
      maxStreak: 0,
      modesPlayed: ['classic'],
      themesTried: ['cyber'],
      p2pReactionsSent: 0
    };
  }

  saveStats() {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.stats));
    } catch (e) {}
  }

  loadAchievements() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  }

  saveAchievements() {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(this.achievements));
    } catch (e) {}
  }

  loadXp() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.XP);
      if (saved) return Number(saved) || 0;
    } catch (e) {}
    return 0;
  }

  saveXp() {
    try {
      localStorage.setItem(STORAGE_KEYS.XP, String(this.xp));
    } catch (e) {}
  }

  /**
   * Calculates current Cyber Rank details based on XP
   */
  getRankInfo(customXp = null) {
    const xp = customXp !== null ? customXp : this.xp;
    let currentRank = CYBER_RANKS[0];
    let nextRank = null;

    for (let i = 0; i < CYBER_RANKS.length; i++) {
      if (xp >= CYBER_RANKS[i].minXp) {
        currentRank = CYBER_RANKS[i];
        nextRank = CYBER_RANKS[i + 1] || null;
      } else {
        break;
      }
    }

    let progressPercent = 100;
    let xpInCurrentLevel = 0;
    let xpNeededForNext = 0;

    if (nextRank) {
      const range = nextRank.minXp - currentRank.minXp;
      xpInCurrentLevel = xp - currentRank.minXp;
      xpNeededForNext = nextRank.minXp - xp;
      progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / range) * 100)));
    }

    return {
      level: currentRank.level,
      title: currentRank.title,
      icon: currentRank.icon,
      currentXp: xp,
      minXp: currentRank.minXp,
      nextRankMinXp: nextRank ? nextRank.minXp : xp,
      nextRankTitle: nextRank ? nextRank.title : null,
      xpNeededForNext,
      progressPercent,
      isMaxRank: !nextRank
    };
  }

  /**
   * Adds XP and detects level-up events
   */
  addXp(amount) {
    if (!amount || amount <= 0) return { added: 0, newXp: this.xp, leveledUp: false, rankInfo: this.getRankInfo() };

    const oldRank = this.getRankInfo();
    this.xp += amount;
    this.saveXp();
    const newRank = this.getRankInfo();

    const leveledUp = newRank.level > oldRank.level;
    return {
      added: amount,
      newXp: this.xp,
      oldLevel: oldRank.level,
      newLevel: newRank.level,
      leveledUp,
      rankInfo: newRank
    };
  }

  /**
   * Checks if a skin is unlocked for a given symbol
   */
  isSkinUnlocked(symbol, skinId) {
    const list = symbol === 'X' ? SKINS_X : SKINS_O;
    const skin = list.find(s => s.id === skinId);
    if (!skin) return false;

    // Default skins are always unlocked
    if (skinId === 'classic_x' || skinId === 'classic_o') return true;

    const rank = this.getRankInfo();

    if (skin.reqLevel && rank.level >= skin.reqLevel) return true;
    if (skin.reqWins && this.stats.wins >= skin.reqWins) return true;
    if (skin.reqMatches && this.stats.totalMatches >= skin.reqMatches) return true;
    if (skin.reqAch && this.achievements.includes(skin.reqAch)) return true;

    return false;
  }

  /**
   * Sets the active skin for X or O
   */
  setSkin(symbol, skinId) {
    if (!this.isSkinUnlocked(symbol, skinId)) return false;

    if (symbol === 'X') {
      this.skinX = skinId;
      try { localStorage.setItem(STORAGE_KEYS.SKIN_X, skinId); } catch (e) {}
    } else {
      this.skinO = skinId;
      try { localStorage.setItem(STORAGE_KEYS.SKIN_O, skinId); } catch (e) {}
    }
    return true;
  }

  getSkin(symbol) {
    return symbol === 'X' ? this.skinX : this.skinO;
  }

  swapP2PSymbol() {
    this.p2pPlayerSymbol = (this.p2pPlayerSymbol === 'X') ? 'O' : 'X';
    return this.p2pPlayerSymbol;
  }

  resetAllStats() {
    this.stats = {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      currentStreak: 0,
      maxStreak: 0,
      modesPlayed: [this.gameType],
      themesTried: [this.theme],
      p2pReactionsSent: 0
    };
    this.saveStats();
  }

  /**
   * On-demand achievement trigger (e.g. for CRT, BGM, reactions, rematch)
   */
  triggerAchievement(id) {
    if (!this.achievements.includes(id)) {
      this.achievements.push(id);
      this.saveAchievements();
      const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
      return ach || null;
    }
    return null;
  }

  /**
   * Checks passive/retroactive achievements
   */
  checkPassiveAchievements() {
    const newlyUnlocked = [];
    const unlock = (id) => {
      if (!this.achievements.includes(id)) {
        this.achievements.push(id);
        const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
        if (ach) newlyUnlocked.push(ach);
      }
    };

    if (this.stats.totalMatches >= 5) unlock('MATCHES_5');
    if (this.stats.totalMatches >= 10) unlock('MATCHES_10');
    if (this.stats.totalMatches >= 25) unlock('MATCHES_25');

    if (this.stats.currentStreak >= 3 || this.stats.maxStreak >= 3) unlock('STREAK_3');
    if (this.stats.currentStreak >= 5 || this.stats.maxStreak >= 5) unlock('STREAK_5');

    if (['classic', 'infinity', 'blitz', 'grid4'].every(m => this.stats.modesPlayed && this.stats.modesPlayed.includes(m))) {
      unlock('ALL_MODES');
    }

    if (['cyber', 'matrix', 'outrun', 'blood'].every(t => this.stats.themesTried && this.stats.themesTried.includes(t))) {
      unlock('THEME_COLLECTOR');
    }

    if (this.isCrt) {
      unlock('CRT_NOSTALGIA');
    }

    if (newlyUnlocked.length > 0) {
      this.saveAchievements();
    }
    return newlyUnlocked;
  }

  checkAchievements(isWin, isTie, isLoss, extraContext = {}) {
    const newlyUnlocked = [];
    const unlock = (id) => {
      if (!this.achievements.includes(id)) {
        this.achievements.push(id);
        const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
        if (ach) newlyUnlocked.push(ach);
      }
    };

    const winningLine = extraContext.winningLine || this.winningLine;
    const blitzRemaining = extraContext.blitzRemaining != null ? extraContext.blitzRemaining : this.blitzTimeRemaining;

    // Matches milestones
    if (this.stats.totalMatches >= 5) unlock('MATCHES_5');
    if (this.stats.totalMatches >= 10) unlock('MATCHES_10');
    if (this.stats.totalMatches >= 25) unlock('MATCHES_25');

    // Streaks milestones
    if (this.stats.currentStreak >= 3 || this.stats.maxStreak >= 3) unlock('STREAK_3');
    if (this.stats.currentStreak >= 5 || this.stats.maxStreak >= 5) unlock('STREAK_5');

    if (isWin) {
      unlock('FIRST_WIN');

      // AI difficulty
      if (this.gameMode === 'pve') {
        if (this.aiDifficulty === 'easy') unlock('AI_EASY');
        if (this.aiDifficulty === 'medium') unlock('AI_MEDIUM');
        if (this.aiDifficulty === 'unbeatable') unlock('NEUROMANCER');
      }

      // Blitz mode
      if (this.gameType === 'blitz') {
        unlock('BLITZ_SPEED');
        if (blitzRemaining < 1.0) {
          unlock('BLITZ_CLUTCH');
        }
      }

      // 4x4 Grid mode
      if (this.gameType === 'grid4') {
        unlock('GRID_ARCHITECT');
      }

      // Infinity mode master (won after 3+ dissolves)
      if (this.gameType === 'infinity' && this.roundDissolveCount >= 3) {
        unlock('INFINITY_MASTER');
      }

      // P2P Duel
      if (this.gameMode === 'p2p') {
        unlock('P2P_GHOST');
      }

      // Board geometry (Diagonal, Row, Column)
      if (winningLine && winningLine.length >= 3) {
        const lineStr = winningLine.join();
        const isDiag = (this.gridSize === 3 && (lineStr === '0,4,8' || lineStr === '2,4,6')) ||
                       (this.gridSize === 4 && (lineStr === '0,5,10,15' || lineStr === '3,6,9,12'));
        const isRow = (this.gridSize === 3 && ['0,1,2', '3,4,5', '6,7,8'].includes(lineStr)) ||
                      (this.gridSize === 4 && ['0,1,2,3', '4,5,6,7', '8,9,10,11', '12,13,14,15'].includes(lineStr));
        const isCol = (this.gridSize === 3 && ['0,3,6', '1,4,7', '2,5,8'].includes(lineStr)) ||
                      (this.gridSize === 4 && ['0,4,8,12', '1,5,9,13', '2,6,10,14', '3,7,11,15'].includes(lineStr));

        if (isDiag) unlock('DIAGONAL_WIN');
        if (isRow) unlock('ROW_WIN');
        if (isCol) unlock('COL_WIN');
      }
    }

    if (isTie) {
      unlock('PEACEFUL_TIE');
    }

    // Infinity survivor (survived 8+ moves in round)
    if (this.gameType === 'infinity' && this.roundMoveCount >= 8) {
      unlock('INFINITY_SURVIVOR');
    }

    // Modes & Themes
    if (['classic', 'infinity', 'blitz', 'grid4'].every(m => this.stats.modesPlayed && this.stats.modesPlayed.includes(m))) {
      unlock('ALL_MODES');
    }

    if (['cyber', 'matrix', 'outrun', 'blood'].every(t => this.stats.themesTried && this.stats.themesTried.includes(t))) {
      unlock('THEME_COLLECTOR');
    }

    if (newlyUnlocked.length > 0) {
      this.saveAchievements();
    }
    return newlyUnlocked;
  }

  recordGameOutcome(isWin, isTie, isLoss, extraContext = {}) {
    this.stats.totalMatches++;
    if (isWin) {
      this.stats.wins++;
      this.stats.currentStreak++;
      if (this.stats.currentStreak > this.stats.maxStreak) {
        this.stats.maxStreak = this.stats.currentStreak;
      }
    } else if (isLoss) {
      this.stats.losses++;
      this.stats.currentStreak = 0;
    } else if (isTie) {
      this.stats.ties++;
    }

    this.saveStats();
    return this.checkAchievements(isWin, isTie, isLoss, extraContext);
  }

  togglePerksEnabled() {
    this.perksEnabled = !this.perksEnabled;
    try {
      localStorage.setItem(STORAGE_KEYS.PERKS, this.perksEnabled ? 'true' : 'false');
    } catch (e) {}
    return this.perksEnabled;
  }

  resetPerks() {
    this.playerPerks = {
      X: { emp: 1, cryo: 1, overdrive: 1 },
      O: { emp: 1, cryo: 1, overdrive: 1 }
    };
    this.frozenCells = {};
    this.overdriveTurnsLeft = 0;
    this.usedOverdriveThisRound = false;
  }

  hasPerk(player, perkId) {
    return !!(this.playerPerks[player] && this.playerPerks[player][perkId] > 0);
  }

  usePerk(player, perkId) {
    if (this.hasPerk(player, perkId)) {
      this.playerPerks[player][perkId]--;
      return true;
    }
    return false;
  }

  freezeCell(index, turns = 2) {
    this.frozenCells[index] = turns;
  }

  isCellFrozen(index) {
    return (this.frozenCells[index] || 0) > 0;
  }

  tickFrozenCells() {
    const unfrozen = [];
    for (const idx in this.frozenCells) {
      if (this.frozenCells[idx] > 0) {
        this.frozenCells[idx]--;
        if (this.frozenCells[idx] === 0) {
          delete this.frozenCells[idx];
          unfrozen.push(parseInt(idx, 10));
        }
      }
    }
    return unfrozen;
  }

  removeMark(index) {
    if (this.board[index] !== null) {
      const player = this.board[index];
      this.board[index] = null;
      if (this.gameType === 'infinity' && this.ghostMoves[player]) {
        this.ghostMoves[player] = this.ghostMoves[player].filter(i => i !== index);
      }
      return player;
    }
    return null;
  }

  resetRound() {
    this.resetPerks();
    const totalCells = this.gridSize * this.gridSize;
    this.board = Array(totalCells).fill(null);
    this.currentPlayer = 'X';
    this.isGameOver = false;
    this.winner = null;
    this.winningLine = null;
    this.isAiThinking = false;
    this.moveHistory = [];
    this.ghostMoves = { X: [], O: [] };
    this.blitzTimeRemaining = this.blitzDuration;
    this.roundMoveCount = 0;
    this.roundDissolveCount = 0;
  }

  resetScores() {
    this.scores = { X: 0, O: 0, ties: 0 };
    this.saveScores();
  }
}

export const state = new GameState();
