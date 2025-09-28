export function find<K, V>(
    predicate: (key: K, value: V) => boolean,
    map: Map<K, V>,
): { key: K; value: V } | null {
    for (let [key, value] of map) {
        const result = predicate(key, value);

        if (result) {
            return { key, value };
        }
    }

    return null;
}
