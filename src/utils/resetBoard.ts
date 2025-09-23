import { INITIAL_POSITION } from "@constants";
import { GameState } from "@interfaces";
import { turnFENToBoardArray, drawBoard } from "@functions";
import { resetGameState } from "./resetGameState";

export function resetBoard(state: GameState) {
    resetGameState(state);
    turnFENToBoardArray(INITIAL_POSITION, state);
    drawBoard(state);
}
