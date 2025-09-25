export interface MoveLegality {
    isMoveLegal: boolean;
    isCapturing: boolean;
    isPromoting: boolean;
    isCastling: boolean;
    isChecking: boolean;
    isEnPassant: boolean;
    enPassantablePawnPos?: string;
}
