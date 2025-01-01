import { expect, test, vi, describe } from "vitest";

describe("DefaultedMap", () => {
    test("DefaultedMap general usage", () => {
        const map = new DefaultedMap<string, number>(() => 0);

        expect(map.get("a")).toBe(0);
        expect(map.get("b")).toBe(0);

        map.set("a", 12);

        expect(map.get("a")).toBe(12);
        expect(map.get("b")).toBe(0);

        const builtMap = new Map();
        builtMap.set("a", 12);
        builtMap.set("b", 0);

        expect(map.getAll()).toStrictEqual(builtMap);

        const mapperFunc = vi.fn().mockImplementation((_, v) => {
            return v;
        });
        expect(map.mapAll(mapperFunc)).toStrictEqual([12, 0]);

        expect(mapperFunc).toHaveBeenCalledTimes(2);
        expect(mapperFunc).toHaveBeenNthCalledWith(1, "a", 12);
        expect(mapperFunc).toHaveBeenNthCalledWith(2, "b", 0);
    });

    test("getSumOfValues", () => {
        const map = new DefaultedMap<string, number>(() => 0);

        map.set("a", 12);
        map.set("b", 3);
        map.set("c", 7);

        expect(getSumOfValues(map)).toBe(22);
    });
});
