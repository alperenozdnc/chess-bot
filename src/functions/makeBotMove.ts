import { FILES } from "@constants";
import { makeMove, listLegalMoves } from "@functions";
import { GameState } from "@interfaces";

export async function makeBotMove(state: GameState) {
    const allLegalMoves = [];

    for (const file of FILES) {
        for (let rank = 1; rank <= 8; rank++) {
            const piece = state.Board.find((p) => p.pos === file + rank);
            if (!piece) continue;
            if (piece.color !== state.botColor) continue;

            const startSquare = document.querySelector(
                `[data-pos="${piece.pos}"]`,
            ) as HTMLDivElement;

            const moves = await listLegalMoves(state, piece, true);

            for (const move of moves) {
                const destinationSquare = document.querySelector(
                    `[data-pos="${move.pos}"]`,
                ) as HTMLDivElement;

                allLegalMoves.push({
                    piece: piece,
                    startSquare,
                    square: destinationSquare,
                });
            }
        }
    }

    const move =
        allLegalMoves[Math.floor(Math.random() * allLegalMoves.length)];

    if (!move) return;

    const startSquare = document.querySelector(
        `[data-pos="${move.piece.pos}"]`,
    ) as HTMLDivElement;

    state.draggedPiece = startSquare.firstChild as HTMLImageElement;
    state.originalSquare = startSquare;

    await makeMove(state, move.square, true);

    state.draggedPiece = null;
    state.originalSquare = undefined;
}
