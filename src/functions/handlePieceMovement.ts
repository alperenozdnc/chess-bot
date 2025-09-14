import { CAPTURE_SOUND, CHECK_SOUND, INITIAL_POSITION, MATE_SOUND, MOVE_SOUND } from "@constants";
import { Piece, PieceColor } from "@types";
import { getSquareAndPieceFromPos, resetDraggedPieceStyles } from "@utils";
import { checkForCheckmate, checkLegality, drawBoardfromFEN, listLegalMoves } from "@functions";
import { CastlingMap } from "@maps";
import { SquareAndPiece } from "@interfaces";

function undoMove(originalSquare: HTMLDivElement, piece: HTMLImageElement) {
    originalSquare.appendChild(piece);
}

function checkTurn(moveIdx: number, color: PieceColor) {
    if (color === "white") {
        if (moveIdx % 2 === 0) return true;
    } else {
        if (moveIdx % 2 !== 0) return true;
    }

    return false;
}

export function handlePieceMovement() {
    let draggedPiece: HTMLImageElement | null;
    let originalSquare: HTMLDivElement;
    let highlightedSquares: HTMLDivElement[] = [];

    let offsetX = 0;
    let offsetY = 0;
    let moveIdx = 0;

    const resetButton = document.getElementById(
        "reset-button",
    ) as HTMLButtonElement;

    resetButton!.addEventListener("click", () => {
        moveIdx = 0;
        drawBoardfromFEN(INITIAL_POSITION);
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
            moveAt(e.pageX, e.pageY);

            const pieceColor = draggedPiece.dataset.color as PieceColor;
            let pieceCanMove = checkTurn(moveIdx, pieceColor);

            if (pieceCanMove) {
                const legalMoves = await listLegalMoves({
                    piece: draggedPiece.dataset.pieceid! as Piece,
                    startSquare: originalSquare,
                    color: draggedPiece.dataset.color! as unknown as PieceColor,
                    pieceElement: draggedPiece,
                    pieceMoveCount: +draggedPiece.dataset
                        .move_count! as unknown as number,
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
        }

        function moveAt(pageX: number, pageY: number) {
            if (draggedPiece) {
                draggedPiece.style.left = `${pageX - offsetX}px`;
                draggedPiece.style.top = `${pageY - offsetY}px`;
            }
        }

        document.addEventListener("mousemove", onMouseMove);

        function onMouseMove(e: MouseEvent) {
            moveAt(e.pageX, e.pageY);
        }

        document.addEventListener("mouseup", async function onMouseUp(e) {
            if (draggedPiece) {
                const pieceColor = draggedPiece.dataset.color as PieceColor;

                let pieceCanMove = checkTurn(moveIdx, pieceColor);
                let target = document.elementFromPoint(e.clientX, e.clientY)!;
                target = (
                    target.classList.contains("piece")
                        ? target.parentElement
                        : target
                )!;

                if (highlightedSquares.length > 0) {
                    for (const square of highlightedSquares) {
                        square.classList.remove(
                            "highlight",
                            "capturable-highlight",
                        );
                    }

                    highlightedSquares = [];
                }

                if (!target) return;
                if (!target.classList.contains("square")) {
                    originalSquare.appendChild(draggedPiece);
                    resetDraggedPieceStyles(draggedPiece);
                    return;
                }

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

                if (
                    target.classList.contains("square") &&
                    pieceCanMove &&
                    target !== originalSquare &&
                    isMoveLegal
                ) {
                    let pos = (target as HTMLDivElement).dataset.pos;

                    let notation = pos;
                    if (pieceid !== "P") notation = `${pieceid}${notation}`;

                    (draggedPiece.dataset.move_count as unknown as number) =
                        +(draggedPiece.dataset.move_count ?? 0) + 1;

                    ++moveIdx;

                    if (!isPromoting) {
                        target.innerHTML = "";
                        target.appendChild(draggedPiece);
                    }


                    document.querySelectorAll(".move-highlight").forEach(element => element.classList.remove("move-highlight"));
                    originalSquare.classList.add("move-highlight");
                    target.classList.add("move-highlight");

                    if (isCapturing) {
                        if (!isChecking) {
                            CAPTURE_SOUND.play();
                        } else {
                            CHECK_SOUND.play();
                        }
                    } else if (isChecking) {
                        CHECK_SOUND.play();
                    } else {
                        MOVE_SOUND.play();
                    }

                    if (isCastling) {
                        const castlingSquares = CastlingMap.get(pos!)!;
                        const posA =
                            castlingSquares[castlingSquares.length - 1];
                        const posB = castlingSquares[0];

                        const { square: squareFirst, piece: pieceFirst } =
                            getSquareAndPieceFromPos(posA) as SquareAndPiece;
                        const { square: squareSecond } =
                            getSquareAndPieceFromPos(posB) as SquareAndPiece;
                        const rook = pieceFirst!;

                        (rook.dataset.move_count as unknown as number) =
                            +(rook.dataset.move_count ?? 0) + 1;

                        squareFirst.innerHTML = "";
                        squareSecond.appendChild(rook);
                    }

                    if (isEnPassant && enPassantablePawn) {
                        enPassantablePawn.remove();
                    }

                    const noLegalMovesLeft = await checkForCheckmate(moveIdx + 1, pieceColor === "white" ? "black" : "white");

                    if (isChecking && noLegalMovesLeft) {
                        MATE_SOUND.play();
                        const gameEndScreen = document.getElementById("game-end-screen")!;
                        const okButton = document.getElementById("ok-button")!;

                        gameEndScreen.classList.add("game-end-screen-visible");
                        gameEndScreen.querySelector("h2")!.innerText = `${pieceColor} wins by checkmate`;

                        okButton.addEventListener("click", () => {
                            gameEndScreen.classList.remove("game-end-screen-visible");
                            (document.getElementById("reset-button") as HTMLButtonElement)!.click();
                        });
                    } else if (noLegalMovesLeft) {
                        MATE_SOUND.play();
                        const gameEndScreen = document.getElementById("game-end-screen")!;
                        const okButton = document.getElementById("ok-button")!;

                        gameEndScreen.classList.add("game-end-screen-visible");
                        gameEndScreen.querySelector("h2")!.innerText = `draw by stalemate`;

                        okButton.addEventListener("click", () => {
                            gameEndScreen.classList.remove("game-end-screen-visible");
                            (document.getElementById("reset-button") as HTMLButtonElement)!.click();
                        });
                    }
                } else {
                    undoMove(originalSquare, draggedPiece);
                }

                resetDraggedPieceStyles(draggedPiece);
            }

            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);

            draggedPiece = null;
        });
    });

}
