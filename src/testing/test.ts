export function test(assertion: boolean | (() => boolean), label: string) {
    let assertionVal = assertion;

    if (typeof assertion !== "boolean") assertionVal = assertion();

    if (!assertion) {
        console.log(`%c❌ FAILED: ${label}`, "color: red; font-weight: bold;");
        return;
    }

    console.log(`%c✅ PASSED: ${label}`, "color: green; font-weight: bold;");
}
