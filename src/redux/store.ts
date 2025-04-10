// store.ts
import { configureStore } from "@reduxjs/toolkit";
import BackendService, { IBackendService } from "../components/backend-service";
import MockBackendService from "../components/mock-backend-service";
import riveReducer from "./slices/rive-slice";
import openPlayConnectReducer from "./slices/openplay-connect-slice";
import gameReducer from "./slices/game-slice";

// Initialize the backend service conditionally.
export const backendService = import.meta.env.VITE_DUMMY_BACKEND === 'true'
    ? (() => {
        console.log("Using dummy backend");
        return new MockBackendService();
    })()
    : (() => {
        console.log("Using real backend");
        return new BackendService();
    })();

export const store = configureStore({
    reducer: {
        rive: riveReducer,
        openPlayConnect: openPlayConnectReducer,
        game: gameReducer,
    },
    middleware: (getDefaultMiddleware) =>
        // Pass the backendService as the extra argument for thunk middleware.
        getDefaultMiddleware({
            serializableCheck: false,
            thunk: {
                extraArgument: backendService
            },
        },)
});

export type ExtraArgument = {
    backendService: IBackendService
}

// Get the type of our store variable
export type AppStore = typeof store
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = AppStore['dispatch']