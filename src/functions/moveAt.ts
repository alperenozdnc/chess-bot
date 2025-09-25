import { GameState } from "@interfaces";

export function moveAt(state: GameState, pageX: number, pageY: number) {
    if (state.draggedPiece) {
        state.draggedPiece.style.left = `${pageX - state.offsetX}px`;
        state.draggedPiece.style.top = `${pageY - state.offsetY}px`;
    }
}
