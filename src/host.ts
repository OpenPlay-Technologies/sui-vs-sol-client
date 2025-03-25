import { getEnvKeypair } from "./utils/keypair";
import {
  INIT_REQUEST,
  INIT_RESPONSE,
  isMessage,
  Message,
  TX_SIGN_AND_EXECUTE_REQUEST,
  TX_SIGN_AND_EXECUTE_RESPONSE,
} from "./openplay-connect/messages";
import { Transaction } from "@mysten/sui/transactions";
import { getSuiClient } from "./sui/sui-client";

// Generate or retrieve the keypair
const keypair = getEnvKeypair();
console.log("Loaded Keypair:", keypair.toSuiAddress());

const client = getSuiClient();

// Get the iframe element
const iframe = document.getElementById("gameIframe") as HTMLIFrameElement;

// Listen for messages on the parent window
window.addEventListener("message", (event: MessageEvent) => {
  // Validate the message format
  if (!isMessage(event.data)) return;
  const data = event.data;

  // Use event.source to reply, if needed
  const sourceWindow = event.source as Window;

  switch (data.type) {
    case TX_SIGN_AND_EXECUTE_REQUEST:
      handleSignRequest(sourceWindow, data);
      break;
    case TX_SIGN_AND_EXECUTE_RESPONSE:
      // Handle TX_SIGN_AND_EXECUTE_RESPONSE if needed
      break;
    case INIT_RESPONSE:
      if (data.isSuccessful) {
        console.log("Init successful");
      } else {
        console.error("Init failed:", data.errorMsg);
      }
      break;
    default:
      // Unknown message type; no action.
      break;
  }
});

// When the iframe loads, send an INIT_REQUEST message to it
iframe.onload = () => {
  const targetWindow = iframe.contentWindow;
  if (!targetWindow) {
    console.error("iframe contentWindow is not available.");
    return;
  }

  const initData = {
    type: INIT_REQUEST,
    balanceManagerId: import.meta.env.VITE_BALANCE_MANAGER_ID as string,
    houseId: import.meta.env.VITE_HOUSE_ID as string,
    playCapId: import.meta.env.VITE_PLAY_CAP_ID as string,
  };

  console.log("Sending init data:", initData);
  targetWindow.postMessage(initData, '*');
};

async function handleSignRequest(targetWindow: Window, data: Message) {
  if (data.type !== TX_SIGN_AND_EXECUTE_REQUEST) return;

  const tx = Transaction.from(data.txJson);
  tx.setSender(keypair.toSuiAddress());

  try {
    if (!verifyTxData(tx)) {
      const postMessage: Message = {
        type: TX_SIGN_AND_EXECUTE_RESPONSE,
        requestId: data.request_id,
        isSuccessful: false,
        errorMsg: "Invalid transaction data",
      };
      targetWindow.postMessage(postMessage, '*');
      return;
    }

    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showRawEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    });

    console.log("Transaction Result:", result);

    const postMessage: Message = {
      type: TX_SIGN_AND_EXECUTE_RESPONSE,
      requestId: data.request_id,
      result: result,
      isSuccessful: true,
    };
    targetWindow.postMessage(postMessage, '*');
  } catch (error) {
    const postMessage: Message = {
      type: TX_SIGN_AND_EXECUTE_RESPONSE,
      requestId: data.request_id,
      isSuccessful: false,
      errorMsg:
        error instanceof Error
          ? error.message
          : "An unknown error occurred",
    };
    targetWindow.postMessage(postMessage, '*');
  }
}

function verifyTxData(_transaction: Transaction): boolean {
  return true;
}
