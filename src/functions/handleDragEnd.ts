import { makeBotMove, makeMove, onMouseMove } from "@functions";
import { GameState } from "@interfaces";

/** The parent function for all subfunctions handling piece movement.
 */
export async function handleDragEnd(state: GameState) {
    document.addEventListener("mouseup", async (e) => {
        let target = document.elementFromPoint(e.clientX, e.clientY)!;

        if (!target) return;
        if (target.classList.contains("piece"))
            target = target.parentElement as HTMLDivElement;

        const moveResult = await makeMove(state, target as HTMLDivElement);

        if (!moveResult) return;
        if (!moveResult.success || moveResult.gameOver) return;

        // setTimeout because js is single threaded and makes the piece not drop until the bot can play
        setTimeout(async () => {
            await makeBotMove(state);
        }, 0);

        document.removeEventListener("mousemove", (e) => onMouseMove(state, e));
        document.removeEventListener("mouseup", () => handleDragEnd(state));
    });
}
