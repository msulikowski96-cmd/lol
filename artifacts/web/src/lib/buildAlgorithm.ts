export type ChampClass = "MARKSMAN" | "MAGE" | "ASSASSIN" | "FIGHTER" | "TANK" | "SUPPORT";
export type DamageType = "AD" | "AP" | "HYBRID";

export interface ChampProfile {
  class: ChampClass;
  damageType: DamageType;
  hasHealing?: boolean;
  isRanged?: boolean;
  tags?: string[];
}

export const CHAMP_DB: Record<string, ChampProfile> = {
  "Aatrox": { class: "FIGHTER", damageType: "AD", hasHealing: true },
  "Ahri": { class: "MAGE", damageType: "AP", tags: ["mobility", "burst"] },
  "Akali": { class: "ASSASSIN", damageType: "HYBRID", tags: ["burst", "mobility"] },
  "Akshan": { class: "MARKSMAN", damageType: "AD", isRanged: true, tags: ["mobility"] },
  "Alistar": { class: "SUPPORT", damageType: "AP", tags: ["cc", "engage"], hasHealing: true },
  "Ambessa": { class: "FIGHTER", damageType: "AD", tags: ["mobility"] },
  "Amumu": { class: "TANK", damageType: "AP", tags: ["cc", "engage"] },
  "Anivia": { class: "MAGE", damageType: "AP", tags: ["cc"] },
  "Annie": { class: "MAGE", damageType: "AP", tags: ["burst", "cc"] },
  "Aphelios": { class: "MARKSMAN", damageType: "AD", isRanged: true },
  "Ashe": { class: "MARKSMAN", damageType: "AD", isRanged: true, tags: ["cc"] },
  "AurelionSol": { class: "MAGE", damageType: "AP" },
  "Aurora": { class: "MAGE", damageType: "AP", tags: ["mobility"] },
  "Azir": { class: "MAGE", damageType: "AP", isRanged: true },
  "Bard": { class: "SUPPORT", damageType: "AP", tags: ["cc"] },
  "Belveth": { class: "MARKSMAN", damageType: "AD", tags: ["mobility"] },
  "Blitzcrank": { class: "SUPPORT", damageType: "AP", tags: ["cc", "engage"] },
  "Brand": { class: "MAGE", damageType: "AP", tags: ["poke"] },
  "Braum": { class: "SUPPORT", damageType: "AD", tags: ["cc", "engage"] },
  "Briar": { class: "FIGHTER", damageType: "AD", hasHealing: true },
  "Caitlyn": { class: "MARKSMAN", damageType: "AD", isRanged: true, tags: ["poke"] },
  "Camille": { class: "FIGHTER", damageType: "AD", tags: ["cc", "mobility"] },
  "Cassiopeia": { class: "MAGE", damageType: "AP", tags: ["poke", "cc"] },
  "Chogath": { class: "TANK", damageType: "AP", tags: ["cc"] },
  "Corki": { class: "MARKSMAN", damageType: "HYBRID", isRanged: true, tags: ["poke"] },
  "Darius": { class: "FIGHTER", damageType: "AD", hasHealing: true },
  "Diana": { class: "FIGHTER", damageType: "AP", tags: ["burst", "mobility"] },
  "DrMundo": { class: "TANK", damageType: "AD", hasHealing: true },
  "Draven": { class: "MARKSMAN", damageType: "AD", isRanged: true },
  "Ekko": { class: "ASSASSIN", damageType: "AP", tags: ["burst", "mobility"] },
  "Elise": { class: "MAGE", damageType: "AP", tags: ["burst"] },
  "Evelynn": { class: "ASSASSIN", damageType: "AP", tags: ["burst", "mobility"] },
  "Ezreal": { class: "MARKSMAN", damageType: "HYBRID", isRanged: true, tags: ["poke", "mobility"] },
  "Fiddlesticks": { class: "MAGE", damageType: "AP", tags: ["cc"] },
  "Fiora": { class: "FIGHTER", damageType: "AD", hasHealing: true, tags: ["mobility"] },
  "Fizz": { class: "ASSASSIN", damageType: "AP", tags: ["burst", "mobility"] },
  "Galio": { class: "TANK", damageType: "AP", tags: ["cc", "engage"] },
  "Gangplank": { class: "FIGHTER", damageType: "AD", tags: ["poke"] },
  "Garen": { class: "FIGHTER", damageType: "AD" },
  "Gnar": { class: "FIGHTER", damageType: "HYBRID", isRanged: true, tags: ["cc"] },
  "Gragas": { class: "FIGHTER", damageType: "AP", tags: ["cc"] },
  "Graves": { class: "MARKSMAN", damageType: "AD", isRanged: false },
  "Gwen": { class: "FIGHTER", damageType: "AP" },
  "Hecarim": { class: "FIGHTER", damageType: "AD", tags: ["mobility", "cc"] },
  "Heimerdinger": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["poke"] },
  "Hwei": { class: "MAGE", damageType: "AP", tags: ["poke"] },
  "Illaoi": { class: "FIGHTER", damageType: "AD", hasHealing: true },
  "Irelia": { class: "FIGHTER", damageType: "AD", tags: ["mobility", "cc"] },
  "Janna": { class: "SUPPORT", damageType: "AP", tags: ["cc"], hasHealing: true },
  "JarvanIV": { class: "FIGHTER", damageType: "AD", tags: ["cc", "engage"] },
  "Jax": { class: "FIGHTER", damageType: "HYBRID" },
  "Jayce": { class: "FIGHTER", damageType: "AD", isRanged: true, tags: ["poke"] },
  "Jhin": { class: "MARKSMAN", damageType: "AD", isRanged: true },
  "Jinx": { class: "MARKSMAN", damageType: "AD", isRanged: true },
  "KSante": { class: "TANK", damageType: "AD", tags: ["cc"] },
  "Kaisa": { class: "MARKSMAN", damageType: "HYBRID", isRanged: true, tags: ["mobility"] },
  "Kalista": { class: "MARKSMAN", damageType: "AD", isRanged: true },
  "Karma": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["poke"], hasHealing: true },
  "Karthus": { class: "MAGE", damageType: "AP" },
  "Kassadin": { class: "ASSASSIN", damageType: "AP", tags: ["burst", "mobility"] },
  "Katarina": { class: "ASSASSIN", damageType: "AP", tags: ["burst", "mobility"] },
  "Kayle": { class: "MARKSMAN", damageType: "HYBRID", isRanged: true },
  "Kayn": { class: "FIGHTER", damageType: "HYBRID", tags: ["mobility"] },
  "Kennen": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["cc"] },
  "Khazix": { class: "ASSASSIN", damageType: "AD", tags: ["burst", "mobility"] },
  "Kindred": { class: "MARKSMAN", damageType: "AD", isRanged: true },
  "Kled": { class: "FIGHTER", damageType: "AD" },
  "KogMaw": { class: "MARKSMAN", damageType: "HYBRID", isRanged: true, tags: ["poke"] },
  "Leblanc": { class: "ASSASSIN", damageType: "AP", tags: ["burst", "mobility"] },
  "LeeSin": { class: "FIGHTER", damageType: "AD", tags: ["mobility"] },
  "Leona": { class: "SUPPORT", damageType: "AD", tags: ["cc", "engage"] },
  "Lillia": { class: "FIGHTER", damageType: "AP", tags: ["mobility", "cc"] },
  "Lissandra": { class: "MAGE", damageType: "AP", tags: ["cc"] },
  "Lucian": { class: "MARKSMAN", damageType: "AD", isRanged: true, tags: ["mobility"] },
  "Lulu": { class: "SUPPORT", damageType: "AP", tags: ["cc"], hasHealing: true },
  "Lux": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["poke", "cc"] },
  "Malphite": { class: "TANK", damageType: "AP", tags: ["cc", "engage"] },
  "Malzahar": { class: "MAGE", damageType: "AP", tags: ["cc"] },
  "Maokai": { class: "TANK", damageType: "AP", tags: ["cc"] },
  "Masteryi": { class: "FIGHTER", damageType: "HYBRID", tags: ["mobility"], hasHealing: true },
  "MissFortune": { class: "MARKSMAN", damageType: "AD", isRanged: true, tags: ["poke"] },
  "Milio": { class: "SUPPORT", damageType: "AP", hasHealing: true },
  "Mordekaiser": { class: "FIGHTER", damageType: "AP" },
  "Morgana": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["cc"] },
  "Nami": { class: "SUPPORT", damageType: "AP", tags: ["cc", "poke"], hasHealing: true },
  "Naafiri": { class: "ASSASSIN", damageType: "AD", tags: ["burst"] },
  "Nasus": { class: "FIGHTER", damageType: "AD", hasHealing: true, tags: ["cc"] },
  "Nautilus": { class: "SUPPORT", damageType: "AP", tags: ["cc", "engage"] },
  "Neeko": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["cc"] },
  "Nidalee": { class: "ASSASSIN", damageType: "AP", tags: ["poke", "mobility"], isRanged: true },
  "Nilah": { class: "FIGHTER", damageType: "AD", hasHealing: true },
  "Nocturne": { class: "ASSASSIN", damageType: "AD", tags: ["mobility"] },
  "Nunu": { class: "TANK", damageType: "AP", tags: ["cc"], hasHealing: true },
  "Olaf": { class: "FIGHTER", damageType: "AD", hasHealing: true },
  "Orianna": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["cc"] },
  "Ornn": { class: "TANK", damageType: "AD", tags: ["cc", "engage"] },
  "Pantheon": { class: "FIGHTER", damageType: "AD", tags: ["burst"] },
  "Poppy": { class: "TANK", damageType: "AD", tags: ["cc"] },
  "Pyke": { class: "SUPPORT", damageType: "AD", tags: ["cc", "engage"] },
  "Qiyana": { class: "ASSASSIN", damageType: "AD", tags: ["burst", "cc", "mobility"] },
  "Quinn": { class: "MARKSMAN", damageType: "AD", isRanged: true, tags: ["mobility"] },
  "Rakan": { class: "SUPPORT", damageType: "AP", tags: ["cc", "engage"] },
  "Rammus": { class: "TANK", damageType: "AD", tags: ["cc"] },
  "RekSai": { class: "FIGHTER", damageType: "AD", tags: ["mobility"] },
  "Rell": { class: "SUPPORT", damageType: "AP", tags: ["cc", "engage"] },
  "RenataGlasc": { class: "SUPPORT", damageType: "AP", tags: ["cc"], hasHealing: true },
  "Renekton": { class: "FIGHTER", damageType: "AD", hasHealing: true },
  "Rengar": { class: "ASSASSIN", damageType: "AD", tags: ["burst"] },
  "Riven": { class: "FIGHTER", damageType: "AD", tags: ["mobility", "cc"] },
  "Rumble": { class: "FIGHTER", damageType: "AP", tags: ["poke"] },
  "Ryze": { class: "MAGE", damageType: "AP", tags: ["cc"] },
  "Samira": { class: "MARKSMAN", damageType: "AD", tags: ["mobility"] },
  "Sejuani": { class: "TANK", damageType: "AP", tags: ["cc", "engage"] },
  "Senna": { class: "SUPPORT", damageType: "AD", isRanged: true, tags: ["poke"], hasHealing: true },
  "Seraphine": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["poke", "cc"], hasHealing: true },
  "Sett": { class: "FIGHTER", damageType: "AD", tags: ["cc"] },
  "Shaco": { class: "ASSASSIN", damageType: "HYBRID", tags: ["mobility"] },
  "Shen": { class: "TANK", damageType: "AD", tags: ["cc"] },
  "Shyvana": { class: "FIGHTER", damageType: "HYBRID" },
  "Singed": { class: "TANK", damageType: "AP" },
  "Sion": { class: "TANK", damageType: "AD", tags: ["cc", "engage"] },
  "Sivir": { class: "MARKSMAN", damageType: "AD", isRanged: true },
  "Skarner": { class: "TANK", damageType: "AD", tags: ["cc"] },
  "Smolder": { class: "MARKSMAN", damageType: "HYBRID", isRanged: true, tags: ["poke"] },
  "Sona": { class: "SUPPORT", damageType: "AP", tags: ["cc", "poke"], hasHealing: true },
  "Soraka": { class: "SUPPORT", damageType: "AP", hasHealing: true },
  "Swain": { class: "FIGHTER", damageType: "AP", tags: ["cc"], hasHealing: true },
  "Sylas": { class: "FIGHTER", damageType: "AP", tags: ["burst"], hasHealing: true },
  "Syndra": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["burst", "cc"] },
  "TahmKench": { class: "SUPPORT", damageType: "AP", hasHealing: true },
  "Taliyah": { class: "MAGE", damageType: "AP", tags: ["poke"] },
  "Talon": { class: "ASSASSIN", damageType: "AD", tags: ["burst", "mobility"] },
  "Taric": { class: "SUPPORT", damageType: "AD", tags: ["cc", "engage"], hasHealing: true },
  "Thresh": { class: "SUPPORT", damageType: "AP", tags: ["cc", "engage"] },
  "Tristana": { class: "MARKSMAN", damageType: "AD", isRanged: true, tags: ["mobility"] },
  "Trundle": { class: "FIGHTER", damageType: "AD", hasHealing: true },
  "Tryndamere": { class: "FIGHTER", damageType: "AD", hasHealing: true, tags: ["mobility"] },
  "TwistedFate": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["cc"] },
  "Twitch": { class: "MARKSMAN", damageType: "AD", isRanged: true },
  "Udyr": { class: "FIGHTER", damageType: "HYBRID", tags: ["cc"], hasHealing: true },
  "Urgot": { class: "FIGHTER", damageType: "AD", tags: ["cc"] },
  "Varus": { class: "MARKSMAN", damageType: "HYBRID", isRanged: true, tags: ["poke", "cc"] },
  "Vayne": { class: "MARKSMAN", damageType: "AD", isRanged: true, tags: ["mobility"] },
  "Veigar": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["burst", "cc"] },
  "Velkoz": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["poke"] },
  "Vex": { class: "MAGE", damageType: "AP", tags: ["burst", "cc"] },
  "Vi": { class: "FIGHTER", damageType: "AD", tags: ["cc", "mobility"] },
  "Viktor": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["poke"] },
  "Vladimir": { class: "MAGE", damageType: "AP", tags: ["sustain"], hasHealing: true },
  "Volibear": { class: "FIGHTER", damageType: "AP", tags: ["cc"] },
  "Warwick": { class: "FIGHTER", damageType: "AD", hasHealing: true },
  "Wukong": { class: "FIGHTER", damageType: "AD", tags: ["cc"] },
  "Xayah": { class: "MARKSMAN", damageType: "AD", isRanged: true },
  "Xerath": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["poke"] },
  "XinZhao": { class: "FIGHTER", damageType: "AD", hasHealing: true, tags: ["cc"] },
  "Yasuo": { class: "FIGHTER", damageType: "AD", tags: ["mobility"] },
  "Yone": { class: "FIGHTER", damageType: "HYBRID", tags: ["burst", "mobility"] },
  "Yuumi": { class: "SUPPORT", damageType: "AP", hasHealing: true },
  "Zac": { class: "TANK", damageType: "AP", tags: ["cc", "engage"] },
  "Zed": { class: "ASSASSIN", damageType: "AD", tags: ["burst", "mobility"] },
  "Zeri": { class: "MARKSMAN", damageType: "AD", isRanged: true, tags: ["mobility"] },
  "Ziggs": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["poke"] },
  "Zilean": { class: "SUPPORT", damageType: "AP", tags: ["cc"] },
  "Zoe": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["burst"] },
  "Zyra": { class: "MAGE", damageType: "AP", isRanged: true, tags: ["poke"] },
};

