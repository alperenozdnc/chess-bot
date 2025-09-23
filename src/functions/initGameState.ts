import { INITIAL_POSITION } from "@constants";
import { GameState } from "@interfaces";

export function initGameState(): GameState {
    return {
        Board: [],
        botColor: "black",
        FENPositions: [INITIAL_POSITION],
        draggedPiece: null,
        originalSquare: undefined,
        highlightedSquares: [],
        moveHighlights: [],
        offsetX: 0,
        offsetY: 0,
        moveIdx: 0,
        movesSinceCapture: 0,
        movesSincePawnAdvance: 0,
        isBoardFlipped: false,
        isGameOver: false,
    };
}
