import { getPromotionSelection, isSquareAttacked } from "@functions";
import { FILES } from "@constants";
import { Pieces } from "@enums";
import { MoveData, MoveLegality, SquareAndPiece } from "@interfaces";
import {
    createPiece,
    getSquareAndPieceFromPos,
    resetDraggedPieceStyles,
} from "@utils";
import { PieceColor } from "@types";
import { CastlingMap } from "@maps";

export function checkForObstacles(
    directions: string[][],
    pos: string,
    color: PieceColor,
    castleChecking = false,
): boolean | string[] {
    const allAvailableMoves: string[] = [];

    for (const direction of directions) {
        for (const pos of direction) {
            const { square, piece } = getSquareAndPieceFromPos(
                pos
            ) as SquareAndPiece;

            if (square.hasChildNodes()) {
                if (piece!.dataset.color !== color) {
                    allAvailableMoves.push(pos);
                    break;
                } else {
                    break;
                }
            } else {
                allAvailableMoves.push(pos);
            }
        }
    }

    if (castleChecking) return allAvailableMoves;

    if (!allAvailableMoves.includes(pos)) {
        return false;
    }

    return true;
}

export async function checkLegality(data: MoveData): Promise<MoveLegality> {
    const {
        ID,
        color,
        pieceMoveCount,
        pieceElement,
        startSquare,
        destinationSquare,
        moveIdx,
        isJustChecking,
    } = data;

    let isMoveLegal = true;

    const posA = startSquare.dataset.pos!;
    const posB = destinationSquare.dataset.pos!;

    const fileA = FILES.indexOf(posA[0]);
    const fileB = FILES.indexOf(posB[0]);

    const rankA = +posA[1];
    const rankB = +posB[1];

    let isCapturing = false;
    let isPromoting = false;
    let isCastling = false;
    let isEnPassant = false;
    const enPassantablePawn = document.querySelector(
        "[data-en_passant_move_idx]",
    ) as HTMLImageElement;

    if (destinationSquare.innerHTML !== "") {
        const capturedPiece = destinationSquare.children[0] as HTMLImageElement;

        if (color === capturedPiece.dataset.color) {
            isMoveLegal = false;
        }

        if (capturedPiece.dataset.pieceid === Pieces.King) {
            isMoveLegal = false;
        }

        isCapturing = true;
    }

    const df = Math.abs(fileA - fileB);
    const dr = Math.abs(rankA - rankB);

    switch (ID) {
        case Pieces.Pawn:
            if (!isCapturing && fileA !== fileB) {
                isMoveLegal = false;
            }
            if (isCapturing && fileA === fileB) {
                isMoveLegal = false;
            }
            if (isCapturing && rankA === rankB) {
                isMoveLegal = false;
            }
            if (isCapturing && dr > 1) {
                isMoveLegal = false;
            }
            if (isCapturing && Math.abs(fileA - fileB) > 1) {
                isMoveLegal = false;
            }
            if (color === "white" && rankA > rankB) {
                isMoveLegal = false;
            }
            if (color === "black" && rankA < rankB) {
                isMoveLegal = false;
            }
            if (dr > 2) {
                isMoveLegal = false;
            }
            if (pieceMoveCount > 0 && dr > 1) {
                isMoveLegal = false;
            }
            if (color === "white" && rankB === 8) {
                isPromoting = true;
            } else if (color === "black" && rankB === 1) {
                isPromoting = true;
            }

            if (dr === 2) {
                const offset = color === "white" ? -1 : 1;

                const data = getSquareAndPieceFromPos(`${FILES[fileA]}${rankB + offset}`) as SquareAndPiece;

                if (data) {
                    if (data.square) {
                        if (data.piece) isMoveLegal = false;
                    }
                }
            }

            // wtf is this doing in check legality
            // this isnt the functions job

            if (isMoveLegal && isPromoting && !isJustChecking) {
                // because the piece somehow keeps dragging when the modal pops up
                resetDraggedPieceStyles(document.querySelector(".dragged")!);

                const selection = (await getPromotionSelection(
                    color,
                )) as string;

                destinationSquare.innerHTML = "";
                startSquare.innerHTML = "";

                createPiece({
                    id: color === "white" ? selection.toUpperCase() : selection,
                    pos: destinationSquare.dataset.pos!,
                });
            }

            if (enPassantablePawn && !isJustChecking) {
                const enPassantData =
                    enPassantablePawn.dataset.en_passant_move_idx;

                if (enPassantData) {
                    if (moveIdx > +enPassantData) {
                        enPassantablePawn.dataset.en_passant_move_idx =
                            undefined;
                    }
                }
            }

            if (enPassantablePawn) {
                const enPassantData =
                    enPassantablePawn.dataset.en_passant_move_idx;

                if (enPassantData) {
                    if (moveIdx === +enPassantData) {
                        const enPassantablePawnSquare =
                            enPassantablePawn.parentNode as HTMLDivElement;

                        if (enPassantablePawnSquare) {
                            const posData = enPassantablePawnSquare.dataset.pos;

                            if (posData) {
                                const f = FILES.indexOf(posData[0]);
                                const r =
                                    +posData[1] + (color === "white" ? 1 : -1);

                                if (Math.abs(rankA - r) === 1) {
                                    if (f === fileB && rankB === r) {
                                        isMoveLegal = true;
                                        isCapturing = true;
                                        isEnPassant = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (dr === 2 && !isJustChecking) {
                const piece = document.querySelector(
                    ".dragged",
                )! as HTMLImageElement;

                piece.dataset.en_passant_move_idx = (moveIdx + 1).toString();
            }

            break;
        case Pieces.Knight:
            if (df < 1) {
                isMoveLegal = false;
            }
            if (df > 2) {
                isMoveLegal = false;
            }
            if (dr > 2) {
                isMoveLegal = false;
            }
            if (dr < 1) {
                isMoveLegal = false;
            }
            if (df === 1 && dr !== 2) {
                isMoveLegal = false;
            }
            if (dr === 2 && df !== 1) {
                isMoveLegal = false;
            }

            break;
        case Pieces.Bishop:
            if (df === 0) {
                isMoveLegal = false;
            }

            if (dr === 0) {
                isMoveLegal = false;
            }

            if (df !== dr) {
                isMoveLegal = false;
            }

            let topLeftDir: string[] = [];
            let bottomLeftDir: string[] = [];
            let topRightDir: string[] = [];
            let bottomRightDir: string[] = [];

            let r = rankA + 1;
            let r2 = rankA - 1;

            let r3 = rankA + 1;
            let r4 = rankA - 1;

            for (let f = fileA - 1; f >= 0; f--) {
                const fileString = FILES[f];

                // file decrease, rank increase (move top left diagonally)
                if (r <= 8) {
                    topLeftDir.push(`${fileString}${r}`);
                }

                // file decrease, rank decrease (move bottom left diagonally)
                if (r2 >= 1) {
                    bottomLeftDir.push(`${fileString}${r2}`);
                }

                r++;
                r2--;
            }

            for (let f = fileA + 1; f < 8; f++) {
                const fileString = FILES[f];

                // file increase, rank increase (move top right diagonally)
                if (r3 <= 8) {
                    topRightDir.push(`${fileString}${r3}`);
                }

                // file increase, rank decrease (move bottom right diagonally)
                if (r4 >= 1) {
                    bottomRightDir.push(`${fileString}${r4}`);
                }

                r3++;
                r4--;
            }

            isMoveLegal = checkForObstacles(
                [topLeftDir, topRightDir, bottomLeftDir, bottomRightDir],
                posB,
                color,
            ) as boolean;

            break;
        case Pieces.Rook:
            if (df >= 1 && dr !== 0) {
                isMoveLegal = false;
            }

            let up = [];
            let left = [];
            let right = [];
            let down = [];

            for (let f = 0; f <= 7; f++) {
                const fileString = FILES[f];

                if (f === fileA) {
                    continue;
                }

                if (f < fileA) {
                    left.push(`${fileString}${rankA}`);
                } else {
                    right.push(`${fileString}${rankA}`);
                }
            }

            for (let r = 1; r <= 8; r++) {
                const fileString = FILES[fileA];

                if (r === rankA) {
                    continue;
                }

                if (r < rankA) {
                    down.push(`${fileString}${r}`);
                } else {
                    up.push(`${fileString}${r}`);
                }
            }

            left = left.reverse();
            down = down.reverse();

            isMoveLegal = checkForObstacles(
                [up, down, left, right],
                posB,
                color,
            ) as boolean;

            break;
        case Pieces.Queen:
            const { isMoveLegal: actsAsABishop } = await checkLegality({
                ID: Pieces.Bishop,
                color,
                pieceMoveCount,
                startSquare,
                destinationSquare,
                moveIdx: moveIdx,
                isJustChecking,
                pieceElement
            });

            const { isMoveLegal: actsAsARook } = await checkLegality({
                ID: Pieces.Rook,
                color,
                pieceMoveCount,
                startSquare,
                destinationSquare,
                isJustChecking,
                moveIdx,
                pieceElement
            });

            if (!actsAsABishop && !actsAsARook) isMoveLegal = false;

            break;
        case Pieces.King:
            // the squares that have to be empty corresponding to the castle activation square
            function checkCastlingRights(
                pos: string,
                castlingPieces: string[],
            ): boolean {
                const emptySquares = checkForObstacles(
                    [castlingPieces],
                    pos,
                    color,
                    true,
                ) as string[];
                const rookPos = castlingPieces[castlingPieces.length - 1];

                // .length - 1 is accounting for the rook here
                if (emptySquares.length === castlingPieces.length - 1) {
                    const rookSquare = document.querySelector(
                        `[data-pos=${rookPos}]`,
                    )!;
                    const piece = rookSquare.querySelector("img");

                    if (piece && piece.dataset.pieceid === Pieces.Rook) {
                        if (piece.dataset.move_count === "0") {
                            return true;
                        }
                    }
                }

                return false;
            }

            if (pieceMoveCount === 0) {
                for (let sqr of CastlingMap.keys()) {
                    let dir = CastlingMap.get(sqr);

                    if (sqr === posB) {
                        isCastling = checkCastlingRights(sqr, dir as string[]);

                        break;
                    }
                }
            }

            if (isCastling) {
                isMoveLegal = true;

                if (df == 2 && dr > 2) {
                    isMoveLegal = false;
                }
            } else {
                if (df > 1 || dr > 1) {
                    isMoveLegal = false;
                }
            }

            break;
    }

    const king = Array.from(document.querySelectorAll(`[data-pieceid=k]`)).filter(king => (king as HTMLImageElement).dataset.color === color)[0] as HTMLImageElement;
    const kingPos = king.parentElement!.dataset.pos!;
    let isCheck = isSquareAttacked({ pos: kingPos, attackerColor: color === "white" ? "black" : "white" });
    const destinationElement = destinationSquare.firstChild!;

    pieceElement.remove();
    if (isCapturing) destinationSquare.innerHTML = "";
    destinationSquare.appendChild(pieceElement);

    isCheck = isSquareAttacked({ pos: ID === Pieces.King ? posB : kingPos, attackerColor: color === "white" ? "black" : "white" });

    pieceElement.remove();
    if (isCapturing) destinationSquare.appendChild(destinationElement);
    startSquare.appendChild(pieceElement);

    if (isCheck) isMoveLegal = false;

    return {
        isMoveLegal,
        isCapturing,
        isPromoting,
        isCastling,
        isEnPassant,
        enPassantablePawn,
    };
}
