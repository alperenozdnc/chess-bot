import { FILES } from "@constants";
import { GameState, LegalMoveData, LegalMoveDataWithDOM } from "@interfaces";
import { PieceColor } from "@types";

import { heuristicScore, listLegalMoves } from "@functions";

export function listAllLegalMoves(
    state: GameState,
    color: PieceColor,
    makeDOMLookup: boolean,
): LegalMoveData[] | LegalMoveDataWithDOM[] {
    const allMoves = [];

    for (const file of FILES) {
        for (let rank = 1; rank <= 8; rank++) {
            const piece = state.Board.get(file + rank);
            if (!piece) continue;
            if (piece.color !== color) continue;

            const moves = listLegalMoves(state, piece);

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

                allMoves.push({ ...move });
            }
        }
    }

    // not sorting because make dom lookup means
    // its the player thats calling this
    if (makeDOMLookup) {
        return allMoves;
    } else {
        // this weird map and sort and underscore action
        // reduces time complexity from O(n log n) down to O(n)
        const scoredMoves = allMoves.map((m) => ({
            move: m,
            _score: heuristicScore(m),
        }));
        scoredMoves.sort((a, b) => b._score - a._score);

        return scoredMoves.map((s) => s.move);
    }
}
