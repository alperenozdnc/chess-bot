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
import { Pieces } from "@enums";

export interface GameState {
    botColor: PieceColor;
    FENPositions: string[];
    draggedPiece: HTMLImageElement | null;
    originalSquare: HTMLDivElement | undefined;
    highlightedSquares: HTMLDivElement[];
    offsetX: number;
    offsetY: number;
    moveIdx: number;
    movesSincePawnAdvance: number;
    movesSinceCapture: number;
    isGameOver: boolean;
}

function initGameState(): GameState {
    return {
        botColor: "black",
        FENPositions: [INITIAL_POSITION],
        draggedPiece: null,
        originalSquare: undefined,
        highlightedSquares: [],
        offsetX: 0,
        offsetY: 0,
        moveIdx: 0,
        movesSinceCapture: 0,
        movesSincePawnAdvance: 0,
        isGameOver: false,
    };
}

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
    let highlightedSquares = [];

    if (pieceCanMove) {
        const legalMoves = await listLegalMoves({
            piece: state.draggedPiece.dataset.pieceid! as Piece,
            startSquare: state.originalSquare!,
            color: state.draggedPiece.dataset.color! as unknown as PieceColor,
            pieceElement: state.draggedPiece,
            pieceMoveCount: +state.draggedPiece.dataset
                .move_count! as unknown as number,
            moveIdx: state.moveIdx,
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

    clearHighlights(state.highlightedSquares);

    if (isTargetWrong(target, state.originalSquare!, state.draggedPiece))
        return;

    if (!pieceCanMove) {
        undoMove(state.originalSquare!, state.draggedPiece);
        resetDraggedPieceStyles(state.draggedPiece);
        return;
    }

    let pieceid = state.draggedPiece.dataset.pieceid!.toUpperCase();

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
        pieceMoveCount: Number(state.draggedPiece.dataset.move_count),
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

    (state.draggedPiece.dataset.move_count as unknown as number) =
        +(state.draggedPiece.dataset.move_count ?? 0) + 1;

    ++state.moveIdx;

    if (!isPromoting) {
        target.innerHTML = "";
        target.appendChild(state.draggedPiece);
    } else {
        resetDraggedPieceStyles(state.draggedPiece);

        // at least for now
        const selection = !isComputer
            ? ((await getPromotionSelection(pieceColor)) as string)
            : Pieces.Queen;

        target.innerHTML = "";
        state.originalSquare!.innerHTML = "";

        createPiece({
            id: pieceColor === "white" ? selection.toUpperCase() : selection,
            pos: (target as HTMLDivElement).dataset.pos!,
        });
    }

    document
        .querySelectorAll(".move-highlight")
        .forEach((element) => element.classList.remove("move-highlight"));
    state.originalSquare!.classList.add("move-highlight");
    target.classList.add("move-highlight");

    handleAudio(isCapturing, isChecking);
    mutateDrawCounters(state, isCapturing, pieceid);

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

    state.FENPositions.push(getFEN());

    await checkIfGameOver(state, isChecking, pieceColor);

    resetDraggedPieceStyles(state.draggedPiece);
    state.draggedPiece = null;

    return true;
}

export function handlePieceMovement() {
    const state = initGameState();

    const resetButton = document.getElementById(
        "reset-button",
    ) as HTMLButtonElement;

    resetButton!.addEventListener("click", () => {
        state.moveIdx = 0;
        drawBoardfromFEN(INITIAL_POSITION);
        state.FENPositions = [INITIAL_POSITION];
    });

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

            state.highlightedSquares = (await highlightMoves(state)) ?? [];
        }

        document.addEventListener("mousemove", onMouseMove);

        function onMouseMove(e: MouseEvent) {
            moveAt(state, e.pageX, e.pageY);
        }

        async function onMouseUp(e: MouseEvent) {
            let target = document.elementFromPoint(e.clientX, e.clientY)!;
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
