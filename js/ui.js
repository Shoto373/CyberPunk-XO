/**
 * UI.JS - DOM Rendering, 3D Board Tilt, SVG Mark Animations, Screen Navigation & HUD
 */

import { ACHIEVEMENTS_LIST } from './state.js';
import { particles } from './particles.js';

class UIEngine {
  constructor() {
    // App & Screens
    this.appContainer = document.getElementById('app-container');
    this.screenMenu = document.getElementById('screen-menu');
    this.screenGame = document.getElementById('screen-game');

    // Menu Elements
    this.modeCards = Array.from(document.querySelectorAll('.mode-card'));
    this.btnStartGame = document.getElementById('btn-start-game');

    // HUD Elements
    this.btnBackMenu = document.getElementById('btn-back-menu');
    this.hudModePill = document.getElementById('hud-mode-pill');
    
    // Blitz Timer Elements
    this.blitzContainer = document.getElementById('blitz-timer-container');
    this.blitzBarFill = document.getElementById('blitz-bar-fill');
    this.blitzTimeText = document.getElementById('blitz-time-text');

    // Board Elements
    this.boardPerspective = document.getElementById('board-perspective');
    this.boardContainer = document.getElementById('board-container');
    this.boardGrid = document.getElementById('board-grid');
    this.cells = [];
    
    // Strike overlay
    this.strikeLine = document.getElementById('strike-line');

    // Scoreboard elements
    this.cardX = document.getElementById('card-x');
    this.cardTies = document.getElementById('card-ties');
    this.cardO = document.getElementById('card-o');
    this.scoreX = document.getElementById('score-x');
    this.scoreTies = document.getElementById('score-ties');
    this.scoreO = document.getElementById('score-o');
    this.labelX = document.getElementById('label-x');
    this.labelO = document.getElementById('label-o');
    this.thinkingBadge = document.getElementById('thinking-badge');

    // Mode Toggle & Difficulty & P2P
    this.modeToggle = document.getElementById('mode-toggle');
    this.btnModePvp = document.getElementById('btn-mode-pvp');
    this.btnModePve = document.getElementById('btn-mode-pve');
    this.btnModeP2p = document.getElementById('btn-mode-p2p');
    this.diffChipsContainer = document.getElementById('difficulty-chips');
    this.diffChips = Array.from(document.querySelectorAll('.chip-btn'));

    // P2P Panel Elements
    this.p2pPanel = document.getElementById('p2p-panel');
    this.btnP2pHost = document.getElementById('btn-p2p-host');
    this.btnP2pJoin = document.getElementById('btn-p2p-join');
    this.btnP2pCopy = document.getElementById('btn-p2p-copy');
    this.inputP2pCode = document.getElementById('input-p2p-code');
    this.p2pRoomBox = document.getElementById('p2p-room-box');
    this.p2pCodeBadge = document.getElementById('p2p-code-badge');
    this.p2pStatusText = document.getElementById('p2p-status-text');
    this.p2pStatusDot = document.getElementById('p2p-status-dot');

    // Audio & BGM Buttons
    this.btnAudios = Array.from(document.querySelectorAll('.audio-btn'));
    this.btnBgms = Array.from(document.querySelectorAll('.bgm-btn'));

    // Theme & CRT controls
    this.themeChips = Array.from(document.querySelectorAll('.theme-chip'));
    this.btnToggleCrts = Array.from(document.querySelectorAll('.crt-toggle-btn'));

    // Actions
    this.btnNewRound = document.getElementById('btn-new-round');
    this.btnResetScore = document.getElementById('btn-reset-score');

    // Modal
    this.modal = document.getElementById('result-modal');
    this.modalSymbol = document.getElementById('modal-symbol');
    this.modalTitle = document.getElementById('modal-title');
    this.modalSubtitle = document.getElementById('modal-subtitle');
    this.modalUnlockedAchievements = document.getElementById('modal-unlocked-achievements');
    this.btnModalRematch = document.getElementById('btn-modal-rematch');
    this.btnModalStats = document.getElementById('btn-modal-stats');
    this.btnModalClose = document.getElementById('btn-modal-close');

    // Rematch Notification Elements (P2P mode)
    this.modalRematchStatus = document.getElementById('modal-rematch-status');
    this.modalRematchText = document.getElementById('modal-rematch-text');
    this.gameRematchBanner = document.getElementById('game-rematch-banner');
    this.gameRematchText = document.getElementById('game-rematch-text');
    this.btnBannerAccept = document.getElementById('btn-banner-accept');

    // Stats & Achievements Elements
    this.btnOpenStats = document.getElementById('btn-open-stats');
    this.btnHudStats = document.getElementById('btn-hud-stats');
    this.btnMenuStats = document.getElementById('btn-menu-stats');
    this.btnModalStats = document.getElementById('btn-modal-stats');
    this.statsModal = document.getElementById('stats-modal');
    this.btnStatsClose = document.getElementById('btn-stats-close');
    this.btnStatsCloseX = document.getElementById('btn-stats-close-x');
    this.btnStatsReset = document.getElementById('btn-stats-reset');
    this.statMatches = document.getElementById('stat-matches');
    this.statWins = document.getElementById('stat-wins');
    this.statWinrate = document.getElementById('stat-winrate');
    this.statStreak = document.getElementById('stat-streak');
    this.statMaxStreak = document.getElementById('stat-max-streak');
    this.achievementsUnlockedCount = document.getElementById('achievements-unlocked-count');
    this.achievementsList = document.getElementById('achievements-list');
    this.achievementToastContainer = document.getElementById('achievement-toast-container');

    // Reactions & HUD Alerts
    this.hudToastAlert = document.getElementById('hud-toast-alert');
    this.p2pReactionsBar = document.getElementById('p2p-reactions-bar');
    this.reactionOverlay = document.getElementById('reaction-overlay');
    this.reactionBtns = Array.from(document.querySelectorAll('.reaction-btn'));
    this._toastTimer = null;

    this.initTilt();
  }

