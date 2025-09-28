import { Pieces, Values } from "@enums";
import { GameState } from "@interfaces";

export function countMaterials(state: GameState) {
    let white = 0;
    let black = 0;

    for (let [_, piece] of state.Board) {
        if (piece.id === Pieces.King) continue;

        const value = piece.id as keyof typeof Values;

        if (piece.color === "white") {
            white += Values[value];
        } else {
            black += Values[value];
        }
    }

    return { white, black };
}
