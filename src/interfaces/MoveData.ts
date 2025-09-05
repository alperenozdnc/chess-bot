import { Piece, PieceColor } from "@types";

export interface MoveData {
    ID: Piece;
    color: PieceColor;
    pieceMoveCount: number;
    startSquare: HTMLDivElement;
    destinationSquare: HTMLDivElement;
}
