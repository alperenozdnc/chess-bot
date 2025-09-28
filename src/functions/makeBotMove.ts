import { makeMove, findBestMove } from "@functions";
import { GameState } from "@interfaces";

export async function makeBotMove(state: GameState) {
    const DEPTH = 3;

    console.time("calc, depth=" + DEPTH);
    const move = findBestMove(state, DEPTH);
    console.timeEnd("calc, depth=" + DEPTH);

    if (!move) return;

    state.originalSquare = document.querySelector(
        `[data-pos="${move.piece.pos}"`,
    ) as HTMLDivElement;

    state.draggedPiece = state.originalSquare.firstChild as HTMLImageElement;

    const target = document.querySelector(
        `[data-pos="${move.pos}"]`,
    ) as HTMLDivElement;

    await makeMove(state, target, true);

    state.draggedPiece = null;
    state.originalSquare = undefined;
}
