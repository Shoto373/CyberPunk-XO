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
    this.localRematchRequested = false;
    this.remoteRematchRequested = false;
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
      ui.setP2PReactionsVisibility(true);
      this.localRematchRequested = false;
      this.remoteRematchRequested = false;
      ui.setRematchState('idle');
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

    p2p.onReactionCallback = (text) => {
      sound.playReaction();
      ui.showReaction(text, true);
    };

    p2p.onRematchRequestCallback = () => {
      this.remoteRematchRequested = true;
      sound.playClick();
      if (this.localRematchRequested) {
        // Both players agreed to rematch! Swap sides for fairness
        p2p.sendRematchAccept();
        this.startNewRound(true);
      } else {
        // Opponent wants to play again; notify local player
        ui.setRematchState('incoming', 'Соперник хочет сыграть снова! (1/2)');
      }
    };

    p2p.onRematchAcceptCallback = () => {
      // Opponent confirmed rematch; swap sides
      this.startNewRound(true);
    };

    p2p.onRematchCallback = () => {
      this.startNewRound(true);
    };

    p2p.onDisconnectCallback = () => {
      this.localRematchRequested = false;
      this.remoteRematchRequested = false;
      ui.setRematchState('idle');
      ui.setP2PReactionsVisibility(false);
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
        if (['classic', 'infinity', 'blitz', 'grid4'].every(m => state.stats.modesPlayed && state.stats.modesPlayed.includes(m))) {
          this.awardAchievement('ALL_MODES');
        }
      });
    });

    // Theme Selection Chips
    ui.themeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const theme = chip.getAttribute('data-theme');
        sound.playClick();
        sound.vibrateGlitch();
        state.setTheme(theme);
        ui.applyTheme(theme);
        ui.triggerGlitch();
        if (['cyber', 'matrix', 'outrun', 'blood'].every(t => state.stats.themesTried && state.stats.themesTried.includes(t))) {
          this.awardAchievement('THEME_COLLECTOR');
        }
      });
    });

    // CRT Scanlines Toggle
    ui.btnToggleCrts.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        sound.vibrateGlitch();
        const isCrt = state.toggleCrt();
        ui.applyCrt(isCrt);
        ui.triggerGlitch();
        if (isCrt) {
          this.awardAchievement('CRT_NOSTALGIA');
        }
      });
    });

    // BGM Ambient Music Toggle
    ui.btnBgms.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isPlaying = sound.toggleBgm();
        ui.updateBgmUI(isPlaying);
        if (isPlaying) {
          sound.playClick();
          this.awardAchievement('SYNTHWAVE_VIBE');
        }
      });
    });

    // Start Game from Menu
    if (ui.btnStartGame) {
      ui.btnStartGame.addEventListener('click', () => {
        sound.playClick();
        if (state.gameMode === 'p2p' && !p2p.isConnected) {
          if (ui.p2pStatusText) {
            ui.p2pStatusText.textContent = 'Создайте комнату или введите код для входа!';
          }
          if (ui.p2pPanel) ui.p2pPanel.classList.add('visible');
          return;
        }
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
          this.localRematchRequested = false;
          this.remoteRematchRequested = false;
          ui.setRematchState('idle');
          ui.setP2PReactionsVisibility(false);
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
          this.localRematchRequested = false;
          this.remoteRematchRequested = false;
          ui.setRematchState('idle');
          ui.setP2PReactionsVisibility(false);
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
        } else {
          sound.playClick();
          if (ui.p2pStatusText) ui.p2pStatusText.textContent = 'Введите код комнаты для входа!';
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
        this.handleRematchClick();
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
        this.handleRematchClick();
      });
    }

    if (ui.btnModalClose) {
      ui.btnModalClose.addEventListener('click', () => {
        sound.playClick();
        ui.hideModal();
      });
    }

    // In-Game Rematch Banner Accept Button
    if (ui.btnBannerAccept) {
      ui.btnBannerAccept.addEventListener('click', () => {
        this.handleRematchClick();
      });
    }

    // P2P Quick Reactions
    ui.reactionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-reaction');
        if (text && p2p.isConnected) {
          sound.playReaction();
          p2p.sendReaction(text);
          ui.showReaction(text, false);
          state.stats.p2pReactionsSent++;
          state.saveStats();
          this.awardAchievement('P2P_SIGNAL');
        }
      });
    });

    // Stats & Achievements Modal Handlers
    const openStats = () => {
      sound.playClick();
      const passive = state.checkPassiveAchievements();
      if (passive && passive.length > 0) {
        passive.forEach((ach, index) => {
          setTimeout(() => {
            sound.playAchievement();
            ui.showAchievementToast(ach);
          }, index * 800 + 300);
        });
      }
      ui.showStatsModal(state);
    };

    if (ui.btnOpenStats) ui.btnOpenStats.addEventListener('click', openStats);
    if (ui.btnHudStats) ui.btnHudStats.addEventListener('click', openStats);
    if (ui.btnMenuStats) ui.btnMenuStats.addEventListener('click', openStats);
    if (ui.btnModalStats) {
      ui.btnModalStats.addEventListener('click', () => {
        ui.hideResultModal();
        openStats();
      });
    }

    if (ui.btnStatsClose) {
      ui.btnStatsClose.addEventListener('click', () => {
        sound.playClick();
        ui.hideStatsModal();
      });
    }

    if (ui.btnStatsCloseX) {
      ui.btnStatsCloseX.addEventListener('click', () => {
        sound.playClick();
        ui.hideStatsModal();
      });
    }

    if (ui.btnStatsReset) {
      ui.btnStatsReset.addEventListener('click', () => {
        sound.playClick();
        state.resetAllStats();
        ui.showStatsModal(state);
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

      ui.showResultModal(result, state.gameMode, state.p2pPlayerSymbol);
    } else if (result.status === 'tie') {
      ui.triggerScreenShake();
      ui.triggerGlitch();
      sound.playDraw();
      ui.showResultModal(result, state.gameMode, state.p2pPlayerSymbol);
    }

    // Record game outcome and check for achievements
    let isWin = false;
    let isTie = false;
    let isLoss = false;

    if (result.status === 'win') {
      if (state.gameMode === 'pve') {
        isWin = result.winner === 'X';
        isLoss = result.winner === 'O';
      } else if (state.gameMode === 'p2p') {
        isWin = result.winner === state.p2pPlayerSymbol;
        isLoss = result.winner !== state.p2pPlayerSymbol;
      } else {
        isWin = true; // In local PvP
      }
    } else if (result.status === 'tie') {
      isTie = true;
    }

    const newlyUnlocked = state.recordGameOutcome(isWin, isTie, isLoss, {
      winningLine: result.line,
      blitzRemaining: state.blitzTimeRemaining
    });
    if (newlyUnlocked && newlyUnlocked.length > 0) {
      newlyUnlocked.forEach((ach, index) => {
        setTimeout(() => {
          sound.playAchievement();
          ui.showAchievementToast(ach);
        }, index * 900 + 400);
      });
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
   * Handles rematch button click across PVP, PVE, and P2P modes
   */
  handleRematchClick() {
    sound.playClick();

    if (state.gameMode !== 'p2p') {
      this.startNewRound();
      return;
    }

    if (this.localRematchRequested) {
      // Already clicked and waiting for remote opponent
      return;
    }

    this.localRematchRequested = true;

    if (this.remoteRematchRequested) {
      // Opponent already proposed rematch, accept and start round with side swap
      p2p.sendRematchAccept();
      this.startNewRound(true);
    } else {
      // We are the first to request rematch
      p2p.sendRematchRequest();
      ui.setRematchState('pending', 'Вы предложили реванш. Ждём соперника... (1/2)');
    }
  }

  /**
   * Triggers an achievement popup and audio notification
   */
  awardAchievement(id) {
    const ach = state.triggerAchievement(id);
    if (ach) {
      sound.playAchievement();
      ui.showAchievementToast(ach);
    }
  }

  /**
   * Starts a new round, with optional side swapping for P2P mode
   */
  startNewRound(swapSides = false) {
    this.stopBlitzTimer();
    this.localRematchRequested = false;
    this.remoteRematchRequested = false;
    ui.setRematchState('idle');

    // Auto-swap sides in P2P mode for competitive fairness
    if (state.gameMode === 'p2p' && swapSides) {
      const newSymbol = state.swapP2PSymbol();
      ui.showToast(`🔄 СМЕНА СТОРОН: ТЕПЕРЬ ВЫ ( ${newSymbol} )`);
      this.awardAchievement('P2P_REMATCH');
    }

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
