import { FILES } from "@constants";
import { Pieces } from "@enums";
import { GameState, PieceData } from "@interfaces";
import { SquareValueMap } from "@maps";
import { countMaterials } from "@utils";

function getSquareValueForPiece(
    state: GameState,
    piece: PieceData,
    isEndgame: boolean,
) {
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

    const sign = piece.color === state.botColor ? 1 : -1;
    const value = sign * SquareValueMap.get(key)![mapIdx];

    return value;
}

export function evaluate(state: GameState): number {
    let evaluation = 0;
    let isEndgame = false;

    const { white, black } = countMaterials(state);

    if (state.botColor === "white") {
        evaluation += white - black;
    } else {
        evaluation += black - white;
    }

    if (white + black <= 18) isEndgame = true;

    for (const [_, piece] of state.Board) {
        evaluation += getSquareValueForPiece(state, piece, isEndgame);
    }

    return evaluation;
}
