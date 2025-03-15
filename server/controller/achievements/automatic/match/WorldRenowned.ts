import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { DateTime } from "luxon";
import { Player } from "~/server/model/Player";

export class WorldRenowned extends AutomaticAchievement<string[]> {
    name = "World-Renowned";
    description = ["Win a match against players of 10 different nationalities"];
    tier = [AchievementTier.PLATINUM];
    category = AchievementCategory.MATCH;
    levels = 1;

    nationalityCache: Record<string, string> = {};
    lastCacheClear = 0;

    private async getNationalityOfPlayer(
        playerUUID: string,
    ): Promise<string | null> {
        if (DateTime.now().toMillis() - this.lastCacheClear > 60 * 1000) {
            this.nationalityCache = {};
            this.lastCacheClear = DateTime.now().toMillis();
        }

        if (this.nationalityCache[playerUUID] == null) {
            const player = await Player.findOneBy({
                uuid: playerUUID,
            });
            if (player?.nationality == null) {
                return null;
            }
            this.nationalityCache[playerUUID] = player.nationality;
        }
        return this.nationalityCache[playerUUID];
    }

    public getDefaultData(): string[] {
        return [];
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<string[]>,
        playerTwoAchievement: Achievement<string[]>,
    ): Promise<void> {
        if (match.playerOneScore > match.playerTwoScore) {
            const p2Nationality = await this.getNationalityOfPlayer(
                match.playerTwo,
            );
            if (p2Nationality == null) {
                return;
            }
            if (!playerOneAchievement.data.includes(p2Nationality)) {
                playerOneAchievement.data.push(p2Nationality);
                this.checkCondition(playerTwoAchievement, match.timestamp);
            }
        } else if (match.playerTwoScore > match.playerOneScore) {
            const p1Nationality = await this.getNationalityOfPlayer(
                match.playerOne,
            );
            if (p1Nationality == null) {
                return;
            }
            if (!playerTwoAchievement.data.includes(p1Nationality)) {
                playerTwoAchievement.data.push(p1Nationality);
                this.checkCondition(playerOneAchievement, match.timestamp);
            }
        }
    }

    private checkCondition(
        achievement: Achievement<string[]>,
        timestamp: number,
    ) {
        if (achievement.data.length >= 10) {
            achievement.achieveIfNotAchieved(timestamp);
        }

        achievement.progression = [Math.min(1, achievement.data.length / 10)];
        achievement.progressionString = [`${achievement.data.length} / 10`];
    }
}
