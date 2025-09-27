import { FILES } from "@constants";
import { GameState, LegalMoveData, LegalMoveDataWithDOM } from "@interfaces";
import { PieceColor } from "@types";

import { listLegalMoves } from "@functions";

export async function listAllLegalMoves(
    state: GameState,
    color: PieceColor,
    makeDOMLookup: boolean,
): Promise<(LegalMoveData | LegalMoveDataWithDOM)[]> {
    const allMoves = [];

    for (const file of FILES) {
        for (let rank = 1; rank <= 8; rank++) {
            const piece = state.Board.find((p) => p.pos === file + rank);
            if (!piece) continue;
            if (piece.color !== color) continue;

            const moves = await listLegalMoves(state, piece);

            for (const move of moves) {
                if (makeDOMLookup) {
                    allMoves.push({
                        startSquare: document.querySelector(
                            `[data-pos="${piece.pos}"]`,
                        ) as HTMLDivElement,
                        ...move,
                    });
                    continue;
                }

                allMoves.push(move);
            }
        }
    }

    return allMoves;
}
