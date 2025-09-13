import { Piece, PieceColor } from "@types";

export interface MoveData {
    ID: Piece;
    color: PieceColor;
    pieceElement: HTMLImageElement;
    pieceMoveCount: number;
    startSquare: HTMLDivElement;
    destinationSquare: HTMLDivElement;
    moveIdx: number;
    isJustChecking: boolean;
}
