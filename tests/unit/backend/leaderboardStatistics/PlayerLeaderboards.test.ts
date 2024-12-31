import { afterAll, beforeAll, test, expect } from "vitest";
import DatabaseConnector from "~/server/controller/DatabaseConnnector";
import LeaderboardController from "~/server/controller/LeaderboardController";

let database: DatabaseConnector;

beforeAll(async () => {
    database = new DatabaseConnector(
        "sqlite",
        "./tests/test_db_post_2024.db",
        false,
    );
    await database.initialize();
    await LeaderboardController.recalculate();
});

afterAll(async () => {
    await database.destroy();
});

test("Average RR Placement", async () => {
    const players = await LeaderboardController.getEntries(
        "Average RR Placement",
    );

    expect(players.length).toBe(217);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["Ibbe"],
        displayScore: "1.0",
        sortingScore: 1,
        secondaryScore: 1,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["David Strong"],
        displayScore: "1.5",
        sortingScore: 1.5,
        secondaryScore: 2,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["DaniButa"],
        displayScore: "2.5",
        sortingScore: 2.5,
        secondaryScore: 6,
    });

    expect(players[216]).toEqual({
        player: playerNamesToUUIDs["virtualDream"],
        displayScore: "48.0",
        sortingScore: 48,
        secondaryScore: 1,
    });
});

test("Elo rating", async () => {
    const players = await LeaderboardController.getEntries("Elo rating");

    expect(players.length).toBe(235);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["Scruffy"],
        displayScore: "1424",
        sortingScore: 1424,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Phanium"],
        displayScore: "1322",
        sortingScore: 1322,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["In4Fun"],
        displayScore: "1300",
        sortingScore: 1300,
    });

    expect(players[234]).toEqual({
        player: playerNamesToUUIDs["Pac"],
        displayScore: "828",
        sortingScore: 828,
    });
});

test("Grand Final Appearances", async () => {
    const players = await LeaderboardController.getEntries(
        "Grand Final Appearances",
    );

    expect(players.length).toBe(27);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["Ducker"],
        displayScore: "6",
        sortingScore: 6,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Phanium"],
        displayScore: "6",
        sortingScore: 6,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["In4Fun"],
        displayScore: "5",
        sortingScore: 5,
    });
    expect(players[3]).toEqual({
        player: playerNamesToUUIDs["Scruffy"],
        displayScore: "5",
        sortingScore: 5,
    });

    expect(players[26]).toEqual({
        player: playerNamesToUUIDs["The Rieper 47"],
        displayScore: "1",
        sortingScore: 1,
    });
});

test("Maps played", async () => {
    const players = await LeaderboardController.getEntries("Maps played");

    expect(players.length).toBe(237);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["In4Fun"],
        displayScore: "444",
        sortingScore: 444,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Frote7"],
        displayScore: "443",
        sortingScore: 443,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["Yannini"],
        displayScore: "442",
        sortingScore: 442,
    });

    expect(players[236]).toEqual({
        player: playerNamesToUUIDs["minecraft legend"],
        displayScore: "0",
        sortingScore: 0,
    });
});

test("Maps won", async () => {
    const players = await LeaderboardController.getEntries("Maps won");

    expect(players.length).toBe(237);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["In4Fun"],
        displayScore: "302",
        sortingScore: 302,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Frote7"],
        displayScore: "281.5",
        sortingScore: 281.5,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["Yannini"],
        displayScore: "280",
        sortingScore: 280,
    });

    expect(players[236]).toEqual({
        player: playerNamesToUUIDs["Los_pepos"],
        displayScore: "0",
        sortingScore: 0,
    });
});

test("Most maps won in a row", async () => {
    const players = await LeaderboardController.getEntries(
        "Most maps won in a row",
    );

    expect(players.length).toBe(159);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["Frote7"],
        displayScore: "28",
        sortingScore: 28,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["In4Fun"],
        displayScore: "26",
        sortingScore: 26,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["Phanium"],
        displayScore: "25",
        sortingScore: 25,
    });

    expect(players[158]).toEqual({
        player: playerNamesToUUIDs["Harmaa.-"],
        displayScore: "2",
        sortingScore: 2,
    });
});

