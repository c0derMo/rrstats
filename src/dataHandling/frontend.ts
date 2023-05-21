import {IsNull, Not} from 'typeorm';
import { database } from '../databaseManager';
import {getGDriveData, getDiscordProfilePictureURL, getHitmapsTournament} from '../httpClient';
import { RRCompetiton } from '../models/Competitions';
import { RRMatch } from '../models/Match';
import { RRPlayer } from '../models/Player';

export async function getAllPlayers(): Promise<string[]> {
    const players = await database.getRepository(RRPlayer).findBy([{ excludedFromSearch: IsNull() }, { excludedFromSearch: false }]);
    return players.map((e) => { return e.name });
}

export async function getAllCompetitions(): Promise<object[]> {
    return await database.getRepository(RRCompetiton).find({ select: {tag: true, hitmapsStatsURL: true}, order: { sortingIndex: 'DESC' }});
}

export async function getPlayer(name: string): Promise<object> {
    const playerInfo = await database.getRepository(RRPlayer).findOneBy({ name: name });
    let title = playerInfo?.title || "";

    const newestHitmapsData = await database.getRepository(RRCompetiton).find({ where: {hitmapsSlug: Not(IsNull())}, order: { "sortingIndex": "DESC"} });
    for (const e of newestHitmapsData) {
        await getHitmapsTournament(e);
    }

    let matches = await database.getRepository(RRMatch).findBy([ {player1: name}, {player2: name} ]);

    const allComps = await database.getRepository(RRCompetiton).find({ order: { "sortingIndex": "DESC"} });
    const newestComp = allComps[0];
    const matchesPriorNewestComp = await database.getRepository(RRMatch).countBy([ {player1: name, competition: Not(newestComp.tag)}, {player2: name, competition: Not(newestComp.tag)}])
    if(title === "" && matchesPriorNewestComp > 0) {
        title = "Returning Rival";
    } else if(title === "") {
        title = "Roulette Rookie";
    }

    const newestCompData = await database.getRepository(RRCompetiton).find({ where: {updateWithSheet: true}, order: { "sortingIndex": "DESC"} });
    for(const e of newestCompData) {
        const newestData = await getGDriveData(`https://docs.google.com/spreadsheets/d/e/${e.sheetId}/pub?gid=${e.gid}&single=true&output=csv`, e.tag, e.parserOptions);
        matches = matches.concat(newestData.filter(e => {
            return e.player1 === name || e.player2 === name;
        }));
    }

    matches = matches.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    const competitions = [];
    if (playerInfo !== null) {
        const allCompetitions = await database.getRepository(RRCompetiton).find({ order: { "sortingIndex": "DESC" } });
        for (const competition of allCompetitions) {
            const filteredPlacements = competition.placements.filter(a => { return a.playerId === playerInfo.uuid });
            if (filteredPlacements.length > 0) {
                competitions.push({
                    name: competition.name,
                    officialCompetition: competition.officialCompetition,
                    placements: filteredPlacements.map(e => { return { placement: e.placement, bracket: e.bracket } })
                });
            }
        }
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

export async function getMatches(): Promise<RRMatch[]> {
    const newestHitmapsData = await database.getRepository(RRCompetiton).find({ where: {hitmapsSlug: Not(IsNull())}, order: { "sortingIndex": "DESC"} });
    for (const e of newestHitmapsData) {
        await getHitmapsTournament(e);
    }

    const allComps = await database.getRepository(RRCompetiton).find({ order: { "sortingIndex": "DESC"} });
    const newestComp = allComps[0];

    return await database.getRepository(RRMatch).findBy({ competition: newestComp.tag });
}