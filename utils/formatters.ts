import { Duration } from "luxon";
import {
    AchievementCategory,
    AchievementTier,
} from "./interfaces/AchievementInfo";

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

export function getColorOfTier(tier: AchievementTier | -1) {
    switch (tier) {
        case AchievementTier.BRONZE:
            return { color: "#ffcfc9" };
        case AchievementTier.SILVER:
            return { color: "#d0d0d0" };
        case AchievementTier.GOLD:
            return { color: "#ffe39c" };
        case AchievementTier.PLATINUM:
            return { color: "#bcfaf2" };
        default:
            return { color: "#4f4f4f" };
    }
}

export function numberToRoman(n: number) {
    switch (n) {
        case 1:
            return "I";
        case 2:
            return "II";
        case 3:
            return "III";
        case 4:
            return "IV";
        case 5:
            return "V";
        case 6:
            return "VI";
        case 7:
            return "VII";
        case 8:
            return "VIII";
        case 9:
            return "IX";
        case 10:
            return "X";
        default:
            return n.toString();
    }
}

export function getColorOfAchievementCategory(
    category: AchievementCategory,
): string {
    switch (category) {
        case AchievementCategory.EXPERIENCE:
            return "#d4edbc";
        case AchievementCategory.MAP:
            return "#ffcfc9";
        case AchievementCategory.MAP_SPECIFIC:
            return "#e6cff2";
        case AchievementCategory.MATCH:
            return "#ffe5a0";
        case AchievementCategory.MISC:
            return "#e6e6e6";
        case AchievementCategory.STREAK:
            return "#c9f3ed";
        case AchievementCategory.TIME:
            return "#c6dbe1";
        case AchievementCategory.TOURNAMENT:
            return "#bfe1f6";
        default:
            return "";
    }
}

export function normalizeName(name: string) {
    return name.toLowerCase().replaceAll(/\W/g, "_");
}
