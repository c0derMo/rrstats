import axios from 'axios';
import { recalculate } from './dataHandling/leaderboards';
import  { parse } from "csv-parse";
import {csvParser, ParserConfigOverrides} from "./gDriveIntegration";
import { config } from 'dotenv';
import {RRMatch} from "./models/Match";
config();

type Cache = {
    discordPB: {
        [key: string]: DiscordCache
    },
    newGDrive: {
        [key: string]: GDriveCache
    }
}

type DiscordCache = {
    requestTime?: number;
    avatarID?: string;
    retryIn?: number;
}

type GDriveCache = {
    requestTime: number;
    rawData: string;
    data: RRMatch[];
}

interface DiscordResponse {
    retry_after?: number;
    avatar?: string;
}

const cache: Cache = {
    discordPB: {},
    newGDrive: {}
}

const discordID = process.env.DISCORD_TOKEN;

export async function getDiscordProfilePictureURL(uID: string) {
    if (uID === "" || discordID === undefined) {
        return "/defaultPB.png"
    }

    // Caching check, bcs we dont want to ddos discord
    if (cache.discordPB[uID] !== undefined) {
        // Cache stays for 15 minutes.
        if (Date.now() - cache.discordPB[uID].requestTime < 900000) {
            console.log(`\x1b[34m${new Date().toString()}      Return cached discord response\x1b[0m`)
            return "https://cdn.discordapp.com/avatars/" + uID + "/" + cache.discordPB[uID].avatarID + ".png"
        }
        if (Date.now() - cache.discordPB[uID].retryIn > 0) {
            console.log(`\x1b[33m${new Date().toString()} WARN Hit a 429 in discord previously\x1b[0m`)
            return "/defaultPB.png"
        }
    }
    const req = await axios.get("https://discord.com/api/v9/users/" + uID, { headers: { "Authorization": "Bot " + discordID }, validateStatus: () => { return true } });
    if(req.status === 429) {
        console.log(`\x1b[33m${new Date().toString()} WARN Hit a 429 in discord\x1b[0m`)
        cache.discordPB[uID] = {
            retryIn: Date.now() + ((req.data as DiscordResponse).retry_after * 1000)
        }
    } else if(req.status === 200) {
        cache.discordPB[uID] = {
            requestTime: Date.now(),
            avatarID: (req.data as DiscordResponse).avatar
        }
        console.log(`\x1b[34m${new Date().toString()}      Return discord response\x1b[0m`)
        return "https://cdn.discordapp.com/avatars/" + uID + "/" + cache.discordPB[uID].avatarID + ".png"
    }
    return "/defaultPB.png"
}

export async function getGDriveData(link: string, name: string, config: ParserConfigOverrides = null): Promise<RRMatch[]> {
    //Check for cache, if the link in the cache isn't the same, we need to get something new anyways
    if(cache.newGDrive !== undefined) {
        // Cache stays for 15 minutes.
        if(cache.newGDrive[link] !== undefined && Date.now() - cache.newGDrive[link].requestTime < 900000) {
            console.log(`\x1b[34m${new Date().toString()}      Return cached gdrive response\x1b[0m`)
            return cache.newGDrive[link].data;
        }
    } else {
        cache.newGDrive = {}
    }
    const req = await axios.get(link);
    const parsedCSV = parse(req.data as string);
    const data = await csvParser(parsedCSV, name, config);
    cache.newGDrive[link] = {
        requestTime: Date.now(),
        rawData: (req.data as string),
        data: data
    }
    console.log(`\x1b[34m${new Date().toString()}      Return gdrive response\x1b[0m`)

    // Also, we want to recalculate the leaderboard everytime we get new google data (i think)
    await recalculate(data);
    return data;
}
