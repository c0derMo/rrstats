const axios = require('axios');
require('dotenv').config();
import { recalculate } from './dataHandling/leaderboards';
import  { parse } from "csv-parse";
import { csvParser } from "./gDriveIntegration";

const cache = {
    discordPB: {},
    newGDrive: {}
}

const discordID = process.env.DISCORD_TOKEN;

const getDiscordProfilePictureURL = async (uID) => {
    if (uID === "") {
        return "/defaultPB.png"
    }

    // Caching check, bcs we dont want to ddos discord
    if (cache.discordPB[uID] !== undefined) {
        // Cache stays for 15 minutes.
        if (Date.now() - cache.discordPB[uID].requestTime < 900000) {
            console.log(`\x1b[34m${new Date()}      Return cached discord response\x1b[0m`)
            return "https://cdn.discordapp.com/avatars/" + uID + "/" + cache.discordPB[uID].avatarID + ".png"
        }
        if (Date.now() - cache.discordPB[uID].retryIn > 0) {
            console.log(`\x1b[33m${new Date()} WARN Hit a 429 in discord previously\x1b[0m`)
            return "/defaultPB.png"
        }
    }
    const req = await axios.get("https://discord.com/api/v9/users/" + uID, { headers: { "Authorization": "Bot " + discordID } }).catch((e) => { console.log(e) });
    if(req.status === 429) {
        console.log(`\x1b[33m${new Date()} WARN Hit a 429 in discord\x1b[0m`)
        cache.discordPB[uID] = {
            retryIn: Date.now() + (req.data.retry_after * 1000)
        }
    } else if(req.status === 200) {
        cache.discordPB[uID] = {
            requestTime: Date.now(),
            avatarID: req.data.avatar
        }
        console.log(`\x1b[34m${new Date()}      Return discord response\x1b[0m`)
        return "https://cdn.discordapp.com/avatars/" + uID + "/" + cache.discordPB[uID].avatarID + ".png"
    }
    return "/defaultPB.png"
}

const getGDriveData = async (link, name, config=null) => {
    //Check for cache, if the link in the cache isn't the same, we need to get something new anyways
    if(cache.newGDrive !== undefined) {
        // Cache stays for 15 minutes.
        if(cache.newGDrive[link] !== undefined && Date.now() - cache.newGDrive[link].requestTime < 900000) {
            console.log(`\x1b[34m${new Date()}      Return cached gdrive response\x1b[0m`)
            return cache.newGDrive[link].data;
        }
    } else {
        cache.newGDrive = {}
    }
    const req = await axios.get(link);
    const parsedCSV = parse(req.data);
    const data = await csvParser(parsedCSV, name, config);
    cache.newGDrive[link] = {
        requestTime: Date.now(),
        rawData: req.data,
        data: data
    }
    console.log(`\x1b[34m${new Date()}      Return gdrive response\x1b[0m`)

    // Also, we want to recalculate the leaderboard everytime we get new google data (i think)
    await recalculate(data);
    return data;
}

export { getGDriveData };
export { getDiscordProfilePictureURL };