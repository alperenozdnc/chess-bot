import {
    CAPTURE_SOUND,
    CHECK_SOUND,
    INITIAL_POSITION,
    MOVE_SOUND,
} from "@constants";
import { Piece, PieceColor } from "@types";
import {
    checkTurn,
    createPiece,
    getSquareAndPieceFromPos,
    resetDraggedPieceStyles,
    undoMove,
} from "@utils";
import {
    checkIfGameOver,
    checkLegality,
    drawBoardfromFEN,
    getFEN,
    getPromotionSelection,
    listLegalMoves,
    makeBotMove,
} from "@functions";
import { CastlingMap } from "@maps";
import { SquareAndPiece } from "@interfaces";

function moveAt(
    draggedPiece: HTMLDivElement | null,
    offsetX: number,
    offsetY: number,
    pageX: number,
    pageY: number,
) {
    if (draggedPiece) {
        draggedPiece.style.left = `${pageX - offsetX}px`;
        draggedPiece.style.top = `${pageY - offsetY}px`;
    }
}

async function highlightMoves(
    moveIdx: number,
    pieceColor: PieceColor,
    piece: HTMLImageElement,
    originalSquare: HTMLDivElement,
) {
    let pieceCanMove = checkTurn(moveIdx, pieceColor);
    let highlightedSquares = [];

    if (pieceCanMove) {
        const legalMoves = await listLegalMoves({
            piece: piece.dataset.pieceid! as Piece,
            startSquare: originalSquare,
            color: piece.dataset.color! as unknown as PieceColor,
            pieceElement: piece,
            pieceMoveCount: +piece.dataset.move_count! as unknown as number,
            moveIdx: moveIdx,
        });

        for (const legalMove of legalMoves) {
            highlightedSquares.push(legalMove.square);

            if (legalMove.isCapturing) {
                legalMove.square.classList.add("capturable-highlight");
            } else {
                legalMove.square.classList.add("highlight");
            }
        }
    }

    return highlightedSquares;
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

function clearHighlights(highlightedSquares: HTMLDivElement[]) {
    if (highlightedSquares.length > 0) {
        for (const square of highlightedSquares) {
            square.classList.remove("highlight", "capturable-highlight");
        }

        highlightedSquares = [];
    }

    return highlightedSquares;
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
    movesSinceCapture: number,
    movesSincePawnAdvance: number,
    isCapturing: boolean,
    pieceid: string,
) {
    let newMovesSinceCapture = movesSinceCapture;
    let newMovesSincePawnAdvance = movesSincePawnAdvance;

    if (isCapturing) {
        newMovesSinceCapture = 0;
    } else {
        newMovesSinceCapture += 1;
    }

    if (pieceid.toLowerCase() === "p") {
        newMovesSincePawnAdvance = 0;
    } else {
        newMovesSincePawnAdvance++;
    }

    return { newMovesSincePawnAdvance, newMovesSinceCapture };
}

export async function makeMove(
    draggedPiece: HTMLImageElement | null,
    moveIdx: number,
    target: HTMLDivElement,
    highlightedSquares: HTMLDivElement[],
    originalSquare: HTMLDivElement,
    movesSinceCapture: number,
    movesSincePawnAdvance: number,
    FENPositions: string[],
) {
    if (!draggedPiece) return;

    const pieceColor = draggedPiece.dataset.color as PieceColor;
    let pieceCanMove = checkTurn(moveIdx, pieceColor);

    clearHighlights(highlightedSquares);

    if (isTargetWrong(target, originalSquare, draggedPiece)) return;

    if (!pieceCanMove) {
        undoMove(originalSquare, draggedPiece);
        resetDraggedPieceStyles(draggedPiece);
        return;
    }

    let pieceid = draggedPiece.dataset.pieceid!.toUpperCase();

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
        pieceElement: draggedPiece,
        pieceMoveCount: Number(draggedPiece.dataset.move_count),
        startSquare: originalSquare,
        destinationSquare: target as HTMLDivElement,
        moveIdx: moveIdx,
        isJustChecking: false,
    });

    if (!isMoveLegal) {
        undoMove(originalSquare, draggedPiece);
        resetDraggedPieceStyles(draggedPiece);
        return;
    }

    let pos = (target as HTMLDivElement).dataset.pos;

    (draggedPiece.dataset.move_count as unknown as number) =
        +(draggedPiece.dataset.move_count ?? 0) + 1;

    ++moveIdx;

    if (!isPromoting) {
        target.innerHTML = "";
        target.appendChild(draggedPiece);
    } else {
        resetDraggedPieceStyles(document.querySelector(".dragged")!);

        const selection = (await getPromotionSelection(pieceColor)) as string;

        target.innerHTML = "";
        originalSquare.innerHTML = "";

        createPiece({
            id: pieceColor === "white" ? selection.toUpperCase() : selection,
            pos: (target as HTMLDivElement).dataset.pos!,
        });
    }

    document
        .querySelectorAll(".move-highlight")
        .forEach((element) => element.classList.remove("move-highlight"));
    originalSquare.classList.add("move-highlight");
    target.classList.add("move-highlight");

    handleAudio(isCapturing, isChecking);

    const { newMovesSinceCapture, newMovesSincePawnAdvance } =
        mutateDrawCounters(
            movesSinceCapture,
            movesSincePawnAdvance,
            isCapturing,
            pieceid,
        );

    movesSinceCapture = newMovesSinceCapture;
    movesSincePawnAdvance = newMovesSincePawnAdvance;

    if (isCastling) {
        const castlingSquares = CastlingMap.get(pos!)!;
        const posA = castlingSquares[castlingSquares.length - 1];
        const posB = castlingSquares[0];

        const { square: squareFirst, piece: pieceFirst } =
            getSquareAndPieceFromPos(posA) as SquareAndPiece;
        const { square: squareSecond } = getSquareAndPieceFromPos(
            posB,
        ) as SquareAndPiece;
        const rook = pieceFirst!;

        (rook.dataset.move_count as unknown as number) =
            +(rook.dataset.move_count ?? 0) + 1;

        squareFirst.innerHTML = "";
        squareSecond.appendChild(rook);
    }

    if (isEnPassant && enPassantablePawn) {
        enPassantablePawn.remove();
    }

    FENPositions.push(getFEN());

    const { isGameOver, FENPositions: positions } = await checkIfGameOver(
        moveIdx,
        pieceColor,
        isChecking,
        FENPositions,
        movesSincePawnAdvance,
        movesSinceCapture,
    );

    if (isGameOver) FENPositions = positions;

    resetDraggedPieceStyles(draggedPiece);

    draggedPiece = null;

    return { moveIdx, movesSinceCapture, movesSincePawnAdvance, FENPositions };
}

