import { DataSource, In } from "typeorm";
import { Player } from "../model/Player";
import { CompetitionPlacement } from "../model/Competition";
import MapperService from "../controller/MapperService";
import { DefaultedMap } from "~/utils/DefaultedMap";

interface CompPlacements {
    RR10: number | null;
    RR11: number | null;
    RR12: number | null;
    RRWC2023: number | "gs" | null;
    RR13: number | null;
    RR14: number | null;
    RR15: number | null;
}

type Competitions = keyof CompPlacements;

async function main() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Player, CompetitionPlacement],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const players = await Player.find();
    console.log(`Loaded ${players.length} players.`);
    const playerLookup = MapperService.createStringMapFromList(players, 'uuid', 'primaryName');

    const placementProgression: DefaultedMap<string, CompPlacements> = new DefaultedMap(() => {
        return {
            RR10: null,
            RR11: null,
            RR12: null,
            RRWC2023: null,
            RR13: null,
            RR14: null,
            RR15: null,
        }
    })

    const placements = await CompetitionPlacement.find({ where: {
        competition: In(["RR10", "RR11", "RR12", "RRWC2023", "RR13", "RR14", "RR15"])
    }});
    console.log(`Loaded ${placements.length} placements`);

    for (const placement of placements) {
        const player = playerLookup[placement.player];
        const previousPlacements = placementProgression.get(player);
        previousPlacements[placement.competition as Competitions] = placement.placement ?? null;
        if (placement.competition === "RRWC2023" && placement.placement == null) {
            previousPlacements.RRWC2023 = "gs";
        }
        placementProgression.set(player, previousPlacements);
    }

    for (const [player, placements] of placementProgression.getAll().entries()) {
        let result = player + ";";
        result += (placements.RR10 ?? "") + ";";
        result += (placements.RR11 ?? "") + ";";
        result += (placements.RR12 ?? "") + ";";
        result += (placements.RRWC2023 ?? "") + ";";
        result += (placements.RR13 ?? "") + ";";
        result += (placements.RR14 ?? "") + ";";
        result += (placements.RR15 ?? "");
        console.log(result);
    }

    await dataSource.destroy();
}

void main();