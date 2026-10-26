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

  // --- SYSTEM & CUSTOMIZATION ---
  { id: 'THEME_COLLECTOR', icon: '🎨', title: 'Хроматический спектр', desc: 'Опробуйте все 4 неоновые визуальные темы' },
  { id: 'CRT_NOSTALGIA', icon: '📺', title: 'Ретро-хакер', desc: 'Активируйте аналоговый режим кинескопа CRT FX' },
  { id: 'SYNTHWAVE_VIBE', icon: '🎵', title: 'Синтетический пульс', desc: 'Включите фоновый Synthwave саундтрек' }
];

const STORAGE_KEYS = {
  SCORES: 'cyber_xo_scores',
  MODE: 'cyber_xo_mode',
  TYPE: 'cyber_xo_game_type',
  DIFF: 'cyber_xo_diff',
  THEME: 'cyber_xo_theme',
  CRT: 'cyber_xo_crt',
  STATS: 'cyber_xo_stats',
  ACHIEVEMENTS: 'cyber_xo_achievements'
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

  resetRound() {
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
