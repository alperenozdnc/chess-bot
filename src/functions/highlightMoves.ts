import { GameState } from "@interfaces";
import { checkTurn } from "@utils";
import { listLegalMoves } from "./listLegalMoves";

export async function highlightMoves(state: GameState) {
    if (!state.originalSquare) return;
    if (!state.originalSquare.dataset.pos) return;

    const piece = state.Board.get(state.originalSquare.dataset.pos);

    if (!piece) return;
    if (!checkTurn(state.moveIdx, piece.color)) return;

    const moves = listLegalMoves(state, piece);

    for (const move of moves) {
        const square = document.querySelector(
            `[data-pos="${move.pos}"]`,
        )! as HTMLDivElement;

        state.highlightedSquares.push(square);

        if (move.isCapturing) {
            square.classList.add("capturable-highlight");
        } else {
            square.classList.add("highlight");
        }
    }
}
