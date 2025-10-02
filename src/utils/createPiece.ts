import { SquareAndPiece, PieceData } from "@interfaces";
import { getSquareAndPieceFromPos } from "./getSquareAndPieceFromPos";

const getImageUrl = (path: string) => {
    return new URL(`/assets/${path}.png`, import.meta.url).href;
};

export function createPiece(data: PieceData): void {
    const { pos, id, color } = data;
    const { square } = getSquareAndPieceFromPos(pos) as SquareAndPiece;
    const imageElement = document.createElement("img");
    const w = square.offsetWidth;
    const h = square.offsetHeight;
    const FENId = color === "white" ? id.toUpperCase() : id;

    imageElement.src = getImageUrl(FENId);
    imageElement.width = w;
    imageElement.height = h;
    imageElement.dataset.color = color;
    imageElement.dataset.pieceid = id;
    imageElement.className = "piece";
    imageElement.draggable = false;

    square.appendChild(imageElement);
}
