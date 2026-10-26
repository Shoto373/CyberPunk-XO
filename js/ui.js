/**
 * UI.JS - DOM Rendering, 3D Board Tilt, SVG Mark Animations, Laser Strike & Modals
 */

class UIEngine {
  constructor() {
    // DOM Elements
    this.appContainer = document.getElementById('app-container');
    this.boardPerspective = document.getElementById('board-perspective');
    this.boardContainer = document.getElementById('board-container');
    this.boardGrid = document.getElementById('board-grid');
    this.cells = Array.from(document.querySelectorAll('.board-cell'));
    
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

    // Controls
    this.modeToggle = document.getElementById('mode-toggle');
    this.btnModePvp = document.getElementById('btn-mode-pvp');
    this.btnModePve = document.getElementById('btn-mode-pve');
    this.diffChipsContainer = document.getElementById('difficulty-chips');
    this.diffChips = Array.from(document.querySelectorAll('.chip-btn'));

    // Buttons
    this.btnAudio = document.getElementById('btn-audio');
    this.iconSoundOn = document.getElementById('icon-sound-on');
    this.iconSoundOff = document.getElementById('icon-sound-off');
    this.btnNewRound = document.getElementById('btn-new-round');
    this.btnResetScore = document.getElementById('btn-reset-score');

    // Modal
    this.modal = document.getElementById('result-modal');
    this.modalSymbol = document.getElementById('modal-symbol');
    this.modalTitle = document.getElementById('modal-title');
    this.modalSubtitle = document.getElementById('modal-subtitle');
    this.btnModalRematch = document.getElementById('btn-modal-rematch');
    this.btnModalClose = document.getElementById('btn-modal-close');

    this.initTilt();
  }

