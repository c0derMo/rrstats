export interface AchievementInfo {
    name: string;
    description: string[];
    tier: number[];
    manual?: boolean;
    category: string;
    levels: number;
    achievedAt: number[];
    progress: number[];
}
