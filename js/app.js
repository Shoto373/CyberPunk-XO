/**
 * APP.JS - Application Orchestrator & Event Binding
 * Main Entry Point for Cyber XO Game
 */

import { state } from './state.js';
import { sound } from './audio.js';
import { particles } from './particles.js';
import { getAiMove } from './ai.js';
import { ui } from './ui.js';

class CyberTicTacToe {
  constructor() {
    this.init();
  }

  init() {
    // Restore UI from state
    ui.updateScoreboard(state);
    ui.updateModeUI(state.gameMode);
    ui.updateDifficultyUI(state.aiDifficulty);
    ui.updateAudioIcon(sound.getMuted());

    // Bind DOM events
    this.bindEvents();
  }

  bindEvents() {
    // Cell clicks
    ui.cells.forEach(cell => {
      cell.addEventListener('click', (e) => {
        const index = parseInt(cell.getAttribute('data-index'), 10);
        this.handleCellClick(index);
      });
    });

    // Game Mode Switcher (PVP / PVE)
    ui.btnModePvp.addEventListener('click', () => {
      if (state.gameMode !== 'pvp') {
        sound.playClick();
        state.setGameMode('pvp');
        ui.updateModeUI('pvp');
        this.startNewRound();
      }
    });

    ui.btnModePve.addEventListener('click', () => {
      if (state.gameMode !== 'pve') {
        sound.playClick();
        state.setGameMode('pve');
        ui.updateModeUI('pve');
        this.startNewRound();
      }
    });

    // Difficulty Chips
    ui.diffChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const diff = chip.getAttribute('data-diff');
        if (state.aiDifficulty !== diff) {
          sound.playClick();
          state.setDifficulty(diff);
          ui.updateDifficultyUI(diff);
        }
      });
    });

    // Audio Mute Toggle
    ui.btnAudio.addEventListener('click', () => {
      sound.initContext();
      const isMuted = sound.toggleMute();
      ui.updateAudioIcon(isMuted);
      if (!isMuted) sound.playClick();
    });

    // New Round Button
    ui.btnNewRound.addEventListener('click', () => {
      sound.playClick();
      this.startNewRound();
    });

    // Reset Score Button
    ui.btnResetScore.addEventListener('click', () => {
      sound.playClick();
      state.resetScores();
      ui.updateScoreboard(state);
    });

    // Modal Actions
    ui.btnModalRematch.addEventListener('click', () => {
      sound.playClick();
      this.startNewRound();
    });

    ui.btnModalClose.addEventListener('click', () => {
      sound.playClick();
      ui.hideModal();
    });

    // Initialize Web Audio on first user interaction anywhere
    const unlockAudio = () => {
      sound.initContext();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
  }

  /**
   * Handles user move on cell click
   */
  handleCellClick(index) {
    if (state.isGameOver || state.isAiThinking) return;
    if (state.board[index] !== null) return;

    this.executeMove(index, state.currentPlayer);

    // If PVE mode and game still in progress, queue AI turn
    if (state.gameMode === 'pve' && !state.isGameOver && state.currentPlayer === 'O') {
      this.triggerAiTurn();
    }
  }

  /**
   * Executes a move on the board for the specified player
   */
  executeMove(index, player) {
    const success = state.makeMove(index, player);
    if (!success) return;

    // Render mark SVG with laser/plasma animation
    ui.renderCell(index, player);

    // Play procedural sound
    if (player === 'X') {
      sound.playMoveX();
    } else {
      sound.playMoveO();
    }

    // Check game condition
    const result = state.checkGameEnd();

    if (result) {
      this.handleGameEnd(result);
    } else {
      state.switchTurn();
      ui.updateScoreboard(state);
    }
  }

  /**
   * Handles AI move with deliberate cinematic thinking delay
   */
  triggerAiTurn() {
    state.isAiThinking = true;
    ui.setAiThinking(true);

    // Natural cyber-thought delay (380-480ms)
    const delay = Math.floor(Math.random() * 100) + 380;

    setTimeout(() => {
      if (state.isGameOver) {
        state.isAiThinking = false;
        ui.setAiThinking(false);
        return;
      }

      const bestMove = getAiMove(state.board, state.aiDifficulty, 'O', 'X');

      state.isAiThinking = false;
      ui.setAiThinking(false);

      if (bestMove !== null && state.board[bestMove] === null) {
        this.executeMove(bestMove, 'O');
      }
    }, delay);
  }

  /**
   * Handles triumph / tie results
   */
  handleGameEnd(result) {
    ui.updateScoreboard(state);

    if (result.status === 'win') {
      // 1. Draw glowing laser strike line
      ui.drawStrikeLine(result.line);

      // 2. Screen shake
      ui.triggerScreenShake();

      // 3. Victory audio fanfare
      sound.playWin();

      // 4. Neon fireworks / Confetti
      const boardRect = ui.boardContainer.getBoundingClientRect();
      const originX = boardRect.left + boardRect.width / 2;
      const originY = boardRect.top + boardRect.height / 2;

      particles.fireVictory(originX, originY);
      setTimeout(() => {
        particles.fireVictory(originX - 100, originY - 50);
      }, 180);
      setTimeout(() => {
        particles.fireVictory(originX + 100, originY - 50);
      }, 360);

      // 5. Victory Modal
      ui.showResultModal(result, state.gameMode);
    } else if (result.status === 'tie') {
      ui.triggerScreenShake();
      sound.playDraw();
      ui.showResultModal(result, state.gameMode);
    }
  }

  /**
   * Soft-resets the board for a new round
   */
  startNewRound() {
    state.resetRound();
    ui.clearBoard();
    ui.updateScoreboard(state);
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CyberTicTacToe();
});
