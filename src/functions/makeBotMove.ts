import { BOARD } from "@constants";
import { GameState, makeMove } from "./handlePieceMovement";
import { listLegalMoves } from "./listLegalMoves";
import { Piece } from "@types";

export async function makeBotMove(state: GameState) {
    const pieces = Array.from(
        BOARD.querySelectorAll(`[data-color="${state.botColor}"]`),
    ) as HTMLImageElement[];

    const allLegalMoves = [];

    for (const botPiece of pieces) {
        const startSquare = botPiece.parentElement as HTMLDivElement;
        const pieceMoveCount = Number(botPiece.dataset.move_count);

        const legalMoves = await listLegalMoves({
            piece: botPiece.dataset.pieceid as Piece,
            color: state.botColor,
            startSquare: botPiece.parentElement as HTMLDivElement,
            pieceElement: botPiece,
            pieceMoveCount,
            moveIdx: state.moveIdx,
        });

        for (const move of legalMoves) {
            allLegalMoves.push({
                piece: botPiece,
                startSquare,
                square: move.square,
            });
        }
    }

    const move =
        allLegalMoves[Math.floor(Math.random() * allLegalMoves.length)];

    if (!move) return;

    state.draggedPiece = move.piece;
    state.originalSquare = move.startSquare;
    state.moveIdx += 1;

    const isMoveMade = await makeMove(state, move.square, true);

    if (!isMoveMade) state.moveIdx -= 1;
    state.draggedPiece = null;
    state.originalSquare = undefined;
}