export interface ItemRec {
  id: number;
  name: string;
  reason?: string;
}

export interface RuneData {
  keystone: { id: number; name: string; imgPath: string; description: string };
  primaryPath: { id: number; name: string; icon: string };
  secondaryPath: { id: number; name: string; icon: string };
  primaryRunes: { name: string; imgPath: string }[];
  secondaryRunes: { name: string; imgPath: string }[];
  shards: string[];
}

export interface BuildResult {
  coreItems: ItemRec[];
  boots: ItemRec;
  situationalItems: ItemRec[];
  runes: RuneData;
  reasoning: string[];
  teamAnalysis: {
    apThreat: number;
    adThreat: number;
    tankCount: number;
    squishyCount: number;
    healingPresence: boolean;
    heavyCC: boolean;
    engageHeavy: boolean;
  };
}

const CDRAGON = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images";

const RUNE_KEYSTONES = {
  conqueror: { id: 8010, name: "Zdobywca", imgPath: `${CDRAGON}/Styles/Precision/Conqueror/Conqueror.png`, description: "Zbieraj stosy w walce, zyskując %AP/%AD i leczenie" },
  pressTheAttack: { id: 8005, name: "Nacisk Ataku", imgPath: `${CDRAGON}/Styles/Precision/PressTheAttack/PressTheAttack.png`, description: "3 ataki → wróg dostaje 12% więcej obrażeń przez 6s" },
  lethalTempo: { id: 8008, name: "Śmiertelne Tempo", imgPath: `${CDRAGON}/Styles/Precision/LethalTempo/LethalTempoTemp.png`, description: "Atak zwiększa szybkość ataku, limit AS przekroczony" },
  fleetFootwork: { id: 8021, name: "Zwinne Ruchy", imgPath: `${CDRAGON}/Styles/Precision/FleetFootwork/FleetFootwork.png`, description: "Naenergetyzowane ataki leczą i dają MS" },
  electrocute: { id: 8112, name: "Elektrokuza", imgPath: `${CDRAGON}/Styles/Domination/Electrocute/Electrocute.png`, description: "3 ataki/czary → wybuch obrażeń" },
  darkHarvest: { id: 8128, name: "Mroczne Żniwa", imgPath: `${CDRAGON}/Styles/Domination/DarkHarvest/DarkHarvest.png`, description: "Zbieraj dusze od wrogów poniżej 50% HP" },
  predator: { id: 8120, name: "Drapieżnik", imgPath: `${CDRAGON}/Styles/Domination/Predator/Predator.png`, description: "Aktywny sprint do celu z obrażeniami" },
  hailOfBlades: { id: 9923, name: "Grad Ostrzy", imgPath: `${CDRAGON}/Styles/Domination/HailOfBlades/HailOfBlades.png`, description: "Pierwsze 3 ataki z 110% szybkością ataku" },
  arcaneComet: { id: 8229, name: "Arkana Kometa", imgPath: `${CDRAGON}/Styles/Sorcery/ArcaneComet/ArcaneComet.png`, description: "Trafienie czarem → komet lecący do celu" },
  phaseRush: { id: 8214, name: "Skok Fazy", imgPath: `${CDRAGON}/Styles/Sorcery/PhaseRush/PhaseRush.png`, description: "3 ataki/czary → ogromny MS przez 4s" },
  summonAery: { id: 8214, name: "Przywołaj Aery", imgPath: `${CDRAGON}/Styles/Sorcery/SummonAery/SummonAery.png`, description: "Ataki i czary wysyłają Aery do poranionego wroga lub sojusznika" },
  graspOfTheUndying: { id: 8437, name: "Uchwyt Nieśmiertelności", imgPath: `${CDRAGON}/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png`, description: "Co 4s następny atak leczy, zwiększa max HP" },
  aftershock: { id: 8439, name: "Weteran Wstrząsu", imgPath: `${CDRAGON}/Styles/Resolve/VeteranAftershock/VeteranAftershock.png`, description: "Zaimmobilizuj wroga → chwilowy armor/MR i eksplozja" },
  guardian: { id: 8465, name: "Strażnik", imgPath: `${CDRAGON}/Styles/Resolve/Guardian/Guardian.png`, description: "Chroń sojusznika → tarcza dla was obojga" },
  glacialAugment: { id: 8351, name: "Lodowe Wspomaganie", imgPath: `${CDRAGON}/Styles/Inspiration/GlacialAugment/GlacialAugment.png`, description: "Podstawowe ataki spowalniają, tworząc lodowe strefy" },
  firstStrike: { id: 8360, name: "Pierwszy Cios", imgPath: `${CDRAGON}/Styles/Inspiration/FirstStrike/FirstStrike.png`, description: "Inicjuj walkę → złoto za obrażenia" },
};

