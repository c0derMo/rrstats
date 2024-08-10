import type { H3Event } from "h3";
import FunctionTimer from "~/utils/FunctionTimer";

const enableLogging = false;

export default defineNitroPlugin(async (nitroApp) => {
    const timers = new Map<H3Event, FunctionTimer>();

    if (enableLogging) {
        nitroApp.hooks.addHooks({
            request(event: H3Event) {
                const timer = new FunctionTimer(event.toString());
                timers.set(event, timer);
            },

            beforeResponse(event) {
                if (timers.has(event)) {
                    const timer = timers.get(event)!;
                    timer.finish();
                    timers.delete(event);
                }
            },
        });

        setInterval(
            () => {
                for (const [event, timer] of timers.entries()) {
                    if (timer.currentDurationMillis() > 60 * 1000 * 5) {
                        timers.delete(event);
                    }
                }
            },
            1000 * 60 * 60,
        );
    }
});
