import { GameState, PieceData } from "@interfaces";
import { updateBoard } from "./updateBoard";
import { initGameState } from "@functions";
import { CastlingMap } from "@maps";
import { Pieces } from "@enums";

export function simulate(
    state: GameState,
    piece: PieceData,
    destinationPos: string,
    isCastling: boolean,
    isPromoting: boolean,
    isCapturing: boolean,
    isEnPassant: boolean,
    enPassantablePawn?: PieceData | undefined,
) {
    const simulatedState = initGameState();
    const simulatedBoard = structuredClone(state.Board);

    simulatedState.Board = simulatedBoard;

    const simulatedPiece = simulatedState.Board.find(
        (p) => p.pos === piece.pos,
    )!;

    function play() {
        simulatedPiece.moveCount += 1;

        let keepMoving = true;

        if (isPromoting) {
            updateBoard(
                {
                    type: "PROMOTE",
                    data: {
                        piece: simulatedPiece,
                        destinationPos,
                        promoteTo: Pieces.Queen,
                        isCapturing,
                        capturedPiece: simulatedState.Board.find(
                            (piece) => piece.pos === destinationPos,
                        ),
                    },
                },
                simulatedState,
            );
            keepMoving = false;
        }

        if (keepMoving && isCastling && !isCapturing) {
            const castlingSquares = CastlingMap.get(destinationPos!)!;
            const posA = castlingSquares[castlingSquares.length - 1];
            const posB = castlingSquares[0];

            updateBoard(
                {
                    type: "CASTLE",
                    data: {
                        king: {
                            piece: simulatedPiece,
                            destinationPos: destinationPos,
                        },
                        rook: {
                            piece: simulatedState.Board.find(
                                (piece) => piece.pos === posA,
                            )!,
                            destinationPos: posB,
                        },
                    },
                },
                simulatedState,
            );

            keepMoving = false;
        }

        if (keepMoving && !isCapturing) {
            updateBoard(
                {
                    type: "MOVE",
                    data: {
                        piece: simulatedPiece,
                        destinationPos: destinationPos,
                    },
                },
                simulatedState,
            );
        } else {
            let simulatedEnPassantablePawnPos;

            if (enPassantablePawn) {
                simulatedEnPassantablePawnPos = enPassantablePawn.pos;
            }

            updateBoard(
                {
                    type: "CAPTURE",
                    data: {
                        piece: simulatedPiece,
                        destinationPos: destinationPos,
                        capturedPiece: simulatedState.Board.find(
                            (p) =>
                                p.pos ===
                                (!isEnPassant
                                    ? destinationPos
                                    : simulatedEnPassantablePawnPos!),
                        )!,
                        isEnPassant,
                    },
                },
                simulatedState,
            );
        }

        const king = simulatedState.Board.find(
            (p) => p.id === "k" && p.color === piece.color,
        );

        const enemyKing = simulatedState.Board.find(
            (p) => p.id === "k" && p.color !== piece.color,
        );

        if (!king || !enemyKing) return console.error("no king/enemy king");

        simulatedState.kingPos = king!.pos;
        simulatedState.enemyKingPos = enemyKing!.pos;

        return simulatedState;
    }

    return { play };
}
