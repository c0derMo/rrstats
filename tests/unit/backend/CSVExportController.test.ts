import { expect, test, describe, beforeAll, afterAll } from "vitest";
import CSVExportController from "~/server/controller/CSVExportController";
import DatabaseConnector from "~/server/controller/DatabaseConnnector";
import type { Stringifier } from "csv-stringify";
import { Settings } from "luxon";

let database: DatabaseConnector;

describe("CSVExportController", () => {
    beforeAll(async () => {
        database = new DatabaseConnector(
            "sqlite",
            "./tests/test_db_post_2024.db",
            false,
        );
        await database.initialize();

        Settings.defaultZone = "Europe/Berlin";
    });
    afterAll(async () => {
        await database.destroy();
    });

    test("exportPlayerMatches", async () => {
        const playersCSV = await CSVExportController.exportPlayersMatches("b3793b1b-3ace-4dee-a678-5168f40abbb9");

        const csvLines = await stringifierToLinesArray(playersCSV);

        expect(csvLines.length).toBe(62);

        expect(csvLines[0]).toBe("competition,platform,datetime,round,playerOne,playerOneScore,playerTwo,playerTwoScore,ban0Map,ban0By,ban1Map,ban1By,ban2Map,ban2By,map0Map,map0Winner,map0PickedBy,map0Time,map1Map,map1Winner,map1PickedBy,map1Time,map2Map,map2Winner,map2PickedBy,map2Time,map3Map,map3Winner,map3PickedBy,map3Time,map4Map,map4Winner,map4PickedBy,map4Time,map5Map,map5Winner,map5PickedBy,map5Time");
        expect(csvLines[1]).toBe("RRWC2024,,2024-11-14T20:00:00+01:00,Round 1,TheTimeCube,9,CurryMaker,1,SGA,TheTimeCube,AMB,CurryMaker,,,DAR,TheTimeCube,TheTimeCube,287,HAV,TheTimeCube,CurryMaker,321,NY,Draw,TheTimeCube,142,HOK,TheTimeCube,CurryMaker,279,COL,TheTimeCube,RNG,493,,,,")
        expect(csvLines[2]).toBe("RRWC2024,,2024-11-09T15:00:00+01:00,Group H,Max Masters,0,CurryMaker,6,,,,,,,MIA,CurryMaker,Max Masters,466,WC,CurryMaker,CurryMaker,649,CHO,CurryMaker,RNG,384,,,,,,,,,,,,");
        expect(csvLines[60]).toBe("RR4,PC,2021-02-20T21:00:00+01:00,Round 2,CurryMaker,3,<roulette_player>,1,,,,,,,CHO,Draw,CurryMaker,3600,DUB,CurryMaker,<roulette_player>,2450,,,,,,,,,,,,,,,,");
    });

    test("exportCompetitionMatches - Single Competition", async () => {
        const compCSV = await CSVExportController.exportCompetitionMatches(["RRWC2024"]);

        const csvLines = await stringifierToLinesArray(compCSV);

        expect(csvLines.length).toBe(246);
        expect(csvLines[0]).toBe("competition,datetime,round,playerOne,playerOneScore,playerTwo,playerTwoScore,ban0Map,ban0By,ban1Map,ban1By,ban2Map,ban2By,ban3Map,ban3By,map0Map,map0Winner,map0PickedBy,map0Time,map1Map,map1Winner,map1PickedBy,map1Time,map2Map,map2Winner,map2PickedBy,map2Time,map3Map,map3Winner,map3PickedBy,map3Time,map4Map,map4Winner,map4PickedBy,map4Time,map5Map,map5Winner,map5PickedBy,map5Time,map6Map,map6Winner,map6PickedBy,map6Time,map7Map,map7Winner,map7PickedBy,map7Time,map8Map,map8Winner,map8PickedBy,map8Time,map9Map,map9Winner,map9PickedBy,map9Time");
        expect(csvLines[1]).toBe("RRWC2024,2024-12-08T19:00:00+01:00,Grand Final,Scruffy,14,Music Inc,6,MUM,Scruffy,PAR,Music Inc,MEN,Scruffy,BKK,Music Inc,NY,Scruffy,Scruffy,158,DUB,Scruffy,Music Inc,139,BER,Scruffy,Scruffy,441,SF,Scruffy,Music Inc,962,CHO,Music Inc,Scruffy,204,HAV,Scruffy,Music Inc,385,AMB,Scruffy,Scruffy,221,SGA,Music Inc,Music Inc,259,SAP,Music Inc,Scruffy,252,COL,Scruffy,Music Inc,378");
        expect(csvLines[2]).toBe("RRWC2024,2024-12-07T19:00:00+01:00,3rd Place Playoff,In4Fun,4,The Rieper 47,8,BER,In4Fun,DAR,The Rieper 47,,,,,DUB,The Rieper 47,In4Fun,169,SAP,In4Fun,The Rieper 47,326,CHO,In4Fun,In4Fun,164,COL,The Rieper 47,The Rieper 47,419,HOK,The Rieper 47,RNG,526,AMB,The Rieper 47,RNG,297,,,,,,,,,,,,,,,,");
        expect(csvLines[244]).toBe("RRWC2024,2024-10-18T12:30:00+02:00,Group B,graory,6,Harmaa.-,0,,,,,,,,,MAR,graory,Harmaa.-,368,CHO,graory,graory,986,SGA,graory,RNG,468,,,,,,,,,,,,,,,,,,,,,,,,,,,,");
    });

    test("exportCompetitionMatches - Multiple Competitions", async () => {
        const compCSV = await CSVExportController.exportCompetitionMatches(["RR4", "RR5"]);

        const csvLines = await stringifierToLinesArray(compCSV);

        expect(csvLines.length).toBe(227);
        expect(csvLines[0]).toBe("competition,platform,datetime,round,playerOne,playerOneScore,playerTwo,playerTwoScore,ban0Map,ban0By,ban1Map,ban1By,ban2Map,ban2By,ban3Map,ban3By,ban4Map,ban4By,ban5Map,ban5By,map0Map,map0Winner,map0PickedBy,map0Time,map1Map,map1Winner,map1PickedBy,map1Time,map2Map,map2Winner,map2PickedBy,map2Time,map3Map,map3Winner,map3PickedBy,map3Time,map4Map,map4Winner,map4PickedBy,map4Time,map5Map,map5Winner,map5PickedBy,map5Time");
        expect(csvLines[1]).toBe("RR5,Console,2021-06-06T22:00:00+02:00,Grand Final,Speedster,4,Ducker,8,BER,Speedster,SF,Ducker,DUB,Speedster,NY,Ducker,MIA,Speedster,CHO,Ducker,COL,Speedster,Speedster,1970,SAP,Speedster,Ducker,782,MUM,Ducker,Speedster,1080,MEN,Ducker,Ducker,551,HOK,Ducker,Speedster,539,HAV,Ducker,Ducker,915");
        expect(csvLines[2]).toBe("RR5,PC,2021-06-06T19:00:00+02:00,Grand Final,In4Fun,4,Yannini,8,HOK,In4Fun,NY,Yannini,BER,In4Fun,DAR,Yannini,MEN,In4Fun,MIA,Yannini,WC,Yannini,In4Fun,363,DUB,In4Fun,Yannini,312,BKK,Yannini,In4Fun,501,SAP,In4Fun,Yannini,1433,SGA,Yannini,In4Fun,610,COL,Yannini,Yannini,1336");
        expect(csvLines[120]).toBe("RR5,Console,2021-05-14T17:00:00+02:00,Round 1,JoeTheBabyGrabber,4,Ashton00122,2,COL,JoeTheBabyGrabber,SF,Ashton00122,,,,,,,,,MAR,JoeTheBabyGrabber,JoeTheBabyGrabber,856,DUB,Ashton00122,Ashton00122,421,WC,JoeTheBabyGrabber,RNG,661,,,,,,,,,,,,");
        expect(csvLines[121]).toBe("RR4,Console,2021-03-07T18:30:00+01:00,Grand Final,Ducker,6,Phanium,2,,,,,,,,,,,,,MEN,Ducker,Ducker,618,BER,Phanium,Phanium,652,CHO,Ducker,RNG,830,DAR,Ducker,RNG,184,,,,,,,,");
        expect(csvLines[225]).toBe("RR4,PC,2021-02-19T19:30:00+01:00,Round 1,ChrisX3,4,Krugermeiier,0,,,,,,,,,,,,,MEN,ChrisX3,ChrisX3,1022,DUB,ChrisX3,Krugermeiier,1341,,,,,,,,,,,,,,,,");
    });
});

async function stringifierToLinesArray(stringifier: Stringifier): Promise<string[]> {
    let result: string = "";
    for await (const row of stringifier) {
        result += row;
    }
    return result.split("\n");
}