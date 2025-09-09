import { Piece, PieceColor } from "@types";
import { checkLegality } from "@functions";
import { LegalMoveData } from "@interfaces";

interface Data {
    piece: Piece;
    color: PieceColor;
    pieceMoveCount: number;
    startSquare: HTMLDivElement;
    moveIdx: number;
}

export async function listLegalMoves({ piece, color, startSquare, pieceMoveCount, moveIdx }: Data): Promise<LegalMoveData[]> {
    let squares: HTMLDivElement[] = [];
    document.querySelectorAll(".square").forEach(square => squares.push(square as HTMLDivElement));

    let legalMoves: LegalMoveData[] = [];

    for (const square of squares) {
        if (square === startSquare) continue;

        const { isMoveLegal, isCapturing } = await checkLegality({ ID: piece, color: color, pieceMoveCount: pieceMoveCount, startSquare, destinationSquare: square, moveIdx: moveIdx, isJustChecking: true });

        if (isMoveLegal) { legalMoves.push({ square, isCapturing }) }
    }

    return legalMoves;
}
