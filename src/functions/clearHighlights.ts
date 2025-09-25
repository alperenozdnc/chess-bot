import { GameState } from "@interfaces";

export function clearHighlights(state: GameState) {
    if (state.highlightedSquares.length > 0) {
        for (const square of state.highlightedSquares) {
            square.classList.remove("highlight", "capturable-highlight");
        }

        state.highlightedSquares = [];
    }
}
