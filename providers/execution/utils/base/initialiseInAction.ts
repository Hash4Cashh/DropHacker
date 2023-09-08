import { StepState } from "@prisma/client";
import { getStepStateArgs, getStepStateLogs } from "../stepState/get";
import { Wallet, providers } from "ethers";
import { Web3 } from "web3";

// prettier-ignore
export async function initialiseArgs<T>(args: T | undefined, stepState: StepState): Promise<T> {
    if(args) return args;
    return await getStepStateArgs(stepState);
}

// prettier-ignore
export async function initialiseLogs<T>(logs: T | undefined, stepState: StepState): Promise<T> {
    if(logs) return logs;
    return await getStepStateLogs(stepState);
}

// prettier-ignore
export async function initialiseProvider(provider: providers.JsonRpcProvider | undefined, providerUrl: string): Promise<providers.JsonRpcProvider> {
    if (provider) return provider;
    // new Web3.providers.HttpProvider("");    
    // new providers.Web3Provider("http://");
    return new providers.JsonRpcProvider(providerUrl);
}
// prettier-ignore
export async function initialiseWallet(wallet: Wallet | undefined, provider: providers.JsonRpcProvider, privateKey: string): Promise<Wallet> {
    if (wallet) return wallet;
    return new Wallet(privateKey, provider);
}
