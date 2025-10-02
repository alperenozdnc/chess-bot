import { FILES } from "@constants";
import { Pieces } from "@enums";
import { GameState, PieceData } from "@interfaces";
import { SquareValueMap } from "@maps";
import { getPieceValue } from "@utils";

function getSquareValueForPiece(piece: PieceData, isEndgame: boolean) {
    const pos = piece.pos;
    const fileChar = pos[0];
    const rankIdx = Number(pos[1]);

    let mapIdx = (8 - rankIdx) * 8 + FILES.indexOf(fileChar);

    // square values are reversed for black
    // 0-based total square count is 63
    if (piece.color === "black") {
        mapIdx = 63 - mapIdx;
    }

    let key: string = piece.id;

    // the king should be more inclined to move towards the endgame
    if (key === Pieces.King && isEndgame) {
        (key as string) += "endgame";
    }

    const value = SquareValueMap.get(key)![mapIdx];

    return value;
}

export function evaluate(state: GameState): number {
    let evaluation = 0;
    let isEndgame = false;

    let totalMaterial = 0;
    let selfKing;
    let enemyKing;

    for (const [_, piece] of state.Board) {
        if (piece.id === Pieces.King) {
            if (piece.color === state.botColor) {
                selfKing = piece;
                continue;
            } else {
                enemyKing = piece;
                continue;
            }
        }

        const sign = piece.color === state.botColor ? 1 : -1;
        const pieceValue = getPieceValue(piece);
        const squareValue = getSquareValueForPiece(piece, false);

        totalMaterial += pieceValue;
        evaluation += sign * (pieceValue + squareValue);
    }

    if (totalMaterial <= 18) isEndgame = true;

    if (selfKing && enemyKing) {
        const selfSquareVal = getSquareValueForPiece(selfKing, isEndgame);
        const enemySquareVal = getSquareValueForPiece(enemyKing, isEndgame);

        evaluation += selfSquareVal + -1 * enemySquareVal;
    } else {
        console.error("error: king or enemy king not found on evaluation");
    }

    return evaluation;
}
