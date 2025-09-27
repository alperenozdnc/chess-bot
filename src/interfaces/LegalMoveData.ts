export interface LegalMoveData {
    pos: string;
    isCapturing: boolean;
}

export interface LegalMoveDataWithDOM extends LegalMoveData {
    startSquare: HTMLDivElement;
}
