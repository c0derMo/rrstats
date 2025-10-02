export const usePlayers = () => {
    const players = useState<{
        players: Record<string, string>;
        lookedUpAll: boolean;
    }>("players", () => ({ players: {}, lookedUpAll: false }));

    const inversePlayers = useState<Record<string, string>>(
        "inversePlayers",
        () => ({}),
    );

    const queryPlayers = async (uuids: string[]) => {
        if (players.value.lookedUpAll) {
            return;
        }

        let toQuery: string[] = [];
        for (const player of uuids) {
            if (
                players.value.players[player] == null &&
                !toQuery.includes(player)
            ) {
                toQuery.push(player);
            }
        }

        if (toQuery.length > 50) {
            const otherQuery = toQuery.slice(50);
            toQuery = toQuery.slice(0, 50);
            await queryPlayers(otherQuery);
        }

        if (toQuery.length <= 0) {
            return;
        }

        const lookupRequest = await $fetch("/api/player/lookup", {
            query: { players: toQuery },
        });
        for (const uuid in lookupRequest) {
            players.value.players[uuid] = lookupRequest[uuid];
            inversePlayers.value[lookupRequest[uuid]] = uuid;
        }
    };

    const queryAll = async () => {
        if (players.value.lookedUpAll === true) {
            return;
        }
        const lookupRequest = await $fetch("/api/player/lookup");
        players.value.players = lookupRequest;
        players.value.lookedUpAll = true;
        for (const player in players.value.players) {
            inversePlayers.value[players.value.players[player]] = player;
        }
    };

    const get = <K = string>(uuid: string, defaultValue?: K): string | K => {
        if (players.value.players[uuid] == null) {
            if (defaultValue == null) {
                return `Unknown player: ${uuid}`;
            } else {
                return defaultValue;
            }
        }
        return players.value.players[uuid];
    };

    const getUUID = (player: string, defaultValue?: string) => {
        return inversePlayers.value[player] ?? defaultValue;
    };

    const queryAndGet = async (uuids: string[]) => {
        await queryPlayers(uuids);
        return uuids.map((uuid) => get(uuid));
    };

    const queryFromMatches = async (matches: IMatch[]) => {
        const players = matches
            .map((match) => [match.playerOne, match.playerTwo])
            .reduce((prev, cur) => [...prev, ...cur], []);
        await queryPlayers(players);
    };

    return {
        queryPlayers,
        queryAll,
        get,
        getUUID,
        queryAndGet,
        queryFromMatches,
    };
};
