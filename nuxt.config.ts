// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true, timeline: { enabled: true } },
    typescript: { shim: false },
    modules: ["@nuxtjs/tailwindcss", "@sidebase/nuxt-session"],
    components: [{ path: "~/components", pathPrefix: false }],
    runtimeConfig: {
        discordToken: "",
        discordId: "",
        discordSecret: "",
        publicOrigin: "http://localhost:3000",
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
    session: { api: { isEnabled: false }, session: { rolling: true } },
    css: ["@fortawesome/fontawesome-svg-core/styles.css", "@/assets/fonts.css"],
    build: {
        transpile: ["@fortawesome/vue-fontawesome"],
    },
});
