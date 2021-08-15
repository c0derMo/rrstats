const axios = require('axios');
require('dotenv').config();
import { recalculateRankings } from './dataManager';
import gDriveToMatchlist from './gDriveIntegration';

const cache = {
    discordPB: {},
    gDrive: {
        link: "",
        requestTime: 0,
        data: ""
    }
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

const getGDriveData = async (link, name) => {
    //Check for cache, if the link in the cache isn't the same, we need to get something new anyways
    if(cache.gDrive !== undefined) {
        // Cache stays for 15 minutes.
        if(cache.gDrive.link === link && Date.now() - cache.gDrive.requestTime < 900000) {
            console.log(`\x1b[34m${new Date()}      Return cached gdrive response\x1b[0m`)
            return cache.gDrive.data;
        }
    }
    const req = await axios.get(link);
    cache.gDrive.link = link;
    cache.gDrive.requestTime = Date.now();
    cache.gDrive.data = req.data;
    console.log(`\x1b[34m${new Date()}      Return gdrive response\x1b[0m`)

    // Also, we want to recalculate the leaderboard everytime we get new google data (i think)
    await recalculateRankings(name, gDriveToMatchlist(JSON.parse(req.data.substring(28, req.data.length-2)), name));
    return req.data;
}

export { getGDriveData };
export { getDiscordProfilePictureURL };