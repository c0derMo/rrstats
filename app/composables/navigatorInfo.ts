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
        leaderboards?: LeaderboardTableDefinition[];
        // playerLeaderboards?: StatisticData<"player">[];
        // countryLeaderboards?: StatisticData<"country">[];
        // mapLeaderboards?: StatisticData<"map">[];
    }>("navigator", () => ({}));

    async function fetchLeaderboards() {
        const leaderboards = (await $fetch("/api/leaderboards/list")) ?? [];
        navInfo.value.leaderboards = leaderboards;
        // navInfo.value.playerLeaderboards = leaderboards.player;
        // navInfo.value.countryLeaderboards = leaderboards.country;
        // navInfo.value.mapLeaderboards = leaderboards.map;
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
        if (navInfo.value.leaderboards == null) {
            await fetchLeaderboards();
        }
        return navInfo.value.leaderboards!;
    };

    const getCountryLeaderboards = async () => {
        if (navInfo.value.leaderboards == null) {
            await fetchLeaderboards();
        }
        return navInfo.value.leaderboards!;
    };

    const getMapLeaderboards = async () => {
        if (navInfo.value.leaderboards == null) {
            await fetchLeaderboards();
        }
        return navInfo.value.leaderboards!;
    };

    return {
        getPlayers,
        getCompetitions,
        getPlayerLeaderboards,
        getCountryLeaderboards,
        getMapLeaderboards,
    };
};
