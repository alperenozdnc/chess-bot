import { FILES, BOARD } from "@constants";
import { Piece } from "@types";
import { createPiece } from "@utils";

export function drawBoardfromFEN(FEN: string, isBoardFlipped = false) {
    BOARD.innerHTML = "";

    let squareColor = 0;
    let FENIdx = 0;

    for (let row = 0; row < 8; ++row) {
        const ROW_ELEMENT = document.createElement(`div`);
        ROW_ELEMENT.id = `row-${row}`;
        ROW_ELEMENT.className = "row";

        BOARD.appendChild(ROW_ELEMENT);

        let spacesLeft = 0;

        for (let square = 0; square < 8; ++square) {
            const SQUARE_ELEMENT = document.createElement(`div`);
            SQUARE_ELEMENT.id = `square-${square}`;
            SQUARE_ELEMENT.className = `square ${squareColor % 2 == 0 ? "white" : "black"}`

            if (isBoardFlipped) {
                SQUARE_ELEMENT.dataset.pos = `${FILES[8 - square - 1]}${row + 1}`
            } else {
                SQUARE_ELEMENT.dataset.pos = `${FILES[square]}${8 - row}`
            }

            if (square !== 7) ++squareColor;

            ROW_ELEMENT.appendChild(SQUARE_ELEMENT);

            if (FENIdx < FEN.length) {
                if (FEN[FENIdx] == "/") FENIdx++;

                if (spacesLeft > 0) {
                    spacesLeft--;
                } else {
                    let piece: Piece = FEN[FENIdx] as Piece;

                    if (isNaN(piece as unknown as number)) {
                        createPiece({ id: piece, pos: SQUARE_ELEMENT.dataset.pos });
                    } else {
                        spacesLeft += +piece - 1;
                    }

                    ++FENIdx;
                }
            }
        }
    }
}
