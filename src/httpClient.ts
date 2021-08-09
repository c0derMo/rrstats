// @ts-expect-error
const axios = require('axios');
require('dotenv').config();

const cache = {
    discordPB: {},
    gDrive: {
        link: "",
        requestTime: 0,
        data: ""
    }
}

const discordID = process.env.DISCORD_TOKEN;

const _getDiscordProfilePictureURL = async (uID) => {
    console.log("Starting DC");

    if (uID === "") {
        return "/defaultPB.png"
    }

    console.log("We dont have an empty ting)")

    // Caching check, bcs we dont want to ddos discord
    if (cache.discordPB[uID] !== undefined) {
        console.log("We have something in the cache")
        // Cache stays for 15 minutes.
        if (Date.now() - cache.discordPB[uID].requestTime < 900000) {
            console.log("Returning cached response")
            return "https://cdn.discordapp.com/avatars/" + uID + "/" + cache.discordPB[uID].avatarID + ".png"
        }
        if (Date.now() - cache.discordPB[uID].retryIn > 0) {
            console.log("Hit a 429 previously")
            return "/defaultPB.png"
        }
    }
    console.log("We dont have something in the cache");
    const req = await axios.get("https://discord.com/api/v9/users/" + uID, { headers: { "Authorization": "Bot " + discordID } }).catch((e) => { console.log(e) });
    console.log("Discord return code: " + req.status);
    if(req.status === 429) {
        console.log("Got a 429");
        cache.discordPB[uID] = {
            retryIn: Date.now() + (req.data.retry_after * 1000)
        }
    } else if(req.status === 200) {
        cache.discordPB[uID] = {
            requestTime: Date.now(),
            avatarID: req.data.avatar
        }
        console.log("Returning valid DC PB")
        return "https://cdn.discordapp.com/avatars/" + uID + "/" + cache.discordPB[uID].avatarID + ".png"
    }
    console.log("Something happened, fallback to default");
    return "/defaultPB.png"
}

const _getGDriveData = async (link) => {
    //Check for cache, if the link in the cache isn't the same, we need to get something new anyways
    if(cache.gDrive !== undefined) {
        // Cache stays for 15 minutes.
        if(cache.gDrive.link === link && Date.now() - cache.gDrive.requestTime < 900000) {
            console.log("Returning cached GDrive");
            return cache.gDrive.data;
        }
    }
    const req = await axios.get(link);
    cache.gDrive.link = link;
    cache.gDrive.requestTime = Date.now();
    cache.gDrive.data = req.data;
    console.log("Returning new GDrive");
    return req.data;
}

module.exports = {
    getDiscordProfilePictureURL: _getDiscordProfilePictureURL,
    getGDriveData: _getGDriveData
}