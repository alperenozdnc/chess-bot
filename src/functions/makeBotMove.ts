import { makeMove, findBestMove } from "@functions";
import { GameState } from "@interfaces";

export async function makeBotMove(state: GameState) {
    const move = await findBestMove(state);

    if (!move) return;

    state.originalSquare = move.startSquare;
    state.draggedPiece = state.originalSquare.firstChild as HTMLImageElement;

    const target = document.querySelector(
        `[data-pos="${move.pos}"]`,
    ) as HTMLDivElement;

    await makeMove(state, target, true);

    state.draggedPiece = null;
    state.originalSquare = undefined;
}
