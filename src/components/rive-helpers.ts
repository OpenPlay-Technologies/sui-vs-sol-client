import * as rive from "@rive-app/webgl";
import { stakes } from "../constants";
import { mistToSUI } from "../utils/helpers";


export const updateUI = (riveInstance: rive.Rive, balanceValue: number, winValue: number, disableButton: boolean) => {
    // console.log("Updating UI", balanceValue, winValue, disableButton);
    riveInstance?.setTextRunValue("Balance Value Run", mistToSUI(Number(balanceValue)));
    riveInstance?.setTextRunValue("Win Value Run", mistToSUI(Number(winValue)));
    const disableButtonInput = riveInstance?.stateMachineInputs("State Machine 1").find(x => x.name == "Disable button");
    if (disableButtonInput) {
        disableButtonInput.value = disableButton;
    }
}

export const updateStake = (riveInstance: rive.Rive, stakeIndex: number) => {
    if (stakeIndex < 0 || stakeIndex >= stakes.length) {
        console.error('Invalid stake index');
        return;
    }
    const stakeValue = stakes[stakeIndex];
    const canIncrease = stakeIndex < stakes.length - 1;
    const canDecrease = stakeIndex > 0;

    riveInstance?.setTextRunValue("Bet Value Run", mistToSUI(Number(stakeValue)));

    const allowStakeIncreaseInput = riveInstance?.stateMachineInputs("State Machine 1").find(x => x.name == "Allow stake increase");
    if (allowStakeIncreaseInput) {
        allowStakeIncreaseInput.value = canIncrease;
    }
    const allowStakeDecreaseInput = riveInstance?.stateMachineInputs("State Machine 1").find(x => x.name == "Allow stake decrease");
    if (allowStakeDecreaseInput) {
        allowStakeDecreaseInput.value = canDecrease;
    }
}

export const showError = (riveInstance: rive.Rive, errorMsg: string) => {
    const showErrorInput = riveInstance.stateMachineInputs("State Machine 1").find(x => x.name == "Show error");
    if (showErrorInput && errorMsg) {
        riveInstance.setTextRunValue("Error body run", errorMsg);
        showErrorInput.value = true;
    }
}

export const startFlippingAnimation = (riveInstance: rive.Rive) => {
    riveInstance?.fireStateAtPath("Start flip", "Coin flip v2");
    const disableButtonInput = riveInstance?.stateMachineInputs("State Machine 1").find(x => x.name == "Disable button");
    if (disableButtonInput) {
        disableButtonInput.value = true;
    }
}

export const flipToResult = (riveInstance: rive.Rive, result: string) => {
    // console.log("Flipping to result", result);
    if (result == "Head") {
        riveInstance?.setBooleanStateAtPath("End sui", true, "Coin flip v2");
    } else if (result == "Tail") {
        riveInstance?.setBooleanStateAtPath("End sol", true, "Coin flip v2");
    } else if (result == "HouseBias") {
        riveInstance?.setBooleanStateAtPath("End house", true, "Coin flip v2");
    }
}

export const getSelection = (riveInstance: rive.Rive) => {
    const input = riveInstance?.stateMachineInputs("State Machine 1").find(x => x.name == "Selection")?.value as number ?? -1;
    if (input == -1) {
        console.error('Invalid input');
        return;
    }

    const prediction = input == 0 ? "Head" : "Tail";
    return prediction;
}