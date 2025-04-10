// slices/gameSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CoinFlipState } from '../../enums';
import { GameModel } from '../../sui/models/openplay-coin-flip';
import { BalanceManagerModel } from '../../sui/models/openplay-core';
import { fetchDataThunk, handleInteractThunk, reloadGameThunk } from '../thunks';

export interface InternalGameState {
    gameData: GameModel | null;
    balanceManagerData: BalanceManagerModel | null;
    state: CoinFlipState;
    balance: number;
    currentStakeIndex: number;
    winAmount: number;
    flipResult: string;
    errorMsg: string;
}

const initialState: InternalGameState = {
    gameData: null,
    balanceManagerData: null,
    state: CoinFlipState.INIT,
    balance: 0,
    currentStakeIndex: 0,
    winAmount: 0,
    flipResult: '',
    errorMsg: '',
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setGameData(_state, action: PayloadAction<InternalGameState>) {
            return action.payload;
        },
        updateGameData(state, action: PayloadAction<Partial<InternalGameState>>) {
            return { ...state, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            // === handleInteractThunk ===
            .addCase(handleInteractThunk.pending, (state) => {
                state.state = CoinFlipState.WAITING_FOR_RESPONSE;
            })
            .addCase(handleInteractThunk.fulfilled, (state, action) => {

                const event = action.payload;

                state.balance = Number(event.new_balance);
                state.winAmount = Number(event.context.win);
                state.state = CoinFlipState.FLIPPING_TO_RESULT;
                state.flipResult = event.context.result;
            })
            .addCase(handleInteractThunk.rejected, (state, action) => {
                const errorMsg =
                    (action.payload as string) || action.error.message || 'Unknown error';
                state.errorMsg = errorMsg;
                state.state = CoinFlipState.ERROR;
            })
            // === fetchDataThunk ===
            .addCase(fetchDataThunk.fulfilled, (state, action) => {
                const { gameData, balanceManagerData } = action.payload;
                state.gameData = gameData;
                state.balanceManagerData = balanceManagerData;
                state.state = CoinFlipState.IDLE;
                state.balance = Number(balanceManagerData.balance);
                state.winAmount = 0;
                state.flipResult = '';
                state.errorMsg = '';
                // We don't reset stake on purpose
            })
            .addCase(fetchDataThunk.rejected, (state, action) => {
                const errorMsg =
                    (action.payload as string) || action.error.message || 'Unknown error';
                state.errorMsg = errorMsg;
                state.state = CoinFlipState.ERROR;
            })
            // === reloadGameThunk ===
            .addCase(reloadGameThunk.fulfilled, (state, action) => {
                const balanceManagerData = action.payload;
                state.balanceManagerData = balanceManagerData;
                state.state = CoinFlipState.IDLE;
                state.balance = Number(balanceManagerData.balance);
                state.winAmount = 0;
                state.flipResult = '';
                state.errorMsg = '';
            })
            .addCase(reloadGameThunk.rejected, (state, action) => {
                const errorMsg =
                    (action.payload as string) || action.error.message || 'Unknown error';
                state.errorMsg = errorMsg;
            });
    },
});

export const { setGameData, updateGameData } = gameSlice.actions;
export default gameSlice.reducer;
