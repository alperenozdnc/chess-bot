import { Pieces } from "@enums";
import { GameState } from "@interfaces";

export function mutateDrawCounters(
    state: GameState,
    isCapturing: boolean,
    pieceid: string,
) {
    state.movesSinceCapture = isCapturing ? 0 : state.movesSinceCapture + 1;
    state.movesSincePawnAdvance =
        pieceid.toLowerCase() === Pieces.Pawn
            ? 0
            : state.movesSincePawnAdvance + 1;
}