const RUNE_PATHS = {
  precision: { id: 8000, name: "Precyzja", icon: "7201_Precision" },
  domination: { id: 8100, name: "Dominacja", icon: "7200_Domination" },
  sorcery: { id: 8200, name: "Czarnoksięstwo", icon: "7202_Sorcery" },
  inspiration: { id: 8300, name: "Inspiracja", icon: "7203_Whimsy" },
  resolve: { id: 8400, name: "Wytrwałość", icon: "7204_Resolve" },
};

const SUBRUNES: Record<string, { name: string; imgPath: string }[]> = {
  precision: [
    { name: "Triumf", imgPath: `${CDRAGON}/Styles/Precision/Triumph.png` },
    { name: "Legendarna Żywotność", imgPath: `${CDRAGON}/Styles/Precision/LegendBloodline/LegendBloodline.png` },
    { name: "Zamach", imgPath: `${CDRAGON}/Styles/Precision/CoupDeGrace/CoupDeGrace.png` },
  ],
  dominationSub: [
    { name: "Smak Krwi", imgPath: `${CDRAGON}/Styles/Domination/TasteOfBlood/GreenTerror_TasteOfBlood.png` },
    { name: "Żniwiarz Ocznodołów", imgPath: `${CDRAGON}/Styles/Domination/EyeballCollection/EyeballCollection.png` },
    { name: "Łowca Żbójów", imgPath: `${CDRAGON}/Styles/Domination/TreasureHunter/TreasureHunter.png` },
  ],
  sorcerySub: [
    { name: "Przepływ Many", imgPath: `${CDRAGON}/Styles/Sorcery/ManaflowBand/ManaflowBand.png` },
    { name: "Transcendencja", imgPath: `${CDRAGON}/Styles/Sorcery/Transcendence/Transcendence.png` },
    { name: "Zbieranie Burz", imgPath: `${CDRAGON}/Styles/Sorcery/GatheringStorm/GatheringStorm.png` },
  ],
  resolveSub: [
    { name: "Zbroja Kości", imgPath: `${CDRAGON}/Styles/Resolve/BonePlating/BonePlating.png` },
    { name: "Drugi Oddech", imgPath: `${CDRAGON}/Styles/Resolve/SecondWind/SecondWind.png` },
    { name: "Niespożyte Siły", imgPath: `${CDRAGON}/Styles/Resolve/Unflinching/Unflinching.png` },
  ],
  inspirationSub: [
    { name: "Magiczne Obuwie", imgPath: `${CDRAGON}/Styles/Inspiration/MagicalFootwear/MagicalFootwear.png` },
    { name: "Kosmiczny Wgląd", imgPath: `${CDRAGON}/Styles/Inspiration/CosmicInsight/CosmicInsight.png` },
    { name: "Droga do Tortu", imgPath: `${CDRAGON}/Styles/Inspiration/BiscuitDelivery/BiscuitDelivery.png` },
  ],
};

