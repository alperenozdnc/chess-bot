export interface MoveLegality {
    isMoveLegal: boolean;
    isCapturing: boolean;
    isPromoting: boolean;
    isCastling: boolean;
    isEnPassant: boolean;
    enPassantablePawn?: HTMLImageElement;
}
