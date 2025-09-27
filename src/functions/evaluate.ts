import { GameState } from "@interfaces";
import { countMaterials } from "@utils";

export function evaluate(state: GameState): number {
    const { white, black } = countMaterials(state);

    if (state.botColor === "white") {
        return white - black;
    } else {
        return black - white;
    }
}
