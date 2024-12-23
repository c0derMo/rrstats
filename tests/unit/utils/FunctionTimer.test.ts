import { expect, test, vi } from "vitest";
import consola from "consola";

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

async function wait(time: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

test('FunctionTimer', async () => {
    const ft = new FunctionTimer("Testing name");

    await wait(300);
    const currentMs = ft.currentDurationMillis();
    expect(currentMs).toBeGreaterThan(300);
    expect(currentMs).toBeLessThan(450)

    await wait(300);
    ft.finish();
    expect(consola.withTag("").log).toHaveBeenCalledTimes(1);
});