export function getChampProfile(championId: string): ChampProfile {
  if (CHAMP_DB[championId]) return CHAMP_DB[championId];
  const lower = championId.toLowerCase();
  if (lower.includes("sup") || lower.includes("ard") || lower.includes("sor")) return { class: "SUPPORT", damageType: "AP" };
  return { class: "FIGHTER", damageType: "HYBRID" };
}

interface TeamAnalysis {
  apThreat: number;
  adThreat: number;
  tankCount: number;
  squishyCount: number;
  healingPresence: boolean;
  heavyCC: boolean;
  engageHeavy: boolean;
}

function analyzeEnemyTeam(enemies: string[]): TeamAnalysis {
  let apThreat = 0, adThreat = 0, tankCount = 0, squishyCount = 0;
  let healingPresence = false, ccCount = 0, engageCount = 0;

  for (const e of enemies) {
    if (!e) continue;
    const p = getChampProfile(e);
    if (p.damageType === "AP") apThreat++;
    else if (p.damageType === "AD") adThreat++;
    else { apThreat += 0.5; adThreat += 0.5; }
    if (p.class === "TANK") { tankCount++; squishyCount = Math.max(0, squishyCount); }
    else if (p.class === "FIGHTER") { tankCount += 0.5; }
    else if (["MAGE", "MARKSMAN", "ASSASSIN"].includes(p.class)) { squishyCount++; }
    if (p.hasHealing) healingPresence = true;
    if (p.tags?.includes("cc")) ccCount++;
    if (p.tags?.includes("engage")) engageCount++;
  }

  return {
    apThreat: Math.round(apThreat),
    adThreat: Math.round(adThreat),
    tankCount: Math.round(tankCount),
    squishyCount: Math.round(squishyCount),
    healingPresence,
    heavyCC: ccCount >= 2,
    engageHeavy: engageCount >= 2,
  };
}

