import { Pieces } from "@enums";
import { GameState } from "@interfaces";
import { getPieceValue } from "@utils";

export function countMaterials(state: GameState) {
    let white = 0;
    let black = 0;

    for (let [_, piece] of state.Board) {
        if (piece.id === Pieces.King) continue;

        if (piece.color === "white") {
            white += getPieceValue(piece);
        } else {
            white += getPieceValue(piece);
        }
    }

    return { white, black };
}
