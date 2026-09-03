export const useNavigatorInfo = () => {
    const navInfo = useState<{
        players?: Pick<IPlayer, "primaryName">[];
        competitions?: Pick<
            ICompetition,
            | "backgroundImage"
            | "name"
            | "officialCompetition"
            | "tag"
            | "startingTimestamp"
        >[];
        playerLeaderboards?: LeaderboardTableDefinition[];
        countryLeaderboards?: LeaderboardTableDefinition[];
        mapLeaderboards?: LeaderboardTableDefinition[];
    }>("navigator", () => ({}));

    async function fetchLeaderboards() {
        const leaderboards =
            (await $fetch<LeaderboardTableDefinition[]>(
                "/api/leaderboards/list",
            )) ?? [];

        navInfo.value.playerLeaderboards = leaderboards.filter(
            (lb) => lb.category === "player",
        );
        navInfo.value.countryLeaderboards = leaderboards.filter(
            (lb) => lb.category === "country",
        );
        navInfo.value.mapLeaderboards = leaderboards.filter(
            (lb) => lb.category === "map",
        );
    }

    const getPlayers = async () => {
        if (navInfo.value.players == null) {
            const players = (await $fetch("/api/player/list")) ?? [];
            navInfo.value.players = players;
        }
        return navInfo.value.players;
    };

    const getCompetitions = async () => {
        if (navInfo.value.competitions == null) {
            const competitions = (await $fetch("/api/competitions/list")) ?? [];
            navInfo.value.competitions = competitions;
        }
        return navInfo.value.competitions;
    };

    const getPlayerLeaderboards = async () => {
        if (navInfo.value.playerLeaderboards == null) {
            await fetchLeaderboards();
        }
        return navInfo.value.playerLeaderboards!;
    };

    const getCountryLeaderboards = async () => {
        if (navInfo.value.countryLeaderboards == null) {
            await fetchLeaderboards();
        }
        return navInfo.value.countryLeaderboards!;
    };

    const getMapLeaderboards = async () => {
        if (navInfo.value.mapLeaderboards == null) {
            await fetchLeaderboards();
        }
        return navInfo.value.mapLeaderboards!;
    };

    return {
        getPlayers,
        getCompetitions,
        getPlayerLeaderboards,
        getCountryLeaderboards,
        getMapLeaderboards,
    };
};
