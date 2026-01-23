

import { io } from "socket.io-client";

// Constants and State
const BOARD_SIZE = 8;

// High-quality Chess Piece SVGs (Lichess/Chess.com style)
const NON_SVG_PIECES = false;
const SVGS = {
    white: {
        king: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
            <g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22.5 11.63V6" stroke-linejoin="miter"/>
                <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff" stroke-linecap="butt" stroke-linejoin="miter"/>
                <path d="M12.5 37c5.5 3.5 14.5 3.5 20 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7" fill="#fff"/>
                <path d="M20 8h5" stroke-linejoin="miter"/>
                <path d="M32.5 29.5s8.5-4 6.03-9.65C34.15 14 25 18 22.5 24.5v2.1-2.1C20 18 10.85 14 6.47 19.85c-2.47 5.65 6.03 9.65 6.03 9.65" stroke="#000"/>
                <path d="M12.5 30c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0" stroke="#000"/>
            </g>
        </svg>`,
        queen: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
            <g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z"/>
                <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/>
                <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/>
                <circle cx="6" cy="12" r="2"/>
                <circle cx="14" cy="9" r="2"/>
                <circle cx="22.5" cy="8" r="2"/>
                <circle cx="31" cy="9" r="2"/>
                <circle cx="39" cy="12" r="2"/>
            </g>
        </svg>`,
        rook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
            <g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/>
                <path d="M34 14l-3 3H14l-3-3"/>
                <path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/>
                <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
                <path d="M11 14h23" fill="none" stroke-linejoin="miter"/>
            </g>
        </svg>`,
        bishop: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
            <g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <g fill="#fff" stroke-linecap="butt">
                    <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"/>
                    <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
                    <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/>
                </g>
                <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke-linejoin="miter"/>
            </g>
        </svg>`,
        knight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
            <g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff"/>
                <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" fill="#fff"/>
                <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zm5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill="#000"/>
            </g>
        </svg>`,
        pawn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
            <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-2.78-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`
    },
    black: {
        king: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
            <g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22.5 11.63V6" stroke-linejoin="miter"/>
                <path d="M20 8h5" stroke-linejoin="miter"/>
                <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#000" stroke-linecap="butt" stroke-linejoin="miter"/>
                <path d="M12.5 37c5.5 3.5 14.5 3.5 20 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7" fill="#000"/>
                <path d="M32.5 29.5s8.5-4 6.03-9.65C34.15 14 25 18 22.5 24.5v2.1-2.1C20 18 10.85 14 6.47 19.85c-2.47 5.65 6.03 9.65 6.03 9.65" stroke="#000"/>
                <path d="M12.5 30c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0" stroke="#fff"/>
            </g>
        </svg>`,
        queen: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
            <g fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <g fill="#000">
                    <circle cx="6" cy="12" r="2.75"/>
                    <circle cx="14" cy="9" r="2.75"/>
                    <circle cx="22.5" cy="8" r="2.75"/>
                    <circle cx="31" cy="9" r="2.75"/>
                    <circle cx="39" cy="12" r="2.75"/>
                </g>
                <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" fill="#000" stroke-linecap="butt"/>
                <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" fill="#000" stroke-linecap="butt"/>
                <path d="M11 38.5a35 35 1 0 0 23 0" fill="none" stroke-linecap="butt"/>
                <path d="M11 29a35 35 1 0 1 23 0m-21.5 2.5h20m-21 3a35 35 1 0 0 22 0" fill="none" stroke="#fff"/>
            </g>
        </svg>`,
        rook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
            <g fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z" fill="#000" stroke-linecap="butt"/>
                <path d="M14 29.5v-13h17v13H14z" fill="#000" stroke-linecap="butt" stroke-linejoin="miter"/>
                <path d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z" fill="#000" stroke-linecap="butt"/>
                <path d="M12 35.5h21m-20-4h19m-18-2h17m-17-13h17M11 14h23" fill="none" stroke="#fff" stroke-width="1" stroke-linejoin="miter"/>
            </g>
        </svg>`,
        bishop: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
            <g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <g fill="#000" stroke-linecap="butt">
                    <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"/>
                    <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
                    <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/>
                </g>
                <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#fff" stroke-linejoin="miter"/>
            </g>
        </svg>`,
        knight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
            <g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#000"/>
                <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" fill="#000"/>
                <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zm5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill="#fff" stroke="#fff"/>
                <path d="M24.55 10.4l-.45 1.45.5.15c3.15 1 5.65 2.49 7.9 6.75S35.75 29.06 35.25 39l-.05.5h2.25l.05-.5c.5-10.06-.88-16.85-3.25-21.34-2.37-4.49-5.79-6.64-9.19-7.16l-.51-.1z" fill="#fff" stroke="none"/>
            </g>
        </svg>`,
        pawn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
            <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-2.78-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`
    }
};

