import { drawBoardfromFEN } from "@functions";

export function handleBoardFlipping(FEN: string) {
    let isBoardFlipped = false;

    const flipButton = document.getElementById(
        "flip-button",
    ) as HTMLButtonElement;

    flipButton!.addEventListener("click", () => {
        isBoardFlipped = !isBoardFlipped;

        drawBoardfromFEN(
            isBoardFlipped ? FEN.split("").reverse().join("") : FEN,
            isBoardFlipped,
        );
    });
}
