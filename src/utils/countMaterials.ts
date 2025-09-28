import { Pieces } from "@enums";
import { GameState } from "@interfaces";

enum Values {
    "p" = 1,
    "n" = 3,
    "b" = 3,
    "r" = 5,
    "q" = 9,
}

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