// File and Rank labels for coordinates
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

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
const resetBtn = document.getElementById('reset-btn');
const modeIndicatorEl = document.getElementById('game-mode-indicator');
// const settingsBtn = document.getElementById('settings-btn');
// const settingsModal = document.getElementById('settings-modal');
// const closeSettingsModalBtn = document.getElementById('close-settings-modal');
const autoFlipToggle = document.getElementById('auto-flip-toggle');
const selectedColorDisplay = document.getElementById('selected-color-display');
const gameOverModal = document.getElementById('game-over-modal');
const gameOverTitle = document.getElementById('game-over-title');
const gameOverStatus = document.getElementById('game-over-status');
const gameOverIcon = document.querySelector('.game-over-icon');
const rematchBtn = document.getElementById('rematch-btn');
const closeGameOver = document.getElementById('close-game-over');

let selectedSquare = null;
let pendingMove = null;
let currentGameMode = 'freeplay'; // 'freeplay', 'online', 'friend'
let settings = {
    autoFlip: true
};

function updateModeIndicator(mode) {
    currentGameMode = mode;
    if (modeIndicatorEl) {
        let text = 'Free Play';
        if (mode === 'online') text = 'Online Play (Searching...)';
        if (mode === 'friend') text = 'Friend Play (Waiting...)';
        modeIndicatorEl.textContent = text;
    }
}

// Online State
let socket = null;
let isOnline = false;
let isSearching = false;
let playerColor = null; // 'white' or 'black'

