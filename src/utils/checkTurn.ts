import { PieceColor } from "@types";

export function checkTurn(moveIdx: number, color: PieceColor) {
    if (color === "white") {
        if (moveIdx % 2 === 0) return true;
    } else {
        if (moveIdx % 2 !== 0) return true;
    }

    return false;
}