export function handlePieceMovement() {
    const botColor: PieceColor = "black";

    let FENPositions: string[] = [INITIAL_POSITION];

    let draggedPiece: HTMLImageElement | null;
    let originalSquare: HTMLDivElement;
    let highlightedSquares: HTMLDivElement[] = [];

    let offsetX = 0;
    let offsetY = 0;
    let moveIdx = 0;

    let movesSincePawnAdvance = 0;
    let movesSinceCapture = 0;

    const resetButton = document.getElementById(
        "reset-button",
    ) as HTMLButtonElement;

    resetButton!.addEventListener("click", () => {
        moveIdx = 0;
        drawBoardfromFEN(INITIAL_POSITION);
        FENPositions = [INITIAL_POSITION];
    });

    document.addEventListener("mousedown", async (e) => {
        if ((e.target as HTMLElement).classList.contains("piece")) {
            draggedPiece = e.target as HTMLImageElement;
            originalSquare = draggedPiece.parentElement as HTMLDivElement;

            const rect = draggedPiece.getBoundingClientRect();

            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            draggedPiece.classList.add("dragged");
            document.body.appendChild(draggedPiece);
            moveAt(draggedPiece, offsetX, offsetY, e.pageX, e.pageY);

            const pieceColor = draggedPiece.dataset.color as PieceColor;
            highlightedSquares = await highlightMoves(
                moveIdx,
                pieceColor,
                draggedPiece,
                originalSquare,
            );
        }

        document.addEventListener("mousemove", onMouseMove);

        function onMouseMove(e: MouseEvent) {
            moveAt(draggedPiece, offsetX, offsetY, e.pageX, e.pageY);
        }

        document.addEventListener("mouseup", async function onMouseUp(e) {
            let target = document.elementFromPoint(e.clientX, e.clientY)!;
            target = (
                target.classList.contains("piece")
                    ? target.parentElement
                    : target
            )!;

            const move = await makeMove(
                draggedPiece,
                moveIdx,
                target as HTMLDivElement,
                highlightedSquares,
                originalSquare,
                movesSinceCapture,
                movesSincePawnAdvance,
                FENPositions,
            );

            if (move) {
                moveIdx = move.moveIdx;
                movesSinceCapture = move.movesSinceCapture;
                movesSincePawnAdvance = move.movesSincePawnAdvance;
                FENPositions = move.FENPositions;

                // setTimeout because js is single threaded and makes the piece not drop until the bot can play
                setTimeout(async () => {
                    const botMoveData = await makeBotMove(
                        botColor,
                        moveIdx,
                        highlightedSquares,
                        movesSinceCapture,
                        movesSincePawnAdvance,
                        FENPositions,
                    );

                    if (botMoveData) {
                        moveIdx = botMoveData.moveIdx;
                        movesSinceCapture = botMoveData.movesSinceCapture;
                        movesSincePawnAdvance =
                            botMoveData.movesSincePawnAdvance;
                        FENPositions = botMoveData.FENPositions;
                    }
                }, 0);
            }

            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        });
    });
}
