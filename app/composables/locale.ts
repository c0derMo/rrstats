export const useLocale = () =>
    useState<string>("locale", () => {
        const locale = ref("en-US"); // Fallback value
        if (import.meta.server) {
            const reqLocale =
                useRequestHeaders()["accept-language"]?.split(",")[0];
            if (reqLocale) {
                locale.value = reqLocale;
            }
        } else {
            const navLocale = navigator.language;
            if (navLocale) {
                locale.value = navLocale;
            } else {
                const sysLocale = new Intl.DateTimeFormat().resolvedOptions()
                    .locale;
                if (sysLocale) {
                    locale.value = sysLocale;
                }
            }
        }

        return locale;
    });