function buildMarksman(ta: TeamAnalysis, profile: ChampProfile): Omit<BuildResult, "teamAnalysis"> {
  const reasoning: string[] = [];
  const coreItems: ItemRec[] = [];
  const situational: ItemRec[] = [];
  let boots: ItemRec = { id: 3006, name: "Buty Berserkera" };

  if (ta.apThreat >= 3) {
    boots = { id: 3111, name: "Trzewiki Merkurego" };
    reasoning.push("Dużo AP u przeciwników — Trzewiki Merkurego dają MR i tenacity.");
  } else if (ta.engageHeavy) {
    boots = { id: 3047, name: "Płytowane Nagolenniki" };
    reasoning.push("Dużo engage'u — Płytowane Nagolenniki zmniejszają obrażenia od AA.");
  } else {
    reasoning.push("Buty Berserkera — standardowy wybór dla ADC, dają szybkość ataku.");
  }

  if (ta.tankCount >= 2) {
    coreItems.push({ id: 6672, name: "Niszczyciel Krakena", reason: "Zadaje % aktualnego HP — idealny przeciw tankom" });
    reasoning.push("Wiele tanków — Niszczyciel Krakena bije w % HP.");
  } else if (profile.tags?.includes("poke")) {
    coreItems.push({ id: 3095, name: "Opróżniacz Burz", reason: "Silne obrażenia z dala — dobry dla ADC z pokeiem" });
    reasoning.push("Twój champion ma poke — Opróżniacz Burz wzmacnia ataki z dystansu.");
  } else {
    coreItems.push({ id: 3031, name: "Ostrze Nieskończoności", reason: "Core item — maksymalizuje obrażenia z critta" });
    reasoning.push("Standardowy core — Ostrze Nieskończoności dla maksymalnych obrażeń.");
  }

  if (ta.squishyCount >= 3) {
    coreItems.push({ id: 3094, name: "Szybkostrzał Cannona", reason: "Zasięg i obrażenia na odległych celach" });
  } else {
    coreItems.push({ id: 3085, name: "Huragan Runaan", reason: "Obrażenia obszarowe — dobry w walce wielu wrogów" });
  }
  coreItems.push({ id: 3046, name: "Tancerz Widm", reason: "Tarcza przy niskim HP — zapewnia przeżycie" });

  if (ta.healingPresence) {
    situational.push({ id: 3033, name: "Przypomnienie Śmiertelnika", reason: "Antyheal — niezbędny, gdy wróg ma leczenie" });
    reasoning.push("Przeciwnik ma leczenie — rozważ Przypomnienie Śmiertelnika jak najszybciej.");
  }
  if (ta.apThreat >= 2) {
    situational.push({ id: 3156, name: "Paszcza Malmortusa", reason: "Tarcza vs AP — ratuje życie w burst'ach AP" });
    reasoning.push("Mocny AP — Paszcza Malmortusa daje tarczę blokującą AP.");
  }
  if (ta.engageHeavy) {
    situational.push({ id: 3139, name: "Scimitar Merkurego", reason: "Aktywne usuwanie CC — kluczowe vs engage" });
    reasoning.push("Dużo CC/engage — Scimitar Merkurego usuwa stany aktywnie.");
  }
  situational.push({ id: 3026, name: "Anioł Strażnik", reason: "Drugie życie — pick vs assassinów i diverów" });
  situational.push({ id: 3036, name: "Władanie Lorda Dominika", reason: "Penetracja pancerza — konieczny vs pełnych tanków" });

  const runes = buildRunesMarksman(ta, profile);
  return { coreItems, boots, situationalItems: situational, runes, reasoning };
}

function buildRunesMarksman(ta: TeamAnalysis, profile: ChampProfile): RuneData {
  const isOnHit = ["KogMaw", "Kaisa", "Varus"].includes(profile as unknown as string);
  const hasMobility = profile.tags?.includes("mobility");

  let keystone = RUNE_KEYSTONES.fleetFootwork;
  if (ta.tankCount >= 2) keystone = RUNE_KEYSTONES.lethalTempo;
  else if (ta.squishyCount >= 3 && !hasMobility) keystone = RUNE_KEYSTONES.pressTheAttack;
  else if (ta.engageHeavy) keystone = RUNE_KEYSTONES.fleetFootwork;

  return {
    keystone,
    primaryPath: RUNE_PATHS.precision,
    secondaryPath: ta.apThreat >= 2 ? RUNE_PATHS.resolve : RUNE_PATHS.domination,
    primaryRunes: SUBRUNES.precision,
    secondaryRunes: ta.apThreat >= 2 ? SUBRUNES.resolveSub.slice(0, 2) : SUBRUNES.dominationSub.slice(0, 2),
    shards: ["Szybkość Ataku", "Obrażenia Adaptacyjne", "HP"],
  };
}

function buildMage(ta: TeamAnalysis, profile: ChampProfile): Omit<BuildResult, "teamAnalysis"> {
  const reasoning: string[] = [];
  const coreItems: ItemRec[] = [];
  const situational: ItemRec[] = [];
  let boots: ItemRec = { id: 3020, name: "Buty Czarnoksiężnika" };

  if (ta.adThreat >= 3) {
    boots = { id: 3158, name: "Buty Lucidity" };
    reasoning.push("Wiele AD — Buty Lucidity lub rozważ Płytowane Nagolenniki zależnie od meczu.");
  } else if (ta.heavyCC) {
    boots = { id: 3111, name: "Trzewiki Merkurego" };
    reasoning.push("Dużo CC — Trzewiki Merkurego dają tenacity, kluczowe dla maga.");
  } else {
    reasoning.push("Buty Czarnoksiężnika — standardowy wybór dla maga, dają MagPen.");
  }

  const isPoke = profile.tags?.includes("poke");
  const isBurst = profile.tags?.includes("burst");

  if (ta.tankCount >= 2) {
    coreItems.push({ id: 3100, name: "Udrękę Liandry", reason: "Obrażenia % max HP — idealna vs tanków" });
    reasoning.push("Wiele tanków — Udręka Liandry boli tanków przez % HP.");
    coreItems.push({ id: 3135, name: "Laska Próżni", reason: "40% MagPen — konieczna vs tanków z dużym MR" });
    reasoning.push("Uzupełnij Laską Próżni dla penetracji magicznej vs tanki.");
  } else if (isBurst || ta.squishyCount >= 3) {
    coreItems.push({ id: 4645, name: "Shadowflame", reason: "Ogromny AP + MagPen vs squishies" });
    coreItems.push({ id: 3285, name: "Szał Ludena", reason: "Poke i burst na otwarcie walki" });
    reasoning.push("Dużo wrogów bez pancerza — Shadowflame + Szał Ludena dla maksymalnego burstu.");
  } else if (isPoke) {
    coreItems.push({ id: 3285, name: "Szał Ludena", reason: "Najlepszy item do poke'u z dystansu" });
    coreItems.push({ id: 4645, name: "Shadowflame", reason: "Wzmacnia kolejne czary" });
    reasoning.push("Twój champion świetnie poke'uje — Szał Ludena to must-have.");
  } else {
    coreItems.push({ id: 3285, name: "Szał Ludena", reason: "Core dla większości magów" });
    coreItems.push({ id: 4645, name: "Shadowflame", reason: "Ogromny flat AP + MagPen" });
    reasoning.push("Klasyczny core maga: Szał Ludena + Shadowflame.");
  }

  coreItems.push({ id: 3089, name: "Czapka Rabadona", reason: "Mnoży AP o 35% — zawsze 3. lub 4. item" });
  reasoning.push("Czapka Rabadona jako 3. item wielokrotnie zwiększa całkowite AP.");

  if (ta.adThreat >= 3) {
    situational.push({ id: 3157, name: "Klepsydra Zhonya", reason: "Aktywna nietykalność — ratuje vs AD/assassinów" });
    reasoning.push("Mocny AD/assassini — Klepsydra Zhonya jest absolutnie konieczna.");
  }
  if (ta.apThreat >= 2) {
    situational.push({ id: 3102, name: "Zasłona Banshee", reason: "Blokuje jeden czar AP — ochrona vs poke i CC" });
    reasoning.push("AP i CC u wrogów — Zasłona Banshee blokuje jedno trafienie.");
  }
  if (ta.healingPresence) {
    situational.push({ id: 3165, name: "Morellonomikon", reason: "Antyheal — obniża leczenie o 40%" });
    reasoning.push("Leczenie u wrogów — Morellonomikon redukuje je o 40%.");
  }
  situational.push({ id: 3135, name: "Laska Próżni", reason: "40% MagPen — zakup gdy wróg zbiera MR" });

  const runes = buildRunesMage(ta, profile);
  return { coreItems, boots, situationalItems: situational, runes, reasoning };
}

