import { Values } from "@enums";
import { PieceData } from "@interfaces";

export function getPieceValue(piece: PieceData) {
    return Values[piece.id as keyof typeof Values];
}
