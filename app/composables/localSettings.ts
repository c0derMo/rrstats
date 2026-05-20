export enum SpoilerSettings {
    SHOW_ALL = "none",
    HIDE_LAST_DAY = "last_day",
    HIDE_LAST_WEEK = "last_week",
    HIDE_ALL = "all",
}

class LocalSettings {
    readonly darkMode = ref(true);
    readonly spoilerMode = ref(SpoilerSettings.HIDE_LAST_DAY);
    private readonly consented = ref(false);
    private isInitialized = ref(false);
    private consentRequesters = ref<(() => unknown)[]>([]);
    private currentlyPatching = ref<Set<string>>(new Set());

    constructor() {
        watch(this.darkMode, (newValue, oldValue) => {
            this.writeOrRequestConsent(
                this.darkMode,
                "darkMode",
                oldValue,
                newValue,
            );
        });

        watch(this.spoilerMode, (newValue, oldValue) => {
            this.writeOrRequestConsent(
                this.spoilerMode,
                "spoilerMode",
                oldValue,
                newValue,
            );
        });
    }

    private writeOrRequestConsent(
        ref: Ref<T>,
        key: string,
        oldValue: T,
        newValue: T,
    ) {
        if (!this.isInitialized.value) {
            return;
        }
        if (this.currentlyPatching.value.has(key)) {
            this.currentlyPatching.value.delete(key);
            return;
        }

        this.currentlyPatching.value.add(key);
        if (this.hasConsented()) {
            ref.value = newValue;
            this.write();
        } else {
            this.requestConsent();
            nextTick(() => {
                ref.value = oldValue;
            });
        }
    }

    private readValueOrDefaultAndTransform<T>(
        key: string,
        defaultValue: T,
        transform: (val: string) => T,
    ): T {
        if (!this.hasConsented()) {
            return defaultValue;
        }
        const realValue = window.localStorage.getItem(key);
        if (realValue == null) {
            return defaultValue;
        }
        return transform(realValue);
    }

    private readValueOrDefault(key: string, defaultValue: string): string {
        if (!this.hasConsented()) {
            return defaultValue;
        }
        const realValue = window.localStorage.getItem(key);
        if (realValue == null) {
            return defaultValue;
        }
        return realValue;
    }

    read() {
        this.consented.value =
            window.localStorage.getItem("consent") === "consented";

        this.darkMode.value = this.readValueOrDefaultAndTransform(
            "theme",
            window.matchMedia("(prefers-color-scheme: dark)").matches,
            (val) => val === "dark",
        );
        this.spoilerMode.value = this.readValueOrDefaultAndTransform(
            "spoiler",
            SpoilerSettings.HIDE_LAST_DAY,
            (val) =>
                Object.values(SpoilerSettings).includes(val as SpoilerSettings)
                    ? val
                    : SpoilerSettings.HIDE_LAST_DAY,
        ) as SpoilerSettings;

        nextTick(() => {
            this.isInitialized.value = true;
        });
    }

    hasConsented() {
        return this.consented.value;
    }

    requestConsent() {
        for (const cb of this.consentRequesters.value) {
            cb();
        }
    }

    write() {
        const consented = this.hasConsented();
        if (!consented) {
            return;
        }

        window.localStorage.setItem(
            "theme",
            this.darkMode.value ? "dark" : "light",
        );
        window.localStorage.setItem("spoiler", this.spoilerMode.value);
    }

    setConsent(val: boolean) {
        this.consented.value = val;
        if (val) {
            window.localStorage.setItem("consent", "consented");
        } else {
            window.localStorage.removeItem("consent");
        }
    }

    registerConsentRequester(callback: () => unknown) {
        this.consentRequesters.value.push(callback);
    }

    initialized(): boolean {
        return this.isInitialized.value;
    }
}

export const localSettings = new LocalSettings();
