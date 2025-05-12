import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import type { Match } from "~/server/model/Match";
import { type Spin, WinningPlayer } from "~/utils/interfaces/IMatch";

const POISONS = ["Injected Poison", "Consumed Poison", "Poison the Stem Cells"];
const ACCIDENTS = [
    "Fire",
    "Drowning",
    "Electrocution",
    "Explosion (Accident)",
    "Fall",
    "Falling Object",
    "Explosive Watch Battery",
    "Explosive on Water Scooter",
];
const FIREARMS = [
    "SMG",
    "Pistol",
    "Sniper Rifle",
    "Assault Rifle",
    "Shotgun",
    "Shoot the Car",
    "Shoot Silvio through the Telescope",
];
const EXPLOSIVE = ["Explosion", "Explosive"];
const IGNORED = ["Robot Arms"];

function getMethodsOfSpin(spin: Spin): string[] {
    return spin.targetConditions.map((target) => target.killMethod.name);
}

function includesAny(options: string[]): (_: string) => boolean {
    return (val) => {
        return options.some((option) => val.includes(option));
    };
}

function includesAnyExact(options: string[]): (_: string) => boolean {
    return (val) => {
        return options.some((option) => val === option);
    };
}

abstract class BaseSpinConditionAchievement extends AutomaticAchievement<boolean> {
    abstract name: string;
    abstract description: string[];
    tier = [AchievementTier.BRONZE];
    category = AchievementCategory.MAP;
    levels = 1;

    abstract doesSpinAchieve(spin: Spin): boolean;

    public getDefaultData(): boolean {
        return false;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<boolean>,
        playerTwoAchievement: Achievement<boolean>,
    ): Promise<void> {
        if (playerOneAchievement.data && playerTwoAchievement.data) {
            return;
        }
        for (const map of match.playedMaps) {
            if (map.spin == null) {
                continue;
            }
            if (!this.doesSpinAchieve(map.spin)) {
                continue;
            }
            if (map.winner === WinningPlayer.PLAYER_ONE) {
                playerOneAchievement.data = true;
                playerOneAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                );
            } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                playerTwoAchievement.data = true;
                playerTwoAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                );
            }
        }
    }
}

export class CuttingEdge extends BaseSpinConditionAchievement {
    name = "Cutting Edge";
    description = ["Win a spin with a melee kill method"];

    doesSpinAchieve(spin: Spin): boolean {
        const methods = getMethodsOfSpin(spin);
        if (methods.every(includesAnyExact(POISONS))) {
            return false;
        }
        if (methods.every(includesAnyExact(ACCIDENTS))) {
            return false;
        }
        if (methods.every(includesAnyExact(IGNORED))) {
            return false;
        }
        if (methods.every(includesAny(FIREARMS))) {
            return false;
        }
        if (methods.every(includesAny(EXPLOSIVE))) {
            return false;
        }
        return true;
    }
}

export class DressedForTheOccasion extends BaseSpinConditionAchievement {
    name = "Dressed for the Occasion";
    description = ["Win a spin with a suit disguise condition"];

    doesSpinAchieve(spin: Spin): boolean {
        return spin.targetConditions
            .map((t) => t.disguise.name)
            .some((v) => v === "Suit");
    }
}

export class Kaboom extends BaseSpinConditionAchievement {
    name = "Kaboom";
    description = ["Win a spin with an explosion kill method"];

    doesSpinAchieve(spin: Spin): boolean {
        return getMethodsOfSpin(spin).some(includesAny(EXPLOSIVE));
    }
}

export class WaitingToHappen extends BaseSpinConditionAchievement {
    name = "Waiting to Happen";
    description = ["Win a spin with an accident kill method"];

    doesSpinAchieve(spin: Spin): boolean {
        return getMethodsOfSpin(spin).some(includesAnyExact(ACCIDENTS));
    }
}

export class RememberNoPacify extends BaseSpinConditionAchievement {
    name = "Remember, No Pacify";
    description = ['Win a spin with the "No Target Pacification" complication'];

    doesSpinAchieve(spin: Spin): boolean {
        return spin.targetConditions
            .map((t) => t.complications)
            .reduce((a, b) => [...a, ...b], [])
            .some((comp) => comp.name === "No Target Pacification");
    }
}

