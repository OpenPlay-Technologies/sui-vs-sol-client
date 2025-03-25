import { GameModel, InteractedWithGameModel } from "../sui/models/openplay-coin-flip";
import { BalanceManagerModel } from "../sui/models/openplay-core";
import { IBackendService } from "./backend-service";
import { HEAD, HOUSE_BIAS, TAIL } from "../sui/constants/coin-flip-constants";
import { GlobalStorage } from "./global-storage";
import { INTERACTED_EVENT } from "../constants";
import { InternalEvent } from "./internal-event";

const START_BALANCE = BigInt(100e9);

const gameData: GameModel = {
    id: {
        id: "0x0"
    },
    allowed_versions: {
        fields: {
            contents: [BigInt(1)]
        },
        type: "VecSet"
    },
    min_stake: BigInt(0),
    max_stake: BigInt(100e9),
    contexts: {
        fields: {
            id: {
                id: "0x0"
            },
            size: 1
        },
        type: "Table"
    },
    house_edge_bps: BigInt(100),
    payout_factor_bps: BigInt(20000),
    state: {
        fields: {
            number_of_house_bias: 0,
            number_of_heads: 0,
            number_of_tails: 0,
            recent_throws: []
        },
        type: "CoinFlipStateModel"
    }
};


export default class MockBackendService implements IBackendService {

    public async handleInteract(stake: number, prediction: string): Promise<void> {

        const randomNumber = Math.floor(Math.random() * 10000);

        var result = "";
        var winAmount = 0;

        if (randomNumber < gameData.house_edge_bps) {
            result = HOUSE_BIAS
        }
        else {
            randomNumber % 2 == 0 ? result = HEAD : result = TAIL;
            if (result === prediction) {
                winAmount = stake / 10000 * Number(gameData.payout_factor_bps);
            }
        }

        const currentBalance = GlobalStorage.instance.data?.balance;
        if (!currentBalance) {
            console.error("Missing global state data");
            return;
        }

        var event: InteractedWithGameModel = {
            old_balance: BigInt(currentBalance),
            new_balance: BigInt(currentBalance) + BigInt(winAmount) - BigInt(stake),
            context: {
                stake: stake,
                prediction: prediction,
                result: result,
                status: "GameFinished",
                win: winAmount
            },
            balance_manager_id: "",
        }

        const msg: InternalEvent = {
            type: INTERACTED_EVENT,
            data: event,
        }
        window.postMessage(msg, '*');
    }

}


export const mockFetchGame = async (): Promise<GameModel> => {
    return Promise.resolve(gameData);

};

export const mockFetchBalanceManager = async (): Promise<BalanceManagerModel> => {
    // Construct a mocked game object based on your GameModel interface
    const mockBm: BalanceManagerModel = {
        id: {
            id: "0x0"
        },
        balance: START_BALANCE,
        tx_allow_listed: {
            fields: {
                contents: [""]
            },
            type: "VecSet"

        },
        cap_id: ""
    };
    return Promise.resolve(mockBm);
    // return new Promise((resolve) => {
    //     setTimeout(() => {
    //         resolve(mockBm);
    //     }, 2000); 
    // });
};