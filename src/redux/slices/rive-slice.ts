// slices/riveSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Rive } from '@rive-app/webgl';

export interface RiveState {
  riveInstance: Rive | null;
}

const initialState: RiveState = {
  riveInstance: null,
};

export const riveSlice = createSlice({
  name: 'rive',
  initialState,
  reducers: {
    setRiveInstance(state, action: PayloadAction<Rive | null>) {
      state.riveInstance = action.payload;
    },
  },
});

export const { setRiveInstance } = riveSlice.actions;
export default riveSlice.reducer;

export const getRiveInstanceOrThrow = (state: { rive: RiveState }) => {
  const { riveInstance } = state.rive;
  if (!riveInstance) {
    throw new Error('Rive instance is not initialized');
  }
  return riveInstance;
}