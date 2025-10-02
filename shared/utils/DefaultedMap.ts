export class DefaultedMap<K, T> {
    private map: Map<K, T>;
    private readonly defaultValue: () => T;

    constructor(defaultValue: () => T) {
        this.map = new Map();
        this.defaultValue = defaultValue;
    }

    private getDefaultValue(): T {
        return this.defaultValue();
    }

    public get(key: K): T {
        if (!this.map.has(key)) {
            this.map.set(key, this.getDefaultValue());
        }
        return this.map.get(key)!;
    }

    public set(key: K, value: T) {
        this.map.set(key, value);
    }

    public getAll(): Map<K, T> {
        return new Map(this.map);
    }

    public mapAll<X>(mapper: (key: K, value: T) => X): X[] {
        const result: X[] = [];
        for (const [key, value] of this.map.entries()) {
            result.push(mapper(key, value));
        }
        return result;
    }

    public clear() {
        this.map.clear();
    }
}

export function getSumOfValues<K extends string | number | symbol>(
    map: DefaultedMap<K, number>,
): number {
    return Array.from(map.getAll().values()).reduce(
        (cur, next) => cur + next,
        0,
    );
}
