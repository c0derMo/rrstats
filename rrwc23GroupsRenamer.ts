import "reflect-metadata";
import { DataSource } from "typeorm";
import { Match } from "./server/model/Match";

const groupConfig = [
    {
        groupName: "Group A",
        advancingPlayers: 4,
        players: [
            "58a21881-628e-4f73-9cea-7a4d59c622ed",
            "18d07250-38e1-4399-8819-c127b8eb814d",
            "677c2c4a-ad5d-4fe1-bf5b-a438224a6c48",
            "e041dd82-55ad-4ed8-bef6-1bdf098d3eaa",
            "4b187e11-58a9-4e3d-b807-aacf301cf683",
            "3da6c709-d691-4736-b241-b58955ff4db7",
            "9acbf219-f422-41ce-ba9d-51b034e4ba70",
        ],
        positionOverrides: {
            "0": "58a21881-628e-4f73-9cea-7a4d59c622ed",
            "1": "18d07250-38e1-4399-8819-c127b8eb814d",
            "2": "677c2c4a-ad5d-4fe1-bf5b-a438224a6c48",
            "3": "e041dd82-55ad-4ed8-bef6-1bdf098d3eaa",
            "4": "4b187e11-58a9-4e3d-b807-aacf301cf683",
            "5": "3da6c709-d691-4736-b241-b58955ff4db7",
            "6": "9acbf219-f422-41ce-ba9d-51b034e4ba70",
        },
    },
    {
        groupName: "Group B",
        advancingPlayers: 4,
        players: [
            "382f3619-14c0-41fc-9ea8-c6cf05a29238",
            "41c41b94-a28a-415a-b665-7bd804fb9e01",
            "b8aec6d8-b0f7-437a-9d84-678ba3407631",
            "6a6e3179-8d13-482f-9673-8e14086696cc",
            "5d4b6a9e-3535-4e5b-a945-d18bfab91c1b",
            "ca3888af-e255-45e7-b310-8fe6cc35b80d",
        ],
        positionOverrides: {
            "0": "382f3619-14c0-41fc-9ea8-c6cf05a29238",
            "1": "41c41b94-a28a-415a-b665-7bd804fb9e01",
            "2": "b8aec6d8-b0f7-437a-9d84-678ba3407631",
            "3": "6a6e3179-8d13-482f-9673-8e14086696cc",
            "4": "5d4b6a9e-3535-4e5b-a945-d18bfab91c1b",
            "5": "ca3888af-e255-45e7-b310-8fe6cc35b80d",
        },
    },
    {
        groupName: "Group C",
        advancingPlayers: 4,
        players: [
            "3635261a-1fc0-4719-ba2f-2eb53025349d",
            "ba251e72-bf80-49e6-b2d2-e3a30912858c",
            "b3793b1b-3ace-4dee-a678-5168f40abbb9",
            "53288b2b-c542-4473-8cfb-6a59c4cda0ee",
            "3b5642e7-b25d-4c2f-b9d9-e575972891b0",
            "65de6cd3-2c62-43ca-8483-a6a3a7935b85",
            "ea751792-7065-4f51-badc-1f6d7339b647",
        ],
        positionOverrides: {
            "0": "3635261a-1fc0-4719-ba2f-2eb53025349d",
            "1": "ba251e72-bf80-49e6-b2d2-e3a30912858c",
            "2": "b3793b1b-3ace-4dee-a678-5168f40abbb9",
            "3": "53288b2b-c542-4473-8cfb-6a59c4cda0ee",
            "4": "3b5642e7-b25d-4c2f-b9d9-e575972891b0",
            "5": "65de6cd3-2c62-43ca-8483-a6a3a7935b85",
            "6": "ea751792-7065-4f51-badc-1f6d7339b647",
        },
    },
    {
        groupName: "Group D",
        advancingPlayers: 4,
        players: [
            "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7",
            "a0eccd64-36d1-4a02-8c1b-89262d444162",
            "609ece29-9e14-429c-a89d-9c5165dabaef",
            "7e42ae17-1fb9-4ecc-88d0-3106c1c32174",
            "933fd187-ab97-440e-9e2d-06b8a6c4b2cc",
            "575f9f9e-c95b-4332-b033-153cfc13dc08",
            "1a26f2a9-27b2-441c-a870-e1fb9e54b4b1",
        ],
        positionOverrides: {
            "0": "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7",
            "1": "a0eccd64-36d1-4a02-8c1b-89262d444162",
            "2": "609ece29-9e14-429c-a89d-9c5165dabaef",
            "3": "7e42ae17-1fb9-4ecc-88d0-3106c1c32174",
            "4": "933fd187-ab97-440e-9e2d-06b8a6c4b2cc",
            "5": "575f9f9e-c95b-4332-b033-153cfc13dc08",
            "6": "1a26f2a9-27b2-441c-a870-e1fb9e54b4b1",
        },
    },
    {
        groupName: "Group E",
        advancingPlayers: 4,
        players: [
            "46e78891-8a1d-45ce-a048-95a12a9db772",
            "c0c2fd18-61a3-4002-96d0-27a157af3626",
            "19443c78-a672-4800-9753-72d1b7fae537",
            "e1f828ca-92a8-4ce5-9616-017ec8221063",
            "a9e213ab-7662-4800-8fa2-70a6276d1ca5",
            "dee75cff-5ef2-41c2-8a96-7a0c57a61926",
            "18bcbe47-3f19-4d3e-abdf-24ee1e2f416d",
        ],
        positionOverrides: {},
    },
    {
        groupName: "Group F",
        advancingPlayers: 4,
        players: [
            "f17914b8-7265-4ae8-9612-3960ad007e7d",
            "cc0a1608-cd6a-4cc0-8636-60efef408772",
            "d746db0e-1000-421a-bf80-63b89ff28d22",
            "a35ae23d-c4b2-4e96-bfa2-ad050530699c",
            "548dc153-2748-46f7-aca5-fb97c44a6fdd",
            "8c94df72-1871-4b99-b76e-e9c8f1015154",
        ],
        positionOverrides: {},
    },
    {
        groupName: "Group G",
        advancingPlayers: 4,
        players: [
            "3d01bc25-7a1a-4111-b480-0486d0948649",
            "874cf8b0-19ce-44e4-8d3c-7e38786cd5d7",
            "bb036b60-fad1-41ea-8527-13ab1c8f1df3",
            "7e4fb8bb-3431-4a16-b3dc-bad875a9bd95",
            "44f7f3f5-06e5-4d1a-84e3-052363303aeb",
            "a18b6c0c-ab63-4a26-b004-9b831cce05c0",
            "4b0a4324-d379-4147-9563-da6a8bd38fde",
            "543ea429-4889-421e-ae2d-936d0bbd9a8c",
        ],
        positionOverrides: {},
    },
    {
        groupName: "Group H",
        advancingPlayers: 4,
        players: [
            "5e11e928-efee-4b6a-8687-1a38cbb2268e",
            "cc613517-4f0d-4a18-aa7e-4fd56c12cc26",
            "f9465792-0675-4245-a2ee-a2cacc7218cb",
            "af9ee04e-7361-4015-8f43-a54434bf5467",
            "fd8838b5-3b31-49c9-820e-cb697c0d4a77",
            "10184852-c650-4a0b-8aa7-1cb0cbb3875f",
            "29d98843-04bf-4eba-807f-36b39f33f630",
            "4e28ba02-8a22-4235-a2ae-8a01765dc1f7",
        ],
        positionOverrides: {
            "0": "5e11e928-efee-4b6a-8687-1a38cbb2268e",
            "1": "cc613517-4f0d-4a18-aa7e-4fd56c12cc26",
            "2": "f9465792-0675-4245-a2ee-a2cacc7218cb",
            "3": "af9ee04e-7361-4015-8f43-a54434bf5467",
            "4": "fd8838b5-3b31-49c9-820e-cb697c0d4a77",
            "5": "10184852-c650-4a0b-8aa7-1cb0cbb3875f",
            "6": "29d98843-04bf-4eba-807f-36b39f33f630",
            "7": "4e28ba02-8a22-4235-a2ae-8a01765dc1f7",
        },
    },
];

