import { GameState, LegalMoveData } from "@interfaces";
import { listAllLegalMoves } from "./listAllLegalMoves";
import { minimax } from "./minimax";
import { simulate } from "@utils";

function iterate(state: GameState, depth: number) {
    const moves = listAllLegalMoves(state, state.botColor, false);

    if (moves.length === 0) {
        console.error("no moves to check for");
        return null;
    }

    /* the root move is the move that is played if all positions are valued
     equal, this helps to keep unpredictability in the bot. */
    const rootMove = moves[
        Math.floor(Math.random() * moves.length)
    ] as LegalMoveData;

    let bestMove: LegalMoveData = rootMove;
    let bestEval: number = -Infinity;

    for (let i = 0; i < moves.length; i++) {
        const move = moves[i] as LegalMoveData;
        const simulation = simulate(
            state,
            move.piece,
            move.pos,
            move.isCastling,
            move.isPromoting,
            move.isCapturing,
            move.isEnPassant,
            state.Board.get(move.enPassantablePawnPos!) ?? undefined,
        );

        const newState = simulation.play();

        if (!newState) continue;

        const evaluation = minimax(newState, depth, true);

        if (evaluation > bestEval) {
            bestMove = move;
            bestEval = evaluation;
        } else if (evaluation === bestEval && Math.random() < 0.5) {
            // Math.random is just to keep unpredictability

            bestMove = move;
        }
    }

    return bestMove;
}

function iterativelyFindBestMove(state: GameState, depthLimit: number) {
    let bestMove: LegalMoveData | undefined;

    for (let d = 1; d <= depthLimit; d++) {
        const move = iterate(state, d);

        bestMove = move!;
    }

    return bestMove;
}

export function findBestMove(
    state: GameState,
    depth: number,
): LegalMoveData | undefined {
    return iterativelyFindBestMove(state, depth);
}
