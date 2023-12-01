export enum HitmanMap {
    PARIS = 0,
    SAPIENZA = 1,
    MARRAKESH = 2,
    BANGKOK = 3,
    COLORADO = 4,
    HOKKAIDO = 5,

    MIAMI = 6,
    SANTA_FORTUNA = 7,
    MUMBAI = 8,
    WHITTLETON_CREEK = 9,
    ISLE_OF_SGAIL = 10,
    NEW_YORK = 11,
    HAVEN_ISLAND = 12,

    DUBAI = 13,
    DARTMOOR = 14,
    BERLIN = 15,
    CHONGQING = 16,
    MENDOZA = 17,
    AMBROSE_ISLAND = 18,
}

export type HitmanMapInfo = {
    abbreviation: string;
    color: string;
    slug: string;
    map: HitmanMap;
    name: string;
    backgroundImage: string;
    season: number;
};

const maps: HitmanMapInfo[] = [
    {
        map: HitmanMap.PARIS,
        abbreviation: "PAR",
        color: "#f76b5f",
        slug: "the-showstopper",
        name: "Paris",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_paris/background.jpg",
        season: 1,
    },
    {
        map: HitmanMap.SAPIENZA,
        abbreviation: "SAP",
        color: "#a1bbee",
        slug: "world-of-tomorrow",
        name: "Sapienza",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_coastaltown/background.jpg",
        season: 1,
    },
    {
        map: HitmanMap.MARRAKESH,
        abbreviation: "MAR",
        color: "#f5d468",
        slug: "a-gilded-cage",
        name: "Marrakesh",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_marrakech/background.jpg",
        season: 1,
    },
    {
        map: HitmanMap.BANGKOK,
        abbreviation: "BKK",
        color: "#dc9fbb",
        slug: "club-27",
        name: "Bangkok",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_bangkok/background.jpg",
        season: 1,
    },
    {
        map: HitmanMap.COLORADO,
        abbreviation: "COL",
        color: "#c5a38b",
        slug: "freedom-fighters",
        name: "Colorado",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_colorado/background.jpg",
        season: 1,
    },
    {
        map: HitmanMap.HOKKAIDO,
        abbreviation: "HOK",
        color: "#96ccc8",
        slug: "situs-inversus",
        name: "Hokkaido",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_hokkaido/background.jpg",
        season: 1,
    },

    {
        map: HitmanMap.MIAMI,
        abbreviation: "MIA",
        color: "#f964ba",
        slug: "finish-line",
        name: "Miami",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_miami/background.jpg",
        season: 2,
    },
    {
        map: HitmanMap.SANTA_FORTUNA,
        abbreviation: "SF",
        color: "#3cbb39",
        slug: "three-headed-serpent",
        name: "Santa Fortuna",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_colombia/background.jpg",
        season: 2,
    },
    {
        map: HitmanMap.MUMBAI,
        abbreviation: "MUM",
        color: "#c1a3ef",
        slug: "chasing-a-ghost",
        name: "Mumbai",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_mumbai/background.jpg",
        season: 2,
    },
    {
        map: HitmanMap.WHITTLETON_CREEK,
        abbreviation: "WC",
        color: "#f8b459",
        slug: "another-life",
        name: "Whittleton Creek",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_northamerica/background.jpg",
        season: 2,
    },
    {
        map: HitmanMap.ISLE_OF_SGAIL,
        abbreviation: "SGA",
        color: "#9e9b9b",
        slug: "ark-society",
        name: "Isle of Sgàil",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_northsea/background.jpg",
        season: 2,
    },
    {
        map: HitmanMap.NEW_YORK,
        abbreviation: "NY",
        color: "#c6a641",
        slug: "golden-handshake",
        name: "New York",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_greedy_raccoon/background.jpg",
        season: 2,
    },
    {
        map: HitmanMap.HAVEN_ISLAND,
        abbreviation: "HAV",
        color: "#48dfcf",
        slug: "the-last-resort",
        name: "Haven Island",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_opulent_stingray/background.jpg",
        season: 2,
    },

    {
        map: HitmanMap.DUBAI,
        abbreviation: "DUB",
        color: "#df9850",
        slug: "on-top-of-the-world",
        name: "Dubai",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_golden/golden_background.jpg",
        season: 3,
    },
    {
        map: HitmanMap.DARTMOOR,
        abbreviation: "DAR",
        color: "#7e91b9",
        slug: "death-in-the-family",
        name: "Dartmoor",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_ancestral/ancestral_background.jpg",
        season: 3,
    },
    {
        map: HitmanMap.BERLIN,
        abbreviation: "BER",
        color: "#9ab995",
        slug: "apex-predator",
        name: "Berlin",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_edgy/edgy_background.jpg",
        season: 3,
    },
    {
        map: HitmanMap.CHONGQING,
        abbreviation: "CHO",
        color: "#e453da",
        slug: "end-of-an-era",
        name: "Chongqing",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_wet/wet_background.jpg",
        season: 3,
    },
    {
        map: HitmanMap.MENDOZA,
        abbreviation: "MEN",
        color: "#c55869",
        slug: "the-farewell",
        name: "Mendoza",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_elegant/elegant_background.jpg",
        season: 3,
    },
    {
        map: HitmanMap.AMBROSE_ISLAND,
        abbreviation: "AMB",
        color: "#70cab2",
        slug: "shadows-in-the-water",
        name: "Ambrose Island",
        backgroundImage:
            "https://media.hitmaps.com/img/hitman3/locations/location_rocky/rocky_background.jpg",
        season: 3,
    },
];

function findByAttribute(
    key: keyof HitmanMapInfo,
    value: unknown,
): HitmanMapInfo | undefined {
    return maps.find((v) => v[key] === value);
}

export const getMap = (map: HitmanMap): HitmanMapInfo | undefined => {
    return findByAttribute("map", map);
};

export const getMapBySlug = (slug: string): HitmanMapInfo | undefined => {
    return findByAttribute("slug", slug);
};

export const getMapByName = (name: string): HitmanMapInfo | undefined => {
    return findByAttribute("name", name);
};

export const getAllMaps = (): HitmanMap[] => {
    return maps.map((m) => m.map);
};

export const getMapsBySeason = (season: number): HitmanMap[] => {
    return maps.filter((m) => m.season === season).map((m) => m.map);
};
