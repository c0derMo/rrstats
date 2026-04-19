import { createInterface, type Interface } from "node:readline/promises";
import { writeFile } from "node:fs/promises";
import ld from "lodash";

function printPlayerOnePrompt() {
    console.log("Please enter the first player or");
    console.log("(W)/(L) - winner/loser of previous match");
    console.log("(R) - add new round");
    console.log("(S) - add new stage");
    console.log("(E) - exit and save");
    console.log("(I) - attempt to infer rest of winners bracket");
}

function printPlayerTwoPrompt() {
    console.log("Please enter the second player or");
    console.log("(W)/(L) - winner/loser of previous match");
    console.log("(B) - add a bye");
}

async function parsePlayer(
    player: string,
    rl: Interface,
    rightPlayer: boolean,
) {
    if (player === "W" || player === "L") {
        const round = await rl.question(
            "Please enter the referenced round id: ",
        );
        if (rightPlayer) {
            return {
                playerTwoFrom: { matchId: round, winner: player === "W" },
            };
        } else {
            return {
                playerOneFrom: { matchId: round, winner: player === "W" },
            };
        }
    } else if (player === "B") {
        return { bye: true };
    } else if (rightPlayer) {
        return { playerTwo: player };
    } else {
        return { playerOne: player };
    }
}

function buildDroppingRound(
    bracket: IBracket,
    dropPrefix: string,
    oppoPrefix: string,
    parsedDropOrder: string[],
    stagePrefix: string = "",
) {
    for (const dropMatch of parsedDropOrder) {
        const currentMatchNumber =
            ld.last(ld.last(bracket.rounds))!.matches.length + 1;
        const newRoundId = `${stagePrefix}${ld.last(bracket.rounds)!.length}.${currentMatchNumber}`;
        ld.last(ld.last(bracket.rounds))!.matches.push({
            id: newRoundId,
            playerOneFrom: {
                matchId: `${dropPrefix}${dropMatch}`,
                winner: false,
            },
            playerTwoFrom: {
                matchId: `${oppoPrefix}${currentMatchNumber}`,
                winner: true,
            },
        });
    }
}

function buildMergeRound(bracket: IBracket, stagePrefix: string = "") {
    const lastRound = ld.nth(ld.last(bracket.rounds), -2)!;
    if (lastRound.matches.length % 2 !== 0) {
        console.log("Last round has uneven amount of matches. Cancelling");
        return;
    }
    const matchAmount = lastRound.matches.length / 2;
    const previousRoundPrefix = `${stagePrefix}${ld.last(bracket.rounds)!.length - 1}.`;
    const matchPrefix = `${stagePrefix}${ld.last(bracket.rounds)!.length}.`;
    for (let matchId = 0; matchId < matchAmount; matchId++) {
        ld.last(ld.last(bracket.rounds))!.matches.push({
            id: `${matchPrefix}${matchId + 1}`,
            playerOneFrom: {
                matchId: `${previousRoundPrefix}${matchId * 2 + 1}`,
                winner: true,
            },
            playerTwoFrom: {
                matchId: `${previousRoundPrefix}${matchId * 2 + 2}`,
                winner: true,
            },
        });
    }
}

async function buildSpecialRound(
    bracket: IBracket,
    rl: Interface,
    stagePrefix: string,
) {
    console.log("Choose a round type: ");
    console.log("(D): Drop-Round");
    console.log("(M): Merge-Round");
    console.log("( ): Regular, manual round");
    const selection = await rl.question("> ");
    if (selection === "D") {
        const dropPrefix = await rl.question(
            "MatchID prefix of dropping round (with trailing .): ",
        );
        const oppoPrefix = await rl.question(
            "MatchID prefix of opponents (with trailing .): ",
        );
        const dropOrder = await rl.question(
            "Comma-separated order of dropping match ids:",
        );
        const parsedDropOrder = dropOrder.split(",");
        buildDroppingRound(
            bracket,
            dropPrefix,
            oppoPrefix,
            parsedDropOrder,
            stagePrefix,
        );
    } else if (selection === "M") {
        buildMergeRound(bracket, stagePrefix);
    }
}