function buildRunesMage(ta: TeamAnalysis, _profile: ChampProfile): RuneData {
  const isPoke = _profile.tags?.includes("poke");
  let keystone = isPoke ? RUNE_KEYSTONES.arcaneComet : RUNE_KEYSTONES.electrocute;
  if (ta.tankCount >= 3) keystone = RUNE_KEYSTONES.arcaneComet;

  return {
    keystone,
    primaryPath: isPoke ? RUNE_PATHS.sorcery : RUNE_PATHS.domination,
    secondaryPath: isPoke ? RUNE_PATHS.domination : RUNE_PATHS.sorcery,
    primaryRunes: isPoke ? SUBRUNES.sorcerySub : SUBRUNES.dominationSub,
    secondaryRunes: isPoke ? SUBRUNES.dominationSub.slice(0, 2) : SUBRUNES.sorcerySub.slice(0, 2),
    shards: ["AP Adaptacyjne", "AP Adaptacyjne", "HP/Armor/MR"],
  };
}

function buildAssassin(ta: TeamAnalysis, profile: ChampProfile): Omit<BuildResult, "teamAnalysis"> {
  const reasoning: string[] = [];
  const coreItems: ItemRec[] = [];
  const situational: ItemRec[] = [];
  const isAP = profile.damageType === "AP";
  let boots: ItemRec = isAP ? { id: 3020, name: "Buty Czarnoksiężnika" } : { id: 3142, name: "Buty Jowisza... Ionian" };

  if (ta.heavyCC) {
    boots = { id: 3111, name: "Trzewiki Merkurego" };
    reasoning.push("Wiele CC — Trzewiki Merkurego dają tenacity, kluczowe dla assassina.");
  } else {
    reasoning.push(isAP ? "Buty Czarnoksiężnika dla penetracji magicznej." : "Buty Lucidity dla skrócenia cooldownów.");
    boots = isAP ? { id: 3020, name: "Buty Czarnoksiężnika" } : { id: 3158, name: "Buty Lucidity" };
  }

  if (isAP) {
    coreItems.push({ id: 4645, name: "Shadowflame", reason: "Core AP assassina — ogromny burst" });
    coreItems.push({ id: 3285, name: "Szał Ludena", reason: "Mobilność i obrażenia przy inicjacji" });
    coreItems.push({ id: 3157, name: "Klepsydra Zhonya", reason: "Aktywna nietykalność — kluczowa dla melee maga" });
    reasoning.push("AP Assassin: Shadowflame → Szał Ludena → Zhonya — klasyczny core.");
  } else {
    coreItems.push({ id: 6691, name: "Ostrze Nocy", reason: "Burst + tarcza vs czarów po wbiciu w cel" });
    coreItems.push({ id: 3814, name: "Krawędź Nocy", reason: "Blokuje jeden czar — idealne vs maga/poke" });
    coreItems.push({ id: 3142, name: "Buty Jowisza... Miecz Ducha", reason: "Szybkość i zabójcze obrażenia" });
    coreItems[2] = { id: 3142, name: "Призрак Jowisza", reason: "Przyspieszenie i lethality" };
    reasoning.push("AD Assassin: Ostrze Nocy → Krawędź Nocy dla maksymalnego burstu i tarcza vs CC.");
  }

  if (ta.tankCount >= 2) {
    situational.push({ id: 6694, name: "Żal Seryldy", reason: "Penetracja pancerza + spowolnienie — vs tanki" });
    reasoning.push("Wiele tanków — Żal Seryldy daje ArPen i spowolnienie.");
  }
  if (ta.healingPresence) {
    situational.push({ id: 6693, name: "Kieł Węża", reason: "Antyheal — redukuje tarcze i leczenie" });
    reasoning.push("Leczenie u wrogów — Kieł Węża zmniejsza efektywność leczenia.");
  }
  situational.push({ id: 3026, name: "Anioł Strażnik", reason: "Drugie życie — pick gdy ahead lub vs teamfight" });

  const runes = buildRunesAssassin(ta, profile);
  return { coreItems, boots, situationalItems: situational, runes, reasoning };
}

function buildRunesAssassin(ta: TeamAnalysis, profile: ChampProfile): RuneData {
  const isScaling = ["Veigar", "Kassadin", "Karthus"].includes(profile as unknown as string);
  const keystone = isScaling ? RUNE_KEYSTONES.darkHarvest : RUNE_KEYSTONES.electrocute;

  return {
    keystone,
    primaryPath: RUNE_PATHS.domination,
    secondaryPath: ta.heavyCC ? RUNE_PATHS.resolve : RUNE_PATHS.precision,
    primaryRunes: SUBRUNES.dominationSub,
    secondaryRunes: ta.heavyCC ? SUBRUNES.resolveSub.slice(0, 2) : SUBRUNES.precision.slice(0, 2),
    shards: ["AD/AP Adaptacyjne", "AD/AP Adaptacyjne", "HP"],
  };
}

