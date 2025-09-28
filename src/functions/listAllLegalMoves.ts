import { FILES } from "@constants";
import { GameState, LegalMoveData, LegalMoveDataWithDOM } from "@interfaces";
import { PieceColor } from "@types";

import { listLegalMoves } from "@functions";
import { Values } from "@enums";

function score(data: LegalMoveData): number {
    if (data.isPromoting) {
        return 1000;
    } else if (data.isCapturing) {
        const attackerValue = Values[data.piece.id as keyof typeof Values];
        if (!data.capturedPiece) return 100;

        const victimId = data.capturedPiece!.id;
        const victimValue = Values[victimId as keyof typeof Values];

        return 100 * victimValue - attackerValue;
    } else if (data.isChecking) {
        return 300;
    }

    return 1;
}

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
        const scoredMoves = allMoves.map((m) => ({
            move: m,
            _score: score(m),
        }));
        scoredMoves.sort((a, b) => b._score - a._score);

        return scoredMoves.map((s) => s.move);
    }
}
