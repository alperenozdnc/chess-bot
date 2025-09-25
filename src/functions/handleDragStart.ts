import { highlightMoves, moveAt } from "@functions";
import { GameState } from "@interfaces";

/** The function handling the user starting to drag the piece.
 * (gets the piece being dragged and the square it used to belong to)
 * (highlights the legal moves for the user to see)
 */
export async function handleDragStart(state: GameState, e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains("piece")) {
        state.draggedPiece = e.target as HTMLImageElement;
        state.originalSquare = state.draggedPiece
            .parentElement as HTMLDivElement;

        const rect = state.draggedPiece.getBoundingClientRect();

        state.offsetX = e.clientX - rect.left;
        state.offsetY = e.clientY - rect.top;

        state.draggedPiece.classList.add("dragged");
        document.body.appendChild(state.draggedPiece);
        moveAt(state, e.pageX, e.pageY);

        await highlightMoves(state);
    }
}
