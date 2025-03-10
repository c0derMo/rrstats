import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { MapRecord } from "~/server/model/Record";

export class ForTheRecord extends AutomaticAchievement<number> {
    name = "For the Record";
    description = ["Achieve a map record"];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.TIME;
    levels = 1;

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        const playerOneRecord = await MapRecord.findOneBy({
            player: match.playerOne,
        });
        const playerTwoRecord = await MapRecord.findOneBy({
            player: match.playerOne,
        });
        if (playerOneRecord != null) {
            playerOneAchievement.achieveIfNotAchieved(
                playerOneRecord.timestamp,
                0,
                true,
            );
        }
        if (playerTwoRecord != null) {
            playerTwoAchievement.achieveIfNotAchieved(
                playerTwoRecord.timestamp,
                0,
                true,
            );
        }
    }

    public async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<number>>,
    ) {
        for (const player in achievements) {
            achievements[player].data = this.getDefaultData();
            achievements[player].achievedAt.fill(0);
            achievements[player].progression.fill(0);
        }

        const allRecords = await MapRecord.find({
            order: {
                timestamp: "ASC",
            },
        });
        const allRecordHolders = new Set(
            allRecords.map((record) => record.player),
        );

        for (const holder of allRecordHolders) {
            const firstRecord = allRecords.find(
                (record) => record.player === holder,
            );
            achievements[holder].achieveIfNotAchieved(
                firstRecord!.timestamp,
                0,
                true,
            );
        }
    }
}
