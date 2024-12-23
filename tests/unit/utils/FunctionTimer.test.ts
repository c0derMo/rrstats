import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import consola from "consola";
import { DateTime } from "luxon";

vi.mock('consola', () => {
    const logFn = vi.fn();

    const consola = {
        default: {
            withTag: vi.fn().mockImplementation(() => {
                return {
                    log: logFn
                }
            })
        }
    };

    return consola;
});


let _ogDtNow: () => DateTime;
let dtNowFunc: Mock;

beforeEach(() => {
    vi.clearAllMocks();
    _ogDtNow = DateTime.now;
    dtNowFunc = vi.fn();
    DateTime.now = dtNowFunc;
});

afterEach(() => {
    DateTime.now = _ogDtNow;
})

test('FunctionTimer', () => {
    const dtNow = _ogDtNow();
    dtNowFunc.mockReturnValueOnce(dtNow);
    const ft = new FunctionTimer("Testing name");

    const dtPlus300 = dtNow.plus({ milliseconds: 300 });
    dtNowFunc.mockReturnValueOnce(dtPlus300);

    expect(ft.currentDurationMillis()).toBe(300);

    const dtPlus600 = dtNow.plus({ milliseconds: 600 });
    dtNowFunc.mockReturnValueOnce(dtPlus600);

    ft.finish();
    expect(consola.withTag("").log).toHaveBeenCalledTimes(1);
    expect(consola.withTag("").log).toHaveBeenCalledWith("Testing name: 600ms");
});

class TestClass {
    @Log("Test Logger")
    testOne() {
        return false;
    }

    @Log("Test Logger with arguments shown", true)
    testTwo(x: boolean) {
        return x;
    }

    @Log("Test Logger with arguments hidden")
    testThree(x: boolean) {
        return x;
    }
}

test('Log Decorator', () => {
    const c = new TestClass();

    const dtNow = _ogDtNow();

    const dtPlus300 = dtNow.plus({ milliseconds: 300 });
    dtNowFunc.mockReturnValueOnce(dtNow);
    dtNowFunc.mockReturnValueOnce(dtPlus300);

    c.testOne();
    expect(consola.withTag("").log).toHaveBeenCalledTimes(0);

    setFunctionTimersEnabled(true);

    expect(c.testOne()).toBe(false);
    expect(consola.withTag("").log).toHaveBeenCalledTimes(1);
    expect(consola.withTag("").log).toHaveBeenLastCalledWith("Test Logger(): 300ms");
    
    dtNowFunc.mockReturnValueOnce(dtNow);
    dtNowFunc.mockReturnValueOnce(dtPlus300);
    expect(c.testTwo(true)).toBe(true);
    expect(consola.withTag("").log).toHaveBeenCalledTimes(2);
    expect(consola.withTag("").log).toHaveBeenLastCalledWith("Test Logger with arguments shown(true): 300ms");

    dtNowFunc.mockReturnValueOnce(dtNow);
    dtNowFunc.mockReturnValueOnce(dtPlus300);
    expect(c.testThree(true)).toBe(true);
    expect(consola.withTag("").log).toHaveBeenCalledTimes(3);
    expect(consola.withTag("").log).toHaveBeenLastCalledWith("Test Logger with arguments hidden(...): 300ms");
});