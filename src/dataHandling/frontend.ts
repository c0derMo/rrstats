import { getGDriveData, getDiscordProfilePictureURL } from '../httpClient';
import { RRCompetitionModel } from '../models/Competitions';
import {IRRMatch, RRMatchModel} from '../models/Match';
import { RRPlayerModel } from '../models/Player';
import {Types} from "mongoose";

export async function getAllPlayers(): Promise<string[]> {
    const players = await RRPlayerModel.find({ excludedFromSearch: { $ne: true } }, { name: true }).exec();
    return players.map((e) => { return e.name });
}

export async function getAllCompetitions(): Promise<object[]> {
    const competitions = await RRCompetitionModel.find({}, {tag: true, hitmapsStatsURL: true}).sort("-sortingIndex").exec();
    return competitions;
}

export async function getPlayer(name: string): Promise<object> {
    const playerInfo = await RRPlayerModel.findOne({ name: name }).exec();
    let title = playerInfo?.title || "";

    let matches = await RRMatchModel.find({ $or: [ {player1: name}, {player2: name} ] }).exec() as IRRMatch[];
    if(title === "" && matches.length > 0) {
        title = "Returning Rival";
    } else if(title === "") {
        title = "Roulette Rookie";
    }

    const newestCompData = await RRCompetitionModel.find({ updateWithSheet: true }).sort("-sortingIndex").exec();
    for(const e of newestCompData) {
        const newestData = await getGDriveData(`https://docs.google.com/spreadsheets/d/e/${e.sheetId}/pub?gid=${e.gid}&single=true&output=csv`, e.tag, e.parserOptions);
        matches = matches.concat(newestData.filter(e => {
            return e.player1 == name || e.player2 == name;
        }));
    }

    matches = matches.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    let competitions = [];
    if (playerInfo !== null) {
        competitions = await RRCompetitionModel.aggregate([{$match: {
            'placements.playerId': (playerInfo._id as Types.ObjectId).toString()
        }}, {$sort: {
            sortingIndex: -1
        }}, {$project: {
            placements: {
                $filter: {
                    input: '$placements',
                    as: 'placement',
                    cond: {
                        $eq: [
                            '$$placement.playerId',
                            (playerInfo._id as Types.ObjectId).toString()
                        ]
                    }
                }
            },
            officialCompetition: true,
            name: true
        }}]).exec();
    }

    return {
        avatar: await getDiscordProfilePictureURL(playerInfo?.discordId || ""),
        name: name,
        title: title,
        competitions: competitions,
        matches: matches,
        customTitle: playerInfo?.customTitle || false
    }
}
