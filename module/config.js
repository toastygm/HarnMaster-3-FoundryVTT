// Namespace Configuration Values
export const HM3 = {};

// ASCII Artwork
HM3.ASCII = `_   _ ___  ___ _____ 
| | | ||  \\/  ||____ |
| |_| || .  . |    / /
|  _  || |\\/| |    \\ \\
| | | || |  | |.___/ /
\\_| |_/\\_|  |_/\\____/`;

HM3.skillTypes = ["Craft", "Physical", "Communication", "Combat", "Magic", "Ritual", "Psionic"];

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