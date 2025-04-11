import * as rive from "@rive-app/webgl";
import { INIT_DATA_READY_EVENT, ERROR_EVENT, FLIP_TO_RESULT_REQUESTED_EVENT, OPENPLAY_CONNECT_INITIALIZED_EVENT, RELOAD_REQUESTED_EVENT } from "../constants";
import { handleError } from "../utils/error-messages";
import { riveCanvas } from "../game";
import { updateUI, updateStake, flipToResult, showError } from "../rive/rive-helpers";
import { onRiveEventReceived } from "../rive/rive-listener";
import { InternalEvent, InternalEventEmitter } from "./internal-event-definitions";
import { CoinFlipState } from "../enums";
import { getRiveInstanceOrThrow, setRiveInstance } from "../redux/slices/rive-slice";
import { fetchDataThunk, reloadGameThunk } from "../redux/thunks";
import { store } from "../redux/store";

/**
 * When OpenPlay Connect is initialized we want to fetch the game and balance manager data
 */
InternalEventEmitter.on(OPENPLAY_CONNECT_INITIALIZED_EVENT, () => {
    console.log("OpenPlay Connect initialized event received");
    store.dispatch(fetchDataThunk()).then(() => {

        const state = store.getState().game;
        if (state.state == CoinFlipState.IDLE) {
            console.log("Init data fetched");
            const msg: InternalEvent = {
                type: INIT_DATA_READY_EVENT,
            };
            InternalEventEmitter.emit(INIT_DATA_READY_EVENT, msg);
        }
        else if (state.state == CoinFlipState.ERROR) {
            console.log("Error state, reloading game");
            const msg: InternalEvent = {
                type: ERROR_EVENT,
                errorMsg: state.errorMsg,
            };
            InternalEventEmitter.emit(ERROR_EVENT, msg);
        }
    });
});

/**
 * When the init data is ready we want to create the Rive instance and start the game
 */
InternalEventEmitter.on(INIT_DATA_READY_EVENT, () => {
    console.log("Init data ready event received");
    const riveState = store.getState().rive;
    if (!riveState.riveInstance) {
        const layout = new rive.Layout({
            fit: rive.Fit.Layout, // Setting to Fit.Layout will auto update the artboard size
            alignment: rive.Alignment.Center, // Center the graphic
        });

        let src: string;
        if (window.window.innerWidth < 600) {
            src = "/sui-vs-sol-mobile.riv"; // Path to the Rive file for mobile
        }
        else {
            src = "/sui-vs-sol.riv"; // Path to the Rive file for desktop
        }

        const riveInstance = new rive.Rive({
            src: src, // Path to the Rive file
            // Be sure to specify the correct state machine (or animation) name
            stateMachines: "State Machine 1", // Name of the State Machine to play
            canvas: riveCanvas ?? (() => { throw new Error("Canvas element not found"); })(),
            // artboard: "Artboard" // Optionally provide the artboard to display
            layout: layout, // This is optional. Provides additional layout control.
            autoplay: true,
            onLoad: () => {
                document.getElementById("loading-text")?.setHTMLUnsafe("");

                // Resize the drawing surface to the canvas
                riveInstance.resizeDrawingSurfaceToCanvas();
                // Show balance and stake
                const gameState = store.getState().game;

                updateUI(riveInstance, gameState.balance, 0, false);
                updateStake(riveInstance, gameState.currentStakeIndex);
            },
        });

        // Save the rive instance
        store.dispatch(setRiveInstance(riveInstance));

        // Listen to rive events
        riveInstance.on(rive.EventType.RiveEvent, onRiveEventReceived);
    }
});

/**
 * When the flip to result is requested we want to flip the coin to the result
 */
InternalEventEmitter.on(FLIP_TO_RESULT_REQUESTED_EVENT, () => {
    console.log("Interacted event received");
    const state = store.getState();

    const riveInstane = getRiveInstanceOrThrow(state);

    if (state.game.state != CoinFlipState.FLIPPING_TO_RESULT) {
        console.error("Invalid state");
        return;
    }
    flipToResult(riveInstane, state.game.flipResult);
})

/**
 * On error event we want to show the error message and reload the game
 */
InternalEventEmitter.on(ERROR_EVENT, (payload) => {
    console.log("Error event received", payload.errorMsg);

    const state = store.getState();
    const riveInstane = getRiveInstanceOrThrow(state);

    handleError(payload.errorMsg, (msg) => {
        showError(riveInstane, msg)
    });

    store.dispatch(reloadGameThunk()).then(() => {
        const state = store.getState().game;
        const riveInstance = getRiveInstanceOrThrow(store.getState());
        updateUI(riveInstance, state.balance, state.winAmount, false);
    });;
});

/**
 * On reload we refetch the data similar to the error
 */
InternalEventEmitter.on(RELOAD_REQUESTED_EVENT, () => {
    console.log("Reload event received");

    store.dispatch(reloadGameThunk()).then(() => {
        const state = store.getState().game;
        const riveInstance = getRiveInstanceOrThrow(store.getState());
        updateUI(riveInstance, state.balance, state.winAmount, false);
    });;
});