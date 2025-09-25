import { GameState, PieceData } from "@interfaces";

export function simulate(
    state: GameState,
    piece: PieceData,
    destinationPos: string,
    isCapturing: boolean,
    isEnPassant: boolean,
) {
    const originalPos = piece.pos;
    let capturedPiece: PieceData | undefined;

    function play() {
        piece.pos = destinationPos;

        if (isCapturing && !isEnPassant) {
            capturedPiece = state.Board.find((p) => p.pos === destinationPos)!;

            state.Board.splice(state.Board.indexOf(capturedPiece), 1);
        }

        piece.moveCount += 1;
    }

    function unplay() {
        piece.pos = originalPos;

        if (isCapturing && !isEnPassant && capturedPiece) {
            state.Board.push(capturedPiece);
        }

        piece.moveCount -= 1;
    }

    return { play, unplay };
}