test("Map Winrate", async () => {
    const players = await LeaderboardController.getEntries("Map Winrate");

    expect(players.length).toBe(236);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["sleazeball"],
        displayScore: "100.00%",
        sortingScore: 1,
        secondaryScore: 2,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Tysonfoodsco"],
        displayScore: "75.00%",
        sortingScore: 0.75,
        secondaryScore: 8,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["Dein Nomos"],
        displayScore: "71.82%",
        sortingScore: 0.7181818181818181,
        secondaryScore: 165,
    });

    expect(players[235]).toEqual({
        player: playerNamesToUUIDs["Los_pepos"],
        displayScore: "0.00%",
        sortingScore: 0,
        secondaryScore: 6,
    });
});

test("Matches casted", async () => {
    const players = await LeaderboardController.getEntries("Matches casted");

    expect(players.length).toBe(77);

    expect(players[0]).toEqual({
        player: "GKPunk",
        displayScore: "231",
        sortingScore: 231,
    });
    expect(players[1]).toEqual({
        player: "gordiniroy",
        displayScore: "213",
        sortingScore: 213,
    });
    expect(players[2]).toEqual({
        player: "Jokerj",
        displayScore: "195",
        sortingScore: 195,
    });

    expect(players[76]).toEqual({
        player: "HOUSEN",
        displayScore: "1",
        sortingScore: 1,
    });
});

test("Matches played", async () => {
    const players = await LeaderboardController.getEntries("Matches played");

    expect(players.length).toBe(237);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["Yannini"],
        displayScore: "141",
        sortingScore: 141,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Frote7"],
        displayScore: "138",
        sortingScore: 138,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["In4Fun"],
        displayScore: "124",
        sortingScore: 124,
    });

    expect(players[236]).toEqual({
        player: playerNamesToUUIDs["Dope"],
        displayScore: "0",
        sortingScore: 0,
    });
});

test("Matches won", async () => {
    const players = await LeaderboardController.getEntries("Matches won");

    expect(players.length).toBe(237);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["Frote7"],
        displayScore: "98.5",
        sortingScore: 98.5,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Yannini"],
        displayScore: "98",
        sortingScore: 98,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["In4Fun"],
        displayScore: "96.5",
        sortingScore: 96.5,
    });

    expect(players[236]).toEqual({
        player: playerNamesToUUIDs["gekko"],
        displayScore: "0",
        sortingScore: 0,
    });
});

test("Most matches won in a row", async () => {
    const players = await LeaderboardController.getEntries(
        "Most matches won in a row",
    );

    expect(players.length).toBe(126);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["Ducker"],
        displayScore: "23",
        sortingScore: 23,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["In4Fun"],
        displayScore: "14",
        sortingScore: 14,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["Phanium"],
        displayScore: "14",
        sortingScore: 14,
    });

    expect(players[125]).toEqual({
        player: playerNamesToUUIDs["Dynaso"],
        displayScore: "2",
        sortingScore: 2,
    });
});

test("Reverse sweeps", async () => {
    const players = await LeaderboardController.getEntries("Reverse sweeps");

    expect(players.length).toBe(19);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["Yannini"],
        displayScore: "3",
        sortingScore: 3,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Phanium"],
        displayScore: "3",
        sortingScore: 3,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["Frote7"],
        displayScore: "3",
        sortingScore: 3,
    });

    expect(players[18]).toEqual({
        player: playerNamesToUUIDs["Parapluie"],
        displayScore: "1",
        sortingScore: 1,
    });
});

test("Roulette Rivals Participations", async () => {
    const players = await LeaderboardController.getEntries(
        "Roulette Rivals Participations",
    );

    expect(players.length).toBe(236);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["Ducker"],
        displayScore: "20",
        sortingScore: 20,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Frote7"],
        displayScore: "20",
        sortingScore: 20,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["davidredsox"],
        displayScore: "18",
        sortingScore: 18,
    });

    expect(players[235]).toEqual({
        player: playerNamesToUUIDs["gekko"],
        displayScore: "1",
        sortingScore: 1,
    });
});

test("RRWC Participations", async () => {
    const players = await LeaderboardController.getEntries(
        "RRWC Participations",
    );

    expect(players.length).toBe(145);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["Ducker"],
        displayScore: "5",
        sortingScore: 5,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Frote7"],
        displayScore: "5",
        sortingScore: 5,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["Yannini"],
        displayScore: "5",
        sortingScore: 5,
    });

    expect(players[144]).toEqual({
        player: playerNamesToUUIDs["gekko"],
        displayScore: "1",
        sortingScore: 1,
    });
});

