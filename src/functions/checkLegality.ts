import { isSquareAttacked } from "@functions";
import { FILES } from "@constants";
import { Pieces } from "@enums";
import { GameState, MoveLegality, PieceData } from "@interfaces";
import { find, simulate } from "@utils";
import { PieceColor } from "@types";
import { CastlingMap } from "@maps";

export function checkForObstacles(
    state: GameState,
    directions: string[][],
    pos: string,
    color: PieceColor,
    castleChecking = false,
): boolean | string[] {
    const allAvailableMoves: string[] = [];

    for (const direction of directions) {
        for (const pos2 of direction) {
            const piece = state.Board.get(pos2);

            if (piece) {
                if (piece.color !== color) {
                    allAvailableMoves.push(pos2);
                    break;
                } else {
                    break;
                }
            } else {
                allAvailableMoves.push(pos2);
            }
        }
    }

    if (castleChecking) return allAvailableMoves;

    if (!allAvailableMoves.includes(pos)) {
        return false;
    }

    return true;
}

interface Data {
    piece: PieceData;
    destinationPos: string;
    isJustChecking: boolean;
}

export function checkLegality(state: GameState, data: Data): MoveLegality {
    const pieceObject = data.piece;

    let isMoveLegal = false;

    const posA = data.piece.pos;
    const posB = data.destinationPos;

    const fileA = FILES.indexOf(posA[0]);
    const fileB = FILES.indexOf(posB[0]);

    const rankA = +posA[1];
    const rankB = +posB[1];

    let isCapturing = false;
    let isPromoting = false;
    let isCastling = false;
    let isEnPassant = false;
    const enPassantablePawnKeyValue = find<string, PieceData>(
        (_, v) => v.enPassantMoveIdx !== undefined,
        state.Board,
    );

    const enPassantablePawn = enPassantablePawnKeyValue
        ? enPassantablePawnKeyValue.value
        : undefined;

    const capturedPiece = state.Board.get(data.destinationPos);

    if (capturedPiece) {
        if (data.piece.color === capturedPiece.color) {
            isMoveLegal = false;
        }

        if (capturedPiece.id === Pieces.King) {
            isMoveLegal = false;
        }

        isCapturing = true;
    }

    const df = Math.abs(fileA - fileB);
    const dr = Math.abs(rankA - rankB);

    switch (data.piece.id) {
        case Pieces.Pawn:
            const direction = data.piece.color === "white" ? 1 : -1;
            const nextSquarePos = `${FILES[fileA]}${rankB - direction}`;
            const nextSquareData = state.Board.get(nextSquarePos);
            let isDirectionRight = false;

            if (rankA < rankB && direction === 1) isDirectionRight = true;
            if (rankA > rankB && direction === -1) isDirectionRight = true;
            if (dr == 1 && df === 0 && isDirectionRight) isMoveLegal = true;
            if (
                dr == 2 &&
                df === 0 &&
                data.piece.moveCount === 0 &&
                isDirectionRight &&
                !nextSquareData
            )
                isMoveLegal = true;
            if (isCapturing)
                isMoveLegal = isSquareAttacked(state, {
                    pos: posB,
                    attackerColor: data.piece.color,
                    piece: Pieces.Pawn,
                    attackerPos: posA,
                });
            if (data.piece.color === "white" && rankB === 8) isPromoting = true;
            if (data.piece.color === "black" && rankB === 1) isPromoting = true;

            if (enPassantablePawn && !data.isJustChecking) {
                const enPassantData = enPassantablePawn.enPassantMoveIdx;

                if (enPassantData) {
                    if (state.moveIdx > +enPassantData) {
                        enPassantablePawn.enPassantMoveIdx = undefined;
                    }
                }
            }

            if (enPassantablePawn) {
                if (enPassantablePawn.enPassantMoveIdx) {
                    if (state.moveIdx === +enPassantablePawn.enPassantMoveIdx) {
                        const posData = enPassantablePawn.pos;

                        if (posData) {
                            const f = FILES.indexOf(posData[0]);
                            const r =
                                +posData[1] +
                                (data.piece.color === "white" ? 1 : -1);

                            if (Math.abs(rankA - r) === 1 && df === 1) {
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

            if (dr === 2 && !data.isJustChecking) {
                pieceObject.enPassantMoveIdx = state.moveIdx + 1;
            }

            break;
        case Pieces.Knight:
            isMoveLegal = isSquareAttacked(state, {
                pos: posB,
                attackerColor: data.piece.color,
                piece: Pieces.Knight,
                attackerPos: posA,
            });

            break;
        case Pieces.Bishop:
            isMoveLegal = isSquareAttacked(state, {
                pos: posB,
                attackerColor: data.piece.color,
                piece: Pieces.Bishop,
                attackerPos: posA,
            });

            break;
        case Pieces.Rook:
            isMoveLegal = isSquareAttacked(state, {
                pos: posB,
                attackerColor: data.piece.color,
                piece: Pieces.Rook,
                attackerPos: posA,
            });

            break;
        case Pieces.Queen:
            isMoveLegal = isSquareAttacked(state, {
                pos: posB,
                attackerColor: data.piece.color,
                piece: Pieces.Queen,
                attackerPos: posA,
            });

            break;
        case Pieces.King:
            // the squares that have to be empty corresponding to the castle activation square
            function checkCastlingRights(
                pos: string,
                castlingPieces: string[],
            ): boolean {
                const emptySquares = checkForObstacles(
                    state,
                    [castlingPieces],
                    pos,
                    data.piece.color,
                    true,
                ) as string[];
                const rookPos = castlingPieces[castlingPieces.length - 1];

                // .length - 1 is accounting for the rook here
                if (emptySquares.length === castlingPieces.length - 1) {
                    const piece = state.Board.get(rookPos);

                    if (piece && piece.id === Pieces.Rook) {
                        if (piece.moveCount === 0) {
                            return true;
                        }
                    }
                }

                return false;
            }

            if (data.piece.moveCount === 0) {
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
                isMoveLegal = isSquareAttacked(state, {
                    pos: posB,
                    attackerColor: data.piece.color,
                    piece: Pieces.King,
                    attackerPos: posA,
                });
            }

            break;
    }

    let isChecking = false;

    if (isMoveLegal) {
        const king = find<string, PieceData>(
            (_, v) => v.id === "k" && v.color === data.piece.color,
            state.Board,
        )!;

        const enemyKing = find<string, PieceData>(
            (_, v) => v.id === "k" && v.color !== data.piece.color,
            state.Board,
        )!;

        state.kingPos = king.value.pos;
        state.enemyKingPos = enemyKing.value.pos;

        let isCheck = isSquareAttacked(state, {
            pos: state.kingPos,
            attackerColor: data.piece.color === "white" ? "black" : "white",
        });

        const move = simulate(
            state,
            pieceObject,
            data.destinationPos,
            isCastling,
            isPromoting,
            isCapturing,
            isEnPassant,
            enPassantablePawn,
            state.Board.get(data.destinationPos),
        );

        const simulatedState = move.play();

        if (simulatedState) {
            isChecking = isSquareAttacked(simulatedState, {
                pos: simulatedState.enemyKingPos!,
                attackerColor: data.piece.color,
            });

            isCheck = isSquareAttacked(simulatedState, {
                pos:
                    data.piece.id === Pieces.King
                        ? posB
                        : simulatedState.kingPos!,
                attackerColor: data.piece.color === "white" ? "black" : "white",
            });

            if (isCheck) isMoveLegal = false;
        }
    }

    return {
        isMoveLegal,
        isCapturing,
        isPromoting,
        isCastling,
        isEnPassant,
        isChecking,
        enPassantablePawnPos: enPassantablePawn?.pos ?? undefined,
    };
}
