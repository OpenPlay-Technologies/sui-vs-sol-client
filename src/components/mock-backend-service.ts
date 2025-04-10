import { GameModel, InteractedWithGameModel } from "../sui/models/openplay-coin-flip";
import { BalanceManagerModel } from "../sui/models/openplay-core";
import { IBackendService } from "./backend-service";
import { HEAD, HOUSE_BIAS, TAIL } from "../sui/constants/coin-flip-constants";
import { store } from "../redux/store";

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

    fetchGame(): Promise<GameModel | undefined> {
        return Promise.resolve(gameData);
    }

    fetchBalanceManager(balanceManagerId: string): Promise<BalanceManagerModel | undefined> {
        // Construct a mocked game object based on your GameModel interface
        const mockBm: BalanceManagerModel = {
            id: {
                id: balanceManagerId
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
    }

    public async handleInteract(_registryId: string, _gameId: string, _balanceManagerId: string, _houseId: string, _playCapId: string, stake: number, prediction: string): Promise<InteractedWithGameModel | undefined> {

        const randomNumber = Math.floor(Math.random() * 10000);

        let result = "";
        let winAmount = 0;

        if (randomNumber < gameData.house_edge_bps) {
            result = HOUSE_BIAS
        }
        else {
            if (randomNumber % 2 == 0) {
                result = HEAD
            }
            else {
                result = TAIL;
            }
            if (result === prediction) {
                winAmount = stake / 10000 * Number(gameData.payout_factor_bps);
            }
        }

        const currentBalance = store.getState().game.balance;
        if (!currentBalance) {
            console.error("Missing global state data");
            return;
        }

        const event: InteractedWithGameModel = {
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
        return event;
    }

}