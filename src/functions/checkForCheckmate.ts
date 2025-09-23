import { PieceColor } from "@types";
import { listLegalMoves } from "./listLegalMoves";
import { FILES } from "@constants";
import { getSquareAndPieceFromPos } from "@utils";
import { GameState, SquareAndPiece } from "@interfaces";

export async function checkForCheckmate(state: GameState, color: PieceColor) {
    for (const file of FILES) {
        for (let rank = 1; rank <= 8; ++rank) {
            const squareAndPieceData = getSquareAndPieceFromPos(
                `${file}${rank}`,
            ) as SquareAndPiece;

            if (!squareAndPieceData.square) continue;
            if (!squareAndPieceData.piece) continue;
            if (squareAndPieceData.piece.dataset.color !== color) continue;

            state.draggedPiece = squareAndPieceData.piece;
            state.originalSquare = squareAndPieceData.square;

            const legalMoves = await listLegalMoves({ state });

            if (legalMoves.length > 0) return false;
        }
    }

    state.draggedPiece = null;
    state.originalSquare = undefined;

    return true;
}
