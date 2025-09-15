export function undoMove(originalSquare: HTMLDivElement, piece: HTMLImageElement) {
    originalSquare.appendChild(piece);
}

