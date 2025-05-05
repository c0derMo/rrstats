import { afterEach, describe, expect, test, vi, type Mock } from "vitest";
import { useRoute, navigateTo } from "#app/composables/router";
import { flushPromises } from "@vue/test-utils";

vi.mock("vue", async (importOriginal) => ({
    ...(await importOriginal()),
    onMounted: vi.fn((hook: () => Promise<unknown>) => {
        hook();
    }),
}));

vi.mock("#app/composables/router", async (importOriginal) => ({
    ...(await importOriginal()),
    useRoute: vi.fn(),
    navigateTo: vi.fn(),
}));

describe("useHash()", () => {
    afterEach(() => {
        vi.resetAllMocks();
        clearNuxtState(["hash"]);
    });

    test("Initial function call - with hash", async () => {
        const callerFunction = vi.fn(() => {
            return new Promise<void>((resolve) => {
                resolve();
            });
        });

        (useRoute as Mock).mockReturnValueOnce({
            hash: "#abc.123",
            otherVal: "test",
        });

        useHash(callerFunction);

        await flushPromises();

        expect(callerFunction).toBeCalledTimes(1);
        expect(callerFunction).toBeCalledWith(["#abc", "123"]);
        expect(navigateTo).toBeCalledTimes(1);
        expect(navigateTo).toBeCalledWith({ hash: "", otherVal: "test" }, { replace: true });
    });

    test("Initial function call - without hash", async () => {
        const callerFunction = vi.fn(() => {
            return new Promise<void>((resolve) => {
                resolve();
            });
        });

        (useRoute as Mock).mockReturnValueOnce({
            hash: "",
            otherVal: "test",
        });

        useHash(callerFunction);

        await flushPromises();

        expect(callerFunction).toBeCalledTimes(0);
        expect(navigateTo).toBeCalledTimes(0);
    });

    test("Navigation on external hash change", async () => {
        const callerFunction = vi.fn(() => {
            return new Promise<void>((resolve) => {
                resolve();
            });
        });

        const hashRef = ref("");

        (useRoute as Mock).mockReturnValueOnce({
            get hash() {
                return hashRef.value;
            },
            otherVal: "test",
        });

        useHash(callerFunction);

        await flushPromises();

        expect(callerFunction).toBeCalledTimes(0);
        expect(navigateTo).toBeCalledTimes(0);

        hashRef.value = "#other.hash";

        await flushPromises();

        expect(callerFunction).toBeCalledTimes(1);
        expect(callerFunction).toBeCalledWith(["#other", "hash"]);
        expect(navigateTo).toBeCalledTimes(1);
        expect(navigateTo).toBeCalledWith({ hash: "", otherVal: "test" }, { replace: true });
    });

    test("Updating hash", async () => {
        const callerFunction = vi.fn(() => {
            return new Promise<void>((resolve) => {
                resolve();
            });
        });

        const hashRef = ref("");

        (useRoute as Mock).mockReturnValueOnce({
            get hash() {
                return hashRef.value;
            },
            set hash(val) {
                hashRef.value = val;
            },
            otherVal: "test",
        });

        const setHash = useHash(callerFunction);

        await flushPromises();

        setHash("#some.hash");

        await flushPromises();
        expect(window.localStorage.hash).toBe(undefined);
        expect(navigateTo).toBeCalledTimes(0);

        setHash("#some.hash");

        await flushPromises();
        expect(window.location.hash).toBe("#some.hash");
        expect(navigateTo).toBeCalledTimes(1);
        expect(navigateTo).toBeCalledWith({
            otherVal: "test",
            hash: "#some.hash",
        }, { replace: true });
    });

    test("Updating hash - immediate", async () => {
        const callerFunction = vi.fn(() => {
            return new Promise<void>((resolve) => {
                resolve();
            });
        });

        const hashRef = ref("");

        (useRoute as Mock).mockReturnValueOnce({
            get hash() {
                return hashRef.value;
            },
            set hash(val) {
                hashRef.value = val;
            },
            otherVal: "test",
        });

        const setHash = useHash(callerFunction);

        await flushPromises();

        setHash("#some.hash", true);

        await flushPromises();
        expect(window.location.hash).toBe("#some.hash");
        expect(navigateTo).toBeCalledTimes(1);
        expect(navigateTo).toBeCalledWith({
            otherVal: "test",
            hash: "#some.hash",
        }, { replace: true });
    });
});
