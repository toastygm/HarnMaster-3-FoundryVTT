// Namespace Configuration Values
export const HM3 = {};

// ASCII Artwork
HM3.ASCII = `_   _ ___  ___ _____ 
| | | ||  \\/  ||____ |
| |_| || .  . |    / /
|  _  || |\\/| |    \\ \\
| | | || |  | |.___/ /
\\_| |_/\\_|  |_/\\____/`;

// When the system is fully ready, set this to true
HM3.ready = false;

HM3.allowedActorFlags = [];

HM3.allowedAspects = ['Edged', 'Piercing', 'Blunt'];

HM3.allowedRanges = ['Short', 'Medium', 'Long', 'Extreme'];

HM3.skillTypes = ["Craft", "Physical", "Communication", "Combat", "Magic", "Ritual"];

HM3.traitTypes = ["Physical", "Psyche"];

HM3.sunsigns = ['Ulandus', 'Ulandus-Aralius', 'Aralius', 'Aralius-Feniri', 'Feniri', 'Feniri-Ahnu',
    'Ahnu', 'Ahnu-Angberelius', 'Angberelius', 'Angberelius-Nadai', 'Nadai', 'Nadai-Hirin',
    'Hirin', 'Hirin-Tarael', 'Tarael', 'Tarael-Tai', 'Tai', 'Tai-Skorus', 'Skorus',
    'Skorus-Masara', 'Masara', 'Masara-Lado', 'Lado', 'Lado-Ulandus'];

HM3.defaultCharacterSkills = {
    'hm3.std-skills-physical': ['Climbing', 'Jumping', 'Stealth', 'Throwing'],
    'hm3.std-skills-communication': ['Awareness', 'Intrigue', 'Oratory', 'Rhetoric', 'Singing'],
    'hm3.std-skills-combat': ['Initiative', 'Unarmed', 'Dodge']
};

HM3.defaultCreatureSkills = {
    'hm3.std-skills-communication': ['Awareness'],
    'hm3.std-skills-combat': ['Initiative', 'Unarmed', 'Dodge']
};

HM3.injuryLocations = {
    "Custom": { impactType: "custom", probWeight: { "high": 1, "mid": 1, "low": 1 }, isStumble: false, isFumble: false, isAmputate: false, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "G5" } },
    "Skull": { impactType: "skull", probWeight: { "high": 150, "mid": 50, "low": 0 }, isStumble: false, isFumble: false, isAmputate: false, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "K4", ei17: "K5" } },
    "Face": { impactType: "face", probWeight: { "high": 150, "mid": 50, "low": 0 }, isStumble: false, isFumble: false, isAmputate: false, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "K5" } },
    "Neck": { impactType: "neck", probWeight: { "high": 150, "mid": 50, "low": 0 }, isStumble: false, isFumble: false, isAmputate: true, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "K4", ei17: "K5" } },
    "Shoulder": { impactType: "shoulder", probWeight: { "high": 60, "mid": 60, "low": 0 }, isStumble: false, isFumble: true, isAmputate: false, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "K4" } },
    "Upper Arm": { impactType: "upperarm", probWeight: { "high": 60, "mid": 30, "low": 0 }, isStumble: false, isFumble: true, isAmputate: true, effectiveImpact: { ei1: "M1", ei5: "M1", ei9: "S2", ei13: "S3", ei17: "G4" } },
    "Elbow": { impactType: "elbow", probWeight: { "high": 20, "mid": 10, "low": 0 }, isStumble: false, isFumble: true, isAmputate: true, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "G5" } },
    "Forearm": { impactType: "forearm", probWeight: { "high": 40, "mid": 20, "low": 30 }, isStumble: false, isFumble: true, isAmputate: true, effectiveImpact: { ei1: "M1", ei5: "M1", ei9: "S2", ei13: "S3", ei17: "G4" } },
    "Hand": { impactType: "hand", probWeight: { "high": 20, "mid": 20, "low": 30 }, isStumble: false, isFumble: true, isAmputate: true, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "G5" } },
    "Thorax": { impactType: "thorax", probWeight: { "high": 100, "mid": 170, "low": 70 }, isStumble: false, isFumble: false, isAmputate: false, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "K5" } },
    "Abdomen": { impactType: "abdomen", probWeight: { "high": 60, "mid": 100, "low": 100 }, isStumble: false, isFumble: false, isAmputate: false, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "K4", ei17: "K5" } },
    "Groin": { impactType: "groin", probWeight: { "high": 0, "mid": 40, "low": 60 }, isStumble: false, isFumble: false, isAmputate: true, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "G5" } },
    "Hip": { impactType: "hip", probWeight: { "high": 0, "mid": 30, "low": 70 }, isStumble: true, isFumble: false, isAmputate: false, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "K4" } },
    "Thigh": { impactType: "thigh", probWeight: { "high": 0, "mid": 40, "low": 100 }, isStumble: true, isFumble: false, isAmputate: true, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "K4" } },
    "Knee": { impactType: "knee", probWeight: { "high": 0, "mid": 10, "low": 40 }, isStumble: true, isFumble: false, isAmputate: true, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "G5" } },
    "Calf": { impactType: "calf", probWeight: { "high": 0, "mid": 30, "low": 70 }, isStumble: true, isFumble: false, isAmputate: true, effectiveImpact: { ei1: "M1", ei5: "M1", ei9: "S2", ei13: "S3", ei17: "G4" } },
    "Foot": { impactType: "foot", probWeight: { "high": 0, "mid": 20, "low": 40 }, isStumble: true, isFumble: false, isAmputate: true, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "G5" } },
    "Wing": { impactType: "wing", probWeight: { "high": 150, "mid": 50, "low": 0 }, isStumble: false, isFumble: true, isAmputate: true, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "G5" } },
    "Tentacle": { impactType: "tentacle", probWeight: { "high": 50, "mid": 150, "low": 0 }, isStumble: false, isFumble: true, isAmputate: true, effectiveImpact: { ei1: "M1", ei5: "M1", ei9: "S2", ei13: "S3", ei17: "G4" } },
    "Tail": { impactType: "tail", probWeight: { "high": 0, "mid": 50, "low": 100 }, isStumble: true, isFumble: false, isAmputate: true, effectiveImpact: { ei1: "M1", ei5: "M1", ei9: "S2", ei13: "S3", ei17: "G4" } }
};