async function main() {
    const db = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Match],
    });

    await db.initialize();
    console.log("Connected to db.");

    const matchupsDone: string[][] = [];

    const matches = await Match.find({
        where: { competition: "RRWC2023" },
        order: { timestamp: "ASC" },
    });

    for (const match of matches) {
        let matchDone = false;
        for (const doneMatchup of matchupsDone) {
            if (
                doneMatchup.includes(match.playerOne) &&
                doneMatchup.includes(match.playerTwo)
            ) {
                matchDone = true;
                break;
            }
        }
        if (matchDone) continue;

        let groupName = "";
        for (const group of groupConfig) {
            if (
                group.players.includes(match.playerOne) &&
                group.players.includes(match.playerTwo)
            ) {
                groupName = group.groupName;
                break;
            }
        }
        if (groupName === "") continue;

        match.round = groupName;
        console.log("Renamed a match");
        await match.save();
        matchupsDone.push([match.playerOne, match.playerTwo]);
    }
}

async function main2() {
    const db = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Match],
    });

    await db.initialize();
    console.log("Connected to db.");

    const matchupsDone: string[][] = [];

    const matches = await Match.find({
        where: { competition: "RRWC2023" },
        order: { timestamp: "ASC" },
    });

    for (const match of matches) {
        if (!match.round.includes("Round")) continue;

        const splittedRound = match.round.split(" ");
        const number = parseInt(splittedRound.pop() as string);
        match.round = splittedRound.join(" ") + " " + (number - 1);
        await match.save();
    }
}

await main2();
