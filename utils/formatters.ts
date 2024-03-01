import { Duration } from "luxon";

export function formatPlacement(placement?: number): string {
    if (placement == null) {
        return "GS";
    }
    if (placement % 10 === 1 && placement !== 11) {
        return `${placement}st`;
    }
    if (placement % 10 === 2 && placement !== 12) {
        return `${placement}nd`;
    }
    if (placement % 10 === 3 && placement !== 13) {
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

export function getPlacementTagColor(placement: number) {
    if (placement === 1) {
        return "rgb(214, 175, 54)";
    }
    if (placement === 2) {
        return "rgb(167, 167, 167)";
    }
    if (placement === 3) {
        return "rgb(167, 112, 68)";
    }
    return "rgb(85, 85, 85)";
}
