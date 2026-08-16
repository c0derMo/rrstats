export class StreakCounter {
    private allStreaks: number[];
    private currentStreakLength: number;
    private longestStreak: number;

    constructor() {
        this.currentStreakLength = 0;
        this.longestStreak = 0;
        this.allStreaks = [];
    }

    public increaseStreak() {
        this.currentStreakLength += 1;
    }

    public resetStreak() {
        this.allStreaks.push(this.currentStreakLength);
        if (this.currentStreakLength > this.longestStreak) {
            this.longestStreak = this.currentStreakLength;
        }
        this.currentStreakLength = 0;
    }

    public getLongestStreak(): number {
        return Math.max(this.currentStreakLength, this.longestStreak);
    }

    public getAllStreaks(): number[] {
        return [...this.allStreaks, this.currentStreakLength];
    }
}
