import { FILES } from "@constants";
import { Piece } from "@types";

export function drawBoardfromFEN(FEN: string, isBoardFlipped = false) {
    const BOARD = document.getElementById("board-wrapper") as HTMLDivElement;

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
                        const IMAGE_ELEMENT = document.createElement("img");
                        IMAGE_ELEMENT.src = `./assets/${piece}.png`;

                        IMAGE_ELEMENT.dataset.color = piece.toLowerCase() === piece ? "black" : "white";
                        IMAGE_ELEMENT.dataset.pieceid = piece.toLowerCase();
                        (IMAGE_ELEMENT.dataset.move_count as unknown as number) = 0;

                        IMAGE_ELEMENT.className = "piece";
                        IMAGE_ELEMENT.draggable = false;

                        SQUARE_ELEMENT.appendChild(IMAGE_ELEMENT);
                    } else {
                        spacesLeft += +piece - 1;
                    }

                    ++FENIdx;
                }
            }
        }
    }
}
