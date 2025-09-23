import { drawBoard } from "@functions";
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
    enPassantAblePawn?: PieceData;
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

    const overlappingElement = state.Board.find(
        (piece) => piece.pos === (data as ActionData).destinationPos,
    );

    function checkOverlapping(data: Capture | Promote) {
        if (overlappingElement) return true;

        console.error(
            `cant perform CAPTURE on piece ${data.piece.id} to ${data.destinationPos} which is not occupied.`,
        );

        return false;
    }

    switch (type) {
        case "MOVE": {
            if (overlappingElement) {
                console.error(
                    `cant perform MOVE on piece ${data.piece.id} to ${data.destinationPos} which is already occupied.`,
                );
                return;
            }

            data.piece.pos = data.destinationPos;
            data.piece.moveCount += 1;

            break;
        }
        case "CAPTURE": {
            if (!checkOverlapping(data)) return;

            state.Board.splice(state.Board.indexOf(data.capturedPiece), 1);
            if (data.isEnPassant && data.enPassantAblePawn) {
                state.Board.splice(
                    state.Board.indexOf(data.enPassantAblePawn),
                    1,
                );
            }

            data.piece.pos = data.destinationPos;
            data.piece.moveCount += 1;

            break;
        }
        case "CASTLE": {
            data.king.piece.pos = data.king.destinationPos;
            data.king.piece.moveCount += 1;
            data.rook.piece.pos = data.rook.destinationPos;
            data.rook.piece.moveCount += 1;

            break;
        }
        case "PROMOTE": {
            if (data.isCapturing && !checkOverlapping(data)) return;
            if (data.isCapturing && data.capturedPiece) {
                state.Board.splice(state.Board.indexOf(data.capturedPiece), 1);
            }

            data.piece.pos = data.destinationPos;
            data.piece.moveCount = 0;
            data.piece.id = data.promoteTo;

            break;
        }
    }

    drawBoard(state);
}
