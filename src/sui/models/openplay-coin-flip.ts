import { Uid, MoveObject, VecSet, Table } from "./shared-models";

export const errorMessages: Record<string, Record<number, string>> = {
    context: {
        1: "Invalid state transition.",
        2: "Unsupported result.",
        3: "Unsupported prediction.",
    },
    game: {
        1: "Unsupported house edge.",
        2: "Unsupported payout factor.",
        3: "Unsupported stake.",
        4: "Unsupported prediction.",
        5: "Unsupported action.",
        6: "Package version is disabled. Try using a different version.",
        7: "The provided version is already allowed.",
        8: "The provided version is already disabled.",
    }
};

export interface CoinFlipContextModel {
    stake: number,
    prediction: string,
    result: string,
    status: string,
    win: number;
}

export interface CoinFlipStateModel {
    number_of_house_bias: number;
    number_of_heads: number;
    number_of_tails: number;
    recent_throws: string[];
}

export interface GameModel {
    id: Uid;
    allowed_versions: MoveObject<VecSet<bigint>>;
    min_stake: bigint,
    max_stake: bigint,
    house_edge_bps: bigint, // House bias in basis points (e.g. `100` will give the house a 1% change of winning)
    payout_factor_bps: bigint, // Payout factor in basis points (e.g. `20_000` will give 2x or 200% of stake)
    contexts: MoveObject<Table>,
    state: MoveObject<CoinFlipStateModel>, // Global state specific to the CoinFLip game
}

export interface InteractionTypeModel {
    PLACE_BET: {
        stake: bigint;
        prediction: string;
    }
}

export interface InteractionModel {
    balance_manager_id: string;
    interact_type: InteractionTypeModel;
}

export interface InteractedWithGameModel {
    old_balance: bigint;
    new_balance: bigint;
    context: CoinFlipContextModel;
    balance_manager_id: string;
}