HM3.stdSkills = {
    "Sword": { "source": "HM3 Skills 19", "skillBase": { "formula": "@str, @dex, @dex, Angberelius:3, Ahnu, Nadai" }, "type": "Combat" },
    "Axe": { "source": "HM3 Skills 19", "skillBase": { "formula": "@str, @str, @dex, Ahnu, Feniri, Angberelius" }, "type": "Combat" },
    "Bow": { "source": "HM3 Skills 19", "skillBase": { "formula": "@str, @dex, @eye, Hirin, Tarael, Nadai" }, "type": "Combat" },
    "Shield": { "source": "HM3 Skills 19", "skillBase": { "formula": "@str, @dex, @dex, Ulandus, Lado, Masara" }, "type": "Combat" },
    "Flail": { "source": "HM3 Skills 19", "skillBase": { "formula": "@dex, @dex, @dex, Hirin, Tarael, Nadai" }, "type": "Combat" },
    "Sling": { "source": "HM3 Skills 19", "skillBase": { "formula": "@dex, @dex, @eye, Hirin, Tarael, Nadai" }, "type": "Combat" },
    "Riding": { "source": "HM3 Skills 18", "skillBase": { "formula": "@dex, @agl, @wil, Ulandus, Aralius" }, "type": "Combat" },
    "Initiative": { "source": "HM3 Skills 18", "skillBase": { "formula": "@agl, @wil, @wil" }, "type": "Combat" },
    "Unarmed": { "source": "HM3 Skills 18", "skillBase": { "formula": "@str, @dex, @agl, Madada:2, Lado:2, Ulandus:2" }, "type": "Combat" },
    "Polearm": { "source": "HM3 Skills 19", "skillBase": { "formula": "@str, @str, @dex, Angberelius, Aralius" }, "type": "Combat" },
    "Dagger": { "source": "HM3 Skills 19", "skillBase": { "formula": "@dex, @dex, @eye, Angberelius:2, Nadai:2" }, "type": "Combat" },
    "Blowgun": { "source": "HM3 Skills 19", "skillBase": { "formula": "@sta, @dex, @eye, Hirin:2, Tarael, Nadai" }, "type": "Combat" },
    "Spear": { "source": "HM3 Skills 19", "skillBase": { "formula": "@str, @str, @dex, Aralius, Feniri, Ulandus" }, "type": "Combat" },
    "Net": { "source": "HM3 Skills 19", "skillBase": { "formula": "@dex, @dex, @eye, Masara, Skorus, Lado" }, "type": "Combat" },
    "Club": { "source": "HM3 Skills 19", "skillBase": { "formula": "@str, @str, @dex, Ulandus, Aralius" }, "type": "Combat" },
    "Whip": { "source": "HM3 Skills 19", "skillBase": { "formula": "@dex, @dex, @eye, Hirin, Nadai" }, "type": "Combat" },
    "Dodge": { "source": "HM3 Skills 21", "skillBase": { "formula": "@agl, @agl, @agl" }, "type": "Combat" },
    "Acting": { "source": "HM3 Skills 11", "skillBase": { "formula": "@agl, @voi, @int, Tarael, Tai" }, "type": "Communication" },
    "Intrigue": { "source": "HM3 Skills 11", "skillBase": { "formula": "@int, @aur, @wil, Tai, Tarael, Skorus" }, "type": "Communication" },
    "Awareness": { "source": "HM3 Skills 11", "skillBase": { "formula": "@eye, @hrg, @sml, Hirin:2, Tarael:2" }, "type": "Communication" },
    "Oratory": { "source": "HM3 Skills 12", "skillBase": { "formula": "@cml, @voi, @int, Tarael" }, "type": "Communication" },
    "Script": { "source": "HM3 Skills 11", "skillBase": { "formula": "@dex, @eye, @int, Tarael, Tai" }, "type": "Communication" },
    "Rhetoric": { "source": "HM3 Skills 12", "skillBase": { "formula": "@voi, @int, @wil, Tai, Tarael, Skorus" }, "type": "Communication" },
    "Language": { "source": "HM3 Skills 10", "skillBase": { "formula": "@voi, @int, @wil, Tai" }, "type": "Communication" },
    "Musician": { "source": "HM3 Skills 12", "skillBase": { "formula": "@dex, @hrg, @hrg, Masara, Angberelius" }, "type": "Communication" },
    "Mental Conflict": { "source": "HM3 Skills 12", "skillBase": { "formula": "@aur, @wil, @wil" }, "type": "Communication" },
    "Singing": { "source": "HM3 Skills 12", "skillBase": { "formula": "@hrg, @voi, @voi, Masara" }, "type": "Communication" },
    "Lovecraft": { "source": "HM3 Skills 11", "skillBase": { "formula": "@cml, @agl, @voi, Masara, Angberelius" }, "type": "Communication" },
    "Physician": { "source": "HM3 Skills 17", "skillBase": { "formula": "@dex, @eye, @int, Masara:2, Skorus, Tai" }, "type": "Craft" },
    "Fishing": { "source": "HM3 Skills 14", "skillBase": { "formula": "@dex, @eye, @wil, Masara:2, Lado:2" }, "type": "Craft" },
    "Survival": { "source": "HM3 Skills 17", "skillBase": { "formula": "@str, @dex, @int, Ulandus:2, Aralius" }, "type": "Craft" },
    "Foraging": { "source": "HM3 Skills 15", "skillBase": { "formula": "@dex, @sml, @int, Ulandus:2, Aralius:2" }, "type": "Craft" },
    "Mathematics": { "source": "HM3 Skills 16", "skillBase": { "formula": "@int, @int, @wil, Tai:3, Tarael, Skorus" }, "type": "Craft" },
    "Folklore": { "source": "HM3 Skills 15", "skillBase": { "formula": "@voi, @int, @int, Tai:2" }, "type": "Craft" },
    "Jewelcraft": { "source": "HM3 Skills 16", "skillBase": { "formula": "@dex, @eye, @wil, Feniri:3, Tarael, Aralius" }, "type": "Craft" },
    "Tracking": { "source": "HM3 Skills 17", "skillBase": { "formula": "@eye, @sml, @wil, Ulandus:3, Aralius:3" }, "type": "Craft" },
    "Hunting": { "source": "HM3 Skills 16", "skillBase": { "formula": "@agl, @sml, @int, Ulandus:2, Aralius:2" }, "type": "Craft" },
    "Law": { "source": "HM3 Skills 16", "skillBase": { "formula": "@voi, @int, @wil, Tarael, Tai" }, "type": "Craft" },
    "Weaponcraft": { "source": "HM3 Skills 17", "skillBase": { "formula": "@str, @dex, @wil, Feniri:3, Ahnu, Angberelius" }, "type": "Craft" },
    "Mining": { "source": "HM3 Skills 16", "skillBase": { "formula": "@str, @eye, @int, Ulandus:2, Aralius:2, Feniri" }, "type": "Craft" },
    "Metalcraft": { "source": "HM3 Skills 16", "skillBase": { "formula": "@str, @dex, @wil, Feniri:3, Ahnu, Angberelius" }, "type": "Craft" },
    "Ceramics": { "source": "HM3 Skills 13", "skillBase": { "formula": "@dex, @dex, @eye, Ulandus:2, Aralius:2" }, "type": "Craft" },
    "Runecraft": { "source": "HM3 Skills 17", "skillBase": { "formula": "@int, @aur, @aur, Tai:2, Skorus" }, "type": "Craft" },
    "Tarotry": { "source": "HM3 Skills 17", "skillBase": { "formula": "@int, @aur, @wil, Tarael:2, Tai:2, Skorus, Hirin" }, "type": "Craft" },
    "Perfumery": { "source": "HM3 Skills 16", "skillBase": { "formula": "@sml, @sml, @int, Hirin, Skorus, Tarael" }, "type": "Craft" },
    "Fletching": { "source": "HM3 Skills 15", "skillBase": { "formula": "@dex, @dex, @eye, Hirin:2, Tarael, Nadai" }, "type": "Craft" },
    "Piloting": { "source": "HM3 Skills 17", "skillBase": { "formula": "@dex, @eye, @int, Lado:3, Masara" }, "type": "Craft" },
    "Weatherlore": { "source": "HM3 Skills 17", "skillBase": { "formula": "@int, @eye, @sml, Hirin, Tarael, Masada, Lado" }, "type": "Craft" },
    "Engineering": { "source": "HM3 Skills 14", "skillBase": { "formula": "@dex, @int, @int, Ulandus:2, Aralius:2, Feniri" }, "type": "Craft" },
    "Embalming": { "source": "HM3 Skills 14", "skillBase": { "formula": "@dex, @eye, @sml, Skorus, Ulandus" }, "type": "Craft" },
    "Brewing": { "source": "HM3 Skills 13", "skillBase": { "formula": "@dex, @sml, @sml, Skorus:3, Tai:2, Masara:2" }, "type": "Craft" },
    "Lockcraft": { "source": "HM3 Skills 16", "skillBase": { "formula": "@dex, @eye, @wil, Feniri" }, "type": "Craft" },
    "Masonry": { "source": "HM3 Skills 16", "skillBase": { "formula": "@str, @dex, @int, Ulandus:2, Aralius:2" }, "type": "Craft" },
    "Textilecraft": { "source": "HM3 Skills 17", "skillBase": { "formula": "@dex, @dex, @eye, Ulandus, Aralius" }, "type": "Craft" },
    "Cookery": { "source": "HM3 Skills 13", "skillBase": { "formula": "@dex, @sml, @sml, Skorus" }, "type": "Craft" },
    "Lore": { "source": "HM3 Skills 16", "skillBase": { "formula": "@eye, @int, @int, Tai:2" }, "type": "Craft" },
    "Drawing": { "source": "HM3 Skills 13", "skillBase": { "formula": "@dex, @eye, @eye, Skorus, Tai" }, "type": "Craft" },
    "Alchemy": { "source": "HM3 Skills 13", "skillBase": { "formula": "@sml, @int, @aur, Skorus:3, Tai:2, Masara:2" }, "type": "Craft" },
    "Milling": { "source": "HM3 Skills 16", "skillBase": { "formula": "@str, @dex, @sml, Ulandus" }, "type": "Craft" },
    "Timbercraft": { "source": "HM3 Skills 17", "skillBase": { "formula": "@str, @dex, @agl, Ulandus:3, Aralius" }, "type": "Craft" },
    "Hidework": { "source": "HM3 Skills 15", "skillBase": { "formula": "@dex, @sml, @wil, Ulandis, Aralius" }, "type": "Craft" },
    "Shipwright": { "source": "HM3 Skills 17", "skillBase": { "formula": "@str, @dex, @int, Lado:3, Masara" }, "type": "Craft" },
    "Astrology": { "source": "HM3 Skills 13", "skillBase": { "formula": "@eye, @int, @aur, Tarael" }, "type": "Craft" },
    "Woodcraft": { "source": "HM3 Skills 17", "skillBase": { "formula": "@dex, @dex, @wil, Ulandus:2, Aralius, Lado" }, "type": "Craft" },
    "Herblore": { "source": "HM3 Skills 15", "skillBase": { "formula": "@eye, @sml, @int, Ulandus:3, Aralius:2" }, "type": "Craft" },
    "Inkcraft": { "source": "HM3 Skills 16", "skillBase": { "formula": "@eye, @sml, @int, Skorus:2, Tai" }, "type": "Craft" },
    "Heraldry": { "source": "HM3 Skills 15", "skillBase": { "formula": "@dex, @eye, @wil, Skorus, Tai" }, "type": "Craft" },
    "Animalcraft": { "source": "HM3 Skills 13", "skillBase": { "formula": "@agl, @voi, @wil, Ulandus, Aralius" }, "type": "Craft" },
    "Seamanship": { "source": "HM3 Skills 17", "skillBase": { "formula": "@str, @dex, @agl, Lado:3, Masara, Skorus" }, "type": "Craft" },
    "Glassworking": { "source": "HM3 Skills 15", "skillBase": { "formula": "@dex, @eye, @wil, Feniri:2" }, "type": "Craft" },
    "Agriculture": { "source": "HM3 Skills 13", "skillBase": { "formula": "@str, @sta, @wil, Ulandus:2, Aralius:2" }, "type": "Craft" },
    "Lyahvi": { "source": "HM Magic, Shek-Pvar 6", "skillBase": { "formula": "@aur, @aur, @eye, Ulandus:-3, Aralius:-2,Feneri:-1, Angberelius, Nadai:2, Hirin:3, Tarael:2, Tai,Masara:-1, Lado:-2" }, "type": "Magic" },
    "Savorya": { "source": "HM Magic, Shek-pvar 6", "skillBase": { "formula": "@aur, @aur, @int, Ulandus:-1, Aralius:-2, Feneri:-3, Ahnu:-2, Angberelius:-1, Hirin:1, Tarael:2, Tai:3, Skorus:2, Masara" }, "type": "Magic" },
    "Peleahn": { "source": "HM Magic, Shek-pvar 6", "skillBase": { "formula": "@aur, @aur, @agl, Ulandus:-1, Feneri, Ahnu:2, Angberelius:3, Nadai:2, Hirin, Tai:-1, Skorus:-2, Masara:-3, Lado:-2" }, "type": "Magic" },
    "Jmorvi": { "source": "HM Magic, Shek-pvar 6", "skillBase": { "formula": "@aur, @aur, @str, Ulandus, Aralius:2, Feneri:3, Ahnu:2, Angberelius:1, Hirin:-1, Tarael:-2, Tai:-3, Skorus:-2, Masara:-1" }, "type": "Magic" },
    "Odivshe": { "source": "HM Magic, Shek-pvar 6", "skillBase": { "formula": "@aur, @aur, @dex, Ulandus, Feneri:-1, Ahnu:-2, Angberelius:-3, Nadai:-2, Hirin:-1, Tai:1, Skorus:2, Masara:3, Lado:2" }, "type": "Magic" },
    "Neutral": { "source": "HM Magic, Shek-pvar 6", "skillBase": { "formula": "@aur, @aur, @wil" }, "type": "Magic" },
    "Fyvria": { "source": "HM Magic, Shek-pvar 6", "skillBase": { "formula": "@aur, @aur, @sml, Ulandus:3, Aralius:2, Feneri:1, Angberelius:-1, Nadai:-2, Hirin:-3, Tarael:-2, Tai:-1, Masara, Lado:2" }, "type": "Magic" },
    "Climbing": { "source": "HM3 Skills 8", "skillBase": { "formula": "@str, @dex, @agl, Ulandus:2, Aralius:2" }, "type": "Physical" },
    "Swimming": { "source": "HM3 Skills 9", "skillBase": { "formula": "@sta, @dex, @agl, Skorus, Masara:3, Lado:3" }, "type": "Physical" },
    "Skiing": { "source": "HM3 Skills 9", "skillBase": { "formula": "@str, @dex, @agl, Masara:2, Skorus, Lado" }, "type": "Physical" },
    "Stealth": { "source": "HM3 Skills 9", "skillBase": { "formula": "@agl, @hrg, @wil, Hirin:2, Tarael:2, Tai:2" }, "type": "Physical" },
    "Jumping": { "source": "HM3 Skills 9", "skillBase": { "formula": "@str, @agl, @agl, Nadai:2, Hirin:2" }, "type": "Physical" },
    "Condition": { "source": "HM3 Skills 9", "skillBase": { "formula": "@str, @sta, @wil, Ulandus, Lado" }, "type": "Physical" },
    "Dancing": { "source": "HM3 Skills 9", "skillBase": { "formula": "@Dex, @agl, @agl, Tarael:2, Hirin, Tai" }, "type": "Physical" },
    "Acrobatics": { "source": "HM3 Skills 8", "skillBase": { "formula": "@str, @agl, @agl, Nadai:2, Hirin" }, "type": "Physical" },
    "Throwing": { "source": "HM3 Skills 10", "skillBase": { "formula": "@str, @dex, @eye, Hirin:2, Tarael, Nadai" }, "type": "Physical" },
    "Legerdemain": { "source": "HM3 Skills 9", "skillBase": { "formula": "@dex, @dex, @wil, Skorus:2, Tai:2, Tarael:2" }, "type": "Physical" },
    "Peoni": { "source": "HM Religion, Peoni 1", "skillBase": { "formula": "@voi, @int, @dex, Aralius:2, Angberelius, Ulandus" }, "type": "Ritual" },
    "Agrik": { "source": "HM Religion, Agrik 1", "skillBase": { "formula": "@voi, @int, @str, Nadai:2, Angberelius, Ahnu" }, "type": "Ritual" },
    "Ilvir": { "source": "HM Religion, Ilvir 1", "skillBase": { "formula": "@voi, @int, @aur, Skorus:2, Tai, Ulandus" }, "type": "Ritual" },
    "Siem": { "source": "HM Religion, Siem 1", "skillBase": { "formula": "@voi, @int, @aur, Hirin:2, Feniri, Ulandus" }, "type": "Ritual" },
    "Sarajin": { "source": "HM Religion, Sarajin 1", "skillBase": { "formula": "@voi, @int, @str, Feniri:2, Aralius, Lado" }, "type": "Ritual" },
    "Morgath": { "source": "HM Religion, Morgath 1", "skillBase": { "formula": "@voi, @int, @aur, Lado:2, Ahnu, Masara" }, "type": "Ritual" },
    "Halea": { "source": "HM Religion, Halea 1", "skillBase": { "formula": "@voi, @int, @cml, Tarael:2, Hirin, Masara" }, "type": "Ritual" },
    "Naveh": { "source": "HM Religion, Naveh 1", "skillBase": { "formula": "@voi, @int, @wil, Masara:2, Skorus, Tarael" }, "type": "Ritual" },
    "Larani": { "source": "HM Religion, Larani 1", "skillBase": { "formula": "@voi, @int, @wil, Angberelius:2, Ahnu, Feniri" }, "type": "Ritual" },
    "Save K'nor": { "source": "HM Religion, Save K'nor 1", "skillBase": { "formula": "@voi, @int, @int, Tai:2, Tarael, Skorus" }, "type": "Craft" }
};

