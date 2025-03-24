import type { RouterConfig } from "nuxt/schema";

export default {
    scrollBehavior(_, _2, _3) {
        return false;
    },
} satisfies RouterConfig;
