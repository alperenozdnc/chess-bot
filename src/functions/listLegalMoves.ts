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

        const pieceObject = state.Board.find(
            (piece) => piece.pos === state.originalSquare!.dataset.pos,
        );

        if (!pieceObject) continue;

        const { isMoveLegal, isCapturing } = await checkLegality(state, {
            piece: pieceObject,
            destinationPos: square.dataset.pos!,
            isJustChecking: true,
        });

        if (isMoveLegal) {
            legalMoves.push({ square, isCapturing });
        }
    }

    return legalMoves;
}
