// const initialPackageId = process.env.NEXT_PUBLIC_INITIAL_COIN_FLIP_PACKAGE_ID;
const currentPackageId = import .meta.env.VITE_COIN_FLIP_PACKAGE_ID;

export const CONTEXT_TYPE = currentPackageId + "::context" + "::CoinFlipContext";
export const INTERACT_EVENT_TYPE = currentPackageId + "::game" + "::InteractedWithGame";
export const INTERACT_FUNCTION_TARGET = currentPackageId + "::game" + "::interact";

export const HOUSE_BIAS = "HouseBias";
export const TAIL = "Tail";
export const HEAD = "Head";