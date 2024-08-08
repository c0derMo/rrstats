import { DateTime } from "luxon";

export default class FunctionTimer {
    private start: DateTime;
    private name: string;

    constructor(name: string) {
        this.name = name;
        this.start = DateTime.now();
    }

    public finish() {
        const diff = DateTime.now().diff(this.start);
        console.log(`${this.name}: ${diff.toMillis()}ms`);
    }

    public currentDurationMillis(): number {
        const diff = DateTime.now().diff(this.start);
        return diff.toMillis();
    }
}
