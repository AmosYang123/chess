

import { io } from "socket.io-client";

// Constants and State
const BOARD_SIZE = 8;
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Piece SVGs (Wikipedia standard)
const NON_SVG_PIECES = false; // Set to true to use unicode if SVGs fail or are too heavy
const SVGS = {
    white: {
        king: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M22.5 11.63V6M20 8h5" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-5 2-8 2s-4-1-9-1-5 0-9 1-4-3-8-2c-3 6 6 10.5 6 10.5v7" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        queen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0M24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0M41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0M10.5 19.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0M38.5 19.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11 2 12" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 26c0 2 1.5 2 2.5 4 1 2.5 3 4.5 3 4.5s9-3 16.5 0c0 0 2-2 3-4.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.5 30c3.5-1 18.5-1 22 0m-22 9c4-2 18-2 22 0m-22-4.5c4-2 18-2 22 0" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        rook: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M9 39h27v-3H9v3M12 36v-4h21v4H12M11 14V9h4v2h5V9h5v2h5V9h4v5" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 14l-3 3H14l-3-3" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 17v12.5c0 1.5-1.5 2.5-3 2.5h-11c-1.5 0-3-1-3-2.5V17" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 14h23" fill="none" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/></svg>',
        bishop: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 9.11-.97 12.5 0M9 36c3.39-.97 9.11-.97 12.5 0" transform="translate(9,0)"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        knight: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 18c.38 2.32-2.43 2.65-1.97 4.98" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 14c2.5-2 5-1 7 2 .5 4 1 9 2 9 3 0 2-1 2-1s1 1 3-1" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M25.17 38.83c1.74 1.74 3.72-2.3 5.4-3.5 1.7-1.12 3.14-1.12 4.02 0" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 15.5c-3 1.5-5.5 2.5-7.5 3" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        pawn: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-2.78-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    },
    black: {
        king: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M22.5 11.63V6M20 8h5" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-5 2-8 2s-4-1-9-1-5 0-9 1-4-3-8-2c-3 6 6 10.5 6 10.5v7" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        queen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0M24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0M41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0M10.5 19.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0M38.5 19.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11 2 12" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 26c0 2 1.5 2 2.5 4 1 2.5 3 4.5 3 4.5s9-3 16.5 0c0 0 2-2 3-4.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.5 30c3.5-1 18.5-1 22 0m-22 9c4-2 18-2 22 0m-22-4.5c4-2 18-2 22 0" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        rook: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M9 39h27v-3H9v3M12 36v-4h21v4H12M11 14V9h4v2h5V9h5v2h5V9h4v5" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 14l-3 3H14l-3-3" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 17v12.5c0 1.5-1.5 2.5-3 2.5h-11c-1.5 0-3-1-3-2.5V17" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 14h23" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>',
        bishop: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 9.11-.97 12.5 0M9 36c3.39-.97 9.11-.97 12.5 0" transform="translate(9,0)"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        knight: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 18c.38 2.32-2.43 2.65-1.97 4.98" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 14c2.5-2 5-1 7 2 .5 4 1 9 2 9 3 0 2-1 2-1s1 1 3-1" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M25.17 38.83c1.74 1.74 3.72-2.3 5.4-3.5 1.7-1.12 3.14-1.12 4.02 0" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 15.5c-3 1.5-5.5 2.5-7.5 3" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        pawn: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-2.78-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    }
};

class Game {
    constructor() {
        this.board = [];
        this.turn = 'white';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.check = false;
        this.castling = {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true }
        };
        this.enPassantTarget = null; // Square coordinate like [row, col]
        this.isFlipped = false;

        this.initBoard();
    }

    initBoard() {
        // 8x8 Board. 0,0 is Top-Left (Black's side usually, a8).
        // Ranks: 0->8, 1->7 ... 7->1.
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));

        const setupRow = (row, color, pieces) => {
            pieces.forEach((type, col) => {
                this.board[row][col] = { type, color, hasMoved: false };
            });
        };

        const backRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        const pawnRow = Array(8).fill('pawn');

        setupRow(0, 'black', backRow);
        setupRow(1, 'black', pawnRow);
        setupRow(6, 'white', pawnRow);
        setupRow(7, 'white', backRow);
    }

    // Helper: Convert algebraic (e.g. 'e2') to coords [6, 4]
    // Not strictly needed if we work with coords internally

    isValidPos(r, c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8;
    }

    getPiece(r, c) {
        if (!this.isValidPos(r, c)) return null;
        return this.board[r][c];
    }

    movePiece(fromR, fromC, toR, toC, promoteTo = 'queen') {
        const piece = this.board[fromR][fromC];
        // Move logic including castling and en passant

        // Check for En Passant Capture
        if (piece.type === 'pawn' && toC !== fromC && !this.board[toR][toC]) {
            // Must be en passant
            this.board[fromR][toC] = null; // Remove captured pawn
        }

        // Check for Castling
        if (piece.type === 'king' && Math.abs(toC - fromC) === 2) {
            const isKingSide = toC > fromC;
            const rookFromC = isKingSide ? 7 : 0;
            const rookToC = isKingSide ? 5 : 3;
            const rook = this.board[fromR][rookFromC];

            this.board[fromR][rookToC] = rook;
            this.board[fromR][rookFromC] = null;
            rook.hasMoved = true;
        }

        // Set En Passant Target
        if (piece.type === 'pawn' && Math.abs(toR - fromR) === 2) {
            this.enPassantTarget = [(fromR + toR) / 2, fromC];
        } else {
            this.enPassantTarget = null;
        }

        // Move Piece
        this.board[toR][toC] = piece;
        this.board[fromR][fromC] = null;
        piece.hasMoved = true;

        // Promotion
        if (piece.type === 'pawn' && (toR === 0 || toR === 7)) {
            piece.type = promoteTo;
        }

        this.turn = this.turn === 'white' ? 'black' : 'white';

        // Check detection
        this.check = this.isKingInCheck(this.turn);
    }

    getAllMoves(color, includePseudo = false) {
        let moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p && p.color === color) {
                    const pieceMoves = this.getPieceMoves(r, c, p, includePseudo);
                    pieceMoves.forEach(m => moves.push({ from: [r, c], to: m }));
                }
            }
        }
        return moves;
    }

    // Returns array of [r, c]
    getPieceMoves(r, c, piece, includePseudo = false) {
        if (!piece) return [];
        const rawMoves = [];
        const color = piece.color;
        const opponent = color === 'white' ? 'black' : 'white';
        const direction = color === 'white' ? -1 : 1;

        // Helpers
        const addIfValid = (nr, nc) => {
            if (this.isValidPos(nr, nc)) {
                const target = this.board[nr][nc];
                if (!target) {
                    rawMoves.push([nr, nc]);
                    return true; // Continue sliding
                } else if (target.color !== color) {
                    rawMoves.push([nr, nc]);
                    return false; // Stop sliding (capture)
                } else {
                    return false; // Blocked by own
                }
            }
            return false; // Out of bounds
        };

        const slide = (dr, dc) => {
            let cr = r + dr;
            let cc = c + dc;
            while (addIfValid(cr, cc)) {
                cr += dr;
                cc += dc;
            }
        };

        if (piece.type === 'pawn') {
            // Forward 1
            if (this.isValidPos(r + direction, c) && !this.board[r + direction][c]) {
                rawMoves.push([r + direction, c]);
                // Forward 2
                if (!piece.hasMoved && this.isValidPos(r + direction * 2, c) && !this.board[r + direction * 2][c]) {
                    rawMoves.push([r + direction * 2, c]);
                }
            }
            // Captures
            [[direction, 1], [direction, -1]].forEach(([dr, dc]) => {
                const nr = r + dr, nc = c + dc;
                if (this.isValidPos(nr, nc)) {
                    const target = this.board[nr][nc];
                    if (target && target.color === opponent) {
                        rawMoves.push([nr, nc]);
                    }
                    // En Passant
                    if (!target && this.enPassantTarget && this.enPassantTarget[0] === nr && this.enPassantTarget[1] === nc) {
                        // Check if en passant is valid (pawn of opposite color must be "behind" target square? No, enPassantTarget is the square the pawn skipped over)
                        // Wait, standard En Passant target is the square BEHIND moving pawn.
                        rawMoves.push([nr, nc]);
                    }
                }
            });
        }

        if (piece.type === 'knight') {
            [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
                addIfValid(r + dr, c + dc);
            });
        }

        if (piece.type === 'bishop' || piece.type === 'queen') {
            [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => slide(dr, dc));
        }

        if (piece.type === 'rook' || piece.type === 'queen') {
            [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => slide(dr, dc));
        }

        if (piece.type === 'king') {
            [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                addIfValid(r + dr, c + dc);
            });

            // Castling
            // Must not be in check, squares must be empty, not attacked.
            if (!includePseudo && !piece.hasMoved && !this.isKingInCheck(color)) {
                // Kingside
                if (this.board[r][7] && !this.board[r][7].hasMoved && !this.board[r][5] && !this.board[r][6]) {
                    if (!this.isSquareAttacked(r, 5, opponent) && !this.isSquareAttacked(r, 6, opponent)) {
                        rawMoves.push([r, 6]);
                    }
                }
                // Queenside
                if (this.board[r][0] && !this.board[r][0].hasMoved && !this.board[r][1] && !this.board[r][2] && !this.board[r][3]) {
                    if (!this.isSquareAttacked(r, 2, opponent) && !this.isSquareAttacked(r, 3, opponent)) { // d1/d8 is checked? Actually just path
                        rawMoves.push([r, 2]);
                    }
                }
            }
        }

        // Filter legal moves (cannot move into check)
        if (!includePseudo) {
            return rawMoves.filter(([tr, tc]) => {
                // Try move
                const savedBoard = this.cloneBoard();
                const savedEnPassant = this.enPassantTarget;

                // Simple move simulation
                const p = this.board[r][c];
                this.board[tr][tc] = p;
                this.board[r][c] = null;

                // Handle King pos update if needed for optimization
                const inCheck = this.isKingInCheck(color);

                // Restore
                this.board = savedBoard;
                this.enPassantTarget = savedEnPassant;

                return !inCheck;
            });
        }

        return rawMoves;
    }

    cloneBoard() {
        return this.board.map(row => row.slice());
    }

    isSquareAttacked(r, c, attackerColor) {
        // Inefficient way: check all attacker moves. 
        // Efficient way: check knight jumps from square, sliding lines from square
        // I will use redundant full board scan for simplicity as 64x64 is trivial
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const p = this.board[i][j];
                if (p && p.color === attackerColor) {
                    // Get pseudo moves to avoid infinite recursion
                    const moves = this.getPieceMoves(i, j, p, true);
                    if (moves.some(([mr, mc]) => mr === r && mc === c)) return true;
                }
            }
        }
        return false;
    }

    isKingInCheck(color) {
        // Find King
        let kingPos = null;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p && p.type === 'king' && p.color === color) {
                    kingPos = [r, c];
                    break;
                }
            }
        }
        if (!kingPos) return false; // Should not happen
        return this.isSquareAttacked(kingPos[0], kingPos[1], color === 'white' ? 'black' : 'white');
    }
}

