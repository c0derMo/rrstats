export enum SpoilerSettings {
    SHOW_ALL = "none",
    HIDE_LAST_DAY = "last_day",
    HIDE_LAST_WEEK = "last_week",
    HIDE_ALL = "all",
}

class LocalSettings {
    private _darkMode = ref(true);
    private _spoilerMode = ref(SpoilerSettings.HIDE_LAST_DAY);
    private _listener = ref<(() => unknown)[]>([]);

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
        this._darkMode.value = this.readValueOrDefaultAndTransform(
            "theme",
            window.matchMedia("(prefers-color-scheme: dark)").matches,
            (val) => val === "dark",
        );
        this._spoilerMode.value = this.readValueOrDefault(
            "spoiler",
            SpoilerSettings.HIDE_LAST_DAY,
        ) as SpoilerSettings;
    }

    hasConsented() {
        return window.localStorage.getItem("consent") === "consented";
    }

    requestConsent() {
        for (const cb of this._listener.value) {
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
            this._darkMode.value ? "dark" : "light",
        );
        window.localStorage.setItem("spoiler", this._spoilerMode.value);
    }

    setConsent(val: boolean) {
        if (val) {
            window.localStorage.setItem("consent", "consented");
        } else {
            window.localStorage.removeItem("consent");
        }
    }

    registerWriteCallback(callback: () => unknown) {
        this._listener.value.push(callback);
    }

    get darkMode() {
        return this._darkMode.value;
    }

    set darkMode(value: boolean) {
        if (this.hasConsented()) {
            this._darkMode.value = value;
            this.write();
        } else {
            this.requestConsent();
        }
    }

    get spoilerMode() {
        return this._spoilerMode.value;
    }

    set spoilerMode(value: SpoilerSettings) {
        if (this.hasConsented()) {
            this._spoilerMode.value = value;
            this.write();
        } else {
            this.requestConsent();
        }
    }
}

export const settings = new LocalSettings();
