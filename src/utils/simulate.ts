export function simulate(
    pieceElement: HTMLImageElement,
    destinationPieceElement: HTMLImageElement,
    isCapturing: boolean,
    isEnPassant: boolean,
    destinationSquare: HTMLDivElement,
    startSquare: HTMLDivElement,
) {
    function play() {
        pieceElement.remove();
        if (isCapturing && !isEnPassant) destinationSquare.innerHTML = "";
        destinationSquare.appendChild(pieceElement);
    }

    function unplay() {
        pieceElement.remove();
        if (isCapturing && !isEnPassant)
            destinationSquare.appendChild(destinationPieceElement);
        startSquare.appendChild(pieceElement);
    }

    return { play, unplay };
}