function buildFighter(ta: TeamAnalysis, _profile: ChampProfile): Omit<BuildResult, "teamAnalysis"> {
  const reasoning: string[] = [];
  const coreItems: ItemRec[] = [];
  const situational: ItemRec[] = [];
  let boots: ItemRec = { id: 3047, name: "Płytowane Nagolenniki" };

  if (ta.apThreat >= 3) {
    boots = { id: 3111, name: "Trzewiki Merkurego" };
    reasoning.push("Dużo AP — Trzewiki Merkurego dla MR i tenacity.");
  } else if (ta.heavyCC) {
    boots = { id: 3111, name: "Trzewiki Merkurego" };
    reasoning.push("Wiele CC — tenacity z Trzewików Merkurego jest priorytetem.");
  } else {
    reasoning.push("Płytowane Nagolenniki vs AD — zmniejszają obrażenia AA o 12%.");
  }

  coreItems.push({ id: 3078, name: "Trójca Sił", reason: "Proc po każdym czarze — świetny dla fighterów z niskim CD" });
  coreItems.push({ id: 6333, name: "Taniec Śmierci", reason: "Opóźnia obrażenia i leczy — niezbędne dla przeżycia" });
  coreItems.push({ id: 3053, name: "Wzmocnienie Steraka", reason: "Tarcza przy niskim HP — ratuje w walce" });
  reasoning.push("Core fighter: Trójca Sił + Taniec Śmierci + Tarcza Steraka.");

  if (ta.apThreat >= 2) {
    situational.push({ id: 4401, name: "Siła Natury", reason: "Bardzo wysokie MR — konieczne vs AP" });
    situational.push({ id: 3065, name: "Wisiorek Ducha", reason: "MR + wzmacnia leczenie/tarcze" });
    reasoning.push("Mocny AP — weź Siłę Natury lub Wisiorek Ducha dla MR.");
  }
  if (ta.tankCount >= 2) {
    situational.push({ id: 3153, name: "Ostrze Króla Ruin", reason: "Zadaje % aktualnego HP — najlepszy vs tanki" });
    situational.push({ id: 3071, name: "Topór Czerni", reason: "Stackuje 6x redukcję pancerza vs tanki" });
    reasoning.push("Dużo tanków — Ostrze Króla Ruin lub Topór Czerni przebijają ich pancerz.");
  }
  if (ta.healingPresence) {
    situational.push({ id: 3076, name: "Kolec Brambletu", reason: "Antyheal w zasięgu AA — daj wcześnie vs heal" });
    reasoning.push("Leczenie u wrogów — Kolec Brambletu redukuje je przez AA.");
  }

  const runes = buildRunesFighter(ta);
  return { coreItems, boots, situationalItems: situational, runes, reasoning };
}

function buildRunesFighter(ta: TeamAnalysis): RuneData {
  const keystone = ta.tankCount >= 2 ? RUNE_KEYSTONES.conqueror : RUNE_KEYSTONES.conqueror;
  return {
    keystone,
    primaryPath: RUNE_PATHS.precision,
    secondaryPath: ta.apThreat >= 2 ? RUNE_PATHS.resolve : RUNE_PATHS.domination,
    primaryRunes: SUBRUNES.precision,
    secondaryRunes: ta.apThreat >= 2 ? SUBRUNES.resolveSub.slice(0, 2) : SUBRUNES.dominationSub.slice(0, 2),
    shards: ["AD Adaptacyjne", "AD Adaptacyjne", "HP"],
  };
}

function buildTank(ta: TeamAnalysis, _profile: ChampProfile): Omit<BuildResult, "teamAnalysis"> {
  const reasoning: string[] = [];
  const coreItems: ItemRec[] = [];
  const situational: ItemRec[] = [];
  let boots: ItemRec = { id: 3047, name: "Płytowane Nagolenniki" };

  if (ta.apThreat >= 3) {
    boots = { id: 3111, name: "Trzewiki Merkurego" };
    reasoning.push("Mocny AP — Trzewiki Merkurego dla MR i tenacity.");
  } else {
    reasoning.push("Płytowane Nagolenniki — vs AD zmniejszają obrażenia AA.");
  }

  coreItems.push({ id: 3181, name: "Serce ze Stali", reason: "Skaluje HP z atakami — ogromny HP w mid/late" });
  reasoning.push("Serce ze Stali jako tank mythic — całkowity HP rośnie z czasem.");

  if (ta.adThreat >= 3) {
    coreItems.push({ id: 3068, name: "Egida Słoneczna", reason: "Pasywne obrażenia obszarowe i pancerz" });
    coreItems.push({ id: 3075, name: "Cierniowa Zbroja", reason: "Antyheal + obrażenia zwrotne od AA" });
    reasoning.push("Dużo AD — Egida Słoneczna + Cierniowa Zbroja jako rdzeń pancerza.");
  } else if (ta.apThreat >= 3) {
    coreItems.push({ id: 4401, name: "Siła Natury", reason: "Ogromne MR i HP dla tanka" });
    coreItems.push({ id: 3001, name: "Maska Otchłani", reason: "MR + amplifikuje obrażenia magiczne sojuszników" });
    reasoning.push("Dużo AP — Siła Natury + Maska Otchłani dają ogromny MR.");
  } else {
    coreItems.push({ id: 3068, name: "Egida Słoneczna", reason: "Wszechstronny item tanki — pancerz i obrażenia" });
    coreItems.push({ id: 3193, name: "Kamień Gargulca", reason: "Aktywna redukcja obrażeń o 60%" });
    reasoning.push("Egida Słoneczna + Kamień Gargulca — klasyczny core tanka.");
  }

  if (ta.healingPresence) {
    situational.push({ id: 3075, name: "Cierniowa Zbroja", reason: "Antyheal + odbicie AA" });
    reasoning.push("Leczenie u wrogów — Cierniowa Zbroja redukuje heal i boli przy AA.");
  }
  situational.push({ id: 3083, name: "Zbroja Warmoga", reason: "Ogromny HP + regeneracja po walce" });
  situational.push({ id: 3143, name: "Omen Randuina", reason: "Spowalnia AS wrogów przy walce — vs kryty" });
  situational.push({ id: 3110, name: "Zmrożone Serce", reason: "Tańszy pancerz + CDR + spowalnia AS" });

  const runes = buildRunesTank(ta, _profile);
  return { coreItems, boots, situationalItems: situational, runes, reasoning };
}

function buildRunesTank(ta: TeamAnalysis, profile: ChampProfile): RuneData {
  const isEngage = profile.tags?.includes("engage");
  const keystone = isEngage ? RUNE_KEYSTONES.aftershock : RUNE_KEYSTONES.graspOfTheUndying;
  return {
    keystone,
    primaryPath: RUNE_PATHS.resolve,
    secondaryPath: ta.adThreat >= 3 ? RUNE_PATHS.precision : RUNE_PATHS.inspiration,
    primaryRunes: SUBRUNES.resolveSub,
    secondaryRunes: ta.adThreat >= 3 ? SUBRUNES.precision.slice(0, 2) : SUBRUNES.inspirationSub.slice(0, 2),
    shards: ["HP Adaptacyjne", "Armor/MR", "HP"],
  };
}