HM3.injuryLevels = ["NA", "M1", "S2", "S3", "G4", "G5", "K4", "K5"];

HM3.activeEffectKey = {
    'system.eph.meleeAMLMod': 'Melee Attacks',
    'system.eph.meleeDMLMod': 'Melee Defenses',
    'system.eph.missileAMLMod': 'Missile Attacks',
    'system.eph.outnumbered': 'Outnumbered',
    'system.eph.itemAMLMod': 'Weapon Attack ML',
    'system.eph.itemDMLMod': 'Weapon Defense ML',
    'system.eph.itemEMLMod': 'Skill EML',
    'system.eph.commSkillsMod': 'Communication Skills EML',
    'system.eph.physicalSkillsMod': 'Physical Skills EML',
    'system.eph.combatSkillsMod': 'Combat Skills EML',
    'system.eph.craftSkillsMod': 'Craft Skills EML',
    'system.eph.ritualSkillsMod': 'Ritual Skills EML',
    'system.eph.magicSkillsMod': 'Magic Skills EML',
    'system.eph.psionicTalentsMod': 'Psionic Talents EML',
    'system.universalPenalty': 'Universal Penalty',
    'system.physicalPenalty': 'Physical Penalty',
    'system.eph.fatigue': 'Fatigue',
    'system.encumbrance': 'Encumbrance',
    'system.endurance': 'Endurance',
    'system.eph.totalInjuryLevels': 'Injury Level',
    'system.eph.move': 'Move',
    'system.eph.strength': 'Strength',
    'system.eph.stamina': 'Stamina',
    'system.eph.dexterity': 'Dexterity',
    'system.eph.agility': 'Agility',
    'system.eph.eyesight': 'Eyesight',
    'system.eph.hearing': 'Hearing',
    'system.eph.smell': 'Smell',
    'system.eph.voice': 'Voice',
    'system.eph.intelligence': 'Intelligence',
    'system.eph.will': 'Will',
    'system.eph.aura': 'Aura',
    'system.eph.morality': 'Morality',
    'system.eph.comeliness': 'Comeliness'
};