// UI Controller
const game = new Game();
const boardEl = document.getElementById('chess-board');
const promotionModal = document.getElementById('promotion-modal');
const promotionOptions = document.querySelectorAll('.promo-option');
const statusEl = document.getElementById('status');
const checkAlertEl = document.getElementById('check-alert');
const flipBtn = document.getElementById('flip-btn');
const resetBtn = document.getElementById('reset-btn');

let selectedSquare = null;
let pendingMove = null;

// Online State
let socket = null;
let isOnline = false;
let playerColor = null; // 'white' or 'black'

function renderBoard() {
    try {
        boardEl.innerHTML = '';

        // Flip logic
        const isFlipped = game.isFlipped;
        const rows = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]; // Visual rows
        const cols = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

        rows.forEach(r => {
            cols.forEach(c => {
                const square = document.createElement('div');
                square.className = `square ${(r + c) % 2 === 0 ? 'dark' : 'light'}`;
                square.dataset.r = r;
                square.dataset.c = c;

                // Highlight selected
                if (selectedSquare && selectedSquare[0] === r && selectedSquare[1] === c) {
                    square.classList.add('selected');
                }

                // Highlight possible moves
                // Use safe optional chaining or try-catch for move calculation
                let isMove = false;
                let moves = [];
                if (selectedSquare) {
                    try {
                        moves = game.getPieceMoves(selectedSquare[0], selectedSquare[1], game.board[selectedSquare[0]][selectedSquare[1]]);
                        isMove = moves.some(m => m[0] === r && m[1] === c);
                    } catch (err) {
                        console.error("Error calculating moves:", err);
                    }
                }

                if (isMove) {
                    if (game.board[r][c]) {
                        square.classList.add('possible-capture');
                    } else {
                        square.classList.add('highlight');
                    }
                }

                // Check Highlight (King)
                const piece = game.getPiece(r, c);
                if (piece) {
                    const pieceEl = document.createElement('div');
                    pieceEl.className = `piece ${piece.color}`;
                    if (SVGS[piece.color] && SVGS[piece.color][piece.type]) {
                        pieceEl.innerHTML = SVGS[piece.color][piece.type];
                    } else {
                        pieceEl.textContent = piece.type; // Fallback
                    }
                    square.appendChild(pieceEl);

                    if (piece.type === 'king' && piece.color === game.turn && game.check) {
                        square.classList.add('in-check');
                    }
                }

                square.addEventListener('click', () => handleSquareClick(r, c));
                boardEl.appendChild(square);
            });
        });

        statusEl.textContent = `${game.turn.charAt(0).toUpperCase() + game.turn.slice(1)}'s Move`;
        if (game.check) {
            checkAlertEl.classList.remove('hidden');
            checkAlertEl.textContent = `${game.turn.toUpperCase()} IN CHECK!`;
        } else {
            checkAlertEl.classList.add('hidden');
        }
    } catch (e) {
        console.error("Render Error:", e);
        statusEl.textContent = "Error: " + e.message + " " + e.stack;
    }
}

