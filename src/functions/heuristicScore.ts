import { FILES } from "@constants";
import { Values } from "@enums";
import { LegalMoveData } from "@interfaces";

export function heuristicScore(data: LegalMoveData): number {
    let score = 1;

    if (data.isPromoting) {
        score += 1000;
    } else if (data.isCapturing) {
        const attackerValue = Values[data.piece.id as keyof typeof Values];
        if (!data.capturedPiece) return 100;

        const victimId = data.capturedPiece.id;
        const victimValue = Values[victimId as keyof typeof Values];

        score += 100 * victimValue - attackerValue;
    } else if (data.isChecking) {
        score += 300;
    }

    const file = FILES.indexOf(data.pos[0]);
    const rank = +data.pos[1];

    if (file === 4 || file === 5) {
        score += 200;
    } else if (file >= 2 && file <= 5) {
        score += 100;
    }

    if (
        data.piece.id === "p" &&
        ((data.piece.color === "white" && rank > 2) ||
            (data.piece.color === "black" && rank < 7))
    ) {
        score += 50;
    }

    return score;
}
