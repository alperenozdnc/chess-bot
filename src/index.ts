import { INITIAL_POSITION } from "@constants";
import {
    handlePieceMovement,
    drawBoard,
    handleBoardFlipping,
    turnFENToBoardArray,
    initGameState,
    handleBoardResetting,
} from "@functions";

const state = initGameState();

turnFENToBoardArray(INITIAL_POSITION, state);
drawBoard(state);
handlePieceMovement(state);
handleBoardFlipping(state);
handleBoardResetting(state);
