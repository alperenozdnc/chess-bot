export const FILES = "abcdefgh".split("");
export const INITIAL_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
export const CAPTURE_SOUND = new Audio(
    "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3",
);
export const MOVE_SOUND = new Audio(
    "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3",
);
export const BOARD = document.getElementById("board-wrapper") as HTMLDivElement;
