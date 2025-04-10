import * as rive from "@rive-app/webgl";
import { INIT_DATA_READY_EVENT, INTERACTED_EVENT, ERROR_EVENT } from "../constants";
import { GlobalStorage, CoinFlipState } from "./global-storage";
import { isInternalEvent } from "./internal-event";
import { fetchBalanceManager } from "../sui/queries/balance-manager";
import { fetchGame } from "../sui/queries/coin-flip";
import { handleError } from "../utils/error-messages";
import { mockFetchGame, mockFetchBalanceManager } from "./mock-backend-service";
import { riveCanvas } from "../game";
import { updateUI, updateStake, flipToResult, showError } from "./rive-helpers";
import { onRiveEventReceived } from "./rive-listener";

// Listen for the init event to start rive
window.addEventListener('message', (event: MessageEvent) => {
    const payload = event.data;

    if (!isInternalEvent(payload)) {
        return
    }

    if (!GlobalStorage.instance.data) {
        console.error("Missing global state data");
        return;
    }

    if (!GlobalStorage.instance.data?.balanceManagerId || !GlobalStorage.instance.data?.houseId || !GlobalStorage.instance.data?.playCapId) {
        console.error("Missing global state data");
        return;
    }


    if (payload.type === INIT_DATA_READY_EVENT) {

        console.log("Init data ready");

        let fetchGamePromise;
        let balanceManagerDataPromise;

        if (import.meta.env.VITE_DUMMY_BACKEND == 'true') {
            fetchGamePromise = mockFetchGame();
            balanceManagerDataPromise = mockFetchBalanceManager();
        }
        else {
            fetchGamePromise = fetchGame(import.meta.env.VITE_GAME_ID);
            balanceManagerDataPromise = fetchBalanceManager(GlobalStorage.instance.data.balanceManagerId);
        }

        Promise.all([fetchGamePromise, balanceManagerDataPromise]).then(([game, balanceManagerData]) => {
            if (!game || !balanceManagerData) {
                console.error("Failed to fetch game or balance manager data");
                return;
            }
            if (!GlobalStorage.instance.data) {
                console.error("Missing global state data");
                return;
            }

            console.log("Game data:", game);
            console.log("Balance manager data:", balanceManagerData);

            GlobalStorage.instance.update({
                gameData: game,
                balanceManagerData: balanceManagerData,
                balance: Number(balanceManagerData.balance),
                state: CoinFlipState.IDLE,
            });

            const layout = new rive.Layout({
                fit: rive.Fit.Layout, // Setting to Fit.Layout will auto update the artboard size
                alignment: rive.Alignment.Center, // Center the graphic
            });

            const riveInstance = new rive.Rive({
                src: "/sui-vs-sol.riv", // Path to the Rive file
                // Be sure to specify the correct state machine (or animation) name
                stateMachines: "State Machine 1", // Name of the State Machine to play
                canvas: riveCanvas ?? (() => { throw new Error("Canvas element not found"); })(),
                // artboard: "Artboard" // Optionally provide the artboard to display
                layout: layout, // This is optional. Provides additional layout control.
                autoplay: true,
                onLoad: () => {
                    document.getElementById("loading-text")?.setHTMLUnsafe("");
                    riveInstance?.resizeDrawingSurfaceToCanvas();
                    if (riveInstance) {
                        updateUI(riveInstance, Number(GlobalStorage.instance.data?.balanceManagerData?.balance), 0, false);
                        updateStake(riveInstance, GlobalStorage.instance.data?.currentStakeIndex ?? 0);
                    }
                },
            });

            riveInstance.on(rive.EventType.RiveEvent, onRiveEventReceived);
            GlobalStorage.instance.update({ riveInstance: riveInstance });
        });
    }
    else if (payload.type === INTERACTED_EVENT) {
        console.log("Interacted event received", payload.data);


        if (GlobalStorage.instance.data?.state != CoinFlipState.WAITING_FOR_RESPONSE) {
            console.error("Invalid state");
            return;
        }

        GlobalStorage.instance.update({ balance: Number(payload.data.new_balance), winAmount: Number(payload.data.context.win), state: CoinFlipState.FLIPPING_TO_RESULT });
        if (!GlobalStorage.instance.data.riveInstance) {
            console.error("Rive instance not found");
            return;
        }
        flipToResult(GlobalStorage.instance.data.riveInstance, payload.data.context.result);
    }
    else if (payload.type === ERROR_EVENT) {
        console.log("Error event received", payload.errorMsg);

        handleError(payload.errorMsg, (msg) => {
            if (!GlobalStorage.instance.data?.riveInstance) {
                console.error("Rive instance not found");
                return;
            }
            showError(GlobalStorage.instance.data.riveInstance, msg)
        });

        // Reset the game
        let fetchGamePromise;
        let balanceManagerDataPromise;

        if (import.meta.env.VITE_DUMMY_BACKEND == 'true') {
            fetchGamePromise = mockFetchGame();
            balanceManagerDataPromise = mockFetchBalanceManager();
        }
        else {
            fetchGamePromise = fetchGame(import.meta.env.VITE_GAME_ID);
            balanceManagerDataPromise = fetchBalanceManager(GlobalStorage.instance.data.balanceManagerId);
        }

        Promise.all([fetchGamePromise, balanceManagerDataPromise]).then(([game, balanceManagerData]) => {
            if (!game || !balanceManagerData) {
                console.error("Failed to fetch game or balance manager data");
                return;
            }
            if (!GlobalStorage.instance.data) {
                console.error("Missing global state data");
                return;
            }

            console.log("Game data:", game);
            console.log("Balance manager data:", balanceManagerData);

            GlobalStorage.instance.update({
                gameData: game,
                balanceManagerData: balanceManagerData,
                balance: Number(balanceManagerData.balance),
                state: CoinFlipState.IDLE,
            });
            if (!GlobalStorage.instance.data.riveInstance) {
                console.error("Rive instance not found");
                return;
            }
            updateUI(GlobalStorage.instance.data.riveInstance, Number(GlobalStorage.instance.data?.balanceManagerData?.balance), 0, false);
        });
    }
});
