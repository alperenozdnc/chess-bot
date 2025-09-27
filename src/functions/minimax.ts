import { evaluate, listAllLegalMoves } from "@functions";
import { GameState, LegalMoveData } from "@interfaces";
import { reverseColor, simulate } from "@utils";

export function minimax(
    state: GameState,
    depth: number,
    isMaximizing: boolean,
    alpha: number = -Infinity,
    beta: number = +Infinity,
) {
    const color = isMaximizing ? state.botColor : reverseColor(state.botColor);
    const moves = listAllLegalMoves(state, color, false);

    if (depth === 0 || moves.length === 0) return evaluate(state);

    let bestEvaluation = isMaximizing ? -Infinity : +Infinity;

    for (let i = 0; i < moves.length; ++i) {
        const move = moves[i] as LegalMoveData;

        const simulation = simulate(
            state,
            move.piece,
            move.pos,
            move.isCastling,
            move.isPromoting,
            move.isCapturing,
            move.isEnPassant,
            state.Board.find((p) => p.pos === move.enPassantablePawnPos),
            move.isCapturing
                ? state.Board.find((p) => p.pos === move.pos)
                : undefined,
        );

        const newState = simulation.play();
        if (!newState) continue;

        const evaluation = minimax(
            newState,
            depth - 1,
            !isMaximizing,
            alpha,
            beta,
        );

        if (isMaximizing) {
            bestEvaluation = Math.max(bestEvaluation, evaluation);
            alpha = Math.max(alpha, evaluation);
        } else {
            bestEvaluation = Math.min(bestEvaluation, evaluation);
            beta = Math.min(beta, evaluation);
        }

        if (beta <= alpha) break;
    }

    return bestEvaluation;
}
