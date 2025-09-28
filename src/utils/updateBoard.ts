import { GameState, PieceData } from "@interfaces";
import { Piece } from "@types";

interface ActionData {
    piece: PieceData;
    destinationPos: string;
}

interface Move extends ActionData { }

interface Capture extends ActionData {
    capturedPiece: PieceData;
    isEnPassant?: boolean;
}

interface Promote extends ActionData {
    promoteTo: Piece;
    isCapturing: boolean;
    capturedPiece?: PieceData;
}

interface Castle {
    king: ActionData;
    rook: ActionData;
}

type ActionTypeRequirements =
    | { type: "MOVE"; data: Move }
    | { type: "CAPTURE"; data: Capture }
    | { type: "PROMOTE"; data: Promote }
    | { type: "CASTLE"; data: Castle };

export function updateBoard(action: ActionTypeRequirements, state: GameState) {
    const { type, data } = action;

    const overlappingElement = state.Board.get(
        (data as ActionData).destinationPos,
    );

    switch (type) {
        case "MOVE": {
            if (overlappingElement) {
                console.error(
                    `cant perform MOVE on piece ${data.piece.id}
                    to ${data.destinationPos} which is already occupied.`,
                );
                return;
            }

            const pieceCopy = { ...data.piece, pos: data.destinationPos };

            state.Board.delete(data.piece.pos);
            state.Board.set(data.destinationPos, pieceCopy);

            break;
        }
        case "CAPTURE": {
            if (!overlappingElement && !data.isEnPassant) return;

            state.Board.delete(data.capturedPiece.pos);

            updateBoard(
                {
                    type: "MOVE",
                    data: {
                        piece: data.piece,
                        destinationPos: data.destinationPos,
                    },
                },
                state,
            );

            break;
        }
        case "CASTLE": {
            updateBoard(
                {
                    type: "MOVE",
                    data: {
                        piece: data.king.piece,
                        destinationPos: data.king.destinationPos,
                    },
                },
                state,
            );

            const rookCopy = {
                ...data.rook.piece,
                moveCount: data.rook.piece.moveCount + 1,
            };

            updateBoard(
                {
                    type: "MOVE",
                    data: {
                        piece: rookCopy,
                        destinationPos: data.rook.destinationPos,
                    },
                },
                state,
            );

            break;
        }
        case "PROMOTE": {
            if (data.isCapturing && !overlappingElement) return;

            const pieceCopy = {
                ...data.piece,
                id: data.promoteTo,
                moveCount: 0,
            };

            if (data.isCapturing && data.capturedPiece) {
                updateBoard(
                    {
                        type: "CAPTURE",
                        data: {
                            piece: pieceCopy,
                            destinationPos: data.destinationPos,
                            capturedPiece: data.capturedPiece,
                            isEnPassant: false,
                        },
                    },
                    state,
                );
            } else {
                updateBoard(
                    {
                        type: "MOVE",
                        data: {
                            piece: pieceCopy,
                            destinationPos: data.destinationPos,
                        },
                    },
                    state,
                );
            }

            break;
        }
    }
}
