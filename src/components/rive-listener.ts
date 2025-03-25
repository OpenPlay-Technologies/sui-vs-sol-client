import * as rive from "@rive-app/webgl";
import { stakes } from "../constants";
import { CoinFlipState, GlobalStorage } from "./global-storage";
import { getSelection, startFlippingAnimation, updateStake, updateUI } from "./rive-helpers";

// Listen for rive events
export const onRiveEventReceived = (riveEvent: rive.Event) => {
    console.log("Rive event received:", riveEvent);
    const eventData = riveEvent.data as rive.RiveEventPayload;
    const riveInstance = GlobalStorage.instance.data?.riveInstance;
    if (!eventData || !riveInstance) {
        return;
    }
    // Play a game when user clicks play button
    if (eventData.name == "PlayButtonClicked") {
        if (GlobalStorage.instance.data?.state == CoinFlipState.IDLE) {
            console.log("Starting game");
            const selection = getSelection(riveInstance);
            if (!selection) {
                console.error("Invalid selection");
                return;
            }
            if (!GlobalStorage.instance.data.backendService) {
                console.error("Missing backend service");
                return;
            }
            const stakeAmount = stakes[GlobalStorage.instance.data.currentStakeIndex];
            GlobalStorage.instance.data.backendService?.handleInteract(stakeAmount, selection);
            startFlippingAnimation(riveInstance);
            GlobalStorage.instance.update({ state: CoinFlipState.WAITING_FOR_RESPONSE });
            // Visually deduct stake amount from balance
            updateUI(riveInstance, GlobalStorage.instance.data.balance - stakeAmount, 0, true);
        }
    }
    // Listen on flip completed to keep react state in sync with animation
    if (eventData.name == "FlipCompleted") {
        if (!GlobalStorage.instance.data) {
            console.error("Invalid state");
            return;
        }
        if (GlobalStorage.instance.data.state != CoinFlipState.FLIPPING_TO_RESULT) {
            console.error("Invalid state");
            return;
        }
        updateUI(riveInstance, GlobalStorage.instance.data.balance, GlobalStorage.instance.data.winAmount, false);
        GlobalStorage.instance.update({ state: CoinFlipState.IDLE });
    }
    // Close game
    if (eventData.name == "CloseButtonClicked") {
        // props.onClose();
    }
    // Stake increase
    if (eventData.name == "StakeIncreased") {
        if (!GlobalStorage.instance.data) {
            console.error("Invalid stake index");
            return;
        }
        console.log("Stake increased");
        GlobalStorage.instance.update({ currentStakeIndex: GlobalStorage.instance.data.currentStakeIndex + 1 });
        updateStake(riveInstance, GlobalStorage.instance.data.currentStakeIndex);

    }
    // Stake decrease
    if (eventData.name == "StakeDecreased") {
        if (!GlobalStorage.instance.data) {
            console.error("Invalid stake index");
            return;
        }
        console.log("Stake decreased");
        GlobalStorage.instance.update({ currentStakeIndex: GlobalStorage.instance.data.currentStakeIndex - 1 });
        updateStake(riveInstance, GlobalStorage.instance.data.currentStakeIndex);
    }
};

