import { Piece, PieceColor } from "@types";
import { listLegalMoves } from "./listLegalMoves";
import { FILES } from "@constants";
import { getSquareAndPieceFromPos } from "@utils";
import { SquareAndPiece } from "@interfaces";

interface Data {
    piece: Piece;
    startSquare: HTMLDivElement;
    color: PieceColor;
    pieceElement: HTMLImageElement;
    pieceMoveCount: number;
    moveIdx: number;
}

export async function checkForCheckmate(moveIdx: number, color: PieceColor) {
    for (const file of FILES) {
        for (let rank = 1; rank <= 8; ++rank) {
            const squareAndPieceData = getSquareAndPieceFromPos(`${file}${rank}`) as SquareAndPiece;

            if (!squareAndPieceData.square) continue;
            if (!squareAndPieceData.piece) continue;
            if (squareAndPieceData.piece.dataset.color !== color) continue;

            const data: Data = {
                pieceElement: squareAndPieceData.piece,
                startSquare: squareAndPieceData.square,
                color,
                piece: squareAndPieceData.piece.dataset.pieceid as Piece,
                pieceMoveCount: +squareAndPieceData.piece.dataset.move_count!,
                moveIdx
            };

            const legalMoves = await listLegalMoves(data);

            if (legalMoves.length > 0) return false;
        }
    }

    return true;
}
