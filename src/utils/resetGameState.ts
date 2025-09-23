import { initGameState } from "@functions";
import { GameState } from "@interfaces";

export function resetGameState(state: GameState) {
    Object.assign(state, initGameState());
}
