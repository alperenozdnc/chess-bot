import { FILES, BOARD } from "@constants";
import { GameState, SquareAndPiece } from "@interfaces";
import { createPiece, getSquareAndPieceFromPos } from "@utils";

export function drawBoard(state: GameState) {
    if (state.draggedPiece) {
        state.draggedPiece.remove();
        state.draggedPiece = null;
    }

    BOARD.innerHTML = "";

    let squareColor = 0;

    for (let row = 0; row < 8; ++row) {
        const ROW_ELEMENT = document.createElement(`div`);
        ROW_ELEMENT.id = `row-${row}`;
        ROW_ELEMENT.className = "row";

        BOARD.appendChild(ROW_ELEMENT);

        for (let square = 0; square < 8; ++square) {
            const SQUARE_ELEMENT = document.createElement(`div`);
            SQUARE_ELEMENT.id = `square-${square}`;
            SQUARE_ELEMENT.className = `square ${squareColor % 2 == 0 ? "white" : "black"}`;

            let pos: string;

            if (state.isBoardFlipped) {
                pos = `${FILES[square]}${row + 1}`;
            } else {
                pos = `${FILES[square]}${8 - row}`;
            }

            SQUARE_ELEMENT.dataset.pos = pos;
            ROW_ELEMENT.appendChild(SQUARE_ELEMENT);

            const piece = state.Board.get(pos);

            if (piece) {
                createPiece(piece);
            }

            if (square !== 7) ++squareColor;
        }
    }

    for (const pos of state.moveHighlights) {
        const data = getSquareAndPieceFromPos(pos) as SquareAndPiece;

        if (!data.square) continue;

        data.square.classList.add("move-highlight");
    }
}
