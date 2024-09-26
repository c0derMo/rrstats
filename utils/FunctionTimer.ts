import { DateTime } from "luxon";
import consola from "consola";

const logger = consola.withTag("rrstats:timings");

let functionTimersEnabled = false;

export default class FunctionTimer {
    private start: DateTime;
    private name: string;

    constructor(name: string) {
        this.name = name;
        this.start = DateTime.now();
    }

    public finish() {
        const diff = DateTime.now().diff(this.start);
        logger.log(`${this.name}: ${diff.toMillis()}ms`);
    }

    public currentDurationMillis(): number {
        const diff = DateTime.now().diff(this.start);
        return diff.toMillis();
    }
}

export function setFunctionTimersEnabled(enabled: boolean) {
    functionTimersEnabled = enabled;
}

export function Log(functionName: string, includeArguments?: boolean) {
    return function (
        target: unknown,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        if (typeof descriptor.value !== "function") {
            throw new Error("Only functions can be decorated with @Log");
        }

        const _method = descriptor.value;

        descriptor.value = async function (...args: unknown[]) {
            if (!functionTimersEnabled) {
                return await _method.apply(this, args);
            }
            let logName = functionName;
            if (includeArguments) {
                logName += `(${args.join(", ")})`;
            } else if (args.length > 0) {
                logName += "(...)";
            } else {
                logName += "()";
            }

            const timer = new FunctionTimer(logName);
            const returnValue = await _method.apply(this, args);
            timer.finish();
            return returnValue;
        };
    };
}
