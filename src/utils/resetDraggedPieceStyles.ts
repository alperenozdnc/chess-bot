export function resetDraggedPieceStyles(draggedPiece: HTMLImageElement) {
    console.log(draggedPiece);

    draggedPiece.classList.remove("dragged");
    draggedPiece.style.left = "";
    draggedPiece.style.top = "";
}