function renderBoard() {
    try {
        boardEl.innerHTML = '';

        // Flip logic
        const isFlipped = game.isFlipped;
        const rows = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]; // Visual rows
        const cols = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

        rows.forEach((r, visualRow) => {
            cols.forEach((c, visualCol) => {
                const square = document.createElement('div');
                square.className = `square ${(r + c) % 2 === 0 ? 'dark' : 'light'}`;
                square.dataset.r = r;
                square.dataset.c = c;

                // Add coordinate labels
                // File labels (a-h) on the bottom row
                if (visualRow === 7) {
                    const fileLabel = document.createElement('span');
                    fileLabel.className = 'coord-file';
                    fileLabel.textContent = FILES[c];
                    square.appendChild(fileLabel);
                }

                // Rank labels (1-8) on the leftmost column
                if (visualCol === 0) {
                    const rankLabel = document.createElement('span');
                    rankLabel.className = 'coord-rank';
                    rankLabel.textContent = RANKS[r];
                    square.appendChild(rankLabel);
                }

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
                        pieceEl.classList.add('king-in-check');
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

    // Auto-flip board so current player is at the bottom (ONLY IF LOCAL and enabled)
    if (!isOnline && settings.autoFlip) {
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
            const winner = game.turn === 'white' ? 'Black' : 'White';
            showGameOver('Checkmate!', `${winner} Wins!`);
        } else {
            showGameOver('Stalemate', 'The game is a draw');
        }
    }
}

function showGameOver(title, message) {
    gameOverTitle.textContent = title;
    gameOverStatus.textContent = message;

    // Set icon based on title
    if (title.includes('Checkmate')) {
        gameOverIcon.textContent = '🏆';
    } else {
        gameOverIcon.textContent = '🤝';
    }

    gameOverModal.classList.remove('hidden');
    // Also update main status text
    statusEl.textContent = `${title} ${message}`;
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

const settingsFlipBtn = document.getElementById('settings-flip-btn');

if (settingsFlipBtn) {
    settingsFlipBtn.addEventListener('click', () => {
        game.isFlipped = !game.isFlipped;
        renderBoard();
    });
}

resetBtn.addEventListener('click', () => {
    // If we were in an online/friend game, we might want to stay in that mode or go back to freeplay.
    // For now, let's assume reset always goes back to local freeplay unless the user explicitly joins again.
    isOnline = false;
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    updateModeIndicator('freeplay');

    game.initBoard();
    game.turn = 'white';
    game.isFlipped = false;
    game.check = false;
    selectedSquare = null;
    pendingMove = null; // Clear pending
    promotionModal.classList.add('hidden'); // Hide modal
    renderBoard();
});

// Friend Play UI logic
const friendPlayBtn = document.getElementById('friend-play-btn');
const friendModal = document.getElementById('friend-modal');
const closeFriendModal = document.getElementById('close-friend-modal');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

if (friendPlayBtn) {
    friendPlayBtn.addEventListener('click', () => {
        friendModal.classList.remove('hidden');
    });
}

if (closeFriendModal) {
    closeFriendModal.addEventListener('click', () => {
        friendModal.classList.add('hidden');
    });
}


// Sidebar Navigation Logic
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view-section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetView = item.dataset.view;

        // Update Nav UI
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        // Update View
        views.forEach(v => {
            if (v.id === `view-${targetView}`) {
                v.classList.add('active');
            } else {
                v.classList.remove('active');
            }
        });
    });
});

// Remove old settings modal logic handling references that might error if elements are missing
const oldSettingsBtn = document.getElementById('settings-btn');
if (oldSettingsBtn) {
    oldSettingsBtn.addEventListener('click', () => {
        // Switch to settings view
        const settingsNav = document.querySelector('.nav-item[data-view="settings"]');
        if (settingsNav) settingsNav.click();
    });
}


tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const contentId = `tab-${tab.dataset.tab}`;
        document.getElementById(contentId).classList.add('active');
    });
});

// Color options highlight
const colorOptions = document.querySelectorAll('.color-option');
let selectedFriendColor = 'random';

colorOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        colorOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedFriendColor = opt.dataset.color;
    });
});

// Set default selection
const defaultColorOpt = Array.from(colorOptions).find(opt => opt.dataset.color === 'random');
if (defaultColorOpt) defaultColorOpt.classList.add('selected');

// Online Play Handler
const onlineBtn = document.getElementById('online-btn');
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const roomCodeInput = document.getElementById('room-code-input');
const roomWaitContainer = document.getElementById('room-wait-container');
const displayRoomCode = document.getElementById('display-room-code');
const cancelRoomBtn = document.getElementById('cancel-room-btn');

function connectSocket() {
    if (socket) return Promise.resolve(socket);

    return new Promise((resolve) => {
        onlineBtn.textContent = "Connecting...";
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
            console.log('Connected to server');
            setupSocketListeners();
            resolve(socket);
        });

        socket.on('disconnect', () => {
            onlineBtn.textContent = "Disconnected";
            isOnline = false;
        });
    });
}

