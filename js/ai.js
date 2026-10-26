/**
 * AI.JS - Artificial Intelligence Engine
 * Includes Easy (random), Medium (tactical heuristic), and Unbeatable (Minimax).
 */

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

/**
 * Checks if a player has won or if the board is full
 * @param {Array} board 9-element array
 * @returns {string|null} 'X', 'O', 'tie', or null
 */
export function checkGameState(board) {
  for (const [a, b, c] of WINNING_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every(cell => cell !== null)) {
    return 'tie';
  }

  return null;
}

/**
 * Gets all unoccupied cell indices
 * @param {Array} board
 * @returns {Array<number>}
 */
export function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) moves.push(i);
  }
  return moves;
}

/**
 * Easy AI: Mostly random moves with occasional silly mistakes
 */
function getEasyMove(board, aiPlayer, humanPlayer) {
  const available = getAvailableMoves(board);
  if (available.length === 0) return null;

  // 25% chance of making a smart tactical block/win, 75% purely random
  if (Math.random() < 0.25) {
    const tacticalMove = findWinningOrBlockingMove(board, aiPlayer, humanPlayer);
    if (tacticalMove !== null) return tacticalMove;
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

/**
 * Medium AI: Tactical heuristics
 * 1. Win if possible
 * 2. Block human win
 * 3. Take center
 * 4. Take random available corner
 * 5. Fallback random
 */
function getMediumMove(board, aiPlayer, humanPlayer) {
  const available = getAvailableMoves(board);
  if (available.length === 0) return null;

  // 1. Can AI win right now?
  for (const move of available) {
    board[move] = aiPlayer;
    if (checkGameState(board) === aiPlayer) {
      board[move] = null;
      return move;
    }
    board[move] = null;
  }

  // 2. Can human win on next move? Block them!
  for (const move of available) {
    board[move] = humanPlayer;
    if (checkGameState(board) === humanPlayer) {
      board[move] = null;
      return move;
    }
    board[move] = null;
  }

  // 3. Take center if available
  if (board[4] === null) {
    return 4;
  }

  // 4. Take any available corner
  const corners = [0, 2, 6, 8].filter(c => board[c] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Fallback random
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Helper to check immediate 1-move win or block
 */
function findWinningOrBlockingMove(board, aiPlayer, humanPlayer) {
  const available = getAvailableMoves(board);

  // Check win
  for (const move of available) {
    board[move] = aiPlayer;
    if (checkGameState(board) === aiPlayer) {
      board[move] = null;
      return move;
    }
    board[move] = null;
  }

  // Check block
  for (const move of available) {
    board[move] = humanPlayer;
    if (checkGameState(board) === humanPlayer) {
      board[move] = null;
      return move;
    }
    board[move] = null;
  }

  return null;
}

/**
 * Unbeatable AI: Minimax algorithm with depth scoring
 */
function getUnbeatableMove(board, aiPlayer, humanPlayer) {
  const available = getAvailableMoves(board);
  if (available.length === 0) return null;

  // Opening optimization for center if first move
  if (available.length === 9) {
    return 4; // Center is mathematically optimal
  }

  let bestScore = -Infinity;
  let bestMove = available[0];

  for (const move of available) {
    board[move] = aiPlayer;
    const score = minimax(board, 0, false, aiPlayer, humanPlayer, -Infinity, Infinity);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Recursive Minimax implementation with Alpha-Beta pruning & depth penalty
 */
function minimax(board, depth, isMaximizing, aiPlayer, humanPlayer, alpha, beta) {
  const state = checkGameState(board);

  if (state === aiPlayer) return 10 - depth;
  if (state === humanPlayer) return depth - 10;
  if (state === 'tie') return 0;

  const available = getAvailableMoves(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of available) {
      board[move] = aiPlayer;
      const evaluation = minimax(board, depth + 1, false, aiPlayer, humanPlayer, alpha, beta);
      board[move] = null;

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Alpha-beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of available) {
      board[move] = humanPlayer;
      const evaluation = minimax(board, depth + 1, true, aiPlayer, humanPlayer, alpha, beta);
      board[move] = null;

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha-beta cutoff
    }
    return minEval;
  }
}

/**
 * Main AI move resolver
 * @param {Array} board Current board
 * @param {string} difficulty 'easy' | 'medium' | 'unbeatable'
 * @param {string} aiPlayer 'O'
 * @param {string} humanPlayer 'X'
 * @returns {number|null} Cell index 0..8
 */
export function getAiMove(board, difficulty = 'unbeatable', aiPlayer = 'O', humanPlayer = 'X') {
  const clone = [...board];

  switch (difficulty) {
    case 'easy':
      return getEasyMove(clone, aiPlayer, humanPlayer);
    case 'medium':
      return getMediumMove(clone, aiPlayer, humanPlayer);
    case 'unbeatable':
    default:
      return getUnbeatableMove(clone, aiPlayer, humanPlayer);
  }
}