function buildSupport(ta: TeamAnalysis, profile: ChampProfile): Omit<BuildResult, "teamAnalysis"> {
  const reasoning: string[] = [];
  const coreItems: ItemRec[] = [];
  const situational: ItemRec[] = [];
  const isEngage = profile.tags?.includes("engage") || ["Leona", "Thresh", "Nautilus", "Blitzcrank", "Alistar", "Rell", "Rakan"].includes(profile as unknown as string);
  const isEnchanter = profile.hasHealing || ["Janna", "Lulu", "Nami", "Soraka", "Sona", "Yuumi", "Milio"].includes(profile as unknown as string);

  let boots: ItemRec = { id: 3158, name: "Buty Lucidity" };
  if (ta.apThreat >= 2 && isEngage) {
    boots = { id: 3111, name: "Trzewiki Merkurego" };
    reasoning.push("Dużo AP + engage support — Trzewiki Merkurego dla tenacity.");
  } else if (ta.adThreat >= 3 && isEngage) {
    boots = { id: 3047, name: "Płytowane Nagolenniki" };
    reasoning.push("Dużo AD — Płytowane Nagolenniki vs fizyczne obrażenia.");
  } else {
    reasoning.push("Buty Lucidity — CDR skraca cooldowny czarów supporta.");
  }

  if (isEngage) {
    coreItems.push({ id: 3190, name: "Amulet Żelaznego Słońca", reason: "Tarcza obszarowa dla całej drużyny" });
    coreItems.push({ id: 3109, name: "Przysięga Rycerza", reason: "Przekierowanie obrażeń — ratuje ADC" });
    reasoning.push("Engage support: Amulet Słońca + Przysięga Rycerza dla drużyny.");
  } else if (isEnchanter) {
    coreItems.push({ id: 3504, name: "Kadzielnica Ardenta", reason: "Wzmacnia carries — must pick dla enchanter vs AD" });
    coreItems.push({ id: 3107, name: "Odkupienie", reason: "Leczenie obszarowe przez ścianę w teamfighcie" });
    reasoning.push("Enchanter: Kadzielnica Ardenta + Odkupienie — maksimum leczenia i buffów.");
  } else {
    coreItems.push({ id: 3190, name: "Amulet Żelaznego Słońca", reason: "Wszechstronny support item" });
    coreItems.push({ id: 2065, name: "Pieśń Shurelyi", reason: "Sprint dla całej drużyny — engage lub ucieczka" });
    reasoning.push("Pieśń Shurelyi jako trigger do engage lub ucieczki z drużyną.");
  }

  if (ta.healingPresence) {
    situational.push({ id: 4010, name: "Miotacz Chemtech", reason: "Antyheal w czarach — vs heal comp" });
    reasoning.push("Leczenie u wrogów — Miotacz Chemtech przekazuje antyheal przez czary.");
  }
  if (ta.apThreat >= 2 || ta.heavyCC) {
    situational.push({ id: 3222, name: "Błogosławieństwo Mikaela", reason: "Aktywne usuwanie CC z sojusznika" });
    reasoning.push("Dużo CC — Błogosławieństwo Mikaela czyści CC sojuszniku.");
  }
  situational.push({ id: 3050, name: "Zbieżność Zeke", reason: "Wzmacnia sojusznika przy utrzymaniu kontaktu" });

  const runes = buildRunesSupport(ta, profile);
  return { coreItems, boots, situationalItems: situational, runes, reasoning };
}

function buildRunesSupport(ta: TeamAnalysis, profile: ChampProfile): RuneData {
  const isEngage = profile.tags?.includes("engage");
  const isPoke = profile.tags?.includes("poke");
  let keystone = RUNE_KEYSTONES.summonAery;
  if (isEngage) keystone = RUNE_KEYSTONES.aftershock;
  else if (ta.tankCount >= 3) keystone = RUNE_KEYSTONES.guardian;
  else if (isPoke) keystone = RUNE_KEYSTONES.arcaneComet;

  const primary = isEngage ? RUNE_PATHS.resolve : (isPoke ? RUNE_PATHS.sorcery : RUNE_PATHS.sorcery);
  return {
    keystone,
    primaryPath: primary,
    secondaryPath: RUNE_PATHS.inspiration,
    primaryRunes: isEngage ? SUBRUNES.resolveSub : SUBRUNES.sorcerySub,
    secondaryRunes: SUBRUNES.inspirationSub.slice(0, 2),
    shards: ["AP Adaptacyjne", "CDR", "HP/Armor"],
  };
}

export type Lane = "AUTO" | "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT";

function getLaneOverrideClass(lane: Lane, profile: ChampProfile): ChampClass {
  switch (lane) {
    case "TOP":
      if (profile.class === "SUPPORT") return "TANK";
      if (profile.class === "MARKSMAN") return "FIGHTER";
      return profile.class;
    case "JUNGLE":
      if (profile.class === "SUPPORT") return "FIGHTER";
      return profile.class;
    case "MID":
      return profile.class;
    case "ADC":
      return "MARKSMAN";
    case "SUPPORT":
      return "SUPPORT";
    default:
      return profile.class;
  }
}

export function calculateBuild(myChampionId: string, enemies: string[], lane: Lane = "AUTO"): BuildResult {
  const profile = getChampProfile(myChampionId);
  const ta = analyzeEnemyTeam(enemies);
  const effectiveClass = lane === "AUTO" ? profile.class : getLaneOverrideClass(lane, profile);

  let partial: Omit<BuildResult, "teamAnalysis">;
  switch (effectiveClass) {
    case "MARKSMAN": partial = buildMarksman(ta, profile); break;
    case "MAGE": partial = buildMage(ta, profile); break;
    case "ASSASSIN": partial = buildAssassin(ta, profile); break;
    case "FIGHTER": partial = buildFighter(ta, profile); break;
    case "TANK": partial = buildTank(ta, profile); break;
    case "SUPPORT": partial = buildSupport(ta, profile); break;
    default: partial = buildFighter(ta, profile);
  }

  return { ...partial, teamAnalysis: ta };
}

export const CLASS_LABEL: Record<ChampClass, string> = {
  MARKSMAN: "Strzelec",
  MAGE: "Mag",
  ASSASSIN: "Assassin",
  FIGHTER: "Wojownik",
  TANK: "Tank",
  SUPPORT: "Support",
};
