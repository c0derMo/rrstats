// @ts-ignore
const fs = require('fs/promises');
const { setJSONPath } = require("./utils");

let configs = {}

const _loadConfigs = async () => {
    const generalConfig = await fs.readFile(__dirname + "/data/config.json", "utf8");
    const generalConfigJSON = JSON.parse(generalConfig);
    configs["general"] = generalConfigJSON;

    await configs["general"].competitions.forEach(async(element) => {
        const competition = await fs.readFile(__dirname + "/data/" + element + ".json", "utf8");
        const competitionJSON = JSON.parse(competition);
        configs[element] = competitionJSON;
    });

    const playerDatabase = await fs.readFile(__dirname + "/data/playerDatabase.json", "utf8");
    const playerDatabaseJSON = JSON.parse(playerDatabase);
    configs["playerDB"] = playerDatabaseJSON;
}

const _getStoredMatches = (playername) => {
    let matches = []

    configs["general"].competitions.forEach(element => {
        matches = matches.concat(configs[element].filter(e => {
            return (e.player1.replace(" [C]", "").replace(" [PC]", "").replace(" [PS]", "").replace(" [XB]", "") == playername || e.player2.replace(" [C]", "").replace(" [PC]", "").replace(" [PS]", "").replace(" [XB]", "") == playername);
        }));
    });

    return matches;
}

const _getNewestCompetitionData = () => {
    return {
        name: configs["general"].currentCompetition.name,
        link: 'https://spreadsheets.google.com/feeds/cells/' + configs["general"].currentCompetition.sheetID + '/' + configs["general"].currentCompetition.tabID + '/public/values?alt=json-in-script'
    }
}

const _getPlayerAbreviationOverride = (abreviation) => {
    if(configs["general"].playerAbreviationsOverrides[abreviation] !== undefined) {
        return configs["general"].playerAbreviationsOverrides[abreviation]
    }
    return ""
}

const _getPlayerInfo = (player) => {
    if(configs["playerDB"][player] !== undefined) {
        return configs["playerDB"][player]
    }
    return {
        discordId: "",
        title: "",
        competitions: []
    }
}

const _getAllPlayers = () => {
    let a = [];
    Object.keys(configs["playerDB"]).forEach(e => {
        a.push({title: e});
    });
    return a;
}

const _getStoredCompetition = (comp) => {
    if(configs["general"].competitions.includes(comp)) {
        return configs[comp];
    }
    return [];
}

const _patchStoredComptition = async (comp, changes) => {
    if(configs["general"].competitions.includes(comp)) {
        Object.keys(changes).forEach(c => {
            setJSONPath(configs[comp], c, changes[c]);
        })

        await fs.writeFile(__dirname + "/data/" + comp + ".json", JSON.stringify(configs[comp]), 'utf8');
        return true
    }
    return false
}

module.exports = {
    getNewestCompetitionData: _getNewestCompetitionData,
    getStoredMatches: _getStoredMatches,
    loadConfigs: _loadConfigs,
    getPlayerAbreviationOverride: _getPlayerAbreviationOverride,
    getPlayerInfo: _getPlayerInfo,
    getAllPlayers: _getAllPlayers,
    getStoredCompetition: _getStoredCompetition,
    patchStoredComptition: _patchStoredComptition
}