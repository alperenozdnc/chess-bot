import { INITIAL_POSITION } from "@constants";
import { GameState, PieceData } from "@interfaces";

export function initGameState(): GameState {
    return {
        Board: new Map<string, PieceData>(),
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
