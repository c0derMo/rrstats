import { getGDriveData, getDiscordProfilePictureURL } from '../httpClient';
import { RRCompetitionModel } from '../models/Competitions';
import { RRMatchModel } from '../models/Match';
import { RRPlayerModel } from '../models/Player';

export async function getAllPlayers(): Promise<object[]> {
    let players = await RRPlayerModel.find({ excludedFromSearch: { $ne: true } }).exec();
    return players.map(el => { return {title: el.primaryName} });
}

export async function getPlayer(name: string): Promise<object> {
    let playerInfo = await RRPlayerModel.findOne({ primaryName: name }).exec();
    let title = playerInfo?.title || "";
    let playerNames = playerInfo?.secondaryNames?.concat(name) || [name];
    
    let matches = await RRMatchModel.find({ $or: [ {player1: { $in: playerNames }}, {player2: { $in: playerNames}} ] }).exec();
    if(title === "" && matches.length > 0) {
        title = "Returning Rival";
    } else if(title === "") {
        title = "Roulette Rookie";
    }

    const newestCompData = await RRCompetitionModel.find({ updateWithSheet: true }).exec();
    for(let e of newestCompData) {
        const newestData = await getGDriveData("https://docs.google.com/spreadsheets/d/" + e.sheetId + "/gviz/tq?tqx=out:json&sheet=" + e.tabName, e.tag);
        matches = matches.concat(newestData.filter(e => {
            return (playerNames.includes(e.player1) || playerNames.includes(e.player2));
        }));
    }

    matches = matches.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    const competitions = await RRCompetitionModel.find({"placements.playerId": playerInfo._id}, { name: true, placements: { $elemMatch: { playerId: playerInfo._id } } }).exec();

    return {
        avatar: await getDiscordProfilePictureURL(playerInfo?.discordId || ""),
        name: name,
        title: title,
        competitions: competitions,
        matches: matches,
        customTitle: playerInfo?.customTitle || false
    }
}