function handleSquareClick(r, c) {
    // If online and not my turn, ignore
    if (isOnline && game.turn !== playerColor) return;

    // If modal is open, ignore clicks
    if (pendingMove) return;

    const clickedPiece = game.getPiece(r, c);
    const isSameColor = clickedPiece && clickedPiece.color === game.turn;

    // If selecting own piece
    if (isSameColor) {
        selectedSquare = [r, c];
        renderBoard();
        return;
    }

    // If trying to move to a square
    if (selectedSquare) {
        const moves = game.getPieceMoves(selectedSquare[0], selectedSquare[1], game.board[selectedSquare[0]][selectedSquare[1]]);
        if (moves.some(m => m[0] === r && m[1] === c)) {
            // Check for promotion
            const piece = game.board[selectedSquare[0]][selectedSquare[1]];
            if (piece.type === 'pawn' && (r === 0 || r === 7)) {
                pendingMove = { from: selectedSquare, to: [r, c] };
                promotionModal.classList.remove('hidden');
                return;
            }

            completeMove(selectedSquare[0], selectedSquare[1], r, c);
        } else {
            // If clicking empty square or enemy piece but not valid move
            selectedSquare = null;
            renderBoard();
        }
    }
}

function completeMove(fromR, fromC, toR, toC, promoteTo = null) {
    game.movePiece(fromR, fromC, toR, toC, promoteTo);

    // Auto-flip board so current player is at the bottom (ONLY IF LOCAL)
    if (!isOnline) {
        game.isFlipped = game.turn === 'black';
    }

    if (isOnline) {
        socket.emit('move', { fromR, fromC, toR, toC, promoteTo });
    }

    selectedSquare = null;
    pendingMove = null;
    promotionModal.classList.add('hidden');
    renderBoard();
    checkGameStatus();
}

