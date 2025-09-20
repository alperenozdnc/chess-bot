enum Values {
    "p" = 1,
    "n" = 3,
    "b" = 3,
    "r" = 5,
    "q" = 9,
}

export function countMaterials() {
    const pieces = Array.from(
        document.querySelectorAll("[data-color]"),
    ) as HTMLImageElement[];
    let white = 0;
    let black = 0;

    for (const piece of pieces) {
        const pieceId = piece.dataset.pieceid;

        if (pieceId === "k") continue;

        const value = pieceId as keyof typeof Values;

        if (piece.dataset.color === "white") {
            white += Values[value];
        } else {
            black += Values[value];
        }
    }

    return { white, black };
}
