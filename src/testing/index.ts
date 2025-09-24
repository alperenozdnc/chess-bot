import { test } from "@testing/test";
import { BOARD, TEST_MODE } from "@constants";
import { Pieces } from "@enums";

function logSectionStart(label: string) {
    console.warn(`${label}\n${"-".repeat(label.length)}`);
}

function logSectionEnd(label: string) {
    console.warn(`${"-".repeat(label.length)}\n${label}`);
}

function testRendering() {
    logSectionStart("RENDERING");

    // DOES BOARD PRINT CORRECTLY
    test(
        BOARD.querySelectorAll(".square").length === 64,
        "64 squares are printed",
    );

    // ARE SQUARE COLOR RATIOS CORRECT
    test(
        BOARD.querySelectorAll(".white").length +
        BOARD.querySelectorAll(".black").length ===
        64,
        "white and black square ratios are correct",
    );

    // ARE COLORS PLACED CORRECTLY
    test(() => {
        const a =
            BOARD.querySelector(`[data-pos="a8"]`)!.classList.contains("white");
        const b =
            BOARD.querySelector(`[data-pos="a1"]`)!.classList.contains("black");
        const c =
            BOARD.querySelector(`[data-pos="h1"]`)!.classList.contains("white");
        const d =
            BOARD.querySelector(`[data-pos="h8"]`)!.classList.contains("black");

        return a && b && c && d;
    }, "colors are placed correctly");

    // DOES BOARD PRINT CORRECT AMOUNT OF PIECES
    test(
        () =>
            BOARD.querySelectorAll(`[data-color="white"]`).length +
            BOARD.querySelectorAll(`[data-color="black"]`).length ===
            32,
        "correct amount of pieces are printed\n (assuming FEN is default)",
    );

    // DOES BOARD CORRECTLY PLACE PIECES
    test(() => {
        const correctRow = [
            Pieces.Rook,
            Pieces.Knight,
            Pieces.Bishop,
            Pieces.Queen,
            Pieces.King,
            Pieces.Bishop,
            Pieces.Knight,
            Pieces.Rook,
        ];

        let result = true;

        const correctRowPawns = [...Pieces.Pawn.repeat(8).split("")];

        for (const rowPos of ["#row-0", "#row-7", "#row-1", "#row-6"]) {
            const ids: string[] = [];

            for (const row of Array.from(
                BOARD.querySelector(rowPos)!.childNodes,
            )) {
                for (const square of Array.from(
                    row.childNodes,
                ) as HTMLImageElement[]) {
                    const piece = square.dataset.pieceid;
                    ids.push(piece!);
                }
            }

            if (["0", "7"].includes(rowPos[rowPos.length - 1])) {
                if (JSON.stringify(ids) !== JSON.stringify(correctRow)) {
                    result = false;
                    break;
                }
            } else {
                if (JSON.stringify(ids) !== JSON.stringify(correctRowPawns)) {
                    result = false;
                    break;
                }
            }
        }

        return result;
    }, "pieces are correctly placed \n (assuming FEN is default)");

    logSectionEnd("RENDERING");
}

export default function runTests() {
    logSectionStart("RUNNING TEST SUITE");

    testRendering();

    logSectionEnd("END OF TEST SUITE");
}

if (TEST_MODE) {
    runTests();
}
