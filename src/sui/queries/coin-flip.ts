import { CoinFlipContextModel, GameModel } from "../models/openplay-coin-flip";
import { DynamicObjectValue } from "../models/shared-models";
import { getSuiClient } from "../sui-client";


export const fetchGame = async (gameId: string): Promise<GameModel | undefined> => {
    const client = getSuiClient();
    const response = await client.getObject({
        id: gameId,
        options: {
            showContent: true
        }
    });
    if (response.data?.content?.dataType === "moveObject") {
        return response.data.content.fields as unknown as GameModel;
    }
    return undefined;
}

export const fetchContext = async (contextTableId: string, balanceManagerId: string): Promise<CoinFlipContextModel | undefined> => {
    const client = getSuiClient();
    
    const response = await client.getDynamicFieldObject({
        parentId: contextTableId,
        name: {
            type: "0x2::object::ID",
            value: balanceManagerId
        }
    });
    
    if (response.data?.content?.dataType == "moveObject"){
        const value = response.data.content.fields as unknown as DynamicObjectValue<CoinFlipContextModel>;
        return value.value.fields;
    }
    
    return undefined;
};