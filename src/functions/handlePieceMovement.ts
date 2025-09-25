import { makeBotMove, makeMove } from "@functions";
import { GameState } from "@interfaces";
import { highlightMoves } from "@functions";

function moveAt(state: GameState, pageX: number, pageY: number) {
    if (state.draggedPiece) {
        state.draggedPiece.style.left = `${pageX - state.offsetX}px`;
        state.draggedPiece.style.top = `${pageY - state.offsetY}px`;
    }
}

export function handlePieceMovement(state: GameState) {
    document.addEventListener("mousedown", async (e) => {
        if ((e.target as HTMLElement).classList.contains("piece")) {
            state.draggedPiece = e.target as HTMLImageElement;
            state.originalSquare = state.draggedPiece
                .parentElement as HTMLDivElement;

            const rect = state.draggedPiece.getBoundingClientRect();

            state.offsetX = e.clientX - rect.left;
            state.offsetY = e.clientY - rect.top;

            state.draggedPiece.classList.add("dragged");
            document.body.appendChild(state.draggedPiece);
            moveAt(state, e.pageX, e.pageY);

            await highlightMoves(state);
        }

        document.addEventListener("mousemove", onMouseMove);

        function onMouseMove(e: MouseEvent) {
            moveAt(state, e.pageX, e.pageY);
        }

        async function onMouseUp(e: MouseEvent) {
            let target = document.elementFromPoint(e.clientX, e.clientY)!;
            if (!target) return;

            target = (
                target.classList.contains("piece")
                    ? target.parentElement
                    : target
            )!;

            const isMoveMade = await makeMove(state, target as HTMLDivElement);

            if (!isMoveMade) return;

            // setTimeout because js is single threaded and makes the piece not drop until the bot can play
            setTimeout(async () => {
                await makeBotMove(state);
            }, 0);

            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }

        document.addEventListener("mouseup", onMouseUp);
    });
}
