// walletCreationWorker.ts
import { getErrorMessage } from "@utils/getErrorMessage";
import { ethers } from "ethers";

self.onmessage = async (event: MessageEvent) => {
  const { amount, walletPrefix, startIndex } = event.data;

  try {
    const accounts = [];

    for (let i = 0; i < amount; i++) {
      const wallet = ethers.Wallet.createRandom();
      accounts.push({
        name: `${walletPrefix} ${startIndex + i}`,
        privateKey: wallet.privateKey,
        address: wallet.address,
      });
    }

    self.postMessage(accounts);
  } catch (error) {
    const errMes = getErrorMessage(error);
    self.postMessage({ error: errMes });
  }
};
