import { Duration } from "luxon";

export function formatPlacement(placement?: number): string {
    if (placement == null) {
        return "GS";
    }
    if (placement % 10 === 1) {
        return `${placement}st`;
    }
    if (placement % 10 === 2) {
        return `${placement}nd`;
    }
    if (placement % 10 === 2) {
        return `${placement}rd`;
    }
    return `${placement}th`;
}

export function secondsToTime(seconds: number): string {
    const duration = Duration.fromObject({ seconds: seconds });
    if (duration.as("hours") >= 1) {
        return duration.toFormat("hh:mm:ss");
    } else {
        return duration.toFormat("mm:ss");
    }
}
