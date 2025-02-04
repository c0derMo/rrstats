export interface AchievementInfo {
    name: string;
    description: string[];
    tier: AchievementTier[];
    manual?: boolean;
    category: string;
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
