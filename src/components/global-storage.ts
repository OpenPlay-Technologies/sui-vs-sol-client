// GlobalStorage.ts

import { Rive } from "@rive-app/webgl";
import { IBackendService } from "./backend-service";
import { GameModel } from "../sui/models/openplay-coin-flip";
import { BalanceManagerModel } from "../sui/models/openplay-core";

export interface GlobalData {
    riveInstance: Rive | null;
    state: CoinFlipState;
    balanceManagerId: string;
    houseId: string;
    playCapId: string;
    referralId?: string;
    gameData: GameModel | null;
    balanceManagerData: BalanceManagerModel | null;
    backendService: IBackendService | null;
    balance: number;
    currentStakeIndex: number;
    winAmount: number;
}

export enum CoinFlipState {
    IDLE = "IDLE",
    WAITING_FOR_RESPONSE = "WAITING_FOR_RESPONSE",
    FLIPPING_TO_RESULT = "FLIPPING_TO_RESULT",
}

export class GlobalStorage {
    // The singleton instance
    private static _instance: GlobalStorage;

    // The stored global data
    private _data: GlobalData | null = null;

    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Public accessor for the singleton instance
    public static get instance(): GlobalStorage {
        if (!this._instance) {
            this._instance = new GlobalStorage();
        }
        return this._instance;
    }

    // Getter for the state
    public get data(): GlobalData | null {
        return this._data;
    }

    // Setter for the state
    public set data(newData: GlobalData | null) {
        this._data = newData;
    }

    // Optional: Update part of the state without replacing it entirely
    public update(updates: Partial<GlobalData>): void {
        if (this._data === null) {
            this._data = updates as GlobalData;
        } else {
            this._data = { ...this._data, ...updates };
        }
    }
}
