import { OPENPLAY_CONNECT_INITIALIZED_EVENT, RELOAD_REQUESTED_EVENT } from "../constants";
import { BALANCE_UPDATE_NOTIFICATION, INIT_REQUEST, INIT_RESPONSE, isMessage } from "./messages";
import { InternalEvent, InternalEventEmitter } from "../events/internal-event-definitions";
import { store } from "../redux/store";
import { setOpenPlayData } from "../redux/slices/openplay-connect-slice";

// Listen for the init message
window.addEventListener('message', (event: MessageEvent) => {
    const data = event.data;
    if (!isMessage(data)) {
        return;
    }

    switch (data.type) {
        case INIT_REQUEST:
            // Check if the init data has already been received
            if (store.getState().openPlayConnect.initialized) {
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

                // Set the OpenPlay data in the Redux store
                store.dispatch(setOpenPlayData({
                    initialized: true,
                    balanceManagerId: data.balanceManagerId,
                    houseId: data.houseId,
                    playCapId: data.playCapId,
                    referralId: data.referralId,
                }));

                // Internal event to indicate that the game can start
                const payload: InternalEvent = {
                    type: OPENPLAY_CONNECT_INITIALIZED_EVENT,
                }
                InternalEventEmitter.emit(OPENPLAY_CONNECT_INITIALIZED_EVENT, payload);

                // Send a response back to the parent window
                const responseData = {
                    type: INIT_RESPONSE,
                    isSuccessful: true,
                };
                window.parent.postMessage(responseData, '*');
                return;
            }
            break;
        case BALANCE_UPDATE_NOTIFICATION:
            {
                const payload: InternalEvent = {
                    type: RELOAD_REQUESTED_EVENT
                };
                InternalEventEmitter.emit(RELOAD_REQUESTED_EVENT, payload);
                break;
            }
        default:
            // This case should never happen due to our type guard.
            break;
    }
});