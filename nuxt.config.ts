// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true, timeline: { enabled: true } },
    typescript: {
        shim: false,
        tsConfig: {
            compilerOptions: {
                experimentalDecorators: true,
                strictPropertyInitialization: false,
                module: "ESNext",
                noUncheckedIndexedAccess: false,
            },
        },
        sharedTsConfig: {
            compilerOptions: {
                strictPropertyInitialization: false,
            },
        },
    },
    modules: [
        "@nuxtjs/tailwindcss",
        "@nuxt/eslint",
        "@nuxt/test-utils/module",
        "@nuxt/content",
        "@nuxtjs/robots",
    ],
    components: [{ path: "~/components", pathPrefix: false }],

    runtimeConfig: {
        discordToken: "",
        discordId: "",
        discordSecret: "",
        publicOrigin: "http://localhost:3000",
        database: "rrstats.db",
        databaseType: "sqlite",
        enableFunctionTimings: false,
        enableRouteTimings: false,
        databaseLogging: "",
        discordWebhook: "",
    },

    nitro: {
        plugins: ["~~/server/index.ts", "~~/server/timeApiCalls.ts"],
        esbuild: {
            options: {
                target: "esnext",
                tsconfigRaw: {
                    compilerOptions: {
                        experimentalDecorators: true,
                    },
                },
            },
        },
        alias: {
            consola: "consola",
        },
        typescript: {
            tsConfig: {
                compilerOptions: {
                    target: "esnext",
                    experimentalDecorators: true,
                    strictPropertyInitialization: false,
                    noUncheckedIndexedAccess: false,
                },
            },
        },
    },

    css: ["@fortawesome/fontawesome-svg-core/styles.css", "@/assets/fonts.css"],

    build: {
        transpile: ["@fortawesome/vue-fontawesome"],
    },
    app: {
        head: {
            link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
        },
    },

    site: {
        indexable: false,
    },

    vite: {
        optimizeDeps: {
            include: [
                "@vue/devtools-core",
                "@vue/devtools-kit",
                "@fortawesome/fontawesome-svg-core",
                "@fortawesome/free-brands-svg-icons",
                "@fortawesome/free-solid-svg-icons",
                "@fortawesome/free-regular-svg-icons",
                "luxon",
                "lodash",
                "chart.js",
            ],
        },
    },

    compatibilityDate: "2024-08-10",
});
