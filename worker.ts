
addEventListener("message", (event: MessageEvent) => {
  const { ethers } = require("ethers");
  // console.log("🐝 Worker: Message received from main script", event);
  const { startIndex, amount, walletPrefix, myAccounts } = event.data;
  const accounts = [];

  for (let i = 0; i < amount; i++) {
    const wallet = ethers.Wallet.createRandom();

    accounts.push({
      name: `${walletPrefix} ${startIndex + i}`,
      privateKey: wallet.privateKey,
      address: wallet.address,
    });
  }

  // const workerResult = "Result: " + result;
  // console.log("🐝 Worker: Posting message back to main script", accounts);
  postMessage([...accounts, ...myAccounts]);
});
