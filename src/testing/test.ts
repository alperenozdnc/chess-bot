import { GREEN, RED, RESET } from "@constants";

export function test(assertion: boolean, label: string) {
    if (!assertion) {
        return console.error(`${RED}FAILED: ${label}${RESET}`);
    }

    console.log(`${GREEN}PASSED: ${label}${RESET}`);
}
