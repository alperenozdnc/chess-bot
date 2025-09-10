import { Pieces } from "@enums";
import { Piece, PieceColor } from "@types";

export async function getPromotionSelection(color: PieceColor): Promise<Piece> {
    const PROMOTION_SCREEN = document.getElementById(
        "promotion-screen",
    ) as HTMLDivElement;
    const PROMOTION_PIECES = [
        Pieces.Queen,
        Pieces.Rook,
        Pieces.Knight,
        Pieces.Bishop,
    ];
    const PROMOTION_PIECES_ELEMENTS =
        PROMOTION_SCREEN.querySelectorAll(".piece-selection");

    PROMOTION_SCREEN.classList.add("promotion-screen-visible");

    PROMOTION_PIECES.forEach((piece, idx) => {
        let pieceID = color === "black" ? piece : piece.toUpperCase();

        const IMAGE_ELEMENT = document.createElement("img");
        IMAGE_ELEMENT.src = `./assets/${pieceID}.png`;
        IMAGE_ELEMENT.draggable = false;
        IMAGE_ELEMENT.classList.add("promotion-piece");

        PROMOTION_PIECES_ELEMENTS[idx].appendChild(IMAGE_ELEMENT);
    });

    const selectionPromise = new Promise<string>((resolve) => {
        PROMOTION_PIECES_ELEMENTS.forEach((button: Element) => {
            button.addEventListener("click", () => {
                resolve((button as HTMLButtonElement).dataset.id as string);

                PROMOTION_SCREEN.classList.remove("promotion-screen-visible");
            });
        });
    });

    return selectionPromise.then((val) => val as Piece);
}