export class WhysItSpicy extends BaseSpinConditionAchievement {
    name = "Why's it Spicy?";
    description = ["Win a spin with a poison kill method"];

    doesSpinAchieve(spin: Spin): boolean {
        return getMethodsOfSpin(spin).some(includesAnyExact(POISONS));
    }
}

export class WorthAShot extends BaseSpinConditionAchievement {
    name = "Worth a Shot";
    description = ["Win a spin with a firearm kill method"];

    doesSpinAchieve(spin: Spin): boolean {
        return getMethodsOfSpin(spin).some(includesAny(FIREARMS));
    }
}

const UNIQUE_DISGUISES = [
    // PAR
    "Helmut Kruger",
    "Sheikh",
    "Vampire Magician",
    // SAP
    "Bohemian",
    "Butler",
    "Cyclist",
    "Dr. Oscar Lafayette",
    "Green Plumber",
    "Mansion Chef",
    "Plague Doctor",
    "Private Detective",
    "Red Plumber",
    "Roberto Vargas",
    "Street Performer",
    // MAR
    "Bodyguard",
    "Cameraman",
    "Consulate Intern",
    "Fortune Teller",
    "Headmaster",
    "Masseur",
    "Prisoner",
    // BKK
    "Abel de Silva",
    "Morgan's Bodyguard",
    "Stalker",
    // COL
    "Milita Cook",
    "Point Man",
    "Scarecrow",
    // HOK
    "Baseball Player",
    "Chief Surgeon",
    "Helicopter Pilot",
    "Hospital Director",
    "Motorcyclist",
    "Ninja",
    "VIP Patient (Amos Dexter)",
    "VIP Patient (Jason Portman)",
    "Yoga Instructor",
    // MIA
    "Aeon Driver",
    "Aeon Mechanic",
    "Blue Seed Driver",
    "Crashed Kronstadt Driver",
    "Florida Man",
    "Kitchen Staff",
    "Kowoon Driver",
    "Moses Lee",
    "Pale Rider",
    "Sheik",
    "Street Musician",
    "Ted Mendez",
    "Thwack Driver",
    // SF
    "Band Member",
    "Barman",
    "Hippie",
    "Hippo Whisperer",
    "Shaman",
    "Submarine Engineer",
    "Tattoo Artist (P-Power)",
    // MUM
    "Barber",
    "Holy Man",
    "Kashmerian",
    "Laundry Foreman",
    "Lead Actor",
    "Painter",
    "Tailor",
    // WC
    "Arkian Robes",
    "BBQ Owner",
    "Exterminator",
    "Gunther Mueller",
    "James Batty",
    "Mailman",
    "Nurse",
    "Plumber",
    "Politician",
    "Politician's Assistant",
    "Real Estate Broker",
    "Sheriff Masterson",
    'Spencer "The Hammer" Green',
    // AMB
    "Hippie",
    // SGA
    "Blake Nathanial",
    "Burial Robes",
    "Butler",
    "Jebediah Block",
    "Master of Ceremonies",
    // NY
    "Bank Robber",
    "Fired Banker",
    "Job Applicant",
    // HAV
    "Boat Captain",
    "Butler",
    "Doctor",
    "Gas Suit",
    "Masseur",
    "Personal Trainer",
    "Snorkel Instructor",
    // DUB
    "Famous Chef",
    "Helicopter Pilot",
    "Kitchen Staff",
    "Skydiving Suit",
    "The Assassin",
    // DAR
    "Lawyer",
    "Photographer",
    "Private Investigator",
    "Undertaker",
    // BER
    "Dealer",
    "Delivery Guy",
    "Florida Man",
    "Rolf Hirschmüller",
    // CHO
    "Perfect Test Subject",
    "The Board Member",
    // MEN
    "Chief Winemaker",
    "Corvo Black",
    "Head of Security",
    "Lawyer",
    "Sommelier",
];

export class OneOfAKind extends BaseSpinConditionAchievement {
    name = "One of a Kind";
    description = ["Win a spin with a unique disguise condition"];

    doesSpinAchieve(spin: Spin): boolean {
        return spin.targetConditions
            .map((t) => t.disguise.name)
            .some(includesAnyExact(UNIQUE_DISGUISES));
    }
}