function inferWB(bracket: IBracket, stagePrefix: string = "") {
    const lastRound = ld.last(ld.last(bracket.rounds))!;
    if (lastRound.matches.length % 2 !== 0) {
        console.log("Last round has uneven amount of matches. Cancelling");
        return;
    }

    let matchAmount = lastRound.matches.length / 2;
    while (matchAmount > 0) {
        const matchesThisRound: IBracketMatch[] = [];
        const previousRoundPrefix = `${stagePrefix}${ld.last(bracket.rounds)!.length}.`;
        const matchPrefix = `${stagePrefix}${ld.last(bracket.rounds)!.length + 1}.`;
        for (let matchId = 0; matchId < matchAmount; matchId++) {
            matchesThisRound.push({
                id: `${matchPrefix}${matchId + 1}`,
                playerOneFrom: {
                    matchId: `${previousRoundPrefix}${matchId * 2 + 1}`,
                    winner: true,
                },
                playerTwoFrom: {
                    matchId: `${previousRoundPrefix}${matchId * 2 + 2}`,
                    winner: true,
                },
            });
        }
        ld.last(bracket.rounds)!.push({
            roundName: `Round ${ld.last(bracket.rounds)!.length + 1}`,
            matches: matchesThisRound,
        });

        if (matchAmount === 1) {
            matchAmount = 0;
        } else {
            matchAmount /= 2;
        }
    }
}

async function buildEliminationBracket(rl: Interface) {
    const bracket = {
        name: "Building Bracket",
        advancementBracket: false,
        forfeits: {},
        index: 0,
        rounds: [[]],
    } as IBracket;

    console.log("Please enter the id prefix for this stage:");
    let stagePrefix = await rl.question("> ");
    console.log("Please enter the round name for the first round:");
    const roundName = await rl.question("> ");

    bracket.rounds[0].push({
        roundName: roundName,
        matches: [],
    });

    while (true) {
        console.log(
            `Stage ${bracket.rounds.length} - Round ${ld.last(ld.last(bracket.rounds))?.roundName} - Last match ${ld.last(ld.last(ld.last(bracket.rounds))?.matches)?.id ?? "none"}`,
        );
        printPlayerOnePrompt();
        const inA = await rl.question("> ");
        if (inA === "S") {
            console.log("Please enter the id prefix for the next stage:");
            stagePrefix = await rl.question("> ");
            bracket.rounds.push([]);
        }
        if (inA === "R" || inA === "S") {
            console.log("Please enter the round name for the next round:");
            const roundName = await rl.question("> ");
            ld.last(bracket.rounds)!.push({
                roundName: roundName,
                matches: [],
            });
            await buildSpecialRound(bracket, rl, stagePrefix);
            continue;
        } else if (inA === "E") {
            break;
        } else if (inA === "I") {
            inferWB(bracket);
            continue;
        }

        const newRoundId = `${stagePrefix}${ld.last(bracket.rounds)!.length}.${ld.last(ld.last(bracket.rounds))!.matches.length + 1}`;

        const playerA = await parsePlayer(inA, rl, false);

        printPlayerTwoPrompt();
        const inB = await rl.question("> ");
        const playerB = await parsePlayer(inB, rl, true);

        ld.last(ld.last(bracket.rounds))!.matches.push({
            id: newRoundId,
            ...playerA,
            ...playerB,
        });
    }

    return bracket;
}

