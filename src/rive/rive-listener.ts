import * as rive from "@rive-app/webgl";
import { ERROR_EVENT, FLIP_TO_RESULT_REQUESTED_EVENT, stakes } from "../constants";
import { getSelection, startFlippingAnimation, updateStake, updateUI } from "./rive-helpers";
import { store } from "../redux/store";
import { CoinFlipState } from "../enums";
import { handleInteractThunk } from "../redux/thunks";
import { updateGameData } from "../redux/slices/game-slice";
import { getRiveInstanceOrThrow } from "../redux/slices/rive-slice";
import { InternalEvent, InternalEventEmitter } from "../events/internal-event-definitions";
import { notifyBalanceUpdate, requestCloseGame } from "../openplay-connect/game-functions";

// Listen for rive events
export const onRiveEventReceived = (riveEvent: rive.Event) => {
    console.log("Rive event received:", riveEvent);
    const eventData = riveEvent.data as rive.RiveEventPayload;
    const state = store.getState().game;
    const riveInstance = getRiveInstanceOrThrow(store.getState());
    if (!eventData) {
        return;
    }
    // Play a game when user clicks play button
    if (eventData.name == "PlayButtonClicked") {
        if (state.state == CoinFlipState.IDLE) {
            console.log("Starting game");
            const selection = getSelection(riveInstance);
            if (!selection) {
                console.error("Invalid selection");
                return;
            }
            const stakeAmount = stakes[state.currentStakeIndex];
            startFlippingAnimation(riveInstance);

            store.dispatch(handleInteractThunk({ stakeAmount, selection }))
                .then(() => {
                    const state = store.getState().game;
                    if (state.state === CoinFlipState.FLIPPING_TO_RESULT) {
                        console.log("Flipping to result");
                        const msg: InternalEvent = {
                            type: FLIP_TO_RESULT_REQUESTED_EVENT,
                        };
                        InternalEventEmitter.emit(FLIP_TO_RESULT_REQUESTED_EVENT, msg);
                    }
                    else if (state.state === CoinFlipState.ERROR) {
                        const msg: InternalEvent = {
                            type: ERROR_EVENT,
                            errorMsg: state.errorMsg,
                        };
                        InternalEventEmitter.emit(ERROR_EVENT, msg);
                    }
                });

            // Visually deduct stake amount from balance
            updateUI(riveInstance, state.balance - stakeAmount, 0, true);
        }
        else {
            console.warn("Unexpected state", state.state);
        }
    }
    // Listen on flip completed to keep react state in sync with animation
    if (eventData.name == "FlipCompleted") {
        const state = store.getState().game;
        if (state.state != CoinFlipState.FLIPPING_TO_RESULT) {
            console.error("Invalid state", state);
            return;
        }
        updateUI(riveInstance, state.balance, state.winAmount, false);
        store.dispatch(updateGameData({
            state: CoinFlipState.IDLE
        }));
        notifyBalanceUpdate();
    }
    // Close game
    if (eventData.name == "CloseButtonClicked") {
        requestCloseGame();
    }
    // Stake increase
    if (eventData.name == "StakeIncreased") {
        console.log("Stake increased");
        const state = store.getState().game;
        const newStakeIndex = Math.min(state.currentStakeIndex + 1, stakes.length - 1);
        store.dispatch(updateGameData({
            currentStakeIndex: newStakeIndex
        }));
        updateStake(riveInstance, newStakeIndex);

    }
    // Stake decrease
    if (eventData.name == "StakeDecreased") {
        console.log("Stake decreased");
        const state = store.getState().game;
        const newStakeIndex = Math.max(state.currentStakeIndex - 1, 0);
        store.dispatch(updateGameData({
            currentStakeIndex: newStakeIndex
        }));
        updateStake(riveInstance, newStakeIndex);
    }
};

