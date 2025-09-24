import { test } from "@testing/test";
import { TEST_MODE } from "@constants";

export default function runTests() {
    test(1 + 1 === 2, "1 + 1 = 2");
    test(1 + 1 !== 2, "1 + 1 != 2");
}

if (TEST_MODE) {
    runTests();
}
