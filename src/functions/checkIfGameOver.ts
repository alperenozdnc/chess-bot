import { INITIAL_POSITION, MATE_SOUND } from "@constants";
import { PieceColor } from "@types";
import { checkForCheckmate } from "@functions";

interface GameData {
    isGameOver: boolean;
    FENPositions: string[];
}

type GameEndReason = "checkmate" | "draw";
type DrawReason = "stalemate" | "repetition" | "50 move rule";

function handleEnd(reason: GameEndReason, winner?: PieceColor, drawReason?: DrawReason) {
    MATE_SOUND.play();
    const gameEndScreen = document.getElementById("game-end-screen")!;
    const okButton = document.getElementById("ok-button")!;
    const isDraw = reason === "draw";

    gameEndScreen.classList.add("game-end-screen-visible");
    gameEndScreen.querySelector("h2")!.innerText = `${isDraw ? reason : `${winner} won`} by ${isDraw ? drawReason : reason}`;

    okButton.addEventListener("click", () => {
        gameEndScreen.classList.remove("game-end-screen-visible");
        (document.getElementById("reset-button") as HTMLButtonElement)!.click();
    });
}

export async function checkIfGameOver(
    moveIdx: number,
    pieceColor: PieceColor,
    isChecking: boolean,
    FENPositions: string[],
    movesSincePawnAdvance: number,
    movesSinceCapture: number
): Promise<GameData> {
    let isGameOver = false;
    let threefoldRepetition = false;

    FENPositions.forEach(posA => {
        const freq = FENPositions.filter(posB => posA === posB).length;

        if (freq === 3) threefoldRepetition = true;
    });

    const noLegalMovesLeft = await checkForCheckmate(moveIdx + 1, pieceColor === "white" ? "black" : "white");

    if (isChecking && noLegalMovesLeft) {
        isGameOver = true;
        handleEnd("checkmate", pieceColor);
    } else if (noLegalMovesLeft) {
        isGameOver = true;
        handleEnd("draw", pieceColor, "stalemate");
    } else if (threefoldRepetition) {
        isGameOver = true;
        handleEnd("draw", pieceColor, "repetition");
    } else if (movesSincePawnAdvance >= 100 && movesSinceCapture >= 100) {
        isGameOver = true;
        handleEnd("draw", pieceColor, "50 move rule");
    }

    if (isGameOver) FENPositions = [INITIAL_POSITION];

    return {
        isGameOver,
        FENPositions
    }
}

