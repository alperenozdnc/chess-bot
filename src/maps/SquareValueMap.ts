import {
    BISHOP_SQUARE_TABLE,
    KING_MIDDLEGAME_SQUARE_TABLE,
    KNIGHT_SQUARE_TABLE,
    PAWN_SQUARE_TABLE,
    QUEEN_SQUARE_TABLE,
    ROOK_SQUARE_TABLE,
} from "@constants";
import { Pieces } from "@enums";

export const SquareValueMap: Map<string, number[]> = new Map([
    [Pieces.Pawn, PAWN_SQUARE_TABLE],
    [Pieces.Knight, KNIGHT_SQUARE_TABLE],
    [Pieces.Bishop, BISHOP_SQUARE_TABLE],
    [Pieces.Rook, ROOK_SQUARE_TABLE],
    [Pieces.Queen, QUEEN_SQUARE_TABLE],
    [Pieces.King, KING_MIDDLEGAME_SQUARE_TABLE],
    [Pieces.King + "endgame", KING_MIDDLEGAME_SQUARE_TABLE],
]);