HM3.defaultMagicIconName = 'pentacle';
HM3.defaultRitualIconName = 'circle';
HM3.defaultMiscItemIconName = 'miscgear';
HM3.defaultPsionicsIconName = 'psionics';
HM3.defaultArmorGearIconName = 'armor';
HM3.defaultContainerIconName = 'sack';

HM3.magicIcons = [
    ['pentacle', 'systems/hm3/images/icons/svg/pentacle.svg'],
    ['lyahvi', 'systems/hm3/images/icons/svg/wind.svg'],
    ['peleahn', 'systems/hm3/images/icons/svg/fire.svg'],
    ['jmorvi', 'systems/hm3/images/icons/svg/anvil.svg'],
    ['fyvria', 'systems/hm3/images/icons/svg/tree.svg'],
    ['odivshe', 'systems/hm3/images/icons/svg/water.svg'],
    ['savorya', 'systems/hm3/images/icons/svg/divination.svg'],
    ['neutral', 'systems/hm3/images/icons/svg/pentacle.svg']
];

HM3.ritualIcons = [
    ['circle', 'systems/hm3/images/icons/svg/circle.svg'],
    ['agrik', 'systems/hm3/images/icons/png/agrik.png'],
    ['halea', 'systems/hm3/images/icons/png/halea.png'],
    ['ilvir', 'systems/hm3/images/icons/png/ilvir.png'],
    ['larani', 'systems/hm3/images/icons/png/larani.png'],
    ['morgath', 'systems/hm3/images/icons/png/morgath.png'],
    ['naveh', 'systems/hm3/images/icons/png/naveh.png'],
    ['peoni', 'systems/hm3/images/icons/png/peoni.png'],
    ['sarajin', 'systems/hm3/images/icons/png/sarajin.png'],
    ["save k'nor", 'systems/hm3/images/icons/png/saveknor.png'],
    ['save k’nor', 'systems/hm3/images/icons/png/saveknor.png'],
    ['save knor', 'systems/hm3/images/icons/png/saveknor.png'],
    ['siem', 'systems/hm3/images/icons/png/siem.png']
];

