import BackendService from "../components/backend-service";
import MockBackendService from "../components/mock-backend-service";
import { INIT_DATA_READY_EVENT } from "../constants";
import { CoinFlipState, GlobalStorage } from "../components/global-storage";
import { InternalEvent } from "../components/internal-event";
import { INIT_REQUEST, INIT_RESPONSE, isMessage } from "./messages";

// Listen for the init message
window.addEventListener('message', (event: MessageEvent) => {
    const data = event.data;
    if (!isMessage(data)) {
        return;
    }

    switch (data.type) {
        case INIT_REQUEST:
            if (GlobalStorage.instance.data !== null) {
                console.log("Init data already received");
                const responseData = {
                    type: INIT_RESPONSE,
                    isSuccessful: false,
                    errorMsg: "Init data already received",
                };
                window.parent.postMessage(responseData, '*');
                return;
            }
            else {
                console.log("Received init data:", data);
                
                var backend;
                if (import .meta.env.VITE_DUMMY_BACKEND == 'true') {
                    console.log("Using dummy backend");
                    backend = new MockBackendService();
                }
                else {
                    console.log("Using real backend");
                    backend = new BackendService();
                }

                GlobalStorage.instance.data = {
                    state: CoinFlipState.IDLE,
                    balanceManagerId: data.balanceManagerId,
                    houseId: data.houseId,
                    playCapId: data.playCapId,
                    referralId: data.referralId,
                    gameData: null,
                    balanceManagerData: null,
                    backendService: backend,
                    balance: 0,
                    currentStakeIndex: 0,
                    winAmount: 0,
                    riveInstance: null,
                };
                const payload: InternalEvent = {
                    type: INIT_DATA_READY_EVENT,
                }
                window.postMessage(payload, '*');
                const responseData = {
                    type: INIT_RESPONSE,
                    isSuccessful: true,
                };
                window.parent.postMessage(responseData, '*');
                return;
            }
            break;
        default:
            // This case should never happen due to our type guard.
            break;
    }
});