test("Winning streak on a map - all maps", async () => {
    const players = await LeaderboardController.getEntries(
        "Winning streak on a map",
        OptionalMap.NO_MAP,
    );

    expect(players.length).toBe(1048);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["Scruffy"],
        displayScore: "16 (NY)",
        sortingScore: 16,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Ducker"],
        displayScore: "14 (BER)",
        sortingScore: 14,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["Phanium"],
        displayScore: "14 (SAP)",
        sortingScore: 14,
    });

    expect(players[1047]).toEqual({
        player: playerNamesToUUIDs["Alph"],
        displayScore: "2 (DAR)",
        sortingScore: 2,
    });
});

test("Winning streak on a map - Paris", async () => {
    const players = await LeaderboardController.getEntries(
        "Winning streak on a map",
        HitmanMap.PARIS,
    );

    expect(players.length).toBe(65);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["T_Nort23"],
        displayScore: "9",
        sortingScore: 9,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Phanium"],
        displayScore: "7",
        sortingScore: 7,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["Scruffy"],
        displayScore: "7",
        sortingScore: 7,
    });

    expect(players[64]).toEqual({
        player: playerNamesToUUIDs["HOUSEN"],
        displayScore: "2",
        sortingScore: 2,
    });
});

test("Spins played on specific map - Sapienza", async () => {
    const players = await LeaderboardController.getEntries(
        "Spins played on specific map",
        HitmanMap.SAPIENZA,
    );

    expect(players.length).toBe(180);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["Frote7"],
        displayScore: "42",
        sortingScore: 42,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Yannini"],
        displayScore: "35",
        sortingScore: 35,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["Ducker"],
        displayScore: "31",
        sortingScore: 31,
    });

    expect(players[179]).toEqual({
        player: playerNamesToUUIDs["gekko"],
        displayScore: "1",
        sortingScore: 1,
    });
});

test("Winrate on specific map - Marrakesh", async () => {
    const players = await LeaderboardController.getEntries(
        "Winrate on specific map",
        HitmanMap.MARRAKESH,
    );

    expect(players.length).toBe(161);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["pokeredface"],
        displayScore: "100.00%",
        sortingScore: 1,
        secondaryScore: 2,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["ORO"],
        displayScore: "100.00%",
        sortingScore: 1,
        secondaryScore: 1,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["BernardoOne"],
        displayScore: "100.00%",
        sortingScore: 1,
        secondaryScore: 1,
    });

    expect(players[160]).toEqual({
        player: playerNamesToUUIDs["AlexHiller"],
        displayScore: "0.00%",
        sortingScore: 0,
        secondaryScore: 2,
    });
});

test("Sweeps", async () => {
    const players = await LeaderboardController.getEntries("Sweeps");

    expect(players.length).toBe(146);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["Yannini"],
        displayScore: "56",
        sortingScore: 56,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Frote7"],
        displayScore: "54",
        sortingScore: 54,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["In4Fun"],
        displayScore: "54",
        sortingScore: 54,
    });

    expect(players[145]).toEqual({
        player: playerNamesToUUIDs["Dynaso"],
        displayScore: "1",
        sortingScore: 1,
    });
});

test("Sweeps (6+ points)", async () => {
    const players =
        await LeaderboardController.getEntries("Sweeps (6+ points)");

    expect(players.length).toBe(97);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["Phanium"],
        displayScore: "38",
        sortingScore: 38,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["In4Fun"],
        displayScore: "34",
        sortingScore: 34,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["Yannini"],
        displayScore: "30",
        sortingScore: 30,
    });

    expect(players[96]).toEqual({
        player: playerNamesToUUIDs["Dynaso"],
        displayScore: "1",
        sortingScore: 1,
    });
});

test("Winrate", async () => {
    const players = await LeaderboardController.getEntries("Winrate");

    expect(players.length).toBe(235);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["sleazeball"],
        displayScore: "100.00%",
        sortingScore: 1,
        secondaryScore: 1,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Ibbe"],
        displayScore: "85.71%",
        sortingScore: 0.8571428571428571,
        secondaryScore: 7,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["GKPunk"],
        displayScore: "84.62%",
        sortingScore: 0.8461538461538461,
        secondaryScore: 13,
    });

    expect(players[234]).toEqual({
        player: playerNamesToUUIDs["gekko"],
        displayScore: "0.00%",
        sortingScore: 0,
        secondaryScore: 7,
    });
});

