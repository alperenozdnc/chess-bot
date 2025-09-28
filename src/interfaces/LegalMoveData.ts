import { PieceData } from "./PieceData";

export interface LegalMoveData {
    pos: string;
    isCapturing: boolean;
    piece: PieceData;
    isCastling: boolean;
    isPromoting: boolean;
    isEnPassant: boolean;
    isChecking: boolean;
    capturedPiece: PieceData | undefined;
    enPassantablePawnPos?: string;
}

export interface LegalMoveDataWithDOM extends LegalMoveData {
    startSquare: HTMLDivElement;
}
