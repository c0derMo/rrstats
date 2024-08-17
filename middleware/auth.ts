export default defineNuxtRouteMiddleware(async () => {
    try {
        const user = await $fetch("/api/auth/user", {
            headers: useRequestHeaders(),
        });

        if (!user) {
            return navigateTo("/api/auth/discord_login", { external: true });
        }
    } catch (error) {
        return navigateTo("/api/auth/discord_login", { external: true });
    }
});
