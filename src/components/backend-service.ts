import { Transaction } from "@mysten/sui/transactions";

import { signAndExecuteTransaction } from "../openplay-connect/functions";
import { InteractedWithGameModel } from "../sui/models/openplay-coin-flip";
import { GlobalStorage } from "./global-storage";
import { INTERACT_EVENT_TYPE, INTERACT_FUNCTION_TARGET } from "../sui/constants/coin-flip-constants";
import { InternalEvent } from "./internal-event";
import { ERROR_EVENT, INTERACTED_EVENT } from "../constants";

export interface IBackendService {
    handleInteract(stake: number, prediction: string): Promise<void>;
}

export default class BackendService implements IBackendService {

    public async handleInteract(stake: number, prediction: string): Promise<void> {

        const data = GlobalStorage.instance.data;
        if (!data || !data.backendService || !data.gameData || !data.balanceManagerData) {
            console.error("Missing global state data");
            return;
        }

        try {
            const gameId = import.meta.env.VITE_GAME_ID;
            const registryId = import.meta.env.VITE_REGISTRY_ID;
            const balanceManagerId = data.balanceManagerData.id.id;
            const houseId = data.houseId;
            const playCapId = data.playCapId;

            const tx = new Transaction();

            tx.moveCall({
                target: INTERACT_FUNCTION_TARGET,
                arguments: [
                    tx.object(gameId),
                    tx.object(registryId),
                    tx.object(balanceManagerId),
                    tx.object(houseId),
                    tx.object(playCapId),
                    tx.pure.string("PlaceBet"),
                    tx.pure.u64(stake),
                    tx.pure.string(prediction),
                    tx.object('0x8'), // random
                ],
            });

            const result = await signAndExecuteTransaction(tx);

            const interactEvent = result.events?.find(x => x.type == INTERACT_EVENT_TYPE);

            if (interactEvent) {
                const parsedEvent = parseInteractedWithGameModel(interactEvent.parsedJson) as InteractedWithGameModel;
                const msg: InternalEvent = {
                    type: INTERACTED_EVENT,
                    data: parsedEvent,
                }
                window.postMessage(msg, '*');
            }
            else {
                const msg: InternalEvent = {
                    type: ERROR_EVENT,
                    errorMsg: "No interact event found",
                };
                window.postMessage(msg, '*');
            }
        }
        catch (error) {
            console.error(error);
            const msg: InternalEvent = {
                type: ERROR_EVENT,
                errorMsg: error instanceof Error ? error.message : "An unknown error occurred",
            };
            window.postMessage(msg, '*');
        }
    }
}


function parseInteractedWithGameModel(raw: any): InteractedWithGameModel {
    return {
        old_balance: BigInt(raw.old_balance),
        new_balance: BigInt(raw.new_balance),
        balance_manager_id: raw.balance_manager_id,
        context: {
            stake: raw.context.stake,
            status: raw.context.status,
            prediction: raw.context.prediction,
            result: raw.context.result,
            win: raw.context.win,
        },
    };
}
