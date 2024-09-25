import type { H3Event } from "h3";
import FunctionTimer from "~/utils/FunctionTimer";

export default defineNitroPlugin(async (nitroApp) => {
    const timers = new Map<H3Event, FunctionTimer>();

    if (useRuntimeConfig().enableRouteTimings) {
        nitroApp.hooks.addHooks({
            request(event: H3Event) {
                if (event.path.startsWith("/api/")) {
                    const timer = new FunctionTimer(
                        event.toString().split("?")[0],
                    );
                    timers.set(event, timer);
                }
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
