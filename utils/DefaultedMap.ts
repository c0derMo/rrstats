export class DefaultedMap<T> {
    private map: Record<string, T>;
    private readonly defaultValue: () => T;

    constructor(defaultValue: () => T) {
        this.map = {};
        this.defaultValue = defaultValue;
    }

    private getDefaultValue(): T {
        return this.defaultValue();
    }

    public get(key: string): T {
        if (this.map[key] == null) {
            this.map[key] = this.getDefaultValue();
        }
        return this.map[key];
    }

    public set(key: string, value: T) {
        this.map[key] = value;
    }

    public getAll(): Record<string, T> {
        return this.map;
    }

    public mapAll<X>(mapper: (key: string, value: T) => X): X[] {
        const result: X[] = [];
        for (const key in this.map) {
            result.push(mapper(key, this.map[key]));
        }
        return result;
    }
}

export function getSumOfValues(map: DefaultedMap<number>): number {
    return Object.values(map.getAll()).reduce((cur, next) => cur + next);
}
