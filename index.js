const FILES = "abcdefgh".split("");
const INITIAL_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

let isBoardFlipped = false;

const flipButton = document.getElementById("flip-button");

flipButton.addEventListener("click", () => {
    isBoardFlipped = !isBoardFlipped

    drawBoardfromFEN(isBoardFlipped ? INITIAL_POSITION.split("").reverse().join("") : INITIAL_POSITION, isBoardFlipped);
});

function drawBoardfromFEN(FEN, isBoardFlipped = false) {
    const BOARD = document.getElementById("board-wrapper");

    BOARD.innerHTML = "";

    let squareColor = 0;
    let FENIdx = 0;

    for (let row = 0; row < 8; ++row) {
        const ROW_ELEMENT = document.createElement(`div`);
        ROW_ELEMENT.id = `row - ${row}`;
        ROW_ELEMENT.className = "row";

        BOARD.appendChild(ROW_ELEMENT);

        let spacesLeft = 0;

        for (let square = 0; square < 8; ++square) {
            const SQUARE_ELEMENT = document.createElement(`div`);
            SQUARE_ELEMENT.id = `square - ${square}`;
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
                    let piece = FEN[FENIdx];

                    if (isNaN(piece)) {
                        const IMAGE_ELEMENT = document.createElement("img");
                        IMAGE_ELEMENT.src = `./assets/${piece}.png`;

                        IMAGE_ELEMENT.dataset.color = piece.toLowerCase() === piece ? "black" : "white";
                        IMAGE_ELEMENT.dataset.pieceid = piece.toLowerCase();

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

drawBoardfromFEN(INITIAL_POSITION);

let draggedPiece;
let originalSquare;

let offsetX = 0;
let offsetY = 0;

let moveIdx = 0;

document.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("piece")) {
        draggedPiece = e.target;
        originalSquare = draggedPiece.parentElement;

        const rect = draggedPiece.getBoundingClientRect();

        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        draggedPiece.classList.add("dragged");

        document.body.appendChild(draggedPiece);
        moveAt(e.pageX, e.pageY);
    }

    function moveAt(pageX, pageY) {
        draggedPiece.style.left = `${pageX - offsetX}px`;
        draggedPiece.style.top = `${pageY - offsetY}px`;
    }

    document.addEventListener("mousemove", onMouseMove);

    function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
    }

    function resetDraggedPieceStyles(draggedPiece) {
        draggedPiece.classList.remove("dragged");
        draggedPiece.style.left = "";
        draggedPiece.style.top = "";
    }

    document.addEventListener("mouseup", function onMouseUp(e) {
        if (draggedPiece) {
            const target = document.elementFromPoint(e.clientX, e.clientY);

            if (!target) return;

            let pieceCanMove = false;
            const pieceColor = draggedPiece.dataset.color;

            if (pieceColor === "white") {
                if (moveIdx % 2 === 0) pieceCanMove = true;
            } else {
                if (moveIdx % 2 !== 0) pieceCanMove = true;
            }

            if (target.classList.contains("square") && pieceCanMove && target.innerHTML === "" && target !== originalSquare) {
                pieceid = draggedPiece.dataset.pieceid.toUpperCase();
                pos = target.dataset.pos;

                let notation = pos;
                if (pieceid !== "P") notation = `${pieceid}${notation}`;

                console.log(notation);

                ++moveIdx;
                target.appendChild(draggedPiece);
            } else {
                originalSquare.appendChild(draggedPiece);
            }

            resetDraggedPieceStyles(draggedPiece);
        }

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    });
});

