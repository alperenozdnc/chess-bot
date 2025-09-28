import { Values } from "@enums";
import { LegalMoveData } from "@interfaces";

export function heuristicScore(data: LegalMoveData): number {
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
