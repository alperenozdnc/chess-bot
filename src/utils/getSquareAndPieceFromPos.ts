import { SquareAndPiece } from "@interfaces";

export function getSquareAndPieceFromPos(pos: string): SquareAndPiece | void {
    const square = document.querySelector(
        `[data-pos=${pos}]`,
    ) as HTMLDivElement;
    if (!square) return;

    const piece = square.firstChild as HTMLImageElement;
    if (!piece) return { square };

    return { square, piece };
}
