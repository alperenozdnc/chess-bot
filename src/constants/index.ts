export const FILES = "abcdefgh".split("");
export const INITIAL_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
export const CAPTURE_SOUND = new Audio(
    "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3",
);
export const MOVE_SOUND = new Audio(
    "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3",
);
export const CHECK_SOUND = new Audio(
    "https://images.chesscomfiles.com/chess-themes/sounds/_WEBM_/default/move-check.webm",
);
export const MATE_SOUND = new Audio(
    "https://images.chesscomfiles.com/chess-themes/sounds/_WEBM_/default/game-end.webm",
);
export const BOARD = document.getElementById("board-wrapper") as HTMLDivElement;
export const TEST_MODE = true;
export const GREEN = "\x1b[32m";
export const RED = "\x1b[31m";
export const RESET = "\x1b[0m";
