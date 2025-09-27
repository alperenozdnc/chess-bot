import { GameState, LegalMoveDataWithDOM } from "@interfaces";
import { listAllLegalMoves } from "./listAllLegalMoves";
import { minimax } from "./minimax";
import { simulate } from "@utils";

export async function findBestMove(
    state: GameState,
): Promise<LegalMoveDataWithDOM | null> {
    const MAKE_DOM_LOOKUP = true;

    const moves = listAllLegalMoves(state, state.botColor, MAKE_DOM_LOOKUP);

    if (moves.length === 0) {
        console.error("no moves to check for");
        return null;
    }

    /* the root move is the move that is played if all positions are valued
     equal, this helps to keep unpredictability in the bot. */
    const rootMove = moves[
        Math.floor(Math.random() * moves.length)
    ] as LegalMoveDataWithDOM;

    let bestMove: LegalMoveDataWithDOM = rootMove;
    let bestEval: number = -Infinity;

    for (let i = 0; i < moves.length; i++) {
        const move = moves[i] as LegalMoveDataWithDOM;
        const simulation = simulate(
            state,
            move.piece,
            move.pos,
            move.isCastling,
            move.isPromoting,
            move.isCapturing,
            move.isEnPassant,
            state.Board.find((p) => p.pos === move.enPassantablePawnPos),
        );

        const newState = simulation.play();

        if (!newState) continue;

        const evaluation = minimax(newState, 1, true);

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
