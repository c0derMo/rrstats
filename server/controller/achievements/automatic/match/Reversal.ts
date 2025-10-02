import type { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";

export class Reversal extends AutomaticAchievement<number> {
    name = "Reversal";
    description = ["Win a match with a reverse sweep (at least six points)"];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.MATCH;
    levels = 1;

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        const scoreDelta = Math.abs(
            match.playerOneScore - match.playerTwoScore,
        );
        if (scoreDelta !== 2) {
            return;
        }
        if (match.playerOneScore < 6 && match.playerTwoScore < 6) {
            return;
        }

        const winner =
            match.playerOneScore > match.playerTwoScore
                ? WinningPlayer.PLAYER_ONE
                : WinningPlayer.PLAYER_TWO;

        const firstHalfOfMatches = match.playedMaps.slice(
            0,
            Math.floor(match.playedMaps.length / 2),
        );
        if (
            firstHalfOfMatches.some(
                (m) => m.winner === winner || m.winner === WinningPlayer.DRAW,
            )
        ) {
            return;
        }

        if (winner === WinningPlayer.PLAYER_ONE) {
            playerOneAchievement.achieveIfNotAchieved(
                match.timestamp,
                0,
                true,
                match.uuid,
            );
        } else if (winner === WinningPlayer.PLAYER_TWO) {
            playerTwoAchievement.achieveIfNotAchieved(
                match.timestamp,
                0,
                true,
                match.uuid,
            );
        }
    }
}
