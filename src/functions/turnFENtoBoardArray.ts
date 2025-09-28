import { FILES } from "@constants";
import { GameState } from "@interfaces";
import { Piece } from "@types";

export function turnFENToBoardArray(FEN: string, state: GameState) {
    let FENIdx = 0;
    state.Board = new Map();

    for (let row = 0; row < 8; ++row) {
        let spacesLeft = 0;

        for (let square = 0; square < 8; ++square) {
            const pos = `${FILES[square]}${8 - row}`;

            if (FENIdx < FEN.length) {
                if (FEN[FENIdx] == "/") FENIdx++;

                if (spacesLeft > 0) {
                    spacesLeft--;
                } else {
                    let piece: Piece = FEN[FENIdx] as Piece;

                    if (isNaN(piece as unknown as number)) {
                        state.Board.set(pos, {
                            id: piece.toLowerCase() as Piece,
                            color:
                                piece === piece.toUpperCase()
                                    ? "white"
                                    : "black",
                            pos: pos,
                            moveCount: 0,
                        });
                    } else {
                        spacesLeft += +piece - 1;
                    }

                    ++FENIdx;
                }
            }
        }
    }
}
