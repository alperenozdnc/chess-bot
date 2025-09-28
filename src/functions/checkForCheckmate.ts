import { PieceColor } from "@types";
import { listLegalMoves } from "./listLegalMoves";
import { FILES } from "@constants";
import { GameState } from "@interfaces";

export async function checkForCheckmate(state: GameState, color: PieceColor) {
    for (const file of FILES) {
        for (let rank = 1; rank <= 8; ++rank) {
            const piece = state.Board.get(file + rank);

            if (!piece) continue;
            if (piece.color !== color) continue;

            const moves = listLegalMoves(state, piece);

            if (moves.length > 0) return false;
        }
    }

    return true;
}
