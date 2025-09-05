export function resetDraggedPieceStyles(draggedPiece: HTMLImageElement) {
    draggedPiece.classList.remove("dragged");
    draggedPiece.style.left = "";
    draggedPiece.style.top = "";
}

