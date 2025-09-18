import { SquareAndPiece, PieceData } from "@interfaces";
import { getSquareAndPieceFromPos } from "./getSquareAndPieceFromPos";

export function createPiece(data: PieceData): void {
    const { pos, id } = data;
    const { square } = getSquareAndPieceFromPos(pos) as SquareAndPiece;
    const imageElement = document.createElement("img");
    const w = square.offsetWidth;
    const h = square.offsetHeight;

    imageElement.src = `./assets/${id}.png`;

    imageElement.width = w;
    imageElement.height = h;
    imageElement.dataset.color = id.toLowerCase() === id ? "black" : "white";
    imageElement.dataset.pieceid = id.toLowerCase();
    (imageElement.dataset.move_count as unknown as number) = 0;

    imageElement.className = "piece";
    imageElement.draggable = false;

    square.appendChild(imageElement);
}
