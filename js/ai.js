/**
 * AI.JS - Scalable Artificial Intelligence Engine
 * Supports 3x3, 4x4 Grid, Infinity XO (Ghost sliding marks), and classic Minimax.
 */

import { WINNING_COMBOS_3X3, WINNING_COMBOS_4X4 } from './state.js';

function getCombosForBoard(board) {
  return board.length === 16 ? WINNING_COMBOS_4X4 : WINNING_COMBOS_3X3;
}

/**
 * Checks if a player has won or if board is full
 */
export function checkGameState(board) {
  const combos = getCombosForBoard(board);

  for (const line of combos) {
    const first = board[line[0]];
    if (first && line.every(idx => board[idx] === first)) {
      return first;
    }
  }

  if (board.every(cell => cell !== null)) {
    return 'tie';
  }

  return null;
}

export function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) moves.push(i);
  }
  return moves;
}

/**
 * Easy AI
 */
function getEasyMove(board, aiPlayer, humanPlayer) {
  const available = getAvailableMoves(board);
  if (available.length === 0) return null;

  if (Math.random() < 0.25) {
    const tactical = findWinningOrBlockingMove(board, aiPlayer, humanPlayer);
    if (tactical !== null) return tactical;
  }

  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Medium AI
 */
function getMediumMove(board, aiPlayer, humanPlayer) {
  const available = getAvailableMoves(board);
  if (available.length === 0) return null;

  // 1. Immediate Win
  for (const move of available) {
    board[move] = aiPlayer;
    if (checkGameState(board) === aiPlayer) {
      board[move] = null;
      return move;
    }
    board[move] = null;
  }

  // 2. Block Opponent Win
  for (const move of available) {
    board[move] = humanPlayer;
    if (checkGameState(board) === humanPlayer) {
      board[move] = null;
      return move;
    }
    board[move] = null;
  }

  // 3. Center Priority
  const centerCells = board.length === 16 ? [5, 6, 9, 10] : [4];
  const openCenters = centerCells.filter(idx => board[idx] === null);
  if (openCenters.length > 0) {
    return openCenters[Math.floor(Math.random() * openCenters.length)];
  }

  // 4. Corners Priority
  const corners = board.length === 16 ? [0, 3, 12, 15] : [0, 2, 6, 8];
  const openCorners = corners.filter(idx => board[idx] === null);
  if (openCorners.length > 0) {
    return openCorners[Math.floor(Math.random() * openCorners.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}

function findWinningOrBlockingMove(board, aiPlayer, humanPlayer) {
  const available = getAvailableMoves(board);

  for (const move of available) {
    board[move] = aiPlayer;
    if (checkGameState(board) === aiPlayer) {
      board[move] = null;
      return move;
    }
    board[move] = null;
  }

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
 * Unbeatable AI (Minimax with Depth & Alpha-Beta)
 */
function getUnbeatableMove(board, aiPlayer, humanPlayer, gameType, ghostMoves) {
  const available = getAvailableMoves(board);
  if (available.length === 0) return null;

  // If first move on 3x3, take center
  if (board.length === 9 && available.length === 9) {
    return 4;
  }

  // In Infinity mode, use heuristic tactical lookahead
  if (gameType === 'infinity' && ghostMoves) {
    return getInfinityTacticalMove(board, aiPlayer, humanPlayer, ghostMoves);
  }

  // In 4x4 grid, use depth-limited search (depth 3) to keep it under 15ms
  const maxDepth = board.length === 16 ? 3 : 9;

  let bestScore = -Infinity;
  let bestMove = available[0];

  for (const move of available) {
    board[move] = aiPlayer;
    const score = minimax(board, 0, false, aiPlayer, humanPlayer, -Infinity, Infinity, maxDepth);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Minimax algorithm with alpha-beta pruning
 */
function minimax(board, depth, isMaximizing, aiPlayer, humanPlayer, alpha, beta, maxDepth) {
  const state = checkGameState(board);

  if (state === aiPlayer) return 100 - depth;
  if (state === humanPlayer) return depth - 100;
  if (state === 'tie') return 0;
  if (depth >= maxDepth) return evaluateBoardHeuristic(board, aiPlayer, humanPlayer);

  const available = getAvailableMoves(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of available) {
      board[move] = aiPlayer;
      const evaluation = minimax(board, depth + 1, false, aiPlayer, humanPlayer, alpha, beta, maxDepth);
      board[move] = null;

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of available) {
      board[move] = humanPlayer;
      const evaluation = minimax(board, depth + 1, true, aiPlayer, humanPlayer, alpha, beta, maxDepth);
      board[move] = null;

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Evaluates board state for depth-limited pruning (e.g. 4x4)
 */
function evaluateBoardHeuristic(board, aiPlayer, humanPlayer) {
  const combos = getCombosForBoard(board);
  let score = 0;

  for (const line of combos) {
    let aiCount = 0;
    let humanCount = 0;

    for (const idx of line) {
      if (board[idx] === aiPlayer) aiCount++;
      else if (board[idx] === humanPlayer) humanCount++;
    }

    if (aiCount > 0 && humanCount === 0) {
      score += Math.pow(10, aiCount);
    } else if (humanCount > 0 && aiCount === 0) {
      score -= Math.pow(10, humanCount);
    }
  }

  return score;
}

/**
 * Tactical decision maker for Infinity XO mode
 */
function getInfinityTacticalMove(board, aiPlayer, humanPlayer, ghostMoves) {
  const available = getAvailableMoves(board);

  // 1. Can AI win after placing mark (considering potential ghost dissolve)?
  for (const move of available) {
    const testBoard = [...board];
    const aiMarks = [...ghostMoves[aiPlayer]];
    if (aiMarks.length >= 3) {
      const oldest = aiMarks.shift();
      testBoard[oldest] = null;
    }
    testBoard[move] = aiPlayer;

    if (checkGameState(testBoard) === aiPlayer) {
      return move;
    }
  }

  // 2. Can human win immediately? Block them!
  for (const move of available) {
    const testBoard = [...board];
    const humanMarks = [...ghostMoves[humanPlayer]];
    if (humanMarks.length >= 3) {
      const oldest = humanMarks.shift();
      testBoard[oldest] = null;
    }
    testBoard[move] = humanPlayer;

    if (checkGameState(testBoard) === humanPlayer) {
      return move;
    }
  }

  // 3. Take center
  if (board[4] === null) return 4;

  // 4. Take corners
  const corners = [0, 2, 6, 8].filter(c => board[c] === null);
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Main AI move resolver
 */
export function getAiMove(board, difficulty = 'unbeatable', aiPlayer = 'O', humanPlayer = 'X', gameType = 'classic', ghostMoves = null) {
  const clone = [...board];

  switch (difficulty) {
    case 'easy':
      return getEasyMove(clone, aiPlayer, humanPlayer);
    case 'medium':
      return getMediumMove(clone, aiPlayer, humanPlayer);
    case 'unbeatable':
    default:
      return getUnbeatableMove(clone, aiPlayer, humanPlayer, gameType, ghostMoves);
  }
}
