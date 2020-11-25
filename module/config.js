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

HM3.skillTypes = ["Craft", "Physical", "Communication", "Combat", "Magic", "Ritual"];

HM3.injuryLocations = {
    "Custom": {impactType: "custom", probWeight: {"high": 1, "mid": 1, "low": 1}, isStumble: false, isFumble: false, isAmputate: false, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "G5"}},
    "Skull": {impactType: "skull", probWeight: {"high": 150, "mid": 50, "low": 0}, isStumble: false, isFumble: false, isAmputate: false, effectiveImpact: { ei1: "M1", ei5: "S2", ei9: "S3", ei13: "K4", ei17: "K5"}},
    "Face": {impactType: "face", probWeight: {"high": 150, "mid": 50, "low": 0}, isStumble: false, isFumble: false, isAmputate: false, effectiveImpact: {ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "K5"}},
    "Neck": {impactType: "neck", probWeight: {"high": 150, "mid": 50, "low": 0}, isStumble: false, isFumble: false, isAmputate: true, effectiveImpact: {ei1: "M1", ei5: "S2", ei9: "S3", ei13: "K4", ei17: "K5"}},
    "Shoulder": {impactType: "shoulder", probWeight: {"high": 60, "mid": 60, "low": 0}, isStumble: false, isFumble: true, isAmputate: false, effectiveImpact: {ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "K4"}},
    "Upper Arm": {impactType: "upperarm", probWeight: {"high": 60, "mid": 30, "low": 0}, isStumble: false, isFumble: true, isAmputate: true, effectiveImpact: {ei1: "M1", ei5: "M1", ei9: "S2", ei13: "S3", ei17: "G4"}},
    "Elbow": {impactType: "elbow", probWeight: {"high": 20, "mid": 10, "low": 0}, isStumble: false, isFumble: true, isAmputate: true, effectiveImpact: {ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "G5"}},
    "Forearm": {impactType: "forearm", probWeight: {"high": 40, "mid": 20, "low": 30}, isStumble: false, isFumble: true, isAmputate: true, effectiveImpact: {ei1: "M1", ei5: "M1", ei9: "S2", ei13: "S3", ei17: "G4"}},
    "Hand": {impactType: "hand", probWeight: {"high": 20, "mid": 20, "low": 30}, isStumble: false, isFumble: true, isAmputate: true, effectiveImpact: {ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "G5"}},
    "Thorax": {impactType: "thorax", probWeight: {"high": 100, "mid": 170, "low": 70}, isStumble: false, isFumble: false, isAmputate: false, effectiveImpact: {ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "K5"}},
    "Abdomen": {impactType: "abdomen", probWeight: {"high": 60, "mid": 100, "low": 100}, isStumble: false, isFumble: false, isAmputate: false, effectiveImpact: {ei1: "M1", ei5: "S2", ei9: "S3", ei13: "K4", ei17: "K5"}},
    "Groin": {impactType: "groin", probWeight: {"high": 0, "mid": 40, "low": 60}, isStumble: false, isFumble: false, isAmputate: true, effectiveImpact: {ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "G5"}},
    "Hip": {impactType: "hip", probWeight: {"high": 0, "mid": 30, "low": 70}, isStumble: true, isFumble: false, isAmputate: false, effectiveImpact: {ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "K4"}},
    "Thigh": {impactType: "thigh", probWeight: {"high": 0, "mid": 40, "low": 100}, isStumble: true, isFumble: false, isAmputate: true, effectiveImpact: {ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "K4"}},
    "Knee": {impactType: "knee", probWeight: {"high": 0, "mid": 10, "low": 40}, isStumble: true, isFumble: false, isAmputate: true, effectiveImpact: {ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "G5"}},
    "Calf": {impactType: "calf", probWeight: {"high": 0, "mid": 30, "low": 70}, isStumble: true, isFumble: false, isAmputate: true, effectiveImpact: {ei1: "M1", ei5: "M1", ei9: "S2", ei13: "S3", ei17: "G4"}},
    "Foot": {impactType: "foot", probWeight: {"high": 0, "mid": 20, "low": 40}, isStumble: true, isFumble: false, isAmputate: true, effectiveImpact: {ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "G5"}},
    "Wing": {impactType: "wing", probWeight: {"high": 150, "mid": 50, "low": 0}, isStumble: false, isFumble: true, isAmputate: true, effectiveImpact: {ei1: "M1", ei5: "S2", ei9: "S3", ei13: "G4", ei17: "G5"}},
    "Tentacle": {impactType: "tentacle", probWeight: {"high": 50, "mid": 150, "low": 0}, isStumble: false, isFumble: true, isAmputate: true, effectiveImpact: {ei1: "M1", ei5: "M1", ei9: "S2", ei13: "S3", ei17: "G4"}},
    "Tail": {impactType: "tail", probWeight: {"high": 0, "mid": 50, "low": 100}, isStumble: true, isFumble: false, isAmputate: true, effectiveImpact: {ei1: "M1", ei5: "M1", ei9: "S2", ei13: "S3", ei17: "G4"}}
};

HM3.injuryLevels = ["NA", "M1", "S2", "S3", "G4", "G5", "K4", "K5"];

HM3.defaultMagicIconName = 'pentacle';
HM3.defaultRitualIconName = 'circle';
HM3.defaultMiscItemIconName = 'miscgear';
HM3.defaultPsionicsIconName = 'psionics';

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
    ['bullet', 'systems/hm3/images/icons/svg/stones.svg']
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
    .concat(HM3.ritualIcons)
    .concat(HM3.magicIcons)
    .concat(HM3.psionicTalentIcons)
);
