import { PieceColor } from "@types";

export function reverseColor(color: PieceColor) {
    return color === "white" ? "black" : "white";
}
