const FILES = "abcdefgh".split("");
const INITIAL_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
const captureSound = new Audio("https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3");
const moveSound = new Audio("https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3");

let isBoardFlipped = false;

const flipButton = document.getElementById("flip-button");

flipButton.addEventListener("click", () => {
    isBoardFlipped = !isBoardFlipped

    drawBoardfromFEN(isBoardFlipped ? INITIAL_POSITION.split("").reverse().join("") : INITIAL_POSITION, isBoardFlipped);
});

function resetDraggedPieceStyles(draggedPiece) {
    draggedPiece.classList.remove("dragged");
    draggedPiece.style.left = "";
    draggedPiece.style.top = "";
}

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

async function getPromotionSelection(color) {
    const PROMOTION_SCREEN = document.getElementById("promotion-screen");
    const PROMOTION_PIECES = ["q", "r", "n", "b"];
    const PROMOTION_PIECES_ELEMENTS = PROMOTION_SCREEN.querySelectorAll(".piece-selection");

    PROMOTION_SCREEN.classList.add("promotion-screen-visible");

    PROMOTION_PIECES.forEach((piece, idx) => {
        let pieceID = color === "black" ? piece : piece.toUpperCase();

        const IMAGE_ELEMENT = document.createElement("img");
        IMAGE_ELEMENT.src = `./assets/${pieceID}.png`;
        IMAGE_ELEMENT.draggable = false;
        IMAGE_ELEMENT.classList.add("promotion-piece");

        PROMOTION_PIECES_ELEMENTS[idx].appendChild(IMAGE_ELEMENT);
    });

    const selectionPromise = new Promise((resolve) => {
        PROMOTION_PIECES_ELEMENTS.forEach(button => {
            button.addEventListener("click", () => {
                resolve(button.dataset.id);

                PROMOTION_SCREEN.classList.remove("promotion-screen-visible");
            });
        });
    });

    return selectionPromise.then(val => val);
}

async function checkLegality(data) {
    const { ID, color, pieceMoveCount, startSquare, destinationSquare } = data;

    let isMoveLegal = true;

    const posA = startSquare.dataset.pos;
    const posB = destinationSquare.dataset.pos;

    const fileA = FILES.indexOf(posA[0]);
    const fileB = FILES.indexOf(posB[0]);

    const rankA = +posA[1];
    const rankB = +posB[1];

    let isCapturing = false;
    let isPromoting = false;

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

        isCapturing = true;
    }

    switch (ID) {
        case "p":
            // todo: en passant
            // todo: promotion

            dd = Math.abs(rankA - rankB);

            if (!isCapturing && fileA !== fileB) { console.error("cant change files when not capturing"); return false };
            if (isCapturing && fileA === fileB) { console.error("cant stay on the same file while capturing"); return false };
            if (isCapturing && rankA === rankB) { console.error("cant stay on the same rank while capturing"); return false };
            if (isCapturing && Math.abs(fileA - fileB) > 1) { console.error("can only capture to the left or right"); return false; }
            if (color === "white" && rankA > rankB) { console.error("cant decrease rank as white"); return false };
            if (color === "black" && rankA < rankB) { console.error("cant increase rank as black"); return false };
            if (dd > 2) { console.error("cant move for more than 2 squares"); return false; }
            if (pieceMoveCount > 0 && dd > 1) { console.error("cant move more than 1 square after first move"); return false; }

            if (color === "white" && rankB === 8) {
                isPromoting = true;

            } else if (color === "black" && rankB === 1) {
                isPromoting = true;
            }

            if (isPromoting) {
                // because the piece somehow keeps dragging when the modal pops up
                resetDraggedPieceStyles(document.querySelector(".dragged"));

                const selection = await getPromotionSelection(color);

                const IMAGE_ELEMENT = document.createElement("img");
                IMAGE_ELEMENT.src = `./assets/${color === "white" ? selection.toUpperCase() : selection}.png`;

                IMAGE_ELEMENT.dataset.color = color;
                IMAGE_ELEMENT.dataset.pieceid = selection;
                IMAGE_ELEMENT.dataset.move_count = 0;

                IMAGE_ELEMENT.className = "piece";
                IMAGE_ELEMENT.draggable = false;

                destinationSquare.replaceChildren(IMAGE_ELEMENT);
                startSquare.innerHTML = "";
            }

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

    return { isMoveLegal, isCapturing, isPromoting };
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
        if (draggedPiece) {
            draggedPiece.style.left = `${pageX - offsetX}px`;
            draggedPiece.style.top = `${pageY - offsetY}px`;
        }
    }

    document.addEventListener("mousemove", onMouseMove);

    function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
    }

    document.addEventListener("mouseup", async function onMouseUp(e) {
        if (draggedPiece) {
            let target = document.elementFromPoint(e.clientX, e.clientY);
            target = target.classList.contains("piece") ? target.parentElement : target;

            if (!target) return;
            if (!target.classList.contains("square")) {
                originalSquare.appendChild(draggedPiece);
                resetDraggedPieceStyles(draggedPiece);
                return;
            }

            let pieceCanMove = false;
            const pieceColor = draggedPiece.dataset.color;

            if (pieceColor === "white") {
                if (moveIdx % 2 === 0) pieceCanMove = true;
            } else {
                if (moveIdx % 2 !== 0) pieceCanMove = true;
            }

            let pieceid = draggedPiece.dataset.pieceid.toUpperCase();

            const { isMoveLegal, isCapturing, isPromoting } = await checkLegality({
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

                if (!isPromoting) {
                    target.innerHTML = "";
                    target.appendChild(draggedPiece);
                }

                if (isCapturing) {
                    captureSound.play();
                } else {
                    moveSound.play();
                }
            } else {
                originalSquare.appendChild(draggedPiece);
            }

            resetDraggedPieceStyles(draggedPiece);
        }

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        draggedPiece = null;
    });
});

