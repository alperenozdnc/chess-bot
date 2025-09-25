import { GameState } from "@interfaces";
import {
    handleDragStart,
    handleDragEnd,
    handleMouseMovement,
} from "@functions";

export function handlePieceMovement(state: GameState) {
    document.addEventListener("mousedown", async (e) => {
        await handleDragStart(state, e);

        handleMouseMovement(state);

        await handleDragEnd(state);
    });
}