HM3.psionicTalentIcons = [
    ['psionics', 'systems/hm3/images/icons/svg/psionics.svg']
];

HM3.physicalSkillIcons = [
    ['acrobatics', 'systems/hm3/images/icons/svg/acrobatics.svg'],
    ['climbing', 'systems/hm3/images/icons/svg/climbing.svg'],
    ['condition', 'systems/hm3/images/icons/svg/muscle.svg'],
    ['dancing', 'systems/hm3/images/icons/svg/dance.svg'],
    ['jumping', 'systems/hm3/images/icons/svg/jump.svg'],
    ['legerdemain', 'systems/hm3/images/icons/svg/juggler.svg'],
    ['skiing', 'systems/hm3/images/icons/svg/ski.svg'],
    ['stealth', 'systems/hm3/images/icons/svg/stealth.svg'],
    ['swimming', 'systems/hm3/images/icons/svg/swimming.svg'],
    ['throwing', 'systems/hm3/images/icons/svg/throw.svg']
];

HM3.commSkillIcons = [
    ['acting', 'systems/hm3/images/icons/svg/acting.svg'],
    ['awareness', 'systems/hm3/images/icons/svg/awareness.svg'],
    ['intrigue', 'systems/hm3/images/icons/svg/cloak-dagger.svg'],
    ['lovecraft', 'systems/hm3/images/icons/svg/love.svg'],
    ['mental conflict', 'systems/hm3/images/icons/svg/mental.svg'],
    ['musician', 'systems/hm3/images/icons/svg/harp.svg'],
    ['oratory', 'systems/hm3/images/icons/svg/oratory.svg'],
    ['rhetoric', 'systems/hm3/images/icons/svg/rhetoric.svg'],
    ['command', 'systems/hm3/images/icons/svg/rhetoric.svg'],
    ['diplomacy', 'systems/hm3/images/icons/svg/rhetoric.svg'],
    ['intimidation', 'systems/hm3/images/icons/svg/rhetoric.svg'],
    ['singing', 'systems/hm3/images/icons/svg/musician-singing.svg'],
    ['language', 'systems/hm3/images/icons/svg/speaking.svg'],
    ['script', 'systems/hm3/images/icons/svg/scroll.svg']
];

HM3.combatSkillIcons = [
    ['unarmed', 'systems/hm3/images/icons/svg/punch.svg'],
    ['brawling', 'systems/hm3/images/icons/svg/punch.svg'],
    ['wrestling', 'systems/hm3/images/icons/svg/punch.svg'],
    ['martial arts', 'systems/hm3/images/icons/svg/punch.svg'],
    ['dodge', 'systems/hm3/images/icons/svg/dodge.svg'],
    ['initiative', 'systems/hm3/images/icons/svg/initiative.svg'],
    ['riding', 'systems/hm3/images/icons/svg/horse-riding.svg']
];

