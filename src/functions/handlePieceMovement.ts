import { CAPTURE_SOUND, CHECK_SOUND, MOVE_SOUND } from "@constants";
import { Piece, PieceColor } from "@types";
import {
    checkTurn,
    resetDraggedPieceStyles,
    undoMove,
    updateBoard,
} from "@utils";
import {
    checkIfGameOver,
    checkLegality,
    getFEN,
    getPromotionSelection,
    listLegalMoves,
    makeBotMove,
} from "@functions";
import { CastlingMap } from "@maps";
import { GameState } from "@interfaces";
import { Pieces } from "@enums";
import { resetBoard } from "@utils";

function moveAt(state: GameState, pageX: number, pageY: number) {
    if (state.draggedPiece) {
        state.draggedPiece.style.left = `${pageX - state.offsetX}px`;
        state.draggedPiece.style.top = `${pageY - state.offsetY}px`;
    }
}

async function highlightMoves(state: GameState) {
    if (!state.draggedPiece || !state.originalSquare) return;

    let pieceCanMove = checkTurn(
        state.moveIdx,
        state.draggedPiece.dataset.color! as PieceColor,
    );

    if (pieceCanMove) {
        const legalMoves = await listLegalMoves({
            state,
        });

        for (const legalMove of legalMoves) {
            state.highlightedSquares.push(legalMove.square);

            if (legalMove.isCapturing) {
                legalMove.square.classList.add("capturable-highlight");
            } else {
                legalMove.square.classList.add("highlight");
            }
        }
    }
}

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

function clearHighlights(state: GameState) {
    if (state.highlightedSquares.length > 0) {
        for (const square of state.highlightedSquares) {
            square.classList.remove("highlight", "capturable-highlight");
        }

        state.highlightedSquares = [];
    }
}

function playSound(audio: HTMLAudioElement) {
    if (!audio.paused) {
        const clone = audio.cloneNode() as HTMLAudioElement;
        clone.play();
    } else {
        audio.play();
    }
}

function handleAudio(isCapturing: boolean, isChecking: boolean) {
    if (isCapturing) {
        if (!isChecking) {
            playSound(CAPTURE_SOUND);
        } else {
            playSound(CHECK_SOUND);
        }
    } else if (isChecking) {
        playSound(CHECK_SOUND);
    } else {
        playSound(MOVE_SOUND);
    }
}

function mutateDrawCounters(
    state: GameState,
    isCapturing: boolean,
    pieceid: string,
) {
    if (isCapturing) {
        state.movesSinceCapture = 0;
    } else {
        state.movesSinceCapture += 1;
    }

    if (pieceid.toLowerCase() === Pieces.Pawn) {
        state.movesSincePawnAdvance = 0;
    } else {
        state.movesSincePawnAdvance++;
    }
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

export function handlePieceMovement(state: GameState) {
    document.addEventListener("mousedown", async (e) => {
        if ((e.target as HTMLElement).classList.contains("piece")) {
            state.draggedPiece = e.target as HTMLImageElement;
            state.originalSquare = state.draggedPiece
                .parentElement as HTMLDivElement;

            const rect = state.draggedPiece.getBoundingClientRect();

            state.offsetX = e.clientX - rect.left;
            state.offsetY = e.clientY - rect.top;

            state.draggedPiece.classList.add("dragged");
            document.body.appendChild(state.draggedPiece);
            moveAt(state, e.pageX, e.pageY);

            await highlightMoves(state);
        }

        document.addEventListener("mousemove", onMouseMove);

        function onMouseMove(e: MouseEvent) {
            moveAt(state, e.pageX, e.pageY);
        }

        async function onMouseUp(e: MouseEvent) {
            let target = document.elementFromPoint(e.clientX, e.clientY)!;
            if (!target) return;

            target = (
                target.classList.contains("piece")
                    ? target.parentElement
                    : target
            )!;

            const isMoveMade = await makeMove(state, target as HTMLDivElement);

            if (!isMoveMade) return;

            // setTimeout because js is single threaded and makes the piece not drop until the bot can play
            setTimeout(async () => {
                await makeBotMove(state);
            }, 0);

            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }

        document.addEventListener("mouseup", onMouseUp);
    });
}
