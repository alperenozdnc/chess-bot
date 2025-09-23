import { BoardType, PieceColor } from "@types";

export interface GameState {
    Board: BoardType;
    botColor: PieceColor;
    FENPositions: string[];
    draggedPiece: HTMLImageElement | null;
    originalSquare: HTMLDivElement | undefined;
    highlightedSquares: HTMLDivElement[];
    moveHighlights: string[];
    offsetX: number;
    offsetY: number;
    moveIdx: number;
    movesSincePawnAdvance: number;
    movesSinceCapture: number;
    isBoardFlipped: boolean;
    isGameOver: boolean;
}
