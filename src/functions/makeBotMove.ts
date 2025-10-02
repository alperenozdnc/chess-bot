import { makeMove, findBestMove } from "@functions";
import { GameState } from "@interfaces";

export async function makeBotMove(state: GameState) {
    let depth = 2;

    if (state.moveIdx >= 25) depth++;
    if (state.moveIdx >= 40) depth++;

    console.time("calc, depth=" + depth);
    const move = findBestMove(state, depth);
    console.timeEnd("calc, depth=" + depth);

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
