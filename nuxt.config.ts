// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true, timeline: { enabled: true } },
    typescript: { shim: false },
    modules: ["@nuxtjs/tailwindcss", "@nuxt/eslint"],
    components: [{ path: "~/components", pathPrefix: false }],
    runtimeConfig: {
        discordToken: "",
        discordId: "",
        discordSecret: "",
        twitterApiKey: "",
        twitterApiSecret: "",
        twitterAccessToken: "",
        twitterTokenSecret: "",
        publicOrigin: "http://localhost:3000",
        database: "rrstats.db",
    },
    nitro: {
        plugins: ["~/server/index.ts"],
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
});
