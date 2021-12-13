const fs = require('fs/promises');

let generalConfig:any = {};

export async function loadConfig(): Promise<void> {
    const generalConfigRaw = await fs.readFile(__dirname + "/../config.json", 'utf-8');
    generalConfig = JSON.parse(generalConfigRaw);
}

export function getNewestCompetitionMetadata(): any {
    return generalConfig.currentCompetition;
}

export function getPlayerAbreviationOverride(abreviation: string): string {
    return generalConfig.playerAbreviationsOverrides[abreviation] || "";
}