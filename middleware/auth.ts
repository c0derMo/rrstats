export default defineNuxtRouteMiddleware(async () => {
    if (import.meta.server) return;

    try {
        const user = await $fetch("/api/auth/user");

        if (!user) {
            return navigateTo("/api/auth/discord_login", { external: true });
        }
    } catch (error) {
        return navigateTo("/api/auth/discord_login", { external: true });
    }
});
