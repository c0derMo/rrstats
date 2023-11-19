// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true, timeline: { enabled: true } },
    typescript: { shim: false },
    modules: ["@nuxtjs/tailwindcss"],
    components: [{ path: "~/components", pathPrefix: false }],
    runtimeConfig: {
        discordToken: "",
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
});