  /**
   * Initializes interactive 3D Tilt perspective on mouse/touch moves
   */
  initTilt() {
    if (!this.boardPerspective || !this.boardContainer) return;

    const handleMove = (clientX, clientY) => {
      const rect = this.boardContainer.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const percentX = (clientX - centerX) / (rect.width / 2);
      const percentY = (clientY - centerY) / (rect.height / 2);

      // Max tilt angle in degrees
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

    // Touch support for mobile devices
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
   * Renders laser X mark inside cell
   * @param {HTMLElement} cell
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
   * @param {HTMLElement} cell
   */
  renderMarkO(cell) {
    cell.classList.add('occupied');
    cell.innerHTML = `
      <svg class="mark-svg mark-o" viewBox="0 0 100 100">
        <circle class="animate-o-ring" cx="50" cy="50" r="33" />
      </svg>
    `;
  }

  /**
   * Renders mark according to player type
   */
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
   * Updates scoreboard numbers and active turn indicators
   */
  updateScoreboard(state) {
    this.scoreX.textContent = state.scores.X;
    this.scoreTies.textContent = state.scores.ties;
    this.scoreO.textContent = state.scores.O;

    // Update labels based on mode
    if (state.gameMode === 'pvp') {
      this.labelX.textContent = 'ИГРОК 1';
      this.labelO.textContent = 'ИГРОК 2';
    } else {
      this.labelX.textContent = 'ВЫ (X)';
      this.labelO.textContent = 'КИБЕР ИИ';
    }

    // Turn indicator active classes
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

  /**
   * Sets AI thinking indicator visibility
   */
  setAiThinking(isThinking) {
    if (isThinking) {
      this.thinkingBadge.classList.add('visible');
      this.cardO.classList.add('active');
    } else {
      this.thinkingBadge.classList.remove('visible');
    }
  }

  /**
   * Calculates and draws the glowing laser strike line across winning cells
   * @param {Array<number>} line [a, b, c]
   */
  drawStrikeLine(line) {
    if (!line || !this.strikeLine) return;

    // Map combo to SVG percentage coordinates (0..100)
    const coordinates = {
      // Rows
      '0,1,2': { x1: 6, y1: 16.66, x2: 94, y2: 16.66 },
      '3,4,5': { x1: 6, y1: 50, x2: 94, y2: 50 },
      '6,7,8': { x1: 6, y1: 83.33, x2: 94, y2: 83.33 },
      // Columns
      '0,3,6': { x1: 16.66, y1: 6, x2: 16.66, y2: 94 },
      '1,4,7': { x1: 50, y1: 6, x2: 50, y2: 94 },
      '2,5,8': { x1: 83.33, y1: 6, x2: 83.33, y2: 94 },
      // Diagonals
      '0,4,8': { x1: 8, y1: 8, x2: 92, y2: 92 },
      '2,4,6': { x1: 92, y1: 8, x2: 8, y2: 92 }
    };

    const key = line.join(',');
    const coords = coordinates[key] || { x1: 0, y1: 0, x2: 100, y2: 100 };

    this.strikeLine.setAttribute('x1', `${coords.x1}%`);
    this.strikeLine.setAttribute('y1', `${coords.y1}%`);
    this.strikeLine.setAttribute('x2', `${coords.x2}%`);
    this.strikeLine.setAttribute('y2', `${coords.y2}%`);
    this.strikeLine.style.display = 'block';
    this.strikeLine.classList.remove('animate-strike');
    
    // Force reflow for animation restart
    void this.strikeLine.offsetWidth;
    this.strikeLine.classList.add('animate-strike');

    // Highlight winning cells
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

  /**
   * Triggers screen shake for cinematic triumph
   */
  triggerScreenShake() {
    this.appContainer.classList.remove('screen-shake');
    void this.appContainer.offsetWidth; // Reflow
    this.appContainer.classList.add('screen-shake');
    setTimeout(() => {
      this.appContainer.classList.remove('screen-shake');
    }, 500);
  }

  /**
   * Displays victory or draw modal
   */
  showResultModal(result, gameMode) {
    if (result.status === 'win') {
      const isX = result.winner === 'X';
      const color = isX ? 'var(--neon-x)' : 'var(--neon-o)';
      
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

      this.modalTitle.style.color = color;
      this.modalTitle.textContent = 'ПОБЕДА!';

      if (gameMode === 'pve') {
        this.modalSubtitle.textContent = isX ? 'Вы превзошли квантовый алгоритм!' : 'Кибернетический ИИ одержал верх';
      } else {
        this.modalSubtitle.textContent = isX ? 'Игрок 1 (X) забирает раунд!' : 'Игрок 2 (O) побеждает!';
      }
    } else {
      // Tie / Draw
      this.modalSymbol.innerHTML = `
        <svg viewBox="0 0 100 100" style="width:100%;height:100%;filter:drop-shadow(0 0 15px var(--neon-gold-glow))">
          <line x1="25" y1="40" x2="75" y2="40" stroke="var(--neon-gold)" stroke-width="12" stroke-linecap="round"/>
          <line x1="25" y1="60" x2="75" y2="60" stroke="var(--neon-gold)" stroke-width="12" stroke-linecap="round"/>
        </svg>
      `;
      this.modalTitle.style.color = 'var(--neon-gold)';
      this.modalTitle.textContent = 'НИЧЬЯ!';
      this.modalSubtitle.textContent = 'Равновесие сил в киберпространстве';
    }

    setTimeout(() => {
      this.modal.classList.add('open');
      this.modal.setAttribute('aria-hidden', 'false');
    }, 650);
  }

  hideModal() {
    this.modal.classList.remove('open');
    this.modal.setAttribute('aria-hidden', 'true');
  }

  /**
   * Clears the board cells and hides overlays
   */
  clearBoard() {
    this.cells.forEach(cell => {
      cell.innerHTML = '';
      cell.classList.remove('occupied', 'winning-cell');
    });
    this.hideStrikeLine();
    this.hideModal();
  }

  /**
   * Updates audio button icon based on muted status
   */
  updateAudioIcon(isMuted) {
    if (isMuted) {
      this.btnAudio.classList.add('muted');
      this.iconSoundOn.style.display = 'none';
      this.iconSoundOff.style.display = 'block';
    } else {
      this.btnAudio.classList.remove('muted');
      this.iconSoundOn.style.display = 'block';
      this.iconSoundOff.style.display = 'none';
    }
  }

  /**
   * Updates game mode segmented switch
   */
  updateModeUI(mode) {
    this.modeToggle.setAttribute('data-mode', mode);
    if (mode === 'pvp') {
      this.btnModePvp.classList.add('active');
      this.btnModePve.classList.remove('active');
      this.diffChipsContainer.classList.add('hidden');
    } else {
      this.btnModePve.classList.add('active');
      this.btnModePvp.classList.remove('active');
      this.diffChipsContainer.classList.remove('hidden');
    }
  }

  /**
   * Updates difficulty chips active state
   */
  updateDifficultyUI(diff) {
    this.diffChips.forEach(chip => {
      if (chip.getAttribute('data-diff') === diff) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }
}

export const ui = new UIEngine();
