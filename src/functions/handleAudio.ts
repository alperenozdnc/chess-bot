import { CAPTURE_SOUND, CHECK_SOUND, MOVE_SOUND } from "@constants";

function playSound(audio: HTMLAudioElement) {
    if (!audio.paused) {
        const clone = audio.cloneNode() as HTMLAudioElement;
        clone.play();
    } else {
        audio.play();
    }
}

export function handleAudio(isCapturing: boolean, isChecking: boolean) {
    if (isCapturing) {
        if (!isChecking) {
            playSound(CAPTURE_SOUND);
        } else {
            playSound(CHECK_SOUND);
        }
    } else if (isChecking) {
        playSound(CHECK_SOUND);
    } else {
        playSound(MOVE_SOUND);
    }
}