  /**
   * Switches to Main Menu screen
   */
  showMenuScreen() {
    if (this.screenGame) this.screenGame.classList.remove('active');
    if (this.screenMenu) this.screenMenu.classList.add('active');
    this.hideModal();
  }

  /**
   * Switches to Gameplay screen
   */
  showGameScreen() {
    if (this.screenMenu) this.screenMenu.classList.remove('active');
    if (this.screenGame) this.screenGame.classList.add('active');
  }

  /**
   * Initializes 3D Tilt perspective on mouse & touch moves
   */
  initTilt() {
    if (!this.boardPerspective || !this.boardContainer) return;

    const handleMove = (clientX, clientY) => {
      const rect = this.boardContainer.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const percentX = (clientX - centerX) / (rect.width / 2);
      const percentY = (clientY - centerY) / (rect.height / 2);

      const maxTilt = 12;
      const rotateX = -percentY * maxTilt;
      const rotateY = percentX * maxTilt;

      this.boardContainer.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    this.boardPerspective.addEventListener('mousemove', (e) => {
      handleMove(e.clientX, e.clientY);
    });

    this.boardPerspective.addEventListener('mouseleave', () => {
      this.boardContainer.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });

    this.boardPerspective.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    this.boardPerspective.addEventListener('touchend', () => {
      this.boardContainer.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }

  /**
   * Reconstructs board cells grid dynamically for 3x3 or 4x4
   */
  buildBoard(gridSize, onCellClick) {
    if (!this.boardGrid) return;
    this.boardGrid.innerHTML = '';
    this.cells = [];

    const totalCells = gridSize * gridSize;

    if (gridSize === 4) {
      this.boardContainer.classList.add('grid-4');
    } else {
      this.boardContainer.classList.remove('grid-4');
    }

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('button');
      cell.className = 'board-cell';
      cell.setAttribute('data-index', i.toString());
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `Клетка ${i + 1}`);

      cell.addEventListener('click', () => onCellClick(i));
      this.boardGrid.appendChild(cell);
      this.cells.push(cell);
    }

    this.hideStrikeLine();
  }

  /**
   * Renders laser X mark inside cell
   */
  renderMarkX(cell) {
    cell.classList.add('occupied');
    cell.innerHTML = `
      <svg class="mark-svg mark-x" viewBox="0 0 100 100">
        <line class="animate-x-line1" x1="20" y1="20" x2="80" y2="80" />
        <line class="animate-x-line2" x1="80" y1="20" x2="20" y2="80" />
        <circle class="laser-flash-circle animate-x-flash" cx="50" cy="50" r="10" />
      </svg>
    `;
  }

  /**
   * Renders plasma ring O mark inside cell
   */
  renderMarkO(cell) {
    cell.classList.add('occupied');
    cell.innerHTML = `
      <svg class="mark-svg mark-o" viewBox="0 0 100 100">
        <circle class="animate-o-ring" cx="50" cy="50" r="33" />
      </svg>
    `;
  }

  renderCell(index, player) {
    const cell = this.cells[index];
    if (!cell) return;
    if (player === 'X') {
      this.renderMarkX(cell);
    } else if (player === 'O') {
      this.renderMarkO(cell);
    }
  }

  /**
   * Animates and removes a dissolved mark (Infinity XO)
   */
  dissolveCell(index) {
    const cell = this.cells[index];
    if (!cell) return;

    cell.classList.add('dissolving');
    setTimeout(() => {
      cell.innerHTML = '';
      cell.classList.remove('occupied', 'dissolving', 'ghost-warning');
    }, 320);
  }

  /**
   * Highlights the mark that will disappear next turn
   */
  setGhostWarning(expiringIndex) {
    this.cells.forEach((cell, idx) => {
      if (idx === expiringIndex) {
        cell.classList.add('ghost-warning');
      } else {
        cell.classList.remove('ghost-warning');
      }
    });
  }

  clearGhostWarnings() {
    this.cells.forEach(cell => cell.classList.remove('ghost-warning'));
  }

  /**
   * Updates Blitz timer progress bar and numeric display
   */
  updateBlitzTimer(remaining, total, isUrgent) {
    if (!this.blitzContainer) return;

    const percent = Math.max(0, Math.min(100, (remaining / total) * 100));
    if (this.blitzBarFill) {
      this.blitzBarFill.style.width = `${percent}%`;
    }
    if (this.blitzTimeText) {
      this.blitzTimeText.textContent = `${remaining.toFixed(1)}s`;
    }

    if (isUrgent) {
      this.blitzContainer.classList.add('urgent');
    } else {
      this.blitzContainer.classList.remove('urgent');
    }
  }

  setBlitzVisibility(isVisible) {
    if (!this.blitzContainer) return;
    if (isVisible) {
      this.blitzContainer.classList.add('visible');
    } else {
      this.blitzContainer.classList.remove('visible');
    }
  }

  /**
   * Updates scoreboard numbers and active turn indicators
   */
  updateScoreboard(state) {
    this.scoreX.textContent = state.scores.X;
    this.scoreTies.textContent = state.scores.ties;
    this.scoreO.textContent = state.scores.O;

    if (state.gameMode === 'pvp') {
      this.labelX.textContent = 'ИГРОК 1';
      this.labelO.textContent = 'ИГРОК 2';
    } else if (state.gameMode === 'p2p') {
      this.labelX.textContent = (state.p2pPlayerSymbol === 'X') ? 'ВЫ (X)' : 'СОПЕРНИК (X)';
      this.labelO.textContent = (state.p2pPlayerSymbol === 'O') ? 'ВЫ (O)' : 'СОПЕРНИК (O)';
    } else {
      this.labelX.textContent = 'ВЫ (X)';
      this.labelO.textContent = 'ИИ (O)';
    }

    if (!state.isGameOver) {
      if (state.currentPlayer === 'X') {
        this.cardX.classList.add('active');
        this.cardO.classList.remove('active');
        this.boardContainer.classList.add('turn-x');
        this.boardContainer.classList.remove('turn-o');
      } else {
        this.cardO.classList.add('active');
        this.cardX.classList.remove('active');
        this.boardContainer.classList.add('turn-o');
        this.boardContainer.classList.remove('turn-x');
      }
    } else {
      this.cardX.classList.remove('active');
      this.cardO.classList.remove('active');
      this.boardContainer.classList.remove('turn-x', 'turn-o');
    }
  }

  setAiThinking(isThinking) {
    if (isThinking) {
      this.thinkingBadge.classList.add('visible');
      this.cardO.classList.add('active');
    } else {
      this.thinkingBadge.classList.remove('visible');
    }
  }

  /**
   * Calculates and draws the glowing laser strike line
   */
  drawStrikeLine(line, gridSize = 3) {
    if (!line || !this.strikeLine) return;

    let coords;

    if (gridSize === 4) {
      // 4x4 coordinate mappings
      const coords4 = {
        '0,1,2,3': { x1: 5, y1: 12.5, x2: 95, y2: 12.5 },
        '4,5,6,7': { x1: 5, y1: 37.5, x2: 95, y2: 37.5 },
        '8,9,10,11': { x1: 5, y1: 62.5, x2: 95, y2: 62.5 },
        '12,13,14,15': { x1: 5, y1: 87.5, x2: 95, y2: 87.5 },
        '0,4,8,12': { x1: 12.5, y1: 5, x2: 12.5, y2: 95 },
        '1,5,9,13': { x1: 37.5, y1: 5, x2: 37.5, y2: 95 },
        '2,6,10,14': { x1: 62.5, y1: 5, x2: 62.5, y2: 95 },
        '3,7,11,15': { x1: 87.5, y1: 5, x2: 87.5, y2: 95 },
        '0,5,10,15': { x1: 6, y1: 6, x2: 94, y2: 94 },
        '3,6,9,12': { x1: 94, y1: 6, x2: 6, y2: 94 }
      };
      coords = coords4[line.join(',')];
    } else {
      // 3x3 coordinate mappings
      const coords3 = {
        '0,1,2': { x1: 6, y1: 16.66, x2: 94, y2: 16.66 },
        '3,4,5': { x1: 6, y1: 50, x2: 94, y2: 50 },
        '6,7,8': { x1: 6, y1: 83.33, x2: 94, y2: 83.33 },
        '0,3,6': { x1: 16.66, y1: 6, x2: 16.66, y2: 94 },
        '1,4,7': { x1: 50, y1: 6, x2: 50, y2: 94 },
        '2,5,8': { x1: 83.33, y1: 6, x2: 83.33, y2: 94 },
        '0,4,8': { x1: 8, y1: 8, x2: 92, y2: 92 },
        '2,4,6': { x1: 92, y1: 8, x2: 8, y2: 92 }
      };
      coords = coords3[line.join(',')];
    }

    if (!coords) coords = { x1: 0, y1: 0, x2: 100, y2: 100 };

    this.strikeLine.setAttribute('x1', `${coords.x1}%`);
    this.strikeLine.setAttribute('y1', `${coords.y1}%`);
    this.strikeLine.setAttribute('x2', `${coords.x2}%`);
    this.strikeLine.setAttribute('y2', `${coords.y2}%`);
    this.strikeLine.style.display = 'block';
    this.strikeLine.classList.remove('animate-strike');
    
    void this.strikeLine.offsetWidth;
    this.strikeLine.classList.add('animate-strike');

    line.forEach(index => {
      if (this.cells[index]) {
        this.cells[index].classList.add('winning-cell');
      }
    });
  }

  hideStrikeLine() {
    if (this.strikeLine) {
      this.strikeLine.style.display = 'none';
      this.strikeLine.classList.remove('animate-strike');
    }
    this.cells.forEach(cell => cell.classList.remove('winning-cell'));
  }

  triggerScreenShake() {
    this.appContainer.classList.remove('screen-shake');
    void this.appContainer.offsetWidth;
    this.appContainer.classList.add('screen-shake');
    setTimeout(() => {
      this.appContainer.classList.remove('screen-shake');
    }, 500);
  }

  showResultModal(result, gameMode, playerSymbol = null, newlyUnlocked = []) {
    try {
      if (!this.modal) {
        this.modal = document.getElementById('result-modal');
      }
      if (!this.modalTitle) {
        this.modalTitle = document.getElementById('modal-title');
      }
      if (!this.modalSubtitle) {
        this.modalSubtitle = document.getElementById('modal-subtitle');
      }
      if (!this.modalSymbol) {
        this.modalSymbol = document.getElementById('modal-symbol');
      }

      const isX = result && result.winner === 'X';
      const isO = result && result.winner === 'O';
      const isTie = !result || result.status === 'tie' || result.winner === 'tie';

      let titleText = 'ПОБЕДА';
      let titleColor = isX ? 'var(--neon-x)' : 'var(--neon-o)';
      let subtitleText = '';

      if (isTie) {
        titleText = 'НИЧЬЯ';
        titleColor = 'var(--neon-gold)';
        subtitleText = 'Боевая ничья в раунде';

        if (this.modalSymbol) {
          this.modalSymbol.innerHTML = `
            <svg viewBox="0 0 100 100" style="width:100%;height:100%;filter:drop-shadow(0 0 15px var(--neon-gold-glow))">
              <line x1="25" y1="40" x2="75" y2="40" stroke="var(--neon-gold)" stroke-width="12" stroke-linecap="round"/>
              <line x1="25" y1="60" x2="75" y2="60" stroke="var(--neon-gold)" stroke-width="12" stroke-linecap="round"/>
            </svg>
          `;
        }
      } else {
        // Win or Loss determination
        if (gameMode === 'pve') {
          if (isX) {
            titleText = 'ПОБЕДА';
            titleColor = 'var(--neon-x)';
            subtitleText = 'Вы победили кибер-ИИ!';
          } else {
            titleText = 'ПОРАЖЕНИЕ';
            titleColor = 'var(--neon-o)';
            subtitleText = 'ИИ одержал победу в раунде';
          }
        } else if (gameMode === 'p2p' && playerSymbol) {
          const isMe = result.winner === playerSymbol;
          titleText = isMe ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ';
          titleColor = isMe ? (playerSymbol === 'X' ? 'var(--neon-x)' : 'var(--neon-o)') : (playerSymbol === 'X' ? 'var(--neon-o)' : 'var(--neon-x)');
          subtitleText = isMe ? 'Вы победили соперника в сети!' : 'Соперник одержал победу в раунде';
        } else {
          titleText = 'ПОБЕДА';
          titleColor = isX ? 'var(--neon-x)' : 'var(--neon-o)';
          subtitleText = isX ? 'Победил игрок X' : 'Победил игрок O';
        }

        if (this.modalSymbol) {
          this.modalSymbol.innerHTML = isX ? `
            <svg viewBox="0 0 100 100" style="width:100%;height:100%;filter:drop-shadow(0 0 15px var(--neon-x-glow))">
              <line x1="20" y1="20" x2="80" y2="80" stroke="var(--neon-x)" stroke-width="14" stroke-linecap="round"/>
              <line x1="80" y1="20" x2="20" y2="80" stroke="var(--neon-x)" stroke-width="14" stroke-linecap="round"/>
            </svg>
          ` : `
            <svg viewBox="0 0 100 100" style="width:100%;height:100%;filter:drop-shadow(0 0 15px var(--neon-o-glow))">
              <circle cx="50" cy="50" r="32" fill="none" stroke="var(--neon-o)" stroke-width="14"/>
            </svg>
          `;
        }
      }

      if (this.modalTitle) {
        this.modalTitle.style.color = titleColor;
        this.modalTitle.textContent = titleText;
      }

      if (this.modalSubtitle) {
        this.modalSubtitle.textContent = subtitleText;
      }

      // Display newly unlocked achievements directly inside Victory Modal
      if (this.modalUnlockedAchievements) {
        const validList = Array.isArray(newlyUnlocked) ? newlyUnlocked.filter(a => a && a.title) : [];
        if (validList.length > 0) {
          this.modalUnlockedAchievements.style.display = 'flex';
          this.modalUnlockedAchievements.innerHTML = `
            <div class="modal-ach-header">🏆 РАЗБЛОКИРОВАНО:</div>
            <div class="modal-ach-items">
              ${validList.map(ach => `
                <div class="modal-ach-item">
                  <span class="modal-ach-icon">${ach.icon || '🏆'}</span>
                  <span class="modal-ach-title">${ach.title || ''}</span>
                </div>
              `).join('')}
            </div>
          `;
        } else {
          this.modalUnlockedAchievements.style.display = 'none';
          this.modalUnlockedAchievements.innerHTML = '';
        }
      }

      // Promptly open the modal overlay (250ms gives strike animation time to start)
      if (this._modalTimer) clearTimeout(this._modalTimer);
      this._modalTimer = setTimeout(() => {
        if (this.modal) {
          this.modal.classList.add('open');
          this.modal.setAttribute('aria-hidden', 'false');
        }
      }, 250);
    } catch (e) {
      console.error('Safe fallback inside showResultModal:', e);
      if (this.modal) {
        this.modal.classList.add('open');
        this.modal.setAttribute('aria-hidden', 'false');
      }
    }
  }

  hideModal() {
    if (this._modalTimer) clearTimeout(this._modalTimer);
    if (this.modal) {
      this.modal.classList.remove('open');
      this.modal.setAttribute('aria-hidden', 'true');
    }
  }

  hideResultModal() {
    this.hideModal();
  }

  clearBoard() {
    this.cells.forEach(cell => {
      cell.innerHTML = '';
      cell.classList.remove('occupied', 'winning-cell', 'ghost-warning', 'dissolving');
    });
    this.hideStrikeLine();
    this.hideModal();
  }

  updateAudioIcon(isMuted) {
    this.btnAudios.forEach(btn => {
      const onIcon = btn.querySelector('.icon-sound-on');
      const offIcon = btn.querySelector('.icon-sound-off');
      if (isMuted) {
        btn.classList.add('muted');
        if (onIcon) onIcon.style.display = 'none';
        if (offIcon) offIcon.style.display = 'block';
      } else {
        btn.classList.remove('muted');
        if (onIcon) onIcon.style.display = 'block';
        if (offIcon) offIcon.style.display = 'none';
      }
    });
  }

  updateModeUI(mode) {
    if (this.modeToggle) {
      this.modeToggle.setAttribute('data-mode', mode);
    }

    [this.btnModePvp, this.btnModePve, this.btnModeP2p].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });

