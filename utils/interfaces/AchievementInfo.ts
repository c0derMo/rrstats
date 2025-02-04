export interface AchievementInfo {
    name: string;
    description: string[];
    tier: AchievementTier[];
    manual?: boolean;
    category: AchievementCategory;
    levels: number;
    achievedAt: number[];
    progress: number[];
}

export enum AchievementTier {
    BRONZE,
    SILVER,
    GOLD,
    PLATINUM,
}

export enum AchievementCategory {
    EXPERIENCE = "Experience",
    MAP = "Map",
    MAP_SPECIFIC = "Map specific",
    MATCH = "Match",
    MISC = "Misc",
    STREAK = "Streak",
    TIME = "Time",
    TOURNAMENT = "Tournament",
}

export interface SubmittedAchievement {
    player: string;
    achievement: string;
    achievedAt: number[];
    progression: number[];
    verified: boolean;
}
