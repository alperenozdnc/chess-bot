import { Pieces } from "@enums";
import {
    checkIfGameOver,
    checkLegality,
    clearHighlights,
    drawBoard,
    getFEN,
    getPromotionSelection,
    handleAudio,
    mutateDrawCounters,
} from "@functions";
import { GameState } from "@interfaces";
import { CastlingMap } from "@maps";
import { Piece, PieceColor } from "@types";
import {
    checkTurn,
    resetBoard,
    resetDraggedPieceStyles,
    undoMove,
    updateBoard,
} from "@utils";

function isTargetWrong(
    target: Element,
    originalSquare: HTMLDivElement,
    piece: HTMLImageElement,
) {
    let result = false;

    if (!target.classList.contains("square") || target === originalSquare) {
        originalSquare.appendChild(piece);
        resetDraggedPieceStyles(piece);

        result = true;
    } else if (!target) result = true;

    return result;
}

export async function makeMove(
    state: GameState,
    target: HTMLDivElement,
    isComputer?: boolean,
) {
    if (!state.draggedPiece) return;
    if (!state.originalSquare) return;
    if (!state.originalSquare.dataset.pos) return;

    const pieceColor = state.draggedPiece.dataset.color as PieceColor;
    let pieceCanMove = checkTurn(state.moveIdx, pieceColor);

    clearHighlights(state);

    if (isTargetWrong(target, state.originalSquare!, state.draggedPiece))
        return;

    if (!pieceCanMove) {
        undoMove(state.originalSquare!, state.draggedPiece);
        resetDraggedPieceStyles(state.draggedPiece);
        return;
    }
    let pieceid = state.draggedPiece.dataset.pieceid!.toUpperCase();
    const pieceObject = state.Board.get(state.originalSquare.dataset.pos);

    const {
        isMoveLegal,
        isCapturing,
        isPromoting,
        isCastling,
        isEnPassant,
        isChecking,
        enPassantablePawnPos,
    } = checkLegality(state, {
        piece: pieceObject!,
        destinationPos: target.dataset.pos!,
        isJustChecking: false,
    });

    if (!isMoveLegal) {
        undoMove(state.originalSquare!, state.draggedPiece);
        resetDraggedPieceStyles(state.draggedPiece);
        return;
    }

    let pos = (target as HTMLDivElement).dataset.pos;

    ++state.moveIdx;

    if (!pieceObject) {
        console.error("piece not found");
        return;
    }

    if (!target.dataset.pos) {
        console.error("target not found");
        return;
    }

    state.FENPositions.push(getFEN());

    state.moveHighlights = [];
    state.moveHighlights.push(
        state.originalSquare!.dataset.pos as string,
        target.dataset.pos,
    );

    if (!isPromoting) {
        if (!isCapturing) {
            updateBoard(
                {
                    type: "MOVE",
                    data: {
                        piece: pieceObject,
                        destinationPos: target.dataset.pos,
                    },
                },
                state,
            );
        } else {
            const capturedPiecePos = !isEnPassant
                ? target.dataset.pos
                : enPassantablePawnPos!;

            updateBoard(
                {
                    type: "CAPTURE",
                    data: {
                        piece: pieceObject,
                        destinationPos: target.dataset.pos,
                        capturedPiece: state.Board.get(capturedPiecePos)!,
                        isEnPassant,
                    },
                },
                state,
            );
        }
    } else {
        resetDraggedPieceStyles(state.draggedPiece);

        // at least for now
        const selection = !isComputer
            ? ((await getPromotionSelection(pieceColor)) as string)
            : Pieces.Queen;

        updateBoard(
            {
                type: "PROMOTE",
                data: {
                    piece: pieceObject,
                    destinationPos: target.dataset.pos,
                    promoteTo: selection as Piece,
                    isCapturing,
                    capturedPiece: state.Board.get(target.dataset.pos),
                },
            },
            state,
        );
    }

    handleAudio(isCapturing, isChecking);
    mutateDrawCounters(state, isCapturing, pieceid);

    if (isCastling) {
        const castlingSquares = CastlingMap.get(pos!)!;
        const posA = castlingSquares[castlingSquares.length - 1];
        const posB = castlingSquares[0];

        if (!state.Board.has(posA))
            return console.error("castling unsuccessful");
        if (!posA) return console.error("castling unsuccessful");

        updateBoard(
            {
                type: "CASTLE",
                data: {
                    king: {
                        piece: pieceObject,
                        destinationPos: target.dataset.pos,
                    },
                    rook: {
                        piece: state.Board.get(posA)!,
                        destinationPos: posB,
                    },
                },
            },
            state,
        );
    }

    drawBoard(state);

    await checkIfGameOver(state, isChecking, pieceColor);

    let gameOver = false;

    if (state.isGameOver) {
        resetBoard(state);
        gameOver = true;
    }

    if (state.draggedPiece) {
        resetDraggedPieceStyles(state.draggedPiece);
        state.draggedPiece = null;
    }

    return { success: true, gameOver };
}
