import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import { HitmanMap } from "~/utils/mapUtils";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

const USA_MAPS = [
    HitmanMap.COLORADO,
    HitmanMap.MIAMI,
    HitmanMap.WHITTLETON_CREEK,
    HitmanMap.NEW_YORK,
];

export class LandOfTheFree extends AutomaticAchievement<number> {
    name = "Land of the Free";
    description = ["Play three maps from the USA in the same match"];
    tier = [AchievementTier.SILVER];
    category = AchievementCategory.MAP_SPECIFIC;
    levels = 1;

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        const played_usa_maps = new Set(
            match.playedMaps.filter(
                (map) => !map.forfeit && USA_MAPS.includes(map.map),
            ),
        );

        if (played_usa_maps.size >= 3) {
            playerOneAchievement.achieveIfNotAchieved(
                match.timestamp,
                0,
                true,
                match.uuid,
            );
            playerTwoAchievement.achieveIfNotAchieved(
                match.timestamp,
                0,
                true,
                match.uuid,
            );
        }
    }
}
