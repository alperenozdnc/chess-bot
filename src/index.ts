import { INITIAL_POSITION } from "@constants";
import { handlePieceMovement, drawBoardfromFEN, handleBoardFlipping } from "@functions";

drawBoardfromFEN(INITIAL_POSITION);
handlePieceMovement();
handleBoardFlipping(INITIAL_POSITION);
