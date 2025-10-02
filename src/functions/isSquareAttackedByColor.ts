import { GameState } from "@interfaces";
import { PieceColor } from "@types";
import { isSquareAttacked } from "@functions";

interface ReturnType {
    isAttacked: boolean;
    amount: number;
}

export function isSquareAttackedByColor(
    state: GameState,
    square: string,
    color: PieceColor,
    getAllAttackers: boolean,
): ReturnType {
    let amount = 0;

    for (let [pos, piece] of state.Board) {
        if (piece.color !== color) {
            continue;
        }

        const attacked = isSquareAttacked(state, {
            pos: square,
            attackerPos: pos,
            piece: piece.id,
            attackerColor: color,
        });

        if (!attacked) continue;

        amount++;

        if (!getAllAttackers) {
            return { isAttacked: true, amount };
        }
    }

    return { isAttacked: amount > 0, amount };
}
