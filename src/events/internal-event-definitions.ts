import mitt from "mitt";

import { ERROR_EVENT, INIT_DATA_READY_EVENT, FLIP_TO_RESULT_REQUESTED_EVENT, OPENPLAY_CONNECT_INITIALIZED_EVENT } from "../constants";

export type InternalEvent =
    |
    {
        type: typeof INIT_DATA_READY_EVENT;
    }
    |
    {
        type: typeof FLIP_TO_RESULT_REQUESTED_EVENT;
    }
    | {
        type: typeof ERROR_EVENT;
        errorMsg: string;
    }
    |
    {
        type: typeof OPENPLAY_CONNECT_INITIALIZED_EVENT
    }

export type InternalEventMap = {
    [K in InternalEvent['type']]: Extract<InternalEvent, { type: K }>;
};

export type InternalEventType = InternalEvent['type'];

export const InternalEventEmitter = mitt<InternalEventMap>();