import { INITIAL_POSITION, MATE_SOUND } from "@constants";
import { Piece, PieceColor } from "@types";
import { checkForCheckmate } from "@functions";
import { countMaterials } from "@utils";
import { Pieces } from "@enums";
import { GameState } from "./handlePieceMovement";

type GameEndReason = "checkmate" | "draw";
type DrawReason =
    | "stalemate"
    | "repetition"
    | "50 move rule"
    | "insufficient material";

function doesPieceExist(color: PieceColor, pieceId: Piece) {
    const pieces = Array.from(
        document.querySelectorAll(`[data-color=${color}]`),
    ) as HTMLImageElement[];

    let result = false;
    let pieceCount = 0;

    for (const piece of pieces) {
        if (piece.dataset.pieceid !== pieceId) continue;

        result = true;
        ++pieceCount;
    }

    return { result, pieceCount };
}

function handleEnd(
    reason: GameEndReason,
    winner?: PieceColor,
    drawReason?: DrawReason,
) {
    MATE_SOUND.play();
    const gameEndScreen = document.getElementById("game-end-screen")!;
    const okButton = document.getElementById("ok-button")!;
    const isDraw = reason === "draw";

    gameEndScreen.classList.add("game-end-screen-visible");
    gameEndScreen.querySelector("h2")!.innerText =
        `${isDraw ? reason : `${winner} won`} by ${isDraw ? drawReason : reason} `;

    okButton.addEventListener("click", () => {
        gameEndScreen.classList.remove("game-end-screen-visible");
        (document.getElementById("reset-button") as HTMLButtonElement)!.click();
    });
}

export async function checkIfGameOver(
    state: GameState,
    isChecking: boolean,
    pieceColor: PieceColor,
) {
    let threefoldRepetition = false;

    state.FENPositions.forEach((posA) => {
        const freq = state.FENPositions.filter((posB) => posA === posB).length;

        if (freq === 3) threefoldRepetition = true;
    });

    const noLegalMovesLeft = await checkForCheckmate(
        state.moveIdx + 1,
        pieceColor === "white" ? "black" : "white",
    );

    const { white, black } = countMaterials();

    if (isChecking && noLegalMovesLeft) {
        state.isGameOver = true;
        handleEnd("checkmate", pieceColor);
    } else if (noLegalMovesLeft) {
        state.isGameOver = true;
        handleEnd("draw", pieceColor, "stalemate");
    } else if (threefoldRepetition) {
        state.isGameOver = true;
        handleEnd("draw", pieceColor, "repetition");
    } else if (
        state.movesSincePawnAdvance >= 100 &&
        state.movesSinceCapture >= 100
    ) {
        state.isGameOver = true;
        handleEnd("draw", pieceColor, "50 move rule");
    } else if (white + black === 0) {
        state.isGameOver = true;
        handleEnd("draw", pieceColor, "insufficient material");
    } else if (
        !doesPieceExist("white", Pieces.Pawn).result &&
        !doesPieceExist("black", Pieces.Pawn).result
    ) {
        if (white <= 3 && black <= 3) {
            state.isGameOver = true;
            handleEnd("draw", pieceColor, "insufficient material");
        } else if (white + black === 6 && (white === 0 || black === 0)) {
            let colorWithNoMaterials =
                white === 0 ? "white" : ("black" as PieceColor);
            let colorWithMaterials =
                colorWithNoMaterials === "white"
                    ? "black"
                    : ("white" as PieceColor);

            // king vs 2 knights are a draw according to USCF
            if (
                doesPieceExist(colorWithMaterials, Pieces.Knight).pieceCount ===
                2
            ) {
                state.isGameOver = true;
                handleEnd("draw", pieceColor, "insufficient material");
            }
        }
    }

    if (state.isGameOver) state.FENPositions = [INITIAL_POSITION];
    state.isGameOver = false;
    state.moveIdx = 0;
}
