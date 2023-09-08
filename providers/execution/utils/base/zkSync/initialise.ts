import { providers } from "ethers";
import { Provider, Wallet } from "zksync-web3";

export async function initialiseZkProvider(provider: Provider | undefined, providerUrlL2: string) {
    if(provider) return provider;
    return new Provider(providerUrlL2);
}

export async function initialiseZkWallet(zkWallet: Wallet | undefined, privateKey: string, provL2: Provider, provL1: providers.JsonRpcProvider) {
    if(zkWallet) return zkWallet;
    return new Wallet(privateKey, provL2, provL1);
}