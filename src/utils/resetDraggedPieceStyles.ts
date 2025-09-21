export function resetDraggedPieceStyles(draggedPiece: HTMLImageElement) {
    document
        .querySelectorAll(".dragged")
        .forEach((elem) => elem.classList.remove("dragged"));
    draggedPiece.classList.remove("dragged");
    draggedPiece.style.left = "";
    draggedPiece.style.top = "";
}