HM3.weaponSkillIcons = [
    ['axe', 'systems/hm3/images/icons/svg/axe.svg'],
    ['battleaxe', 'systems/hm3/images/icons/svg/axe.svg'],
    ['handaxe', 'systems/hm3/images/icons/svg/axe.svg'],
    ['shorkana', 'systems/hm3/images/icons/svg/axe.svg'],
    ['pickaxe', 'systems/hm3/images/icons/svg/axe.svg'],
    ['sickle', 'systems/hm3/images/icons/svg/axe.svg'],
    ['hatchet', 'systems/hm3/images/icons/svg/axe.svg'],
    ['warhammer', 'systems/hm3/images/icons/svg/warhammer.svg'],
    ['war hammer', 'systems/hm3/images/icons/svg/warhammer.svg'],
    ['bow', 'systems/hm3/images/icons/svg/longbow.svg'],
    ['longbow', 'systems/hm3/images/icons/svg/longbow.svg'],
    ['long bow', 'systems/hm3/images/icons/svg/longbow.svg'],
    ['shortbow', 'systems/hm3/images/icons/svg/longbow.svg'],
    ['short bow', 'systems/hm3/images/icons/svg/longbow.svg'],
    ['hart bow', 'systems/hm3/images/icons/svg/longbow.svg'],
    ['hartbow', 'systems/hm3/images/icons/svg/longbow.svg'],
    ['crossbow', 'systems/hm3/images/icons/svg/crossbow.svg'],
    ['club', 'systems/hm3/images/icons/svg/club.svg'],
    ['stick', 'systems/hm3/images/icons/svg/club.svg'],
    ['mace', 'systems/hm3/images/icons/svg/mace.svg'],
    ['maul', 'systems/hm3/images/icons/svg/hammer.svg'],
    ['morningstar', 'systems/hm3/images/icons/svg/mace.svg'],
    ['dagger', 'systems/hm3/images/icons/svg/dagger.svg'],
    ['taburi', 'systems/hm3/images/icons/svg/dagger.svg'],
    ['keltan', 'systems/hm3/images/icons/svg/dagger.svg'],
    ['knife', 'systems/hm3/images/icons/svg/dagger.svg'],
    ['toburi', 'systems/hm3/images/icons/svg/dagger.svg'],
    ['flail', 'systems/hm3/images/icons/svg/flail.svg'],
    ['warflail', 'systems/hm3/images/icons/svg/flail.svg'],
    ['nachakas', 'systems/hm3/images/icons/svg/flail.svg'],
    ['grainflail', 'systems/hm3/images/icons/svg/flail.svg'],
    ['net', 'systems/hm3/images/icons/svg/net.svg'],
    ['polearm', 'systems/hm3/images/icons/svg/polearm.svg'],
    ['trident', 'systems/hm3/images/icons/svg/trident.svg'],
    ['lance', 'systems/hm3/images/icons/svg/lance.svg'],
    ['glaive', 'systems/hm3/images/icons/svg/polearm.svg'],
    ['pike', 'systems/hm3/images/icons/svg/polearm.svg'],
    ['poleaxe', 'systems/hm3/images/icons/svg/polearm.svg'],
    ['jousting pole', 'systems/hm3/images/icons/svg/lance.svg'],
    ['bill', 'systems/hm3/images/icons/svg/polearm.svg'],
    ['shield', 'systems/hm3/images/icons/svg/shield.svg'],
    ['round shield', 'systems/hm3/images/icons/svg/round-shield.svg'],
    ['buckler', 'systems/hm3/images/icons/svg/round-shield.svg'],
    ['knight shield', 'systems/hm3/images/icons/svg/shield.svg'],
    ['kite shield', 'systems/hm3/images/icons/svg/shield.svg'],
    ['tower shield', 'systems/hm3/images/icons/svg/shield.svg'],
    ['spear', 'systems/hm3/images/icons/svg/spear.svg'],
    ['javelin', 'systems/hm3/images/icons/svg/spear.svg'],
    ['staff', 'systems/hm3/images/icons/svg/staff.svg'],
    ['sword', 'systems/hm3/images/icons/svg/sword.svg'],
    ['falchion', 'systems/hm3/images/icons/svg/sword.svg'],
    ['broadsword', 'systems/hm3/images/icons/svg/sword.svg'],
    ['battlesword', 'systems/hm3/images/icons/svg/sword.svg'],
    ['estoc', 'systems/hm3/images/icons/svg/sword.svg'],
    ['mang', 'systems/hm3/images/icons/svg/sword.svg'],
    ['mankar', 'systems/hm3/images/icons/svg/sword.svg'],
    ['longknife', 'systems/hm3/images/icons/svg/sword.svg'],
    ['battle sword', 'systems/hm3/images/icons/svg/sword.svg'],
    ['longsword', 'systems/hm3/images/icons/svg/sword.svg'],
    ['shortsword', 'systems/hm3/images/icons/svg/sword.svg'],
    ['long sword', 'systems/hm3/images/icons/svg/sword.svg'],
    ['short sword', 'systems/hm3/images/icons/svg/sword.svg'],
    ['bastard sword', 'systems/hm3/images/icons/svg/sword.svg'],
    ['long knife', 'systems/hm3/images/icons/svg/sword.svg'],
    ['whip', 'systems/hm3/images/icons/svg/whip.svg'],
    ['hammer', 'systems/hm3/images/icons/svg/hammer.svg'],
    ['arrow', 'systems/hm3/images/icons/svg/arrow.svg'],
    ['sling', 'systems/hm3/images/icons/svg/sling.svg'],
    ['bolt', 'systems/hm3/images/icons/svg/arrow.svg'],
    ['stone', 'systems/hm3/images/icons/svg/stones.svg'],
    ['bullet', 'systems/hm3/images/icons/svg/stones.svg'],
    ['fangs', 'systems/hm3/images/icons/svg/fangs.svg'],
    ['claw', 'systems/hm3/images/icons/svg/claw.svg'],
    ['hoof', 'systems/hm3/images/icons/svg/hoof.svg'],
    ['horns', 'systems/hm3/images/icons/svg/horns.svg']
];

HM3.craftSkillIcons = [
    ['agriculture', 'systems/hm3/images/icons/svg/agriculture.svg'],
    ['alchemy', 'systems/hm3/images/icons/svg/caduceus.svg'],
    ['animalcraft', 'systems/hm3/images/icons/svg/animalcraft.svg'],
    ['astrology', 'systems/hm3/images/icons/svg/astrology.svg'],
    ['brewing', 'systems/hm3/images/icons/svg/brewing.svg'],
    ['ceramics', 'systems/hm3/images/icons/svg/ceramics.svg'],
    ['cookery', 'systems/hm3/images/icons/svg/cookery.svg'],
    ['cooking', 'systems/hm3/images/icons/svg/cookery.svg'],
    ['drawing', 'systems/hm3/images/icons/svg/drawing.svg'],
    ['embalming', 'systems/hm3/images/icons/svg/embalming.svg'],
    ['engineering', 'systems/hm3/images/icons/svg/engineering.svg'],
    ['fishing', 'systems/hm3/images/icons/svg/fishing.svg'],
    ['fletching', 'systems/hm3/images/icons/svg/arrow.svg'],
    ['folklore', 'systems/hm3/images/icons/svg/unicorn.svg'],
    ['foraging', 'systems/hm3/images/icons/svg/foraging.svg'],
    ['glassworking', 'systems/hm3/images/icons/svg/glassworking.svg'],
    ['glasscraft', 'systems/hm3/images/icons/svg/glassworking.svg'],
    ['heraldry', 'systems/hm3/images/icons/svg/heraldry.svg'],
    ['herblore', 'systems/hm3/images/icons/svg/herblore.svg'],
    ['hunting', 'systems/hm3/images/icons/svg/hunting.svg'],
    ['hidework', 'systems/hm3/images/icons/svg/hidework.svg'],
    ['inkcraft', 'systems/hm3/images/icons/svg/ink.svg'],
    ['jewelcraft', 'systems/hm3/images/icons/svg/jewel.svg'],
    ['law', 'systems/hm3/images/icons/svg/law.svg'],
    ['lockcraft', 'systems/hm3/images/icons/svg/lock.svg'],
    ['lore', 'systems/hm3/images/icons/svg/lore.svg'],
    ['masonry', 'systems/hm3/images/icons/svg/masonry.svg'],
    ['mathematics', 'systems/hm3/images/icons/svg/mathematics.svg'],
    ['metalcraft', 'systems/hm3/images/icons/svg/anvil.svg'],
    ['milling', 'systems/hm3/images/icons/svg/water-mill.svg'],
    ['mining', 'systems/hm3/images/icons/svg/mining.svg'],
    ['perfumery', 'systems/hm3/images/icons/svg/perfume.svg'],
    ['physician', 'systems/hm3/images/icons/svg/caduceus.svg'],
    ['piloting', 'systems/hm3/images/icons/svg/piloting.svg'],
    ['pilot', 'systems/hm3/images/icons/svg/piloting.svg'],
    ['runecraft', 'systems/hm3/images/icons/svg/runecraft.svg'],
    ['seamanship', 'systems/hm3/images/icons/svg/anchor.svg'],
    ['shipwright', 'systems/hm3/images/icons/svg/ship.svg'],
    ['survival', 'systems/hm3/images/icons/svg/survival.svg'],
    ['tarotry', 'systems/hm3/images/icons/svg/tarotry.svg'],
    ['textilecraft', 'systems/hm3/images/icons/svg/textilecraft.svg'],
    ['timbercraft', 'systems/hm3/images/icons/svg/timber.svg'],
    ['tracking', 'systems/hm3/images/icons/svg/tracking.svg'],
    ['weaponcraft', 'systems/hm3/images/icons/svg/sword.svg'],
    ['weatherlore', 'systems/hm3/images/icons/svg/weather.svg'],
    ['woodcraft', 'systems/hm3/images/icons/svg/woodcraft.svg']
];

