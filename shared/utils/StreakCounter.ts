export class StreakCounter<T = null> {
    private allStreaks: { length: number; value?: T }[];
    private currentStreakLength: number;
    private currentStreakValue?: T;

    constructor() {
        this.currentStreakLength = 0;
        this.allStreaks = [];
    }

    public increaseStreak(value?: T) {
        this.currentStreakLength += 1;
        if (value != null) {
            this.currentStreakValue = value;
        }
    }

    public resetStreak() {
        if (this.currentStreakLength > 0) {
            this.allStreaks.push({
                length: this.currentStreakLength,
                value: this.currentStreakValue,
            });
        }

        this.currentStreakLength = 0;
        this.currentStreakValue = undefined;
    }

    public getLongestStreak(): number {
        return Math.max(
            this.currentStreakLength,
            ...this.allStreaks.map((streak) => streak.length),
        );
    }

    public getAllStreaks(): { length: number; value?: T }[] {
        return [
            ...this.allStreaks,
            {
                length: this.currentStreakLength,
                value: this.currentStreakValue,
            },
        ];
    }

    public getActiveStreak(): { length: number; value?: T } {
        return {
            length: this.currentStreakLength,
            value: this.currentStreakValue,
        };
    }

    public getFinishedStreaks(): { length: number; value?: T }[] {
        return [...this.allStreaks];
    }
}
