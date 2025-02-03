import { DateTime } from "luxon";

interface DebounceInvalidationOptions {
    checkInterval?: number;
    maxWait?: number;
    inactivityWait?: number;
}

export class DebouncedInvalidationFunction {
    private readonly funcToCall: () => unknown;
    private readonly checkInterval: number;
    private readonly maxWait: number;
    private readonly inactivityWait: number;

    private invalidationTimer: NodeJS.Timeout | null = null;
    private timerStart: number;
    private lastCall: number;
    private isRunning: boolean;

    constructor(
        funcToCall: () => unknown,
        options?: DebounceInvalidationOptions,
    ) {
        this.funcToCall = funcToCall;
        this.checkInterval = options?.checkInterval ?? 50;
        this.maxWait = options?.maxWait ?? 1000;
        this.inactivityWait = options?.inactivityWait ?? 100;
    }

    call() {
        if (this.isRunning) {
            return;
        }
        this.lastCall = DateTime.now().toMillis();
        if (this.invalidationTimer == null) {
            this.timerStart = DateTime.now().toMillis();
            this.invalidationTimer = setInterval(
                () => this.checkRoutine(),
                this.checkInterval,
            );
        }
    }

    private checkRoutine() {
        const startDiff = Math.abs(this.timerStart - DateTime.now().toMillis());
        const lastCallDiff = Math.abs(
            this.lastCall - DateTime.now().toMillis(),
        );
        if (startDiff > this.maxWait || lastCallDiff > this.inactivityWait) {
            void this.runFunction();
            clearInterval(this.invalidationTimer!);
            this.invalidationTimer = null;
        }
    }

    private async runFunction() {
        this.isRunning = true;
        try {
            await this.funcToCall();
        } finally {
            this.isRunning = false;
        }
    }
}
