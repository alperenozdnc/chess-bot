import { onMouseMove } from "@functions";
import { GameState } from "@interfaces";

/** The parent function for all subfunctions handling mouse movement.
 * (making the piece follow the mouse while dragging)
 */
export function handleMouseMovement(state: GameState) {
    document.addEventListener("mousemove", (e) => onMouseMove(state, e));
}