function setupSocketListeners() {
    // Check if listeners are already attached to avoid duplicates
    if (socket._hasCustomListeners) return;

    socket.on('game_start', (data) => {
        isOnline = true;
        playerColor = data.color;
        onlineBtn.textContent = `Playing as ${playerColor.toUpperCase()}`;

        // Update mode indicator based on what we were doing
        if (currentGameMode === 'freeplay') {
            // If somehow we got here without setting mode, default to online
            updateModeIndicator('online');
        }

        // Hide modals and room setup
        if (friendModal) friendModal.classList.add('hidden');
        if (roomWaitContainer) roomWaitContainer.classList.add('hidden');

        game.initBoard();
        game.turn = 'white';
        game.check = false;
        game.isFlipped = (playerColor === 'black');
        selectedSquare = null;
        pendingMove = null;
        renderBoard();
        alert(`Game Found! You are playing as ${playerColor.toUpperCase()}.`);
    });

    socket.on('opponent_move', (move) => {
        game.movePiece(move.fromR, move.fromC, move.toR, move.toC, move.promoteTo);
        renderBoard();
        checkGameStatus();
    });

    socket.on('room_created', (data) => {
        if (friendModal) friendModal.classList.add('hidden');
        if (roomWaitContainer) roomWaitContainer.classList.remove('hidden');
        displayRoomCode.textContent = data.roomCode;
        if (selectedColorDisplay) {
            selectedColorDisplay.textContent = selectedFriendColor;
        }
    });

    socket.on('error_message', (msg) => {
        alert(msg);
        onlineBtn.textContent = "Online Play";
    });

    socket.on('waiting', () => {
        isSearching = true;
        onlineBtn.textContent = "Cancel Search";
    });

    socket._hasCustomListeners = true;
}

onlineBtn.addEventListener('click', async () => {
    if (isOnline) return;

    await connectSocket();

    if (isSearching) {
        // Cancel Search
        socket.emit('cancel_matchmaking');
        isSearching = false;
        onlineBtn.textContent = "Online Play";
        updateModeIndicator('freeplay');
    } else {
        // Start Search
        updateModeIndicator('online');
        onlineBtn.textContent = "Searching...";
        socket.emit('find_match');
    }
});

createRoomBtn.addEventListener('click', async () => {
    updateModeIndicator('friend');
    await connectSocket();
    socket.emit('create_room', { color: selectedFriendColor });
});

joinRoomBtn.addEventListener('click', async () => {
    const code = roomCodeInput.value.trim().toUpperCase();
    if (!code) return alert("Please enter a room code");
    updateModeIndicator('friend');
    await connectSocket();
    socket.emit('join_room', code);
});

if (cancelRoomBtn) {
    cancelRoomBtn.addEventListener('click', () => {
        if (socket) {
            // socket.emit('leave_room'); // Not implemented on server yet, but disconnect works
            socket.disconnect();
            socket = null;
        }
        isOnline = false;
        if (roomWaitContainer) roomWaitContainer.classList.add('hidden');
        updateModeIndicator('freeplay');
        // Also reset online button if it was stuck
        onlineBtn.textContent = "Online Play";
    });
}

// Settings view is handled by sidebar navigation now, so these modal listeners are no longer needed
/*
if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });
}

if (closeSettingsModalBtn) {
    closeSettingsModalBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });
}
*/

if (autoFlipToggle) {
    autoFlipToggle.addEventListener('change', (e) => {
        settings.autoFlip = e.target.checked;
        // If turning on, immediately apply to current turn if local
        if (settings.autoFlip && !isOnline) {
            game.isFlipped = game.turn === 'black';
            renderBoard();
        }
    });
}

// Game Over Modal Listeners
if (rematchBtn) {
    rematchBtn.addEventListener('click', () => {
        gameOverModal.classList.add('hidden');
        // Reset Logic
        game.initBoard();
        game.turn = 'white';
        game.check = false;
        selectedSquare = null;
        renderBoard();
    });
}

if (closeGameOver) {
    closeGameOver.addEventListener('click', () => {
        gameOverModal.classList.add('hidden');
    });
}

// Initial Render
renderBoard();
