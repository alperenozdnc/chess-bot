import { GameState } from "@interfaces";
import { PieceColor } from "@types";
import { checkTurn } from "@utils";
import { listLegalMoves } from "./listLegalMoves";

export async function highlightMoves(state: GameState) {
    if (!state.draggedPiece || !state.originalSquare) return;

    let pieceCanMove = checkTurn(
        state.moveIdx,
        state.draggedPiece.dataset.color! as PieceColor,
    );

    if (pieceCanMove) {
        const legalMoves = await listLegalMoves({
            state,
        });

        for (const legalMove of legalMoves) {
            state.highlightedSquares.push(legalMove.square);

            if (legalMove.isCapturing) {
                legalMove.square.classList.add("capturable-highlight");
            } else {
                legalMove.square.classList.add("highlight");
            }
        }
    }
}
