export class StreakCounter {
    private currentStreakLength: number;
    private longestStreak: number;

    constructor() {
        this.currentStreakLength = 0;
        this.longestStreak = 0;
    }

    public increaseStreak() {
        this.currentStreakLength += 1;
    }

    public resetStreak() {
        if (this.currentStreakLength > this.longestStreak) {
            this.longestStreak = this.currentStreakLength;
        }
        this.currentStreakLength = 0;
    }

    public getLongestStreak(): number {
        return Math.max(this.currentStreakLength, this.longestStreak);
    }
}
