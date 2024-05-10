export default defineNuxtRouteMiddleware(async () => {
    const user = await useFetch("/api/auth/user");

    if (user.status.value !== "success" || user.data.value == null) {
        return navigateTo("/api/auth/discord_login", { external: true });
    }
});
