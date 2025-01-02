import { expect, test, describe } from "vitest";

describe("formatters", () => {
    test("formatPlacement", () => {
        expect(formatPlacement(1)).toEqual("1st");
        expect(formatPlacement(11)).toEqual("11th");
        expect(formatPlacement(21)).toEqual("21st");

        expect(formatPlacement(2)).toEqual("2nd");
        expect(formatPlacement(12)).toEqual("12th");
        expect(formatPlacement(22)).toEqual("22nd");

        expect(formatPlacement(3)).toEqual("3rd");
        expect(formatPlacement(13)).toEqual("13th");
        expect(formatPlacement(23)).toEqual("23rd");

        expect(formatPlacement(5)).toEqual("5th");
        expect(formatPlacement(25)).toEqual("25th");

        expect(formatPlacement()).toEqual("GS");
    });

    test("secondsToTime", () => {
        expect(secondsToTime(5)).toEqual("00:05");
        expect(secondsToTime(59)).toEqual("00:59");
        expect(secondsToTime(60)).toEqual("01:00");
        expect(secondsToTime(91)).toEqual("01:31");
        expect(secondsToTime(120)).toEqual("02:00");
        expect(secondsToTime(3540)).toEqual("59:00");
        expect(secondsToTime(3599)).toEqual("59:59");
        expect(secondsToTime(3600)).toEqual("01:00:00");
        expect(secondsToTime(3602)).toEqual("01:00:02");
        expect(secondsToTime(3662)).toEqual("01:01:02");
    });

    test("getPlacementTagColor", () => {
        expect(getPlacementTagColor(1)).toEqual("rgb(214, 175, 54)");
        expect(getPlacementTagColor(2)).toEqual("rgb(167, 167, 167)");
        expect(getPlacementTagColor(3)).toEqual("rgb(167, 112, 68)");
        expect(getPlacementTagColor(4)).toEqual("rgb(85, 85, 85)");
        expect(getPlacementTagColor(5)).toEqual("rgb(85, 85, 85)");
    });
});
