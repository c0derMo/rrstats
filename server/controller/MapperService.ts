type ObjectType<T, V extends keyof T | undefined> = V extends keyof T
    ? T[V]
    : never;

type MapType<T, V extends keyof T | undefined> = V extends undefined
    ? Record<string, T>
    : V extends keyof T
      ? Record<string, ObjectType<T, V>>
      : never;

export default class MapperService {
    static createStringMapFromList<
        T,
        K extends keyof T,
        V extends keyof T | undefined,
    >(objects: T[], key: K, value?: V): MapType<T, V> {
        if (objects.length === 0) {
            return {} as MapType<T, V>;
        }
        if (value === undefined) {
            const map: Record<string, T> = {};
            for (const object of objects) {
                map[String(object[key])] = object;
            }
            return map as MapType<T, V>;
        } else {
            const map: Record<string, ObjectType<T, V>> = {};
            for (const object of objects) {
                map[String(object[key])] = object[value] as ObjectType<T, V>;
            }
            return map as MapType<T, V>;
        }
    }
}
