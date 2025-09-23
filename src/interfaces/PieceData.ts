import { Piece, PieceColor } from "@types";

export interface PieceData {
    pos: string;
    color: PieceColor;
    id: Piece;
    moveCount: number;
    enPassantMoveIdx?: number;
}
