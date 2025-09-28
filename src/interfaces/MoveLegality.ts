import { PieceData } from "./PieceData";

export interface MoveLegality {
    isMoveLegal: boolean;
    isCapturing: boolean;
    isPromoting: boolean;
    isCastling: boolean;
    isChecking: boolean;
    isEnPassant: boolean;
    capturedPiece: PieceData | undefined;
    enPassantablePawnPos?: string;
}
