import { BOARD } from "@constants";
import { makeMove } from "./handlePieceMovement";
import { listLegalMoves } from "@functions";
import { GameState } from "@interfaces";

export async function makeBotMove(state: GameState) {
    const pieces = Array.from(
        BOARD.querySelectorAll(`[data-color="${state.botColor}"]`),
    ) as HTMLImageElement[];

    const allLegalMoves = [];

    for (const botPiece of pieces) {
        const startSquare = botPiece.parentElement as HTMLDivElement;

        state.originalSquare = startSquare;
        state.draggedPiece = botPiece;

        const legalMoves = await listLegalMoves({ state });

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

    await makeMove(state, move.square, true);

    state.draggedPiece = null;
    state.originalSquare = undefined;
}