async function advancedBuildBracket() {
    const wbPlayers: string[] = [
        "Ducker",
        "B",
        "Yannini",
        "Supreme Commander Ike",
        "Rocky",
        "420",
        "Taran",
        "IlikeHitman",
        "T_Nort23",
        "JoeTheBabyGrabber",
        "Foppr",
        "Phanium",
        "KkennyZ",
        "Nezuko Chan",
        "Crewdy",
        "Derek",
        "Booch58",
        "B",
        "Lewis heaney",
        "Speedster",
        "Championeer",
        "volvomodus",
        "ChromeX",
        "Hashashin47",
        "milk",
        "B",
        "TK47",
        "C-Squid",
        "Keepitcool",
        "ItsTheAleeex",
        "The_Buff_Guy",
        "Script",
    ];
    const lbRounds: (number[] | string[] | null)[] | null = [
        ["2.16", "1.2", "2.13", "-1", "2.12", "1.10", "2.10", "1.14", "2.8", "1.18", "2.5", "-1", "2.4", "1.26", "2.2", "1.30"],
        ["2.15", "2.14", "2.11", "2.9", "2.7", "2.6", "2.3", "2.1"],
        ["3.4", "3.3", "3.2", "3.1", "3.8", "3.7", "3.6", "3.5"],
        null,
        ["4.3", "4.4", "4.1", "4.2"],
        null,
        ["5.1", "5.2"],
        null,
        ["6.1"],
    ];

    // const lbDroppers: number[][] | null = [
    //     [1,2,3,4,5,6,7,8],
    //     [4,3,2,1],
    //     [1,2],
    //     [1]
    // ];
    // const lbDroppers: number[][] | null = null;

    const bracket = {
        name: "Building Bracket",
        advancementBracket: false,
        forfeits: {},
        index: 0,
        rounds: [[]],
    } as IBracket;

    // WB
    const r1Matches: IBracketMatch[] = [];
    for (let i = 0; i < wbPlayers.length / 2; i++) {
        const roundId = `1.${i + 1}`;
        const p1 = wbPlayers[i * 2];
        const p2 = wbPlayers[i * 2 + 1];
        const round: IBracketMatch = {
            id: roundId,
        };
        if (p1 === "B") {
            round.bye = true;
        } else {
            round.playerOne = p1;
        }
        if (p2 === "B") {
            round.bye = true;
        } else {
            round.playerTwo = p2;
        }
        r1Matches.push(round);
    }

    bracket.rounds[0].push({
        matches: r1Matches,
        roundName: "Round 1",
    });
    inferWB(bracket, "");

    // LB
    if (lbRounds != null) {
        bracket.rounds.push([]);
        let nextDroppingRound = 1;
        for (const droppingRound of lbRounds) {
            if (bracket.rounds[1].length === 0 && droppingRound != null) {
                // First round, have to do that manually
                const lb1Matches: IBracketMatch[] = [];
                for (let i = 0; i < droppingRound.length / 2; i++) {
                    const roundId = `L1.${i + 1}`;
                    const p1 = droppingRound[i * 2];
                    const p2 = droppingRound[i * 2 + 1];
                    const round: IBracketMatch = {
                        id: roundId,
                    };
                    if (p1 === -1 || p1 === "-1") {
                        round.bye = true;
                    } else if (p1 === "") {
                        round.id = "F" + round.id;
                    } else if (typeof p1 === "string") {
                        round.playerOneFrom = {
                            matchId: p1,
                            winner: false,
                        };
                    } else {
                        round.playerOneFrom = {
                            matchId: `${nextDroppingRound}.${p1}`,
                            winner: false,
                        };
                    }
                    if (p2 === -1 || p2 === "-1") {
                        round.bye = true;
                    } else if (typeof p2 === "string" && p2 !== "") {
                        round.playerTwoFrom = {
                            matchId: p2,
                            winner: false,
                        };
                    } else {
                        round.playerTwoFrom = {
                            matchId: `${nextDroppingRound}.${p2}`,
                            winner: false,
                        };
                    }
                    lb1Matches.push(round);
                }
                bracket.rounds[1].push({
                    roundName: "LB Round 1",
                    matches: lb1Matches,
                });
                nextDroppingRound += 1;
            } else {
                bracket.rounds[1].push({
                    roundName: `LB Round ${bracket.rounds[1].length + 1}`,
                    matches: [],
                });

                if (droppingRound != null) {
                    if (typeof droppingRound[0] === "string") {
                        buildDroppingRound(
                            bracket,
                            "",
                            `L${bracket.rounds[1].length - 1}.`,
                            droppingRound.map((m) => String(m)),
                            "L",
                        );
                    } else {
                        buildDroppingRound(
                            bracket,
                            `${nextDroppingRound}.`,
                            `L${bracket.rounds[1].length - 1}.`,
                            droppingRound.map((m) => String(m)),
                            "L",
                        );
                    }
                    nextDroppingRound += 1;
                } else {
                    buildMergeRound(bracket, "L");
                }
            }
        }

        // GF
        bracket.rounds[0].push({
            roundName: "Grand Final",
            matches: [
                {
                    id: `${bracket.rounds[0].length + 1}.1`,
                    playerOneFrom: {
                        matchId: `${bracket.rounds[0].length}.1`,
                        winner: true,
                    },
                    playerTwoFrom: {
                        matchId: `L${bracket.rounds[1].length}.1`,
                        winner: true,
                    },
                },
            ],
        });

        // Renaming rounds
        bracket.rounds[0][bracket.rounds[0].length - 2].roundName = "WB Final";
        bracket.rounds[1][bracket.rounds[1].length - 1].roundName = "LB Final";
    }

    return bracket;
}

async function main() {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log("(A)dvanced bracket builder, or (S)imple one?");
    const choice = await rl.question("> ");
    let bracket: IBracket;
    if (choice === "A") {
        bracket = await advancedBuildBracket();
    } else if (choice === "S") {
        bracket = await buildEliminationBracket(rl);
    } else {
        return;
    }
    await writeFile(
        "./bracket.json",
        JSON.stringify(bracket, null, 4),
        "utf-8",
    );
    rl.close();
}

void main();
