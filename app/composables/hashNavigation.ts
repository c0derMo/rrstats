type HashNavigationFunction = (hash: string[]) => Promise<void> | void;

export const useHash = (func: HashNavigationFunction) => {
    const route = useRoute();
    const router = useRouter();
    const hasherData = useState("hash", () => {
        return {
            lastClicked: "",
        };
    });

    onMounted(async () => {
        if (route.hash === "") {
            return;
        }
        await func(route.hash.split("."));
        await navigateTo({ ...route, hash: "" }, { replace: true });
    });
    
    const removeHandler = router.afterEach(async (to, from) => {
        if (to.path === from.path) {
            return;
        }
        await func(to.hash.split("."));
        await navigateTo({ ...to, hash: "" }, { replace: true });
    });

    onBeforeUnmount(() => {
        removeHandler();
    })

    return (hash: string, immediate: boolean = false): void => {
        if (!hash.startsWith("#")) {
            console.error(
                `Trying to set hash that doesnt start with #, aborting (${hash})`,
            );
            return;
        }
        if (hasherData.value.lastClicked === hash || immediate) {
            window.location.hash = hash;
            navigateTo({ ...route, hash: hash }, { replace: true });
        } else {
            hasherData.value.lastClicked = hash;
        }
    };
};
