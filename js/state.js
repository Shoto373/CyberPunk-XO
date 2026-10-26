/**
 * STATE.JS - Centralized State Management & LocalStorage Persistence
 */

export const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

const STORAGE_KEYS = {
  SCORES: 'cyber_xo_scores',
  MODE: 'cyber_xo_mode',
  DIFF: 'cyber_xo_diff'
};

class GameState {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X'; // X starts first
    this.gameMode = localStorage.getItem(STORAGE_KEYS.MODE) || 'pve'; // 'pvp' | 'pve'
    this.aiDifficulty = localStorage.getItem(STORAGE_KEYS.DIFF) || 'unbeatable'; // 'easy' | 'medium' | 'unbeatable'
    this.scores = this.loadScores();
    this.isGameOver = false;
    this.winner = null; // 'X' | 'O' | 'tie' | null
    this.winningLine = null; // [a, b, c] | null
    this.isAiThinking = false;
    this.moveHistory = [];
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

  setGameMode(mode) {
    if (mode === 'pvp' || mode === 'pve') {
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

  makeMove(index, player) {
    if (this.board[index] !== null || this.isGameOver) {
      return false;
    }
    this.board[index] = player;
    this.moveHistory.push({ index, player });
    return true;
  }

  switchTurn() {
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    return this.currentPlayer;
  }

  checkGameEnd() {
    // Check win
    for (const line of WINNING_COMBOS) {
      const [a, b, c] = line;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.isGameOver = true;
        this.winner = this.board[a];
        this.winningLine = line;
        this.scores[this.winner]++;
        this.saveScores();
        return { status: 'win', winner: this.winner, line };
      }
    }

    // Check tie
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

  resetRound() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.isGameOver = false;
    this.winner = null;
    this.winningLine = null;
    this.isAiThinking = false;
    this.moveHistory = [];
  }

  resetScores() {
    this.scores = { X: 0, O: 0, ties: 0 };
    this.saveScores();
  }
}

export const state = new GameState();
