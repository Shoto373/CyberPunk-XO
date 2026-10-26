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
    this.blitzInterval = null;
    this.init();
  }

  init() {
    // Synchronize UI from initial state
    ui.updateScoreboard(state);
    ui.updateModeUI(state.gameMode);
    ui.updateDifficultyUI(state.aiDifficulty);
    ui.updateGameTypeCards(state.gameType);
    ui.updateAudioIcon(sound.getMuted());
    ui.applyTheme(state.theme);
    ui.applyCrt(state.isCrt);
    ui.updateBgmUI(sound.getBgmActive());

    // Build initial board
    this.rebuildGameBoard();

    // Default to main menu
    ui.showMenuScreen();

    // Bind DOM events
    this.bindEvents();
  }

  rebuildGameBoard() {
    ui.buildBoard(state.gridSize, (index) => {
      this.handleCellClick(index);
    });
  }

  bindEvents() {
    // Mode Cards in Main Menu
    ui.modeCards.forEach(card => {
      card.addEventListener('click', () => {
        const selectedType = card.getAttribute('data-mode-type');
        sound.playClick();
        state.setGameType(selectedType);
        ui.updateGameTypeCards(selectedType);
        this.rebuildGameBoard();
      });
    });

    // Theme Selection Chips
    ui.themeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const theme = chip.getAttribute('data-theme');
        sound.playClick();
        state.setTheme(theme);
        ui.applyTheme(theme);
        ui.triggerGlitch();
      });
    });

    // CRT Scanlines Toggle
    ui.btnToggleCrts.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        const isCrt = state.toggleCrt();
        ui.applyCrt(isCrt);
        ui.triggerGlitch();
      });
    });

    // BGM Ambient Toggle
    ui.btnBgms.forEach(btn => {
      btn.addEventListener('click', () => {
        const isPlaying = sound.toggleBgm();
        ui.updateBgmUI(isPlaying);
        if (isPlaying) sound.playClick();
      });
    });

    // Start Game from Menu
    if (ui.btnStartGame) {
      ui.btnStartGame.addEventListener('click', () => {
        sound.playClick();
        this.startNewRound();
        ui.showGameScreen();
      });
    }

    // Back to Menu from HUD
    if (ui.btnBackMenu) {
      ui.btnBackMenu.addEventListener('click', () => {
        sound.playClick();
        this.stopBlitzTimer();
        ui.showMenuScreen();
      });
    }

    // Opponent Switcher (PVP / PVE)
    if (ui.btnModePvp) {
      ui.btnModePvp.addEventListener('click', () => {
        if (state.gameMode !== 'pvp') {
          sound.playClick();
          state.setGameMode('pvp');
          ui.updateModeUI('pvp');
          this.startNewRound();
        }
      });
    }

    if (ui.btnModePve) {
      ui.btnModePve.addEventListener('click', () => {
        if (state.gameMode !== 'pve') {
          sound.playClick();
          state.setGameMode('pve');
          ui.updateModeUI('pve');
          this.startNewRound();
        }
      });
    }

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
    ui.btnAudios.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.initContext();
        const isMuted = sound.toggleMute();
        ui.updateAudioIcon(isMuted);
        if (!isMuted) sound.playClick();
      });
    });

    // New Round Button
    if (ui.btnNewRound) {
      ui.btnNewRound.addEventListener('click', () => {
        sound.playClick();
        this.startNewRound();
      });
    }

    // Reset Score Button
    if (ui.btnResetScore) {
      ui.btnResetScore.addEventListener('click', () => {
        sound.playClick();
        state.resetScores();
        ui.updateScoreboard(state);
      });
    }

    // Modal Actions
    if (ui.btnModalRematch) {
      ui.btnModalRematch.addEventListener('click', () => {
        sound.playClick();
        this.startNewRound();
      });
    }

    if (ui.btnModalClose) {
      ui.btnModalClose.addEventListener('click', () => {
        sound.playClick();
        ui.hideModal();
      });
    }

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

    // If PVE mode and game still active, queue AI turn
    if (state.gameMode === 'pve' && !state.isGameOver && state.currentPlayer === 'O') {
      this.triggerAiTurn();
    }
  }

  /**
   * Executes a move on the board for the specified player
   */
  executeMove(index, player) {
    const { success, dissolved } = state.makeMove(index, player);
    if (!success) return;

    // Handle dissolved ghost mark in Infinity XO mode
    if (dissolved !== null) {
      sound.playDissolve();
      ui.dissolveCell(dissolved);
    }

    // Render mark SVG with laser/plasma animation
    ui.renderCell(index, player);

    // Play procedural move sound
    if (player === 'X') {
      sound.playMoveX();
    } else {
      sound.playMoveO();
    }

    // Check game outcome
    const result = state.checkGameEnd();

    if (result) {
      this.stopBlitzTimer();
      this.handleGameEnd(result);
    } else {
      state.switchTurn();
      ui.updateScoreboard(state);

      // Update Ghost mark warning beacon for the new player
      if (state.gameType === 'infinity') {
        const nextExpiring = state.getExpiringGhostCell(state.currentPlayer);
        if (nextExpiring !== null) {
          ui.setGhostWarning(nextExpiring);
        } else {
          ui.clearGhostWarnings();
        }
      }

      // Reset Blitz timer for next turn
      if (state.gameType === 'blitz') {
        this.startBlitzTimer();
      }
    }
  }

  /**
   * Handles AI move with deliberate cinematic thinking delay
   */
  triggerAiTurn() {
    state.isAiThinking = true;
    ui.setAiThinking(true);

    const delay = Math.floor(Math.random() * 90) + 360;

    setTimeout(() => {
      if (state.isGameOver) {
        state.isAiThinking = false;
        ui.setAiThinking(false);
        return;
      }

      const bestMove = getAiMove(
        state.board,
        state.aiDifficulty,
        'O',
        'X',
        state.gameType,
        state.ghostMoves
      );

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
    ui.clearGhostWarnings();
    ui.updateScoreboard(state);

    if (result.status === 'win') {
      ui.drawStrikeLine(result.line, state.gridSize);
      ui.triggerScreenShake();
      ui.triggerGlitch();
      sound.playWin();

      const boardRect = ui.boardContainer.getBoundingClientRect();
      const originX = boardRect.left + boardRect.width / 2;
      const originY = boardRect.top + boardRect.height / 2;

      particles.fireVictory(originX, originY);
      setTimeout(() => particles.fireVictory(originX - 100, originY - 50), 180);
      setTimeout(() => particles.fireVictory(originX + 100, originY - 50), 360);

      ui.showResultModal(result, state.gameMode);
    } else if (result.status === 'tie') {
      ui.triggerScreenShake();
      sound.playDraw();
      ui.showResultModal(result, state.gameMode);
    }
  }

  /**
   * Blitz Timer Management
   */
  startBlitzTimer() {
    this.stopBlitzTimer();
    ui.setBlitzVisibility(true);
    state.blitzTimeRemaining = state.blitzDuration;
    ui.updateBlitzTimer(state.blitzTimeRemaining, state.blitzDuration, false);

    let lastTickSecond = Math.ceil(state.blitzTimeRemaining);

    this.blitzInterval = setInterval(() => {
      if (state.isGameOver || state.isAiThinking) return;

      state.blitzTimeRemaining -= 0.1;
      const isUrgent = state.blitzTimeRemaining <= 2.0;

      // Play sound tick on second boundaries
      const currentSecond = Math.ceil(state.blitzTimeRemaining);
      if (currentSecond !== lastTickSecond && currentSecond <= 3 && currentSecond > 0) {
        sound.playTimerTick(isUrgent);
        lastTickSecond = currentSecond;
      }

      if (state.blitzTimeRemaining <= 0) {
        this.stopBlitzTimer();
        ui.updateBlitzTimer(0, state.blitzDuration, true);
        sound.playTimerAlarm();
        this.handleBlitzTimeout();
      } else {
        ui.updateBlitzTimer(state.blitzTimeRemaining, state.blitzDuration, isUrgent);
      }
    }, 100);
  }

  stopBlitzTimer() {
    if (this.blitzInterval) {
      clearInterval(this.blitzInterval);
      this.blitzInterval = null;
    }
  }

  handleBlitzTimeout() {
    if (state.isGameOver) return;

    ui.triggerScreenShake();

    // Turn timeout: player loses turn or makes a forced random move
    const available = [];
    for (let i = 0; i < state.board.length; i++) {
      if (state.board[i] === null) available.push(i);
    }

    if (available.length > 0) {
      const forcedMove = available[Math.floor(Math.random() * available.length)];
      this.executeMove(forcedMove, state.currentPlayer);

      if (state.gameMode === 'pve' && !state.isGameOver && state.currentPlayer === 'O') {
        this.triggerAiTurn();
      }
    }
  }

  /**
   * Starts a new round
   */
  startNewRound() {
    this.stopBlitzTimer();
    state.resetRound();
    this.rebuildGameBoard();
    ui.clearBoard();
    ui.updateScoreboard(state);
    ui.updateGameTypeCards(state.gameType);

    if (state.gameType === 'blitz') {
      this.startBlitzTimer();
    } else {
      ui.setBlitzVisibility(false);
    }
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CyberTicTacToe();
});
