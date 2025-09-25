import { moveAt } from "@functions";
import { GameState } from "@interfaces";

export function onMouseMove(state: GameState, e: MouseEvent) {
    moveAt(state, e.pageX, e.pageY);
}
