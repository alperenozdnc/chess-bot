import { Piece } from "@types";
import { checkLegality } from "@functions";
import { GameState, LegalMoveData } from "@interfaces";

interface Data {
    state: GameState;
}

export async function listLegalMoves({
    state,
}: Data): Promise<LegalMoveData[]> {
    let squares: HTMLDivElement[] = [];

    document
        .querySelectorAll(".square")
        .forEach((square) => squares.push(square as HTMLDivElement));

    let legalMoves: LegalMoveData[] = [];

    for (const square of squares) {
        if (square === state.originalSquare) continue;
        if (!state.draggedPiece) break;

        let pieceid = state.draggedPiece.dataset.pieceid!.toUpperCase();
        const pieceObject = state.Board.find(
            (piece) => piece.pos === state.originalSquare!.dataset.pos,
        );

        if (!pieceObject) continue;

        const { isMoveLegal, isCapturing } = await checkLegality(state, {
            ID: pieceid.toLowerCase() as Piece,
            color: pieceObject.color,
            pieceElement: state.draggedPiece,
            pieceMoveCount: pieceObject!.moveCount,
            startSquare: state.originalSquare!,
            destinationSquare: square,
            moveIdx: state.moveIdx,
            isJustChecking: true,
        });

        if (isMoveLegal) {
            legalMoves.push({ square, isCapturing });
        }
    }

    return legalMoves;
}
