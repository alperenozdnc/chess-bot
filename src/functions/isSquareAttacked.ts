import { FILES } from "@constants";
import { Pieces } from "@enums";
import { GameState } from "@interfaces";
import { Piece, PieceColor } from "@types";
import { checkForObstacles } from "./checkLegality";

interface Data {
    pos: string;
    piece?: Piece;
    attackerPos?: string;
    attackerColor: PieceColor;
}

interface Position {
    rank: number;
    file: number;
}

export function findFileIdxFromLetter(file: string): number {
    return FILES.indexOf(file);
}

export function rankToIndex(rank: number): number {
    return rank - 1;
}

function generateBishopDirections(pos: Position): string[][] {
    let { rank, file } = pos;

    const directions: string[][] = [[], [], [], []];
    let r = rank + 1;
    let r2 = rank - 1;

    let r3 = rank + 1;
    let r4 = rank - 1;

    for (let f = file - 1; f >= 0; f--) {
        const fileString = FILES[f];

        if (r < 8) directions[0].push(`${fileString}${r + 1}`);
        if (r2 >= 0) directions[1].push(`${fileString}${r2 + 1}`);

        r++;
        r2--;
    }

    for (let f = file + 1; f < 8; f++) {
        const fileString = FILES[f];

        if (r3 < 8) directions[2].push(`${fileString}${r3 + 1}`);
        if (r4 >= 0) directions[3].push(`${fileString}${r4 + 1}`);

        r3++;
        r4--;
    }

    return directions;
}

function generateRookDirections(pos: Position): string[][] {
    let { file, rank } = pos;

    let up = [];
    let down = [];
    let left = [];
    let right = [];

    for (let f = 0; f < 8; f++) {
        const fileString = FILES[f];
        if (f === file) continue;

        if (f < file) left.push(`${fileString}${rank + 1}`);
        else right.push(`${fileString}${rank + 1}`);
    }

    for (let r = 0; r < 8; r++) {
        const fileString = FILES[file];
        if (r === rank) continue;

        if (r < rank) down.push(`${fileString}${r + 1}`);
        else up.push(`${fileString}${r + 1}`);
    }

    left = left.reverse();
    down = down.reverse();

    return [up, down, left, right];
}

export function isSquareAttacked(state: GameState, data: Data): boolean {
    const { pos: attackedPos, attackerColor, piece, attackerPos } = data;
    const attackedPiece = state.Board.get(attackedPos);

    if (attackerColor === attackedPiece?.color) return false;

    const attacked = {
        file: findFileIdxFromLetter(attackedPos[0]),
        rank: rankToIndex(+attackedPos[1]),
    };

    for (const attackerFile of FILES) {
        for (let attackerRank = 1; attackerRank <= 8; ++attackerRank) {
            const attackerPosString = `${attackerFile}${attackerRank}`;
            const attackerPiece = state.Board.get(attackerPosString);

            if (!attackerPiece) continue;
            if (attackerPiece.color !== attackerColor) continue;

            const attacker = {
                file: findFileIdxFromLetter(attackerFile),
                rank: rankToIndex(attackerRank),
            };

            const attackerId = attackerPiece.id;

            const deltaFile = Math.abs(attacked.file - attacker.file);
            const deltaRank = Math.abs(attacked.rank - attacker.rank);

            if (piece && attackerPiece) {
                if (piece !== attackerId) {
                    continue;
                }

                if (attackerPosString !== attackerPos) {
                    continue;
                }
            }

            if (attackerId === Pieces.King) {
                if (deltaRank > 1 || deltaFile > 1) continue;
                return true;
            }

            if (attackerId === Pieces.Pawn) {
                const direction = attackerColor === "white" ? 1 : -1;
                if (deltaRank !== 1 || deltaFile !== 1) continue;
                if (attacked.rank > attacker.rank && direction !== 1) continue;
                if (attacked.rank < attacker.rank && direction !== -1) continue;
                return true;
            }

            if (attackerId === Pieces.Knight) {
                if (
                    (deltaRank === 1 && deltaFile === 2) ||
                    (deltaFile === 1 && deltaRank === 2)
                )
                    return true;
            }

            if (attackerId === Pieces.Bishop) {
                const directions = generateBishopDirections(attacker);
                if (
                    checkForObstacles(
                        state,
                        directions,
                        attackedPos,
                        attackerColor,
                    ) as boolean
                )
                    return true;
            }

            if (attackerId === Pieces.Rook) {
                const directions = generateRookDirections(attacker);
                if (
                    checkForObstacles(
                        state,
                        directions,
                        attackedPos,
                        attackerColor,
                    ) as boolean
                )
                    return true;
            }

            if (attackerId === Pieces.Queen) {
                const bishopDirs = generateBishopDirections(attacker);
                const rookDirs = generateRookDirections(attacker);

                if (
                    (checkForObstacles(
                        state,
                        bishopDirs,
                        attackedPos,
                        attackerColor,
                    ) as boolean) ||
                    (checkForObstacles(
                        state,
                        rookDirs,
                        attackedPos,
                        attackerColor,
                    ) as boolean)
                )
                    return true;
            }
        }
    }

    return false;
}
