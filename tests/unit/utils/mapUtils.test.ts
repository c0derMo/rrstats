import { expect, test, describe } from "vitest";

describe("mapUtils", () => {
    test("getMap - Bangkok", () => {
        const map = getMap(HitmanMap.BANGKOK);
        expect(map).toEqual({
            map: HitmanMap.BANGKOK,
            abbreviation: "BKK",
            color: "#dc9fbb",
            slug: "club-27",
            name: "Bangkok",
            backgroundImage:
                "https://media.hitmaps.com/img/hitman3/locations/location_bangkok/background.jpg",
            season: 1,
            targets: [
                {
                    name: "Jordan Cross",
                    tileUrl:
                        "https://media.hitmaps.com/img/hitman3/actors/club27_jordan_cross.jpg",
                },
                {
                    name: "Ken Morgan",
                    tileUrl:
                        "https://media.hitmaps.com/img/hitman3/actors/club27_ken_morgan.jpg",
                },
            ],
        });
    });

    test("getMapBySlug - Colorado", () => {
        const map = getMapBySlug("freedom-fighters");
        expect(map).toEqual({
            map: HitmanMap.COLORADO,
            abbreviation: "COL",
            color: "#c5a38b",
            slug: "freedom-fighters",
            name: "Colorado",
            backgroundImage:
                "https://media.hitmaps.com/img/hitman3/locations/location_colorado/background.jpg",
            season: 1,
            targets: [
                {
                    name: "Sean Rose",
                    tileUrl:
                        "https://media.hitmaps.com/img/hitman3/actors/freedom_fighters_sean_rose.jpg",
                },
                {
                    name: "Penelope Graves",
                    tileUrl:
                        "https://media.hitmaps.com/img/hitman3/actors/freedom_fighters_penelope_graves.jpg",
                },
                {
                    name: "Ezra Berg",
                    tileUrl:
                        "https://media.hitmaps.com/img/hitman3/actors/freedom_fighters_ezra_berg.jpg",
                },
                {
                    name: "Maya Parvati",
                    tileUrl:
                        "https://media.hitmaps.com/img/hitman3/actors/freedom_fighters_maya_parvati.jpg",
                },
            ],
        });
    });

    test("getMapByName - Hokkaido", () => {
        const map = getMapByName("Hokkaido");
        expect(map).toEqual({
            map: HitmanMap.HOKKAIDO,
            abbreviation: "HOK",
            color: "#96ccc8",
            slug: "situs-inversus",
            name: "Hokkaido",
            backgroundImage:
                "https://media.hitmaps.com/img/hitman3/locations/location_hokkaido/background.jpg",
            season: 1,
            targets: [
                {
                    name: "Erich Soders",
                    tileUrl:
                        "https://media.hitmaps.com/img/hitman3/actors/snowcrane_erich_soders_briefing.jpg",
                },
                {
                    name: "Yuki Yamazaki",
                    tileUrl:
                        "https://media.hitmaps.com/img/hitman3/actors/snowcrane_yuki_yamazaki_briefing.jpg",
                },
            ],
        });
    });

    test("getAllMaps", () => {
        const allMaps = getAllMaps();
        expect(allMaps.length).toBe(19);
        expect(allMaps[6]).toBe(HitmanMap.MIAMI);
    });

    test("getMapsBySeason", () => {
        const seasonOne = getMapsBySeason(1);
        expect(seasonOne.length).toBe(6);
        expect(seasonOne).toEqual([
            HitmanMap.PARIS,
            HitmanMap.SAPIENZA,
            HitmanMap.MARRAKESH,
            HitmanMap.BANGKOK,
            HitmanMap.COLORADO,
            HitmanMap.HOKKAIDO,
        ]);
        const seasonTwo = getMapsBySeason(2);
        expect(seasonTwo.length).toBe(8);
        expect(seasonTwo).toEqual([
            HitmanMap.MIAMI,
            HitmanMap.SANTA_FORTUNA,
            HitmanMap.MUMBAI,
            HitmanMap.WHITTLETON_CREEK,
            HitmanMap.AMBROSE_ISLAND,
            HitmanMap.ISLE_OF_SGAIL,
            HitmanMap.NEW_YORK,
            HitmanMap.HAVEN_ISLAND,
        ]);
        const sesaonThree = getMapsBySeason(3);
        expect(sesaonThree.length).toBe(5);
        expect(sesaonThree).toEqual([
            HitmanMap.DUBAI,
            HitmanMap.DARTMOOR,
            HitmanMap.BERLIN,
            HitmanMap.CHONGQING,
            HitmanMap.MENDOZA,
        ]);
    });
});