test("Winrate on opponent-map-picks", async () => {
    const players = await LeaderboardController.getEntries(
        "Winrate on opponent-map-picks",
    );

    expect(players.length).toBe(235);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["BernardoOne"],
        displayScore: "100.00%",
        sortingScore: 1,
        secondaryScore: 1,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Frisbeehound"],
        displayScore: "100.00%",
        sortingScore: 1,
        secondaryScore: 1,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["Crimson"],
        displayScore: "100.00%",
        sortingScore: 1,
        secondaryScore: 2,
    });

    expect(players[234]).toEqual({
        player: playerNamesToUUIDs["gekko"],
        displayScore: "0.00%",
        sortingScore: 0,
        secondaryScore: 7,
    });
});

test("Winrate on own-map-picks", async () => {
    const players = await LeaderboardController.getEntries(
        "Winrate on own-map-picks",
    );

    expect(players.length).toBe(236);

    expect(players[0]).toEqual({
        player: playerNamesToUUIDs["BernardoOne"],
        displayScore: "100.00%",
        sortingScore: 1,
        secondaryScore: 1,
    });
    expect(players[1]).toEqual({
        player: playerNamesToUUIDs["Scroob"],
        displayScore: "100.00%",
        sortingScore: 1,
        secondaryScore: 1,
    });
    expect(players[2]).toEqual({
        player: playerNamesToUUIDs["Vendetta"],
        displayScore: "100.00%",
        sortingScore: 1,
        secondaryScore: 2,
    });

    expect(players[235]).toEqual({
        player: playerNamesToUUIDs["gekko"],
        displayScore: "0.00%",
        sortingScore: 0,
        secondaryScore: 7,
    });
});

const playerNamesToUUIDs: Record<string, string> = {
    Ibbe: "f93ed1b8-d423-4768-b68b-30ad8e2f9905",
    "David Strong": "52f9a138-8ef0-42df-a214-f077766c9d75",
    DaniButa: "db15be62-f05a-4300-b067-4cbba706f998",
    virtualDream: "33865cf5-bcc5-42e6-ad80-2737cf236aef",
    Scruffy: "382f3619-14c0-41fc-9ea8-c6cf05a29238",
    Phanium: "58a21881-628e-4f73-9cea-7a4d59c622ed",
    In4Fun: "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7",
    Pac: "575f9f9e-c95b-4332-b033-153cfc13dc08",
    Ducker: "e1f828ca-92a8-4ce5-9616-017ec8221063",
    "The Rieper 47": "a0eccd64-36d1-4a02-8c1b-89262d444162",
    Frote7: "5e11e928-efee-4b6a-8687-1a38cbb2268e",
    Yannini: "cc613517-4f0d-4a18-aa7e-4fd56c12cc26",
    "minecraft legend": "def62eaf-1619-4d37-b77a-2885ae97bb34",
    Los_pepos: "b53d767b-5927-40fb-a431-49a95d4b7797",
    "Harmaa.-": "89ebb4c1-ede3-4a41-bf80-c2b94510969a",
    sleazeball: "28542412-14b1-4635-87fc-8e89a1a09a1a",
    Tysonfoodsco: "eb27c4f0-a040-49ab-ba4d-8e29f9184186",
    "Dein Nomos": "874cf8b0-19ce-44e4-8d3c-7e38786cd5d7",
    Dope: "4673dc0e-c502-43c3-8207-c2defcb95605",
    gekko: "05daa459-d687-4a0b-97a8-65f57bfb49d4",
    Dynaso: "040e2cb0-5426-4414-8ca0-37848473b076",
    Parapluie: "756979d8-6990-4f13-9c6a-3d3f3fd87b08",
    davidredsox: "af9ee04e-7361-4015-8f43-a54434bf5467",
    Alph: "e9abc4d9-5aa5-4e3a-a578-db163f5c1caf",
    T_Nort23: "a18b6c0c-ab63-4a26-b004-9b831cce05c0",
    HOUSEN: "808d15b8-2f4e-451e-a567-dff777a61312",
    pokeredface: "fd51227a-3921-432e-a275-5b7876a1ea15",
    ORO: "95398450-c142-4795-a9db-10a93fea13a0",
    BernardoOne: "436e4037-f2a7-4494-a9ad-4a10977ed981",
    AlexHiller: "baf03138-e842-43a3-82ff-dbf3bafbd583",
    GKPunk: "77d7524f-7e13-47df-8659-f46722d1c530",
    Frisbeehound: "28ca1ff9-0937-4fc8-8e91-a5f117829bac",
    Crimson: "618fd579-e8ed-4a0f-85f0-8f9f2a0525e0",
    Scroob: "1b024b85-89ef-4aff-82ce-0da3edab78b9",
    Vendetta: "ecd8930c-763c-47ea-a851-308d8c6ac3c0",
};
