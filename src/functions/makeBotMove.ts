import { Piece, PieceColor } from "@types";
import { listLegalMoves } from "@functions";
import { makeMove } from "./handlePieceMovement";
import { BOARD } from "@constants";

export async function makeBotMove(
    color: PieceColor,
    moveIdx: number,
    highlightedSquares: HTMLDivElement[],
    movesSinceCapture: number,
    movesSincePawnAdvance: number,
    FENPositions: string[],
) {
    const pieces = Array.from(
        BOARD.querySelectorAll(`[data-color="${color}"]`),
    ) as HTMLImageElement[];

    const allLegalMoves = [];

    for (const botPiece of pieces) {
        const pieceid = botPiece.dataset.pieceid as Piece;
        const startSquare = botPiece.parentElement as HTMLDivElement;

        if (!botPiece) continue;

        const pieceMoveCount = +botPiece.dataset.move_count!;

        const legalMoves = await listLegalMoves({
            piece: pieceid,
            color,
            startSquare,
            pieceElement: botPiece,
            pieceMoveCount,
            moveIdx,
        });

        for (const legalMove of legalMoves) {
            allLegalMoves.push({
                ...legalMove,
                piece: botPiece,
                startSquare,
            });
        }
    }

    const move =
        allLegalMoves[Math.floor(Math.random() * allLegalMoves.length)];

    if (!move) return;

    const movePiece = move.piece;

    const moveData = await makeMove(
        movePiece,
        moveIdx,
        move.square,
        highlightedSquares,
        allLegalMoves[allLegalMoves.indexOf(move)].startSquare,
        movesSinceCapture,
        movesSincePawnAdvance,
        FENPositions,
    );

    if (moveData) {
        moveIdx = moveData.moveIdx;
        movesSinceCapture = moveData.movesSinceCapture;
        movesSincePawnAdvance = moveData.movesSincePawnAdvance;
        FENPositions = moveData.FENPositions;
    }

    return { moveIdx, movesSinceCapture, movesSincePawnAdvance, FENPositions };
}
