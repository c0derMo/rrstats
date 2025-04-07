type HashNavigationFunction = (hash: string[]) => Promise<void> | void;

export const useHash = (func: HashNavigationFunction) => {
    const route = useRoute();
    const hasherData = useState("hash", () => {
        return {
            ignoreNext: false,
            lastClicked: "",
        };
    });

    onMounted(async () => {
        if (route.hash === "") {
            return;
        }
        await func(route.hash.split("."));
        await navigateTo({ hash: "" });
    });

    watch(
        () => route.hash,
        async () => {
            if (route.hash === "") {
                return;
            }
            if (hasherData.value.ignoreNext) {
                hasherData.value.ignoreNext = false;
                return;
            }
            await func(route.hash.split("."));
            await navigateTo({ hash: "" });
        },
    );

    return (hash: string, immediate: boolean = false) => {
        if (!hash.startsWith("#")) {
            console.error(
                `Trying to set hash that doesnt start with #, aborting (${hash})`,
            );
            return;
        }
        if (hasherData.value.lastClicked === hash || immediate) {
            hasherData.value.ignoreNext = true;
            navigateTo({ hash: hash });
        } else {
            hasherData.value.lastClicked = hash;
        }
    };
};
