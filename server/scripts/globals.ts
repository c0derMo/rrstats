import { default as FunctionTimer, Log } from "#shared/utils/FunctionTimer";
import { HitmanMap, getAllMaps, getMap } from "#shared/utils/mapUtils";
import { filterForfeitMatches } from "#shared/utils/matchUtils";
import {
    AchievementTier,
    AchievementCategory,
} from "#shared/types/AchievementInfo";
import { DefaultedMap, getSumOfValues } from "#shared/utils/DefaultedMap";
import { WinningPlayer, ChoosingPlayer } from "#shared/types/IMatch";
import { StreakCounter } from "#shared/utils/StreakCounter";

global.Log = Log;
global.HitmanMap = HitmanMap;
global.AchievementTier = AchievementTier;
global.AchievementCategory = AchievementCategory;
global.FunctionTimer = FunctionTimer;
global.filterForfeitMatches = filterForfeitMatches;
global.DefaultedMap = DefaultedMap;
global.getAllMaps = getAllMaps;
global.WinningPlayer = WinningPlayer;
global.ChoosingPlayer = ChoosingPlayer;
global.StreakCounter = StreakCounter;
global.getMap = getMap;
global.getSumOfValues = getSumOfValues;