HM3.armorGearIcons = [
    ['armorgear', 'systems/hm3/images/icons/svg/armor.svg'],
    ['abdominal armor', 'systems/hm3/images/icons/svg/abdominal-armor.svg'],
    ['armor vest', 'systems/hm3/images/icons/svg/armor-vest.svg'],
    ['barbute', 'systems/hm3/images/icons/svg/barbute.svg'],
    ['black knight helm', 'systems/hm3/images/icons/svg/black-knight-helm.svg'],
    ['bracer', 'systems/hm3/images/icons/svg/bracer.svg'],
    ['breastplate', 'systems/hm3/images/icons/svg/breastplate.svg'],
    ['cap', 'systems/hm3/images/icons/svg/cap.svg'],
    ['chainmail', 'systems/hm3/images/icons/svg/chain-mail.svg'],
    ['chest armor', 'systems/hm3/images/icons/svg/chest-armor.svg'],
    ['closed barbute', 'systems/hm3/images/icons/svg/closed-barbute.svg'],
    ['crested helm', 'systems/hm3/images/icons/svg/crested-helm.svg'],
    ['dorsal scales', 'systems/hm3/images/icons/svg/dorsal-scales.svg'],
    ['elbow pad', 'systems/hm3/images/icons/svg/elbow-pad.svg'],
    ['fish scales', 'systems/hm3/images/icons/svg/fish-scales.svg'],
    ['gloves', 'systems/hm3/images/icons/svg/gloves.svg'],
    ['greaves', 'systems/hm3/images/icons/svg/greaves.svg'],
    ['guantlet', 'systems/hm3/images/icons/svg/gauntlet.svg'],
    ['heavy helm', 'systems/hm3/images/icons/svg/heavy-helm.svg'],
    ['helm', 'systems/hm3/images/icons/svg/helm.svg'],
    ['hood', 'systems/hm3/images/icons/svg/hood.svg'],
    ['knee pad', 'systems/hm3/images/icons/svg/knee-pad.svg'],
    ['lamellar', 'systems/hm3/images/icons/svg/lamellar.svg'],
    ['leather armor', 'systems/hm3/images/icons/svg/leather-armor.svg'],
    ['leather boot', 'systems/hm3/images/icons/svg/leather-boot.svg'],
    ['leather vest', 'systems/hm3/images/icons/svg/leather-vest.svg'],
    ['leg armor', 'systems/hm3/images/icons/svg/leg-armor.svg'],
    ['leggings', 'systems/hm3/images/icons/svg/leggings.svg'],
    ['light helm', 'systems/hm3/images/icons/svg/light-helm.svg'],
    ['mail shirt', 'systems/hm3/images/icons/svg/mail-shirt.svg'],
    ['mailed fist', 'systems/hm3/images/icons/svg/mailed-fist.svg'],
    ['metal skirt', 'systems/hm3/images/icons/svg/metal-skirt.svg'],
    ['pauldrons', 'systems/hm3/images/icons/svg/pauldrons.svg'],
    ['robe', 'systems/hm3/images/icons/svg/robe.svg'],
    ['scale mail', 'systems/hm3/images/icons/svg/scale-mail.svg'],
    ['scales', 'systems/hm3/images/icons/svg/scales.svg'],
    ['shirt', 'systems/hm3/images/icons/svg/shirt.svg'],
    ['shoe', 'systems/hm3/images/icons/svg/shoe.svg'],
    ['shoulder scales', 'systems/hm3/images/icons/svg/shoulder-scales.svg'],
    ['steeltoe boots', 'systems/hm3/images/icons/svg/steeltoe-boots.svg'],
    ['trousers', 'systems/hm3/images/icons/svg/trousers.svg'],
    ['tunic', 'systems/hm3/images/icons/svg/tunic.svg'],
    ['visored helm', 'systems/hm3/images/icons/svg/visored-helm.svg']
];

HM3.miscGearIcons = [
    ['miscgear', 'systems/hm3/images/icons/svg/miscgear.svg'],
    ['coin', 'systems/hm3/images/icons/svg/coins.svg'],
    ['farthing', 'systems/hm3/images/icons/svg/coins.svg'],
    ['pence', 'systems/hm3/images/icons/svg/coins.svg'],
    ['pennies', 'systems/hm3/images/icons/svg/coins.svg'],
    ['penny', 'systems/hm3/images/icons/svg/coins.svg'],
    ['silver coins', 'systems/hm3/images/icons/svg/coins.svg'],
    ['silver pieces', 'systems/hm3/images/icons/svg/coins.svg'],
    ['silver pennies', 'systems/hm3/images/icons/svg/coins.svg'],
    ['silver penny', 'systems/hm3/images/icons/svg/coins.svg'],
    ['shilling', 'systems/hm3/images/icons/svg/coins.svg'],
    ['gold crown', 'systems/hm3/images/icons/svg/coins.svg'],
    ['gold piece', 'systems/hm3/images/icons/svg/coins.svg'],
    ['khuzan gold crown', 'systems/hm3/images/icons/svg/coins.svg'],
    ['khuzan crown', 'systems/hm3/images/icons/svg/coins.svg'],
    ['sack', 'systems/hm3/images/icons/svg/sack.svg'],
    ['backpack', 'systems/hm3/images/icons/svg/sack.svg'],
    ['pouch', 'systems/hm3/images/icons/svg/sack.svg'],
    ['belt pouch', 'systems/hm3/images/icons/svg/sack.svg'],
    ['torch', 'systems/hm3/images/icons/svg/torch.svg'],
    ['candle', 'systems/hm3/images/icons/svg/candle.svg'],
    ['pence', 'systems/hm3/images/icons/svg/coins.svg'],
    ['pence', 'systems/hm3/images/icons/svg/coins.svg'],
    ['pence', 'systems/hm3/images/icons/svg/coins.svg'],
    ['helm', 'systems/hm3/images/icons/svg/helm.svg'],
    ['steel helm', 'systems/hm3/images/icons/svg/helm.svg']
];

HM3.defaultItemIcons = new Map(
    HM3.physicalSkillIcons
        .concat(HM3.commSkillIcons)
        .concat(HM3.combatSkillIcons)
        .concat(HM3.weaponSkillIcons)
        .concat(HM3.craftSkillIcons)
        .concat(HM3.miscGearIcons)
        .concat(HM3.armorGearIcons)
        .concat(HM3.ritualIcons)
        .concat(HM3.magicIcons)
        .concat(HM3.psionicTalentIcons)
);

