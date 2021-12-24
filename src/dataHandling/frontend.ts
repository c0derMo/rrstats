import { getGDriveData, getDiscordProfilePictureURL } from '../httpClient';
import { RRCompetitionModel } from '../models/Competitions';
import { RRMatchModel } from '../models/Match';
import { RRPlayerModel } from '../models/Player';

export async function getAllPlayers(): Promise<string[]> {
    let players = await RRPlayerModel.find({ excludedFromSearch: { $ne: true } }, {name: true}).exec();
    return players.map((e) => {return e.name});
}

export async function getAllCompetitions(): Promise<object[]> {
    let competitions = await RRCompetitionModel.find({}, {tag: true, hitmapsStatsURL: true}).exec();
    return competitions;
}

export async function getPlayer(name: string): Promise<object> {
    let playerInfo = await RRPlayerModel.findOne({ name: name }).exec();
    let title = playerInfo?.title || "";
    
    let matches = await RRMatchModel.find({ $or: [ {player1: name}, {player2: name} ] }).exec();
    if(title === "" && matches.length > 0) {
        title = "Returning Rival";
    } else if(title === "") {
        title = "Roulette Rookie";
    }

    const newestCompData = await RRCompetitionModel.find({ updateWithSheet: true }).exec();
    for(let e of newestCompData) {
        const newestData = await getGDriveData("https://docs.google.com/spreadsheets/d/" + e.sheetId + "/gviz/tq?tqx=out:json&sheet=" + e.tabName, e.tag);
        matches = matches.concat(newestData.filter(e => {
            return e.player1 == name || e.player2 == name;
        }));
    }

    matches = matches.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    let competitions = [];
    if (playerInfo !== null) {
        competitions = await RRCompetitionModel.find({"placements.playerId": playerInfo._id}, { officialCompetition: true, name: true, placements: { $elemMatch: { playerId: playerInfo._id } } }).exec();
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