function checkGameStatus() {
    // Checkmate detection (naive loop)
    const allMoves = game.getAllMoves(game.turn);
    if (allMoves.length === 0) {
        if (game.check) {
            statusEl.textContent = `CHECKMATE! ${game.turn === 'white' ? 'Black' : 'White'} Wins!`;
        } else {
            statusEl.textContent = "STALEMATE";
        }
    }
}

// Promotion Handlers
promotionOptions.forEach(option => {
    option.addEventListener('click', () => {
        if (pendingMove) {
            const type = option.dataset.type;
            completeMove(pendingMove.from[0], pendingMove.from[1], pendingMove.to[0], pendingMove.to[1], type);
        }
    });
});

flipBtn.addEventListener('click', () => {
    game.isFlipped = !game.isFlipped;
    renderBoard();
});

resetBtn.addEventListener('click', () => {
    game.initBoard();
    game.turn = 'white';
    game.isFlipped = false;
    game.check = false;
    selectedSquare = null;
    pendingMove = null; // Clear pending
    promotionModal.classList.add('hidden'); // Hide modal
    renderBoard();
});

// Online Play Handler
document.getElementById('online-btn').addEventListener('click', () => {
    const btn = document.getElementById('online-btn');
    if (isOnline) return;
    btn.textContent = "Connecting...";

    // Get backend URL from environment or use default for development
    const isDev = import.meta.env.DEV;
    const backendUrl = isDev 
        ? 'http://localhost:3000'
        : import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    
    socket = io(backendUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
    });

    socket.on('connect', () => {
        btn.textContent = "Searching...";
        socket.emit('find_match');
    });

    socket.on('disconnect', () => {
        btn.textContent = "Disconnected";
        isOnline = false;
    });

    socket.on('game_start', (data) => {
        isOnline = true;
        playerColor = data.color;
        btn.textContent = `Playing as ${playerColor.toUpperCase()}`;

        // Reset and configure board
        game.initBoard();
        game.turn = 'white';
        game.check = false;

        // If I am black, flip board to see my pieces at bottom. If white, normal.
        game.isFlipped = (playerColor === 'black');

        selectedSquare = null;
        pendingMove = null;
        renderBoard();
        alert(`Game Found! You are playing as ${playerColor.toUpperCase()}.`);
    });

    socket.on('opponent_move', (move) => {
        // Apply opponent's move
        game.movePiece(move.fromR, move.fromC, move.toR, move.toC, move.promoteTo);
        renderBoard();
        checkGameStatus();
    });
});

// Initial Render
renderBoard();
