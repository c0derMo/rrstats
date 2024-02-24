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
    targets: { name: string; tileUrl: string }[];
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
        targets: [
            { name: "Viktor Novikov", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/showstopper_viktor_novikov.jpg" },
            { name: "Dalia Margolis", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/showstopper_dahlia_margolis.jpg" },
        ],
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
        targets: [
            { name: "Silvio Caruso", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/world_of_tomorrow_silvio_caruso_briefing.jpg" },
            { name: "Francesca de Santis", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/world_of_tomorrow_francesca_de_santis.jpg" },
        ],
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
        targets: [
            { name: "Reza Zaydan", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/tobigforjail_general_zaydan.jpg" },
            { name: "Claus Hugo Strandberg", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/tobigforjail_claus_hugo_stranberg.jpg" },
        ],
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
        targets: [
            { name: "Jordan Cross", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/club27_jordan_cross.jpg" },
            { name: "Ken Morgan", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/club27_ken_morgan.jpg" },
        ],
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
        targets: [
            { name: "Sean Rose", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/freedom_fighters_sean_rose.jpg" },
            { name: "Penelope Graves", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/freedom_fighters_penelope_graves.jpg" },
            { name: "Ezra Berg", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/freedom_fighters_ezra_berg.jpg" },
            { name: "Maya Parvati", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/freedom_fighters_maya_parvati.jpg" },
        ],
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
        targets: [
            { name: "Erich Soders", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/snowcrane_erich_soders_briefing.jpg" },
            { name: "Yuki Yamazaki", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/snowcrane_yuki_yamazaki_briefing.jpg" },
        ],
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
        targets: [
            { name: "Sierra Knox", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/flamingo_sierra_knox.jpg" },
            { name: "Robert Knox", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/flamingo_robert_knox.jpg" },
        ],
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
        targets: [
            { name: "Rico Delgado", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/hippo_rico_delgado.jpg" },
            { name: "Jorge Franco", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/hippo_jorge_franco.jpg" },
            { name: "Andrea Martínez", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/hippo_andrea_martinez.jpg" },
        ],
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
        targets: [
            { name: "Wazir Kale", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/mongoose_wazir_kale_identified.jpg" },
            { name: "Vanya Shah", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/mongoose_vanya_shah.jpg" },
            { name: "Dawood Rangan", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/mongoose_dawood_rangan.jpg" },
        ],
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
        targets: [
            { name: "Janus", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/skunk_janus.jpg" },
            { name: "Nolan Cassidy", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/skunk_nolan_cassidy.jpg" },
        ],
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
        targets: [
            { name: "Zoe Washington", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/magpie_zoe_washington.jpg" },
            { name: "Sophia Washington", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/magpie_serena_washington.jpg" },
        ],
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
        targets: [{ name: "Athena Savalas", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/racoon_athena_savalas.jpg" }],
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
        targets: [
            { name: "Tyson Williams", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/stingray_tyson_williams.jpg" },
            { name: "Steven Bradley", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/stingray_steven_bradley.jpg" },
            { name: "Ljudmila Vetrova", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/stingray_ljudmila_vetrova.jpg" },
        ],
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
        targets: [
            { name: "Carl Ingram", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/golden_carl_ingram.jpg" },
            { name: "Marcus Stuyvesant", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/golden_marcus_stuyvesant.jpg" },
        ],
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
        targets: [{ name: "Alexa Carlisle", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/ancestral_alexa_carlisle.jpg" }],
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
        targets: [
            { name: "ICA Agent #1", tileUrl: "https://media.hitmaps.com/img/hitmaps-roulette/berlin-target.png" },
            { name: "ICA Agent #2", tileUrl: "https://media.hitmaps.com/img/hitmaps-roulette/berlin-target.png" },
            { name: "ICA Agent #3", tileUrl: "https://media.hitmaps.com/img/hitmaps-roulette/berlin-target.png" },
            { name: "ICA Agent #4", tileUrl: "https://media.hitmaps.com/img/hitmaps-roulette/berlin-target.png" },
            { name: "ICA Agent #5", tileUrl: "https://media.hitmaps.com/img/hitmaps-roulette/berlin-target.png" },
        ],
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
        targets: [
            { name: "Hush", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/wet_hush.jpg" },
            { name: "Imogen Royce", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/wet_imogen_royce.jpg" },
        ],
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
        targets: [
            { name: "Don Archibald Yates", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/elegant_yates.jpg" },
            { name: "Tamara Vidal", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/elegant_vidal.jpg" },
        ],
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
        targets: [
            { name: "Noel Crest", tileUrl: "https://media.hitmaps.com/img/hitman3/actors/rocky_noel_crest.jpg" },
            { name: 'Sinhi "Akka" Venthan', tileUrl: "https://media.hitmaps.com/img/hitman3/actors/rocky_sinhi_akka_venthan.jpg" },
        ],
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
