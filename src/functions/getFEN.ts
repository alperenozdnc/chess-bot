import { FILES } from "@constants";
import { getSquareAndPieceFromPos } from "@utils";

export function getFEN() {
    let spaceIdx = 0;
    let FEN = "";

    for (let rank = 8; rank >= 1; --rank) {
        for (const file of FILES) {
            const fileIdx = FILES.indexOf(file) + 1;
            const pos = `${file}${rank}`;
            const data = getSquareAndPieceFromPos(pos);

            if (!data) continue;

            const { square, piece } = data;

            if (!square) continue;

            if (piece) {
                if (spaceIdx > 0) {
                    FEN += spaceIdx;
                    spaceIdx = 0;
                }

                FEN += piece.dataset.color === "white" ? piece.dataset.pieceid!.toUpperCase() : piece.dataset.pieceid;
            } else {
                ++spaceIdx;
            }

            if (fileIdx === 8) {
                if (spaceIdx > 0) {
                    FEN += spaceIdx;
                }

                if (rank !== 1) {
                    FEN += "/";
                }

                spaceIdx = 0;
            }
        }
    }

    return FEN;
}
