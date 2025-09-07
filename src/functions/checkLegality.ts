import { getPromotionSelection } from "@functions";

import { FILES } from "../constants";
import { Pieces } from "../enums";
import { MoveData, MoveLegality } from "../interfaces";
import { resetDraggedPieceStyles } from "../utils";

export async function checkLegality(data: MoveData): Promise<MoveLegality> {
    const { ID, color, pieceMoveCount, startSquare, destinationSquare } = data;

    let isMoveLegal = true;

    const posA = startSquare.dataset.pos!;
    const posB = destinationSquare.dataset.pos!;

    const fileA = FILES.indexOf(posA[0]);
    const fileB = FILES.indexOf(posB[0]);

    const rankA = +posA[1];
    const rankB = +posB[1];

    let isCapturing = false;
    let isPromoting = false;

    if (destinationSquare.innerHTML !== "") {
        const capturedPiece = (destinationSquare.children[0] as HTMLImageElement);

        if (color === capturedPiece.dataset.color) {
            console.error("you cant capture your own piece");
            isMoveLegal = false;
        }

        if (capturedPiece.dataset.pieceid === Pieces.King) {
            console.error("you cant capture a king");
            isMoveLegal = false;
        }

        isCapturing = true;
    }

    const df = Math.abs(fileA - fileB);
    const dr = Math.abs(rankA - rankB);

    switch (ID) {
        case Pieces.Pawn:
            // todo: en passant
            if (!isCapturing && fileA !== fileB) { console.error("cant change files when not capturing"); isMoveLegal = false };
            if (isCapturing && fileA === fileB) { console.error("cant stay on the same file while capturing"); isMoveLegal = false };
            if (isCapturing && rankA === rankB) { console.error("cant stay on the same rank while capturing"); isMoveLegal = false };
            if (isCapturing && dr > 1) { console.error("cant change more than one rank while capturing"); isMoveLegal = false };
            if (isCapturing && Math.abs(fileA - fileB) > 1) { console.error("can only capture to the left or right"); isMoveLegal = false; }
            if (color === "white" && rankA > rankB) { console.error("cant decrease rank as white"); isMoveLegal = false };
            if (color === "black" && rankA < rankB) { console.error("cant increase rank as black"); isMoveLegal = false };
            if (dr > 2) { console.error("cant move for more than 2 squares"); isMoveLegal = false; }
            if (pieceMoveCount > 0 && dr > 1) { console.error("cant move more than 1 square after first move"); isMoveLegal = false; }

            if (color === "white" && rankB === 8) {
                isPromoting = true;

            } else if (color === "black" && rankB === 1) {
                isPromoting = true;
            }

            if (isMoveLegal && isPromoting) {
                // because the piece somehow keeps dragging when the modal pops up
                resetDraggedPieceStyles(document.querySelector(".dragged")!);

                const selection = await getPromotionSelection(color) as string;

                const IMAGE_ELEMENT = document.createElement("img");
                IMAGE_ELEMENT.src = `./assets/${color === "white" ? selection.toUpperCase() : selection}.png`;

                IMAGE_ELEMENT.dataset.color = color;
                IMAGE_ELEMENT.dataset.pieceid = selection;
                (IMAGE_ELEMENT.dataset.move_count as unknown as number) = 0;

                IMAGE_ELEMENT.className = "piece";
                IMAGE_ELEMENT.draggable = false;

                destinationSquare.replaceChildren(IMAGE_ELEMENT);
                startSquare.innerHTML = "";
            }

            break
        case Pieces.Knight:
            if (df < 1) { console.error("cant change less than one file"); isMoveLegal = false; }
            if (df > 2) { console.error("cant change more than two files"); isMoveLegal = false; }
            if (dr > 2) { console.error("cant change more than two ranks"); isMoveLegal = false; }
            if (dr < 1) { console.error("cant change less than one rank"); isMoveLegal = false; }
            if (df === 1 && dr !== 2) { console.error("cant not move 2 files when moving vertically"); isMoveLegal = false; }
            if (dr === 2 && df !== 1) { console.error("cant not move 1 file when moving sideways"); isMoveLegal = false; }

            break
        case Pieces.Bishop:
            if (df === 0) {
                console.error("cant not change file");
                isMoveLegal = false;
            }

            if (dr === 0) {
                console.error("cant not change rank");
                isMoveLegal = false;
            }

            if (df !== dr) {
                console.error("cant not move diagonally");
                isMoveLegal = false;
            }

            for (let diagonalRank = 0; diagonalRank <= fileA; diagonalRank++) {
                console.log(`${FILES[7 - diagonalRank]}${diagonalRank + 1}`);
            }

            break
        case Pieces.Rook:
            break
        case Pieces.Queen:
            break
        case Pieces.King:
            break
    }

    return { isMoveLegal, isCapturing, isPromoting };
}

