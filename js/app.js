/**
 * APP.JS - Application Orchestrator, P2P Multiplayer & PWA Lifecycle
 * Main Entry Point for Cyber XO Game 3.0
 */

import { state } from './state.js';
import { sound } from './audio.js';
import { particles } from './particles.js';
import { getAiMove } from './ai.js';
import { ui } from './ui.js';
import { p2p } from './p2p.js';

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

    // Bind DOM events & P2P WebRTC networking
    this.bindEvents();
    this.initP2P();

    // Register Service Worker for offline PWA
    this.registerServiceWorker();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
          console.warn('ServiceWorker registration error:', err);
        });
      });
    }
  }

  rebuildGameBoard() {
    ui.buildBoard(state.gridSize, (index) => {
      this.handleCellClick(index);
    });
  }

  initP2P() {
    p2p.onConnectedCallback = (isHost, roomCode, symbol) => {
      state.p2pPlayerSymbol = symbol;
      state.setGameMode('p2p');
      ui.updateModeUI('p2p');
      if (ui.p2pStatusDot) ui.p2pStatusDot.classList.add('connected');
      if (ui.p2pStatusText) ui.p2pStatusText.textContent = `Соперник в сети! Ваша сторона: ${symbol}`;

      setTimeout(() => {
        this.startNewRound();
        ui.showGameScreen();
      }, 700);
    };

    p2p.onMoveCallback = (index) => {
      if (!state.isGameOver && state.board[index] === null) {
        this.executeMove(index, state.currentPlayer);
      }
    };

    p2p.onRematchCallback = () => {
      this.startNewRound();
    };

    p2p.onDisconnectCallback = () => {
      if (ui.p2pStatusDot) ui.p2pStatusDot.classList.remove('connected');
      if (ui.p2pStatusText) ui.p2pStatusText.textContent = 'Соперник отключился от сессии';
    };

    p2p.onErrorCallback = (err) => {
      if (ui.p2pStatusText) ui.p2pStatusText.textContent = err;
    };

    // Check URL parameters for ?room=ROOMCODE
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      state.setGameMode('p2p');
      ui.updateModeUI('p2p');
      if (ui.inputP2pCode) ui.inputP2pCode.value = roomParam;
      p2p.joinRoom(roomParam, (status) => {
        if (ui.p2pStatusText) ui.p2pStatusText.textContent = status;
      });
    }
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

    // BGM Ambient Music Toggle
    ui.btnBgms.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
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

    // Opponent Switcher (PVP / PVE / P2P)
    if (ui.btnModePvp) {
      ui.btnModePvp.addEventListener('click', () => {
        if (state.gameMode !== 'pvp') {
          sound.playClick();
          p2p.disconnect();
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
          p2p.disconnect();
          state.setGameMode('pve');
          ui.updateModeUI('pve');
          this.startNewRound();
        }
      });
    }

    if (ui.btnModeP2p) {
      ui.btnModeP2p.addEventListener('click', () => {
        if (state.gameMode !== 'p2p') {
          sound.playClick();
          state.setGameMode('p2p');
          ui.updateModeUI('p2p');
        }
      });
    }

    // P2P Room Host Button
    if (ui.btnP2pHost) {
      ui.btnP2pHost.addEventListener('click', () => {
        sound.playClick();
        const roomCode = p2p.createRoom(state.gameType, (status) => {
          if (ui.p2pStatusText) ui.p2pStatusText.textContent = status;
        });

        if (ui.p2pRoomBox) ui.p2pRoomBox.classList.add('visible');
        if (ui.p2pCodeBadge) ui.p2pCodeBadge.textContent = roomCode;
      });
    }

    // P2P Copy Share Link
    if (ui.btnP2pCopy) {
      ui.btnP2pCopy.addEventListener('click', async () => {
        sound.playClick();
        const copied = await p2p.copyShareLink();
        if (copied) {
          const original = ui.btnP2pCopy.textContent;
          ui.btnP2pCopy.textContent = '✓ СКОПИРОВАНО!';
          setTimeout(() => { ui.btnP2pCopy.textContent = original; }, 2000);
        }
      });
    }

    // P2P Join Room
    if (ui.btnP2pJoin && ui.inputP2pCode) {
      ui.btnP2pJoin.addEventListener('click', () => {
        const code = ui.inputP2pCode.value.trim();
        if (code) {
          sound.playClick();
          p2p.joinRoom(code, (status) => {
            if (ui.p2pStatusText) ui.p2pStatusText.textContent = status;
          });
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
        if (state.gameMode === 'p2p') {
          p2p.sendRematch();
        }
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
        if (state.gameMode === 'p2p') {
          p2p.sendRematch();
        }
        this.startNewRound();
      });
    }

    if (ui.btnModalClose) {
      ui.btnModalClose.addEventListener('click', () => {
        sound.playClick();
        ui.hideModal();
      });
    }

    // Unlock Web Audio on first user interaction anywhere
    const unlockAudio = () => {
      sound.initContext();
      ui.updateBgmUI(sound.getBgmActive());
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
  }

  /**
   * Handles user move on cell click
   */
  handleCellClick(index) {
    if (state.isGameOver || state.isAiThinking) return;
    if (state.board[index] !== null) return;

    // In P2P mode, check if it's local player's turn
    if (state.gameMode === 'p2p') {
      if (state.currentPlayer !== state.p2pPlayerSymbol) {
        return; // Opponent's turn
      }
      p2p.sendMove(index);
    }

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
      ui.triggerGlitch();
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
    ui.triggerGlitch();

    // In P2P mode, timeout transfers turn or auto-moves
    const available = [];
    for (let i = 0; i < state.board.length; i++) {
      if (state.board[i] === null) available.push(i);
    }

    if (available.length > 0) {
      const forcedMove = available[Math.floor(Math.random() * available.length)];
      if (state.gameMode === 'p2p' && state.currentPlayer === state.p2pPlayerSymbol) {
        p2p.sendMove(forcedMove);
      }
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
