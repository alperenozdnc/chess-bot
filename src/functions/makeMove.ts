import { Pieces } from "@enums";
import {
    checkIfGameOver,
    checkLegality,
    clearHighlights,
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
    const pieceObject = state.Board.find(
        (piece) => piece.pos === state.originalSquare!.dataset.pos,
    );

    const {
        isMoveLegal,
        isCapturing,
        isPromoting,
        isCastling,
        isEnPassant,
        isChecking,
        enPassantablePawn,
    } = await checkLegality({
        ID: pieceid.toLowerCase() as Piece,
        color: pieceColor,
        pieceElement: state.draggedPiece,
        pieceMoveCount: pieceObject!.moveCount,
        startSquare: state.originalSquare!,
        destinationSquare: target as HTMLDivElement,
        moveIdx: state.moveIdx,
        isJustChecking: false,
    });

    if (!isMoveLegal) {
        undoMove(state.originalSquare!, state.draggedPiece);
        resetDraggedPieceStyles(state.draggedPiece);
        return;
    }

    let pos = (target as HTMLDivElement).dataset.pos;

    ++state.moveIdx;
    pieceObject!.moveCount += 1;

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
            updateBoard(
                {
                    type: "CAPTURE",
                    data: {
                        piece: pieceObject,
                        destinationPos: target.dataset.pos,
                        capturedPiece: state.Board.find(
                            (piece) => piece.pos === target.dataset.pos,
                        )!,
                        isEnPassant,
                        enPassantAblePawn: isEnPassant
                            ? state.Board.find(
                                (piece) =>
                                    piece.pos ===
                                    enPassantablePawn!.dataset.pos,
                            )
                            : undefined,
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
                    capturedPiece: state.Board.find(
                        (piece) => piece.pos === target.dataset.pos,
                    ),
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

        updateBoard(
            {
                type: "CASTLE",
                data: {
                    king: {
                        piece: pieceObject,
                        destinationPos: target.dataset.pos,
                    },
                    rook: {
                        piece: state.Board.find((piece) => piece.pos === posA)!,
                        destinationPos: posB,
                    },
                },
            },
            state,
        );
    }

    await checkIfGameOver(state, isChecking, pieceColor);

    if (state.isGameOver) resetBoard(state);

    if (state.draggedPiece) {
        resetDraggedPieceStyles(state.draggedPiece);
        state.draggedPiece = null;
    }

    return true;
}
