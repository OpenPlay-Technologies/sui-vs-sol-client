// thunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { IBackendService } from '../components/backend-service';
import { RootState } from './store';

// Define the payload for the thunk.
interface HandleInteractParams {
    stakeAmount: number;
    selection: string;
}

// This thunk now uses the 'game' prefix in its type and operates on the game slice.
export const handleInteractThunk = createAsyncThunk(
    'game/handleInteract',
    async (args: HandleInteractParams, thunkAPI) => {
        try {
            const backendService = thunkAPI.extra as IBackendService;
            const state = thunkAPI.getState() as RootState;
            // Call the backend service.
            const registryId = import.meta.env.VITE_REGISTRY_ID;
            const gameID = import.meta.env.VITE_GAME_ID;
            const balanceManagerId = state.openPlayConnect.balanceManagerId;
            const houseId = state.openPlayConnect.houseId;
            const playCapId = state.openPlayConnect.playCapId;

            const event = await backendService.handleInteract(
                registryId,
                gameID,
                balanceManagerId,
                houseId,
                playCapId,
                args.stakeAmount,
                args.selection
            );
            if (!event) {
                console.error('No event received from backend service');
                return thunkAPI.rejectWithValue('No event received from backend service');
            }
            return event;
        } catch (error) {
            console.error('Error while handling play interact:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            return thunkAPI.rejectWithValue(errorMsg);
        }
    }
);


export const fetchDataThunk = createAsyncThunk(
    'game/fetchData',
    async (_, thunkAPI) => {
        try {
            console.log(thunkAPI);
            const backendService = thunkAPI.extra as IBackendService;
            const state = thunkAPI.getState() as RootState;
            const balanceManagerId = state.openPlayConnect.balanceManagerId;
            const gameId = import.meta.env.VITE_GAME_ID;
            // Call the backend service to fetch game and balance manager data.
            const [gameData, balanceManagerData] = await Promise.all([
                backendService.fetchGame(gameId),
                backendService.fetchBalanceManager(balanceManagerId)
            ]);
            if (!gameData) {
                const msg = "Game was not found";
                console.error(msg);
                return thunkAPI.rejectWithValue(msg);
            }
            if (!balanceManagerData) {
                const msg = "Balance manager was not found";
                console.error(msg);
                return thunkAPI.rejectWithValue(msg);
            }
            return { gameData, balanceManagerData };
        } catch (error) {
            console.error('Error while fetching data:', error);
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const reloadGameThunk = createAsyncThunk(
    'game/reloadGame',
    async (_, thunkAPI) => {
        try {
            const backendService = thunkAPI.extra as IBackendService;

            const state = thunkAPI.getState() as RootState;
            const balanceManagerId = state.openPlayConnect.balanceManagerId;
            const balanceManagerData = await backendService.fetchBalanceManager(balanceManagerId);
            if (!balanceManagerData) {
                const msg = "Balance manager was not found";
                console.error(msg);
                return thunkAPI.rejectWithValue(msg);
            }
            return balanceManagerData;

        } catch (error) {
            console.error('Error while reloading game:', error);
            return thunkAPI.rejectWithValue(error);
        }
    }
);
