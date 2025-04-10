import { ERROR_EVENT, INIT_DATA_READY_EVENT, INTERACTED_EVENT } from "../constants";
import { InteractedWithGameModel } from "../sui/models/openplay-coin-flip";

export type InternalEvent =
    |
    {
        type: typeof INIT_DATA_READY_EVENT;
    }
    |
    {
        type: typeof INTERACTED_EVENT;
        data: InteractedWithGameModel;
    }
    | {
        type: typeof ERROR_EVENT;
        errorMsg: string;
    };

export function isInternalEvent(value: InternalEvent) {
    if (typeof value !== "object" || value === null) return false;
    return (
        value.type === INIT_DATA_READY_EVENT ||
        value.type === INTERACTED_EVENT ||
        value.type === ERROR_EVENT
    );
}