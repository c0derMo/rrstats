import GDriveObjectToMatchlist from '../gDriveIntegration';
import { getGDriveData, getDiscordProfilePictureURL } from '../httpClient';
import { RRMatchModel } from '../models/Match';
import { RRPlayerModel } from '../models/Player';
import { getNewestCompetitionMetadata } from './config';

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

    const currentCompMetadata = getNewestCompetitionMetadata();
    if(currentCompMetadata.name !== "") {
        const currentDoc = await getGDriveData("https://docs.google.com/spreadsheets/d/" + currentCompMetadata.sheetID + "/gviz/tq?tqx=out:json&sheet=" + currentCompMetadata.tabName, currentCompMetadata.name);
        const currentData = await GDriveObjectToMatchlist(JSON.parse(currentDoc.substring(47, currentDoc.length-2)), currentCompMetadata.name);

        matches = matches.concat(currentData.filter(e => {
            return (e.player1 == name || e.player2 == name);
        }));
    }

    matches = matches.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    return {
        avatar: await getDiscordProfilePictureURL(playerInfo?.discordId || ""),
        name: name,
        title: title,
        competitions: playerInfo?.competitions || [],
        matches: matches,
        customTitle: playerInfo?.customTitle || []
    }
}