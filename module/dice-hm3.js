export class DiceHM3 {

    static rollTest(testData) {

        let diceType = testData.diceSides === 6 ? "d6" : "d100";
        let diceSpec = ((testData.diceNum > 0) ? testData.diceNum : 1) + diceType;
        let roll = new Roll(diceSpec, testData.data).roll();

        let modifier = testData.modifier;
        let targetNum = testData.target + testData.modifier;
        let isCrit = (roll.total % 5) === 0;
        let levelDesc = isCrit ? "Critical" : "Marginal";
        let description = "";
        let isSuccess = false;

        // ********** Failure ***********
        if (roll.total >= 96 || (roll.total > 5 && roll.total > targetNum)) {
            description = levelDesc + " Failure";
        }
        // ********** Success ***********
        else {
            description = levelDesc + " Success";
            isSuccess = true;
        }

        let rollResults = {
            "target": targetNum,
            "roll": roll,
            "isCritical": isCrit,
            "isSuccess": isSuccess,
            "descripiton": description,
            "preData": testData
        }
        return rollResults;
    }

    static hitLocation(items, aim) {
        let roll = new Roll("1d100");
        let rollResult = roll.total;
        let result = `Unknown (roll=${rollResult})`;
        items.forEach(it => {
            if (it.type === "hitlocation") {
                let probWeight = it.data.probWeight[aim];
                if (probWeight === 0) continue;
                rollResult -= probWeight;
                if (rollResult <= 0)
                    result = it.name;
                    break;
            }
        });

        return result;
    }
}