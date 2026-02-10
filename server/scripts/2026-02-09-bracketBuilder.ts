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
    } else if (selection === "M") {
        const lastRound = ld.nth(ld.last(bracket.rounds), -2)!;
        if (lastRound.matches.length % 2 !== 0) {
            console.log("Last round has uneven amount of matches. Cancelling");
            return;
        }
        const matchAmount = lastRound.matches.length / 2;
        const previousRoundPrefix = `${stagePrefix}${ld.last(bracket.rounds)!.length}.`;
        const matchPrefix = `${stagePrefix}${ld.last(bracket.rounds)!.length + 1}.`;
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
            roundName: "Inferred Round",
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

async function main() {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const bracket = await buildEliminationBracket(rl);
    await writeFile(
        "./bracket.json",
        JSON.stringify(bracket, null, 4),
        "utf-8",
    );
    rl.close();
}

void main();
