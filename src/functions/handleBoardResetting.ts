import { GameState } from "@interfaces";
import { resetBoard } from "@utils";

export function handleBoardResetting(state: GameState) {
    const resetButton = document.getElementById(
        "reset-button",
    ) as HTMLButtonElement;

    resetButton!.addEventListener("click", () => {
        resetBoard(state);
    });
}
