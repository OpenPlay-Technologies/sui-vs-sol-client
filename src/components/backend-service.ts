import { Transaction } from "@mysten/sui/transactions";

import { signAndExecuteTransaction } from "../openplay-connect/game-functions";
import { GameModel, InteractedWithGameModel } from "../sui/models/openplay-coin-flip";
import { INTERACT_EVENT_TYPE, INTERACT_FUNCTION_TARGET } from "../sui/constants/coin-flip-constants";
import { fetchGame } from "../sui/queries/coin-flip";
import { BalanceManagerModel } from "../sui/models/openplay-core";
import { fetchBalanceManager } from "../sui/queries/balance-manager";

export interface IBackendService {
    handleInteract(registryId: string, gameId: string, balanceManagerId: string, houseId: string, playCapId: string, stake: number, prediction: string): Promise<InteractedWithGameModel | undefined>;
    fetchGame(gameId: string): Promise<GameModel | undefined>;
    fetchBalanceManager(balanceManagerId: string): Promise<BalanceManagerModel | undefined>;
}

export default class BackendService implements IBackendService {

    public async fetchGame(gameId: string): Promise<GameModel | undefined> {
        return await fetchGame(gameId);
    }

    public async fetchBalanceManager(balanceManagerId: string): Promise<BalanceManagerModel | undefined> {
        return await fetchBalanceManager(balanceManagerId);
    }

    public async handleInteract(registryId: string, gameId: string, balanceManagerId: string, houseId: string, playCapId: string, stake: number, prediction: string): Promise<InteractedWithGameModel | undefined> {
        try {
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
                return parsedEvent;
            }
            return undefined;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