HM3.meleeCombatTable = {
    'block': {
        'cf:cf': { atkFumble: true, defFumble: true, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 0, defDice: 0 },
        'mf:cf': { atkFumble: false, defFumble: true, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 0, defDice: 0 },
        'ms:cf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 2, defDice: 0 },
        'cs:cf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 3, defDice: 0 },

        'cf:mf': { atkFumble: true, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 0, defDice: 0 },
        'mf:mf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: true, atkDice: 0, defDice: 0 },
        'ms:mf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 1, defDice: 0 },
        'cs:mf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 2, defDice: 0 },

        'cf:ms': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: true, block: false, miss: false, atkDice: 0, defDice: 0 },
        'mf:ms': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: true, block: false, miss: false, atkDice: 0, defDice: 0 },
        'ms:ms': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: true, atkDice: 0, defDice: 0 },
        'cs:ms': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 1, defDice: 0 },

        'cf:cs': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: true, block: false, miss: false, atkDice: 0, defDice: 0 },
        'mf:cs': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: true, block: false, miss: false, atkDice: 0, defDice: 0 },
        'ms:cs': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: true, block: false, miss: false, atkDice: 0, defDice: 0 },
        'cs:cs': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: true, atkDice: 0, defDice: 0 }
    },
    'counterstrike': {
        'cf:cf': { atkFumble: true, defFumble: true, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 0, defDice: 0 },
        'mf:cf': { atkFumble: false, defFumble: true, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 0, defDice: 0 },
        'ms:cf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 3, defDice: 0 },
        'cs:cf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 4, defDice: 0 },

        'cf:mf': { atkFumble: true, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 0, defDice: 0 },
        'mf:mf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: true, atkDice: 0, defDice: 0 },
        'ms:mf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 2, defDice: 0 },
        'cs:mf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 3, defDice: 0 },

        'cf:ms': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 0, defDice: 2 },
        'mf:ms': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 0, defDice: 1 },
        'ms:ms': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 1, defDice: 1 },
        'cs:ms': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 1, defDice: 0 },

        'cf:cs': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 0, defDice: 3 },
        'mf:cs': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 0, defDice: 2 },
        'ms:cs': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 0, defDice: 1 },
        'cs:cs': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 2, defDice: 2 }
    },
    'dodge': {
        'cf:cf': { atkFumble: false, defFumble: false, atkStumble: true, defStumble: true, dta: false, block: false, miss: false, atkDice: 0, defDice: 0 },
        'mf:cf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: true, dta: false, block: false, miss: false, atkDice: 0, defDice: 0 },
        'ms:cf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 2, defDice: 0 },
        'cs:cf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 3, defDice: 0 },

        'cf:mf': { atkFumble: false, defFumble: false, atkStumble: true, defStumble: false, dta: false, block: false, miss: false, atkDice: 0, defDice: 0 },
        'mf:mf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: true, atkDice: 0, defDice: 0 },
        'ms:mf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 1, defDice: 0 },
        'cs:mf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 2, defDice: 0 },

        'cf:ms': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: true, block: false, miss: false, atkDice: 0, defDice: 0 },
        'mf:ms': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: true, atkDice: 0, defDice: 0 },
        'ms:ms': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: true, atkDice: 0, defDice: 0 },
        'cs:ms': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 1, defDice: 0 },

        'cf:cs': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: true, block: false, miss: false, atkDice: 0, defDice: 0 },
        'mf:cs': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: true, block: false, miss: false, atkDice: 0, defDice: 0 },
        'ms:cs': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: true, atkDice: 0, defDice: 0 },
        'cs:cs': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: true, atkDice: 0, defDice: 0 }
    },
    'ignore': {
        'cf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: true, block: false, miss: false, atkDice: 0, defDice: 0 },
        'mf': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 1, defDice: 0 },
        'ms': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 3, defDice: 0 },
        'cs': { atkFumble: false, defFumble: false, atkStumble: false, defStumble: false, dta: false, block: false, miss: false, atkDice: 4, defDice: 0 }
    }
};

HM3.missileCombatTable = {
    'block': {
        'cf:cf': { wild: true, block: false, miss: false, atkDice: 0 },
        'mf:cf': { wild: false, block: false, miss: true, atkDice: 0 },
        'ms:cf': { wild: false, block: false, miss: false, atkDice: 2 },
        'cs:cf': { wild: false, block: false, miss: false, atkDice: 3 },

        'cf:mf': { wild: true, block: false, miss: false, atkDice: 0 },
        'mf:mf': { wild: false, block: false, miss: true, atkDice: 0 },
        'ms:mf': { wild: false, block: false, miss: false, atkDice: 1 },
        'cs:mf': { wild: false, block: false, miss: false, atkDice: 2 },

        'cf:ms': { wild: true, block: false, miss: false, atkDice: 0 },
        'mf:ms': { wild: false, block: false, miss: true, atkDice: 0 },
        'ms:ms': { wild: false, block: true, miss: false, atkDice: 0 },
        'cs:ms': { wild: false, block: false, miss: false, atkDice: 1 },

        'cf:cs': { wild: true, block: false, miss: false, atkDice: 0 },
        'mf:cs': { wild: false, block: false, miss: true, atkDice: 0 },
        'ms:cs': { wild: false, block: true, miss: false, atkDice: 0 },
        'cs:cs': { wild: false, block: true, miss: false, atkDice: 0 }
    },
    'dodge': {
        'cf:cf': { wild: true, block: false, miss: false, atkDice: 0 },
        'mf:cf': { wild: false, block: false, miss: true, atkDice: 0 },
        'ms:cf': { wild: false, block: false, miss: false, atkDice: 2 },
        'cs:cf': { wild: false, block: false, miss: false, atkDice: 3 },

        'cf:mf': { wild: true, block: false, miss: false, atkDice: 0 },
        'mf:mf': { wild: false, block: false, miss: true, atkDice: 0 },
        'ms:mf': { wild: false, block: false, miss: false, atkDice: 1 },
        'cs:mf': { wild: false, block: false, miss: false, atkDice: 2 },

        'cf:ms': { wild: true, block: false, miss: false, atkDice: 0 },
        'mf:ms': { wild: false, block: false, miss: true, atkDice: 0 },
        'ms:ms': { wild: false, block: false, miss: true, atkDice: 0 },
        'cs:ms': { wild: false, block: false, miss: false, atkDice: 1 },

        'cf:cs': { wild: true, block: false, miss: false, atkDice: 0 },
        'mf:cs': { wild: false, block: false, miss: true, atkDice: 0 },
        'ms:cs': { wild: false, block: false, miss: true, atkDice: 0 },
        'cs:cs': { wild: false, block: false, miss: true, atkDice: 0 }
    },
    'ignore': {
        'cf': { wild: true, block: false, miss: false, atkDice: 0 },
        'mf': { wild: false, block: false, miss: true, atkDice: 0 },
        'ms': { wild: false, block: false, miss: false, atkDice: 2 },
        'cs': { wild: false, block: false, miss: false, atkDice: 3 },
    }
}