    if (mode === 'pvp') {
      if (this.btnModePvp) this.btnModePvp.classList.add('active');
      if (this.diffChipsContainer) this.diffChipsContainer.classList.add('hidden');
      if (this.p2pPanel) this.p2pPanel.classList.remove('visible');
    } else if (mode === 'pve') {
      if (this.btnModePve) this.btnModePve.classList.add('active');
      if (this.diffChipsContainer) this.diffChipsContainer.classList.remove('hidden');
      if (this.p2pPanel) this.p2pPanel.classList.remove('visible');
    } else if (mode === 'p2p') {
      if (this.btnModeP2p) this.btnModeP2p.classList.add('active');
      if (this.diffChipsContainer) this.diffChipsContainer.classList.add('hidden');
      if (this.p2pPanel) this.p2pPanel.classList.add('visible');
    }
  }

  updateDifficultyUI(diff) {
    this.diffChips.forEach(chip => {
      if (chip.getAttribute('data-diff') === diff) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  updateGameTypeCards(selectedType) {
    this.modeCards.forEach(card => {
      if (card.getAttribute('data-mode-type') === selectedType) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    const labels = {
      'classic': 'Классика 3×3',
      'infinity': 'Бесконечный',
      'blitz': 'Блиц 5с',
      'grid4': 'Сетка 4×4'
    };

    if (this.hudModePill) {
      this.hudModePill.textContent = labels[selectedType] || 'Классика';
    }
  }

  /**
   * Applies selected color theme to body and updates chips
   */
  applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    this.themeChips.forEach(chip => {
      if (chip.getAttribute('data-theme') === theme) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  /**
   * Toggles CRT scanlines overlay on body
   */
  applyCrt(isCrt) {
    if (isCrt) {
      document.body.classList.add('crt-active');
    } else {
      document.body.classList.remove('crt-active');
    }
    this.btnToggleCrts.forEach(btn => {
      if (isCrt) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Updates BGM music button active indicator
   */
  updateBgmUI(isPlaying) {
    this.btnBgms.forEach(btn => {
      if (isPlaying) {
        btn.classList.add('playing');
        btn.setAttribute('title', 'Выключить эмбиент');
      } else {
        btn.classList.remove('playing');
        btn.setAttribute('title', 'Включить кибер-эмбиент');
      }
    });
  }

  /**
   * Triggers cyber chromatic aberration glitch flash
   */
  triggerGlitch() {
    this.appContainer.classList.remove('glitch-flash');
    void this.appContainer.offsetWidth;
    this.appContainer.classList.add('glitch-flash');
    setTimeout(() => {
      this.appContainer.classList.remove('glitch-flash');
    }, 380);
  }

  /**
   * Updates UI for mutual P2P rematch flow
   * @param {'idle' | 'pending' | 'incoming'} stateType
   * @param {string} message
   */
  setRematchState(stateType, message = '') {
    if (stateType === 'pending') {
      // Local player offered rematch, waiting for remote confirmation
      if (this.modalRematchStatus) {
        this.modalRematchStatus.style.display = 'flex';
        if (this.modalRematchText) this.modalRematchText.textContent = message || 'Вы предложили реванш. Ждём соперника...';
      }
      if (this.btnModalRematch) {
        this.btnModalRematch.textContent = 'Ожидание... (1/2)';
        this.btnModalRematch.classList.add('pending');
        this.btnModalRematch.classList.remove('highlight');
      }
      if (this.btnNewRound) {
        this.btnNewRound.textContent = 'Ожидание... (1/2)';
        this.btnNewRound.classList.add('pending');
        this.btnNewRound.classList.remove('highlight');
      }
      if (this.gameRematchBanner) {
        this.gameRematchBanner.style.display = 'none';
      }
    } else if (stateType === 'incoming') {
      // Remote opponent offered rematch, local player can accept
      if (this.modalRematchStatus) {
        this.modalRematchStatus.style.display = 'flex';
        if (this.modalRematchText) this.modalRematchText.textContent = message || 'Соперник хочет сыграть снова! (1/2)';
      }
      if (this.btnModalRematch) {
        this.btnModalRematch.textContent = 'Принять реванш';
        this.btnModalRematch.classList.remove('pending');
        this.btnModalRematch.classList.add('highlight');
      }
      if (this.btnNewRound) {
        this.btnNewRound.textContent = 'Принять реванш';
        this.btnNewRound.classList.remove('pending');
        this.btnNewRound.classList.add('highlight');
      }
      if (this.gameRematchBanner) {
        this.gameRematchBanner.style.display = 'flex';
        if (this.gameRematchText) this.gameRematchText.textContent = message || 'Соперник предлагает реванш!';
      }
    } else {
      // Reset to idle
      if (this.modalRematchStatus) {
        this.modalRematchStatus.style.display = 'none';
      }
      if (this.gameRematchBanner) {
        this.gameRematchBanner.style.display = 'none';
      }
      if (this.btnModalRematch) {
        this.btnModalRematch.textContent = 'Сыграть снова';
        this.btnModalRematch.classList.remove('pending', 'highlight');
      }
      if (this.btnNewRound) {
        this.btnNewRound.innerHTML = `
          <svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
          Новый раунд
        `;
        this.btnNewRound.classList.remove('pending', 'highlight');
      }
    }
  }

  /**
   * Displays cyber stats & achievements modal
   */
  showStatsModal(gameState) {
    if (!this.statsModal) return;
    const stats = gameState.stats;
    const winrate = stats.totalMatches > 0 
      ? Math.round((stats.wins / stats.totalMatches) * 100) 
      : 0;

    if (this.statMatches) this.statMatches.textContent = stats.totalMatches;
    if (this.statWins) this.statWins.textContent = stats.wins;
    if (this.statWinrate) this.statWinrate.textContent = `${winrate}%`;
    if (this.statStreak) this.statStreak.textContent = `${stats.currentStreak} 🔥`;
    if (this.statMaxStreak) this.statMaxStreak.textContent = stats.maxStreak;

    this.renderAchievements(gameState);

    this.statsModal.classList.add('open');
    this.statsModal.setAttribute('aria-hidden', 'false');
  }

  /**
   * Populates the achievements list DOM with current unlock states
   */
  renderAchievements(gameState) {
    const unlocked = gameState.achievements || [];
    if (this.achievementsUnlockedCount) {
      this.achievementsUnlockedCount.textContent = `${unlocked.length}/${ACHIEVEMENTS_LIST.length}`;
    }

    if (this.achievementsList) {
      this.achievementsList.innerHTML = ACHIEVEMENTS_LIST.map(ach => {
        const isUnlocked = unlocked.includes(ach.id);
        return `
          <div class="achievement-item ${isUnlocked ? 'unlocked' : ''}">
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-info">
              <span class="achievement-title">${ach.title}</span>
              <span class="achievement-desc">${ach.desc}</span>
            </div>
            <span class="achievement-status" style="color: ${isUnlocked ? 'var(--neon-gold)' : 'var(--text-muted)'}">
              ${isUnlocked ? '✓' : '🔒'}
            </span>
          </div>
        `;
      }).join('');
    }
  }

  hideStatsModal() {
    if (this.statsModal) {
      this.statsModal.classList.remove('open');
      this.statsModal.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Displays temporary in-game alert banner
   */
  showToast(message) {
    if (!this.hudToastAlert) return;
    this.hudToastAlert.textContent = message;
    this.hudToastAlert.style.display = 'block';
    
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.hudToastAlert.style.display = 'none';
    }, 2800);
  }

  /**
   * Renders floating achievement unlock card with spectacle animations
   */
  showAchievementToast(achievement) {
    if (!this.achievementToastContainer) return;

    // Trigger golden celebratory sparks near the notification card
    const isMobile = window.innerWidth <= 640;
    const sparkX = isMobile ? window.innerWidth / 2 : Math.max(window.innerWidth - 180, 160);
    const sparkY = isMobile ? 65 : 75;
    particles.fireAchievement(sparkX, sparkY);

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <div class="achievement-toast-glow"></div>
      <div class="achievement-toast-icon-wrap">
        <div class="achievement-toast-icon-halo"></div>
        <div class="achievement-toast-icon">${achievement.icon}</div>
      </div>
      <div class="achievement-toast-body">
        <div class="achievement-toast-tag">
          <span class="achievement-tag-pulse"></span>
          <span class="achievement-tag-text">ТРОФЕЙ РАЗБЛОКИРОВАН</span>
        </div>
        <span class="achievement-toast-title">${achievement.title}</span>
        <span class="achievement-toast-desc">${achievement.desc}</span>
      </div>
      <div class="achievement-toast-shimmer"></div>
      <div class="achievement-toast-progress">
        <div class="achievement-progress-bar"></div>
      </div>
    `;

    this.achievementToastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 4500);
  }

  /**
   * Spawns floating hologram reaction bubble
   */
  showReaction(text, isRemote = false) {
    if (!this.reactionOverlay) return;
    const bubble = document.createElement('div');
    bubble.className = `floating-reaction ${isRemote ? 'from-remote' : 'from-local'}`;
    bubble.textContent = `${isRemote ? 'СОПЕРНИК: ' : 'ВЫ: '}${text}`;
    this.reactionOverlay.appendChild(bubble);
    setTimeout(() => {
      if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
    }, 2200);
  }

  setP2PReactionsVisibility(isVisible) {
    if (this.p2pReactionsBar) {
      this.p2pReactionsBar.style.display = isVisible ? 'flex' : 'none';
    }
  }
}

export const ui = new UIEngine();
