import { FILES } from "@constants";
import { checkLegality } from "@functions";
import { GameState, LegalMoveData, PieceData } from "@interfaces";

export async function listLegalMoves(
    state: GameState,
    piece: PieceData,
): Promise<LegalMoveData[]> {
    let moves: LegalMoveData[] = [];

    for (const file of FILES) {
        for (let rank = 1; rank <= 8; ++rank) {
            const pos = file + rank;

            if (pos === piece.pos) continue;

            const { isMoveLegal, isCapturing } = await checkLegality(state, {
                piece: piece,
                destinationPos: pos,
                isJustChecking: true,
            });

            if (isMoveLegal) {
                moves.push({ pos, isCapturing });
            }
        }
    }

    return moves;
}
