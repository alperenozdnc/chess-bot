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
                        IMAGE_ELEMENT.dataset.move_count = 0;

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

function checkLegality(data) {
    const { ID, color, pieceMoveCount, startSquare, destinationSquare } = data;

    let isMoveLegal = true;

    const posA = startSquare.dataset.pos;
    const posB = destinationSquare.dataset.pos;

    console.log(posA, posB);

    const fileA = posA[0];
    const rankA = posA[1];

    const fileB = posB[0];
    const rankB = posB[1];

    let is_capturing = false;

    if (destinationSquare.innerHTML !== "") {
        const capturedPiece = destinationSquare.children[0];

        if (color === capturedPiece.dataset.color) {
            console.error("you cant capture your own piece");
            return false;
        }

        if (capturedPiece.dataset.pieceid === "k") {
            console.error("you cant capture a king");
            return false;
        }

        is_capturing = true;
    }

    switch (ID) {
        case "p":
            // todo: en passant
            // can only change ONE file when capturing
            dd = Math.abs(+rankA - +rankB);

            if (!is_capturing && fileA !== fileB) { console.error("cant change files when not capturing"); return false };
            if (is_capturing && fileA === fileB) { console.error("cant stay on the same file while capturing"); return false };
            if (color === "white" && +rankA > +rankB) { console.error("cant decrease rank as white"); return false };
            if (color === "black" && +rankA < +rankB) { console.error("cant increase rank as black"); return false };
            if (dd > 2) { console.error("cant move for more than 2 squares"); return false; }
            if (pieceMoveCount > 0 && dd > 1) { console.error("cant move more than 1 square after first move"); return false; }

            break
        case "n":
            break
        case "b":
            break
        case "r":
            break
        case "q":
            break
        case "k":
            break
    }

    return isMoveLegal;
}

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
            let target = document.elementFromPoint(e.clientX, e.clientY);
            target = target.classList.contains("piece") ? target.parentElement : target;

            if (!target) return;

            let pieceCanMove = false;
            const pieceColor = draggedPiece.dataset.color;

            if (pieceColor === "white") {
                if (moveIdx % 2 === 0) pieceCanMove = true;
            } else {
                if (moveIdx % 2 !== 0) pieceCanMove = true;
            }

            let pieceid = draggedPiece.dataset.pieceid.toUpperCase();

            let isMoveLegal = checkLegality({
                ID: pieceid.toLowerCase(),
                color: pieceColor,
                pieceMoveCount: draggedPiece.dataset.move_count,
                startSquare: originalSquare,
                destinationSquare: target
            });

            if (target.classList.contains("square") && pieceCanMove && target !== originalSquare && isMoveLegal) {
                let pos = target.dataset.pos;

                let notation = pos;
                if (pieceid !== "P") notation = `${pieceid}${notation}`;

                draggedPiece.dataset.move_count = +draggedPiece.dataset.move_count + 1;

                ++moveIdx;
                target.innerHTML = "";
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

