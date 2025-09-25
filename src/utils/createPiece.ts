import { SquareAndPiece, PieceData } from "@interfaces";
import { getSquareAndPieceFromPos } from "./getSquareAndPieceFromPos";

export function createPiece(data: PieceData): void {
    const { pos, id, color, enPassantMoveIdx } = data;
    const { square } = getSquareAndPieceFromPos(pos) as SquareAndPiece;
    const imageElement = document.createElement("img");
    const w = square.offsetWidth;
    const h = square.offsetHeight;
    const FENId = color === "white" ? id.toUpperCase() : id;

    imageElement.src = `./assets/${FENId}.png`;

    imageElement.width = w;
    imageElement.height = h;
    imageElement.dataset.color = color;
    imageElement.dataset.pieceid = id;
    (imageElement.dataset.move_count as unknown as number) = 0;
    if (enPassantMoveIdx) {
        imageElement.dataset.en_passant_move_idx = enPassantMoveIdx.toString();
    }

    imageElement.className = "piece";
    imageElement.draggable = false;

    square.appendChild(imageElement);
}
