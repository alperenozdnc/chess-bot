import { GameState, PieceData } from "@interfaces";
import { updateBoard } from "./updateBoard";
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
    capturedPiece?: PieceData,
) {
    const simulatedBoard = state.Board.map((p) => ({ ...p }));
    const simulatedState: GameState = {
        ...state,
        Board: simulatedBoard,
        kingPos: state.kingPos,
    };

    simulatedState.Board = simulatedBoard;

    const simulatedPiece = simulatedState.Board.find(
        (p) => p.pos === piece.pos,
    )!;

    function play() {
        simulatedPiece.moveCount++;

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
                        capturedPiece,
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
            let simulatedEnPassantablePawnPos: string;

            if (enPassantablePawn) {
                simulatedEnPassantablePawnPos = enPassantablePawn.pos;
            }

            updateBoard(
                {
                    type: "CAPTURE",
                    data: {
                        piece: simulatedPiece,
                        destinationPos: destinationPos,
                        capturedPiece: !isEnPassant
                            ? capturedPiece!
                            : state.Board.find(
                                (p) =>
                                    p.pos === simulatedEnPassantablePawnPos,
                            )!,
                        isEnPassant,
                    },
                },
                simulatedState,
            );
        }

        // incrementally track king positions
        if (simulatedPiece.id === "k") {
            simulatedState.kingPos = simulatedPiece.pos;
        }

        return simulatedState;
    }

    return { play };
}
