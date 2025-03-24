import type { ICompetition } from "~/utils/interfaces/ICompetition";
import type { IPlayer } from "~/utils/interfaces/IPlayer";
import type { StatisticData } from "~/utils/interfaces/StatisticData";

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
        playerLeaderboards?: StatisticData<"player">[];
        countryLeaderboards?: StatisticData<"country">[];
        mapLeaderboards?: StatisticData<"map">[];
    }>("navigator", () => ({}));

    async function fetchLeaderboards() {
        const leaderboards = (await $fetch("/api/leaderboards/list")) ?? {
            map: [],
            player: [],
            country: [],
        };
        navInfo.value.playerLeaderboards = leaderboards.player;
        navInfo.value.countryLeaderboards = leaderboards.country;
        navInfo.value.mapLeaderboards = leaderboards.map;
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
