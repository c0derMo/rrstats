export interface AchievementInfo {
    name: string;
    description: string[];
    tier: AchievementTier[];
    manual?: boolean;
    category: AchievementCategory;
    levels: number;
    manualRequiresVideo?: boolean;
}

export enum AchievementTier {
    BRONZE,
    SILVER,
    GOLD,
    PLATINUM,
}

export enum AchievementCategory {
    EXPERIENCE = "Experience",
    TOURNAMENT = "Tournament",
    MATCH = "Match",
    MAP = "Map",
    MAP_SPECIFIC = "Map-Specific",
    TIME = "Time",
    STREAK = "Streak",
    MISC = "Miscellaneous",
}

export interface SubmittedAchievement {
    player: string;
    achievement: string;
    achievedAt: number[];
    progression: number[];
    progressionString?: string[];
    match?: string[];
    verified: boolean;
}

export type AchievedAchievement = AchievementInfo & SubmittedAchievement;
