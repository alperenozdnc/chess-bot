function drawBoardfromFEN(FEN) {
    // r rook n knight k king q queen b bishop p pawn
    // if uppercase, its white, lowercase its black
    // a number indicates the amount of spaces after the piece

    const BOARD_ELEMENT = document.getElementById("board");

    let squareColor = 0;
    let FENIdx = 0;

    for (let row = 0; row < 8; ++row) {
        const ROW_ELEMENT = document.createElement(`div`);
        ROW_ELEMENT.id = `row-${row}`;
        ROW_ELEMENT.className = "row";

        BOARD_ELEMENT.appendChild(ROW_ELEMENT);

        let spacesLeft = 0;

        for (let square = 0; square < 8; ++square) {
            const SQUARE_ELEMENT = document.createElement(`div`);
            SQUARE_ELEMENT.id = `square-${square}`;
            SQUARE_ELEMENT.className = `square ${squareColor % 2 == 0 ? "white" : "black"}`

            if (square !== 7) ++squareColor;

            ROW_ELEMENT.appendChild(SQUARE_ELEMENT);

            if (FENIdx < FEN.length) {
                if (FEN[FENIdx] == "/") FENIdx++;

                console.log(spacesLeft);

                if (spacesLeft > 0) {
                    spacesLeft--;
                } else {
                    let piece = FEN[FENIdx];

                    if (isNaN(piece)) {
                        const IMAGE_ELEMENT = document.createElement("img");

                        IMAGE_ELEMENT.src = `./assets/${piece}.png`

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

const INITIAL_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"

drawBoardfromFEN(INITIAL_POSITION);
