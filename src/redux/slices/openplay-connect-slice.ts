// slices/openPlayConnectSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OpenPlayConnectState {
    initialized: boolean;
    balanceManagerId: string;
    houseId: string;
    playCapId: string;
    referralId?: string;
}

const initialState: OpenPlayConnectState = {
    initialized: false,
    balanceManagerId: '',
    houseId: '',
    playCapId: '',
    referralId: undefined,
};

export const openPlayConnectSlice = createSlice({
    name: 'openPlayConnect',
    initialState,
    reducers: {
        setOpenPlayData(_state, action: PayloadAction<OpenPlayConnectState>) {
            return action.payload;
        },
        updateOpenPlayData(state, action: PayloadAction<Partial<OpenPlayConnectState>>) {
            return { ...state, ...action.payload };
        },
    },
});

export const { setOpenPlayData, updateOpenPlayData } = openPlayConnectSlice.actions;
export default openPlayConnectSlice.reducer;
