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
  { id: 'FIRST_WIN', icon: '⚡', title: 'Первая кровь', desc: 'Одержите первую победу в любом режиме' },
  { id: 'NEUROMANCER', icon: '🧠', title: 'Нейромант', desc: 'Победите кибер-ИИ на сложности «Мастер»' },
  { id: 'BLITZ_SPEED', icon: '⏱️', title: 'Кибер-молния', desc: 'Выиграйте матч в режиме Блиц 5с' },
  { id: 'INFINITY_SURVIVOR', icon: '♾️', title: 'Квантовый парадокс', desc: 'Сделайте 8 ходов в одном раунде Infinity XO' },
  { id: 'P2P_GHOST', icon: '🌐', title: 'Сетевой призрак', desc: 'Одержите победу в онлайн P2P дуэли' },
  { id: 'STREAK_3', icon: '🔥', title: 'Серийный взломщик', desc: 'Выиграйте 3 матча подряд без поражений' },
  { id: 'GRID_ARCHITECT', icon: '📐', title: 'Архитектор 4×4', desc: 'Соберите победную линию из 4 клеток' }
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
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      currentStreak: 0,
      maxStreak: 0
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
      maxStreak: 0
    };
    this.saveStats();
  }

  checkAchievements(isWin, isTie, isLoss) {
    const newlyUnlocked = [];
    const unlock = (id) => {
      if (!this.achievements.includes(id)) {
        this.achievements.push(id);
        const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
        if (ach) newlyUnlocked.push(ach);
      }
    };

    if (isWin) {
      unlock('FIRST_WIN');
      if (this.gameMode === 'pve' && this.aiDifficulty === 'unbeatable') {
        unlock('NEUROMANCER');
      }
      if (this.gameType === 'blitz') {
        unlock('BLITZ_SPEED');
      }
      if (this.gameMode === 'p2p') {
        unlock('P2P_GHOST');
      }
      if (this.stats.currentStreak >= 3) {
        unlock('STREAK_3');
      }
      if (this.gameType === 'grid4') {
        unlock('GRID_ARCHITECT');
      }
    }

    if (this.gameType === 'infinity' && this.roundMoveCount >= 8) {
      unlock('INFINITY_SURVIVOR');
    }

    if (newlyUnlocked.length > 0) {
      this.saveAchievements();
    }
    return newlyUnlocked;
  }

  recordGameOutcome(isWin, isTie, isLoss) {
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
    return this.checkAchievements(isWin, isTie, isLoss);
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
  }

  resetScores() {
    this.scores = { X: 0, O: 0, ties: 0 };
    this.saveScores();
  }
}

export const state = new GameState();
