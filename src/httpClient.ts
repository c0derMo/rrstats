// @ts-expect-error
const axios = require('axios');

const cache = {
    "discordPB": {},
    "gDrive": {}
}

const discordID = "***REMOVED***";

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

module.exports = {
    getDiscordProfilePictureURL: _getDiscordProfilePictureURL
}