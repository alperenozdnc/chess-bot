import { drawBoard } from "@functions";
import { GameState } from "@interfaces";

export function handleBoardFlipping(state: GameState) {
    const flipButton = document.getElementById(
        "flip-button",
    ) as HTMLButtonElement;

    flipButton!.addEventListener("click", () => {
        state.isBoardFlipped = !state.isBoardFlipped;
        drawBoard(state);
    });
}
