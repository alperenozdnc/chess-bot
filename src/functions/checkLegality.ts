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

    let isMoveLegal = false;

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
            const direction = color === "white" ? 1 : -1;
            const nextSquare = `${FILES[fileA]}${rankB - direction}`;
            const nextSquareData = getSquareAndPieceFromPos(nextSquare) as SquareAndPiece;
            let isDirectionRight = false;

            if (rankA < rankB && direction === 1) isDirectionRight = true;
            if (rankA > rankB && direction === -1) isDirectionRight = true;
            if (dr == 1 && df === 0 && isDirectionRight) isMoveLegal = true;
            if (dr == 2 && df === 0 && pieceMoveCount === 0 && isDirectionRight && nextSquareData && nextSquareData.square.children.length === 0) isMoveLegal = true;
            if (isCapturing) isMoveLegal = isSquareAttacked({ pos: posB, attackerColor: color, piece: Pieces.Pawn, attackerPos: posA });
            if (color === "white" && rankB === 8) isPromoting = true;
            if (color === "black" && rankB === 1) isPromoting = true;

            if (enPassantablePawn && !isJustChecking) {
                const enPassantData =
                    enPassantablePawn.dataset.en_passant_move_idx;

                if (enPassantData) {
                    if (moveIdx > +enPassantData) {
                        delete enPassantablePawn.dataset.en_passant_move_idx;
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
            isMoveLegal = isSquareAttacked({ pos: posB, attackerColor: color, piece: Pieces.Knight, attackerPos: posA });

            break;
        case Pieces.Bishop:
            isMoveLegal = isSquareAttacked({ pos: posB, attackerColor: color, piece: Pieces.Bishop, attackerPos: posA });

            break;
        case Pieces.Rook:
            isMoveLegal = isSquareAttacked({ pos: posB, attackerColor: color, piece: Pieces.Rook, attackerPos: posA });

            break;
        case Pieces.Queen:
            isMoveLegal = isSquareAttacked({ pos: posB, attackerColor: color, piece: Pieces.Queen, attackerPos: posA });

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
                isMoveLegal = isSquareAttacked({ pos: posB, attackerColor: color, piece: Pieces.King, attackerPos: posA });
            }

            break;
    }


    const kings = Array.from(document.querySelectorAll(`[data-pieceid=k]`));
    const king = kings.filter(king => (king as HTMLImageElement).dataset.color === color)[0] as HTMLImageElement;
    const enemyKingPos = (kings.filter(king => (king as HTMLImageElement).dataset.color !== color)[0] as HTMLImageElement).parentElement!.dataset.pos;

    const kingPos = king.parentElement!.dataset.pos!;
    let isCheck = isSquareAttacked({ pos: kingPos, attackerColor: color === "white" ? "black" : "white" });
    const destinationElement = destinationSquare.firstChild!;

    pieceElement.remove();
    if (isCapturing && !isEnPassant) destinationSquare.innerHTML = "";
    destinationSquare.appendChild(pieceElement);

    const isChecking = isSquareAttacked({ pos: enemyKingPos as string, attackerColor: color });
    isCheck = isSquareAttacked({ pos: ID === Pieces.King ? posB : kingPos, attackerColor: color === "white" ? "black" : "white" });

    pieceElement.remove();
    if (isCapturing && !isEnPassant) destinationSquare.appendChild(destinationElement);
    startSquare.appendChild(pieceElement);

    if (isCheck) isMoveLegal = false;

    return {
        isMoveLegal,
        isCapturing,
        isPromoting,
        isCastling,
        isEnPassant,
        isChecking,
        enPassantablePawn,
    };
}

